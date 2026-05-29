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

const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function UserRegisterPage() {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormData) => {
    setFormError(null);
    try {
      const response = await userApi.post("/register", {
        name: values.name,
        email: values.email,
        password: values.password,
      });
      const token = response.data?.token as string;
      setSession(token, "student");
      router.push("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setFormError(axiosError.response?.data?.message ?? "Unable to register right now.");
    }
  };

  return (
    <AuthShell>
      <AuthCard title="Create account" subtitle="Start learning with personalized LMS features.">
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthField
            id="name"
            label="Full name"
            type="text"
            placeholder="LearningHun Student"
            registration={register("name")}
            error={errors.name?.message}
          />
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
          <AuthField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="********"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-green px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link className="font-medium text-brand-blue" href="/login">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}

