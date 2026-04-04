import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLms } from '../context/LmsContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Title from '@/common/components/Title';
import GcPageContainer from '@/common/components/GcPageContainer';
import { PATHS } from '@/router/paths';
import type { SectionWithLessons, LessonWithStatus } from '../types/lms';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { getCourseWithProgress, getSectionsWithLessons, getNextLesson, enroll } = useLms();

  const course = getCourseWithProgress(courseId!);
  const sections = getSectionsWithLessons(courseId!);
  const next = getNextLesson(courseId!);

  if (!course) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Box textAlign="center">
          <Typography color="text.secondary" gutterBottom>Course not found</Typography>
          <Button onClick={() => navigate(PATHS.LMS_CATALOG)}>Back to catalog</Button>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(PATHS.LMS_CATALOG)} size="small" sx={{ mb: 1 }}>
          Back to courses
        </Button>
      </Box>

      <Paper elevation={0} sx={{ mx: { xs: 2, sm: 3 }, p: { xs: 2, sm: 3 }, mb: 2, bgcolor: 'primary.main', color: '#fff', borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Chip label={course.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', mb: 1.5 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>{course.title}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mb: 2, lineHeight: 1.6 }}>{course.description}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 2 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8 }}>
                <PersonIcon fontSize="small" /> {course.instructor}
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8 }}>
                <AccessTimeIcon fontSize="small" /> {course.totalDurationMinutes} min
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8 }}>
                <MenuBookIcon fontSize="small" /> {course.totalLessons} lessons
              </Typography>
            </Box>

            {course.enrolled ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {course.completedLessons}/{course.totalLessons} completed
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>{course.progressPercent}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={course.progressPercent}
                  sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#fff' } }}
                />
                {next && (
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => navigate(`${PATHS.LMS_CATALOG}/${courseId}/${next.lessonId}`)}
                    sx={{ mt: 2, bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                  >
                    {course.progressPercent > 0 ? 'Continue Learning' : 'Start Course'}
                  </Button>
                )}
                {course.progressPercent === 100 && (
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 2, alignItems: 'center' }}>
                    <Chip label="Course Completed! 🎉" color="success" size="small" />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EmojiEventsIcon />}
                      onClick={() => navigate(`${PATHS.LMS_CATALOG}/${courseId}/certificate`)}
                      sx={{ borderColor: '#fff', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      View Certificate
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={() => enroll(course.id)}
                sx={{ mt: 1, bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
              >
                Enroll & Start
              </Button>
            )}
          </Grid>
          <Grid item xs={12} lg={4} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Box
              component="img"
              src={course.thumbnailUrl}
              alt={course.title}
              sx={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 2 }}
            />
          </Grid>
        </Grid>
      </Paper>

      <GcPageContainer noPaper>
        <Typography variant="h6" gutterBottom>Course Curriculum</Typography>
        {sections.map((section, sIdx) => (
          <CurriculumSection key={section.id} section={section} sectionIndex={sIdx} courseId={courseId!} enrolled={course.enrolled} />
        ))}
      </GcPageContainer>
    </>
  );
};

function CurriculumSection({ section, sectionIndex, courseId, enrolled }: {
  section: SectionWithLessons; sectionIndex: number; courseId: string; enrolled: boolean;
}) {
  const completedCount = section.lessons.filter(l => l.status === 'completed').length;
  const totalMinutes = section.lessons.reduce((sum, l) => sum + l.durationMinutes, 0);

  return (
    <Accordion
      defaultExpanded={sectionIndex === 0 || section.lessons.some(l => l.status === 'in-progress' || l.status === 'available')}
      sx={{ mb: 1, '&:before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          {completedCount === section.lessons.length && section.lessons.length > 0 && (
            <CheckCircleIcon color="success" fontSize="small" />
          )}
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Section {sectionIndex + 1}: {section.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {completedCount}/{section.lessons.length} lessons · {totalMinutes} min
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <List dense disablePadding>
          {section.lessons.map((lesson, lIdx) => (
            <LessonRow key={lesson.id} lesson={lesson} index={lIdx} courseId={courseId} enrolled={enrolled} />
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}

function LessonRow({ lesson, index, courseId, enrolled }: {
  lesson: LessonWithStatus; index: number; courseId: string; enrolled: boolean;
}) {
  const isClickable = enrolled && (lesson.status === 'available' || lesson.status === 'in-progress' || lesson.status === 'completed');

  const icon = lesson.type === 'quiz'
    ? lesson.status === 'completed'
      ? <CheckCircleIcon color="success" fontSize="small" />
      : lesson.status === 'locked'
        ? <LockIcon fontSize="small" color="disabled" />
        : <QuizIcon color="primary" fontSize="small" />
    : {
        locked: <LockIcon fontSize="small" color="disabled" />,
        available: <RadioButtonUncheckedIcon color="primary" fontSize="small" />,
        'in-progress': <PlayArrowIcon color="primary" fontSize="small" />,
        completed: <CheckCircleIcon color="success" fontSize="small" />,
      }[lesson.status];

  return (
    <ListItemButton
      component={isClickable ? Link : 'div'}
      {...(isClickable ? { to: `${PATHS.LMS_CATALOG}/${courseId}/${lesson.id}` } : {})}
      disabled={lesson.status === 'locked'}
      sx={{
        pl: 3,
        ...(lesson.status === 'in-progress' ? { bgcolor: 'action.selected' } : {}),
      }}
    >
      <ListItemIcon sx={{ minWidth: 32 }}>{icon}</ListItemIcon>
      <ListItemText
        primary={`${index + 1}. ${lesson.title}`}
        primaryTypographyProps={{ variant: 'body2', color: lesson.status === 'completed' ? 'text.secondary' : 'text.primary' }}
      />
      {lesson.type === 'quiz' ? (
        <Typography variant="caption" color="text.secondary">Quiz</Typography>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
          <AccessTimeIcon sx={{ fontSize: 12 }} /> {lesson.durationMinutes}m
        </Typography>
      )}
    </ListItemButton>
  );
}

export default CourseDetail;
