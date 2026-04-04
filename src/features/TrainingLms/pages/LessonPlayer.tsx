import React, { useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLms } from '../context/LmsContext';
import RestrictedVideoPlayer from '../components/RestrictedVideoPlayer';
import QuizPlayer from '../components/QuizPlayer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { PATHS } from '@/router/paths';
import type { LessonWithStatus } from '../types/lms';

const LessonPlayer: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { getCourseWithProgress, getSectionsWithLessons, getAllLessonsOrdered, state, updateProgress, markComplete } = useLms();

  const course = getCourseWithProgress(courseId!);
  const sections = getSectionsWithLessons(courseId!);
  const allLessons = getAllLessonsOrdered(courseId!);
  const currentLesson = allLessons.find(l => l.id === lessonId);
  const currentIdx = allLessons.findIndex(l => l.id === lessonId);
  const progress = state.userProgress[lessonId!];
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  const isCompleted = progress?.completed ?? false;

  const handleProgress = useCallback((seconds: number) => {
    if (!currentLesson) return;
    updateProgress(lessonId!, seconds, currentLesson.durationMinutes);
  }, [updateProgress, lessonId, currentLesson]);

  const handleComplete = useCallback(() => {
    markComplete(lessonId!);
  }, [markComplete, lessonId]);

  if (!course || !currentLesson) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Box textAlign="center">
          <Typography color="text.secondary" gutterBottom>Lesson not found</Typography>
          <Button onClick={() => navigate(PATHS.LMS_CATALOG)}>Back to catalog</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 48px)' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate(`${PATHS.LMS_CATALOG}/${courseId}`)}>
            Back
          </Button>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap>{course.title}</Typography>
            <Typography variant="caption" color="text.secondary">Lesson {currentIdx + 1} of {allLessons.length}</Typography>
          </Box>
        </Box>

        {currentLesson.type === 'quiz' && currentLesson.quizQuestions ? (
          <QuizPlayer
            questions={currentLesson.quizQuestions}
            onComplete={handleComplete}
            isAlreadyCompleted={isCompleted}
          />
        ) : (
          <Box sx={{ bgcolor: '#000' }}>
            <RestrictedVideoPlayer
              videoUrl={currentLesson.videoUrl}
              durationMinutes={currentLesson.durationMinutes}
              maxWatchedSeconds={progress?.maxWatchedSeconds ?? 0}
              onProgress={handleProgress}
              onComplete={handleComplete}
            />
          </Box>
        )}

        <Box sx={{ p: 3, maxWidth: 900 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Typography variant="h5" fontWeight={700}>{currentLesson.title}</Typography>
            {currentLesson.type === 'quiz' && <Chip icon={<QuizIcon />} label="Quiz" size="small" variant="outlined" />}
            {isCompleted && <Chip icon={<CheckCircleIcon />} label="Completed" size="small" color="success" />}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{currentLesson.description}</Typography>

          {isCompleted && nextLesson && (
            <Paper variant="outlined" sx={{ mt: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'action.hover' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>Up Next</Typography>
                <Typography variant="body2" color="text.secondary">{nextLesson.title}</Typography>
              </Box>
              <Button variant="contained" endIcon={<ChevronRightIcon />} onClick={() => navigate(`${PATHS.LMS_CATALOG}/${courseId}/${nextLesson.id}`)}>
                Next Lesson
              </Button>
            </Paper>
          )}

          {isCompleted && !nextLesson && (
            <Paper variant="outlined" sx={{ mt: 3, p: 3, textAlign: 'center', bgcolor: 'success.main', color: '#fff', border: 'none' }}>
              <Typography variant="h6" fontWeight={600}>🎉 Course Complete!</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>You've finished all lessons in this course.</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate(PATHS.LMS_CATALOG)} sx={{ borderColor: '#fff', color: '#fff' }}>
                  Back to Training Center
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EmojiEventsIcon />}
                  onClick={() => navigate(`${PATHS.LMS_CATALOG}/${courseId}/certificate`)}
                  sx={{ bgcolor: '#fff', color: 'success.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                >
                  View Certificate
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      <Box sx={{ width: 300, borderLeft: 1, borderColor: 'divider', bgcolor: 'background.paper', display: { xs: 'none', lg: 'flex' }, flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight={600}>Course Content</Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {sections.map((section) => (
            <Box key={section.id}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ px: 2, py: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {section.title}
              </Typography>
              <List dense disablePadding>
                {section.lessons.map((lesson) => (
                  <SidebarLesson key={lesson.id} lesson={lesson} courseId={courseId!} isCurrent={lesson.id === lessonId} />
                ))}
              </List>
              <Divider />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

function SidebarLesson({ lesson, courseId, isCurrent }: {
  lesson: LessonWithStatus; courseId: string; isCurrent: boolean;
}) {
  const isClickable = lesson.status !== 'locked';
  const icon = lesson.type === 'quiz'
    ? lesson.status === 'completed'
      ? <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
      : lesson.status === 'locked'
        ? <LockIcon sx={{ fontSize: 16 }} color="disabled" />
        : <QuizIcon color="primary" sx={{ fontSize: 16 }} />
    : {
        locked: <LockIcon sx={{ fontSize: 16 }} color="disabled" />,
        available: <RadioButtonUncheckedIcon color="primary" sx={{ fontSize: 16 }} />,
        'in-progress': <PlayArrowIcon color="primary" sx={{ fontSize: 16 }} />,
        completed: <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />,
      }[lesson.status];

  return (
    <ListItemButton
      component={isClickable && !isCurrent ? Link : 'div'}
      {...(isClickable && !isCurrent ? { to: `${PATHS.LMS_CATALOG}/${courseId}/${lesson.id}` } : {})}
      disabled={lesson.status === 'locked'}
      selected={isCurrent}
      dense
      sx={{ py: 0.75 }}
    >
      <ListItemIcon sx={{ minWidth: 28 }}>{icon}</ListItemIcon>
      <ListItemText
        primary={lesson.title}
        primaryTypographyProps={{
          variant: 'caption',
          fontWeight: isCurrent ? 600 : 400,
          noWrap: true,
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
        {lesson.type === 'quiz' ? 'Quiz' : `${lesson.durationMinutes}m`}
      </Typography>
    </ListItemButton>
  );
}

export default LessonPlayer;
