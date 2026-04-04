import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VideocamIcon from '@mui/icons-material/Videocam';
import QuizIcon from '@mui/icons-material/Quiz';
import Title from '@/common/components/Title';
import GcPageContainer from '@/common/components/GcPageContainer';
import { PATHS } from '@/router/paths';
import type { Section, Lesson, QuizQuestion } from '../types/lms';

const AdminCurriculum: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useLms();

  const course = state.courses.find(c => c.id === courseId);
  const sections = state.sections.filter(s => s.courseId === courseId).sort((a, b) => a.sortOrder - b.sortOrder);

  const [sectionDialog, setSectionDialog] = useState(false);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');

  const [lessonDialog, setLessonDialog] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [lessonSectionId, setLessonSectionId] = useState('');
  const [lessonForm, setLessonForm] = useState<{
    title: string; description: string; type: 'video' | 'quiz';
    videoUrl: string; durationMinutes: number; quizQuestions: QuizQuestion[];
  }>({ title: '', description: '', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 10, quizQuestions: [] });

  if (!course) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Typography color="text.secondary">Course not found</Typography>
      </Box>
    );
  }

  const openNewSection = () => { setEditSection(null); setSectionTitle(''); setSectionDialog(true); };
  const openEditSection = (sec: Section) => { setEditSection(sec); setSectionTitle(sec.title); setSectionDialog(true); };
  const saveSection = () => {
    if (!sectionTitle.trim()) return;
    if (editSection) {
      dispatch({ type: 'UPDATE_SECTION', section: { ...editSection, title: sectionTitle } });
    } else {
      dispatch({ type: 'ADD_SECTION', section: { id: `sec-${Date.now()}`, courseId: courseId!, title: sectionTitle, sortOrder: sections.length + 1 } });
    }
    setSectionDialog(false);
  };

  const openNewLesson = (sectionId: string) => {
    setEditLesson(null);
    setLessonSectionId(sectionId);
    setLessonForm({ title: '', description: '', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 10, quizQuestions: [] });
    setLessonDialog(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditLesson(lesson);
    setLessonSectionId(lesson.sectionId);
    setLessonForm({ title: lesson.title, description: lesson.description, type: lesson.type, videoUrl: lesson.videoUrl, durationMinutes: lesson.durationMinutes, quizQuestions: lesson.quizQuestions ?? [] });
    setLessonDialog(true);
  };

  const saveLesson = () => {
    if (!lessonForm.title.trim()) return;
    const sectionLessons = state.lessons.filter(l => l.sectionId === lessonSectionId);
    const lessonData: Omit<Lesson, 'id' | 'sortOrder'> = {
      sectionId: lessonSectionId, title: lessonForm.title, description: lessonForm.description,
      type: lessonForm.type, videoUrl: lessonForm.type === 'video' ? lessonForm.videoUrl : '',
      durationMinutes: lessonForm.durationMinutes,
      ...(lessonForm.type === 'quiz' ? { quizQuestions: lessonForm.quizQuestions } : {}),
    };
    if (editLesson) {
      dispatch({ type: 'UPDATE_LESSON', lesson: { ...editLesson, ...lessonData } });
    } else {
      dispatch({ type: 'ADD_LESSON', lesson: { id: `les-${Date.now()}`, sortOrder: sectionLessons.length + 1, ...lessonData } });
    }
    setLessonDialog(false);
  };

  const addQuestion = () => {
    const qId = `q-${Date.now()}`;
    setLessonForm(f => ({
      ...f, quizQuestions: [...f.quizQuestions, { id: qId, question: '', options: [{ id: `${qId}-a`, text: '' }, { id: `${qId}-b`, text: '' }], correctOptionId: '' }],
    }));
  };

  const updateQuestion = (qIdx: number, field: string, value: string) => {
    setLessonForm(f => ({ ...f, quizQuestions: f.quizQuestions.map((q, i) => i === qIdx ? { ...q, [field]: value } : q) }));
  };

  const removeQuestion = (qIdx: number) => {
    setLessonForm(f => ({ ...f, quizQuestions: f.quizQuestions.filter((_, i) => i !== qIdx) }));
  };

  const addOption = (qIdx: number) => {
    setLessonForm(f => ({
      ...f, quizQuestions: f.quizQuestions.map((q, i) => i === qIdx
        ? { ...q, options: [...q.options, { id: `${q.id}-${String.fromCharCode(97 + q.options.length)}`, text: '' }] } : q),
    }));
  };

  const updateOption = (qIdx: number, oIdx: number, text: string) => {
    setLessonForm(f => ({
      ...f, quizQuestions: f.quizQuestions.map((q, i) => i === qIdx
        ? { ...q, options: q.options.map((o, j) => j === oIdx ? { ...o, text } : o) } : q),
    }));
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setLessonForm(f => ({
      ...f, quizQuestions: f.quizQuestions.map((q, i) => {
        if (i !== qIdx) return q;
        const newOptions = q.options.filter((_, j) => j !== oIdx);
        return { ...q, options: newOptions, correctOptionId: newOptions.some(o => o.id === q.correctOptionId) ? q.correctOptionId : '' };
      }),
    }));
  };

  const setCorrectOption = (qIdx: number, optionId: string) => {
    setLessonForm(f => ({ ...f, quizQuestions: f.quizQuestions.map((q, i) => i === qIdx ? { ...q, correctOptionId: optionId } : q) }));
  };

  const moveSection = (sec: Section, direction: 'up' | 'down') => {
    const ids = sections.map(s => s.id);
    const idx = ids.indexOf(sec.id);
    if (direction === 'up' && idx > 0) [ids[idx], ids[idx - 1]] = [ids[idx - 1], ids[idx]];
    else if (direction === 'down' && idx < ids.length - 1) [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    dispatch({ type: 'REORDER_SECTIONS', courseId: courseId!, sectionIds: ids });
  };

  const moveLesson = (lesson: Lesson, direction: 'up' | 'down') => {
    const sectionLessons = state.lessons.filter(l => l.sectionId === lesson.sectionId).sort((a, b) => a.sortOrder - b.sortOrder);
    const ids = sectionLessons.map(l => l.id);
    const idx = ids.indexOf(lesson.id);
    if (direction === 'up' && idx > 0) [ids[idx], ids[idx - 1]] = [ids[idx - 1], ids[idx]];
    else if (direction === 'down' && idx < ids.length - 1) [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    dispatch({ type: 'REORDER_LESSONS', sectionId: lesson.sectionId, lessonIds: ids });
  };

  const isQuizValid = lessonForm.type !== 'quiz' || (
    lessonForm.quizQuestions.length > 0 &&
    lessonForm.quizQuestions.every(q => q.question.trim() && q.options.length >= 2 && q.options.every(o => o.text.trim()) && q.correctOptionId)
  );

  return (
    <>
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(PATHS.LMS_ADMIN_COURSES)} size="small">Back</Button>
          <Box>
            <Title titleHeader={course.title} />
            <Typography variant="caption" color="text.secondary">Curriculum Builder</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNewSection} size="small">Add Section</Button>
      </Box>

      <GcPageContainer noPaper>
        {sections.map((section, sIdx) => {
          const sectionLessons = state.lessons.filter(l => l.sectionId === section.id).sort((a, b) => a.sortOrder - b.sortOrder);
          return (
            <Accordion key={section.id} defaultExpanded sx={{ mb: 1, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <IconButton size="small" disabled={sIdx === 0} onClick={e => { e.stopPropagation(); moveSection(section, 'up'); }}><ArrowUpwardIcon sx={{ fontSize: 14 }} /></IconButton>
                    <IconButton size="small" disabled={sIdx === sections.length - 1} onClick={e => { e.stopPropagation(); moveSection(section, 'down'); }}><ArrowDownwardIcon sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>Section {sIdx + 1}: {section.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{sectionLessons.length} lessons</Typography>
                  </Box>
                  <Box onClick={e => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => openEditSection(section)}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                    <IconButton size="small" color="error" onClick={() => dispatch({ type: 'DELETE_SECTION', sectionId: section.id })}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {sectionLessons.map((lesson, lIdx) => (
                  <Box key={lesson.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, mb: 0.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <IconButton size="small" disabled={lIdx === 0} onClick={() => moveLesson(lesson, 'up')}><ArrowUpwardIcon sx={{ fontSize: 12 }} /></IconButton>
                      <IconButton size="small" disabled={lIdx === sectionLessons.length - 1} onClick={() => moveLesson(lesson, 'down')}><ArrowDownwardIcon sx={{ fontSize: 12 }} /></IconButton>
                    </Box>
                    {lesson.type === 'quiz' ? <QuizIcon color="primary" fontSize="small" /> : <VideocamIcon fontSize="small" color="action" />}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>{lesson.title}</Typography>
                        {lesson.type === 'quiz' && <Chip label="Quiz" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {lesson.type === 'quiz' ? `${lesson.quizQuestions?.length ?? 0} questions` : `${lesson.durationMinutes} min`}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => openEditLesson(lesson)}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                    <IconButton size="small" color="error" onClick={() => dispatch({ type: 'DELETE_LESSON', lessonId: lesson.id })}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                ))}
                <Button variant="outlined" size="small" fullWidth startIcon={<AddIcon />} onClick={() => openNewLesson(section.id)} sx={{ mt: 1 }}>
                  Add Lesson
                </Button>
              </AccordionDetails>
            </Accordion>
          );
        })}

        {sections.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary" gutterBottom>No sections yet. Add your first section to start building the curriculum.</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openNewSection} sx={{ mt: 2 }}>Add Section</Button>
          </Box>
        )}
      </GcPageContainer>

      <Dialog open={sectionDialog} onClose={() => setSectionDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editSection ? 'Edit Section' : 'New Section'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField label="Title" size="small" fullWidth value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} placeholder="e.g., Introduction" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSectionDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveSection} disabled={!sectionTitle.trim()}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={lessonDialog} onClose={() => setLessonDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editLesson ? 'Edit Lesson' : 'New Lesson'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Lesson Type</InputLabel>
            <Select label="Lesson Type" value={lessonForm.type} onChange={e => setLessonForm(f => ({ ...f, type: e.target.value as 'video' | 'quiz' }))}>
              <MenuItem value="video"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><VideocamIcon fontSize="small" /> Video</Box></MenuItem>
              <MenuItem value="quiz"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><QuizIcon fontSize="small" /> Quiz</Box></MenuItem>
            </Select>
          </FormControl>
          <TextField label="Title" size="small" fullWidth value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} />
          <TextField label="Description" size="small" fullWidth multiline rows={2} value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))} />

          {lessonForm.type === 'video' ? (
            <>
              <TextField label="Video URL" size="small" fullWidth value={lessonForm.videoUrl} onChange={e => setLessonForm(f => ({ ...f, videoUrl: e.target.value }))} />
              <TextField label="Duration (minutes)" size="small" type="number" fullWidth value={lessonForm.durationMinutes} onChange={e => setLessonForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) || 0 }))} />
            </>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>Quiz Questions</Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addQuestion}>Add Question</Button>
              </Box>

              {lessonForm.quizQuestions.map((q, qIdx) => (
                <Card key={q.id} variant="outlined" sx={{ mb: 2, borderStyle: 'dashed' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
                      <TextField
                        label={`Question ${qIdx + 1}`}
                        size="small"
                        fullWidth
                        value={q.question}
                        onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                        placeholder="Enter your question..."
                      />
                      <IconButton size="small" color="error" onClick={() => removeQuestion(qIdx)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Options (select the correct answer)</Typography>
                    {q.options.map((opt, oIdx) => (
                      <Box key={opt.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                        <Radio
                          size="small"
                          checked={q.correctOptionId === opt.id}
                          onChange={() => setCorrectOption(qIdx, opt.id)}
                          color="success"
                        />
                        <TextField
                          size="small"
                          fullWidth
                          value={opt.text}
                          onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        />
                        {q.options.length > 2 && (
                          <IconButton size="small" color="error" onClick={() => removeOption(qIdx, oIdx)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                        )}
                      </Box>
                    ))}
                    {q.options.length < 6 && (
                      <Button size="small" onClick={() => addOption(qIdx)} startIcon={<AddIcon />} sx={{ fontSize: '0.75rem' }}>Add Option</Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              {lessonForm.quizQuestions.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                  No questions yet. Click "Add Question" to start.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLessonDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveLesson} disabled={!lessonForm.title.trim() || !isQuizValid}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminCurriculum;
