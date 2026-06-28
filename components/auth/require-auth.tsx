"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading, isCheckingSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isCheckingSession && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isCheckingSession, isAuthenticated, router]);

  return (
    <>
      {children}
      {(isLoading || isCheckingSession) && (
        <div className="fixed bottom-4 right-4 z-50 bg-background/80 border px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Updating session...</span>
        </div>
      )}
    </>
  );
}
