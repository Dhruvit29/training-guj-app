import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLms } from '@/contexts/LmsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft, Plus, Pencil, Trash2, ChevronDown, GripVertical,
  ArrowUp, ArrowDown, Video,
} from 'lucide-react';
import type { Section, Lesson } from '@/types/lms';

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
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', videoUrl: '', durationMinutes: 10 });

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    );
  }

  const openNewSection = () => {
    setEditSection(null);
    setSectionTitle('');
    setSectionDialog(true);
  };

  const openEditSection = (sec: Section) => {
    setEditSection(sec);
    setSectionTitle(sec.title);
    setSectionDialog(true);
  };

  const saveSection = () => {
    if (!sectionTitle.trim()) return;
    if (editSection) {
      dispatch({ type: 'UPDATE_SECTION', section: { ...editSection, title: sectionTitle } });
    } else {
      dispatch({
        type: 'ADD_SECTION',
        section: {
          id: `sec-${Date.now()}`,
          courseId: courseId!,
          title: sectionTitle,
          sortOrder: sections.length + 1,
        },
      });
    }
    setSectionDialog(false);
  };

  const openNewLesson = (sectionId: string) => {
    setEditLesson(null);
    setLessonSectionId(sectionId);
    setLessonForm({ title: '', description: '', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 10 });
    setLessonDialog(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditLesson(lesson);
    setLessonSectionId(lesson.sectionId);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      durationMinutes: lesson.durationMinutes,
    });
    setLessonDialog(true);
  };

  const saveLesson = () => {
    if (!lessonForm.title.trim()) return;
    const sectionLessons = state.lessons.filter(l => l.sectionId === lessonSectionId);
    if (editLesson) {
      dispatch({ type: 'UPDATE_LESSON', lesson: { ...editLesson, ...lessonForm, sectionId: lessonSectionId } });
    } else {
      dispatch({
        type: 'ADD_LESSON',
        lesson: {
          id: `les-${Date.now()}`,
          sectionId: lessonSectionId,
          ...lessonForm,
          sortOrder: sectionLessons.length + 1,
        },
      });
    }
    setLessonDialog(false);
  };

  const moveSection = (sec: Section, direction: 'up' | 'down') => {
    const ids = sections.map(s => s.id);
    const idx = ids.indexOf(sec.id);
    if (direction === 'up' && idx > 0) {
      [ids[idx], ids[idx - 1]] = [ids[idx - 1], ids[idx]];
    } else if (direction === 'down' && idx < ids.length - 1) {
      [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    }
    dispatch({ type: 'REORDER_SECTIONS', courseId: courseId!, sectionIds: ids });
  };

  const moveLesson = (lesson: Lesson, direction: 'up' | 'down') => {
    const sectionLessons = state.lessons
      .filter(l => l.sectionId === lesson.sectionId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const ids = sectionLessons.map(l => l.id);
    const idx = ids.indexOf(lesson.id);
    if (direction === 'up' && idx > 0) {
      [ids[idx], ids[idx - 1]] = [ids[idx - 1], ids[idx]];
    } else if (direction === 'down' && idx < ids.length - 1) {
      [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    }
    dispatch({ type: 'REORDER_LESSONS', sectionId: lesson.sectionId, lessonIds: ids });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
            <Button onClick={openNewSection} className="gap-2">
              <Plus className="w-4 h-4" /> Add Section
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {sections.map((section, sIdx) => {
          const sectionLessons = state.lessons
            .filter(l => l.sectionId === section.id)
            .sort((a, b) => a.sortOrder - b.sortOrder);

          return (
            <Collapsible key={section.id} defaultOpen>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={e => { e.stopPropagation(); moveSection(section, 'up'); }} disabled={sIdx === 0}>
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={e => { e.stopPropagation(); moveSection(section, 'down'); }} disabled={sIdx === sections.length - 1}>
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">Section {sIdx + 1}: {section.title}</p>
                        <p className="text-xs text-muted-foreground">{sectionLessons.length} lessons</p>
                      </div>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditSection(section)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => dispatch({ type: 'DELETE_SECTION', sectionId: section.id })}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-2">
                    {sectionLessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
                        <div className="flex flex-col gap-0.5">
                          <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => moveLesson(lesson, 'up')} disabled={lIdx === 0}>
                            <ArrowUp className="w-2.5 h-2.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => moveLesson(lesson, 'down')} disabled={lIdx === sectionLessons.length - 1}>
                            <ArrowDown className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                        <Video className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">{lesson.durationMinutes} min</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditLesson(lesson)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => dispatch({ type: 'DELETE_LESSON', lessonId: lesson.id })}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
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
          <DialogHeader>
            <DialogTitle>{editSection ? 'Edit Section' : 'New Section'}</DialogTitle>
          </DialogHeader>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editLesson ? 'Edit Lesson' : 'New Lesson'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Video URL (Stream/SharePoint embed or direct MP4)</Label>
              <Input value={lessonForm.videoUrl} onChange={e => setLessonForm(f => ({ ...f, videoUrl: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input type="number" value={lessonForm.durationMinutes} onChange={e => setLessonForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog(false)}>Cancel</Button>
            <Button onClick={saveLesson} disabled={!lessonForm.title.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCurriculum;
