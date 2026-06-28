"use client";

import { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/require-auth";

export default function TherapyLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
