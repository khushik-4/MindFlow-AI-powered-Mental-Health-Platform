import { useAuth } from "@/lib/contexts/auth-context";

// Admin configuration
const ADMIN_CONFIG = {
  emails: ['mayankdindoire@gmail.com'],
};

export function useAdmin() {
  const { user } = useAuth();
  
  const isAdmin = Boolean(
    user && user.email && ADMIN_CONFIG.emails.includes(user.email)
  );

  return {
    isAdmin,
    adminConfig: ADMIN_CONFIG
  };
} 