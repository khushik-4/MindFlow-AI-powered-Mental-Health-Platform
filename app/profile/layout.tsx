"use client";

import { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/require-auth";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
