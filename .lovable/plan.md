

## Plan: Name Change + Backend for User Progress

### 1. Text Change
Replace "Shri Hariprasad Swami" with "Sadhu Keshavjivandas" in `src/data/mockData.ts` (line 11).

### 2. Backend Architecture for User Progress

Since this LMS will be embedded in the gc-ui app (which uses Azure AD auth and has an existing backend), the backend needs to:

- **Store per-user progress**: which lessons each user has watched, how far, and completion status
- **Store enrollments**: which courses each user is enrolled in
- **Receive user identity**: from the Azure AD token already present in gc-ui

**What I need from you to build this properly:**

Before I design the API layer, I need to understand your backend setup:

1. **What backend does gc-ui talk to?** Is it a .NET API, Node.js, Python/Django, or something else? Where is it hosted?
2. **Database**: What database does the existing backend use? (SQL Server, PostgreSQL, Cosmos DB, etc.)
3. **Would you like me to build the backend here using Lovable Cloud (Supabase)?** This would give us a PostgreSQL database + REST API out of the box. The gc-ui frontend would call these APIs with the user's identity. Or do you want API endpoints added to your existing backend?
4. **User identification**: When a user is logged in via Azure AD, what identifier should we use to track their progress? (e.g., Azure AD `oid`, email, or an internal user ID from your database?)

### Proposed API Design (regardless of backend choice)

```text
POST   /api/training/enroll          { courseId }
GET    /api/training/progress         → all progress for current user
POST   /api/training/progress         { lessonId, maxWatchedSeconds, durationMinutes }
POST   /api/training/progress/complete { lessonId }
GET    /api/training/enrollments      → user's enrolled courses
```

Each call identifies the user from the auth token (Azure AD JWT or Supabase session).

### Database Tables

```text
training_enrollments
  id, user_id, course_id, enrolled_at, completed_at

training_progress
  id, user_id, lesson_id, max_watched_seconds, completed, completed_at
  UNIQUE(user_id, lesson_id)
```

### Next Step

Once you tell me which backend approach to use, I'll implement the full API layer and update the frontend context to make real API calls instead of using in-memory mock state.

