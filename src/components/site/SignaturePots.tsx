import { Flame, Leaf } from "lucide-react";

export function SignaturePots({ spicy, vegan }: { spicy: boolean; vegan: boolean }) {
  return (
    <div className="absolute left-4 top-4 z-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em]">
      {spicy ? (
        <span className="flex items-center gap-1 border border-[#d4af37] bg-black/70 px-2 py-1 text-[#d4af37]">
          <Flame size={12} /> [S] Spicy
        </span>
      ) : null}
      {vegan ? (
        <span className="flex items-center gap-1 border border-white/50 bg-black/70 px-2 py-1 text-white">
          <Leaf size={12} /> [V] Vegan
        </span>
      ) : null}
    </div>
  );
}
