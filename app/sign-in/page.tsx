"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleSelector } from "@/components/auth/role-selector";

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return null;
}