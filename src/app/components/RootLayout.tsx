import { Outlet } from 'react-router';
import { AuthProvider } from '@/app/context/AuthContext';
import { ParcelProvider } from '@/app/context/ParcelContext';
import { AuthDebug } from '@/app/components/AuthDebug';

export function RootLayout() {
  return (
    <AuthProvider>
      <ParcelProvider>
        <Outlet />
        <AuthDebug />
      </ParcelProvider>
    </AuthProvider>
  );
}