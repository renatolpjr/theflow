
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Headphones,
  Volume2,
  Pause,
  Play,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function ListeningPracticePage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  
  // Exercise practice state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchExercises();
  }, [difficulty, category]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (difficulty !== 'all') params.append('difficulty', difficulty);
      if (category !== 'all') params.append('category', category);
      
      const response = await fetch(`/api/listening-exercises?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises || []);
      } else {
        toast.error('Failed to load listening exercises');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast.error('Error loading exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExercise = async (exercise: any) => {
    try {
      const response = await fetch(`/api/listening-exercises/${exercise.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedExercise(data.exercise);
        setCurrentQuestion(0);
        setAnswers([]);
        setResult(null);
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error('Error loading exercise:', error);
      toast.error('Failed to load exercise');
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!selectedExercise) return;
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/listening-exercises/${selectedExercise.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, timeSpent })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast.success(data.completed ? 'Exercise completed!' : 'Good try! Keep practicing.');
      } else {
        toast.error('Failed to submit answers');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Error submitting answers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Exercise practice view
  if (selectedExercise && !result) {
    const questions = selectedExercise.questions || [];
    const question = questions[currentQuestion];

    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={() => setSelectedExercise(null)}
            variant="outline"
          >
            ← Back to Exercises
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
                {selectedExercise.difficulty}
              </Badge>
              <span className="text-sm text-slate-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <CardTitle>{selectedExercise.title}</CardTitle>
            <CardDescription>{selectedExercise.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Audio Player */}
            {selectedExercise.audioDownloadUrl ? (
              <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-flow-blue" />
                    <span className="font-medium">Listen to the audio</span>
                  </div>
                  <Button
                    onClick={togglePlayPause}
                    size="sm"
                    className="bg-flow-blue hover:bg-blue-700"
                  >
                    {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                </div>
                <audio
                  ref={audioRef}
                  src={selectedExercise.audioDownloadUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">Audio Not Available</h4>
                    <p className="text-sm text-yellow-800">
                      This exercise doesn't have an audio file yet. Please read the text below and answer the questions based on your comprehension.
                    </p>
                    {selectedExercise.audioText && (
                      <div className="mt-3 p-3 bg-white rounded border border-yellow-200">
                        <p className="text-sm text-slate-700">{selectedExercise.audioText}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Question */}
            {question && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{question.question}</h3>
                
                {question.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {question.options?.map((option: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          answers[currentQuestion] === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-300 bg-white hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-slate-900">{option}</span>
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'true_false' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAnswerSelect('True')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        answers[currentQuestion] === 'True'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-300 bg-white hover:border-blue-300'
                      }`}
                    >
                      True
                    </button>
                    <button
                      onClick={() => handleAnswerSelect('False')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        answers[currentQuestion] === 'False'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-300 bg-white hover:border-blue-300'
                      }`}
                    >
                      False
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                variant="outline"
              >
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || answers.length !== questions.length}
                  className="bg-flow-red hover:bg-red-700"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Answers
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  disabled={currentQuestion === questions.length - 1}
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results view
  if (result) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Exercise Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              {result.completed ? (
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              )}
              <h2 className="text-3xl font-bold mb-2">{result.score}%</h2>
              <p className="text-slate-600">
                {result.correctAnswers} out of {result.totalQuestions} correct
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{result.pointsEarned}</p>
                <p className="text-sm text-slate-600">Points Earned</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{Math.floor(result.attempt?.timeSpent / 60)}m</p>
                <p className="text-sm text-slate-600">Time Spent</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setResult(null);
                  setSelectedExercise(null);
                  fetchExercises();
                }}
                className="flex-1"
              >
                Back to Exercises
              </Button>
              <Button
                onClick={() => {
                  setResult(null);
                  handleSelectExercise(selectedExercise);
                }}
                variant="outline"
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exercise list view
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Listening Practice 🎧
        </h1>
        <p className="text-slate-600">
          Enhance your listening comprehension with audio exercises
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="conversation">Conversation</SelectItem>
            <SelectItem value="news">News</SelectItem>
            <SelectItem value="story">Story</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {exercises.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Headphones className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No listening exercises available
            </h3>
            <p className="text-slate-600">
              Check back later for new exercises or adjust your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => {
            const lastAttempt = exercise.attempts?.[0];
            const questions = exercise.questions || [];
            
            return (
              <Card key={exercise.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(exercise.difficulty)}>
                      {exercise.difficulty}
                    </Badge>
                    <Headphones className="h-5 w-5 text-flow-red" />
                  </div>
                  <CardTitle className="text-lg">{exercise.title}</CardTitle>
                  <CardDescription>
                    {questions.length} questions • {exercise.duration || 0}s audio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {exercise.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Volume2 className="h-4 w-4" />
                      <span>Voice: {exercise.voice || 'Default'}</span>
                    </div>

                    {lastAttempt && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Best Score:</span>
                          <span className="font-medium">{lastAttempt.score}%</span>
                        </div>
                        {lastAttempt.completed && (
                          <div className="flex items-center text-green-600 text-xs mt-1">
                            <Trophy className="h-3 w-3 mr-1" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button
                      onClick={() => handleSelectExercise(exercise)}
                      className="w-full bg-flow-red hover:bg-red-700"
                    >
                      Start Exercise
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
