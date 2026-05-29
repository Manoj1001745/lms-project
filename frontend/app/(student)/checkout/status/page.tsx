"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeading, PageShell } from "@/components/ui/page-primitives";

export default function CheckoutStatusPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const course = searchParams.get("course");
  const sessionId = searchParams.get("session_id");

  const isSuccess = status === "success";
  const title = isSuccess ? "Payment Successful" : "Payment Cancelled";
  const description = isSuccess
    ? "Your payment was processed. Enrollment will be confirmed shortly by webhook."
    : "No charge was completed. You can try checkout again when ready.";

  return (
    <PageShell>
      <PageHeading
        title={title}
        subtitle={description}
        badge={isSuccess ? "Success" : "Cancelled"}
      />
      {sessionId && <p className="mt-2 text-xs text-slate-500">Stripe Session: {sessionId}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/my-courses"
          className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
        >
          Go to My Courses
        </Link>
        <Link
          href={course ? `/courses/${course}` : "/courses"}
          className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Back to Course
        </Link>
      </div>
    </PageShell>
  );
}
