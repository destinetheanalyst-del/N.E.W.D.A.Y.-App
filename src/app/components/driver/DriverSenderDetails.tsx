import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useParcel } from '@/app/context/ParcelContext';
import { toast } from 'sonner';

export function DriverSenderDetails() {
  const navigate = useNavigate();
  const { setSenderData } = useParcel();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.contact) {
      toast.error('Please fill in all fields');
      return;
    }
    setSenderData(formData);
    navigate('/driver/register/items');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate('/driver/home')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sender Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNext} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Sender Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter sender name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Sender Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter sender address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Sender Contact</Label>
                <Input
                  id="contact"
                  name="contact"
                  type="tel"
                  placeholder="Enter contact number"
                  value={formData.contact}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Next
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
