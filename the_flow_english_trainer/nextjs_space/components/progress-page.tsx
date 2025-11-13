
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  BookOpen,
  Star,
  Clock,
  Target,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function ProgressPage() {
  const [stats, setStats] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, lessonsResponse] = await Promise.all([
          fetch('/api/user/stats'),
          fetch('/api/lessons')
        ]);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        if (lessonsResponse.ok) {
          const lessonsData = await lessonsResponse.json();
          setLessons(lessonsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const calculateModuleProgress = (lesson: any) => {
    if (!lesson.progress) return 0;
    
    const modules = [
      lesson.progress.vocabularyComplete,
      lesson.progress.speakingComplete,
      lesson.progress.listeningComplete,
      lesson.progress.exercisesComplete
    ];
    
    return (modules.filter(Boolean).length / modules.length) * 100;
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Your Learning Progress 📊
        </h1>
        <p className="text-slate-600">
          Track your English learning journey and achievements
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Lessons Completed</p>
                <p className="text-3xl font-bold">
                  {stats?.progress?.completedLessons || 0}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Overall Progress</p>
                <p className="text-3xl font-bold">
                  {stats?.progress?.completionPercentage || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Accuracy Rate</p>
                <p className="text-3xl font-bold">
                  {stats?.progress?.accuracy || 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Exercises</p>
                <p className="text-3xl font-bold">
                  {stats?.progress?.totalExercises || 0}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-flow-red" />
            Lesson Progress
          </CardTitle>
          <CardDescription>
            Detailed breakdown of your progress in each lesson
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lessons.map((lesson) => {
              const progressPercentage = calculateModuleProgress(lesson);
              const isCompleted = lesson.progress?.completed;
              
              return (
                <div key={lesson.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {lesson.lessonId}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{lesson.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            lesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            lesson.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {lesson.difficulty}
                          </Badge>
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900">
                        {Math.round(progressPercentage)}%
                      </div>
                      {lesson.progress?.score && (
                        <div className="text-sm text-slate-500">
                          Score: {Math.round(lesson.progress.score)}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Progress value={progressPercentage} className="h-2 mb-3" />
                  
                  {lesson.progress && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className={`flex items-center space-x-1 ${
                        lesson.progress.vocabularyComplete ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          lesson.progress.vocabularyComplete ? 'bg-green-500' : 'bg-slate-300'
                        }`}></div>
                        <span>Vocabulary</span>
                        {lesson.progress.vocabularyComplete && <CheckCircle className="w-3 h-3" />}
                      </div>
                      
                      <div className={`flex items-center space-x-1 ${
                        lesson.progress.speakingComplete ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          lesson.progress.speakingComplete ? 'bg-green-500' : 'bg-slate-300'
                        }`}></div>
                        <span>Speaking</span>
                        {lesson.progress.speakingComplete && <CheckCircle className="w-3 h-3" />}
                      </div>
                      
                      <div className={`flex items-center space-x-1 ${
                        lesson.progress.listeningComplete ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          lesson.progress.listeningComplete ? 'bg-green-500' : 'bg-slate-300'
                        }`}></div>
                        <span>Listening</span>
                        {lesson.progress.listeningComplete && <CheckCircle className="w-3 h-3" />}
                      </div>
                      
                      <div className={`flex items-center space-x-1 ${
                        lesson.progress.exercisesComplete ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          lesson.progress.exercisesComplete ? 'bg-green-500' : 'bg-slate-300'
                        }`}></div>
                        <span>Exercises</span>
                        {lesson.progress.exercisesComplete && <CheckCircle className="w-3 h-3" />}
                      </div>
                    </div>
                  )}
                  
                  {lesson.progress?.attempts > 0 && (
                    <div className="mt-3 pt-3 border-t text-xs text-slate-500 flex justify-between">
                      <span>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {Math.round(lesson.progress.timeSpent / 60)}m spent
                      </span>
                      <span>{lesson.progress.attempts} attempt{lesson.progress.attempts !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              );
            })}
            
            {lessons.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No lesson progress data available yet.</p>
                <p className="text-sm mt-1">Start a lesson to see your progress here!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-flow-red" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest learning sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.completed ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{activity.lessonTitle}</h4>
                      <p className="text-sm text-slate-600">
                        {activity.difficulty} • {activity.completed ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.score !== null && (
                      <p className="font-medium text-slate-900">{Math.round(activity.score)}%</p>
                    )}
                    <p className="text-xs text-slate-500">
                      {new Date(activity.lastAttempt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
