"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { setLessonCompleted } from "../actions";

export function CompleteButton({
  lessonId,
  courseSlug,
  completed,
  nextHref,
}: {
  lessonId: string;
  courseSlug: string;
  completed: boolean;
  nextHref: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(completed);

  const toggle = () =>
    start(async () => {
      const target = !optimistic;
      setOptimistic(target);
      const res = await setLessonCompleted(lessonId, courseSlug, target);
      if (!res.ok || !res.result) {
        toast.error(res.message ?? "Gagal menyimpan progres");
        return;
      }
      if (target && res.result.course_completed) {
        toast.success("🎉 Selamat! Kamu menuntaskan kelas ini.");
        router.push(`/belajar/${courseSlug}`);
      } else if (target && nextHref) {
        toast.success(`Progres ${res.result.progress}% — lanjut ke materi berikutnya`);
        router.push(nextHref);
      }
    });

  return (
    <Button
      onClick={toggle}
      disabled={pending}
      variant={optimistic ? "outline" : "default"}
      className={optimistic ? "border-success/30 text-success" : ""}
    >
      {pending ? <Loader2 className="animate-spin" /> : optimistic ? <CheckCircle2 /> : <Circle />}
      {optimistic ? "Selesai" : nextHref ? "Tandai selesai & lanjut" : "Tandai selesai"}
    </Button>
  );
}
