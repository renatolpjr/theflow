'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { BookOpen, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LessonFormDialog } from '@/components/admin/lesson-form-dialog';

export default function AdminLessonsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchLessons();
    }
  }, [status, router]);

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/admin/lessons');
      if (response.ok) {
        const data = await response.json();
        setLessons(data);
      } else if (response.status === 403) {
        toast.error('Acesso negado. Apenas administradores.');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Erro ao carregar aulas');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUnlock = async (lesson: any) => {
    try {
      const response = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUnlocked: !lesson.isUnlocked })
      });

      if (response.ok) {
        toast.success('Status atualizado com sucesso');
        fetchLessons();
      } else {
        toast.error('Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error('Erro ao atualizar aula');
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Aula excluída com sucesso');
        fetchLessons();
      } else {
        toast.error('Erro ao excluir aula');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Erro ao excluir aula');
    }
  };

  const handleCreateNew = () => {
    setEditingLesson(null);
    setDialogOpen(true);
  };

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setDialogOpen(false);
    setEditingLesson(null);
    fetchLessons();
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-flow-blue" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Gerenciar Aulas
          </h1>
          <p className="text-slate-600">
            Crie e edite aulas com vocabulário, exercícios, speaking e listening
          </p>
        </div>
        <Button onClick={handleCreateNew} className="bg-flow-blue hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Nova Aula
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Aulas</CardTitle>
          <CardDescription>
            {lessons.length} {lessons.length === 1 ? 'aula' : 'aulas'} cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Dificuldade</TableHead>
                <TableHead>Nível Requerido</TableHead>
                <TableHead>Tópicos</TableHead>
                <TableHead>Conteúdo</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Liberada</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="font-medium">
                    {lesson.lessonId}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-flow-blue" />
                      <span className="font-medium">{lesson.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      lesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 border-green-200' :
                      lesson.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }>
                      {lesson.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>{lesson.requiredLevel}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {lesson.topics.slice(0, 2).map((topic: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {lesson.topics.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{lesson.topics.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>📚 {Array.isArray(lesson.vocabulary) ? lesson.vocabulary.length : 0} vocabulário</div>
                      <div>📝 {Array.isArray(lesson.exercises) ? lesson.exercises.length : 0} exercícios</div>
                      <div>🎤 {lesson.speakingPrompts?.length || 0} speaking</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {lesson._count?.progress || 0} usuários
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={lesson.isUnlocked}
                      onCheckedChange={() => handleToggleUnlock(lesson)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        onClick={() => handleEdit(lesson)}
                        size="sm"
                        variant="outline"
                        className="hover:bg-blue-50 hover:text-flow-blue hover:border-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(lesson.id)}
                        size="sm"
                        variant="outline"
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {lessons.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Nenhuma aula cadastrada</p>
              <Button onClick={handleCreateNew} className="mt-4 bg-flow-blue hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Aula
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <LessonFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lesson={editingLesson}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
