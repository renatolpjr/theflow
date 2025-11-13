'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Heart, Eye, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetchVideo();
  }, [params.id]);

  const fetchVideo = async () => {
    try {
      const response = await fetch(`/api/videos/${params.id}`);
      const data = await response.json();
      setVideo(data.video);
      setLiked(data.video.progress?.[0]?.liked || false);
    } catch (error) {
      console.error('Error fetching video:', error);
      toast.error('Erro ao carregar vídeo');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await fetch(`/api/videos/${params.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: !liked, watchedSeconds: 0, lastPosition: 0 })
      });
      setLiked(!liked);
      toast.success(liked ? 'Like removido' : 'Vídeo curtido!');
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Vídeo não encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" onClick={() => router.push('/videos')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                <iframe
                  ref={playerRef}
                  src={video.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
            <CardHeader>
              <div className="flex gap-2 mb-2">
                <Badge variant="outline">{video.difficulty}</Badge>
                <Badge variant="outline" className="capitalize">{video.category}</Badge>
                {video.isPremium && <Badge className="bg-amber-500">Premium</Badge>}
              </div>
              <CardTitle className="text-2xl">{video.title}</CardTitle>
              <CardDescription>{video.description}</CardDescription>
              <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {video.viewCount} visualizações
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(video.duration)}
                </span>
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="ml-auto"
                >
                  <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                  {liked ? 'Curtido' : 'Curtir'}
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sobre este vídeo</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="description">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description">Descrição</TabsTrigger>
                  <TabsTrigger value="transcript">Transcrição</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <p className="text-slate-600">{video.description}</p>
                  {video.tags && video.tags.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="transcript" className="mt-4">
                  {video.transcript ? (
                    <p className="text-slate-600 whitespace-pre-wrap">{video.transcript}</p>
                  ) : (
                    <p className="text-slate-600">Transcrição não disponível</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seu Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              {video.progress && video.progress.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={video.progress[0].completed ? "default" : "secondary"}>
                      {video.progress[0].completed ? 'Completo' : 'Em andamento'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tempo assistido:</span>
                    <span>{formatDuration(video.progress[0].watchedSeconds)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600">Você ainda não assistiu este vídeo</p>
              )}
            </CardContent>
          </Card>

          {video.resources && (
            <Card>
              <CardHeader>
                <CardTitle>Recursos Adicionais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Materiais complementares em breve</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
