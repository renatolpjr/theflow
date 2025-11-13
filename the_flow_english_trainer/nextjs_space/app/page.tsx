
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Mic, 
  Headphones, 
  Trophy, 
  Target, 
  Users, 
  Star,
  Zap,
  Award,
  TrendingUp,
  User
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Interactive Vocabulary',
      description: 'Master English words through flashcards, matching games, and contextual exercises'
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: 'Speaking Challenges',
      description: 'Practice pronunciation and fluency with AI-powered speech recognition'
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: 'Listening Exercises',
      description: 'Improve comprehension with audio-based challenges and real conversations'
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: 'Gamification System',
      description: 'Earn points, badges, and achievements as you progress through lessons'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Personalized Learning',
      description: 'Adaptive difficulty levels and progress tracking tailored to your pace'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Progress Analytics',
      description: 'Detailed insights into your learning journey and skill development'
    }
  ];

  const stats = [
    { number: '11+', label: 'Interactive Lessons' },
    { number: '276+', label: 'Vocabulary Items' },
    { number: '130+', label: 'Practice Sentences' },
    { number: '33+', label: 'Dialogues' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-red-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.jpeg"
                  alt="The Flow English Trainer"
                  fill
                  className="object-contain rounded-full"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-flow-navy">The Flow</h1>
                <p className="text-xs text-slate-600">English Trainer</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-slate-600 hover:text-flow-red transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-slate-600 hover:text-flow-red transition-colors">
                How It Works
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" asChild className="text-slate-600 hover:text-flow-red">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-flow-red hover:bg-red-700 text-white shadow-lg">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="container mx-auto max-w-6xl text-center">
          {/* Floating elements */}
          <div className="absolute top-10 left-10 text-4xl floating">📚</div>
          <div className="absolute top-20 right-20 text-4xl floating" style={{animationDelay: '1s'}}>🎯</div>
          <div className="absolute bottom-20 left-20 text-4xl floating" style={{animationDelay: '2s'}}>⭐</div>

          <Badge className="mb-6 bg-flow-navy/10 text-flow-navy hover:bg-flow-navy/20">
            🚀 Gamified English Learning Platform
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Master <span className="text-flow-red">English</span> Through
            <br />
            Interactive <span className="text-flow-navy">Learning</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your English skills with our comprehensive gamified platform featuring 
            speaking challenges, vocabulary exercises, listening practice, and achievement tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button asChild size="lg" className="bg-flow-red hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8">
              <Link href="/auth/signup">
                <Zap className="mr-2 h-5 w-5" />
                Start Learning Free
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-flow-navy text-flow-navy hover:bg-flow-navy hover:text-white px-8">
              <Link href="/auth/login">
                <Users className="mr-2 h-5 w-5" />
                Already a Member?
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-3xl font-bold text-flow-navy mb-2 animate-count-up">
                  {stat.number}
                </div>
                <div className="text-slate-600 font-medium">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to <span className="text-flow-red">Excel</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our comprehensive platform combines proven learning methods with modern gamification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-12 h-12 bg-flow-red/10 rounded-lg flex items-center justify-center mb-4 text-flow-red">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How <span className="text-flow-navy">Learning</span> Works
            </h2>
            <p className="text-xl text-slate-600">
              Simple steps to start your English learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Sign Up & Choose Level',
                description: 'Create your account and select your current English proficiency level',
                icon: <User className="h-8 w-8" />
              },
              {
                step: '2',
                title: 'Start Interactive Lessons',
                description: 'Practice with vocabulary, speaking, and listening exercises tailored to you',
                icon: <BookOpen className="h-8 w-8" />
              },
              {
                step: '3',
                title: 'Earn Rewards & Progress',
                description: 'Collect points, unlock badges, and track your improvement over time',
                icon: <Award className="h-8 w-8" />
              }
            ].map((step, index) => (
              <Card key={index} className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg text-center hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-flow-navy to-flow-red rounded-full flex items-center justify-center mb-6 mx-auto text-white">
                  {step.icon}
                </div>
                <div className="text-sm font-bold text-flow-red mb-2">STEP {step.step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-flow-navy to-flow-red text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <Star className="h-16 w-16 mx-auto mb-6 text-yellow-400" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your English Skills?
          </h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Join thousands of learners who are already improving their English with our gamified platform
          </p>
          <Button size="lg" asChild className="bg-white text-flow-navy hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 px-8">
            <Link href="/auth/signup">
              <Trophy className="mr-2 h-5 w-5" />
              Start Your Journey Today
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo.jpeg"
                  alt="The Flow English Trainer"
                  fill
                  className="object-contain rounded-full"
                />
              </div>
              <div>
                <div className="font-bold">The Flow English Trainer</div>
                <div className="text-sm text-slate-400">Master English with confidence</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              © 2024 The Flow English Trainer. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
