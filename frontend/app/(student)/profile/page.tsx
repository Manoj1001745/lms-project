"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthField } from "@/components/auth/auth-field";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { userApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

const profileSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
  })
  .refine((data) => !data.password || data.password.length >= 8, {
    message: "Password must be at least 8 characters",
    path: ["password"],
  })
  .refine((data) => !data.password || data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;

type MeResponse = {
  user: {
    id: number;
    name: string;
    email: string;
    role?: { slug?: string; name?: string } | null;
  };
};

export default function ProfilePage() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const meQuery = useQuery({
    queryKey: ["user-me"],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await userApi.get<MeResponse>("/me");
      return response.data.user;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: meQuery.data
      ? {
          name: meQuery.data.name,
          email: meQuery.data.email,
          password: "",
          password_confirmation: "",
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (values: ProfileFormData) => {
      const payload: Record<string, string> = {
        name: values.name,
        email: values.email,
      };

      if (values.password) {
        payload.password = values.password;
        payload.password_confirmation = values.password_confirmation ?? "";
      }

      await userApi.patch("/profile", payload);
    },
    onSuccess: async () => {
      setErrorMessage(null);
      setStatusMessage("Profile updated successfully.");
      await queryClient.invalidateQueries({ queryKey: ["user-me"] });
      reset({
        name: meQuery.data?.name ?? "",
        email: meQuery.data?.email ?? "",
        password: "",
        password_confirmation: "",
      });
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
      const validationMessage = axiosError.response?.data?.errors
        ? Object.values(axiosError.response.data.errors).flat().join(" ")
        : null;
      setStatusMessage(null);
      setErrorMessage(validationMessage ?? axiosError.response?.data?.message ?? "Unable to update profile.");
    },
  });

  if (meQuery.isLoading) {
    return (
      <PageShell>
        <PageMessage message="Loading profile..." tone="loading" />
      </PageShell>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <PageShell>
        <PageMessage message="Unable to load your profile right now." tone="error" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeading
        title="My Profile"
        subtitle="Update your account details and password."
        badge={meQuery.data.role?.name ?? "Student"}
      />

      <form
        className="lms-card mt-6 max-w-xl space-y-4 p-6"
        onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
      >
        <AuthField
          id="name"
          label="Full name"
          type="text"
          placeholder="Your full name"
          registration={register("name")}
          error={errors.name?.message}
        />
        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          registration={register("email")}
          error={errors.email?.message}
        />
        <AuthField
          id="password"
          label="New password"
          type="password"
          placeholder="Leave blank to keep current password"
          registration={register("password")}
          error={errors.password?.message}
        />
        <AuthField
          id="password_confirmation"
          label="Confirm new password"
          type="password"
          placeholder="Repeat new password"
          registration={register("password_confirmation")}
          error={errors.password_confirmation?.message}
        />

        {statusMessage && <p className="text-sm text-green-700">{statusMessage}</p>}
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <button
          type="submit"
          disabled={isSubmitting || updateMutation.isPending}
          className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting || updateMutation.isPending ? "Saving..." : "Save changes"}
        </button>
      </form>
    </PageShell>
  );
}
