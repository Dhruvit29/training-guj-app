import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLms } from '../context/LmsContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Title from '@/common/components/Title';
import GcPageContainer from '@/common/components/GcPageContainer';
import { PATHS } from '@/router/paths';
import type { Course } from '../types/lms';

const AdminCourses: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useLms();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ title: '', description: '', instructor: '', category: '', thumbnailUrl: '', totalDurationMinutes: 0 });

  const openNew = () => {
    setEditingCourse(null);
    setForm({ title: '', description: '', instructor: '', category: '', thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=340&fit=crop', totalDurationMinutes: 60 });
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({ title: course.title, description: course.description, instructor: course.instructor, category: course.category, thumbnailUrl: course.thumbnailUrl, totalDurationMinutes: course.totalDurationMinutes });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingCourse) {
      dispatch({ type: 'UPDATE_COURSE', course: { ...editingCourse, ...form } });
    } else {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        ...form,
        isPublished: false,
        createdAt: new Date().toISOString().split('T')[0],
      };
      dispatch({ type: 'ADD_COURSE', course: newCourse });
    }
    setDialogOpen(false);
  };

  const handleDelete = (courseId: string) => {
    if (window.confirm('Delete this course and all its content?')) {
      dispatch({ type: 'DELETE_COURSE', courseId });
    }
  };

  const togglePublish = (course: Course) => {
    dispatch({ type: 'UPDATE_COURSE', course: { ...course, isPublished: !course.isPublished } });
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
        <Title titleHeader="Course Management" />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} size="small">
          New Course
        </Button>
      </Box>
      <GcPageContainer noPaper>
        {state.courses.map(course => {
          const sectionCount = state.sections.filter(s => s.courseId === course.id).length;
          const lessonCount = state.sections
            .filter(s => s.courseId === course.id)
            .flatMap(s => state.lessons.filter(l => l.sectionId === s.id)).length;

          return (
            <Card key={course.id} sx={{ mb: 1.5 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    component="img"
                    src={course.thumbnailUrl}
                    alt={course.title}
                    sx={{ width: 110, height: 64, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>{course.title}</Typography>
                      <Chip label={course.isPublished ? 'Published' : 'Draft'} size="small" color={course.isPublished ? 'primary' : 'default'} variant="outlined" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {sectionCount} sections · {lessonCount} lessons · {course.category}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <IconButton size="small" onClick={() => togglePublish(course)} title={course.isPublished ? 'Unpublish' : 'Publish'}>
                      {course.isPublished ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`${PATHS.LMS_ADMIN_COURSES}/${course.id}`)} title="Edit curriculum">
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => openEdit(course)} title="Edit details">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(course.id)} title="Delete">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}

        {state.courses.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MenuBookIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary" gutterBottom>No courses yet</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} sx={{ mt: 2 }}>
              Create your first course
            </Button>
          </Box>
        )}
      </GcPageContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCourse ? 'Edit Course' : 'New Course'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Title" size="small" fullWidth value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <TextField label="Description" size="small" fullWidth multiline rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Instructor" size="small" fullWidth value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} />
            <TextField label="Category" size="small" fullWidth value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          </Box>
          <TextField label="Thumbnail URL" size="small" fullWidth value={form.thumbnailUrl} onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.title.trim()}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminCourses;
