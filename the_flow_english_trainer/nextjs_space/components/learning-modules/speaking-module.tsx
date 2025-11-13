
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle,
  X,
  Star,
  Play,
  Square,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface SpeakingModuleProps {
  lesson: {
    id: string;
    lessonId: number;
    speakingPrompts: string[];
    sentences: Array<{ sentence: string; translation: string; difficulty: string }>;
    progress: any;
  };
}

export function SpeakingModule({ lesson }: SpeakingModuleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [completedPrompts, setCompletedPrompts] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<'prompts' | 'sentences'>('prompts');
  const [recordingResult, setRecordingResult] = useState<{ text: string; confidence: number } | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [aiEvaluation, setAiEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  const prompts = lesson.speakingPrompts || [];
  const sentences = lesson.sentences || [];
  const currentItems = mode === 'prompts' ? prompts : sentences;
  const currentItem = mode === 'prompts' 
    ? prompts[currentIndex] 
    : sentences[currentIndex]?.sentence;
  const progress = (completedPrompts.size / currentItems.length) * 100;

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const result = event.results[0];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      
      // Capture current values at the time of recording completion
      const currentExpectedText = mode === 'prompts' 
        ? prompts[currentIndex]
        : sentences[currentIndex]?.sentence || '';
      const currentExerciseType = mode === 'prompts' ? 'free_speaking' : 'sentence_practice';
      const currentContext = mode === 'prompts' 
        ? `Speaking prompt: ${prompts[currentIndex]}`
        : `Practice sentence pronunciation`;
      
      setRecordingResult({
        text: transcript,
        confidence: confidence || 0.8
      });
      
      setIsRecording(false);
      
      // Auto-evaluate the result with captured current values
      setTimeout(() => {
        handleEvaluateRecording(transcript, confidence || 0.8, currentExpectedText, currentExerciseType, currentContext);
      }, 1000);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      toast.error('Speech recognition failed. Please try again.');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [mode, currentIndex, prompts, sentences]);

  const startRecording = async () => {
    if (!isSupported) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    try {
      setRecordingResult(null);
      setIsRecording(true);
      recognitionRef.current?.start();
      
      // Also request microphone access for visual feedback
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Stop recording after 10 seconds max
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 10000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  const handleEvaluateRecording = async (
    transcript: string, 
    confidence: number, 
    expectedText?: string,
    exerciseType?: string,
    contextText?: string
  ) => {
    // Use provided values or fall back to current values
    const actualExpectedText = expectedText || (mode === 'prompts' 
      ? currentItem
      : sentences[currentIndex]?.sentence || '');
    const actualExerciseType = exerciseType || (mode === 'prompts' ? 'free_speaking' : 'sentence_practice');
    const actualContext = contextText || (mode === 'prompts' ? `Speaking prompt: ${currentItem}` : `Practice sentence pronunciation`);
    
    setIsEvaluating(true);
    setAiEvaluation(null);
    
    try {
      // Call AI evaluation API
      const response = await fetch('/api/speaking/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userResponse: transcript,
          correctAnswer: actualExpectedText,
          exerciseType: actualExerciseType,
          context: actualContext
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiEvaluation(data.evaluation);
        
        // Auto-complete if score is high enough
        if (data.evaluation.score >= 70) {
          handleMarkComplete();
          toast.success(`Great job! Score: ${data.evaluation.score}/100`);
        } else {
          toast.info(`Score: ${data.evaluation.score}/100 - Keep practicing!`);
        }
      } else {
        // Fallback to simple evaluation
        handleSimpleEvaluation(transcript, confidence, actualExpectedText);
      }
    } catch (error) {
      console.error('Error evaluating:', error);
      // Fallback to simple evaluation
      handleSimpleEvaluation(transcript, confidence, actualExpectedText);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSimpleEvaluation = (transcript: string, confidence: number, expectedText: string) => {
    if (mode === 'sentences' && expectedText) {
      // Compare similarity for sentence practice
      const similarity = calculateSimilarity(transcript.toLowerCase(), expectedText.toLowerCase());
      
      if (similarity > 0.6 || confidence > 0.8) {
        handleMarkComplete();
        toast.success('Great pronunciation!');
      } else {
        toast.info('Good attempt! Try speaking more clearly.');
      }
    } else {
      // For prompts, just check if they spoke (confidence check)
      if (confidence > 0.5 && transcript.length > 5) {
        handleMarkComplete();
        toast.success('Well done!');
      } else {
        toast.info('Try speaking a bit longer and clearer.');
      }
    }
  };

  const calculateSimilarity = (str1: string, str2: string) => {
    const words1 = str1.split(' ').filter(w => w.length > 2);
    const words2 = str2.split(' ').filter(w => w.length > 2);
    
    let matches = 0;
    words1.forEach(word1 => {
      if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
        matches++;
      }
    });
    
    return Math.max(words1.length, words2.length) > 0 
      ? matches / Math.max(words1.length, words2.length)
      : 0;
  };

  const handleNext = () => {
    if (currentIndex < currentItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRecordingResult(null);
      setAiEvaluation(null);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setRecordingResult(null);
      setAiEvaluation(null);
    }
  };

  const handleMarkComplete = () => {
    const newCompleted = new Set(completedPrompts);
    newCompleted.add(currentIndex);
    setCompletedPrompts(newCompleted);
    
    if (newCompleted.size === currentItems.length) {
      toast.success('🎉 Speaking section completed!');
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    } else {
      toast.info('Text-to-speech not supported in this browser');
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Speech Recognition Not Supported
          </h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Your browser doesn't support speech recognition. Please use a modern browser like Chrome or Safari for the speaking exercises.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!prompts.length && !sentences.length) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Mic className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No speaking content available
          </h3>
          <p className="text-slate-600">
            This lesson doesn't have speaking exercises yet.
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
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <CardTitle>Speaking Practice</CardTitle>
              <CardDescription>
                Practice pronunciation and speaking skills
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Button
                variant={mode === 'prompts' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 lg:flex-none"
                onClick={() => {
                  setMode('prompts');
                  setCurrentIndex(0);
                  setRecordingResult(null);
                }}
              >
                Free Speaking ({prompts.length})
              </Button>
              <Button
                variant={mode === 'sentences' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 lg:flex-none"
                onClick={() => {
                  setMode('sentences');
                  setCurrentIndex(0);
                  setRecordingResult(null);
                }}
              >
                Sentence Practice ({sentences.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium">
              {completedPrompts.size} / {currentItems.length} completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Speaking Card */}
      <Card className="min-h-[400px] overflow-visible">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">
                {mode === 'prompts' ? 'Prompt' : 'Sentence'} {currentIndex + 1} of {currentItems.length}
              </span>
              {completedPrompts.has(currentIndex) && (
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              )}
            </div>
            {mode === 'sentences' && sentences[currentIndex] && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speakText(sentences[currentIndex].sentence)}
                className="text-slate-600 hover:text-flow-red"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Item */}
          <div className="text-center space-y-4">
            <div className="p-4 md:p-6 bg-slate-50 rounded-lg">
              <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
                {mode === 'prompts' ? 'Speaking Prompt:' : 'Practice this sentence:'}
              </h3>
              <p className="text-base md:text-lg text-slate-700 break-words">
                {currentItem}
              </p>
              {mode === 'sentences' && sentences[currentIndex]?.translation && (
                <p className="text-sm text-slate-500 mt-2 break-words">
                  Translation: {sentences[currentIndex].translation}
                </p>
              )}
            </div>
          </div>

          {/* Recording Controls */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="lg"
                className={`w-24 h-24 rounded-full ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-flow-red hover:bg-red-700'
                }`}
              >
                {isRecording ? (
                  <Square className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            </div>
            
            <p className="text-sm text-slate-600">
              {isRecording 
                ? 'Recording... Click to stop' 
                : mode === 'prompts'
                  ? 'Click to start speaking freely about this topic'
                  : 'Click to record yourself saying the sentence'
              }
            </p>
          </div>

          {/* Recording Result */}
          {recordingResult && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                <h4 className="font-medium text-blue-900 mb-2 text-sm md:text-base">Você disse:</h4>
                <p className="text-blue-800 mb-2 text-sm md:text-base break-words">"{recordingResult.text}"</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-blue-700">
                      Confiança: {Math.round(recordingResult.confidence * 100)}%
                    </span>
                  </div>
                  {!aiEvaluation && !isEvaluating && (
                    <Button
                      onClick={handleMarkComplete}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marcar Completo
                    </Button>
                  )}
                </div>
              </div>

              {/* AI Evaluation Loading */}
              {isEvaluating && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    <span className="text-purple-800 font-medium">Avaliando com IA...</span>
                  </div>
                </div>
              )}

              {/* AI Evaluation Results */}
              {aiEvaluation && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-3 md:p-5 space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h4 className="font-bold text-purple-900 text-base md:text-lg">🤖 Avaliação da IA</h4>
                    <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-bold text-base md:text-lg ${
                      aiEvaluation.score >= 80 ? 'bg-green-100 text-green-800' :
                      aiEvaluation.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {aiEvaluation.score}/100
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="bg-white rounded-lg p-3 md:p-4">
                    <h5 className="font-semibold text-slate-800 mb-2 text-sm md:text-base">📊 Análise Geral</h5>
                    <p className="text-slate-700 text-sm md:text-base break-words">{aiEvaluation.analysis}</p>
                  </div>

                  {/* Strengths */}
                  {aiEvaluation.strengths && aiEvaluation.strengths.length > 0 && (
                    <div className="bg-white rounded-lg p-3 md:p-4">
                      <h5 className="font-semibold text-green-700 mb-2 text-sm md:text-base">✅ Pontos Fortes</h5>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm md:text-base">
                        {aiEvaluation.strengths.map((strength: string, idx: number) => (
                          <li key={idx} className="break-words">{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {aiEvaluation.improvements && aiEvaluation.improvements.length > 0 && (
                    <div className="bg-white rounded-lg p-3 md:p-4">
                      <h5 className="font-semibold text-orange-700 mb-2 text-sm md:text-base">📈 Áreas para Melhorar</h5>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm md:text-base">
                        {aiEvaluation.improvements.map((improvement: string, idx: number) => (
                          <li key={idx} className="break-words">{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {aiEvaluation.suggestions && aiEvaluation.suggestions.length > 0 && (
                    <div className="bg-white rounded-lg p-3 md:p-4">
                      <h5 className="font-semibold text-blue-700 mb-2 text-sm md:text-base">💡 Sugestões</h5>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm md:text-base">
                        {aiEvaluation.suggestions.map((suggestion: string, idx: number) => (
                          <li key={idx} className="break-words">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pronunciation Errors */}
                  {aiEvaluation.pronunciationErrors && aiEvaluation.pronunciationErrors.length > 0 && (
                    <div className="bg-white rounded-lg p-3 md:p-4">
                      <h5 className="font-semibold text-red-700 mb-2 text-sm md:text-base">🗣️ Erros de Pronúncia</h5>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm md:text-base">
                        {aiEvaluation.pronunciationErrors.map((error: string, idx: number) => (
                          <li key={idx} className="break-words">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Vocabulary Alternatives */}
                  {aiEvaluation.vocabularyAlternatives && aiEvaluation.vocabularyAlternatives.length > 0 && (
                    <div className="bg-white rounded-lg p-3 md:p-4">
                      <h5 className="font-semibold text-purple-700 mb-2 text-sm md:text-base">📚 Alternativas de Vocabulário</h5>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm md:text-base">
                        {aiEvaluation.vocabularyAlternatives.map((alt: string, idx: number) => (
                          <li key={idx} className="break-words">{alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2 pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentIndex === currentItems.length - 1}
              className="flex-1 sm:flex-none"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      {completedPrompts.size === currentItems.length && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="text-center py-6">
            <Star className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Speaking Practice Complete!
            </h3>
            <p className="text-green-700">
              Excellent work! You've completed all speaking exercises.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
