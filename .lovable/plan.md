

## Plan: Align LMS Module with gc-ui App

### What's Changing

The LMS module needs to visually and structurally match the existing gc-ui application shown in the screenshot. Two main areas of work:

### 1. Visual Alignment — Match gc-ui's Look & Feel

The gc-ui app has a dark navy blue header/sidebar, white content area, and MUI-style clean design. The current LMS uses a lighter blue theme.

**Changes:**
- **Update CSS color variables** in `src/index.css` — change primary to the gc-ui dark navy blue (`#1a3764` / similar), keep the clean white card/background style
- **Add a persistent top AppBar** across all training pages — dark navy background with "My ગુજરાતી Class" branding and user avatar, matching the gc-ui header
- **Add a left sidebar navigation** component that mirrors gc-ui's nav style (dark navy, white text, icons with chevrons for expandable items). The Training section will be expanded/active when in the LMS module
- **Create a shared layout wrapper** (`TrainingLayout.tsx`) that wraps all `/training/*` routes with the AppBar + Sidebar, so the content renders in the right-side area just like gc-ui's AppShell
- **Adjust page styling** — reduce border-radius to match MUI defaults (`--radius: 0.5rem`), use more subtle shadows, ensure cards/buttons feel MUI-like

### 2. Backend API Structure — Match gc-ui's Spring Boot Patterns

From the gc-ui code shared earlier, the app talks to a Spring Boot backend at `https://bk.na.baps.org` with Azure AD tokens.

**Changes to `src/services/trainingApi.ts`:**
- Update `API_BASE_URL` to `/ga-admin/api/training` to match the gc-ui base path pattern
- Structure API calls to follow gc-ui's pattern: use the MSAL token from the host app
- Add proper error handling with toast notifications (matching gc-ui's error patterns)
- Add a `fetchCurrentUser()` helper that gets the user's email/name from the Azure AD token (for certificate personalization)
- Keep `USE_MOCK = true` toggle so it works standalone during development

### 3. Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/index.css` | Modify | Update color palette to navy blue theme |
| `src/components/layout/TrainingLayout.tsx` | Create | AppBar + Sidebar layout wrapper |
| `src/components/layout/TrainingSidebar.tsx` | Create | Left nav matching gc-ui style |
| `src/components/layout/TrainingAppBar.tsx` | Create | Top header bar matching gc-ui |
| `src/App.tsx` | Modify | Wrap training routes with TrainingLayout |
| `src/services/trainingApi.ts` | Modify | Align API base path and auth pattern |
| `src/pages/training/CourseCatalog.tsx` | Modify | Remove standalone header (now in layout), adjust content styling |
| `src/pages/training/CourseDetail.tsx` | Modify | Remove standalone header, adjust styling |
| `src/pages/training/LessonPlayer.tsx` | Modify | Adjust to work within layout shell |
| `src/pages/training/AdminCourses.tsx` | Modify | Remove standalone header, adjust styling |
| `src/pages/training/AdminCurriculum.tsx` | Modify | Remove standalone header, adjust styling |
| `src/pages/training/CourseCertificate.tsx` | Modify | Remove standalone header, adjust styling |

### 4. Layout Structure

```text
┌─────────────────────────────────────────────────┐
│  AppBar (dark navy) — "My ગુજરાતી Class"    [N] │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │                                      │
│ (navy)   │   Page Content (white bg)            │
│          │                                      │
│ Dashboard│   (CourseCatalog / CourseDetail /     │
│ Classes  │    LessonPlayer / Admin pages)        │
│ ...      │                                      │
│ Training▼│                                      │
│  >Videos │                                      │
│  >Admin  │                                      │
│ Settings │                                      │
└──────────┴──────────────────────────────────────┘
```

### 5. Color Palette Update

```text
Current primary:  hsl(217, 91%, 50%)  — bright blue
New primary:      hsl(215, 50%, 23%)  — dark navy (#1a3764)
Accent/action:    hsl(217, 91%, 50%)  — keep blue for buttons/links
Sidebar bg:       hsl(215, 50%, 20%)  — dark navy
Sidebar text:     white/light gray
```

### Technical Details

- The sidebar will include all gc-ui nav items (Dashboard, Classes, Registration, etc.) but they'll be disabled/external links since they live in the gc-ui host app. Only Training sub-items will be functional
- When integrated into gc-ui, the TrainingLayout wrapper would be removed and the pages would render inside gc-ui's AppShell `<Outlet />`
- The API service will be structured so that when `USE_MOCK = false`, it follows the exact same fetch pattern as gc-ui's other API modules (token from MSAL, same base URL)

