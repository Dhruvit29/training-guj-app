import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import muiTheme from "@/theme/muiTheme";
import { LmsProvider } from "@/contexts/LmsContext";
import TrainingLayout from "@/components/layout/TrainingLayout";
import CourseCatalog from "@/pages/training/CourseCatalog";
import CourseDetail from "@/pages/training/CourseDetail";
import LessonPlayer from "@/pages/training/LessonPlayer";
import CourseCertificate from "@/pages/training/CourseCertificate";
import AdminCourses from "@/pages/training/AdminCourses";
import AdminCurriculum from "@/pages/training/AdminCurriculum";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <LmsProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<TrainingLayout />}>
              <Route path="/" element={<CourseCatalog />} />
              <Route path="/training" element={<CourseCatalog />} />
              <Route path="/training/admin" element={<AdminCourses />} />
              <Route path="/training/admin/:courseId" element={<AdminCurriculum />} />
              <Route path="/training/:courseId" element={<CourseDetail />} />
              <Route path="/training/:courseId/certificate" element={<CourseCertificate />} />
              <Route path="/training/:courseId/:lessonId" element={<LessonPlayer />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LmsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
