"use client";

import { useEffect, useState } from "react";
import { formatNairaFromKobo } from "@/lib/currency";
import type { OrderStatus } from "@/lib/types";

type ApiOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: "delivery" | "pickup";
  totalKobo: number;
  status: OrderStatus;
  createdAt: string;
  items: Array<{ id: number; itemTitle: string; quantity: number }>;
};

const statuses: OrderStatus[] = ["pending", "preparing", "dispatched", "completed", "cancelled"];

export function OrdersManager() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);

  async function load() {
    const response = await fetch("/api/orders", { cache: "no-store" });
    const data = (await response.json()) as { orders: ApiOrder[] };
    setOrders(data.orders);
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    await load();
  }

  return (
    <section className="border border-[#222] p-4">
      <h3 className="font-serif-display text-2xl">Orders Pipeline</h3>

      <div className="mt-4 space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="border border-[#2b2b2b] p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-zinc-100">
                  {order.customerName} · {order.customerPhone}
                </p>
                <p className="text-xs text-zinc-500">
                  {order.fulfillmentType.toUpperCase()} · {formatNairaFromKobo(order.totalKobo)}
                </p>
              </div>

              <select
                value={order.status}
                onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)}
                className="border border-[#333] bg-transparent px-3 py-2 text-sm"
              >
                {statuses.map((status) => (
                  <option key={status} value={status} className="bg-[#111]">
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {order.items.map((item) => `${item.itemTitle} x${item.quantity}`).join(", ")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
