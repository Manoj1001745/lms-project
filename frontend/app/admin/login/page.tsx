"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthField } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { adminApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

const adminLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (values: AdminLoginFormData) => {
    setFormError(null);
    try {
      const response = await adminApi.post("/login", values);
      const token = response.data?.token as string;
      setSession(token, "admin");
      router.push("/admin/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setFormError(axiosError.response?.data?.message ?? "Unable to login right now.");
    }
  };

  return (
    <AuthShell>
      <AuthCard title="Admin Login" subtitle="Securely access LearningHun administration controls.">
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthField
            id="email"
            label="Admin email"
            type="email"
            placeholder="superadmin@learninghun.com"
            registration={register("email")}
            error={errors.email?.message}
          />
          <AuthField
            id="password"
            label="Password"
            type="password"
            placeholder="********"
            registration={register("password")}
            error={errors.password?.message}
          />
          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-yellow px-4 py-2 font-semibold text-slate-900 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in as Admin"}
          </button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
