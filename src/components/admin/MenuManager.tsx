"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ImageUploadButton } from "@/components/admin/ImageUploadButton";
import { koboToNaira } from "@/lib/currency";
import type { StoreMenuItem } from "@/lib/types";

type MenuFormState = {
  id?: number;
  title: string;
  slug: string;
  description: string;
  imagePath: string;
  priceNaira: number;
  isSpicy: boolean;
  isVegan: boolean;
  isAvailable: boolean;
};

const initialForm: MenuFormState = {
  title: "",
  slug: "",
  description: "",
  imagePath: "",
  priceNaira: 0,
  isSpicy: false,
  isVegan: false,
  isAvailable: true,
};

export function MenuManager() {
  const [items, setItems] = useState<StoreMenuItem[]>([]);
  const [selected, setSelected] = useState<MenuFormState>(initialForm);
  const [saving, setSaving] = useState(false);

  const selectedId = selected.id;

  const load = useMemo(
    () =>
      async function loadMenu() {
        const response = await fetch("/api/menu", { cache: "no-store" });
        const data = (await response.json()) as { items: StoreMenuItem[] };
        setItems(data.items);
      },
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  function editItem(item: StoreMenuItem) {
    setSelected({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      imagePath: item.imagePath,
      priceNaira: koboToNaira(item.priceKobo),
      isSpicy: item.isSpicy,
      isVegan: item.isVegan,
      isAvailable: item.isAvailable,
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const method = selectedId ? "PUT" : "POST";
    const endpoint = selectedId ? `/api/menu/${selectedId}` : "/api/menu";

    await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });

    setSaving(false);
    setSelected(initialForm);
    await load();
  }

  async function remove(id: number) {
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    setSelected(initialForm);
    await load();
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
      <div className="border border-[#222] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif-display text-2xl"># Menu Items</h3>
          <button
            type="button"
            className="text-xs uppercase tracking-[0.12em] text-zinc-400"
            onClick={() => setSelected(initialForm)}
          >
            New
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => editItem(item)}
              className="w-full border border-[#2a2a2a] p-3 text-left hover:border-white"
            >
              <p className="text-sm uppercase tracking-[0.06em] text-zinc-200">{item.title}</p>
              <p className="text-xs text-zinc-500">{item.slug}</p>
            </button>
          ))}
        </div>
      </div>

      <form className="space-y-3 border border-[#222] p-4" onSubmit={save}>
        <h3 className="font-serif-display text-2xl"># Item Editor</h3>

        <input
          value={selected.title}
          onChange={(e) => setSelected((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Title"
          required
          className="w-full border border-[#2a2a2a] bg-transparent px-3 py-2"
        />
        <input
          value={selected.slug}
          onChange={(e) => setSelected((prev) => ({ ...prev, slug: e.target.value }))}
          placeholder="slug-like-this"
          required
          className="w-full border border-[#2a2a2a] bg-transparent px-3 py-2"
        />
        <textarea
          value={selected.description}
          onChange={(e) => setSelected((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Description"
          rows={4}
          required
          className="w-full border border-[#2a2a2a] bg-transparent px-3 py-2"
        />
        <input
          type="number"
          min={0}
          step="0.01"
          value={selected.priceNaira}
          onChange={(e) => setSelected((prev) => ({ ...prev, priceNaira: Number(e.target.value) }))}
          placeholder="Price (Naira)"
          required
          className="w-full border border-[#2a2a2a] bg-transparent px-3 py-2"
        />
        <input
          value={selected.imagePath}
          onChange={(e) => setSelected((prev) => ({ ...prev, imagePath: e.target.value }))}
          placeholder="Image URL"
          required
          className="w-full border border-[#2a2a2a] bg-transparent px-3 py-2"
        />

        <ImageUploadButton onUploaded={(url) => setSelected((prev) => ({ ...prev, imagePath: url }))} />

        <div className="grid grid-cols-3 gap-2 text-sm text-zinc-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.isSpicy}
              onChange={(e) => setSelected((prev) => ({ ...prev, isSpicy: e.target.checked }))}
            />
            Spicy
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.isVegan}
              onChange={(e) => setSelected((prev) => ({ ...prev, isVegan: e.target.checked }))}
            />
            Vegan
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.isAvailable}
              onChange={(e) => setSelected((prev) => ({ ...prev, isAvailable: e.target.checked }))}
            />
            Available
          </label>
        </div>

        <div className="flex gap-3">
          <button className="bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black" disabled={saving}>
            {saving ? "Saving..." : selectedId ? "Update" : "Create"}
          </button>
          {selectedId ? (
            <button
              type="button"
              onClick={() => remove(selectedId)}
              className="border border-[#3a3a3a] px-5 py-2 text-xs uppercase tracking-[0.12em] text-zinc-300"
            >
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
