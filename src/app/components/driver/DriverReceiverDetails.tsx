import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ChevronLeft, WifiOff } from 'lucide-react';
import { useParcel } from '@/app/context/ParcelContext';
import { toast } from 'sonner';

export function DriverReceiverDetails() {
  const navigate = useNavigate();
  const { setReceiverData, saveParcel } = useParcel();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== RECEIVER DETAILS SUBMIT ===');
    console.log('Form data:', formData);
    
    if (!formData.name || !formData.contact || !formData.address) {
      toast.error('Please fill in all fields');
      return;
    }

    console.log('Setting loading to true...');
    setLoading(true);
    
    // Add a safety timeout to ensure UI doesn't hang forever
    const safetyTimeout = setTimeout(() => {
      console.error('SAFETY TIMEOUT: Registration took longer than 45 seconds');
      setLoading(false);
      toast.error('Registration is taking too long. Please check your connection and try again.');
    }, 45000); // 45 second safety timeout

    try {
      // Set receiver data in context for consistency
      console.log('Setting receiver data in context...');
      setReceiverData(formData);
      
      console.log('Calling saveParcel...');
      console.log('Timestamp:', new Date().toISOString());
      
      // Pass receiver data directly to saveParcel to avoid state timing issues
      const parcel = await saveParcel(formData);
      
      console.log('saveParcel returned at:', new Date().toISOString());
      console.log('saveParcel result:', parcel);
      
      clearTimeout(safetyTimeout); // Clear safety timeout on success
      
      if (parcel) {
        console.log('Navigating to confirmation...');
        navigate('/driver/confirmation', { state: { parcel } });
      } else {
        console.error('saveParcel returned null');
        toast.error('Failed to save parcel. Please try again.');
      }
    } catch (error: any) {
      console.error('=== RECEIVER DETAILS ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error?.message);
      console.error('Error type:', error?.constructor?.name);
      console.error('Error stack:', error?.stack);
      console.error('==============================');
      
      clearTimeout(safetyTimeout); // Clear safety timeout on error
      
      // Show specific error message if available
      const errorMessage = error?.message || 'Failed to register parcel';
      toast.error(errorMessage);
    } finally {
      console.log('Clearing loading state at:', new Date().toISOString());
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate('/driver/register/items')} disabled={loading}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Receiver Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Receiver Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter receiver name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Receiver Contact</Label>
                <Input
                  id="contact"
                  name="contact"
                  type="tel"
                  placeholder="Enter contact number"
                  value={formData.contact}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Receiver Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter receiver address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Registering parcel...' : 'Register Parcel'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/driver/diagnostics')}
                disabled={loading}
              >
                <WifiOff className="w-4 h-4 mr-2" />
                Connection Diagnostics
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}