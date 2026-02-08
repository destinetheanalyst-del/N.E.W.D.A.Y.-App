import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'driver' | 'official';
  redirectTo?: string;
}

export function AuthGuard({ children, requiredRole, redirectTo }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to appropriate login
        const loginPath = requiredRole === 'driver' ? '/driver/login' : 
                         requiredRole === 'official' ? '/official/login' : 
                         redirectTo || '/';
        navigate(loginPath, { replace: true });
      } else if (requiredRole && profile && profile.role !== requiredRole) {
        // Wrong role, redirect to their appropriate home
        const homePath = profile.role === 'driver' ? '/driver/home' : '/official/home';
        navigate(homePath, { replace: true });
      } else {
        setIsChecking(false);
      }
    }
  }, [user, profile, loading, requiredRole, redirectTo, navigate]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}
