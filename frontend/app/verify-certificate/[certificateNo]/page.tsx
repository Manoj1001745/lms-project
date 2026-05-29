"use client";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { api } from "@/services/api";

type VerificationResponse = {
  valid: boolean;
  message?: string;
  certificate?: {
    certificate_no: string;
    issued_at: string;
    student_name: string;
    course_title: string;
    course_slug: string;
  };
};

export default function VerifyCertificatePage() {
  const params = useParams<{ certificateNo: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["verify-certificate", params.certificateNo],
    queryFn: async () => {
      const response = await api.get<VerificationResponse>(
        `/certificates/verify/${params.certificateNo}`,
      );
      return response.data;
    },
    retry: false,
  });

  if (isLoading) {
    return <main className="min-h-screen bg-slate-50 p-8 text-slate-700">Verifying certificate...</main>;
  }

  if (isError) {
    const axiosError = error as AxiosError<VerificationResponse>;
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-100 bg-red-50 p-6">
          <h1 className="text-2xl font-bold text-red-700">Invalid Certificate</h1>
          <p className="mt-2 text-red-700">
            {axiosError.response?.data?.message ?? "This certificate could not be verified."}
          </p>
        </div>
      </main>
    );
  }

  if (!data?.valid || !data.certificate) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-100 bg-red-50 p-6">
          <h1 className="text-2xl font-bold text-red-700">Invalid Certificate</h1>
          <p className="mt-2 text-red-700">This certificate could not be verified.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-brand-green">Certificate Verified</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{data.certificate.course_title}</h1>
        <p className="mt-3 text-slate-700">
          Awarded to <strong>{data.certificate.student_name}</strong>
        </p>
        <p className="mt-2 text-sm text-slate-600">Certificate No: {data.certificate.certificate_no}</p>
        <p className="mt-1 text-sm text-slate-600">
          Issued At: {new Date(data.certificate.issued_at).toLocaleDateString()}
        </p>
      </div>
    </main>
  );
}

