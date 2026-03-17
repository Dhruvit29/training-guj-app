import React, { useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLms } from '@/contexts/LmsContext';
import RestrictedVideoPlayer from '@/components/lms/RestrictedVideoPlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft, ChevronRight, Lock, CheckCircle2, Circle, Play, Clock, Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonWithStatus } from '@/types/lms';

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
    dispatch({ type: 'MARK_COMPLETE', lessonId: lessonId! });
  }, [dispatch, lessonId]);

  if (!course || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Lesson not found</p>
          <Button variant="link" onClick={() => navigate('/training')}>Back to catalog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="border-b bg-card px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/training/${courseId}`)} className="gap-1 -ml-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
            <p className="text-xs text-muted-foreground">Lesson {currentIdx + 1} of {allLessons.length}</p>
          </div>
        </div>

        {/* Video player */}
        <div className="w-full bg-foreground/5">
          <RestrictedVideoPlayer
            videoUrl={currentLesson.videoUrl}
            durationMinutes={currentLesson.durationMinutes}
            maxWatchedSeconds={progress?.maxWatchedSeconds ?? 0}
            onProgress={handleProgress}
            onComplete={handleComplete}
          />
        </div>

        {/* Lesson info */}
        <div className="p-6 space-y-4 max-w-4xl">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{currentLesson.title}</h1>
            {isCompleted && (
              <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground leading-relaxed">{currentLesson.description}</p>

          {/* Next lesson CTA */}
          {isCompleted && nextLesson && (
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Up Next</p>
                <p className="text-sm text-muted-foreground">{nextLesson.title}</p>
              </div>
              <Button onClick={() => navigate(`/training/${courseId}/${nextLesson.id}`)} className="gap-2">
                Next Lesson <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {isCompleted && !nextLesson && (
            <div className="p-4 bg-[hsl(var(--success))]/10 rounded-lg border border-[hsl(var(--success))]/20 text-center">
              <p className="text-lg font-semibold text-foreground">🎉 Course Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">You've finished all lessons in this course.</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <Button variant="outline" onClick={() => navigate('/training')}>
                  Back to Training Center
                </Button>
                <Button onClick={() => navigate(`/training/${courseId}/certificate`)} className="gap-2">
                  <Award className="w-4 h-4" /> View Certificate
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar curriculum */}
      <div className="w-full lg:w-80 border-l bg-card hidden lg:flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-foreground text-sm">Course Content</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {sections.map((section, sIdx) => (
              <div key={section.id} className="mb-3">
                <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
                  {section.title}
                </p>
                {section.lessons.map((lesson, lIdx) => (
                  <SidebarLesson
                    key={lesson.id}
                    lesson={lesson}
                    index={lIdx}
                    courseId={courseId!}
                    isCurrent={lesson.id === lessonId}
                  />
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

function SidebarLesson({
  lesson, index, courseId, isCurrent,
}: {
  lesson: LessonWithStatus; index: number; courseId: string; isCurrent: boolean;
}) {
  const isClickable = lesson.status !== 'locked';
  const icon = {
    locked: <Lock className="w-3.5 h-3.5 text-muted-foreground" />,
    available: <Circle className="w-3.5 h-3.5 text-primary" />,
    'in-progress': <Play className="w-3.5 h-3.5 text-primary" />,
    completed: <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--success))]" />,
  }[lesson.status];

  const content = (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-2 rounded text-sm transition-colors',
        isCurrent && 'bg-primary/10 border border-primary/20',
        !isCurrent && isClickable && 'hover:bg-muted/50 cursor-pointer',
        lesson.status === 'locked' && 'opacity-50',
      )}
    >
      {icon}
      <span className={cn('flex-1 truncate text-xs', isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground')}>
        {lesson.title}
      </span>
      <span className="text-[10px] text-muted-foreground">{lesson.durationMinutes}m</span>
    </div>
  );

  return isClickable && !isCurrent ? (
    <Link to={`/training/${courseId}/${lesson.id}`}>{content}</Link>
  ) : content;
}

export default LessonPlayer;
