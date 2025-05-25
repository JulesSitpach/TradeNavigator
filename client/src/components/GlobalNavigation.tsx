import { Navigation } from "./Navigation";
import { useAuth } from "@/hooks/useAuth";

interface GlobalNavigationProps {
  isAuthenticated?: boolean;
}

export function GlobalNavigation({ isAuthenticated }: GlobalNavigationProps) {
  const { user } = useAuth();
  
  // Use auth hook as primary source, fallback to prop
  const authStatus = isAuthenticated ?? !!user;

  return (
    <nav className="w-full">
      <Navigation />
    </nav>
  );
}

// Authenticated Navigation Component
export function AuthenticatedNavigation() {
  return (
    <div className="authenticated-nav">
      <Navigation />
    </div>
  );
}

// Public Navigation Component  
export function PublicNavigation() {
  return (
    <div className="public-nav">
      <Navigation />
    </div>
  );
}