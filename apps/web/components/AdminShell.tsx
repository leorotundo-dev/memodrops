"use client";

import { useRouter, usePathname } from "next/navigation";
import { SidebarNav } from "./SidebarNav";
import { ReactNode, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("memodrops_token") : null;
    if (!token && pathname.startsWith("/admin")) {
      router.replace("/login");
    }
  }, [router, pathname]);

  // Fechar sidebar ao navegar em mobile
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
      {/* Header com Hamburger - Sempre visível */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        <div className="text-sm font-semibold">MemoDrops Admin</div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 top-12"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative top-12 md:top-0 left-0 h-[calc(100vh-3rem)] md:h-screen w-64 bg-zinc-950 border-r border-zinc-800 z-40 overflow-y-auto transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <SidebarNav />
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-12 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
