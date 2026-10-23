"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, StoreMenuItem } from "@/lib/types";

type CartContextType = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: StoreMenuItem) => void;
  removeItem: (itemId: number) => void;
  updateQty: (itemId: number, quantity: number) => void;
  clear: () => void;
  totalKobo: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "belle-food-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as CartLine[];
      setLines(parsed);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const addItem = useCallback((item: StoreMenuItem) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.item.id === item.id);
      if (!existing) return [...prev, { item, quantity: 1 }];
      return prev.map((line) =>
        line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line,
      );
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((itemId: number) => {
    setLines((prev) => prev.filter((line) => line.item.id !== itemId));
  }, []);

  const updateQty = useCallback((itemId: number, quantity: number) => {
    setLines((prev) =>
      prev
        .map((line) => (line.item.id === itemId ? { ...line, quantity: Math.max(0, quantity) } : line))
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const itemCount = useMemo(() => lines.reduce((acc, line) => acc + line.quantity, 0), [lines]);
  const totalKobo = useMemo(
    () => lines.reduce((acc, line) => acc + line.quantity * line.item.priceKobo, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      updateQty,
      clear,
      totalKobo,
      itemCount,
    }),
    [addItem, clear, isOpen, itemCount, lines, removeItem, totalKobo, updateQty],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used in CartProvider");
  return ctx;
}
