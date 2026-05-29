 "use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthField } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { userApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function UserLoginPage() {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormData) => {
    setFormError(null);
    try {
      const response = await userApi.post("/login", values);
      const token = response.data?.token as string;
      setSession(token, "student");
      router.push("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setFormError(axiosError.response?.data?.message ?? "Unable to login right now.");
    }
  };

  return (
    <AuthShell>
      <AuthCard title="User Login" subtitle="Access your LearningHun student workspace.">
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthField
            id="email"
            label="Email"
            type="email"
            placeholder="student@learninghun.com"
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
            className="w-full rounded-lg bg-brand-blue px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          New learner?{" "}
          <Link className="font-medium text-brand-blue" href="/register">
            Create an account
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}

