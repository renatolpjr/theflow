
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  RotateCcw,
  Volume2,
  CheckCircle,
  X,
  ArrowRight,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface VocabularyItem {
  word: string;
  definition: string;
  translation_pt: string;
  part_of_speech: string;
}

interface VocabularyModuleProps {
  lesson: {
    id: string;
    lessonId: number;
    vocabulary: VocabularyItem[];
    progress: any;
  };
}

export function VocabularyModule({ lesson }: VocabularyModuleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<'flashcard' | 'quiz'>('flashcard');
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const vocabulary = lesson.vocabulary || [];
  const currentWord = vocabulary[currentIndex];
  const progress = (completedWords.size / vocabulary.length) * 100;

  // Generate quiz options
  const generateQuizOptions = () => {
    if (!currentWord || vocabulary.length < 4) return [];
    
    const correctAnswer = currentWord.definition;
    const otherOptions = vocabulary
      .filter((_, i) => i !== currentIndex)
      .map(item => item.definition)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [correctAnswer, ...otherOptions].sort(() => Math.random() - 0.5);
    return options;
  };

  useEffect(() => {
    if (mode === 'quiz') {
      setQuizAnswers(generateQuizOptions());
      setSelectedAnswer('');
    }
  }, [currentIndex, mode]);

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setSelectedAnswer('');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setSelectedAnswer('');
    }
  };

  const handleMarkComplete = () => {
    const newCompleted = new Set(completedWords);
    newCompleted.add(currentIndex);
    setCompletedWords(newCompleted);
    
    if (newCompleted.size === vocabulary.length) {
      toast.success('🎉 Vocabulary section completed!');
    }
  };

  const handleQuizAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === currentWord?.definition;
    
    if (isCorrect) {
      handleMarkComplete();
      toast.success('Correct!');
    } else {
      toast.error('Try again!');
    }
    
    setTimeout(() => {
      if (isCorrect && currentIndex < vocabulary.length - 1) {
        handleNext();
      }
    }, 1500);
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast.info('Speech synthesis not supported in this browser');
    }
  };

  if (!vocabulary || vocabulary.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No vocabulary available
          </h3>
          <p className="text-slate-600">
            This lesson doesn't have vocabulary items yet.
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
              <CardTitle>Vocabulary Practice</CardTitle>
              <CardDescription>
                Learn {vocabulary.length} new words
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={mode === 'flashcard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('flashcard')}
              >
                Flashcards
              </Button>
              <Button
                variant={mode === 'quiz' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('quiz')}
              >
                Quiz
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium">
              {completedWords.size} / {vocabulary.length} words
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Vocabulary Card */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">
                Word {currentIndex + 1} of {vocabulary.length}
              </span>
              {completedWords.has(currentIndex) && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speakWord(currentWord?.word || '')}
              className="text-slate-600 hover:text-flow-red"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {mode === 'flashcard' ? (
            /* Flashcard Mode */
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-slate-900">
                  {currentWord?.word}
                </h2>
                <Badge className="text-sm bg-blue-600 text-white border-blue-700 hover:bg-blue-700">
                  {currentWord?.part_of_speech}
                </Badge>
              </div>

              {showAnswer ? (
                <div className="space-y-4 p-6 bg-slate-50 rounded-lg">
                  <div className="text-lg text-slate-700">
                    <strong>Definition:</strong> {currentWord?.definition}
                  </div>
                  <div className="text-lg text-slate-700">
                    <strong>Translation:</strong> {currentWord?.translation_pt}
                  </div>
                </div>
              ) : (
                <div className="py-12">
                  <Button
                    onClick={() => setShowAnswer(true)}
                    className="bg-flow-red hover:bg-red-700"
                  >
                    Show Definition
                  </Button>
                </div>
              )}

              {showAnswer && (
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      setShowAnswer(false);
                      handleNext();
                    }}
                    variant="outline"
                    disabled={currentIndex === vocabulary.length - 1}
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={() => {
                      handleMarkComplete();
                      setShowAnswer(false);
                      if (currentIndex < vocabulary.length - 1) {
                        handleNext();
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Got it!
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Mode */
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  What does "{currentWord?.word}" mean?
                </h3>
                <Badge className="bg-blue-600 text-white border-blue-700 hover:bg-blue-700">{currentWord?.part_of_speech}</Badge>
              </div>

              <div className="grid gap-3">
                {quizAnswers.map((answer, index) => {
                  const isSelected = selectedAnswer === answer;
                  const isCorrect = answer === currentWord?.definition;
                  const showResult = selectedAnswer !== '';
                  
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className={`h-auto p-4 text-left justify-start ${
                        showResult
                          ? isCorrect
                            ? 'bg-green-100 border-green-500 text-green-800'
                            : isSelected
                            ? 'bg-red-100 border-red-500 text-red-800'
                            : 'opacity-60'
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => !selectedAnswer && handleQuizAnswer(answer)}
                      disabled={selectedAnswer !== ''}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{answer}</span>
                        {showResult && isCorrect && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {showResult && !isCorrect && isSelected && (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {selectedAnswer && (
                <div className="text-center pt-4">
                  <p className="text-sm text-slate-600 mb-2">
                    Translation: {currentWord?.translation_pt}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
        >
          Previous Word
        </Button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">
            {currentIndex + 1} / {vocabulary.length}
          </span>
        </div>

        <Button
          onClick={handleNext}
          disabled={currentIndex === vocabulary.length - 1}
        >
          Next Word
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Completion Status */}
      {completedWords.size === vocabulary.length && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="text-center py-6">
            <Star className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Vocabulary Complete!
            </h3>
            <p className="text-green-700">
              Great job! You've learned all {vocabulary.length} words in this lesson.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
