
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const exercise = await prisma.speakingExercise.findUnique({
      where: { id: params.id }
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    let transcription = formData.get('transcription') as string;
    const duration = parseInt(formData.get('duration') as string);
    const autoTranscribe = formData.get('autoTranscribe') === 'true';

    let audioUrl = '';
    if (audioFile) {
      // Upload audio to S3
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const fileName = `uploads/speaking/${Date.now()}-${user.id}-${audioFile.name}`;
      audioUrl = await uploadFile(buffer, fileName);

      // Auto-transcribe if requested and no manual transcription provided
      if (autoTranscribe && !transcription) {
        try {
          const transcribeFormData = new FormData();
          transcribeFormData.append('audio', audioFile);

          const transcribeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/transcribe-audio`, {
            method: 'POST',
            body: transcribeFormData
          });

          if (transcribeResponse.ok) {
            const transcribeData = await transcribeResponse.json();
            transcription = transcribeData.transcription || '';
          }
        } catch (error) {
          console.error('Auto-transcription failed:', error);
        }
      }
    }

    // Enhanced scoring logic with AI feedback
    const targetWords = (exercise.targetWords as string[]) || [];
    const transcriptionLower = transcription.toLowerCase();
    const wordsUsed = targetWords.filter(word => 
      transcriptionLower.includes(word.toLowerCase())
    );
    
    const targetWordScore = targetWords.length > 0 
      ? Math.round((wordsUsed.length / targetWords.length) * 100) 
      : 50;

    // Generate AI feedback
    let aiFeedback: any = {
      targetWordsUsed: wordsUsed.length,
      totalTargetWords: targetWords.length,
      durationMet: duration >= (exercise.minDuration || 0),
      suggestions: []
    };

    try {
      const feedbackPrompt = `You are an English language teacher evaluating a student's speaking exercise.

Exercise Prompt: ${exercise.prompt}
Context: ${exercise.context || 'None'}
Target Words Expected: ${targetWords.join(', ')}
Target Words Used: ${wordsUsed.join(', ')}
Student Transcription: ${transcription}
Speaking Duration: ${duration} seconds
Required Duration: ${exercise.minDuration || 30} - ${exercise.maxDuration || 120} seconds

Please evaluate the student's response and provide:
1. Grammar quality score (0-100)
2. Vocabulary quality score (0-100)
3. Fluency score based on natural expression (0-100)
4. Relevance score to the prompt (0-100)
5. 3-5 specific, actionable suggestions for improvement

Return your response as a JSON object with this structure:
{
  "grammarScore": <number>,
  "vocabularyScore": <number>,
  "fluencyScore": <number>,
  "relevanceScore": <number>,
  "overallScore": <number>,
  "suggestions": [<strings>],
  "strengths": [<strings>],
  "areasForImprovement": [<strings>]
}`;

      const llmResponse = await fetch('https://api.abacus.ai/api/v0/chatLLM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
        },
        body: JSON.stringify({
          messages: [
            {
              is_user: true,
              text: feedbackPrompt
            }
          ],
          llm_name: 'gpt-4.1-mini'
        })
      });

      if (llmResponse.ok) {
        const llmData = await llmResponse.json();
        const feedbackText = llmData.response || llmData.text || '';
        
        // Try to extract JSON from response
        try {
          const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedFeedback = JSON.parse(jsonMatch[0]);
            aiFeedback = {
              ...aiFeedback,
              ...parsedFeedback
            };
          }
        } catch (parseError) {
          console.error('Failed to parse AI feedback:', parseError);
        }
      }
    } catch (error) {
      console.error('Error generating AI feedback:', error);
    }

    // Calculate final score
    const grammarScore = aiFeedback.grammarScore || 70;
    const vocabularyScore = aiFeedback.vocabularyScore || 70;
    const fluencyScore = aiFeedback.fluencyScore || 70;
    const relevanceScore = aiFeedback.relevanceScore || 70;
    
    const finalScore = Math.round(
      (targetWordScore * 0.25) +
      (grammarScore * 0.25) +
      (vocabularyScore * 0.2) +
      (fluencyScore * 0.15) +
      (relevanceScore * 0.15)
    );

    const pointsEarned = Math.round(finalScore * 0.8);
    const completed = finalScore >= 60 && duration >= (exercise.minDuration || 0);

    // Prepare comprehensive feedback
    const feedback = {
      score: finalScore,
      targetWordsUsed: wordsUsed.length,
      totalTargetWords: targetWords.length,
      targetWordScore,
      grammarScore,
      vocabularyScore,
      fluencyScore,
      relevanceScore,
      durationMet: duration >= (exercise.minDuration || 0),
      suggestions: aiFeedback.suggestions || (finalScore < 60 ? ['Try to include more target words', 'Speak clearly and naturally'] : ['Great job!']),
      strengths: aiFeedback.strengths || [],
      areasForImprovement: aiFeedback.areasForImprovement || []
    };

    // Create attempt record
    const attempt = await prisma.speakingAttempt.create({
      data: {
        userId: user.id,
        exerciseId: exercise.id,
        transcription,
        audioUrl,
        duration,
        feedback,
        score: finalScore,
        pointsEarned: completed ? pointsEarned : 0,
        completed
      }
    });

    // Update user points if completed
    if (completed) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalPoints: { increment: pointsEarned },
          level: {
            increment: Math.floor(pointsEarned / 100)
          }
        }
      });
    }

    return NextResponse.json({
      attempt,
      score: finalScore,
      completed,
      pointsEarned,
      feedback,
      transcription
    });
  } catch (error) {
    console.error('Error submitting speaking attempt:', error);
    return NextResponse.json(
      { error: 'Failed to submit attempt' },
      { status: 500 }
    );
  }
}
