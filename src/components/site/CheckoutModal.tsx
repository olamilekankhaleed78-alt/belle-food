"use client";

import { FormEvent, useState } from "react";
import { useCart } from "@/components/site/CartContext";
import { formatNairaFromKobo } from "@/lib/currency";

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { lines, totalKobo, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lines.length) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      customerName: String(formData.get("customerName") ?? ""),
      customerPhone: String(formData.get("customerPhone") ?? ""),
      fulfillmentType: String(formData.get("fulfillmentType") ?? "pickup"),
      notes: String(formData.get("notes") ?? ""),
      items: lines.map((line) => ({ itemId: line.item.id, quantity: line.quantity })),
    };

    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { message?: string; orderId?: string };

    if (!response.ok) {
      setMessage(result.message ?? "Unable to place order. Please try again.");
      setLoading(false);
      return;
    }

    setMessage(`Order placed successfully. Ref: #${result.orderId}`);
    clear();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl border border-[#222] bg-[#111] p-6 text-zinc-100">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-serif-display text-3xl"># Checkout</h3>
          <button onClick={onClose} className="text-sm text-zinc-400 hover:text-white" type="button">
            Close
          </button>
        </div>

        <form className="space-y-4" onSubmit={submitOrder}>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="customerName"
              required
              placeholder="Your name"
              className="w-full border border-[#2a2a2a] bg-transparent px-4 py-3 outline-none placeholder:text-zinc-500 focus:border-white"
            />
            <input
              name="customerPhone"
              required
              placeholder="Phone number"
              className="w-full border border-[#2a2a2a] bg-transparent px-4 py-3 outline-none placeholder:text-zinc-500 focus:border-white"
            />
          </div>

          <select
            name="fulfillmentType"
            className="w-full border border-[#2a2a2a] bg-transparent px-4 py-3 outline-none focus:border-white"
            defaultValue="pickup"
          >
            <option className="bg-[#111]" value="pickup">
              Pickup
            </option>
            <option className="bg-[#111]" value="delivery">
              Delivery
            </option>
          </select>

          <textarea
            name="notes"
            rows={3}
            placeholder="Delivery notes (optional)"
            className="w-full border border-[#2a2a2a] bg-transparent px-4 py-3 outline-none placeholder:text-zinc-500 focus:border-white"
          />

          <p className="text-sm text-zinc-400">Total: {formatNairaFromKobo(totalKobo)}</p>

          {message ? <p className="text-sm text-[#d4af37]">{message}</p> : null}

          <button
            type="submit"
            disabled={loading || lines.length === 0}
            className="w-full bg-white px-4 py-3 text-sm font-medium uppercase tracking-[0.16em] text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
