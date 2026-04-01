import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLms } from '@/contexts/LmsContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Title from '@/common/components/Title';
import GcPageContainer from '@/common/components/GcPageContainer';
import type { CourseWithProgress } from '@/types/lms';

const CourseCatalog: React.FC = () => {
  const { getCoursesWithProgress } = useLms();
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<string>('all');

  const courses = getCoursesWithProgress().filter(c => c.isPublished);
  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))];

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.category === filter;
    return matchSearch && matchFilter;
  });

  const enrolled = filtered.filter(c => c.enrolled && c.progressPercent < 100);
  const completed = filtered.filter(c => c.progressPercent === 100);
  const available = filtered.filter(c => !c.enrolled);

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
        <Title titleHeader="Training Center" />
      </Box>
      <GcPageContainer noPaper>
        {/* Search & Filters */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <TextField
            size="small"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ flex: 1, maxWidth: { sm: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <Chip
                key={cat}
                label={cat}
                size="small"
                variant={filter === cat ? 'filled' : 'outlined'}
                color={filter === cat ? 'primary' : 'default'}
                onClick={() => setFilter(cat)}
                sx={{ textTransform: 'capitalize' }}
              />
            ))}
          </Box>
        </Box>

        {/* Continue Learning */}
        {enrolled.length > 0 && (
          <CourseSection title="Continue Learning" icon={<PlayArrowIcon color="primary" />} courses={enrolled} />
        )}

        {/* Available */}
        {available.length > 0 && (
          <CourseSection title="Available Courses" icon={<MenuBookIcon color="primary" />} courses={available} />
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <CourseSection title="Completed" icon={<MenuBookIcon color="disabled" />} courses={completed} />
        )}

        {filtered.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MenuBookIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">No courses found</Typography>
          </Box>
        )}
      </GcPageContainer>
    </>
  );
};

function CourseSection({ title, icon, courses }: { title: string; icon: React.ReactNode; courses: CourseWithProgress[] }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon}
        <Typography variant="h6" fontSize="1.1rem">{title}</Typography>
        <Chip label={courses.length} size="small" variant="outlined" />
      </Box>
      <Grid2 container spacing={2.5}>
        {courses.map(course => (
          <Grid2 key={course.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <CourseCard course={course} />
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}

function CourseCard({ course }: { course: CourseWithProgress }) {
  const navigate = React.useCallback(() => {}, []);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      <CardActionArea component={Link} to={`/training/${course.id}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="160"
            image={course.thumbnailUrl}
            alt={course.title}
            sx={{ objectFit: 'cover' }}
          />
          {course.enrolled && course.progressPercent > 0 && course.progressPercent < 100 && (
            <LinearProgress
              variant="determinate"
              value={course.progressPercent}
              sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 }}
            />
          )}
          {course.progressPercent === 100 && (
            <Chip
              label="Completed"
              size="small"
              color="success"
              sx={{ position: 'absolute', top: 8, right: 8 }}
            />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Chip label={course.category} size="small" variant="outlined" sx={{ mb: 1, fontSize: '0.7rem' }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {course.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {course.instructor}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14 }} /> {course.totalDurationMinutes} min
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MenuBookIcon sx={{ fontSize: 14 }} /> {course.totalLessons} lessons
            </Typography>
          </Box>
          {course.enrolled && course.progressPercent > 0 && course.progressPercent < 100 && (
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{course.completedLessons}/{course.totalLessons} lessons</Typography>
                <Typography variant="caption" color="text.secondary">{course.progressPercent}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={course.progressPercent} sx={{ height: 4, borderRadius: 2 }} />
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default CourseCatalog;
