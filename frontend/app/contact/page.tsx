"use client";

import { useState } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import { SiteChrome } from "@/components/public/site-chrome";
import { api } from "@/services/api";

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export default function ContactPage() {
  const [form, setForm] = useState<ContactPayload>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await api.post<{ message: string }>("/contact", form);
      setSuccessMessage(response.data.message);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setErrorMessage(axiosError.response?.data?.message ?? "Could not send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteChrome>
      <section className="mx-auto max-w-4xl p-6 md:p-8">
        <div className="lms-card-ring md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Contact Us</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Get in touch with LearningHun</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Share your question, support request, or partnership inquiry. We will respond as soon as possible.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="lms-input mt-1 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="lms-input mt-1 text-sm"
              />
            </label>
          </div>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Phone (optional)
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="lms-input mt-1 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Message
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              className="lms-input mt-1 text-sm"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
            <Link
              href="/"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
            >
              Back to Home
            </Link>
          </div>
        </form>

        {successMessage && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
            {successMessage}
          </p>
        )}
        {errorMessage && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {errorMessage}
          </p>
        )}
        </div>
      </section>
    </SiteChrome>
  );
}

