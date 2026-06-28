"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/hooks/use-role";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/contexts/auth-context";

interface RequireRoleProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'user';
}

export function RequireRole({ children, requiredRole }: RequireRoleProps) {
  const { role, isLoading: roleLoading } = useRole();
  const { isLoading: authLoading, isCheckingSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!roleLoading && !authLoading && !isCheckingSession && role !== requiredRole) {
      router.push('/dashboard');
    }
  }, [roleLoading, authLoading, isCheckingSession, role, requiredRole, router]);

  return (
    <>
      {children}
      {(roleLoading || authLoading || isCheckingSession) && (
        <div className="fixed bottom-4 right-4 z-50 bg-background/80 border px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Checking access...</span>
        </div>
      )}
    </>
  );
} 