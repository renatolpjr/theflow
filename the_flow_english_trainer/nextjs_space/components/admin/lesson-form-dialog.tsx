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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Trash2, Wand2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { SentenceSSMLEditorDialog } from '@/components/admin/exercises/sentence-ssml-editor-dialog';

interface LessonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: any;
  onSuccess: () => void;
}

export function LessonFormDialog({ open, onOpenChange, lesson, onSuccess }: LessonFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [ssmlEditorOpen, setSsmlEditorOpen] = useState(false);
  const [editingSentenceIndex, setEditingSentenceIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    lessonId: '',
    title: '',
    difficulty: 'Beginner',
    topics: [] as string[],
    vocabulary: [] as any[],
    phrases: [] as any[],
    sentences: [] as any[],
    dialogues: [] as any[],
    exercises: [] as any[],
    speakingPrompts: [] as string[],
    isUnlocked: true,
    requiredLevel: 1
  });

  // New topic input
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    if (lesson) {
      setFormData({
        lessonId: lesson.lessonId?.toString() || '',
        title: lesson.title || '',
        difficulty: lesson.difficulty || 'Beginner',
        topics: lesson.topics || [],
        vocabulary: Array.isArray(lesson.vocabulary) ? lesson.vocabulary : [],
        phrases: Array.isArray(lesson.phrases) ? lesson.phrases : [],
        sentences: Array.isArray(lesson.sentences) ? lesson.sentences : [],
        dialogues: Array.isArray(lesson.dialogues) ? lesson.dialogues : [],
        exercises: Array.isArray(lesson.exercises) ? lesson.exercises : [],
        speakingPrompts: lesson.speakingPrompts || [],
        isUnlocked: lesson.isUnlocked !== undefined ? lesson.isUnlocked : true,
        requiredLevel: lesson.requiredLevel || 1
      });
    } else {
      // Reset form for new lesson
      setFormData({
        lessonId: '',
        title: '',
        difficulty: 'Beginner',
        topics: [],
        vocabulary: [],
        phrases: [],
        sentences: [],
        dialogues: [],
        exercises: [],
        speakingPrompts: [],
        isUnlocked: true,
        requiredLevel: 1
      });
    }
  }, [lesson, open]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.lessonId || !formData.title || !formData.difficulty) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const url = lesson ? `/api/admin/lessons/${lesson.id}` : '/api/admin/lessons';
      const method = lesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(lesson ? 'Aula atualizada com sucesso' : 'Aula criada com sucesso');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar aula');
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Erro ao salvar aula');
    } finally {
      setLoading(false);
    }
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()]
      }));
      setNewTopic('');
    }
  };

  const removeTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  const addVocabulary = () => {
    setFormData(prev => ({
      ...prev,
      vocabulary: [...prev.vocabulary, { word: '', translation: '', example: '', audioUrl: '' }]
    }));
  };

  const updateVocabulary = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vocabulary: prev.vocabulary.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeVocabulary = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vocabulary: prev.vocabulary.filter((_, i) => i !== index)
    }));
  };

  const addSentence = () => {
    setFormData(prev => ({
      ...prev,
      sentences: [...prev.sentences, { 
        sentence: '', 
        translation: '', 
        difficulty: 'Beginner', 
        audioUrl: '',
        audioText: '',
        voice: 'en-US-Journey-D',
        speed: 1.0
      }]
    }));
  };

  const updateSentence = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      sentences: prev.sentences.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeSentence = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sentences: prev.sentences.filter((_, i) => i !== index)
    }));
  };

  const openSSMLEditor = (index: number) => {
    setEditingSentenceIndex(index);
    setSsmlEditorOpen(true);
  };

  const handleSentenceSSMLSave = (updatedSentence: any) => {
    if (editingSentenceIndex !== null) {
      setFormData(prev => ({
        ...prev,
        sentences: prev.sentences.map((item, i) => 
          i === editingSentenceIndex ? updatedSentence : item
        )
      }));
    }
  };

  const addSpeakingPrompt = () => {
    setFormData(prev => ({
      ...prev,
      speakingPrompts: [...prev.speakingPrompts, '']
    }));
  };

  const updateSpeakingPrompt = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      speakingPrompts: prev.speakingPrompts.map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  const removeSpeakingPrompt = (index: number) => {
    setFormData(prev => ({
      ...prev,
      speakingPrompts: prev.speakingPrompts.filter((_, i) => i !== index)
    }));
  };

  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: ''
      }]
    }));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const generateAudioWithAI = async (text: string, type: 'vocabulary' | 'sentence', index: number) => {
    try {
      toast.info('Gerando áudio com IA...');
      const response = await fetch('/api/admin/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'american' })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Áudio gerado com sucesso! (Nota: Integre com serviço TTS real)');
        
        // Update the form data with audio info
        if (type === 'vocabulary') {
          updateVocabulary(index, 'audioUrl', `generated-${Date.now()}`);
        } else if (type === 'sentence') {
          updateSentence(index, 'audioUrl', `generated-${Date.now()}`);
        }
      } else {
        toast.error('Erro ao gerar áudio');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Erro ao gerar áudio');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            {lesson ? 'Editar Aula' : 'Nova Aula'}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Preencha os dados da aula e seu conteúdo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lessonId" className="text-slate-700">ID da Aula *</Label>
              <Input
                id="lessonId"
                type="number"
                value={formData.lessonId}
                onChange={(e) => setFormData(prev => ({ ...prev, lessonId: e.target.value }))}
                placeholder="1"
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>
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
          </div>

          <div>
            <Label htmlFor="title" className="text-slate-700">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nome da aula"
              className="bg-white border-slate-300 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requiredLevel" className="text-slate-700">Nível Requerido</Label>
              <Input
                id="requiredLevel"
                type="number"
                value={formData.requiredLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, requiredLevel: parseInt(e.target.value) }))}
                placeholder="1"
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isUnlocked"
                checked={formData.isUnlocked}
                onChange={(e) => setFormData(prev => ({ ...prev, isUnlocked: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <Label htmlFor="isUnlocked" className="text-slate-700">Aula Liberada</Label>
            </div>
          </div>

          {/* Topics */}
          <div>
            <Label className="text-slate-700">Tópicos</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Adicionar tópico"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                className="bg-white border-slate-300 text-slate-900"
              />
              <Button type="button" onClick={addTopic} size="sm" className="bg-flow-blue hover:bg-blue-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.topics.map((topic, index) => (
                <div key={index} className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  <span className="text-sm">{topic}</span>
                  <button onClick={() => removeTopic(index)} className="text-blue-600 hover:text-blue-800">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="vocabulary" className="w-full">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="vocabulary" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Vocabulário</TabsTrigger>
              <TabsTrigger value="sentences" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Listening</TabsTrigger>
              <TabsTrigger value="speaking" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Speaking</TabsTrigger>
              <TabsTrigger value="exercises" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Exercícios</TabsTrigger>
            </TabsList>

            {/* Vocabulary Tab */}
            <TabsContent value="vocabulary" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-slate-700">Itens de Vocabulário ({formData.vocabulary.length})</Label>
                <Button onClick={addVocabulary} size="sm" className="bg-flow-blue hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.vocabulary.map((item, index) => (
                  <Card key={index} className="bg-white border-slate-200">
                    <CardContent className="pt-4 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={item.word}
                          onChange={(e) => updateVocabulary(index, 'word', e.target.value)}
                          placeholder="Palavra em inglês"
                          className="bg-white border-slate-300 text-slate-900"
                        />
                        <Input
                          value={item.translation}
                          onChange={(e) => updateVocabulary(index, 'translation', e.target.value)}
                          placeholder="Tradução"
                          className="bg-white border-slate-300 text-slate-900"
                        />
                      </div>
                      <Input
                        value={item.example}
                        onChange={(e) => updateVocabulary(index, 'example', e.target.value)}
                        placeholder="Exemplo de uso"
                        className="bg-white border-slate-300 text-slate-900"
                      />
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          onClick={() => generateAudioWithAI(item.word, 'vocabulary', index)}
                          size="sm"
                          variant="outline"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-300"
                        >
                          <Wand2 className="mr-2 h-4 w-4" />
                          Gerar Áudio com IA
                        </Button>
                        <Button
                          type="button"
                          onClick={() => removeVocabulary(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {item.audioUrl && (
                        <div className="text-xs text-green-600">✓ Áudio gerado</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Sentences/Listening Tab */}
            <TabsContent value="sentences" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-slate-700">Sentenças para Listening ({formData.sentences.length})</Label>
                <Button onClick={addSentence} size="sm" className="bg-flow-blue hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.sentences.map((item, index) => (
                  <Card key={index} className="bg-white border-slate-200">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">Sentença #{index + 1}</span>
                        <Button
                          type="button"
                          onClick={() => openSSMLEditor(index)}
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Editar com SSML
                        </Button>
                      </div>
                      <Input
                        value={item.sentence}
                        onChange={(e) => updateSentence(index, 'sentence', e.target.value)}
                        placeholder="Sentença em inglês"
                        className="bg-white border-slate-300 text-slate-900"
                      />
                      <Input
                        value={item.translation}
                        onChange={(e) => updateSentence(index, 'translation', e.target.value)}
                        placeholder="Tradução"
                        className="bg-white border-slate-300 text-slate-900"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {item.audioUrl && (
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                                ✓ Áudio configurado
                              </div>
                              {item.audioText && item.audioText.includes('<voice') && (
                                <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                                  🎭 Multi-voz
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeSentence(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {item.audioUrl && (
                        <audio controls src={item.audioUrl} className="w-full mt-2">
                          Seu navegador não suporta áudio.
                        </audio>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Speaking Tab */}
            <TabsContent value="speaking" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-slate-700">Prompts de Speaking ({formData.speakingPrompts.length})</Label>
                <Button onClick={addSpeakingPrompt} size="sm" className="bg-flow-blue hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.speakingPrompts.map((prompt, index) => (
                  <div key={index} className="flex space-x-2">
                    <Textarea
                      value={prompt}
                      onChange={(e) => updateSpeakingPrompt(index, e.target.value)}
                      placeholder="Ex: Tell me about your favorite hobby"
                      className="bg-white border-slate-300 text-slate-900"
                      rows={2}
                    />
                    <Button
                      type="button"
                      onClick={() => removeSpeakingPrompt(index)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Exercises Tab */}
            <TabsContent value="exercises" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-slate-700">Exercícios ({formData.exercises.length})</Label>
                <Button onClick={addExercise} size="sm" className="bg-flow-blue hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.exercises.map((exercise, index) => (
                  <Card key={index} className="bg-white border-slate-200">
                    <CardContent className="pt-4 space-y-2">
                      <Input
                        value={exercise.question}
                        onChange={(e) => updateExercise(index, 'question', e.target.value)}
                        placeholder="Pergunta do exercício"
                        className="bg-white border-slate-300 text-slate-900"
                      />
                      <Select 
                        value={exercise.type} 
                        onValueChange={(value) => updateExercise(index, 'type', value)}
                      >
                        <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300">
                          <SelectItem value="multiple_choice" className="text-slate-900">Múltipla Escolha</SelectItem>
                          <SelectItem value="fill_blank" className="text-slate-900">Preencher Lacuna</SelectItem>
                          <SelectItem value="true_false" className="text-slate-900">Verdadeiro/Falso</SelectItem>
                        </SelectContent>
                      </Select>
                      {exercise.type === 'multiple_choice' && (
                        <div className="space-y-1">
                          {exercise.options.map((option: string, optIndex: number) => (
                            <Input
                              key={optIndex}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...exercise.options];
                                newOptions[optIndex] = e.target.value;
                                updateExercise(index, 'options', newOptions);
                              }}
                              placeholder={`Opção ${optIndex + 1}`}
                              className="bg-white border-slate-300 text-slate-900"
                            />
                          ))}
                        </div>
                      )}
                      <Input
                        value={exercise.correctAnswer}
                        onChange={(e) => updateExercise(index, 'correctAnswer', e.target.value)}
                        placeholder="Resposta correta"
                        className="bg-white border-slate-300 text-slate-900"
                      />
                      <Button
                        type="button"
                        onClick={() => removeExercise(index)}
                        size="sm"
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover Exercício
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
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
              lesson ? 'Atualizar Aula' : 'Criar Aula'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Nested SSML Editor Dialog */}
      {editingSentenceIndex !== null && (
        <SentenceSSMLEditorDialog
          open={ssmlEditorOpen}
          onOpenChange={setSsmlEditorOpen}
          sentence={formData.sentences[editingSentenceIndex]}
          onSave={handleSentenceSSMLSave}
        />
      )}
    </Dialog>
  );
}
