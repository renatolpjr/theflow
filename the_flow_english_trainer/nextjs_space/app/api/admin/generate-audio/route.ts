
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateAudio } from '@/lib/tts-service';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, voice, speed } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Generate audio using the configured TTS service
    try {
      const audioS3Key = await generateAudio({
        text,
        voice: voice || undefined,
        speed: speed ? parseFloat(speed) : 1.0,
        languageCode: 'en-US'
      });

      return NextResponse.json({
        success: true,
        audioUrl: audioS3Key,
        message: 'Áudio gerado com sucesso!'
      });

    } catch (ttsError: any) {
      console.error('TTS Error:', ttsError);
      
      // Check if it's a configuration error
      if (ttsError.message.includes('Nenhum serviço de TTS configurado')) {
        return NextResponse.json({ 
          error: 'Nenhum serviço de Text-to-Speech (TTS) está configurado. Por favor, vá em Configurações de API e configure um serviço como Google Cloud TTS, ElevenLabs ou OpenAI TTS.',
          needsConfiguration: true
        }, { status: 400 });
      }

      return NextResponse.json({ 
        error: `Erro ao gerar áudio: ${ttsError.message}`,
        details: ttsError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error generating audio:', error);
    return NextResponse.json({ 
      error: 'Erro ao processar solicitação',
      details: error.message
    }, { status: 500 });
  }
}
