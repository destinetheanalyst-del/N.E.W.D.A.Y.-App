import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { CheckCircle, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ParcelData } from '@/app/context/ParcelContext';
import { toast } from 'sonner';

export function DriverParcelConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [latestParcel, setLatestParcel] = useState<ParcelData | null>(null);

  useEffect(() => {
    // Get parcel from location state (passed from previous page) - only run once on mount
    const parcel = location.state?.parcel as ParcelData;
    if (parcel) {
      setLatestParcel(parcel);
    } else {
      // If no parcel in state, redirect to home
      navigate('/driver/home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const handleCopy = () => {
    if (latestParcel) {
      navigator.clipboard.writeText(latestParcel.referenceNumber);
      toast.success('Reference number copied!');
    }
  };

  const handleFinish = () => {
    navigate('/driver/home');
  };

  if (!latestParcel) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Parcel Registered Successfully</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QRCodeSVG value={latestParcel.referenceNumber} size={200} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Reference Number</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-lg font-mono font-bold">{latestParcel.referenceNumber}</p>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button onClick={handleFinish} className="w-full" size="lg">
            Finish
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}