import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Truck, UserCheck } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4">Goods Tracking System</h1>
          <p className="text-xl text-gray-600">Select your role to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/driver')}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                <Truck className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl">Driver App</h2>
              <p className="text-gray-600">Register and manage parcel deliveries</p>
              <Button size="lg" className="w-full mt-4">
                Enter as Driver
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate('/official')}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                <UserCheck className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl">Official App</h2>
              <p className="text-gray-600">Track and verify parcel information</p>
              <Button size="lg" className="w-full mt-4" variant="outline">
                Enter as Official
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
