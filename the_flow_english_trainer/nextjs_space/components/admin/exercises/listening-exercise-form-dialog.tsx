'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Wand2, Upload, Volume2, Pause, Code, FileText, Users, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getDownloadUrl } from '@/lib/s3';
import { getGoogleVoiceConfig, validateSSML } from '@/lib/tts-service';

interface ListeningExerciseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise?: any;
  onSuccess: () => void;
}

export function ListeningExerciseFormDialog({ open, onOpenChange, exercise, onSuccess }: ListeningExerciseFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [ssmlMode, setSsmlMode] = useState(false);
  const [ssmlValidation, setSsmlValidation] = useState<{ valid: boolean; error?: string }>({ valid: true });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    category: 'conversation',
    audioUrl: '',
    audioText: '',
    duration: 0,
    voice: 'en-US-Neural2-J',
    speed: 1.0,
    questions: [] as any[],
    isActive: true,
    requiredLevel: 1,
    order: 0,
    tags: [] as string[]
  });

  useEffect(() => {
    if (exercise) {
      setFormData({
        title: exercise.title || '',
        description: exercise.description || '',
        difficulty: exercise.difficulty || 'Beginner',
        category: exercise.category || 'conversation',
        audioUrl: exercise.audioUrl || '',
        audioText: exercise.audioText || '',
        duration: exercise.duration || 0,
        voice: exercise.voice || 'en-US-Neural2-J',
        speed: exercise.speed || 1.0,
        questions: Array.isArray(exercise.questions) ? exercise.questions : [],
        isActive: exercise.isActive !== undefined ? exercise.isActive : true,
        requiredLevel: exercise.requiredLevel || 1,
        order: exercise.order || 0,
        tags: exercise.tags || []
      });
      if (exercise.audioUrl) {
        loadAudioUrl(exercise.audioUrl);
      }
    } else {
      setFormData({
        title: '',
        description: '',
        difficulty: 'Beginner',
        category: 'conversation',
        audioUrl: '',
        audioText: '',
        duration: 0,
        voice: 'en-US-Neural2-J',
        speed: 1.0,
        questions: [],
        isActive: true,
        requiredLevel: 1,
        order: 0,
        tags: []
      });
      setAudioUrl('');
    }
  }, [exercise, open]);

  const loadAudioUrl = async (cloud_storage_path: string) => {
    try {
      const url = await getDownloadUrl(cloud_storage_path);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error loading audio URL:', error);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Por favor, selecione um arquivo de áudio');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/admin/upload-audio', {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          audioUrl: data.cloud_storage_path
        }));
        await loadAudioUrl(data.cloud_storage_path);
        toast.success('Áudio enviado com sucesso');
      } else {
        toast.error('Erro ao enviar áudio');
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Erro ao enviar áudio');
    } finally {
      setUploading(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  // Validate SSML when text changes
  useEffect(() => {
    if (ssmlMode && formData.audioText) {
      const validation = validateSSML(formData.audioText);
      setSsmlValidation(validation);
    } else {
      setSsmlValidation({ valid: true });
    }
  }, [formData.audioText, ssmlMode]);

  // Insert voice tag at cursor position
  const insertVoiceTag = (voiceName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.audioText;
    const selectedText = text.substring(start, end) || 'Text here';
    
    const newText = 
      text.substring(0, start) +
      `<voice name="${voiceName}">${selectedText}</voice>` +
      text.substring(end);
    
    setFormData(prev => ({ ...prev, audioText: newText }));
    
    // Set cursor position after insertion
    setTimeout(() => {
      const newPosition = start + `<voice name="${voiceName}">`.length;
      textarea.focus();
      textarea.setSelectionRange(newPosition, newPosition + selectedText.length);
    }, 0);
  };

  // Load SSML template for dialogue
  const loadSSMLTemplate = () => {
    const template = `<speak>
  <voice name="en-US-Neural2-J">
    Hi! How can I help you today?
  </voice>
  <voice name="en-US-Neural2-C">
    I'd like to order a coffee, please.
  </voice>
  <voice name="en-US-Neural2-J">
    Of course! What size would you like?
  </voice>
  <voice name="en-US-Neural2-C">
    A large cappuccino, please.
  </voice>
</speak>`;
    
    setFormData(prev => ({ ...prev, audioText: template }));
    setSsmlMode(true);
    toast.success('Template de diálogo carregado!');
  };

  // Preview audio without saving
  const handlePreviewAudio = async () => {
    if (!formData.audioText) {
      toast.error('Digite o texto do áudio primeiro');
      return;
    }

    // Validate SSML if in SSML mode
    if (ssmlMode) {
      const validation = validateSSML(formData.audioText);
      if (!validation.valid) {
        toast.error(`Erro de SSML: ${validation.error}`);
        return;
      }
    }

    setPreviewing(true);
    try {
      const response = await fetch('/api/admin/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: formData.audioText, 
          voice: ssmlMode ? undefined : formData.voice,
          speed: formData.speed
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Load preview URL
        const url = await getDownloadUrl(data.audioUrl);
        setPreviewUrl(url);
        toast.success('Pré-visualização gerada! Clique em Play para ouvir.');
      } else {
        if (data.needsConfiguration) {
          toast.error(data.error, {
            duration: 6000,
            action: {
              label: 'Configurar',
              onClick: () => window.open('/admin/settings', '_blank')
            }
          });
        } else {
          toast.error(data.error || 'Erro ao gerar áudio');
        }
      }
    } catch (error) {
      console.error('Error previewing audio:', error);
      toast.error('Erro ao gerar pré-visualização');
    } finally {
      setPreviewing(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!formData.audioText) {
      toast.error('Digite o texto do áudio primeiro');
      return;
    }

    // Validate SSML if in SSML mode
    if (ssmlMode) {
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
          voice: ssmlMode ? undefined : formData.voice,
          speed: formData.speed
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update form with the generated audio URL
        setFormData({ ...formData, audioUrl: data.audioUrl });
        await loadAudioUrl(data.audioUrl);
        toast.success('Áudio gerado e salvo com sucesso!');
      } else {
        if (data.needsConfiguration) {
          toast.error(data.error, {
            duration: 6000,
            action: {
              label: 'Configurar',
              onClick: () => window.open('/admin/settings', '_blank')
            }
          });
        } else {
          toast.error(data.error || 'Erro ao gerar áudio');
        }
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Erro ao gerar áudio');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.difficulty || !formData.audioText) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const url = exercise ? `/api/admin/listening-exercises/${exercise.id}` : '/api/admin/listening-exercises';
      const method = exercise ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(exercise ? 'Exercício atualizado com sucesso' : 'Exercício criado com sucesso');
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar exercício');
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast.error('Erro ao salvar exercício');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: ''
      }]
    }));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            {exercise ? 'Editar Exercício de Listening' : 'Novo Exercício de Listening'}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Configure o áudio, texto e perguntas de compreensão
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-slate-700">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nome do exercício"
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-slate-700">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="conversation" className="text-slate-900">Conversa</SelectItem>
                  <SelectItem value="news" className="text-slate-900">Notícias</SelectItem>
                  <SelectItem value="story" className="text-slate-900">História</SelectItem>
                  <SelectItem value="podcast" className="text-slate-900">Podcast</SelectItem>
                  <SelectItem value="interview" className="text-slate-900">Entrevista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty" className="text-slate-700">Dificuldade *</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="Beginner" className="text-slate-900">Beginner</SelectItem>
                  <SelectItem value="Intermediate" className="text-slate-900">Intermediate</SelectItem>
                  <SelectItem value="Advanced" className="text-slate-900">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="voice" className="text-slate-700">Voz</Label>
              <Select value={formData.voice} onValueChange={(value) => setFormData(prev => ({ ...prev, voice: value }))}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  {/* Recommended Voices */}
                  <SelectItem value="en-US-Neural2-J" className="text-slate-900 font-semibold">⭐ Male (US) - Neural J [Recomendado]</SelectItem>
                  <SelectItem value="en-GB-Neural2-C" className="text-slate-900 font-semibold">⭐ Female (UK) - Neural C [Recomendado]</SelectItem>
                  <SelectItem value="en-US-Neural2-D" className="text-slate-900 font-semibold">⭐ Male (US) - Neural D [Recomendado]</SelectItem>
                  {/* Additional Voices */}
                  <SelectItem value="en-US-Neural2-A" className="text-slate-900">Male (US) - Neural A</SelectItem>
                  <SelectItem value="en-US-Neural2-C" className="text-slate-900">Female (US) - Neural C</SelectItem>
                  <SelectItem value="en-US-Neural2-E" className="text-slate-900">Female (US) - Neural E</SelectItem>
                  <SelectItem value="en-US-Neural2-F" className="text-slate-900">Female (US) - Neural F</SelectItem>
                  <SelectItem value="en-US-Neural2-G" className="text-slate-900">Female (US) - Neural G</SelectItem>
                  <SelectItem value="en-US-Neural2-H" className="text-slate-900">Female (US) - Neural H</SelectItem>
                  <SelectItem value="en-US-Neural2-I" className="text-slate-900">Male (US) - Neural I</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="speed" className="text-slate-700">Velocidade</Label>
              <Select value={formData.speed.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, speed: parseFloat(value) }))}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value="0.5" className="text-slate-900">0.5x (Lento)</SelectItem>
                  <SelectItem value="0.75" className="text-slate-900">0.75x</SelectItem>
                  <SelectItem value="1.0" className="text-slate-900">1.0x (Normal)</SelectItem>
                  <SelectItem value="1.25" className="text-slate-900">1.25x</SelectItem>
                  <SelectItem value="1.5" className="text-slate-900">1.5x (Rápido)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-700">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do exercício"
              className="bg-white border-slate-300 text-slate-900"
              rows={2}
            />
          </div>

          {/* Audio Section with SSML Support */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700 font-semibold">Áudio do Exercício</Label>
                <Badge variant={ssmlMode ? "default" : "secondary"} className="cursor-pointer" onClick={() => setSsmlMode(!ssmlMode)}>
                  {ssmlMode ? <><Code className="w-3 h-3 mr-1" /> SSML Ativo</> : <><FileText className="w-3 h-3 mr-1" /> Texto Simples</>}
                </Badge>
              </div>

              <Tabs value={ssmlMode ? "ssml" : "simple"} onValueChange={(v) => setSsmlMode(v === "ssml")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="simple">
                    <FileText className="w-4 h-4 mr-2" />
                    Texto Simples
                  </TabsTrigger>
                  <TabsTrigger value="ssml">
                    <Users className="w-4 h-4 mr-2" />
                    Diálogo Multi-Voz (SSML)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="simple" className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="audioText" className="text-slate-700">Texto do Áudio *</Label>
                    <Textarea
                      id="audioText"
                      ref={textareaRef}
                      value={formData.audioText}
                      onChange={(e) => setFormData(prev => ({ ...prev, audioText: e.target.value }))}
                      placeholder="Digite o texto que será falado no áudio..."
                      className="bg-white border-slate-300 text-slate-900 font-mono"
                      rows={6}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ssml" className="space-y-3 mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-1">Editor de Diálogos com Múltiplas Vozes</p>
                        <p className="text-blue-700">Use a tag <code className="bg-blue-100 px-1 rounded">&lt;voice name="nome-da-voz"&gt;</code> para alternar entre diferentes personagens. Selecione uma voz abaixo para inserir automaticamente.</p>
                      </div>
                    </div>
                  </div>

                  {/* Voice Selector */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {getGoogleVoiceConfig().map((voice) => (
                      <Button
                        key={voice.id}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => insertVoiceTag(voice.id)}
                        className="justify-start text-xs"
                      >
                        <Users className="w-3 h-3 mr-2" />
                        {voice.name}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={loadSSMLTemplate}
                      className="text-xs"
                    >
                      <Code className="w-3 h-3 mr-2" />
                      Carregar Template de Diálogo
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="ssmlText" className="text-slate-700">Texto SSML *</Label>
                    <Textarea
                      id="ssmlText"
                      ref={textareaRef}
                      value={formData.audioText}
                      onChange={(e) => setFormData(prev => ({ ...prev, audioText: e.target.value }))}
                      placeholder='<speak>\n  <voice name="en-US-Neural2-J">\n    Hi! How can I help you?\n  </voice>\n  <voice name="en-US-Neural2-C">\n    I would like a coffee.\n  </voice>\n</speak>'
                      className={`bg-white text-slate-900 font-mono text-sm ${
                        !ssmlValidation.valid ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
                      }`}
                      rows={10}
                    />
                    {!ssmlValidation.valid && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        {ssmlValidation.error}
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handlePreviewAudio}
                  disabled={previewing || !formData.audioText}
                  size="sm"
                  variant="outline"
                  className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                >
                  {previewing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Preview...
                    </>
                  ) : (
                    <>
                      <Volume2 className="mr-2 h-4 w-4" />
                      Pré-visualizar Áudio
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleGenerateAudio}
                  disabled={generating || !formData.audioText}
                  size="sm"
                  variant="outline"
                  className="flex-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-300"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Gerar e Salvar Áudio
                    </>
                  )}
                </Button>

                <div className="flex-1">
                  <input
                    type="file"
                    id="audioUpload"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('audioUpload')?.click()}
                    disabled={uploading}
                    size="sm"
                    variant="outline"
                    className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Enviar Áudio
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Preview Audio Player */}
              {previewUrl && (
                <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="bg-blue-600">
                      <Volume2 className="w-3 h-3 mr-1" />
                      Preview
                    </Badge>
                    <audio
                      controls
                      src={previewUrl}
                      className="flex-1 h-10"
                    />
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    ℹ️ Este é o áudio de pré-visualização. Use "Gerar e Salvar Áudio" para salvar permanentemente.
                  </p>
                </div>
              )}

              {/* Saved Audio Player */}
              {audioUrl && (
                <div className="bg-green-50 border-2 border-green-300 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="bg-green-600">
                      <Volume2 className="w-3 h-3 mr-1" />
                      Áudio Salvo
                    </Badge>
                    <audio
                      controls
                      src={audioUrl}
                      className="flex-1 h-10"
                    />
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    ✅ Este áudio está salvo e será usado no exercício.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-slate-700 font-semibold">Perguntas de Compreensão ({formData.questions.length})</Label>
              <Button onClick={addQuestion} size="sm" className="bg-flow-blue hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Pergunta
              </Button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {formData.questions.map((question, index) => (
                <Card key={index} className="bg-white border-slate-200">
                  <CardContent className="pt-4 space-y-2">
                    <Input
                      value={question.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      placeholder="Pergunta"
                      className="bg-white border-slate-300 text-slate-900"
                    />
                    <Select 
                      value={question.type} 
                      onValueChange={(value) => updateQuestion(index, 'type', value)}
                    >
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-300">
                        <SelectItem value="multiple_choice" className="text-slate-900">Múltipla Escolha</SelectItem>
                        <SelectItem value="true_false" className="text-slate-900">Verdadeiro/Falso</SelectItem>
                      </SelectContent>
                    </Select>
                    {question.type === 'multiple_choice' && (
                      <div className="space-y-1">
                        {question.options.map((option: string, optIndex: number) => (
                          <Input
                            key={optIndex}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[optIndex] = e.target.value;
                              updateQuestion(index, 'options', newOptions);
                            }}
                            placeholder={`Opção ${optIndex + 1}`}
                            className="bg-white border-slate-300 text-slate-900"
                          />
                        ))}
                      </div>
                    )}
                    <Input
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                      placeholder="Resposta correta"
                      className="bg-white border-slate-300 text-slate-900"
                    />
                    <Button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      size="sm"
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover Pergunta
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline" disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-flow-blue hover:bg-blue-700">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              exercise ? 'Atualizar Exercício' : 'Criar Exercício'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
