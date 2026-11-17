import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { CourseForm } from "@/features/courses/components/course-form";

export const metadata: Metadata = { title: "Kelas Baru" };

export default function NewCoursePage() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader back={{ href: "/admin/kelas", label: "Kelas" }} title="Kelas Baru" description="Lengkapi detail kelas lalu terbitkan." />
      <CourseForm />
    </div>
  );
}
