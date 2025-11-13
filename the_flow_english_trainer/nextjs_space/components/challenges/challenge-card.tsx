'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Target, Zap } from 'lucide-react';
import Link from 'next/link';

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    type: string;
    category: string;
    pointsReward: number;
    timeLimit: number | null;
    passingScore: number;
    requiredLevel: number;
    questions: any[];
  };
  userAttempts?: number;
}

export function ChallengeCard({ challenge, userAttempts = 0 }: ChallengeCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'daily':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'weekly':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'special':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'timed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-xl font-bold">{challenge.title}</CardTitle>
          <Badge className={getDifficultyColor(challenge.difficulty)}>
            {challenge.difficulty}
          </Badge>
        </div>
        <CardDescription className="text-sm line-clamp-2">{challenge.description}</CardDescription>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className={getCategoryColor(challenge.category)}>
            {challenge.category}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {challenge.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-slate-600">
              <span className="font-semibold text-foreground">{challenge.pointsReward}</span> pontos
            </span>
          </div>
          {challenge.timeLimit && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-slate-600">
                <span className="font-semibold text-foreground">{Math.floor(challenge.timeLimit / 60)}</span> min
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            <span className="text-slate-600">
              <span className="font-semibold text-foreground">{challenge.passingScore}%</span> para passar
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="text-slate-600">
              <span className="font-semibold text-foreground">{challenge.questions?.length || 0}</span> questões
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-xs text-slate-600">
          {userAttempts > 0 ? `${userAttempts} tentativa(s)` : 'Novo desafio'}
        </span>
        <Link href={`/challenges/${challenge.id}`}>
          <Button>Iniciar Desafio</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
