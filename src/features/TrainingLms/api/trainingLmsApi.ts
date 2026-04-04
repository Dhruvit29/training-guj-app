// ---------------------------------------------------------------------------
// Training LMS API Service — uses axiosInstance
// ---------------------------------------------------------------------------
// Toggle USE_MOCK to true for local development without a backend.
// When backend is ready, set USE_MOCK = false and ensure the Spring Boot
// endpoints exist at /ga-admin/api/training/*.
// ---------------------------------------------------------------------------

import axiosInstance from '@/api/config/axiosInstance';

const USE_MOCK = true; // Set to false when backend endpoints are ready
const BASE_PATH = '/training';

interface ProgressPayload {
  lessonId: string;
  maxWatchedSeconds: number;
  durationMinutes: number;
}

interface EnrollPayload {
  courseId: string;
}

interface ProgressRecord {
  lessonId: string;
  maxWatchedSeconds: number;
  completed: boolean;
  completedAt: string | null;
}

interface EnrollmentRecord {
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
}

/** Fetch all progress records for the current user */
export async function fetchUserProgress(): Promise<Record<string, ProgressRecord>> {
  if (USE_MOCK) return {};

  const { data } = await axiosInstance.get<ProgressRecord[]>(`${BASE_PATH}/progress`);
  return Object.fromEntries(data.map(p => [p.lessonId, p]));
}

/** Fetch all enrollments for the current user */
export async function fetchUserEnrollments(): Promise<Record<string, EnrollmentRecord>> {
  if (USE_MOCK) return {};

  const { data } = await axiosInstance.get<EnrollmentRecord[]>(`${BASE_PATH}/enrollments`);
  return Object.fromEntries(data.map(e => [e.courseId, e]));
}

/** Enroll the current user in a course */
export async function enrollInCourse(payload: EnrollPayload): Promise<EnrollmentRecord> {
  if (USE_MOCK) {
    return {
      courseId: payload.courseId,
      enrolledAt: new Date().toISOString(),
      completedAt: null,
    };
  }

  const { data } = await axiosInstance.post<EnrollmentRecord>(`${BASE_PATH}/enroll`, payload);
  return data;
}

/** Update watch progress for a lesson */
export async function updateLessonProgress(payload: ProgressPayload): Promise<ProgressRecord> {
  if (USE_MOCK) {
    const completed = payload.maxWatchedSeconds >= payload.durationMinutes * 60 * 0.95;
    return {
      lessonId: payload.lessonId,
      maxWatchedSeconds: payload.maxWatchedSeconds,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    };
  }

  const { data } = await axiosInstance.post<ProgressRecord>(`${BASE_PATH}/progress`, payload);
  return data;
}

/** Mark a lesson as complete */
export async function markLessonComplete(lessonId: string): Promise<ProgressRecord> {
  if (USE_MOCK) {
    return {
      lessonId,
      maxWatchedSeconds: 0,
      completed: true,
      completedAt: new Date().toISOString(),
    };
  }

  const { data } = await axiosInstance.post<ProgressRecord>(`${BASE_PATH}/progress/complete`, { lessonId });
  return data;
}

export const trainingLmsApi = {
  fetchUserProgress,
  fetchUserEnrollments,
  enrollInCourse,
  updateLessonProgress,
  markLessonComplete,
};
