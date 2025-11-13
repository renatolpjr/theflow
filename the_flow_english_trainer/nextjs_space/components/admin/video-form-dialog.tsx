
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
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VideoFormData {
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  category: string;
  difficulty: string;
  transcript: string;
  isPublic: boolean;
  isPremium: boolean;
  requiredLevel: number;
}

interface VideoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video?: any;
  onSuccess: () => void;
}

export function VideoFormDialog({
  open,
  onOpenChange,
  video,
  onSuccess,
}: VideoFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    duration: 0,
    category: 'grammar',
    difficulty: 'beginner',
    transcript: '',
    isPublic: true,
    isPremium: false,
    requiredLevel: 1,
  });

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        videoUrl: video.videoUrl || '',
        thumbnail: video.thumbnail || '',
        duration: video.duration || 0,
        category: video.category || 'grammar',
        difficulty: video.difficulty || 'beginner',
        transcript: video.transcript || '',
        isPublic: video.isPublic ?? true,
        isPremium: video.isPremium ?? false,
        requiredLevel: video.requiredLevel || 1,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        thumbnail: '',
        duration: 0,
        category: 'grammar',
        difficulty: 'beginner',
        transcript: '',
        isPublic: true,
        isPremium: false,
        requiredLevel: 1,
      });
    }
  }, [video, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.videoUrl) {
      toast.error('Título e URL do vídeo são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const url = video
        ? `/api/admin/videos/${video.id}`
        : '/api/admin/videos';
      const method = video ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(video ? 'Vídeo atualizado!' : 'Vídeo criado!');
        onSuccess();
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao salvar vídeo');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Erro ao salvar vídeo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            {video ? 'Editar Vídeo' : 'Criar Novo Vídeo'}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Preencha os campos abaixo para {video ? 'editar' : 'criar'} um vídeo aula
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
                placeholder="Ex: Basic English Grammar - Present Simple"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700">Descrição</Label>
              <Textarea className="bg-white border-slate-300 text-slate-900"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do vídeo"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl" className="text-slate-700">URL do Vídeo * (YouTube)</Label>
                <Input className="bg-white border-slate-300 text-slate-900"
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="text-slate-700">URL da Miniatura</Label>
                <Input className="bg-white border-slate-300 text-slate-900"
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://lh3.googleusercontent.com/-HiLzZQ91XuY/Y7yaUjmn-nI/AAAAAAAAAH0/H0C0HII4fc8B61iP9oik_33bpRb0u4OvwCNcBGAsYHQ/w1280-h800/MultiLanguageForm.gif"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="grammar" className="text-slate-900">Gramática</SelectItem>
                    <SelectItem value="vocabulary" className="text-slate-900">Vocabulário</SelectItem>
                    <SelectItem value="pronunciation" className="text-slate-900">Pronúncia</SelectItem>
                    <SelectItem value="conversation" className="text-slate-900">Conversação</SelectItem>
                    <SelectItem value="reading" className="text-slate-900">Leitura</SelectItem>
                    <SelectItem value="writing" className="text-slate-900">Escrita</SelectItem>
                    <SelectItem value="listening" className="text-slate-900">Escuta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-slate-700">Duração (minutos)</Label>
                <Input className="bg-white border-slate-300 text-slate-900"
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredLevel" className="text-slate-700">Nível Requerido</Label>
                <Input className="bg-white border-slate-300 text-slate-900"
                  id="requiredLevel"
                  type="number"
                  value={formData.requiredLevel}
                  onChange={(e) => setFormData({ ...formData, requiredLevel: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transcript" className="text-slate-700">Transcrição</Label>
              <Textarea className="bg-white border-slate-300 text-slate-900"
                id="transcript"
                value={formData.transcript}
                onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                placeholder="Transcrição do vídeo (opcional)"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic" className="text-slate-700">Vídeo Público</Label>
                <p className="text-sm text-slate-600">
                  Tornar este vídeo visível para todos os usuários
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isPremium" className="text-slate-700">Vídeo Premium</Label>
                <p className="text-sm text-slate-600">
                  Requer assinatura premium para acessar
                </p>
              </div>
              <Switch
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
              />
            </div>
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
              {video ? 'Atualizar' : 'Criar'} Vídeo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
