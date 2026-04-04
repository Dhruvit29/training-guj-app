// ---------------------------------------------------------------------------
// Application route paths — single source of truth for all navigation
// ---------------------------------------------------------------------------

export const PATHS = {
  // Training / LMS
  LMS_CATALOG: '/training',
  LMS_ADMIN_COURSES: '/training/admin',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];
