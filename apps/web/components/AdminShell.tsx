"use client";

import { useRouter, usePathname } from "next/navigation";
import { SidebarNav } from "./SidebarNav";
import { ReactNode, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("memodrops_token") : null;
    if (!token && pathname.startsWith("/admin")) {
      router.replace("/login");
    }
  }, [router, pathname]);

  // Fechar sidebar ao navegar
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
      {/* Sidebar Desktop */}
      <SidebarNav />

      {/* Mobile Header com Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="text-sm font-semibold">MemoDrops Admin</div>
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
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed left-0 top-12 bottom-0 w-64 bg-zinc-950 border-r border-zinc-800 z-40 overflow-y-auto">
          <SidebarNav />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:pt-0 pt-14 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
