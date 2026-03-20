// ---------------------------------------------------------------------------
// Training API Service — calls Spring Boot backend endpoints
// ---------------------------------------------------------------------------
// Toggle USE_MOCK to true for local development without a backend.
// When integrated into gc-ui, set API_BASE_URL to your Spring Boot server
// and the Azure AD token will be forwarded automatically.
// ---------------------------------------------------------------------------

const USE_MOCK = true; // Set to false when backend is ready
const API_BASE_URL = '/ga-admin/api/training'; // Matches gc-ui Spring Boot base path

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

// ---------------------------------------------------------------------------
// Helper: get auth headers (Azure AD token from gc-ui)
// ---------------------------------------------------------------------------
function getAuthHeaders(): Record<string, string> {
  // When embedded in gc-ui, the Azure AD access token is typically stored
  // in sessionStorage or provided by MSAL. Adjust this to match your setup.
  const token =
    sessionStorage.getItem('azure_ad_token') ||
    sessionStorage.getItem('msal.idtoken') ||
    '';

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** Fetch all progress records for the current user */
export async function fetchUserProgress(): Promise<Record<string, ProgressRecord>> {
  if (USE_MOCK) return {};

  const res = await fetch(`${API_BASE_URL}/progress`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch progress: ${res.status}`);
  const data: ProgressRecord[] = await res.json();
  return Object.fromEntries(data.map(p => [p.lessonId, p]));
}

/** Fetch all enrollments for the current user */
export async function fetchUserEnrollments(): Promise<Record<string, EnrollmentRecord>> {
  if (USE_MOCK) return {};

  const res = await fetch(`${API_BASE_URL}/enrollments`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch enrollments: ${res.status}`);
  const data: EnrollmentRecord[] = await res.json();
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

  const res = await fetch(`${API_BASE_URL}/enroll`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to enroll: ${res.status}`);
  return res.json();
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

  const res = await fetch(`${API_BASE_URL}/progress`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update progress: ${res.status}`);
  return res.json();
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

  const res = await fetch(`${API_BASE_URL}/progress/complete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ lessonId }),
  });
  if (!res.ok) throw new Error(`Failed to mark complete: ${res.status}`);
  return res.json();
}

export const trainingApi = {
  fetchUserProgress,
  fetchUserEnrollments,
  enrollInCourse,
  updateLessonProgress,
  markLessonComplete,
};
