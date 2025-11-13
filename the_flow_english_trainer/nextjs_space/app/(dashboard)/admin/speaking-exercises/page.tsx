
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2, Plus, Pencil, Trash2, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { SpeakingExerciseFormDialog } from '@/components/admin/exercises/speaking-exercise-form-dialog';

export default function AdminSpeakingExercisesPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchExercises();
    }
  }, [status, router]);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/admin/speaking-exercises');
      if (response.status === 403) {
        toast.error('Acesso negado');
        router.push('/dashboard');
        return;
      }
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast.error('Erro ao carregar exercícios');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/speaking-exercises/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        toast.success(currentStatus ? 'Exercício desativado' : 'Exercício ativado');
        fetchExercises();
      }
    } catch (error) {
      console.error('Error toggling exercise:', error);
      toast.error('Erro ao atualizar exercício');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return;

    try {
      const response = await fetch(`/api/admin/speaking-exercises/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Exercício excluído com sucesso');
        fetchExercises();
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast.error('Erro ao excluir exercício');
    }
  };

  const handleCreateNew = () => {
    setEditingExercise(null);
    setDialogOpen(true);
  };

  const handleEdit = (exercise: any) => {
    setEditingExercise(exercise);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setDialogOpen(false);
    fetchExercises();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exercícios de Speaking</h1>
          <p className="text-slate-600 mt-1">Gerencie os exercícios de prática oral</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-flow-blue hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Exercício
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">Lista de Exercícios ({exercises.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-700">Título</TableHead>
                <TableHead className="text-slate-700">Dificuldade</TableHead>
                <TableHead className="text-slate-700">Categoria</TableHead>
                <TableHead className="text-slate-700">Duração</TableHead>
                <TableHead className="text-slate-700">Palavras Alvo</TableHead>
                <TableHead className="text-slate-700">Tentativas</TableHead>
                <TableHead className="text-slate-700">Status</TableHead>
                <TableHead className="text-slate-700">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-red-500" />
                      {exercise.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 border-green-200' :
                      exercise.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }>
                      {exercise.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700">{exercise.category}</TableCell>
                  <TableCell className="text-slate-700">{exercise.minDuration}-{exercise.maxDuration}s</TableCell>
                  <TableCell className="text-slate-700">{exercise.targetWords?.length || 0}</TableCell>
                  <TableCell className="text-slate-700">{exercise._count?.attempts || 0}</TableCell>
                  <TableCell>
                    <Switch
                      checked={exercise.isActive}
                      onCheckedChange={() => handleToggleActive(exercise.id, exercise.isActive)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(exercise)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(exercise.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {exercises.length === 0 && (
            <div className="text-center py-12">
              <Mic className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">Nenhum exercício</h3>
              <p className="mt-1 text-sm text-slate-500">
                Comece criando um novo exercício de speaking.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateNew} className="bg-flow-blue hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Exercício
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <SpeakingExerciseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        exercise={editingExercise}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
