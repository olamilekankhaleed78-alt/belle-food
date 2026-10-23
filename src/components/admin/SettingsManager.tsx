"use client";

import { FormEvent, useEffect, useState } from "react";

type SettingsState = {
  kitchenWhatsApp: string;
  serviceFeeNaira: number;
};

export function SettingsManager() {
  const [settings, setSettings] = useState<SettingsState>({ kitchenWhatsApp: "", serviceFeeNaira: 0 });

  useEffect(() => {
    void fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data: SettingsState) => setSettings(data));
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();

    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
  }

  return (
    <form className="space-y-3 border border-[#222] p-4" onSubmit={save}>
      <h3 className="font-serif-display text-2xl"># Operational Settings</h3>

      <input
        value={settings.kitchenWhatsApp}
        onChange={(e) => setSettings((prev) => ({ ...prev, kitchenWhatsApp: e.target.value }))}
        placeholder="Kitchen WhatsApp Number"
        className="w-full border border-[#2a2a2a] bg-transparent px-3 py-2"
      />

      <input
        type="number"
        min={0}
        step="0.01"
        value={settings.serviceFeeNaira}
        onChange={(e) => setSettings((prev) => ({ ...prev, serviceFeeNaira: Number(e.target.value) }))}
        placeholder="Service Fee (Naira)"
        className="w-full border border-[#2a2a2a] bg-transparent px-3 py-2"
      />

      <button className="bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black" type="submit">
        Save Settings
      </button>
    </form>
  );
}
