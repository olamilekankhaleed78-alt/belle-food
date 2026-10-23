const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#menu", label: "Menu" },
  { href: "#story", label: "Our Story" },
  { href: "/admin/login", label: "Admin" },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t border-[#222] bg-[#101010] py-14">
      <div className="section-shell grid gap-8 md:grid-cols-4">
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Contact</h4>
          <p className="mt-3 text-sm leading-7 text-zinc-300">Jiuhua Street, Lekki, Lagos</p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Opening Hours</h4>
          <p className="mt-3 text-sm leading-7 text-zinc-300">Open 24 Hours</p>
          <p className="text-sm leading-7 text-zinc-300">7 Days a Week</p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Navigate</h4>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500">@king__mitchy</h4>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <a
                key={i}
                href="https://instagram.com/king__mitchy"
                target="_blank"
                rel="noreferrer"
                className="aspect-square border border-[#2a2a2a] bg-gradient-to-br from-[#1d1d1d] to-[#0f0f0f]"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
