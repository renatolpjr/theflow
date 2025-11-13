
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
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  question: string;
  type: string;
  correctAnswer: string;
  options?: string[];
}

interface ChallengeFormData {
  title: string;
  description: string;
  difficulty: string;
  type: string;
  category: string;
  pointsReward: number;
  timeLimit: number | null;
  passingScore: number;
  maxAttempts: number;
  requiredLevel: number;
  questions: Question[];
}

interface ChallengeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge?: any;
  onSuccess: () => void;
}

export function ChallengeFormDialog({
  open,
  onOpenChange,
  challenge,
  onSuccess,
}: ChallengeFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ChallengeFormData>({
    title: '',
    description: '',
    difficulty: 'beginner',
    type: 'quiz',
    category: 'vocabulary',
    pointsReward: 100,
    timeLimit: null,
    passingScore: 70,
    maxAttempts: 3,
    requiredLevel: 1,
    questions: [],
  });

  useEffect(() => {
    if (challenge) {
      setFormData({
        title: challenge.title || '',
        description: challenge.description || '',
        difficulty: challenge.difficulty || 'beginner',
        type: challenge.type || 'quiz',
        category: challenge.category || 'vocabulary',
        pointsReward: challenge.pointsReward || 100,
        timeLimit: challenge.timeLimit || null,
        passingScore: challenge.passingScore || 70,
        maxAttempts: challenge.maxAttempts || 3,
        requiredLevel: challenge.requiredLevel || 1,
        questions: challenge.questions || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        difficulty: 'beginner',
        type: 'quiz',
        category: 'vocabulary',
        pointsReward: 100,
        timeLimit: null,
        passingScore: 70,
        maxAttempts: 3,
        requiredLevel: 1,
        questions: [],
      });
    }
  }, [challenge, open]);

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: '',
          type: 'multiple_choice',
          correctAnswer: '',
          options: ['', '', '', ''],
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const updateQuestionOption = (qIndex: number, optIndex: number, value: string) => {
    const updatedQuestions = [...formData.questions];
    if (updatedQuestions[qIndex].options) {
      updatedQuestions[qIndex].options![optIndex] = value;
      setFormData({ ...formData, questions: updatedQuestions });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Título e descrição são obrigatórios');
      return;
    }

    if (formData.questions.length === 0) {
      toast.error('Adicione pelo menos uma questão');
      return;
    }

    setLoading(true);
    try {
      const url = challenge
        ? `/api/admin/challenges/${challenge.id}`
        : '/api/admin/challenges';
      const method = challenge ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(challenge ? 'Desafio atualizado!' : 'Desafio criado!');
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao salvar desafio');
      }
    } catch (error) {
      console.error('Error saving challenge:', error);
      toast.error('Erro ao salvar desafio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            {challenge ? 'Editar Desafio' : 'Criar Novo Desafio'}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Preencha os campos abaixo para {challenge ? 'editar' : 'criar'} um desafio
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700">Título *</Label>
              <Input className="bg-white border-slate-300 text-slate-900"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Vocabulário - Animais"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700">Descrição *</Label>
              <Textarea className="bg-white border-slate-300 text-slate-900"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do desafio"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-slate-700">Dificuldade</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-300">
                    <SelectItem value="beginner" className="text-slate-900">Iniciante</SelectItem>
                    <SelectItem value="intermediate" className="text-slate-900">Intermediário</SelectItem>
                    <SelectItem value="advanced" className="text-slate-900">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-300">
                    <SelectItem value="vocabulary" className="text-slate-900">Vocabulário</SelectItem>
                    <SelectItem value="grammar" className="text-slate-900">Gramática</SelectItem>
                    <SelectItem value="conversation" className="text-slate-900">Conversação</SelectItem>
                    <SelectItem value="reading" className="text-slate-900">Leitura</SelectItem>
                    <SelectItem value="writing" className="text-slate-900">Escrita</SelectItem>
                    <SelectItem value="pronunciation" className="text-slate-900">Pronúncia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pointsReward" className="text-slate-700">Pontos</Label>
                <Input className="bg-white border-slate-300 text-slate-900"
                  id="pointsReward"
                  type="number"
                  value={formData.pointsReward}
                  onChange={(e) => setFormData({ ...formData, pointsReward: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit" className="text-slate-700">Tempo (min)</Label>
                <Input className="bg-white border-slate-300 text-slate-900"
                  id="timeLimit"
                  type="number"
                  value={formData.timeLimit || ''}
                  onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Opcional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingScore" className="text-slate-700">Nota Mínima (%)</Label>
                <Input className="bg-white border-slate-300 text-slate-900"
                  id="passingScore"
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredLevel" className="text-slate-700">Nível Requerido</Label>
                <Input className="bg-white border-slate-300 text-slate-900"
                  id="requiredLevel"
                  type="number"
                  value={formData.requiredLevel}
                  onChange={(e) => setFormData({ ...formData, requiredLevel: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-700 text-lg font-semibold">Questões</Label>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Questão
              </Button>
            </div>

            {formData.questions.map((question, qIndex) => (
              <Card key={qIndex}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Questão {qIndex + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Pergunta</Label>
                    <Textarea className="bg-white border-slate-300 text-slate-900"
                      value={question.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      placeholder="Digite a pergunta"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700">Tipo</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => updateQuestion(qIndex, 'type', value)}
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
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Resposta Correta</Label>
                      <Input className="bg-white border-slate-300 text-slate-900"
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                        placeholder="Digite a resposta"
                      />
                    </div>
                  </div>

                  {question.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      <Label className="text-slate-700">Opções</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options?.map((option, optIndex) => (
                          <Input className="bg-white border-slate-300 text-slate-900"
                            key={optIndex}
                            value={option}
                            onChange={(e) => updateQuestionOption(qIndex, optIndex, e.target.value)}
                            placeholder={`Opção ${optIndex + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {formData.questions.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-sm text-slate-600">
                  Nenhuma questão adicionada. Clique em "Adicionar Questão" para começar.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {challenge ? 'Atualizar' : 'Criar'} Desafio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
