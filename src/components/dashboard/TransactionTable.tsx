"use client";

import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks";
import { Render } from "@/components";

interface Transaction {
  id: number;
  transaction_no: string;
  full_name: string;
  date: string;
  gender: string;
  age: number;
  amount: number;
}

interface TransactionResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

async function fetchTransactions({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search: string;
}): Promise<TransactionResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
  });

  const res = await fetch(`/api/transactions?${params}`);
  if (!res.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return res.json();
}

export const TransactionTable = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["transactions", { page, limit, search: debouncedSearch }],
    queryFn: () => fetchTransactions({ page, limit, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const transactions = data?.data || [];
  const total = data?.meta?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">
          Recent Transactions
        </h3>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Transaction No</th>
              <th className="px-6 py-4">Full Name</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Gender</th>
              <th className="px-6 py-4">Age</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <Render if={isLoading}>
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5" /> Loading...
                  </div>
                </td>
              </tr>
            </Render>

            <Render if={isError}>
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-rose-500"
                >
                  Failed to load transactions
                </td>
              </tr>
            </Render>

            <Render if={transactions.length === 0}>
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  No transactions found
                </td>
              </tr>
            </Render>

            <Render if={transactions.length > 0}>
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {tx.transaction_no}
                  </td>
                  <td className="px-6 py-4">{tx.full_name}</td>
                  <td className="px-6 py-4">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        tx.gender === "Male"
                          ? "bg-blue-100 text-blue-700"
                          : tx.gender === "Female"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {tx.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4">{tx.age}</td>
                  <td
                    className={cn(
                      "px-6 py-4 text-right font-medium",
                      Number(tx.amount) > 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    )}
                  >
                    {Number(tx.amount) > 0 ? "+" : ""}
                    {Number(tx.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </Render>
          </tbody>
        </table>
      </div>

      <Render if={totalPages > 1}>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Render>
    </div>
  );
}
