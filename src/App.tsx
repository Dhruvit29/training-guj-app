import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import muiTheme from "@/theme/muiTheme";
import {
  LmsProvider,
  CourseCatalog,
  CourseDetail,
  LessonPlayer,
  CourseCertificate,
  AdminCourses,
  AdminCurriculum,
} from "@/features/TrainingLms";
import TrainingLayout from "@/components/layout/TrainingLayout";
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
