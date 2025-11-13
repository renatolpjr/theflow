
import { prisma } from './db';
import { uploadFile } from './s3';

interface TTSOptions {
  text: string;
  voice?: string;
  speed?: number;
  languageCode?: string;
}

// Voice configuration map with gender information
// Expanded to include recommended voices for multi-voice dialogues
const GOOGLE_VOICE_CONFIG: Record<string, { languageCode: string; ssmlGender: string; description: string }> = {
  // US Voices - Recommended for dialogues
  'en-US-Neural2-J': { languageCode: 'en-US', ssmlGender: 'MALE', description: 'Customer/Student (Male)' },
  'en-US-Neural2-D': { languageCode: 'en-US', ssmlGender: 'MALE', description: 'Barista/Teacher (Male)' },
  'en-US-Neural2-A': { languageCode: 'en-US', ssmlGender: 'MALE', description: 'Professional (Male)' },
  'en-US-Neural2-I': { languageCode: 'en-US', ssmlGender: 'MALE', description: 'Casual (Male)' },
  
  // Female US Voices
  'en-US-Neural2-C': { languageCode: 'en-US', ssmlGender: 'FEMALE', description: 'Customer/Student (Female)' },
  'en-US-Neural2-E': { languageCode: 'en-US', ssmlGender: 'FEMALE', description: 'Professional (Female)' },
  'en-US-Neural2-F': { languageCode: 'en-US', ssmlGender: 'FEMALE', description: 'Friendly (Female)' },
  'en-US-Neural2-G': { languageCode: 'en-US', ssmlGender: 'FEMALE', description: 'Warm (Female)' },
  'en-US-Neural2-H': { languageCode: 'en-US', ssmlGender: 'FEMALE', description: 'Clear (Female)' },
  
  // UK Voices - For variety
  'en-GB-Neural2-C': { languageCode: 'en-GB', ssmlGender: 'FEMALE', description: 'British (Female)' },
  'en-GB-Neural2-B': { languageCode: 'en-GB', ssmlGender: 'MALE', description: 'British (Male)' },
  'en-GB-Neural2-D': { languageCode: 'en-GB', ssmlGender: 'MALE', description: 'British Professional (Male)' },
};

// Exported array of Google voices for UI components
export const GOOGLE_VOICES = [
  // US Male Voices
  { name: 'en-US-Journey-D', role: 'Customer/Student (Male)', gender: 'MALE', accent: 'US' },
  { name: 'en-US-Journey-F', role: 'Barista/Teacher (Female)', gender: 'FEMALE', accent: 'US' },
  { name: 'en-US-Journey-O', role: 'Professional (Male)', gender: 'MALE', accent: 'US' },
  { name: 'en-US-Neural2-J', role: 'Casual (Male)', gender: 'MALE', accent: 'US' },
  
  // US Female Voices
  { name: 'en-US-Neural2-C', role: 'Customer/Student (Female)', gender: 'FEMALE', accent: 'US' },
  { name: 'en-US-Neural2-E', role: 'Professional (Female)', gender: 'FEMALE', accent: 'US' },
  { name: 'en-US-Neural2-F', role: 'Friendly (Female)', gender: 'FEMALE', accent: 'US' },
  { name: 'en-US-Neural2-G', role: 'Warm (Female)', gender: 'FEMALE', accent: 'US' },
  
  // UK Voices
  { name: 'en-GB-Neural2-B', role: 'British (Male)', gender: 'MALE', accent: 'UK' },
  { name: 'en-GB-Neural2-C', role: 'British (Female)', gender: 'FEMALE', accent: 'UK' },
  { name: 'en-GB-Neural2-D', role: 'British Professional (Male)', gender: 'MALE', accent: 'UK' },
  { name: 'en-GB-News-G', role: 'British News (Female)', gender: 'FEMALE', accent: 'UK' },
];

// Helper function to detect if text is SSML
export function isSSML(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('<speak>') && trimmed.endsWith('</speak>');
}

// Helper function to wrap text in SSML speak tags if not already wrapped
function ensureSSMLWrapper(text: string): string {
  if (isSSML(text)) {
    return text;
  }
  return `<speak>${text}</speak>`;
}

// Google Cloud TTS Integration
async function generateWithGoogleTTS(apiKey: string, options: TTSOptions): Promise<string> {
  const { text, voice = 'en-US-Neural2-J', speed = 1.0 } = options;

  // Get voice configuration
  const voiceConfig = GOOGLE_VOICE_CONFIG[voice] || { 
    languageCode: 'en-US', 
    ssmlGender: 'MALE',
    description: 'Default Voice'
  };

  // Detect if text contains SSML
  const useSSML = isSSML(text);
  
  // Prepare input based on content type
  const input = useSSML 
    ? { ssml: text } 
    : { text: text };

  const requestBody = {
    input,
    voice: {
      languageCode: voiceConfig.languageCode,
      name: voice,
      ssmlGender: voiceConfig.ssmlGender
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: speed
    }
  };

  console.log('Google TTS Request:', JSON.stringify(requestBody, null, 2));
  console.log('Using SSML:', useSSML);

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Google TTS Error Response:', error);
    throw new Error(`Google TTS API error: ${error}`);
  }

  const data = await response.json();
  
  if (!data.audioContent) {
    throw new Error('No audio content received from Google TTS');
  }

  // Convert base64 audio to buffer and upload to S3
  const audioBuffer = Buffer.from(data.audioContent, 'base64');
  const fileName = `audio/${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
  const s3Key = await uploadFile(audioBuffer, fileName);

  console.log('Audio successfully generated and uploaded to S3:', s3Key);

  return s3Key;
}

// ElevenLabs TTS Integration
async function generateWithElevenLabs(apiKey: string, options: TTSOptions): Promise<string> {
  const { text, voice = 'EXAVITQu4vr4xnSDxMaL', speed = 1.0 } = options;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          speed: speed,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  // Convert audio response to buffer and upload to S3
  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const fileName = `audio/${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
  const s3Key = await uploadFile(audioBuffer, fileName);

  return s3Key;
}

// OpenAI TTS Integration
async function generateWithOpenAITTS(apiKey: string, options: TTSOptions): Promise<string> {
  const { text, voice = 'alloy', speed = 1.0 } = options;

  const response = await fetch(
    'https://api.openai.com/v1/audio/speech',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice,
        input: text,
        speed,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI TTS API error: ${error}`);
  }

  // Convert audio response to buffer and upload to S3
  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const fileName = `audio/${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
  const s3Key = await uploadFile(audioBuffer, fileName);

  return s3Key;
}

// Main TTS function that auto-selects the configured service
export async function generateAudio(options: TTSOptions): Promise<string> {
  // Fetch active TTS service from database
  const services = await prisma.apiSettings.findMany({
    where: {
      isActive: true,
      serviceName: {
        in: ['google_tts', 'elevenlabs', 'openai_tts'],
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  if (services.length === 0) {
    throw new Error(
      'Nenhum serviço de TTS configurado. Por favor, configure um serviço na página de Configurações de API.'
    );
  }

  // Use the most recently updated active service
  const service = services[0];

  try {
    switch (service.serviceName) {
      case 'google_tts':
        return await generateWithGoogleTTS(service.apiKey, options);
      
      case 'elevenlabs':
        return await generateWithElevenLabs(service.apiKey, options);
      
      case 'openai_tts':
        return await generateWithOpenAITTS(service.apiKey, options);
      
      default:
        throw new Error(`Serviço TTS não suportado: ${service.serviceName}`);
    }
  } catch (error: any) {
    console.error(`Error with ${service.serviceName}:`, error);
    throw new Error(`Erro ao gerar áudio com ${service.serviceName}: ${error.message}`);
  }
}

// Helper to get available voices for the configured service
export async function getAvailableVoices(): Promise<{ id: string; name: string; service: string }[]> {
  const services = await prisma.apiSettings.findMany({
    where: {
      isActive: true,
      serviceName: {
        in: ['google_tts', 'elevenlabs', 'openai_tts'],
      },
    },
  });

  if (services.length === 0) {
    return [];
  }

  const service = services[0];

  // Return default voices based on service
  switch (service.serviceName) {
    case 'google_tts':
      return [
        // Recommended voices for dialogues (top options)
        { id: 'en-US-Neural2-J', name: 'US Male - Customer/Student [Recomendado]', service: 'Google' },
        { id: 'en-US-Neural2-D', name: 'US Male - Barista/Teacher [Recomendado]', service: 'Google' },
        { id: 'en-US-Neural2-C', name: 'US Female - Customer/Student [Recomendado]', service: 'Google' },
        { id: 'en-GB-Neural2-C', name: 'UK Female - British Accent [Recomendado]', service: 'Google' },
        { id: 'en-GB-Neural2-B', name: 'UK Male - British Accent [Recomendado]', service: 'Google' },
        
        // Additional US voices
        { id: 'en-US-Neural2-A', name: 'US Male - Professional', service: 'Google' },
        { id: 'en-US-Neural2-I', name: 'US Male - Casual', service: 'Google' },
        { id: 'en-US-Neural2-E', name: 'US Female - Professional', service: 'Google' },
        { id: 'en-US-Neural2-F', name: 'US Female - Friendly', service: 'Google' },
        { id: 'en-US-Neural2-G', name: 'US Female - Warm', service: 'Google' },
        { id: 'en-US-Neural2-H', name: 'US Female - Clear', service: 'Google' },
        { id: 'en-GB-Neural2-D', name: 'UK Male - Professional', service: 'Google' },
      ];
    
    case 'openai_tts':
      return [
        { id: 'alloy', name: 'Alloy (Neutral)', service: 'OpenAI' },
        { id: 'echo', name: 'Echo (Male)', service: 'OpenAI' },
        { id: 'fable', name: 'Fable (Neutral)', service: 'OpenAI' },
        { id: 'onyx', name: 'Onyx (Male)', service: 'OpenAI' },
        { id: 'nova', name: 'Nova (Female)', service: 'OpenAI' },
        { id: 'shimmer', name: 'Shimmer (Female)', service: 'OpenAI' },
      ];
    
    case 'elevenlabs':
      return [
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Rachel (Female)', service: 'ElevenLabs' },
        { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Male)', service: 'ElevenLabs' },
        { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold (Male)', service: 'ElevenLabs' },
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Male)', service: 'ElevenLabs' },
        { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam (Male)', service: 'ElevenLabs' },
      ];
    
    default:
      return [];
  }
}

// Export voice configuration for SSML editor
export function getGoogleVoiceConfig() {
  return Object.entries(GOOGLE_VOICE_CONFIG).map(([id, config]) => ({
    id,
    name: config.description,
    languageCode: config.languageCode,
    gender: config.ssmlGender,
  }));
}

// Helper to validate SSML syntax
export function validateSSML(text: string): { valid: boolean; error?: string } {
  try {
    const trimmed = text.trim();
    
    // Check if it starts and ends with <speak> tags
    if (!trimmed.startsWith('<speak>')) {
      return { valid: false, error: 'SSML must start with <speak> tag' };
    }
    
    if (!trimmed.endsWith('</speak>')) {
      return { valid: false, error: 'SSML must end with </speak> tag' };
    }
    
    // Basic check for balanced <voice> tags
    const voiceOpenCount = (trimmed.match(/<voice/g) || []).length;
    const voiceCloseCount = (trimmed.match(/<\/voice>/g) || []).length;
    
    if (voiceOpenCount !== voiceCloseCount) {
      return { valid: false, error: 'Unbalanced <voice> tags' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid SSML syntax' };
  }
}
