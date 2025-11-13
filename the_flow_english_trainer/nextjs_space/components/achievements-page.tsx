
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Star,
  Award,
  Crown,
  Target,
  TrendingUp,
  Medal
} from 'lucide-react';
import { toast } from 'sonner';

export function AchievementsPage() {
  const [userStats, setUserStats] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<Set<string>>(new Set());
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, badgesResponse, leaderboardResponse] = await Promise.all([
          fetch('/api/user/stats'),
          fetch('/api/badges'),
          fetch('/api/leaderboard')
        ]);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setUserStats(statsData);
        }

        // For now, we'll create mock badges and leaderboard data since the API endpoints might not exist
        const mockBadges = [
          {
            id: '1',
            name: 'First Steps',
            description: 'Complete your first lesson',
            icon: '🎯',
            category: 'progress',
            points: 50,
            rarity: 'common',
            requirement: { type: 'lessons_completed', count: 1 }
          },
          {
            id: '2',
            name: 'Quick Learner',
            description: 'Complete 5 lessons',
            icon: '⚡',
            category: 'progress',
            points: 200,
            rarity: 'common',
            requirement: { type: 'lessons_completed', count: 5 }
          },
          {
            id: '3',
            name: 'Vocabulary Master',
            description: 'Complete 50 vocabulary exercises',
            icon: '📚',
            category: 'vocabulary',
            points: 300,
            rarity: 'rare',
            requirement: { type: 'vocabulary_exercises', count: 50 }
          },
          {
            id: '4',
            name: 'Speaking Star',
            description: 'Complete 20 speaking challenges',
            icon: '🎤',
            category: 'speaking',
            points: 250,
            rarity: 'rare',
            requirement: { type: 'speaking_exercises', count: 20 }
          },
          {
            id: '5',
            name: 'Perfect Score',
            description: 'Get 100% on any lesson',
            icon: '⭐',
            category: 'achievement',
            points: 100,
            rarity: 'rare',
            requirement: { type: 'perfect_score', count: 1 }
          },
          {
            id: '6',
            name: 'Week Warrior',
            description: 'Practice 7 days in a row',
            icon: '🔥',
            category: 'streak',
            points: 150,
            rarity: 'rare',
            requirement: { type: 'daily_streak', count: 7 }
          }
        ];

        setBadges(mockBadges);

        // Simulate earned badges based on user stats
        const earned = new Set<string>();
        if (userStats?.progress?.completedLessons >= 1) earned.add('1');
        if (userStats?.progress?.completedLessons >= 5) earned.add('2');
        if (userStats?.user?.streak >= 7) earned.add('6');
        setUserBadges(earned);

        // Mock leaderboard
        const mockLeaderboard = [
          { rank: 1, name: 'Alex Johnson', points: 2450, badges: 8 },
          { rank: 2, name: 'Sarah Chen', points: 2180, badges: 7 },
          { rank: 3, name: 'Mike Rodriguez', points: 1950, badges: 6 },
          { rank: userStats?.user?.leaderboardPosition || 4, name: userStats?.user?.name || 'You', points: userStats?.user?.totalPoints || 0, badges: userStats?.badges || 0 },
        ];
        setLeaderboard(mockLeaderboard);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load achievements data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userStats?.user?.leaderboardPosition, userStats?.user?.name, userStats?.user?.totalPoints, userStats?.badges, userStats?.progress?.completedLessons, userStats?.user?.streak]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Achievements & Leaderboard 🏆
        </h1>
        <p className="text-slate-600">
          Track your progress and compete with other learners
        </p>
      </div>

      {/* User Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Your Rank</p>
                <p className="text-3xl font-bold">
                  #{userStats?.user?.leaderboardPosition || '-'}
                </p>
              </div>
              <Crown className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Points</p>
                <p className="text-3xl font-bold">
                  {userStats?.user?.totalPoints?.toLocaleString() || 0}
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Badges Earned</p>
                <p className="text-3xl font-bold">
                  {userBadges.size}
                </p>
              </div>
              <Award className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Badges Section */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-flow-red" />
                Badges & Achievements
              </CardTitle>
              <CardDescription>
                Unlock badges by completing challenges and reaching milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {badges.map((badge) => {
                  const isEarned = userBadges.has(badge.id);
                  
                  return (
                    <div 
                      key={badge.id} 
                      className={`p-4 border rounded-lg transition-all ${
                        isEarned 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{badge.icon}</div>
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {badge.name}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {badge.description}
                            </p>
                          </div>
                        </div>
                        {isEarned && (
                          <Medal className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={getRarityColor(badge.rarity)}>
                          {badge.rarity}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            {badge.points} points
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-flow-red" />
                Leaderboard
              </CardTitle>
              <CardDescription>
                See how you rank against other learners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((user, index) => {
                  const isCurrentUser = user.name === userStats?.user?.name;
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        isCurrentUser 
                          ? 'bg-blue-50 border-2 border-blue-200' 
                          : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          user.rank === 1 ? 'bg-yellow-500 text-white' :
                          user.rank === 2 ? 'bg-gray-400 text-white' :
                          user.rank === 3 ? 'bg-amber-600 text-white' :
                          'bg-slate-300 text-slate-700'
                        }`}>
                          {user.rank}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {user.name}
                            {isCurrentUser && (
                              <Badge className="ml-2 bg-blue-100 text-blue-800">
                                You
                              </Badge>
                            )}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {user.badges} badge{user.badges !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          {user.points.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-500">points</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Next Level Progress */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-flow-red" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">
                    Level {userStats?.user?.level || 1}
                  </span>
                  <span className="text-sm text-slate-500">
                    {userStats?.user?.totalPoints || 0} / {((userStats?.user?.level || 1) + 1) * 500} XP
                  </span>
                </div>
                <Progress 
                  value={((userStats?.user?.totalPoints || 0) % 500) / 5} 
                  className="h-3"
                />
                <p className="text-xs text-slate-500">
                  {Math.max(0, ((userStats?.user?.level || 1) + 1) * 500 - (userStats?.user?.totalPoints || 0))} XP until next level
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
