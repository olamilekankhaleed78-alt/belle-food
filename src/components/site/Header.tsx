"use client";

import { useCart } from "@/components/site/CartContext";

const links = [
  { href: "#home", label: "Home" },
  { href: "#menu", label: "Menu" },
  { href: "#story", label: "Our Story" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const { openCart, itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-[#222] bg-black/60 backdrop-blur-md">
      <div className="section-shell flex h-20 items-center justify-between gap-4">
        <p className="text-sm font-semibold tracking-[0.28em] text-white">BELLE FOOD</p>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm tracking-[0.08em] text-zinc-300 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCart}
            className="border border-[#2a2a2a] px-3 py-2 text-xs uppercase tracking-[0.12em] text-zinc-100"
          >
            Cart ({itemCount})
          </button>
          <a
            href="#contact"
            className="bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black"
          >
            Book a Table
          </a>
        </div>
      </div>
    </header>
  );
}
