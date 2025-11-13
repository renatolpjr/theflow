'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ChallengeCard } from '@/components/challenges/challenge-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Filter, Loader2 } from 'lucide-react';

export default function ChallengesPage() {
  const { data: session } = useSession() || {};
  const [challenges, setChallenges] = useState<any[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    filterChallenges();
  }, [challenges, difficulty, category]);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges');
      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterChallenges = () => {
    let filtered = challenges;

    if (difficulty !== 'all') {
      filtered = filtered.filter(c => c.difficulty === difficulty);
    }

    if (category !== 'all') {
      filtered = filtered.filter(c => c.category === category);
    }

    setFilteredChallenges(filtered);
  };

  const getChallengesByCategory = (cat: string) => {
    return filteredChallenges.filter(c => c.category === cat);
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
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Desafios</h1>
        </div>
        <p className="text-slate-600 text-lg">
          Teste suas habilidades e ganhe pontos completando desafios de inglês!
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
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

        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Categoria</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="special">Especial</SelectItem>
              <SelectItem value="timed">Cronometrado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="daily">Diário</TabsTrigger>
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
          <TabsTrigger value="special">Especial</TabsTrigger>
          <TabsTrigger value="timed">Cronometrado</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {filteredChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">Nenhum desafio disponível</p>
            </div>
          )}
        </TabsContent>

        {['daily', 'weekly', 'special', 'timed'].map((cat) => (
          <TabsContent key={cat} value={cat} className="space-y-6">
            {getChallengesByCategory(cat).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getChallengesByCategory(cat).map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600">Nenhum desafio disponível nesta categoria</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
