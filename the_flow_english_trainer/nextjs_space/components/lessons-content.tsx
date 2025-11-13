
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  Star,
  Play,
  Lock,
  CheckCircle,
  Mic,
  Headphones,
  PenTool,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';

interface LessonProgress {
  completed: boolean;
  score: number | null;
  timeSpent: number;
  attempts: number;
  lastAttempt: string;
  vocabularyComplete: boolean;
  speakingComplete: boolean;
  listeningComplete: boolean;
  exercisesComplete: boolean;
}

interface Lesson {
  id: string;
  lessonId: number;
  title: string;
  difficulty: string;
  topics: string[];
  isUnlocked: boolean;
  requiredLevel: number;
  isLocked: boolean;
  progress: LessonProgress | null;
  vocabularyCount: number;
  exerciseCount: number;
  speakingPromptCount: number;
  sentenceCount: number;
}

export function LessonsContent() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch('/api/lessons');
        if (!response.ok) throw new Error('Failed to fetch lessons');
        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOverallProgress = (lesson: Lesson) => {
    if (!lesson.progress) return 0;
    
    const sections = [
      lesson.progress.vocabularyComplete,
      lesson.progress.speakingComplete,
      lesson.progress.listeningComplete,
      lesson.progress.exercisesComplete
    ];
    
    const completedSections = sections.filter(Boolean).length;
    return (completedSections / sections.length) * 100;
  };

  const getProgressIcon = (lesson: Lesson) => {
    const progress = calculateOverallProgress(lesson);
    if (progress === 100) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (progress > 0) return <Play className="h-5 w-5 text-blue-600" />;
    return <BookOpen className="h-5 w-5 text-slate-400" />;
  };

  const filteredLessons = selectedDifficulty === 'all' 
    ? lessons 
    : lessons.filter(lesson => lesson.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          English Lessons
        </h1>
        <p className="text-slate-600">
          Choose a lesson to continue your English learning journey
        </p>
      </div>

      {/* Difficulty Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
          <Button
            key={difficulty}
            onClick={() => setSelectedDifficulty(difficulty)}
            variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
            className={selectedDifficulty === difficulty ? 'bg-[#DC2626] hover:bg-[#b91c1c] text-white' : ''}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const progressPercentage = calculateOverallProgress(lesson);
          const isStarted = lesson.progress && lesson.progress.attempts > 0;

          return (
            <Card 
              key={lesson.id} 
              className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                lesson.isLocked ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getProgressIcon(lesson)}
                    <div>
                      <CardTitle className="text-lg line-clamp-2">
                        {lesson.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getDifficultyColor(lesson.difficulty)}>
                          {lesson.difficulty}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          Lesson {lesson.lessonId}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {lesson.isLocked && (
                    <div className="text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                  )}
                </div>
                
                {lesson.progress?.completed && (
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <Trophy className="h-4 w-4" />
                    <span>Completed</span>
                    {lesson.progress.score && (
                      <span>• {Math.round(lesson.progress.score)}%</span>
                    )}
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Topics */}
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-2">Topics</h4>
                  <div className="flex flex-wrap gap-1">
                    {lesson.topics.slice(0, 3).map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {lesson.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{lesson.topics.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress */}
                {isStarted && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Overall Progress</span>
                      <span className="font-medium">{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}

                {/* Activity Counts */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-1 text-slate-600">
                    <BookOpen className="h-3 w-3" />
                    <span>{lesson.vocabularyCount} words</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-600">
                    <PenTool className="h-3 w-3" />
                    <span>{lesson.exerciseCount} exercises</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-600">
                    <Mic className="h-3 w-3" />
                    <span>{lesson.speakingPromptCount} speaking</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-600">
                    <Headphones className="h-3 w-3" />
                    <span>{lesson.sentenceCount} listening</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                  {lesson.isLocked ? (
                    <Button disabled className="w-full">
                      <Lock className="mr-2 h-4 w-4" />
                      Requires Level {lesson.requiredLevel}
                    </Button>
                  ) : (
                    <Button asChild className="w-full bg-[#DC2626] hover:bg-[#b91c1c] text-white">
                      <Link href={`/lessons/${lesson.lessonId}`}>
                        <Play className="mr-2 h-4 w-4" />
                        {isStarted ? 'Continue' : 'Start'} Lesson
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Time and Attempts */}
                {lesson.progress && (
                  <div className="pt-2 border-t text-xs text-slate-500 flex justify-between">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{Math.round(lesson.progress.timeSpent / 60)}m spent</span>
                    </div>
                    <span>{lesson.progress.attempts} attempt{lesson.progress.attempts !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No lessons found
          </h3>
          <p className="text-slate-600">
            {selectedDifficulty === 'all' 
              ? 'No lessons available at the moment.' 
              : `No ${selectedDifficulty} lessons available.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
