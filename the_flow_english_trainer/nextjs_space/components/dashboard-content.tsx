
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Star,
  Play,
  Mic,
  Headphones,
  Award,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface UserStats {
  user: {
    name: string;
    email: string;
    totalPoints: number;
    level: number;
    streak: number;
    leaderboardPosition: number;
  };
  progress: {
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
    totalExercises: number;
    accuracy: number;
  };
  badges: number;
  recentActivity: Array<{
    lessonTitle: string;
    difficulty: string;
    score: number | null;
    completed: boolean;
    lastAttempt: string;
  }>;
}

export function DashboardContent() {
  const { data: session } = useSession() || {};
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Continue Learning',
      description: 'Pick up where you left off',
      icon: <BookOpen className="h-6 w-6" />,
      href: '/lessons',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Speaking Practice',
      description: 'Improve your pronunciation',
      icon: <Mic className="h-6 w-6" />,
      href: '/speaking',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Listening Challenge',
      description: 'Test your comprehension',
      icon: <Headphones className="h-6 w-6" />,
      href: '/listening',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'View Progress',
      description: 'See detailed analytics',
      icon: <BarChart3 className="h-6 w-6" />,
      href: '/progress',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">
          Welcome back, {stats?.user?.name || session?.user?.name}! 🇺🇸
        </h1>
        <p className="text-slate-600 font-medium">
          Master American English like a native speaker! 🎓
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#1e3a5f] text-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Points</p>
                <p className="text-3xl font-bold">{stats?.user?.totalPoints?.toLocaleString() || 0}</p>
                <p className="text-xs text-blue-200 mt-1">Keep climbing! 🚀</p>
              </div>
              <div className="bg-white/10 p-3 rounded-full">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#DC2626] text-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Current Level</p>
                <p className="text-3xl font-bold">{stats?.user?.level || 1}</p>
                <p className="text-xs text-red-200 mt-1">Level up! 🎯</p>
              </div>
              <div className="bg-white/10 p-3 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-700 text-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 text-sm font-medium">Daily Streak</p>
                <p className="text-3xl font-bold">{stats?.user?.streak || 0}</p>
                <p className="text-xs text-slate-300 mt-1">Don't break it! 💪</p>
              </div>
              <div className="bg-white/10 p-3 rounded-full">
                <Zap className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-600 text-white border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Badges Earned</p>
                <p className="text-3xl font-bold">{stats?.badges || 0}</p>
                <p className="text-xs text-green-200 mt-1">Collect them all! 🎖️</p>
              </div>
              <div className="bg-white/10 p-3 rounded-full">
                <Award className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-flow-red" />
              Learning Progress
            </CardTitle>
            <CardDescription className="text-slate-600">
              Track your completion across all lessons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Lessons Completed</span>
                <span className="font-medium">
                  {stats?.progress?.completedLessons || 0} / {stats?.progress?.totalLessons || 0}
                </span>
              </div>
              <Progress 
                value={stats?.progress?.completionPercentage || 0} 
                className="h-3"
              />
              <p className="text-xs text-slate-500 mt-2">
                {stats?.progress?.completionPercentage || 0}% complete
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.progress?.totalExercises || 0}
                </p>
                <p className="text-sm text-slate-600">Total Exercises</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {stats?.progress?.accuracy || 0}%
                </p>
                <p className="text-sm text-slate-600">Accuracy Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-flow-red" />
              Leaderboard
            </CardTitle>
            <CardDescription className="text-slate-600">
              See how you rank
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="text-3xl font-bold text-slate-900 mb-2">
                #{stats?.user?.leaderboardPosition || '-'}
              </div>
              <p className="text-slate-600">Your Position</p>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link href="/achievements">View Full Leaderboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - American Themed */}
      <div className="mb-8 relative">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1e3a5f] to-[#DC2626] bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <span className="text-2xl">🚀</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-slate-100 hover:border-[#DC2626] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/5 to-[#DC2626]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative z-10">
                <Button asChild className={`w-full h-auto p-4 ${action.color} text-white shadow-lg hover:shadow-xl transition-all`}>
                  <Link href={action.href}>
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-3 transform group-hover:scale-110 transition-transform">
                        {action.icon}
                      </div>
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-flow-red" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest learning sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
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
