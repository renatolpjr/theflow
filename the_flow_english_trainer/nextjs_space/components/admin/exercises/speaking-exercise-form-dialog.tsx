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
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface SpeakingExerciseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise?: any;
  onSuccess: () => void;
}

export function SpeakingExerciseFormDialog({ open, onOpenChange, exercise, onSuccess }: SpeakingExerciseFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [newTargetWord, setNewTargetWord] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    category: 'conversation',
    prompt: '',
    context: '',
    targetWords: [] as string[],
    minDuration: 30,
    maxDuration: 120,
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
        prompt: exercise.prompt || '',
        context: exercise.context || '',
        targetWords: exercise.targetWords || [],
        minDuration: exercise.minDuration || 30,
        maxDuration: exercise.maxDuration || 120,
        isActive: exercise.isActive !== undefined ? exercise.isActive : true,
        requiredLevel: exercise.requiredLevel || 1,
        order: exercise.order || 0,
        tags: exercise.tags || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        difficulty: 'Beginner',
        category: 'conversation',
        prompt: '',
        context: '',
        targetWords: [],
        minDuration: 30,
        maxDuration: 120,
        isActive: true,
        requiredLevel: 1,
        order: 0,
        tags: []
      });
    }
  }, [exercise, open]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.difficulty || !formData.prompt) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const url = exercise ? `/api/admin/speaking-exercises/${exercise.id}` : '/api/admin/speaking-exercises';
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

  const addTargetWord = () => {
    if (newTargetWord.trim()) {
      setFormData(prev => ({
        ...prev,
        targetWords: [...prev.targetWords, newTargetWord.trim()]
      }));
      setNewTargetWord('');
    }
  };

  const removeTargetWord = (index: number) => {
    setFormData(prev => ({
      ...prev,
      targetWords: prev.targetWords.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            {exercise ? 'Editar Exercício de Speaking' : 'Novo Exercício de Speaking'}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Configure o prompt e critérios de avaliação
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
                  <SelectItem value="presentation" className="text-slate-900">Apresentação</SelectItem>
                  <SelectItem value="discussion" className="text-slate-900">Discussão</SelectItem>
                  <SelectItem value="storytelling" className="text-slate-900">Narrativa</SelectItem>
                  <SelectItem value="description" className="text-slate-900">Descrição</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div>
            <Label htmlFor="prompt" className="text-slate-700">Prompt *</Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder="Ex: Fale sobre seu hobby favorito por pelo menos 1 minuto"
              className="bg-white border-slate-300 text-slate-900"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="context" className="text-slate-700">Contexto Adicional</Label>
            <Textarea
              id="context"
              value={formData.context}
              onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
              placeholder="Informações adicionais ou background para o exercício"
              className="bg-white border-slate-300 text-slate-900"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minDuration" className="text-slate-700">Duração Mínima (segundos)</Label>
              <Input
                id="minDuration"
                type="number"
                value={formData.minDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, minDuration: parseInt(e.target.value) }))}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>
            <div>
              <Label htmlFor="maxDuration" className="text-slate-700">Duração Máxima (segundos)</Label>
              <Input
                id="maxDuration"
                type="number"
                value={formData.maxDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, maxDuration: parseInt(e.target.value) }))}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>
          </div>

          {/* Target Words */}
          <div>
            <Label className="text-slate-700">Palavras/Frases Alvo</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newTargetWord}
                onChange={(e) => setNewTargetWord(e.target.value)}
                placeholder="Adicionar palavra ou frase"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTargetWord())}
                className="bg-white border-slate-300 text-slate-900"
              />
              <Button type="button" onClick={addTargetWord} size="sm" className="bg-flow-blue hover:bg-blue-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.targetWords.map((word, index) => (
                <div key={index} className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  <span className="text-sm">{word}</span>
                  <button onClick={() => removeTargetWord(index)} className="text-blue-600 hover:text-blue-800">
                    <X className="h-3 w-3" />
                  </button>
                </div>
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
