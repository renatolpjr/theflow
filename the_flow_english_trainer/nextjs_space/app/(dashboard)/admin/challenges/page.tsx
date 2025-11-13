'use client';

import { useEffect, useState } from 'react';
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
import { Loader2, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ChallengeFormDialog } from '@/components/admin/challenge-form-dialog';

export default function AdminChallengesPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchChallenges();
    }
  }, [status, router]);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/admin/challenges');
      if (response.status === 403) {
        toast.error('Acesso negado - Apenas administradores');
        router.push('/dashboard');
        return;
      }
      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Erro ao carregar desafios');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const challenge = challenges.find(c => c.id === id);
      const response = await fetch(`/api/admin/challenges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...challenge, isActive: !isActive })
      });

      if (response.ok) {
        setChallenges(challenges.map(c =>
          c.id === id ? { ...c, isActive: !isActive } : c
        ));
        toast.success(`Desafio ${!isActive ? 'ativado' : 'desativado'}`);
      }
    } catch (error) {
      console.error('Error toggling challenge:', error);
      toast.error('Erro ao atualizar desafio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este desafio?')) return;

    try {
      const response = await fetch(`/api/admin/challenges/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setChallenges(challenges.filter(c => c.id !== id));
        toast.success('Desafio excluído');
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error('Erro ao excluir desafio');
    }
  };

  const handleCreateNew = () => {
    setEditingChallenge(null);
    setDialogOpen(true);
  };

  const handleEdit = (challenge: any) => {
    setEditingChallenge(challenge);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchChallenges();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Gerenciar Desafios</CardTitle>
              <CardDescription className="mt-2">
                Visualize e gerencie todos os desafios do sistema
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Desafio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {challenges.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Dificuldade</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Questões</TableHead>
                  <TableHead className="text-center">Pontos</TableHead>
                  <TableHead className="text-center">Tentativas</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challenges.map((challenge) => (
                  <TableRow key={challenge.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {challenge.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{challenge.difficulty}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {challenge.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{challenge.type}</TableCell>
                    <TableCell className="text-center">
                      {(challenge.questions as any[])?.length || 0}
                    </TableCell>
                    <TableCell className="text-center">{challenge.pointsReward}</TableCell>
                    <TableCell className="text-center">
                      {challenge._count?.attempts || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={challenge.isActive}
                        onCheckedChange={() =>
                          handleToggleActive(challenge.id, challenge.isActive)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(challenge)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(challenge.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">Nenhum desafio encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ChallengeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        challenge={editingChallenge}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
