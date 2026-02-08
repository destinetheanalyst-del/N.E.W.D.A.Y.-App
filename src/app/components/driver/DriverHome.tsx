import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Package, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { useParcel } from '@/app/context/ParcelContext';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function DriverHome() {
  const navigate = useNavigate();
  const { resetCurrentParcel } = useParcel();
  const { profile, signOut } = useAuth();

  const handleRegisterParcel = () => {
    resetCurrentParcel();
    navigate('/driver/register/sender');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/driver/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl">NEWDAY Driver</h1>
          {profile && (
            <p className="text-sm text-blue-100">Welcome, {profile.full_name}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
              <User className="w-6 h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <Card className="p-12 max-w-md w-full">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl">Welcome, Driver!</h2>
            <p className="text-gray-600">Click below to register a new parcel</p>
            <Button onClick={handleRegisterParcel} size="lg" className="w-full">
              Register Parcel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}