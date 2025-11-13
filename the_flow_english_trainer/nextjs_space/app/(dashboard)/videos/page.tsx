'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Clock, Eye, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, category, difficulty]);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;
    if (category !== 'all') {
      filtered = filtered.filter(v => v.category === category);
    }
    if (difficulty !== 'all') {
      filtered = filtered.filter(v => v.difficulty === difficulty);
    }
    setFilteredVideos(filtered);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Play className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Aulas em Vídeo</h1>
        </div>
        <p className="text-slate-600 text-lg">
          Aprenda inglês assistindo às nossas aulas em vídeo!
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Categoria</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="pronunciation">Pronúncia</SelectItem>
              <SelectItem value="grammar">Gramática</SelectItem>
              <SelectItem value="vocabulary">Vocabulário</SelectItem>
              <SelectItem value="conversation">Conversação</SelectItem>
              <SelectItem value="listening">Listening</SelectItem>
              <SelectItem value="business">Business English</SelectItem>
              <SelectItem value="culture">Cultura</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Dificuldade</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as dificuldades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as dificuldades</SelectItem>
              <SelectItem value="Beginner">Iniciante</SelectItem>
              <SelectItem value="Intermediate">Intermediário</SelectItem>
              <SelectItem value="Advanced">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0">
                <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <img
                    src={video.thumbnail || '/videos/thumbnails/default.jpg'}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {formatDuration(video.duration)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex gap-2 mb-2">
                  <Badge variant="outline">{video.difficulty}</Badge>
                  <Badge variant="outline" className="capitalize">{video.category}</Badge>
                  {video.isPremium && <Badge className="bg-amber-500">Premium</Badge>}
                </div>
                <CardTitle className="text-lg mb-2">{video.title}</CardTitle>
                <CardDescription className="line-clamp-2">{video.description}</CardDescription>
              </CardContent>
              <CardFooter className="flex justify-between items-center text-sm text-slate-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {video.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {video.likeCount}
                  </span>
                </div>
                <Link href={`/videos/${video.id}`}>
                  <Button size="sm">
                    <Play className="mr-2 h-4 w-4" />
                    Assistir
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-600">Nenhum vídeo disponível</p>
        </div>
      )}
    </div>
  );
}
