"use client";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import { useState } from "react";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { userApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type CertificateItem = {
  id: number;
  certificate_no: string;
  issued_at: string;
  course?: {
    title: string;
    slug: string;
  } | null;
  verification_url: string;
};

type CertificatesResponse = {
  certificates: CertificateItem[];
};

export default function CertificatesPage() {
  const token = useAuthStore((state) => state.token);
  const [downloadLoadingId, setDownloadLoadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["certificates"],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await userApi.get<CertificatesResponse>("/certificates");
      return response.data;
    },
  });

  const handleDownload = async (certificateId: number, certificateNo: string) => {
    setDownloadError(null);
    setDownloadLoadingId(certificateId);
    try {
      const response = await userApi.get(`/certificates/${certificateId}/download`, {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `learninghun-certificate-${certificateNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setDownloadError(axiosError.response?.data?.message ?? "Unable to download certificate now.");
    } finally {
      setDownloadLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <PageMessage message="Loading certificates..." tone="loading" />
      </PageShell>
    );
  }

  if (isError || !data) {
    return (
      <PageShell>
        <PageMessage message="Unable to load certificates right now." tone="error" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeading
        title="Certificates"
        subtitle="Your completed-course certificates are listed here."
        badge={`${data.certificates.length} Issued`}
      />

      <section className="mt-6 grid gap-4">
        {downloadError && (
          <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{downloadError}</p>
        )}
        {data.certificates.length === 0 && (
          <div className="lms-card p-6 text-slate-600 dark:text-slate-300">
            No certificates yet. Complete enrolled courses to receive certificates.
          </div>
        )}

        {data.certificates.map((item) => (
          <article key={item.id} className="lms-card p-5">
            <p className="text-xs uppercase tracking-wide text-brand-green">Issued Certificate</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{item.course?.title ?? "Course"}</h2>
            <p className="mt-1 text-sm text-slate-600">Certificate No: {item.certificate_no}</p>
            <p className="mt-1 text-sm text-slate-600">
              Issued At: {new Date(item.issued_at).toLocaleDateString()}
            </p>
            <Link
              href={`/verify-certificate/${item.certificate_no}`}
              className="mt-2 inline-flex text-sm font-semibold text-brand-green underline"
            >
              Verify Certificate
            </Link>
            <button
              type="button"
              onClick={() => handleDownload(item.id, item.certificate_no)}
              disabled={downloadLoadingId === item.id}
              className="mt-4 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {downloadLoadingId === item.id ? "Generating PDF..." : "Download PDF"}
            </button>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
