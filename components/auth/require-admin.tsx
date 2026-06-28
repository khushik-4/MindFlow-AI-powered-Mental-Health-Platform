"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/lib/hooks/use-admin";
import { useAuth } from "@/lib/contexts/auth-context";
import { Loader2 } from "lucide-react";

interface RequireAdminProps {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const { isLoading, isCheckingSession } = useAuth();

  useEffect(() => {
    if (!isLoading && !isCheckingSession && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isLoading, isCheckingSession, isAdmin, router]);

  return (
    <>
      {children}
      {(isLoading || isCheckingSession) && (
        <div className="fixed bottom-4 right-4 z-50 bg-background/80 border px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Checking admin privileges...</span>
        </div>
      )}
    </>
  );
} 