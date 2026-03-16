// ---------------------------------------------------------------------------
// LMS Data Types — Supabase-ready schema
// ---------------------------------------------------------------------------

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  isPublished: boolean;
  createdAt: string;
  instructor: string;
  category: string;
  totalDurationMinutes: number;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  sortOrder: number;
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  videoUrl: string;
  durationMinutes: number;
  sortOrder: number;
}

export interface UserProgress {
  lessonId: string;
  maxWatchedSeconds: number;
  completed: boolean;
  completedAt: string | null;
}

export interface UserCourseEnrollment {
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
}

// Computed helpers
export type LessonStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export interface LessonWithStatus extends Lesson {
  status: LessonStatus;
  progress: number; // 0-100
}

export interface SectionWithLessons extends Section {
  lessons: LessonWithStatus[];
}

export interface CourseWithProgress extends Course {
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  enrolled: boolean;
}
