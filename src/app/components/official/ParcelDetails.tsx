import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { useParcel, ParcelData } from '@/app/context/ParcelContext';

export function ParcelDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getParcelDetails, acknowledgeParcel } = useParcel();
  const [parcel, setParcel] = useState<ParcelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    const loadParcel = async () => {
      if (id) {
        setLoading(true);
        const foundParcel = await getParcelDetails(id);
        if (foundParcel) {
          setParcel(foundParcel);
        } else {
          navigate('/official/home');
        }
        setLoading(false);
      }
    };

    loadParcel();
  }, [id, getParcelDetails, navigate]);

  const handleAcknowledge = async () => {
    if (parcel) {
      setAcknowledging(true);
      try {
        await acknowledgeParcel(parcel.referenceNumber);
        // Reload parcel to get updated status
        const updatedParcel = await getParcelDetails(id!);
        if (updatedParcel) {
          setParcel(updatedParcel);
        }
        navigate('/official/home');
      } catch (error) {
        console.error('Acknowledge error:', error);
      } finally {
        setAcknowledging(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <p className="text-lg">Loading parcel details...</p>
      </div>
    );
  }

  if (!parcel) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate('/official/track')} disabled={acknowledging}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Parcel Details</CardTitle>
                <Badge variant={parcel.status === 'verified' ? 'default' : 'secondary'}>
                  {parcel.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Reference Number</p>
                <p className="font-mono font-medium">{parcel.referenceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registered On</p>
                <p>{new Date(parcel.timestamp).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sender Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p>{parcel.sender.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p>{parcel.sender.contact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p>{parcel.sender.address}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receiver Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p>{parcel.receiver.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact</p>
                <p>{parcel.receiver.contact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p>{parcel.receiver.address}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {parcel.items.map((item, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="font-medium">{item.name}</p>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Value</p>
                        <p>₦{item.value}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Weight</p>
                        <p>{item.size} Kg</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {parcel.status !== 'verified' && (
            <Button onClick={handleAcknowledge} size="lg" className="w-full" disabled={acknowledging}>
              <CheckCircle className="w-5 h-5 mr-2" />
              {acknowledging ? 'Acknowledging...' : 'Acknowledge'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}