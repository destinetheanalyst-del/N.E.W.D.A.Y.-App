import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { UserCheck } from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';

export function OfficialSplash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/official/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-green-600 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto">
          <UserCheck className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-4xl text-white">NEWDAY Official</h1>
        <p className="text-xl text-green-100">Goods Tracking System</p>
        <div className="w-64 mx-auto">
          <Progress value={66} className="h-2" />
        </div>
      </div>
    </div>
  );
}