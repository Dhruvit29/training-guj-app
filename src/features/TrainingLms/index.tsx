/**
 * TrainingLms feature barrel — re-exports the default page (CourseCatalog)
 * wrapped in the LmsProvider context.
 */
export { LmsProvider } from './context/LmsContext';
export { default as CourseCatalog } from './pages/CourseCatalog';
export { default as CourseDetail } from './pages/CourseDetail';
export { default as LessonPlayer } from './pages/LessonPlayer';
export { default as AdminCourses } from './pages/AdminCourses';
export { default as AdminCurriculum } from './pages/AdminCurriculum';
export { default as CourseCertificate } from './pages/CourseCertificate';
