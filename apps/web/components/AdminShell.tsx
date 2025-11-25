"use client";

import { useRouter, usePathname } from "next/navigation";
import { SidebarNav } from "./SidebarNav";
import { ReactNode, useEffect } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("memodrops_token") : null;
    if (!token && pathname.startsWith("/admin")) {
      router.replace("/login");
    }
  }, [router, pathname]);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
      <SidebarNav />
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
