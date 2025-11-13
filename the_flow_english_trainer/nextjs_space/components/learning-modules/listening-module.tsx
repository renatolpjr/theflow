
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Headphones,
  Volume2,
  CheckCircle,
  X,
  Star,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface Dialogue {
  context: string;
  conversation: Array<{
    speaker: string;
    text: string;
  }>;
}

interface Sentence {
  sentence: string;
  translation: string;
  difficulty: string;
}

interface ListeningModuleProps {
  lesson: {
    id: string;
    lessonId: number;
    dialogues: Dialogue[];
    sentences: Sentence[];
    progress: any;
  };
}

export function ListeningModule({ lesson }: ListeningModuleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<'sentences' | 'dialogues'>('sentences');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  const sentences = lesson.sentences || [];
  const dialogues = lesson.dialogues || [];
  const currentItems = mode === 'sentences' ? sentences : dialogues;
  const progress = (completedItems.size / currentItems.length) * 100;

  // Generate comprehension questions
  const generateQuestion = () => {
    if (mode === 'sentences' && sentences[currentIndex]) {
      const sentence = sentences[currentIndex];
      const questions = [
        `What is the main idea of this sentence?`,
        `What does this sentence mean?`,
        `Can you summarize what you heard?`,
        `What is being described in this sentence?`
      ];
      return questions[Math.floor(Math.random() * questions.length)];
    } else if (mode === 'dialogues' && dialogues[currentIndex]) {
      const dialogue = dialogues[currentIndex];
      const questions = [
        `What is the context of this conversation?`,
        `Who is speaking in this dialogue?`,
        `What are they talking about?`,
        `What happens in this conversation?`
      ];
      return questions[Math.floor(Math.random() * questions.length)];
    }
    return '';
  };

  useEffect(() => {
    setCurrentQuestion(generateQuestion());
    setUserAnswer('');
    setShowAnswer(false);
    setShowTranscript(false);
  }, [currentIndex, mode]);

  const speakContent = () => {
    if ('speechSynthesis' in window) {
      // Stop any currently playing speech
      speechSynthesis.cancel();
      
      let textToSpeak = '';
      
      if (mode === 'sentences' && sentences[currentIndex]) {
        textToSpeak = sentences[currentIndex].sentence;
      } else if (mode === 'dialogues' && dialogues[currentIndex]) {
        const dialogue = dialogues[currentIndex];
        textToSpeak = dialogue.conversation
          .map(line => `${line.speaker}: ${line.text}`)
          .join('. ');
      }
      
      if (textToSpeak) {
        setIsPlaying(true);
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        utterance.onerror = () => {
          setIsPlaying(false);
          toast.error('Error playing audio');
        };
        
        speechSynthesis.speak(utterance);
      }
    } else {
      toast.info('Text-to-speech not supported in this browser');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < currentItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMarkComplete = () => {
    const newCompleted = new Set(completedItems);
    newCompleted.add(currentIndex);
    setCompletedItems(newCompleted);
    
    if (newCompleted.size === currentItems.length) {
      toast.success('🎉 Listening section completed!');
    }
  };

  const handleAnswerSubmit = () => {
    if (userAnswer.trim().length > 10) {
      handleMarkComplete();
      setShowAnswer(true);
      toast.success('Good comprehension!');
    } else {
      toast.error('Please provide a more detailed answer');
    }
  };

  if (!sentences.length && !dialogues.length) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Headphones className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No listening content available
          </h3>
          <p className="text-slate-600">
            This lesson doesn't have listening exercises yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress and Mode Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Listening Practice</CardTitle>
              <CardDescription>
                Improve your listening comprehension skills
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={mode === 'sentences' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setMode('sentences');
                  setCurrentIndex(0);
                }}
              >
                Sentences ({sentences.length})
              </Button>
              <Button
                variant={mode === 'dialogues' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setMode('dialogues');
                  setCurrentIndex(0);
                }}
              >
                Dialogues ({dialogues.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium">
              {completedItems.size} / {currentItems.length} completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Listening Exercise Card */}
      <Card className="min-h-[500px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">
                {mode === 'sentences' ? 'Sentence' : 'Dialogue'} {currentIndex + 1} of {currentItems.length}
              </span>
              {completedItems.has(currentIndex) && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
            {mode === 'dialogues' && dialogues[currentIndex] && (
              <Badge variant="outline">
                {dialogues[currentIndex].context}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Audio Control */}
          <div className="text-center space-y-4">
            <div className="bg-slate-50 p-8 rounded-lg">
              <Headphones className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Listen carefully to the audio
              </h3>
              
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={isPlaying ? stopSpeaking : speakContent}
                  size="lg"
                  className="bg-flow-red hover:bg-red-700"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Play Audio
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={speakContent}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Replay
                </Button>
              </div>
            </div>

            {/* Show Transcript Toggle */}
            <Button
              onClick={() => setShowTranscript(!showTranscript)}
              variant="ghost"
              size="sm"
            >
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </Button>
          </div>

          {/* Transcript */}
          {showTranscript && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Transcript:</h4>
                {mode === 'sentences' && sentences[currentIndex] ? (
                  <div className="space-y-2">
                    <p className="text-yellow-900">{sentences[currentIndex].sentence}</p>
                    <p className="text-sm text-yellow-700">
                      Translation: {sentences[currentIndex].translation}
                    </p>
                  </div>
                ) : mode === 'dialogues' && dialogues[currentIndex] ? (
                  <div className="space-y-2">
                    {dialogues[currentIndex].conversation.map((line, index) => (
                      <p key={index} className="text-yellow-900">
                        <strong>{line.speaker}:</strong> {line.text}
                      </p>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Comprehension Question */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Comprehension Question:</h4>
              <p className="text-blue-800">{currentQuestion}</p>
            </div>

            <textarea
              className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-flow-red focus:border-transparent"
              rows={4}
              placeholder="Type your answer here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={showAnswer}
            />

            {!showAnswer ? (
              <div className="flex space-x-3">
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={userAnswer.trim().length < 10}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Answer
                </Button>
                <Button
                  onClick={() => {
                    handleMarkComplete();
                    setShowAnswer(true);
                  }}
                  variant="outline"
                >
                  Skip Question
                </Button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Your Answer:</h4>
                <p className="text-green-800 mb-3">{userAnswer}</p>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Well done!</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="outline"
            >
              Previous
            </Button>

            <div className="text-sm text-slate-600">
              {currentIndex + 1} / {currentItems.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={currentIndex === currentItems.length - 1}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      {completedItems.size === currentItems.length && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="text-center py-6">
            <Star className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Listening Practice Complete!
            </h3>
            <p className="text-green-700">
              Excellent listening skills! You've completed all {currentItems.length} exercises.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
