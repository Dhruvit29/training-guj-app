import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLms } from '@/contexts/LmsContext';
import { Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ArrowLeft, Play, Lock, CheckCircle2, Circle, ChevronDown,
  Clock, BookOpen, User, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SectionWithLessons, LessonWithStatus } from '@/types/lms';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { getCourseWithProgress, getSectionsWithLessons, getNextLesson, enroll } = useLms();

  const course = getCourseWithProgress(courseId!);
  const sections = getSectionsWithLessons(courseId!);
  const next = getNextLesson(courseId!);

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Course not found</p>
          <Button variant="link" onClick={() => navigate('/training')}>Back to catalog</Button>
        </div>
      </div>
    );
  }

  const handleEnroll = () => {
    enroll(course.id);
  };

  const handleContinue = () => {
    if (next) navigate(`/training/${courseId}/${next.lessonId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/training')} className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back to courses
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Badge variant="outline">{course.category}</Badge>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{course.title}</h1>
              <p className="text-muted-foreground leading-relaxed">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><User className="w-4 h-4" />{course.instructor}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.totalDurationMinutes} min</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{course.totalLessons} lessons</span>
              </div>
              {course.enrolled ? (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{course.completedLessons}/{course.totalLessons} completed</span>
                    <span className="font-medium text-foreground">{course.progressPercent}%</span>
                  </div>
                  <Progress value={course.progressPercent} className="h-2" />
                  {next && (
                    <Button onClick={handleContinue} className="mt-3 gap-2">
                      <Play className="w-4 h-4" />
                      {course.progressPercent > 0 ? 'Continue Learning' : 'Start Course'}
                    </Button>
                  )}
                  {course.progressPercent === 100 && (
                    <div className="flex items-center gap-3 mt-3">
                      <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">Course Completed! 🎉</Badge>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/training/${courseId}/certificate`)} className="gap-2">
                        <Award className="w-4 h-4" /> View Certificate
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={handleEnroll} size="lg" className="mt-2 gap-2">
                  <Play className="w-4 h-4" /> Enroll & Start
                </Button>
              )}
            </div>
            <div className="hidden lg:block">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full aspect-video object-cover rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold mb-6 text-foreground">Course Curriculum</h2>
        <div className="space-y-3">
          {sections.map((section, sIdx) => (
            <CurriculumSection
              key={section.id}
              section={section}
              sectionIndex={sIdx}
              courseId={courseId!}
              enrolled={course.enrolled}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function CurriculumSection({
  section, sectionIndex, courseId, enrolled,
}: {
  section: SectionWithLessons; sectionIndex: number; courseId: string; enrolled: boolean;
}) {
  const completedCount = section.lessons.filter(l => l.status === 'completed').length;
  const totalMinutes = section.lessons.reduce((sum, l) => sum + l.durationMinutes, 0);

  return (
    <Collapsible defaultOpen={sectionIndex === 0 || section.lessons.some(l => l.status === 'in-progress' || l.status === 'available')}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform [&[data-state=open]]:rotate-180" />
            <div className="text-left">
              <p className="font-medium text-foreground">Section {sectionIndex + 1}: {section.title}</p>
              <p className="text-xs text-muted-foreground">{completedCount}/{section.lessons.length} lessons · {totalMinutes} min</p>
            </div>
          </div>
          {completedCount === section.lessons.length && section.lessons.length > 0 && (
            <CheckCircle2 className="w-5 h-5 text-[hsl(var(--success))]" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-4">
          {section.lessons.map((lesson, lIdx) => (
            <LessonRow key={lesson.id} lesson={lesson} index={lIdx} courseId={courseId} enrolled={enrolled} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function LessonRow({
  lesson, index, courseId, enrolled,
}: {
  lesson: LessonWithStatus; index: number; courseId: string; enrolled: boolean;
}) {
  const isClickable = enrolled && (lesson.status === 'available' || lesson.status === 'in-progress' || lesson.status === 'completed');

  const icon = {
    locked: <Lock className="w-4 h-4 text-muted-foreground" />,
    available: <Circle className="w-4 h-4 text-primary" />,
    'in-progress': <Play className="w-4 h-4 text-primary" />,
    completed: <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />,
  }[lesson.status];

  const content = (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-md transition-colors',
        isClickable && 'hover:bg-muted/50 cursor-pointer',
        lesson.status === 'locked' && 'opacity-60',
        lesson.status === 'in-progress' && 'bg-primary/5',
      )}
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', lesson.status === 'completed' ? 'text-muted-foreground' : 'text-foreground')}>
          {index + 1}. {lesson.title}
        </p>
        {lesson.status === 'in-progress' && lesson.progress > 0 && (
          <Progress value={lesson.progress} className="h-1 mt-1.5 w-32" />
        )}
      </div>
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="w-3 h-3" /> {lesson.durationMinutes}m
      </span>
    </div>
  );

  return isClickable ? (
    <Link to={`/training/${courseId}/${lesson.id}`}>{content}</Link>
  ) : (
    content
  );
}

export default CourseDetail;
