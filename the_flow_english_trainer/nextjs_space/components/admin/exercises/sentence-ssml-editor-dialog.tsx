
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Volume2, 
  Play, 
  Loader2, 
  AlertCircle,
  FileText,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { GOOGLE_VOICES, isSSML, validateSSML } from '@/lib/tts-service';
import { getDownloadUrl } from '@/lib/s3';

interface SentenceSSMLEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentence: {
    sentence: string;
    translation: string;
    difficulty?: string;
    audioUrl?: string;
    audioText?: string;
    voice?: string;
    speed?: number;
  };
  onSave: (updatedSentence: any) => void;
}

export function SentenceSSMLEditorDialog({ 
  open, 
  onOpenChange, 
  sentence, 
  onSave 
}: SentenceSSMLEditorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isMultiVoice, setIsMultiVoice] = useState(false);
  
  const [formData, setFormData] = useState({
    sentence: '',
    translation: '',
    difficulty: 'Beginner',
    audioText: '',
    voice: 'en-US-Journey-D',
    speed: 1.0,
    audioUrl: ''
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (sentence) {
      const hasSSML = !!(sentence.audioText && isSSML(sentence.audioText));
      setIsMultiVoice(hasSSML);
      
      setFormData({
        sentence: sentence.sentence || '',
        translation: sentence.translation || '',
        difficulty: sentence.difficulty || 'Beginner',
        audioText: sentence.audioText || sentence.sentence || '',
        voice: sentence.voice || 'en-US-Journey-D',
        speed: sentence.speed || 1.0,
        audioUrl: sentence.audioUrl || ''
      });
    }
  }, [sentence, open]);

  // Validate SSML in real-time
  useEffect(() => {
    if (isMultiVoice && formData.audioText) {
      const validation = validateSSML(formData.audioText);
      setValidationError(validation.valid ? '' : (validation.error || ''));
    } else {
      setValidationError('');
    }
  }, [formData.audioText, isMultiVoice]);

  const insertVoiceTag = (voiceName: string) => {
    const voice = GOOGLE_VOICES.find(v => v.name === voiceName);
    if (!voice) return;

    const tag = `<voice name="${voice.name}">\nTexto do ${voice.role}\n</voice>\n\n`;
    setFormData(prev => ({
      ...prev,
      audioText: prev.audioText + tag
    }));
  };

  const loadDialogueTemplate = () => {
    const template = `<speak>
<voice name="en-US-Journey-D">
Hello! How are you today?
</voice>

<voice name="en-US-Journey-F">
I'm doing great, thanks for asking! How about you?
</voice>

<voice name="en-US-Journey-D">
I'm good too. What are your plans for the weekend?
</voice>

<voice name="en-US-Journey-F">
I'm thinking about going to the park. Would you like to join me?
</voice>
</speak>`;

    setFormData(prev => ({
      ...prev,
      audioText: template
    }));
  };

  const handleGeneratePreview = async () => {
    if (!formData.audioText.trim()) {
      toast.error('Insira o texto para gerar o áudio');
      return;
    }

    if (isMultiVoice) {
      const validation = validateSSML(formData.audioText);
      if (!validation.valid) {
        toast.error(`Erro de SSML: ${validation.error}`);
        return;
      }
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/admin/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formData.audioText,
          voice: isMultiVoice ? undefined : formData.voice,
          speed: formData.speed,
          preview: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Convert S3 key to signed URL
        const signedUrl = await getDownloadUrl(data.audioUrl);
        setPreviewUrl(signedUrl);
        toast.success('Preview gerado com sucesso! Ouça o áudio antes de salvar.');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao gerar preview');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Erro ao gerar preview');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.sentence.trim()) {
      toast.error('Insira a sentença em inglês');
      return;
    }

    if (!formData.audioText.trim()) {
      toast.error('Insira o texto para o áudio');
      return;
    }

    if (isMultiVoice) {
      const validation = validateSSML(formData.audioText);
      if (!validation.valid) {
        toast.error(`Erro de SSML: ${validation.error}`);
        return;
      }
    }

    setLoading(true);
    try {
      // Generate final audio
      const response = await fetch('/api/admin/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formData.audioText,
          voice: isMultiVoice ? undefined : formData.voice,
          speed: formData.speed,
          preview: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Save sentence with audio
        const updatedSentence = {
          ...formData,
          audioUrl: data.audioUrl
        };
        
        onSave(updatedSentence);
        toast.success('Sentença atualizada com sucesso!');
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao gerar áudio');
      }
    } catch (error) {
      console.error('Error saving sentence:', error);
      toast.error('Erro ao salvar sentença');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsMultiVoice(!isMultiVoice);
    if (!isMultiVoice) {
      // Switching to multi-voice - wrap existing text in <speak> tags if not already wrapped
      setFormData(prev => {
        const currentText = prev.audioText || prev.sentence;
        const hasSpeak = currentText.trim().startsWith('<speak>');
        const formattedText = hasSpeak 
          ? currentText 
          : `<speak>\n${currentText}\n</speak>`;
        
        return {
          ...prev,
          audioText: formattedText
        };
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900 flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-blue-600" />
            Editor Avançado de Áudio - SSML
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Configure o áudio da sentença com vozes únicas ou diálogos multi-voz
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700">Sentença em Inglês *</Label>
              <Textarea
                value={formData.sentence}
                onChange={(e) => setFormData(prev => ({ ...prev, sentence: e.target.value }))}
                placeholder="Digite a sentença em inglês"
                className="bg-white border-slate-300 text-slate-900"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-slate-700">Tradução</Label>
              <Textarea
                value={formData.translation}
                onChange={(e) => setFormData(prev => ({ ...prev, translation: e.target.value }))}
                placeholder="Digite a tradução em português"
                className="bg-white border-slate-300 text-slate-900"
                rows={2}
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-700">Dificuldade</Label>
            <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
              <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mode Toggle */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMultiVoice ? (
                    <Users className="h-5 w-5 text-blue-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-blue-600" />
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {isMultiVoice ? 'Modo Diálogo Multi-Voz (SSML)' : 'Modo Texto Simples'}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {isMultiVoice 
                        ? 'Use tags <voice> para criar diálogos com múltiplas vozes' 
                        : 'Uma única voz narra todo o texto'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={toggleMode} 
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Alternar Modo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Simple Mode - Single Voice */}
          {!isMultiVoice && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-700">Voz</Label>
                <Select value={formData.voice} onValueChange={(value) => setFormData(prev => ({ ...prev, voice: value }))}>
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60">
                    {GOOGLE_VOICES.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.role} ({voice.accent})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-700">Velocidade: {formData.speed}x</Label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={formData.speed}
                  onChange={(e) => setFormData(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Audio Text Editor */}
          <div>
            <Label className="text-slate-700">
              {isMultiVoice ? 'Texto SSML com Múltiplas Vozes *' : 'Texto para o Áudio *'}
            </Label>
            <Textarea
              value={formData.audioText}
              onChange={(e) => setFormData(prev => ({ ...prev, audioText: e.target.value }))}
              placeholder={isMultiVoice 
                ? 'Use tags <voice name="..."> para definir diferentes personagens' 
                : 'Digite o texto que será narrado'}
              className="bg-white border-slate-300 text-slate-900 font-mono"
              rows={10}
            />
            
            {validationError && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Multi-Voice Tools */}
          {isMultiVoice && (
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">Inserir Vozes Disponíveis</h4>
                  <Button 
                    onClick={loadDialogueTemplate} 
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    Carregar Exemplo de Diálogo
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {GOOGLE_VOICES.map((voice) => (
                    <Button
                      key={voice.name}
                      type="button"
                      onClick={() => insertVoiceTag(voice.name)}
                      size="sm"
                      variant="outline"
                      className="text-left justify-start text-xs border-blue-200 hover:bg-blue-50"
                    >
                      <Volume2 className="h-3 w-3 mr-1" />
                      {voice.role}
                    </Button>
                  ))}
                </div>

                <div className="text-xs text-slate-600 bg-white p-3 rounded border border-slate-200">
                  <strong>Exemplo de uso:</strong>
                  <pre className="mt-1 font-mono text-xs">{`<voice name="en-US-Journey-D">
Hello, how are you?
</voice>

<voice name="en-US-Journey-F">
I'm fine, thank you!
</voice>`}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio Preview */}
          {previewUrl && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-slate-900">Preview do Áudio</span>
                  </div>
                </div>
                <audio controls src={previewUrl} className="w-full mt-3">
                  Seu navegador não suporta áudio.
                </audio>
                <p className="text-xs text-slate-600 mt-2">
                  ✓ Ouça o preview antes de salvar. Você pode fazer ajustes e gerar novamente.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Existing Audio */}
          {formData.audioUrl && !previewUrl && (
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="h-5 w-5 text-slate-600" />
                  <span className="font-semibold text-slate-900">Áudio Atual</span>
                </div>
                <audio controls src={formData.audioUrl} className="w-full">
                  Seu navegador não suporta áudio.
                </audio>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading || generating}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleGeneratePreview}
            disabled={generating || loading || !formData.audioText.trim() || !!validationError}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Preview...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Gerar Preview
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || generating || !formData.sentence.trim() || !formData.audioText.trim() || !!validationError}
            className="bg-flow-blue hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Sentença'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
