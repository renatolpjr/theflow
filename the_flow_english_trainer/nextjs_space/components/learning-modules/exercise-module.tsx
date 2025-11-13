
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  PenTool,
  CheckCircle,
  X,
  Star,
  RotateCcw,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

interface Exercise {
  type: string;
  instructions: string;
  questions: Array<{
    question: string;
    answer: string | string[];
    word_to_replace?: string;
    alternatives?: string[];
  }>;
}

interface ExerciseModuleProps {
  lesson: {
    id: string;
    lessonId: number;
    exercises: Exercise[];
    progress: any;
  };
}

export function ExerciseModule({ lesson }: ExerciseModuleProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [questionScores, setQuestionScores] = useState<Record<string, boolean>>({});
  const [selectedMultipleChoice, setSelectedMultipleChoice] = useState('');

  const exercises = lesson.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const currentQuestion = currentExercise?.questions[currentQuestionIndex];
  
  const totalQuestions = exercises.reduce((sum, ex) => sum + ex.questions.length, 0);
  const completedQuestions = Object.keys(questionScores).length;
  const progress = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

  useEffect(() => {
    setUserAnswer('');
    setSelectedMultipleChoice('');
    setShowResult(false);
    setIsCorrect(false);
  }, [currentExerciseIndex, currentQuestionIndex]);

  const checkAnswer = () => {
    if (!currentQuestion) return;

    const questionKey = `${currentExerciseIndex}-${currentQuestionIndex}`;
    let userResponse = '';
    let correctAnswer = '';
    let correct = false;

    switch (currentExercise.type) {
      case 'fill_in_blank':
        userResponse = userAnswer.trim().toLowerCase();
        if (Array.isArray(currentQuestion.answer)) {
          correctAnswer = currentQuestion.answer.join(', ');
          correct = currentQuestion.answer.some(ans => 
            userResponse === ans.toLowerCase()
          );
        } else {
          correctAnswer = currentQuestion.answer as string;
          correct = userResponse === (currentQuestion.answer as string).toLowerCase();
        }
        break;
        
      case 'translation':
        userResponse = userAnswer.trim().toLowerCase();
        correctAnswer = Array.isArray(currentQuestion.answer) 
          ? currentQuestion.answer[0].toLowerCase() 
          : (currentQuestion.answer as string).toLowerCase();
        // More lenient checking for translations
        const userWords = userResponse.split(/\s+/);
        const correctWords = correctAnswer.split(/\s+/);
        const matchingWords = userWords.filter(word => 
          correctWords.some(cWord => cWord.includes(word) || word.includes(cWord))
        );
        correct = matchingWords.length >= Math.floor(correctWords.length * 0.6);
        break;
        
      case 'unscramble':
        userResponse = userAnswer.trim().toLowerCase();
        correctAnswer = Array.isArray(currentQuestion.answer) 
          ? currentQuestion.answer[0].toLowerCase()
          : (currentQuestion.answer as string).toLowerCase();
        correct = userResponse === correctAnswer;
        break;
        
      case 'multiple_choice':
        userResponse = selectedMultipleChoice;
        correctAnswer = Array.isArray(currentQuestion.answer) 
          ? currentQuestion.answer[0]
          : currentQuestion.answer as string;
        correct = userResponse === correctAnswer;
        break;
        
      case 'substitution':
        userResponse = userAnswer.trim().toLowerCase();
        correctAnswer = Array.isArray(currentQuestion.answer) 
          ? currentQuestion.answer[0]
          : currentQuestion.answer as string;
        correct = userResponse === correctAnswer.toLowerCase();
        break;
        
      default:
        userResponse = userAnswer.trim().toLowerCase();
        correctAnswer = Array.isArray(currentQuestion.answer) 
          ? currentQuestion.answer[0]
          : currentQuestion.answer as string;
        correct = userResponse === correctAnswer.toLowerCase();
    }

    setIsCorrect(correct);
    setShowResult(true);
    
    // Update scores
    const newScores = { ...questionScores };
    newScores[questionKey] = correct;
    setQuestionScores(newScores);

    if (correct) {
      toast.success('Correct! 🎉');
    } else {
      toast.error('Not quite right. Try again!');
    }
  };

  const handleNext = () => {
    // Move to next question within exercise
    if (currentQuestionIndex < currentExercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } 
    // Move to next exercise
    else if (currentExerciseIndex < exercises.length - 1) {
      const newCompleted = new Set(completedExercises);
      newCompleted.add(currentExerciseIndex);
      setCompletedExercises(newCompleted);
      
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentQuestionIndex(0);
    }
    // All exercises completed
    else {
      const newCompleted = new Set(completedExercises);
      newCompleted.add(currentExerciseIndex);
      setCompletedExercises(newCompleted);
      toast.success('🎉 All exercises completed!');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setCurrentQuestionIndex(exercises[currentExerciseIndex - 1].questions.length - 1);
    }
  };

  const renderExerciseContent = () => {
    if (!currentExercise || !currentQuestion) return null;

    switch (currentExercise.type) {
      case 'fill_in_blank':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">
                Fill in the blank:
              </h4>
              <p className="text-lg text-slate-700">
                {currentQuestion.question.replace(/_+/g, '______')}
              </p>
            </div>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="text-lg p-4"
              disabled={showResult && isCorrect}
              onKeyPress={(e) => e.key === 'Enter' && !showResult && checkAnswer()}
            />
          </div>
        );

      case 'translation':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Translate to English:
              </h4>
              <p className="text-lg text-blue-800">{currentQuestion.question}</p>
            </div>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your translation here..."
              className="text-lg p-4"
              disabled={showResult && isCorrect}
              onKeyPress={(e) => e.key === 'Enter' && !showResult && checkAnswer()}
            />
          </div>
        );

      case 'unscramble':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">
                Unscramble these words:
              </h4>
              <p className="text-lg text-yellow-800 font-mono">
                {currentQuestion.question}
              </p>
            </div>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type the correct sentence..."
              className="text-lg p-4"
              disabled={showResult && isCorrect}
              onKeyPress={(e) => e.key === 'Enter' && !showResult && checkAnswer()}
            />
          </div>
        );

      case 'multiple_choice':
        const correctAnswer = Array.isArray(currentQuestion.answer) 
          ? currentQuestion.answer[0] 
          : currentQuestion.answer;
        const options = [
          correctAnswer,
          ...(currentQuestion.alternatives || [])
        ].sort(() => Math.random() - 0.5);
        
        return (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">
                Choose the correct answer:
              </h4>
              <p className="text-lg text-purple-800">{currentQuestion.question}</p>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedMultipleChoice === option ? "default" : "outline"}
                  className="w-full text-left justify-start p-4 h-auto"
                  onClick={() => setSelectedMultipleChoice(option)}
                  disabled={showResult}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-lg text-slate-700">{currentQuestion.question}</p>
            </div>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="text-lg p-4"
              disabled={showResult && isCorrect}
              onKeyPress={(e) => e.key === 'Enter' && !showResult && checkAnswer()}
            />
          </div>
        );
    }
  };

  if (!exercises.length) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <PenTool className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No exercises available
          </h3>
          <p className="text-slate-600">
            This lesson doesn't have exercises yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const allCompleted = completedExercises.size === exercises.length;
  const questionKey = `${currentExerciseIndex}-${currentQuestionIndex}`;
  const currentQuestionScore = questionScores[questionKey];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Practice</CardTitle>
          <CardDescription>
            Test your understanding with interactive exercises
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium">
              {completedQuestions} / {totalQuestions} questions
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Exercise Card */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {currentExercise?.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </CardTitle>
              <CardDescription>
                {currentExercise?.instructions}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Exercise {currentExerciseIndex + 1} of {exercises.length}
              </Badge>
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {currentExercise?.questions.length}
              </Badge>
            </div>
          </div>
          {currentQuestionScore !== undefined && (
            <div className="flex items-center space-x-2">
              {currentQuestionScore ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ${currentQuestionScore ? 'text-green-600' : 'text-red-600'}`}>
                {currentQuestionScore ? 'Correct' : 'Incorrect'}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Exercise Content */}
          {renderExerciseContent()}

          {/* Result Display */}
          {showResult && (
            <div className={`p-4 rounded-lg border ${
              isCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <X className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? 'Correct!' : 'Not quite right'}
                </span>
              </div>
              
              {!isCorrect && (
                <div className="space-y-2">
                  <p className="text-sm text-red-700">
                    <strong>Correct answer:</strong> {
                      Array.isArray(currentQuestion?.answer) 
                        ? currentQuestion.answer.join(' / ')
                        : (currentQuestion?.answer as string)
                    }
                  </p>
                  <Button
                    onClick={() => {
                      setShowResult(false);
                      setUserAnswer('');
                      setSelectedMultipleChoice('');
                    }}
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              onClick={handlePrevious}
              disabled={currentExerciseIndex === 0 && currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>

            <div className="flex space-x-3">
              {!showResult ? (
                <Button
                  onClick={checkAnswer}
                  disabled={
                    currentExercise?.type === 'multiple_choice' 
                      ? !selectedMultipleChoice 
                      : !userAnswer.trim()
                  }
                  className="bg-flow-red hover:bg-red-700"
                >
                  Check Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={allCompleted}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {currentQuestionIndex === currentExercise.questions.length - 1 && 
                   currentExerciseIndex === exercises.length - 1
                    ? 'Complete' 
                    : 'Continue'
                  }
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      {allCompleted && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="text-center py-6">
            <Star className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              All Exercises Complete!
            </h3>
            <p className="text-green-700 mb-4">
              Outstanding work! You've completed all exercises in this lesson.
            </p>
            <div className="text-sm text-green-600">
              Score: {Object.values(questionScores).filter(Boolean).length} / {totalQuestions} correct
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
