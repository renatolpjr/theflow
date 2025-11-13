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
import { Loader2, Plus, Edit, Trash2, ArrowLeft, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { VideoFormDialog } from '@/components/admin/video-form-dialog';

export default function AdminVideosPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchVideos();
    }
  }, [status, router]);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/admin/videos');
      if (response.status === 403) {
        toast.error('Acesso negado - Apenas administradores');
        router.push('/dashboard');
        return;
      }
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const video = videos.find(v => v.id === id);
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...video, isActive: !isActive })
      });

      if (response.ok) {
        setVideos(videos.map(v =>
          v.id === id ? { ...v, isActive: !isActive } : v
        ));
        toast.success(`Vídeo ${!isActive ? 'ativado' : 'desativado'}`);
      }
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('Erro ao atualizar vídeo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;

    try {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setVideos(videos.filter(v => v.id !== id));
        toast.success('Vídeo excluído');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Erro ao excluir vídeo');
    }
  };

  const handleCreateNew = () => {
    setEditingVideo(null);
    setDialogOpen(true);
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchVideos();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
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
              <CardTitle className="text-3xl">Gerenciar Vídeos</CardTitle>
              <CardDescription className="mt-2">
                Visualize e gerencie todas as aulas em vídeo
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Vídeo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {videos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Dificuldade</TableHead>
                  <TableHead className="text-center">Duração</TableHead>
                  <TableHead className="text-center">Visualizações</TableHead>
                  <TableHead className="text-center">Curtidas</TableHead>
                  <TableHead className="text-center">Premium</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {video.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {video.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{video.difficulty}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDuration(video.duration)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-4 w-4 text-slate-600" />
                        {video.viewCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{video.likeCount}</TableCell>
                    <TableCell className="text-center">
                      {video.isPremium ? (
                        <Badge className="bg-amber-500">Premium</Badge>
                      ) : (
                        <Badge variant="outline">Gratuito</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={video.isActive}
                        onCheckedChange={() =>
                          handleToggleActive(video.id, video.isActive)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(video)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(video.id)}
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
              <p className="text-slate-600">Nenhum vídeo encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      <VideoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        video={editingVideo}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
