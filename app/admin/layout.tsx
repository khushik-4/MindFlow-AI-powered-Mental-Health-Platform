"use client";

import { ReactNode } from "react";
import { RequireAdmin } from "@/components/auth/require-admin";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAdmin>
      <main className="min-h-screen pt-16">
        {children}
      </main>
    </RequireAdmin>
  );
} 