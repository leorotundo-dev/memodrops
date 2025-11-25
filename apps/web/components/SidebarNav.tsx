"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/drops", label: "Drops" },
  { href: "/admin/blueprints", label: "Blueprints" },
  { href: "/admin/rag", label: "RAG Blocks" },
  { href: "/admin/harvest", label: "Harvest" },
  { href: "/admin/users", label: "Usuários" }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r border-zinc-800 bg-zinc-950/90">
      <div className="px-5 py-4 border-b border-zinc-800">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          MemoDrops
        </div>
        <div className="text-lg font-semibold text-zinc-50">Admin</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        {links.map(link => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                "flex items-center rounded-lg px-3 py-2 transition-colors " +
                (active
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900")
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
