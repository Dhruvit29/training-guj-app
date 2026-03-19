import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, HelpCircle, ChevronRight } from 'lucide-react';
import type { QuizQuestion } from '@/types/lms';

interface QuizPlayerProps {
  questions: QuizQuestion[];
  onComplete: () => void;
  isAlreadyCompleted: boolean;
  className?: string;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({
  questions,
  onComplete,
  isAlreadyCompleted,
  className,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const allCorrect = useMemo(() => {
    if (!submitted) return false;
    return questions.every(q => answers[q.id] === q.correctOptionId);
  }, [submitted, questions, answers]);

  const handleSelect = (questionId: string, optionId: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correct = questions.every(q => answers[q.id] === q.correctOptionId);
    if (correct) {
      onComplete();
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentQuestion(0);
  };

  const allAnswered = questions.every(q => answers[q.id]);
  const q = questions[currentQuestion];

  if (isAlreadyCompleted && !submitted) {
    return (
      <div className={cn('p-8 text-center space-y-4', className)}>
        <CheckCircle2 className="w-16 h-16 text-[hsl(var(--success))] mx-auto" />
        <h3 className="text-xl font-semibold text-foreground">Quiz Completed!</h3>
        <p className="text-muted-foreground">You've already passed this quiz.</p>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Retake Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('p-6 max-w-2xl mx-auto space-y-6', className)}>
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="gap-1">
          <HelpCircle className="w-3 h-3" />
          Question {currentQuestion + 1} of {questions.length}
        </Badge>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-colors cursor-pointer',
                i === currentQuestion
                  ? 'bg-primary'
                  : answers[questions[i].id]
                    ? submitted
                      ? answers[questions[i].id] === questions[i].correctOptionId
                        ? 'bg-[hsl(var(--success))]'
                        : 'bg-destructive'
                      : 'bg-primary/40'
                    : 'bg-muted-foreground/20'
              )}
              onClick={() => setCurrentQuestion(i)}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">{q.question}</h3>
          <div className="space-y-2">
            {q.options.map(opt => {
              const isSelected = answers[q.id] === opt.id;
              const isCorrect = opt.id === q.correctOptionId;
              let optionStyle = 'border-border hover:border-primary/50 hover:bg-primary/5';
              if (submitted) {
                if (isCorrect) optionStyle = 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/10';
                else if (isSelected && !isCorrect) optionStyle = 'border-destructive bg-destructive/10';
                else optionStyle = 'border-border opacity-60';
              } else if (isSelected) {
                optionStyle = 'border-primary bg-primary/10';
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(q.id, opt.id)}
                  disabled={submitted}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3',
                    optionStyle,
                    !submitted && 'cursor-pointer'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                    isSelected ? 'border-primary' : 'border-muted-foreground/30'
                  )}>
                    {isSelected && !submitted && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />}
                    {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive" />}
                  </div>
                  <span className="text-sm text-foreground">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : !submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="gap-1"
            >
              Submit Quiz
            </Button>
          ) : null}
        </div>
      </div>

      {/* Results */}
      {submitted && (
        <Card className={cn(
          'border-2',
          allCorrect ? 'border-[hsl(var(--success))]' : 'border-destructive'
        )}>
          <CardContent className="p-6 text-center space-y-3">
            {allCorrect ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-[hsl(var(--success))] mx-auto" />
                <h3 className="text-lg font-semibold text-foreground">All Correct! 🎉</h3>
                <p className="text-sm text-muted-foreground">You've passed this quiz and can proceed to the next lesson.</p>
              </>
            ) : (
              <>
                <XCircle className="w-12 h-12 text-destructive mx-auto" />
                <h3 className="text-lg font-semibold text-foreground">Not quite right</h3>
                <p className="text-sm text-muted-foreground">
                  You got {questions.filter(q => answers[q.id] === q.correctOptionId).length} out of {questions.length} correct.
                  Review the answers above and try again.
                </p>
                <Button onClick={handleRetry} variant="outline" className="mt-2">
                  Retry Quiz
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizPlayer;
