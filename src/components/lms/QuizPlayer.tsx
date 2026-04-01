import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import QuizIcon from '@mui/icons-material/Quiz';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { QuizQuestion } from '@/types/lms';

interface QuizPlayerProps {
  questions: QuizQuestion[];
  onComplete: () => void;
  isAlreadyCompleted: boolean;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ questions, onComplete, isAlreadyCompleted }) => {
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
    if (questions.every(q => answers[q.id] === q.correctOptionId)) onComplete();
  };

  const handleRetry = () => { setAnswers({}); setSubmitted(false); setCurrentQuestion(0); };
  const allAnswered = questions.every(q => answers[q.id]);
  const q = questions[currentQuestion];

  if (isAlreadyCompleted && !submitted) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>Quiz Completed!</Typography>
        <Typography color="text.secondary" gutterBottom>You've already passed this quiz.</Typography>
        <Button variant="outlined" onClick={() => setSubmitted(false)}>Retake Quiz</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      {/* Progress */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Chip icon={<QuizIcon />} label={`Question ${currentQuestion + 1} of ${questions.length}`} size="small" variant="outlined" />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {questions.map((_, i) => (
            <Box
              key={i}
              onClick={() => setCurrentQuestion(i)}
              sx={{
                width: 10, height: 10, borderRadius: '50%', cursor: 'pointer',
                bgcolor: i === currentQuestion ? 'primary.main'
                  : answers[questions[i].id]
                    ? submitted
                      ? answers[questions[i].id] === questions[i].correctOptionId ? 'success.main' : 'error.main'
                      : 'primary.light'
                    : 'grey.300',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Question */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>{q.question}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {q.options.map(opt => {
              const isSelected = answers[q.id] === opt.id;
              const isCorrect = opt.id === q.correctOptionId;
              let borderColor = 'divider';
              let bgcolor = 'transparent';
              if (submitted) {
                if (isCorrect) { borderColor = 'success.main'; bgcolor = 'success.main'; }
                else if (isSelected && !isCorrect) { borderColor = 'error.main'; bgcolor = 'error.main'; }
              } else if (isSelected) { borderColor = 'primary.main'; bgcolor = 'primary.main'; }

              return (
                <Box
                  key={opt.id}
                  onClick={() => handleSelect(q.id, opt.id)}
                  sx={{
                    p: 2, borderRadius: 1, border: 2, borderColor,
                    bgcolor: bgcolor === 'transparent' ? 'transparent' : `${bgcolor}`,
                    ...(bgcolor !== 'transparent' && !submitted ? { bgcolor: 'primary.main', color: '#fff', '& .option-indicator': { borderColor: '#fff' } } : {}),
                    ...(submitted && isCorrect ? { bgcolor: 'rgba(34,160,107,0.08)' } : {}),
                    ...(submitted && isSelected && !isCorrect ? { bgcolor: 'rgba(229,57,53,0.08)' } : {}),
                    ...(isSelected && !submitted ? { bgcolor: 'rgba(26,55,100,0.08)' } : {}),
                    cursor: submitted ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    '&:hover': !submitted ? { borderColor: 'primary.main', bgcolor: 'action.hover' } : {},
                    opacity: submitted && !isCorrect && !isSelected ? 0.5 : 1,
                  }}
                >
                  <Box className="option-indicator" sx={{
                    width: 20, height: 20, borderRadius: '50%', border: 2,
                    borderColor: isSelected ? 'primary.main' : 'grey.400',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {isSelected && !submitted && <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />}
                    {submitted && isCorrect && <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />}
                    {submitted && isSelected && !isCorrect && <CancelIcon color="error" sx={{ fontSize: 18 }} />}
                  </Box>
                  <Typography variant="body2">{opt.text}</Typography>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}>Previous</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {currentQuestion < questions.length - 1 ? (
            <Button variant="contained" endIcon={<ChevronRightIcon />} onClick={() => setCurrentQuestion(currentQuestion + 1)}>Next</Button>
          ) : !submitted ? (
            <Button variant="contained" onClick={handleSubmit} disabled={!allAnswered}>Submit Quiz</Button>
          ) : null}
        </Box>
      </Box>

      {/* Results */}
      {submitted && (
        <Card sx={{ mt: 3, border: 2, borderColor: allCorrect ? 'success.main' : 'error.main' }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            {allCorrect ? (
              <>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>All Correct! 🎉</Typography>
                <Typography variant="body2" color="text.secondary">You've passed this quiz and can proceed.</Typography>
              </>
            ) : (
              <>
                <CancelIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>Not quite right</Typography>
                <Typography variant="body2" color="text.secondary">
                  You got {questions.filter(q => answers[q.id] === q.correctOptionId).length} out of {questions.length} correct.
                </Typography>
                <Button variant="outlined" onClick={handleRetry} sx={{ mt: 2 }}>Retry Quiz</Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default QuizPlayer;
