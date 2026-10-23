"use client";

import { useEffect, useState } from "react";
import { formatNairaFromKobo } from "@/lib/currency";

type Stats = {
  totalRevenueKobo: number;
  orderCount: number;
  preparingCount: number;
};

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data: Stats) => setStats(data));
  }, []);

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="border border-[#222] p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Total Revenue</p>
        <p className="mt-3 font-serif-display text-3xl text-white">
          {stats ? formatNairaFromKobo(stats.totalRevenueKobo) : "..."}
        </p>
      </article>
      <article className="border border-[#222] p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Total Orders</p>
        <p className="mt-3 font-serif-display text-3xl text-white">{stats?.orderCount ?? "..."}</p>
      </article>
      <article className="border border-[#222] p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Kitchen Queue</p>
        <p className="mt-3 font-serif-display text-3xl text-white">{stats?.preparingCount ?? "..."}</p>
      </article>
    </section>
  );
}
