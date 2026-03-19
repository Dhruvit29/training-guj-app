import type { Course, Section, Lesson } from '@/types/lms';

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Satsang Diksha: Understanding Core Principles',
    description: 'A comprehensive study of the Satsang Diksha scripture covering its foundational principles, daily practices, and spiritual guidance for leading a virtuous life. This course walks through each chapter with detailed explanations and real-world applications.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=340&fit=crop',
    isPublished: true,
    createdAt: '2024-01-15',
    instructor: 'Sadhu Keshavjivandas',
    category: 'Scripture Study',
    totalDurationMinutes: 180,
  },
  {
    id: 'course-2',
    title: 'Effective Karyakar Leadership',
    description: 'Develop essential leadership skills for serving as a karyakar. Learn communication, planning, team coordination, and how to inspire youth through personal example and structured sabha activities.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=340&fit=crop',
    isPublished: true,
    createdAt: '2024-02-20',
    instructor: 'Training Team',
    category: 'Leadership',
    totalDurationMinutes: 120,
  },
  {
    id: 'course-3',
    title: 'Sabha Planning & Presentation Skills',
    description: 'Master the art of planning engaging sabhas. Covers topic selection, presentation delivery, use of multimedia, audience engagement techniques, and post-sabha follow-up strategies.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=340&fit=crop',
    isPublished: true,
    createdAt: '2024-03-10',
    instructor: 'Training Team',
    category: 'Skills',
    totalDurationMinutes: 90,
  },
  {
    id: 'course-4',
    title: 'Youth Mentoring Fundamentals',
    description: 'Learn how to effectively mentor and guide youth through their spiritual journey. Topics include building trust, active listening, goal setting, and creating personalized growth plans.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=340&fit=crop',
    isPublished: true,
    createdAt: '2024-04-05',
    instructor: 'Senior Karyakars',
    category: 'Mentoring',
    totalDurationMinutes: 150,
  },
  {
    id: 'course-5',
    title: 'Digital Tools for Seva',
    description: 'Get up to speed with the digital tools used for managing attendance, registration, grading, and communication. Hands-on walkthroughs of the GA Admin platform and best practices.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop',
    isPublished: false,
    createdAt: '2024-05-01',
    instructor: 'Tech Team',
    category: 'Technology',
    totalDurationMinutes: 60,
  },
];

export const mockSections: Section[] = [
  // Course 1 sections
  { id: 'sec-1-1', courseId: 'course-1', title: 'Introduction & Overview', sortOrder: 1 },
  { id: 'sec-1-2', courseId: 'course-1', title: 'Daily Practices', sortOrder: 2 },
  { id: 'sec-1-3', courseId: 'course-1', title: 'Spiritual Principles', sortOrder: 3 },
  // Course 2 sections
  { id: 'sec-2-1', courseId: 'course-2', title: 'Leadership Foundations', sortOrder: 1 },
  { id: 'sec-2-2', courseId: 'course-2', title: 'Team Management', sortOrder: 2 },
  // Course 3 sections
  { id: 'sec-3-1', courseId: 'course-3', title: 'Planning Your Sabha', sortOrder: 1 },
  { id: 'sec-3-2', courseId: 'course-3', title: 'Presentation Techniques', sortOrder: 2 },
  // Course 4 sections
  { id: 'sec-4-1', courseId: 'course-4', title: 'Building Relationships', sortOrder: 1 },
  { id: 'sec-4-2', courseId: 'course-4', title: 'Growth Planning', sortOrder: 2 },
  // Course 5 sections
  { id: 'sec-5-1', courseId: 'course-5', title: 'Platform Overview', sortOrder: 1 },
];

export const mockLessons: Lesson[] = [
  // Course 1, Section 1
  { id: 'les-1-1-1', sectionId: 'sec-1-1', title: 'Welcome & Course Overview', description: 'Introduction to the course structure and objectives.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 10, sortOrder: 1 },
  { id: 'les-1-1-2', sectionId: 'sec-1-1', title: 'Historical Context', description: 'Understanding the historical significance and origin.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 15, sortOrder: 2 },
  // Course 1, Section 1 — Quiz
  { id: 'les-1-1-3', sectionId: 'sec-1-1', title: 'Section 1 Quiz', description: 'Test your understanding of the introduction.', type: 'quiz', videoUrl: '', durationMinutes: 5, sortOrder: 3, quizQuestions: [
    { id: 'q1', question: 'What is the primary purpose of this course?', options: [
      { id: 'q1-a', text: 'Entertainment' },
      { id: 'q1-b', text: 'Understanding core principles of Satsang Diksha' },
      { id: 'q1-c', text: 'Physical fitness' },
      { id: 'q1-d', text: 'Cooking' },
    ], correctOptionId: 'q1-b' },
    { id: 'q2', question: 'Who is the instructor of this course?', options: [
      { id: 'q2-a', text: 'Training Team' },
      { id: 'q2-b', text: 'Tech Team' },
      { id: 'q2-c', text: 'Sadhu Keshavjivandas' },
      { id: 'q2-d', text: 'Senior Karyakars' },
    ], correctOptionId: 'q2-c' },
  ]},
  // Course 1, Section 2
  { id: 'les-1-2-1', sectionId: 'sec-1-2', title: 'Morning Routine & Puja', description: 'Establishing a consistent daily spiritual routine.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 20, sortOrder: 1 },
  { id: 'les-1-2-2', sectionId: 'sec-1-2', title: 'Evening Reflection', description: 'Practices for end-of-day spiritual reflection.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 15, sortOrder: 2 },
  { id: 'les-1-2-3', sectionId: 'sec-1-2', title: 'Weekly Observances', description: 'Special practices for ekadashi and other weekly observances.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 20, sortOrder: 3 },
  // Course 1, Section 3
  { id: 'les-1-3-1', sectionId: 'sec-1-3', title: 'Understanding Akshar-Purushottam', description: 'Core theological principles explained.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 25, sortOrder: 1 },
  { id: 'les-1-3-2', sectionId: 'sec-1-3', title: 'Living with Purpose', description: 'Applying spiritual principles in daily life.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 20, sortOrder: 2 },
  // Course 2, Section 1
  { id: 'les-2-1-1', sectionId: 'sec-2-1', title: 'What Makes a Great Leader', description: 'Qualities of effective spiritual leadership.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 15, sortOrder: 1 },
  { id: 'les-2-1-2', sectionId: 'sec-2-1', title: 'Leading by Example', description: 'How personal conduct shapes leadership effectiveness.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 20, sortOrder: 2 },
  // Course 2, Section 2
  { id: 'les-2-2-1', sectionId: 'sec-2-2', title: 'Delegation & Empowerment', description: 'Empowering team members through effective delegation.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 15, sortOrder: 1 },
  { id: 'les-2-2-2', sectionId: 'sec-2-2', title: 'Conflict Resolution', description: 'Handling disagreements with grace and wisdom.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 20, sortOrder: 2 },
  // Course 3, Section 1
  { id: 'les-3-1-1', sectionId: 'sec-3-1', title: 'Topic Selection Framework', description: 'How to choose relevant and engaging sabha topics.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 15, sortOrder: 1 },
  { id: 'les-3-1-2', sectionId: 'sec-3-1', title: 'Structuring Content', description: 'Building a logical flow for your presentation.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 15, sortOrder: 2 },
  // Course 3, Section 2
  { id: 'les-3-2-1', sectionId: 'sec-3-2', title: 'Engaging Your Audience', description: 'Interactive techniques to keep attendees involved.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 20, sortOrder: 1 },
  { id: 'les-3-2-2', sectionId: 'sec-3-2', title: 'Using Multimedia Effectively', description: 'Best practices for slides, videos, and visuals.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 15, sortOrder: 2 },
  // Course 4, Section 1
  { id: 'les-4-1-1', sectionId: 'sec-4-1', title: 'First Impressions Matter', description: 'Building initial rapport with mentees.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 15, sortOrder: 1 },
  { id: 'les-4-1-2', sectionId: 'sec-4-1', title: 'Active Listening Skills', description: 'Techniques for truly hearing and understanding youth.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 20, sortOrder: 2 },
  // Course 4, Section 2
  { id: 'les-4-2-1', sectionId: 'sec-4-2', title: 'Setting Spiritual Goals', description: 'Helping mentees define meaningful goals.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 20, sortOrder: 1 },
  { id: 'les-4-2-2', sectionId: 'sec-4-2', title: 'Tracking Progress', description: 'Methods for monitoring and celebrating growth.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 15, sortOrder: 2 },
  // Course 5, Section 1
  { id: 'les-5-1-1', sectionId: 'sec-5-1', title: 'GA Admin Walkthrough', description: 'Complete tour of the GA Admin platform features.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 30, sortOrder: 1 },
  { id: 'les-5-1-2', sectionId: 'sec-5-1', title: 'Tips & Tricks', description: 'Power user tips for maximizing efficiency.', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', durationMinutes: 20, sortOrder: 2 },
];
