"use client";

import type { UseFormRegisterReturn } from "react-hook-form";

type AuthFieldProps = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  error?: string;
  registration: UseFormRegisterReturn;
};

export function AuthField({ id, label, type, placeholder, error, registration }: AuthFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor={id}>
        {label}
      </label>
      <input id={id} type={type} placeholder={placeholder} className="lms-input" {...registration} />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
