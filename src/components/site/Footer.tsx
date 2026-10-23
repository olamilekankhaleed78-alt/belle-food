import type { SiteContent } from "@/lib/site-content";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#menu", label: "Menu" },
  { href: "#story", label: "Our Story" },
];

export function Footer({ content }: { content: SiteContent }) {
  const { contact } = content;

  return (
    <footer id="contact" className="border-t border-[#222] bg-[#101010] py-14">
      <div className="section-shell grid gap-8 md:grid-cols-4">
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Contact</h4>
          <p className="mt-3 text-sm leading-7 text-zinc-300">{contact.address}</p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Opening Hours</h4>
          {contact.hoursLine1 ? <p className="mt-3 text-sm leading-7 text-zinc-300">{contact.hoursLine1}</p> : null}
          {contact.hoursLine2 ? <p className="text-sm leading-7 text-zinc-300">{contact.hoursLine2}</p> : null}
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

        {contact.instagramHandle ? (
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500">Follow us</h4>
            {contact.instagramUrl ? (
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-zinc-300 underline hover:text-white"
              >
                {contact.instagramHandle}
              </a>
            ) : (
              <p className="mt-3 text-sm text-zinc-300">{contact.instagramHandle}</p>
            )}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
