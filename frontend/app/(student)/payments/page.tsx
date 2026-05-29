"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTable, SortHeader } from "@/components/ui/data-table";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { downloadAuthenticatedExport } from "@/lib/download-export";
import { userApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type PaymentRecord = {
  id: number;
  transaction_id: string;
  gateway: string;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  course?: { title: string; slug: string } | null;
};

type UserPaymentsResponse = {
  data: PaymentRecord[];
};

export default function PaymentsPage() {
  const token = useAuthStore((state) => state.token);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<"created_at" | "amount">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (status !== "all") params.status = status;
    if (from) params.from = from;
    if (to) params.to = to;
    return params;
  }, [status, from, to]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-payments", queryParams],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await userApi.get<UserPaymentsResponse>("/payments", {
        params: queryParams,
      });
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <PageShell>
        <PageMessage message="Loading payment history..." tone="loading" />
      </PageShell>
    );
  }

  if (isError || !data) {
    return (
      <PageShell>
        <PageMessage message="Unable to load payment records right now." tone="error" />
      </PageShell>
    );
  }

  const sortedPayments = [...data.data].sort((a, b) => {
    if (sortBy === "amount") {
      const aNum = Number(a.amount);
      const bNum = Number(b.amount);
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    }

    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
  });

  return (
    <PageShell>
      <PageHeading
        title="Payment History"
        subtitle="Track all your purchases, gateways, and transaction states."
        badge="Billing"
      />
      <div className="lms-card mt-4 flex flex-wrap items-end gap-3 p-4">
        <label className="text-sm text-slate-700">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="ml-2 rounded-md border px-2 py-1"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="text-sm text-slate-700">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="ml-2 rounded-md border px-2 py-1"
          />
        </label>
        <label className="text-sm text-slate-700">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="ml-2 rounded-md border px-2 py-1"
          />
        </label>
        <button
          type="button"
          disabled={isExporting}
          onClick={async () => {
            setExportError(null);
            setIsExporting(true);
            try {
              const params = new URLSearchParams(queryParams).toString();
              const url = `${userApi.defaults.baseURL}/payments/export${params ? `?${params}` : ""}`;
              await downloadAuthenticatedExport(url, "learninghun-user-payments.csv");
            } catch {
              setExportError("Export failed. Please sign in again and retry.");
            } finally {
              setIsExporting(false);
            }
          }}
          className="rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>
      {exportError && <p className="mt-2 text-sm text-red-600">{exportError}</p>}

      <DataTable
        headers={
          <tr>
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Transaction ID</th>
            <th className="px-4 py-3">Gateway</th>
            <th className="px-4 py-3">
              <SortHeader
                label="Amount"
                active={sortBy === "amount"}
                direction={sortDirection}
                onClick={() => {
                  if (sortBy === "amount") setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                  else {
                    setSortBy("amount");
                    setSortDirection("desc");
                  }
                }}
              />
            </th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">
              <SortHeader
                label="Date"
                active={sortBy === "created_at"}
                direction={sortDirection}
                onClick={() => {
                  if (sortBy === "created_at") setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                  else {
                    setSortBy("created_at");
                    setSortDirection("desc");
                  }
                }}
              />
            </th>
          </tr>
        }
      >
        {sortedPayments.map((payment) => (
          <tr key={payment.id} className="border-t">
            <td className="px-4 py-3 text-slate-800">{payment.course?.title ?? "Course"}</td>
            <td className="px-4 py-3 text-slate-600">{payment.transaction_id}</td>
            <td className="px-4 py-3 capitalize text-slate-600">{payment.gateway}</td>
            <td className="px-4 py-3 text-slate-800">
              {payment.currency} {Number(payment.amount).toLocaleString()}
            </td>
            <td className="px-4 py-3">
              <span
                className={
                  payment.status === "paid"
                    ? "rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700"
                    : payment.status === "pending"
                      ? "rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700"
                      : "rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700"
                }
              >
                {payment.status}
              </span>
            </td>
            <td className="px-4 py-3 text-slate-600">
              {new Date(payment.created_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </DataTable>
    </PageShell>
  );
}

