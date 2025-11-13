
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Mic,
  Headphones,
  PenTool,
  ArrowLeft,
  CheckCircle,
  Play,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { VocabularyModule } from '@/components/learning-modules/vocabulary-module';
import { SpeakingModule } from '@/components/learning-modules/speaking-module';
import { ListeningModule } from '@/components/learning-modules/listening-module';
import { ExerciseModule } from '@/components/learning-modules/exercise-module';

interface LessonData {
  id: string;
  lessonId: number;
  title: string;
  difficulty: string;
  topics: string[];
  vocabulary: any[];
  phrases: any[];
  sentences: any[];
  dialogues: any[];
  exercises: any[];
  speakingPrompts: string[];
  progress: {
    completed: boolean;
    score: number | null;
    vocabularyComplete: boolean;
    speakingComplete: boolean;
    listeningComplete: boolean;
    exercisesComplete: boolean;
  } | null;
}

interface LessonContentProps {
  lessonId: string;
}

export function LessonContent({ lessonId }: LessonContentProps) {
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vocabulary');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Lesson not found');
            router.push('/lessons');
            return;
          }
          if (response.status === 403) {
            toast.error('This lesson is locked. Complete previous lessons to unlock it.');
            router.push('/lessons');
            return;
          }
          throw new Error('Failed to fetch lesson');
        }
        const data = await response.json();
        setLesson(data);
      } catch (error) {
        console.error('Error fetching lesson:', error);
        toast.error('Failed to load lesson');
        router.push('/lessons');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, router]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const calculateProgress = () => {
    if (!lesson?.progress) return 0;
    
    const sections = [
      lesson.progress.vocabularyComplete,
      lesson.progress.speakingComplete,
      lesson.progress.listeningComplete,
      lesson.progress.exercisesComplete
    ];
    
    const completedSections = sections.filter(Boolean).length;
    return (completedSections / sections.length) * 100;
  };

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

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="h-64 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Lesson not found</h2>
          <Button onClick={() => router.push('/lessons')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => router.push('/lessons')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lessons
        </Button>
      </div>

      {/* Lesson Overview */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
              <div className="flex items-center space-x-3 mb-4">
                <Badge className={getDifficultyColor(lesson.difficulty)}>
                  {lesson.difficulty}
                </Badge>
                <span className="text-slate-500">Lesson {lesson.lessonId}</span>
                {lesson.progress?.completed && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Completed</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {lesson.topics.map((topic, index) => (
                  <Badge key={index} variant="outline">{topic}</Badge>
                ))}
              </div>
            </div>
            {lesson.progress?.score && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(lesson.progress.score)}%
                </div>
                <p className="text-sm text-slate-600">Best Score</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {lesson.progress && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Overall Progress</span>
                <span className="font-medium">{Math.round(calculateProgress())}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-3 mb-4" />
              
              {/* Module Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className={`h-4 w-4 ${lesson.progress.vocabularyComplete ? 'text-green-600' : 'text-slate-400'}`} />
                  <span className="text-sm">Vocabulary</span>
                  {lesson.progress.vocabularyComplete && <CheckCircle className="h-3 w-3 text-green-600" />}
                </div>
                <div className="flex items-center space-x-2">
                  <Mic className={`h-4 w-4 ${lesson.progress.speakingComplete ? 'text-green-600' : 'text-slate-400'}`} />
                  <span className="text-sm">Speaking</span>
                  {lesson.progress.speakingComplete && <CheckCircle className="h-3 w-3 text-green-600" />}
                </div>
                <div className="flex items-center space-x-2">
                  <Headphones className={`h-4 w-4 ${lesson.progress.listeningComplete ? 'text-green-600' : 'text-slate-400'}`} />
                  <span className="text-sm">Listening</span>
                  {lesson.progress.listeningComplete && <CheckCircle className="h-3 w-3 text-green-600" />}
                </div>
                <div className="flex items-center space-x-2">
                  <PenTool className={`h-4 w-4 ${lesson.progress.exercisesComplete ? 'text-green-600' : 'text-slate-400'}`} />
                  <span className="text-sm">Exercises</span>
                  {lesson.progress.exercisesComplete && <CheckCircle className="h-3 w-3 text-green-600" />}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Modules */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="vocabulary" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Vocabulary</span>
          </TabsTrigger>
          <TabsTrigger value="speaking" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3">
            <Mic className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Speaking</span>
          </TabsTrigger>
          <TabsTrigger value="listening" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3">
            <Headphones className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Listening</span>
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3">
            <PenTool className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Exercises</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vocabulary" className="space-y-6">
          <VocabularyModule lesson={lesson} />
        </TabsContent>

        <TabsContent value="speaking" className="space-y-6">
          <SpeakingModule lesson={lesson} />
        </TabsContent>

        <TabsContent value="listening" className="space-y-6">
          <ListeningModule lesson={lesson} />
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6">
          <ExerciseModule lesson={lesson} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
