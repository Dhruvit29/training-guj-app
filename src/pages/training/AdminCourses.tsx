import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLms } from '@/contexts/LmsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, BookOpen, Settings,
} from 'lucide-react';
import type { Course } from '@/types/lms';

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
    setForm({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      category: course.category,
      thumbnailUrl: course.thumbnailUrl,
      totalDurationMinutes: course.totalDurationMinutes,
    });
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
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/training')} className="gap-2 -ml-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <h1 className="text-xl font-bold text-foreground">Course Management</h1>
            </div>
            <Button onClick={openNew} className="gap-2">
              <Plus className="w-4 h-4" /> New Course
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {state.courses.map(course => {
          const sectionCount = state.sections.filter(s => s.courseId === course.id).length;
          const lessonCount = state.sections
            .filter(s => s.courseId === course.id)
            .flatMap(s => state.lessons.filter(l => l.sectionId === s.id)).length;

          return (
            <Card key={course.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <img src={course.thumbnailUrl} alt={course.title} className="w-28 h-16 object-cover rounded-md flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{course.title}</h3>
                      <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{sectionCount} sections · {lessonCount} lessons · {course.category}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(course)} title={course.isPublished ? 'Unpublish' : 'Publish'}>
                      {course.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/training/admin/${course.id}`)} title="Edit curriculum">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(course)} title="Edit details">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(course.id)} title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {state.courses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No courses yet</p>
            <Button onClick={openNew} className="mt-4 gap-2"><Plus className="w-4 h-4" /> Create your first course</Button>
          </div>
        )}
      </div>

      {/* Course dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'New Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Instructor</Label>
                <Input value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input value={form.thumbnailUrl} onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;
