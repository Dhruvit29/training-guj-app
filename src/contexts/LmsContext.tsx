import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import type {
  Course, Section, Lesson, UserProgress, UserCourseEnrollment,
  CourseWithProgress, SectionWithLessons, LessonStatus,
} from '@/types/lms';
import { mockCourses, mockSections, mockLessons } from '@/data/mockData';
import { trainingApi } from '@/services/trainingApi';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface LmsState {
  courses: Course[];
  sections: Section[];
  lessons: Lesson[];
  userProgress: Record<string, UserProgress>; // keyed by lessonId
  enrollments: Record<string, UserCourseEnrollment>; // keyed by courseId
  syncing: boolean;
}

type LmsAction =
  | { type: 'ENROLL'; courseId: string }
  | { type: 'UPDATE_PROGRESS'; lessonId: string; maxWatchedSeconds: number; durationMinutes: number }
  | { type: 'MARK_COMPLETE'; lessonId: string }
  | { type: 'ADD_COURSE'; course: Course }
  | { type: 'UPDATE_COURSE'; course: Course }
  | { type: 'DELETE_COURSE'; courseId: string }
  | { type: 'ADD_SECTION'; section: Section }
  | { type: 'UPDATE_SECTION'; section: Section }
  | { type: 'DELETE_SECTION'; sectionId: string }
  | { type: 'ADD_LESSON'; lesson: Lesson }
  | { type: 'UPDATE_LESSON'; lesson: Lesson }
  | { type: 'DELETE_LESSON'; lessonId: string }
  | { type: 'REORDER_SECTIONS'; courseId: string; sectionIds: string[] }
  | { type: 'REORDER_LESSONS'; sectionId: string; lessonIds: string[] }
  | { type: 'SYNC_PROGRESS'; progress: Record<string, UserProgress> }
  | { type: 'SYNC_ENROLLMENTS'; enrollments: Record<string, UserCourseEnrollment> }
  | { type: 'SET_SYNCING'; syncing: boolean };

const initialState: LmsState = {
  courses: mockCourses,
  sections: mockSections,
  lessons: mockLessons,
  userProgress: {
    'les-1-1-1': { lessonId: 'les-1-1-1', maxWatchedSeconds: 600, completed: true, completedAt: '2024-06-01' },
    'les-1-1-2': { lessonId: 'les-1-1-2', maxWatchedSeconds: 450, completed: false, completedAt: null },
  },
  enrollments: {
    'course-1': { courseId: 'course-1', enrolledAt: '2024-05-15', completedAt: null },
    'course-2': { courseId: 'course-2', enrolledAt: '2024-06-01', completedAt: null },
  },
  syncing: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function lmsReducer(state: LmsState, action: LmsAction): LmsState {
  switch (action.type) {
    case 'SET_SYNCING':
      return { ...state, syncing: action.syncing };

    case 'SYNC_PROGRESS':
      return { ...state, userProgress: { ...state.userProgress, ...action.progress } };

    case 'SYNC_ENROLLMENTS':
      return { ...state, enrollments: { ...state.enrollments, ...action.enrollments } };

    case 'ENROLL':
      return {
        ...state,
        enrollments: {
          ...state.enrollments,
          [action.courseId]: {
            courseId: action.courseId,
            enrolledAt: new Date().toISOString(),
            completedAt: null,
          },
        },
      };

    case 'UPDATE_PROGRESS': {
      const existing = state.userProgress[action.lessonId];
      const newMax = Math.max(existing?.maxWatchedSeconds ?? 0, action.maxWatchedSeconds);
      const threshold = action.durationMinutes * 60 * 0.95;
      const completed = newMax >= threshold;
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [action.lessonId]: {
            lessonId: action.lessonId,
            maxWatchedSeconds: newMax,
            completed: existing?.completed || completed,
            completedAt: (existing?.completed || completed)
              ? (existing?.completedAt ?? new Date().toISOString())
              : null,
          },
        },
      };
    }

    case 'MARK_COMPLETE':
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [action.lessonId]: {
            lessonId: action.lessonId,
            maxWatchedSeconds: state.userProgress[action.lessonId]?.maxWatchedSeconds ?? 0,
            completed: true,
            completedAt: new Date().toISOString(),
          },
        },
      };

    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.course] };
    case 'UPDATE_COURSE':
      return { ...state, courses: state.courses.map(c => c.id === action.course.id ? action.course : c) };
    case 'DELETE_COURSE': {
      const sectionIds = state.sections.filter(s => s.courseId === action.courseId).map(s => s.id);
      return {
        ...state,
        courses: state.courses.filter(c => c.id !== action.courseId),
        sections: state.sections.filter(s => s.courseId !== action.courseId),
        lessons: state.lessons.filter(l => !sectionIds.includes(l.sectionId)),
      };
    }

    case 'ADD_SECTION':
      return { ...state, sections: [...state.sections, action.section] };
    case 'UPDATE_SECTION':
      return { ...state, sections: state.sections.map(s => s.id === action.section.id ? action.section : s) };
    case 'DELETE_SECTION':
      return {
        ...state,
        sections: state.sections.filter(s => s.id !== action.sectionId),
        lessons: state.lessons.filter(l => l.sectionId !== action.sectionId),
      };

    case 'ADD_LESSON':
      return { ...state, lessons: [...state.lessons, action.lesson] };
    case 'UPDATE_LESSON':
      return { ...state, lessons: state.lessons.map(l => l.id === action.lesson.id ? action.lesson : l) };
    case 'DELETE_LESSON':
      return { ...state, lessons: state.lessons.filter(l => l.id !== action.lessonId) };

    case 'REORDER_SECTIONS':
      return {
        ...state,
        sections: state.sections.map(s => {
          if (s.courseId !== action.courseId) return s;
          const idx = action.sectionIds.indexOf(s.id);
          return idx >= 0 ? { ...s, sortOrder: idx + 1 } : s;
        }),
      };

    case 'REORDER_LESSONS':
      return {
        ...state,
        lessons: state.lessons.map(l => {
          if (l.sectionId !== action.sectionId) return l;
          const idx = action.lessonIds.indexOf(l.id);
          return idx >= 0 ? { ...l, sortOrder: idx + 1 } : l;
        }),
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface LmsContextValue {
  state: LmsState;
  dispatch: React.Dispatch<LmsAction>;
  // API-backed actions
  enroll: (courseId: string) => Promise<void>;
  updateProgress: (lessonId: string, maxWatchedSeconds: number, durationMinutes: number) => Promise<void>;
  markComplete: (lessonId: string) => Promise<void>;
  // Computed selectors
  getCoursesWithProgress: () => CourseWithProgress[];
  getCourseWithProgress: (courseId: string) => CourseWithProgress | undefined;
  getSectionsWithLessons: (courseId: string) => SectionWithLessons[];
  getNextLesson: (courseId: string) => { sectionId: string; lessonId: string } | null;
  getAllLessonsOrdered: (courseId: string) => Lesson[];
}

const LmsContext = createContext<LmsContextValue | null>(null);

export function LmsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(lmsReducer, initialState);

  // Fetch progress & enrollments from backend on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      dispatch({ type: 'SET_SYNCING', syncing: true });
      try {
        const [progress, enrollments] = await Promise.all([
          trainingApi.fetchUserProgress(),
          trainingApi.fetchUserEnrollments(),
        ]);
        if (!cancelled) {
          if (Object.keys(progress).length > 0) {
            dispatch({ type: 'SYNC_PROGRESS', progress });
          }
          if (Object.keys(enrollments).length > 0) {
            dispatch({ type: 'SYNC_ENROLLMENTS', enrollments });
          }
        }
      } catch (err) {
        console.warn('Failed to sync from backend, using local data:', err);
      } finally {
        if (!cancelled) dispatch({ type: 'SET_SYNCING', syncing: false });
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // API-backed actions that optimistically update state then call backend
  const enroll = useCallback(async (courseId: string) => {
    dispatch({ type: 'ENROLL', courseId });
    try {
      await trainingApi.enrollInCourse({ courseId });
    } catch (err) {
      console.error('Failed to sync enrollment:', err);
    }
  }, []);

  const updateProgress = useCallback(async (lessonId: string, maxWatchedSeconds: number, durationMinutes: number) => {
    dispatch({ type: 'UPDATE_PROGRESS', lessonId, maxWatchedSeconds, durationMinutes });
    try {
      await trainingApi.updateLessonProgress({ lessonId, maxWatchedSeconds, durationMinutes });
    } catch (err) {
      console.error('Failed to sync progress:', err);
    }
  }, []);

  const markComplete = useCallback(async (lessonId: string) => {
    dispatch({ type: 'MARK_COMPLETE', lessonId });
    try {
      await trainingApi.markLessonComplete(lessonId);
    } catch (err) {
      console.error('Failed to sync completion:', err);
    }
  }, []);

  const getAllLessonsOrdered = useCallback((courseId: string): Lesson[] => {
    const courseSections = state.sections
      .filter(s => s.courseId === courseId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return courseSections.flatMap(sec =>
      state.lessons
        .filter(l => l.sectionId === sec.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    );
  }, [state.sections, state.lessons]);

  const getLessonStatus = useCallback((lessonId: string, allLessonsOrdered: Lesson[]): LessonStatus => {
    const progress = state.userProgress[lessonId];
    if (progress?.completed) return 'completed';

    const idx = allLessonsOrdered.findIndex(l => l.id === lessonId);
    if (idx === 0) return progress ? 'in-progress' : 'available';

    const prevLesson = allLessonsOrdered[idx - 1];
    const prevProgress = state.userProgress[prevLesson.id];
    if (prevProgress?.completed) return progress ? 'in-progress' : 'available';

    return 'locked';
  }, [state.userProgress]);

  const getSectionsWithLessons = useCallback((courseId: string): SectionWithLessons[] => {
    const allOrdered = getAllLessonsOrdered(courseId);
    const courseSections = state.sections
      .filter(s => s.courseId === courseId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return courseSections.map(sec => {
      const sectionLessons = state.lessons
        .filter(l => l.sectionId === sec.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(lesson => {
          const status = getLessonStatus(lesson.id, allOrdered);
          const progress = state.userProgress[lesson.id];
          const pct = progress
            ? Math.min(100, Math.round((progress.maxWatchedSeconds / (lesson.durationMinutes * 60)) * 100))
            : 0;
          return { ...lesson, status, progress: status === 'completed' ? 100 : pct };
        });
      return { ...sec, lessons: sectionLessons };
    });
  }, [state, getAllLessonsOrdered, getLessonStatus]);

  const getCoursesWithProgress = useCallback((): CourseWithProgress[] => {
    return state.courses.map(course => {
      const allLessons = getAllLessonsOrdered(course.id);
      const completedCount = allLessons.filter(l => state.userProgress[l.id]?.completed).length;
      const total = allLessons.length;
      return {
        ...course,
        progressPercent: total > 0 ? Math.round((completedCount / total) * 100) : 0,
        completedLessons: completedCount,
        totalLessons: total,
        enrolled: !!state.enrollments[course.id],
      };
    });
  }, [state, getAllLessonsOrdered]);

  const getCourseWithProgress = useCallback((courseId: string) => {
    return getCoursesWithProgress().find(c => c.id === courseId);
  }, [getCoursesWithProgress]);

  const getNextLesson = useCallback((courseId: string) => {
    const allLessons = getAllLessonsOrdered(courseId);
    for (const lesson of allLessons) {
      if (!state.userProgress[lesson.id]?.completed) {
        return { sectionId: lesson.sectionId, lessonId: lesson.id };
      }
    }
    return null;
  }, [state.userProgress, getAllLessonsOrdered]);

  const value = useMemo(() => ({
    state,
    dispatch,
    enroll,
    updateProgress,
    markComplete,
    getCoursesWithProgress,
    getCourseWithProgress,
    getSectionsWithLessons,
    getNextLesson,
    getAllLessonsOrdered,
  }), [state, dispatch, enroll, updateProgress, markComplete, getCoursesWithProgress, getCourseWithProgress, getSectionsWithLessons, getNextLesson, getAllLessonsOrdered]);

  return <LmsContext.Provider value={value}>{children}</LmsContext.Provider>;
}

export function useLms() {
  const ctx = useContext(LmsContext);
  if (!ctx) throw new Error('useLms must be used within LmsProvider');
  return ctx;
}
