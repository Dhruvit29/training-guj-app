import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLms } from '@/contexts/LmsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock, BookOpen, Play, Settings } from 'lucide-react';
import type { CourseWithProgress } from '@/types/lms';

const CourseCatalog: React.FC = () => {
  const { getCoursesWithProgress } = useLms();
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<string>('all');
  const navigate = useNavigate();

  const courses = getCoursesWithProgress().filter(c => c.isPublished);
  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))];

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.category === filter;
    return matchSearch && matchFilter;
  });

  const enrolled = filtered.filter(c => c.enrolled && c.progressPercent < 100);
  const completed = filtered.filter(c => c.progressPercent === 100);
  const available = filtered.filter(c => !c.enrolled);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="bg-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Training Center</h1>
              <p className="text-muted-foreground mt-1">Grow your skills with guided video courses</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/training/admin')} className="gap-2">
              <Settings className="w-4 h-4" />
              Admin
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={filter === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(cat)}
                  className="capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Continue Learning */}
        {enrolled.length > 0 && (
          <CourseSection title="Continue Learning" icon={<Play className="w-5 h-5 text-primary" />} courses={enrolled} />
        )}

        {/* Available Courses */}
        {available.length > 0 && (
          <CourseSection title="Available Courses" icon={<BookOpen className="w-5 h-5 text-primary" />} courses={available} />
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <CourseSection title="Completed" icon={<BookOpen className="w-5 h-5 text-muted-foreground" />} courses={completed} />
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No courses found</p>
          </div>
        )}
      </div>
    </div>
  );
};

function CourseSection({ title, icon, courses }: { title: string; icon: React.ReactNode; courses: CourseWithProgress[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <Badge variant="secondary" className="ml-2">{courses.length}</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}

function CourseCard({ course }: { course: CourseWithProgress }) {
  return (
    <Link to={`/training/${course.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer h-full">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {course.enrolled && course.progressPercent > 0 && course.progressPercent < 100 && (
            <div className="absolute bottom-0 left-0 right-0">
              <div className="h-1 bg-primary" style={{ width: `${course.progressPercent}%` }} />
            </div>
          )}
          {course.progressPercent === 100 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]">Completed</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <Badge variant="outline" className="text-xs">{course.category}</Badge>
          <h3 className="font-semibold text-foreground leading-tight line-clamp-2">{course.title}</h3>
          <p className="text-xs text-muted-foreground">{course.instructor}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.totalDurationMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {course.totalLessons} lessons
            </span>
          </div>
          {course.enrolled && course.progressPercent > 0 && course.progressPercent < 100 && (
            <div className="pt-1">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                <span>{course.progressPercent}%</span>
              </div>
              <Progress value={course.progressPercent} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default CourseCatalog;
