import { useAuth } from '@/app/context/AuthContext';
import { Card } from '@/app/components/ui/card';
import { useState } from 'react';

export function AuthDebug() {
  const { user, session, profile, loading } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 max-w-sm bg-black/80 text-white text-xs z-50">
      <h3 
        className="font-bold mb-2 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>Auth Debug</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </h3>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User: {user ? '✓' : '✗'} {user && `(${user.id.substring(0, 8)}...)`}</div>
        <div>Session: {session ? '✓' : '✗'}</div>
        <div>Profile: {profile ? '✓' : '✗'} {profile && `(${profile.full_name})`}</div>
        <div>Role: {profile?.role || 'null'}</div>
        {isExpanded && session && (
          <div className="mt-2 pt-2 border-t border-white/20">
            <div className="break-all">Token: {session.access_token?.substring(0, 30)}...</div>
            <div>Expires: {session.expires_at ? new Date(session.expires_at * 1000).toLocaleTimeString() : 'N/A'}</div>
          </div>
        )}
      </div>
    </Card>
  );
}
