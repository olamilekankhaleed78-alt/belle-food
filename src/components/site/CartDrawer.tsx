"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/site/CartContext";
import { CheckoutModal } from "@/components/site/CheckoutModal";
import { formatNairaFromKobo } from "@/lib/currency";

export function CartDrawer() {
  const { isOpen, closeCart, lines, removeItem, updateQty, totalKobo } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-[80] flex justify-end bg-black/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          >
            <motion.aside
              className="h-full w-full max-w-md border-l border-[#222] bg-[#111] p-5"
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif-display text-3xl">Cart</h3>
                <button type="button" onClick={closeCart} className="text-sm text-zinc-400 hover:text-white">
                  Close
                </button>
              </div>

              <div className="space-y-3">
                {lines.length === 0 ? <p className="text-zinc-400">Your cart is empty.</p> : null}

                {lines.map((line) => (
                  <div key={line.item.id} className="border border-[#222] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.08em] text-zinc-200">{line.item.title}</p>
                        <p className="text-xs text-zinc-400">{formatNairaFromKobo(line.item.priceKobo)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(line.item.id)}
                        className="text-xs text-zinc-500 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="border border-[#2a2a2a] px-2 py-1"
                        onClick={() => updateQty(line.item.id, line.quantity - 1)}
                      >
                        -
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        className="border border-[#2a2a2a] px-2 py-1"
                        onClick={() => updateQty(line.item.id, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-[#222] pt-4">
                <p className="mb-4 text-sm text-zinc-300">Total: {formatNairaFromKobo(totalKobo)}</p>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full bg-white py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black disabled:opacity-50"
                  disabled={lines.length === 0}
                >
                  Proceed to Checkout
                </button>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
