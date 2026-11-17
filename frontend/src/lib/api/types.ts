/** Contracts mirrored from the FastAPI schemas (backend/app/modules/*\/schemas.py). */

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export type UserRole = "admin" | "editor" | "member";

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user: User;
};

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type CourseListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  level: CourseLevel;
  tags: string[];
  thumbnail_url: string | null;
  duration_minutes: number;
  lessons_count: number;
  price: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
};

export type Course = CourseListItem & { description: string; updated_at: string };

export type PostStatus = "draft" | "published" | "archived";

export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_url: string | null;
  tags: string[];
  reading_minutes: number;
  status: PostStatus;
  published_at: string | null;
  author: { id: string; full_name: string } | null;
  created_at: string;
};

export type Post = PostListItem & { content: string; updated_at: string };

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type DashboardStats = {
  courses_total: number;
  courses_published: number;
  posts_total: number;
  posts_published: number;
  messages_unread: number;
  users_total: number;
  learners_total: number;
  enrollments_total: number;
};

// --- Curriculum ----------------------------------------------------------------
export type LessonKind = "video" | "article" | "quiz" | "exercise";

export type LessonOutline = {
  id: string;
  title: string;
  slug: string;
  kind: LessonKind;
  duration_minutes: number;
  is_preview: boolean;
  position: number;
};

export type ResourceKind = "docs" | "article" | "video" | "download" | "tool";
export type Resource = { title: string; url: string; kind: ResourceKind };

export type QuizOption = { id: string; text: string };
export type QuizQuestion = {
  id: string;
  prompt: string;
  multiple: boolean;
  options: QuizOption[];
  answer: string[];
  explanation: string;
};
export type QuizSpec = { pass_score: number; questions: QuizQuestion[] };
export type PublicQuiz = { pass_score: number; questions: Omit<QuizQuestion, "answer" | "explanation">[] };

export type ExerciseLanguage = "python" | "javascript";
export type ExerciseSpec = {
  language: ExerciseLanguage;
  instructions: string;
  starter_code: string;
  solution: string;
  expected_output: string;
  hints: string[];
};
export type PublicExercise = Omit<ExerciseSpec, "solution">;

type LessonBody = {
  module_id: string;
  summary: string;
  content: string;
  video_url: string | null;
  objectives: string[];
  resources: Resource[];
};

/** Full lesson for editors (includes answer keys and solutions). */
export type Lesson = LessonOutline &
  LessonBody & { course_id: string; quiz: QuizSpec | null; exercise: ExerciseSpec | null };

/** Learner projection — answer keys and solutions are never sent. */
export type LearnerLesson = LessonOutline &
  LessonBody & { quiz: PublicQuiz | null; exercise: PublicExercise | null };

export const KIND_LABEL: Record<LessonKind, string> = {
  video: "Video",
  article: "Bacaan",
  quiz: "Kuis",
  exercise: "Latihan coding",
};

export type ModuleOutline = { id: string; title: string; position: number; lessons: LessonOutline[] };

// --- Learning ------------------------------------------------------------------
export type EnrollmentStatus = "active" | "completed";

export type LearnerCourseInfo = Pick<
  Course,
  "id" | "title" | "slug" | "summary" | "category" | "level" | "thumbnail_url" | "lessons_count" | "duration_minutes" | "price"
>;

export type Enrollment = {
  id: string;
  status: EnrollmentStatus;
  created_at: string;
  completed_at: string | null;
  last_accessed_at: string | null;
  last_lesson_id: string | null;
  course: LearnerCourseInfo;
  completed_lessons: number;
  progress: number;
};

export type LearnerModule = Omit<ModuleOutline, "lessons"> & {
  lessons: (LessonOutline & { completed: boolean })[];
};

export type LearnerCourse = {
  course: LearnerCourseInfo;
  description: string;
  enrollment: Enrollment | null;
  modules: LearnerModule[];
};

export type AssessmentState = {
  attempts: number;
  best_score: number | null;
  passed: boolean;
  solution_unlocked: boolean;
};

export type LessonView = {
  course: LearnerCourseInfo;
  module_title: string;
  lesson: LearnerLesson;
  enrolled: boolean;
  completed: boolean;
  note: string;
  assessment: AssessmentState;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

export type ProgressResult = {
  completed: boolean;
  completed_lessons: number;
  progress: number;
  course_completed: boolean;
};

export type QuizResult = {
  score: number;
  passed: boolean;
  pass_score: number;
  correct_count: number;
  total: number;
  results: { question_id: string; correct: boolean; selected: string[]; answer: string[]; explanation: string }[];
  attempts: number;
  progress: ProgressResult | null;
};

export type ExerciseResult = {
  passed: boolean;
  attempts: number;
  solution_unlocked: boolean;
  progress: ProgressResult | null;
};

export type AdminEnrollment = {
  id: string;
  status: EnrollmentStatus;
  created_at: string;
  completed_at: string | null;
  last_accessed_at: string | null;
  user: { id: string; full_name: string; email: string };
  course: { id: string; title: string; slug: string };
  completed_lessons: number;
  progress: number;
};

export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown };
};

export const LEVEL_LABEL: Record<CourseLevel, string> = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
};

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  draft: "Draf",
  published: "Terbit",
  archived: "Arsip",
};
