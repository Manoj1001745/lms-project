"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { getApiErrorMessage } from "@/lib/api-errors";
import { adminApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type SystemStatus = {
  cache_driver: string;
  app_env: string;
  debug_mode: boolean;
};

type SiteSettings = {
  site_name: string;
  site_tagline: string;
  contact_email: string;
  contact_phone: string;
  support_hours: string;
  facebook_url: string;
  instagram_url: string;
  maintenance_mode: string;
};

const defaultSiteSettings: SiteSettings = {
  site_name: "",
  site_tagline: "",
  contact_email: "",
  contact_phone: "",
  support_hours: "",
  facebook_url: "",
  instagram_url: "",
  maintenance_mode: "0",
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [siteForm, setSiteForm] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    if (!token) router.replace("/admin/login");
  }, [router, token]);

  const statusQuery = useQuery({
    queryKey: ["admin-system-status"],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await adminApi.get<SystemStatus>("/system/status");
      return response.data;
    },
  });

  const siteQuery = useQuery({
    queryKey: ["admin-site-settings"],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await adminApi.get<{ settings: SiteSettings }>("/settings/site");
      return response.data.settings;
    },
  });

  useEffect(() => {
    if (siteQuery.data) setSiteForm(siteQuery.data);
  }, [siteQuery.data]);

  const saveSiteMutation = useMutation({
    mutationFn: async () => {
      const response = await adminApi.put<{ message: string }>("/settings/site", {
        ...siteForm,
        maintenance_mode: siteForm.maintenance_mode === "1",
      });
      return response.data;
    },
    onSuccess: (data) => {
      setError(null);
      setMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
    },
    onError: (err) => {
      setMessage(null);
      setError(getApiErrorMessage(err, "Unable to save site settings."));
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      const response = await adminApi.post<{ message: string }>("/system/clear-cache");
      return response.data;
    },
    onSuccess: (data) => {
      setError(null);
      setMessage(data.message);
    },
    onError: (err) => {
      setMessage(null);
      setError(getApiErrorMessage(err, "Unable to clear cache."));
    },
  });

  return (
    <PageShell>
      <PageHeading
        title="Settings"
        subtitle="Manage site information, contact details, and performance tools."
        badge="Administration"
       
      />

      {message && <PageMessage className="mt-4" message={message} tone="success" />}
      {error && <PageMessage className="mt-4" message={error} tone="error" />}

      <section className="lms-card mt-6 p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Site settings</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Branding and contact info shown on the public website.</p>

        {siteQuery.isLoading ? (
          <p className="mt-4 text-sm text-slate-500">Loading settings...</p>
        ) : (
          <form
            className="mt-4 grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setMessage(null);
              setError(null);
              saveSiteMutation.mutate();
            }}
          >
            <label className="text-sm text-slate-700 dark:text-slate-200">
              Site name
              <input
                required
                value={siteForm.site_name}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, site_name: e.target.value }))}
                className="lms-input mt-1"
              />
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              Contact email
              <input
                type="email"
                required
                value={siteForm.contact_email}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, contact_email: e.target.value }))}
                className="lms-input mt-1"
              />
            </label>
            <label className="md:col-span-2 text-sm text-slate-700 dark:text-slate-200">
              Tagline
              <input
                value={siteForm.site_tagline}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, site_tagline: e.target.value }))}
                className="lms-input mt-1"
              />
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              Contact phone
              <input
                value={siteForm.contact_phone}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, contact_phone: e.target.value }))}
                className="lms-input mt-1"
              />
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              Support hours
              <input
                value={siteForm.support_hours}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, support_hours: e.target.value }))}
                className="lms-input mt-1"
              />
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              Facebook URL
              <input
                value={siteForm.facebook_url}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, facebook_url: e.target.value }))}
                placeholder="https://facebook.com/..."
                className="lms-input mt-1"
              />
            </label>
            <label className="text-sm text-slate-700 dark:text-slate-200">
              Instagram URL
              <input
                value={siteForm.instagram_url}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, instagram_url: e.target.value }))}
                placeholder="https://instagram.com/..."
                className="lms-input mt-1"
              />
            </label>
            <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={siteForm.maintenance_mode === "1"}
                onChange={(e) =>
                  setSiteForm((prev) => ({
                    ...prev,
                    maintenance_mode: e.target.checked ? "1" : "0",
                  }))
                }
              />
              Maintenance mode (hide public catalog)
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saveSiteMutation.isPending}
                className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saveSiteMutation.isPending ? "Saving..." : "Save site settings"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="lms-card p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">System status</h2>
          {statusQuery.data ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Environment: {statusQuery.data.app_env}</li>
              <li>Cache driver: {statusQuery.data.cache_driver}</li>
              <li>Debug mode: {statusQuery.data.debug_mode ? "On" : "Off"}</li>
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Loading...</p>
          )}
        </article>

        <article className="lms-card p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Performance</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Clear cache after updating courses, categories, or site settings.
          </p>
          <button
            type="button"
            onClick={() => clearCacheMutation.mutate()}
            disabled={clearCacheMutation.isPending}
            className="mt-4 rounded-lg bg-brand-yellow px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
          >
            {clearCacheMutation.isPending ? "Clearing..." : "Clear cache now"}
          </button>
        </article>
      </section>
    </PageShell>
  );
}
