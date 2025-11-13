
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Mic,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Square,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function SpeakingPracticePage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  
  // Exercise practice state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    fetchExercises();
  }, [difficulty, category]);

  useEffect(() => {
    // Cleanup
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (difficulty !== 'all') params.append('difficulty', difficulty);
      if (category !== 'all') params.append('category', category);
      
      const response = await fetch(`/api/speaking-exercises?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises || []);
      } else {
        toast.error('Failed to load speaking exercises');
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
      const response = await fetch(`/api/speaking-exercises/${exercise.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedExercise(data.exercise);
        setTranscription('');
        setAudioBlob(null);
        setRecordingTime(0);
        setResult(null);
      }
    } catch (error) {
      console.error('Error loading exercise:', error);
      toast.error('Failed to load exercise');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const handleAutoTranscribe = async () => {
    if (!audioBlob) {
      toast.error('No audio recorded');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info('Transcribing your audio... This may take a moment.');
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/admin/transcribe-audio', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setTranscription(data.transcription || '');
        toast.success('Transcription completed! Please review and edit if needed.');
      } else {
        toast.error('Failed to transcribe audio. Please type manually.');
      }
    } catch (error) {
      console.error('Error transcribing:', error);
      toast.error('Error transcribing audio. Please type manually.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedExercise) {
      return;
    }

    // If no transcription and no audio, error
    if (!transcription && !audioBlob) {
      toast.error('Please record your response and provide a transcription');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (audioBlob) {
        formData.append('audio', audioBlob, 'recording.webm');
      }
      formData.append('transcription', transcription);
      formData.append('duration', recordingTime.toString());
      formData.append('autoTranscribe', (!transcription).toString());

      const response = await fetch(`/api/speaking-exercises/${selectedExercise.id}/attempt`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        if (data.transcription && !transcription) {
          setTranscription(data.transcription);
        }
        toast.success(data.completed ? 'Exercise completed!' : 'Good try! Keep practicing.');
      } else {
        toast.error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Error submitting your response');
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
    const targetWords = selectedExercise.targetWords || [];

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
            <Badge className={getDifficultyColor(selectedExercise.difficulty)}>
              {selectedExercise.difficulty}
            </Badge>
            <CardTitle>{selectedExercise.title}</CardTitle>
            <CardDescription>{selectedExercise.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Prompt */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="font-medium mb-2">Your Task:</h3>
              <p className="text-lg">{selectedExercise.prompt}</p>
              {selectedExercise.context && (
                <div className="mt-4 text-sm text-slate-600">
                  <strong>Context:</strong> {selectedExercise.context}
                </div>
              )}
            </div>

            {/* Target Words */}
            {targetWords.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Try to include these words:</h4>
                    <div className="flex flex-wrap gap-2">
                      {targetWords.map((word: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-white">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Duration Guidelines */}
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <Clock className="h-5 w-5" />
              <span>
                Recommended: {selectedExercise.minDuration || 30}s - {selectedExercise.maxDuration || 120}s
              </span>
              {recordingTime > 0 && (
                <span className="ml-auto font-medium text-lg">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex justify-center">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={audioBlob !== null}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                >
                  <Square className="mr-2 h-5 w-5" />
                  Stop Recording
                </Button>
              )}
            </div>

            {/* Transcription */}
            {audioBlob && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Transcription: <span className="text-red-600">*</span>
                  </label>
                  <Button
                    onClick={handleAutoTranscribe}
                    disabled={isSubmitting || !!transcription}
                    size="sm"
                    variant="outline"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Transcribing...
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Auto-Transcribe with AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder="Click 'Auto-Transcribe with AI' or type what you said..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-slate-600">
                  Use AI to automatically transcribe your speech, or type it manually. You can edit the transcription after auto-transcribing.
                </p>
              </div>
            )}

            {/* Submit */}
            {audioBlob && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !transcription}
                className="w-full bg-flow-red hover:bg-red-700"
                size="lg"
              >
                {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Submit Response
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results view
  if (result) {
    const feedback = result.feedback || {};
    
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
                You used {feedback.targetWordsUsed || 0} out of {feedback.totalTargetWords || 0} target words
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
                <p className="text-2xl font-bold">{result.attempt?.duration}s</p>
                <p className="text-sm text-slate-600">Speaking Time</p>
              </div>
            </div>

            {/* Detailed Scores */}
            {(feedback.grammarScore || feedback.vocabularyScore || feedback.fluencyScore || feedback.relevanceScore) && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-3">Detailed Analysis:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {feedback.targetWordScore !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Target Words:</span>
                      <span className="font-medium text-slate-900">{feedback.targetWordScore}%</span>
                    </div>
                  )}
                  {feedback.grammarScore !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Grammar:</span>
                      <span className="font-medium text-slate-900">{feedback.grammarScore}%</span>
                    </div>
                  )}
                  {feedback.vocabularyScore !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Vocabulary:</span>
                      <span className="font-medium text-slate-900">{feedback.vocabularyScore}%</span>
                    </div>
                  )}
                  {feedback.fluencyScore !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Fluency:</span>
                      <span className="font-medium text-slate-900">{feedback.fluencyScore}%</span>
                    </div>
                  )}
                  {feedback.relevanceScore !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Relevance:</span>
                      <span className="font-medium text-slate-900">{feedback.relevanceScore}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Strengths */}
            {feedback.strengths && feedback.strengths.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Your Strengths:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                  {feedback.strengths.map((strength: string, index: number) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-medium text-orange-900 mb-2">Areas for Improvement:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-orange-800">
                  {feedback.areasForImprovement.map((area: string, index: number) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {feedback.suggestions && feedback.suggestions.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Suggestions for improvement:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                  {feedback.suggestions.map((suggestion: string, index: number) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Your Transcription */}
            {result.transcription && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">Your Transcription:</h3>
                <p className="text-sm text-slate-700 italic">"{result.transcription}"</p>
              </div>
            )}

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
          Speaking Practice 🎤
        </h1>
        <p className="text-slate-600">
          Improve your pronunciation and fluency with interactive speaking exercises
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
            <SelectItem value="presentation">Presentation</SelectItem>
            <SelectItem value="storytelling">Storytelling</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {exercises.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mic className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No speaking exercises available
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
            const targetWords = exercise.targetWords || [];
            
            return (
              <Card key={exercise.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(exercise.difficulty)}>
                      {exercise.difficulty}
                    </Badge>
                    <Mic className="h-5 w-5 text-flow-red" />
                  </div>
                  <CardTitle className="text-lg">{exercise.title}</CardTitle>
                  <CardDescription>
                    {exercise.minDuration || 30}s - {exercise.maxDuration || 120}s • {targetWords.length} target words
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {exercise.description}
                    </p>

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
