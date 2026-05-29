"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DataTable, SortHeader } from "@/components/ui/data-table";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { adminApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type AdminPaymentRecord = {
  id: number;
  transaction_id: string;
  gateway: string;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  user?: { name: string; email: string } | null;
  course?: { title: string; slug: string } | null;
};

type AdminPaymentsResponse = {
  data: AdminPaymentRecord[];
  total: number;
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [status, setStatus] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<"created_at" | "amount">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (!token) {
      router.replace("/admin/login");
    }
  }, [router, token]);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (status !== "all") params.status = status;
    if (from) params.from = from;
    if (to) params.to = to;
    return params;
  }, [status, from, to]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-payments", queryParams],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await adminApi.get<AdminPaymentsResponse>("/payments", {
        params: queryParams,
      });
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <PageShell>
        <PageMessage message="Loading payment records..." tone="loading" />
      </PageShell>
    );
  }

  if (isError || !data) {
    return (
      <PageShell>
        <PageMessage message="Unable to load admin payment data." tone="error" />
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
        title="Payments Monitoring"
        subtitle={`Total payment records: ${data.total}`}
        badge="Admin Billing"
       
      />
      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border bg-slate-950 text-slate-300 p-4">
        <label className="text-sm text-slate-200">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="ml-2 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="text-sm text-slate-200">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="ml-2 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100"
          />
        </label>
        <label className="text-sm text-slate-200">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="ml-2 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            const params = new URLSearchParams(queryParams).toString();
            const url = `${adminApi.defaults.baseURL}/payments/export${params ? `?${params}` : ""}`;
            window.open(url, "_blank");
          }}
          className="rounded-lg bg-brand-yellow px-3 py-2 text-sm font-semibold text-slate-900"
        >
          Export CSV
        </button>
      </div>

      <DataTable
        headers={
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Transaction</th>
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
                label="Created"
                active={sortBy === "created_at"}
                direction={sortDirection}
                onClick={() => {
                  if (sortBy === "created_at") {
                    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                  } else {
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
          <tr key={payment.id} className="border-t border-slate-800">
            <td className="px-4 py-3">
              <p className="font-medium text-white">{payment.user?.name ?? "User"}</p>
              <p className="text-xs text-slate-400">{payment.user?.email ?? "-"}</p>
            </td>
            <td className="px-4 py-3 text-slate-300">{payment.course?.title ?? "-"}</td>
            <td className="px-4 py-3 text-slate-300">{payment.transaction_id}</td>
            <td className="px-4 py-3 capitalize text-slate-300">{payment.gateway}</td>
            <td className="px-4 py-3 text-slate-200">
              {payment.currency} {Number(payment.amount).toLocaleString()}
            </td>
            <td className="px-4 py-3">
              <span
                className={
                  payment.status === "paid"
                    ? "rounded-full bg-green-900/30 px-2 py-1 text-xs font-semibold text-green-400"
                    : payment.status === "pending"
                      ? "rounded-full bg-yellow-900/30 px-2 py-1 text-xs font-semibold text-yellow-300"
                      : "rounded-full bg-red-900/30 px-2 py-1 text-xs font-semibold text-red-300"
                }
              >
                {payment.status}
              </span>
            </td>
            <td className="px-4 py-3 text-slate-400">
              {new Date(payment.created_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </DataTable>
    </PageShell>
  );
}

