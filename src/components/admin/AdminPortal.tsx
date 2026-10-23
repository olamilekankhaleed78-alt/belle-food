"use client";

import { useState } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { MenuManager } from "@/components/admin/MenuManager";
import { OrdersManager } from "@/components/admin/OrdersManager";
import { SettingsManager } from "@/components/admin/SettingsManager";

const tabs = ["Dashboard", "Menu", "Orders", "Settings"] as const;

type TabName = (typeof tabs)[number];

export function AdminPortal() {
  const [tab, setTab] = useState<TabName>("Dashboard");

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-[#111] text-zinc-100">
      <header className="border-b border-[#222]">
        <div className="section-shell flex flex-wrap items-center justify-between gap-4 py-5">
          <h1 className="font-serif-display text-3xl"># Belle Food Admin</h1>
          <button onClick={logout} className="border border-[#2e2e2e] px-3 py-2 text-xs uppercase tracking-[0.12em]">
            Logout
          </button>
        </div>
      </header>

      <main className="section-shell space-y-6 py-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((name) => (
            <button
              key={name}
              onClick={() => setTab(name)}
              className={`border px-4 py-2 text-xs uppercase tracking-[0.12em] ${
                tab === name ? "border-white bg-white text-black" : "border-[#333] text-zinc-300"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {tab === "Dashboard" ? <AdminDashboard /> : null}
        {tab === "Menu" ? <MenuManager /> : null}
        {tab === "Orders" ? <OrdersManager /> : null}
        {tab === "Settings" ? <SettingsManager /> : null}
      </main>
    </div>
  );
}
