import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLms } from '@/contexts/LmsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, Plus, Pencil, Trash2, ChevronDown,
  ArrowUp, ArrowDown, Video, HelpCircle, CheckCircle2,
} from 'lucide-react';
import type { Section, Lesson, QuizQuestion, QuizOption } from '@/types/lms';

const AdminCurriculum: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useLms();

  const course = state.courses.find(c => c.id === courseId);
  const sections = state.sections
    .filter(s => s.courseId === courseId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const [sectionDialog, setSectionDialog] = useState(false);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');

  const [lessonDialog, setLessonDialog] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [lessonSectionId, setLessonSectionId] = useState('');
  const [lessonForm, setLessonForm] = useState<{
    title: string;
    description: string;
    type: 'video' | 'quiz';
    videoUrl: string;
    durationMinutes: number;
    quizQuestions: QuizQuestion[];
  }>({
    title: '', description: '', type: 'video',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    durationMinutes: 10, quizQuestions: [],
  });

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    );
  }

  // --- Section handlers ---
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

  // --- Lesson handlers ---
  const openNewLesson = (sectionId: string) => {
    setEditLesson(null);
    setLessonSectionId(sectionId);
    setLessonForm({ title: '', description: '', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 10, quizQuestions: [] });
    setLessonDialog(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditLesson(lesson);
    setLessonSectionId(lesson.sectionId);
    setLessonForm({
      title: lesson.title, description: lesson.description,
      type: lesson.type, videoUrl: lesson.videoUrl,
      durationMinutes: lesson.durationMinutes,
      quizQuestions: lesson.quizQuestions ?? [],
    });
    setLessonDialog(true);
  };

  const saveLesson = () => {
    if (!lessonForm.title.trim()) return;
    const sectionLessons = state.lessons.filter(l => l.sectionId === lessonSectionId);
    const lessonData: Omit<Lesson, 'id' | 'sortOrder'> = {
      sectionId: lessonSectionId,
      title: lessonForm.title,
      description: lessonForm.description,
      type: lessonForm.type,
      videoUrl: lessonForm.type === 'video' ? lessonForm.videoUrl : '',
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

  // --- Quiz question helpers ---
  const addQuestion = () => {
    const qId = `q-${Date.now()}`;
    setLessonForm(f => ({
      ...f,
      quizQuestions: [...f.quizQuestions, {
        id: qId, question: '',
        options: [
          { id: `${qId}-a`, text: '' },
          { id: `${qId}-b`, text: '' },
        ],
        correctOptionId: '',
      }],
    }));
  };

  const updateQuestion = (qIdx: number, field: string, value: string) => {
    setLessonForm(f => ({
      ...f,
      quizQuestions: f.quizQuestions.map((q, i) => i === qIdx ? { ...q, [field]: value } : q),
    }));
  };

  const removeQuestion = (qIdx: number) => {
    setLessonForm(f => ({ ...f, quizQuestions: f.quizQuestions.filter((_, i) => i !== qIdx) }));
  };

  const addOption = (qIdx: number) => {
    setLessonForm(f => ({
      ...f,
      quizQuestions: f.quizQuestions.map((q, i) => i === qIdx
        ? { ...q, options: [...q.options, { id: `${q.id}-${String.fromCharCode(97 + q.options.length)}`, text: '' }] }
        : q),
    }));
  };

  const updateOption = (qIdx: number, oIdx: number, text: string) => {
    setLessonForm(f => ({
      ...f,
      quizQuestions: f.quizQuestions.map((q, i) => i === qIdx
        ? { ...q, options: q.options.map((o, j) => j === oIdx ? { ...o, text } : o) }
        : q),
    }));
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setLessonForm(f => ({
      ...f,
      quizQuestions: f.quizQuestions.map((q, i) => {
        if (i !== qIdx) return q;
        const newOptions = q.options.filter((_, j) => j !== oIdx);
        const correctStillExists = newOptions.some(o => o.id === q.correctOptionId);
        return { ...q, options: newOptions, correctOptionId: correctStillExists ? q.correctOptionId : '' };
      }),
    }));
  };

  const setCorrectOption = (qIdx: number, optionId: string) => {
    setLessonForm(f => ({
      ...f,
      quizQuestions: f.quizQuestions.map((q, i) => i === qIdx ? { ...q, correctOptionId: optionId } : q),
    }));
  };

  // --- Reorder ---
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
    <div className="min-h-full bg-background">
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/training/admin')} className="gap-2 -ml-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{course.title}</h1>
                <p className="text-xs text-muted-foreground">Curriculum Builder</p>
              </div>
            </div>
            <Button onClick={openNewSection} className="gap-2"><Plus className="w-4 h-4" /> Add Section</Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {sections.map((section, sIdx) => {
          const sectionLessons = state.lessons.filter(l => l.sectionId === section.id).sort((a, b) => a.sortOrder - b.sortOrder);
          return (
            <Collapsible key={section.id} defaultOpen>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={e => { e.stopPropagation(); moveSection(section, 'up'); }} disabled={sIdx === 0}><ArrowUp className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={e => { e.stopPropagation(); moveSection(section, 'down'); }} disabled={sIdx === sections.length - 1}><ArrowDown className="w-3 h-3" /></Button>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">Section {sIdx + 1}: {section.title}</p>
                        <p className="text-xs text-muted-foreground">{sectionLessons.length} lessons</p>
                      </div>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditSection(section)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => dispatch({ type: 'DELETE_SECTION', sectionId: section.id })}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-2">
                    {sectionLessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                        <div className="flex flex-col gap-0.5">
                          <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => moveLesson(lesson, 'up')} disabled={lIdx === 0}><ArrowUp className="w-2.5 h-2.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => moveLesson(lesson, 'down')} disabled={lIdx === sectionLessons.length - 1}><ArrowDown className="w-2.5 h-2.5" /></Button>
                        </div>
                        {lesson.type === 'quiz' ? <HelpCircle className="w-4 h-4 text-primary" /> : <Video className="w-4 h-4 text-muted-foreground" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                            {lesson.type === 'quiz' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Quiz</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {lesson.type === 'quiz' ? `${lesson.quizQuestions?.length ?? 0} questions` : `${lesson.durationMinutes} min`}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditLesson(lesson)}><Pencil className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => dispatch({ type: 'DELETE_LESSON', lessonId: lesson.id })}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full gap-2 mt-2" onClick={() => openNewLesson(section.id)}>
                      <Plus className="w-3.5 h-3.5" /> Add Lesson
                    </Button>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}

        {sections.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No sections yet. Add your first section to start building the curriculum.</p>
            <Button onClick={openNewSection} className="gap-2"><Plus className="w-4 h-4" /> Add Section</Button>
          </div>
        )}
      </div>

      {/* Section dialog */}
      <Dialog open={sectionDialog} onOpenChange={setSectionDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editSection ? 'Edit Section' : 'New Section'}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} placeholder="e.g., Introduction" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionDialog(false)}>Cancel</Button>
            <Button onClick={saveSection} disabled={!sectionTitle.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson dialog */}
      <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editLesson ? 'Edit Lesson' : 'New Lesson'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Type</Label>
              <Select value={lessonForm.type} onValueChange={(v: 'video' | 'quiz') => setLessonForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video"><span className="flex items-center gap-2"><Video className="w-4 h-4" /> Video</span></SelectItem>
                  <SelectItem value="quiz"><span className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Quiz</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>

            {lessonForm.type === 'video' ? (
              <>
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input value={lessonForm.videoUrl} onChange={e => setLessonForm(f => ({ ...f, videoUrl: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input type="number" value={lessonForm.durationMinutes} onChange={e => setLessonForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) || 0 }))} />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Quiz Questions</Label>
                  <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </Button>
                </div>

                {lessonForm.quizQuestions.map((q, qIdx) => (
                  <Card key={q.id} className="border-dashed">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs text-muted-foreground">Question {qIdx + 1}</Label>
                          <Input
                            value={q.question}
                            onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                            placeholder="Enter your question..."
                          />
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0 mt-5" onClick={() => removeQuestion(qIdx)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Options (select the correct answer)</Label>
                        {q.options.map((opt, oIdx) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCorrectOption(qIdx, opt.id)}
                              className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                q.correctOptionId === opt.id
                                  ? 'border-[hsl(var(--success))] bg-[hsl(var(--success))]'
                                  : 'border-muted-foreground/30 hover:border-primary'
                              }`}
                            >
                              {q.correctOptionId === opt.id && <CheckCircle2 className="w-3 h-3 text-[hsl(var(--success-foreground))]" />}
                            </button>
                            <Input
                              value={opt.text}
                              onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                              className="flex-1"
                            />
                            {q.options.length > 2 && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => removeOption(qIdx, oIdx)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {q.options.length < 6 && (
                          <Button variant="ghost" size="sm" onClick={() => addOption(qIdx)} className="gap-1 text-xs">
                            <Plus className="w-3 h-3" /> Add Option
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {lessonForm.quizQuestions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No questions yet. Click "Add Question" to start.</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog(false)}>Cancel</Button>
            <Button onClick={saveLesson} disabled={!lessonForm.title.trim() || !isQuizValid}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCurriculum;
