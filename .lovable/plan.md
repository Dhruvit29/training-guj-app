

## LMS Module — LinkedIn-Style Learning Platform

### Context

The existing gc-ui app is an MUI + Redux classroom management tool (Azure AD auth, BrowserRouter with `/ga-admin` base). It already has `/video` and `/training2` training routes. This Lovable project will be a **standalone LMS module** built with the existing Vite + React + Tailwind + shadcn/ui stack, designed so the pages/components can later be ported into gc-ui or linked as a separate app.

### Architecture Overview

```text
/training                → Course catalog (browse all courses)
/training/:courseId      → Course detail (curriculum outline, progress)
/training/:courseId/:lessonId → Lesson player (video + notes)
/training/admin          → Admin: manage courses
/training/admin/:courseId → Admin: edit curriculum (sections + lessons)
```

### Key Features

**1. Learner Experience (LinkedIn Learning style)**
- **Catalog page**: Grid of course cards with thumbnail, title, progress bar, duration
- **Course detail page**: Left sidebar with collapsible sections showing lessons (locked/unlocked/completed icons). Right side shows course description and a "Continue" CTA
- **Lesson player page**: Full-width video player on top, lesson title + notes below, sidebar with curriculum navigation. "Next Lesson" button appears only after video completes
- **Sequential locking**: Lessons unlock only after the previous lesson's video is fully watched

**2. Restricted Video Player**
- Custom wrapper around an `<iframe>` for Microsoft Stream/SharePoint embed URLs
- For native `<video>` elements: disable `seeking` event, hide forward controls via CSS, intercept `currentTime` changes to prevent skipping ahead
- Track `maxWatchedTime` — user can rewind but not skip past their furthest point
- Mark lesson complete only when video reaches ~95% duration

**3. Admin Interface**
- **Course management**: Create/edit courses (title, description, thumbnail URL)
- **Curriculum builder**: Add/reorder sections, add/reorder lessons within sections via drag handles
- **Lesson editor**: Title, description, video embed URL (Stream/SharePoint), estimated duration
- **Publish/unpublish** toggle per course

**4. Data Model (mock data now, Supabase-ready schema)**

```text
courses
  id, title, description, thumbnailUrl, isPublished, createdAt

sections
  id, courseId, title, sortOrder

lessons
  id, sectionId, title, description, videoUrl, durationMinutes, sortOrder

user_progress
  id visually
  userId visually, lessonId, maxWatchedSeconds, completed, completedAt

user_course_enrollment
  id, userId, courseId, enrolledAt, completedAt
```

All data stored in React context with mock JSON initially. The schema is designed for direct migration to Supabase tables later.

### Implementation Plan

1. **Create mock data layer** — Types, mock courses/sections/lessons, context provider for user progress
2. **Build restricted video player component** — Handles both iframe embeds (Stream) and native video, prevents fast-forwarding, tracks watch progress
3. **Build course catalog page** — Grid layout with course cards, progress indicators, search/filter
4. **Build course detail page** — Sidebar curriculum tree with lock states, course info, continue button
5. **Build lesson player page** — Video player + curriculum sidebar + lesson notes, sequential unlock logic
6. **Build admin pages** — Course CRUD, curriculum builder with section/lesson management, reordering
7. **Add routing and navigation** — Wire up all routes under `/training/*`, add nav links

### Technical Details

- **State management**: React Context + useReducer for user progress and course data (mock). No Redux needed in this standalone module
- **Video player**: Custom `RestrictedVideoPlayer` component. For Stream embeds, uses postMessage API to communicate with the iframe when possible; otherwise tracks completion via a "Mark Complete" button that enables after minimum watch time
- **Sequential locking**: `useLesonAccess(courseId)` hook computes which lessons are unlocked based on `user_progress` completion status
- **Drag reordering** (admin): Using native HTML drag or a simple up/down button approach to avoid heavy DnD library dependencies
- **Responsive**: Mobile-friendly — sidebar collapses to a drawer on small screens

