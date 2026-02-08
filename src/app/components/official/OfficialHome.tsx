import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Search, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

export function OfficialHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/official/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="bg-green-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl">NEWDAY Official</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
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
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl">Welcome, Official!</h2>
            <p className="text-gray-600">Click below to track a parcel</p>
            <Button onClick={() => navigate('/official/track')} size="lg" className="w-full">
              Track Parcel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}