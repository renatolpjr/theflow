'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Clock, CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const [challenge, setChallenge] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenge();
  }, [params.id]);

  useEffect(() => {
    if (challenge && challenge.timeLimit && !result) {
      setTimeRemaining(challenge.timeLimit);
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [challenge, result]);

  const fetchChallenge = async () => {
    try {
      const response = await fetch(`/api/challenges/${params.id}`);
      const data = await response.json();
      setChallenge(data.challenge);
      setAnswers(new Array(data.challenge.questions.length).fill(''));
    } catch (error) {
      console.error('Error fetching challenge:', error);
      toast.error('Erro ao carregar desafio');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < challenge.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/challenges/${params.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          timeSpent: challenge.timeLimit ? challenge.timeLimit - timeRemaining : 0
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.passed) {
        toast.success(`Parabéns! Você ganhou ${data.pointsEarned} pontos!`);
      } else {
        toast.error('Não foi dessa vez. Tente novamente!');
      }
    } catch (error) {
      console.error('Error submitting challenge:', error);
      toast.error('Erro ao enviar respostas');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Desafio não encontrado</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {result.passed ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-3xl">
              {result.passed ? '🎉 Parabéns!' : '😔 Tente Novamente'}
            </CardTitle>
            <CardDescription>
              {result.passed
                ? 'Você completou o desafio com sucesso!'
                : 'Você não atingiu a pontuação mínima.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{result.score.toFixed(1)}%</p>
                <p className="text-sm text-slate-600">Pontuação</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-amber-500">{result.pointsEarned}</p>
                <p className="text-sm text-slate-600">Pontos Ganhos</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-green-500">{result.correctCount}</p>
                <p className="text-sm text-slate-600">Corretas</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{result.totalQuestions}</p>
                <p className="text-sm text-slate-600">Total</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => router.push('/challenges')} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button onClick={() => window.location.reload()} className="flex-1">
              Tentar Novamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const question = challenge.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / challenge.questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/challenges')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        {challenge.timeLimit && (
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="text-lg font-semibold">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge className={
              challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' :
              challenge.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              'bg-red-100 text-red-800 border-red-200'
            }>{challenge.difficulty}</Badge>
            <span className="text-sm text-slate-600">
              Questão {currentQuestion + 1} de {challenge.questions.length}
            </span>
          </div>
          <CardTitle className="text-2xl">{challenge.title}</CardTitle>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
            
            {question.type === 'multiple_choice' && (
              <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswerChange}>
                <div className="space-y-3">
                  {question.options.map((option: string, index: number) => (
                    <div 
                      key={index} 
                      className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        answers[currentQuestion] === option 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-300 bg-white hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} className="border-slate-400" />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-slate-900">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
            
            {question.type === 'fill_blank' && (
              <Input
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Digite sua resposta..."
                className="text-lg border-2 border-slate-300 text-slate-900 bg-white"
              />
            )}
            
            {question.type === 'true_false' && (
              <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswerChange}>
                <div className="space-y-3">
                  <div 
                    className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      answers[currentQuestion] === 'true' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-300 bg-white hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <RadioGroupItem value="true" id="true" className="border-slate-400" />
                    <Label htmlFor="true" className="flex-1 cursor-pointer text-slate-900">Verdadeiro</Label>
                  </div>
                  <div 
                    className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      answers[currentQuestion] === 'false' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-300 bg-white hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <RadioGroupItem value="false" id="false" className="border-slate-400" />
                    <Label htmlFor="false" className="flex-1 cursor-pointer text-slate-900">Falso</Label>
                  </div>
                </div>
              </RadioGroup>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Anterior
          </Button>
          
          <div className="flex gap-2">
            {currentQuestion === challenge.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    Finalizar
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Próxima
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
