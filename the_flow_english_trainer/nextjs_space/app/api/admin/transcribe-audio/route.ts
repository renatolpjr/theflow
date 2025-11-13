
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert audio file to base64
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const base64Audio = buffer.toString('base64');

    // Call Whisper API via Abacus.AI
    const whisperResponse = await fetch('https://api.abacus.ai/v0/deployments/whisper-v3/predict', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio: base64Audio,
        language: 'en'
      })
    });

    if (!whisperResponse.ok) {
      console.error('Whisper API error:', await whisperResponse.text());
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: 500 }
      );
    }

    const transcriptionData = await whisperResponse.json();
    const transcription = transcriptionData.text || transcriptionData.transcription || '';

    return NextResponse.json({
      success: true,
      transcription
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
