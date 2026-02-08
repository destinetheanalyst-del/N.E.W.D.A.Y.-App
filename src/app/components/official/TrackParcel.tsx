import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Separator } from '@/app/components/ui/separator';
import { ChevronLeft, QrCode } from 'lucide-react';
import { useParcel } from '@/app/context/ParcelContext';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';

export function TrackParcel() {
  const navigate = useNavigate();
  const { getParcel } = useParcel();
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber) {
      toast.error('Please enter a reference number');
      return;
    }

    setLoading(true);
    try {
      const parcel = await getParcel(referenceNumber);
      if (parcel) {
        navigate(`/official/details/${parcel.id}`);
      }
    } catch (error) {
      console.error('Track parcel error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          setReferenceNumber(decodedText);
          stopScanning();
          toast.success('QR Code scanned successfully!');
        },
        (errorMessage) => {
          // Handle scan errors silently
        }
      );
    } catch (err) {
      toast.error('Unable to access camera');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        setIsScanning(false);
        scannerRef.current = null;
      }).catch(() => {
        setIsScanning(false);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate('/official/home')} disabled={loading || isScanning}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Track Parcel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              {!isScanning && (
                <Button onClick={startScanning} variant="outline" className="w-full" size="lg" disabled={loading}>
                  <QrCode className="w-5 h-5 mr-2" />
                  Scan QR Code
                </Button>
              )}
              {isScanning && (
                <div className="space-y-4">
                  <div id="qr-reader" className="w-full"></div>
                  <Button onClick={stopScanning} variant="outline" className="w-full">
                    Stop Scanning
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-sm text-gray-500">OR</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  placeholder="Enter reference number"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  disabled={loading || isScanning}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading || isScanning}>
                {loading ? 'Searching...' : 'Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}