import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useParcel } from '@/app/context/ParcelContext';
import { toast } from 'sonner';

interface Item {
  name: string;
  category: string;
  value: string;
  size: string;
}

export function DriverItemDetails() {
  const navigate = useNavigate();
  const { setItemsData } = useParcel();
  const [items, setItems] = useState<Item[]>([
    { name: '', category: '', value: '', size: '' }
  ]);

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: '', category: '', value: '', size: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = items.every(item => item.name && item.category && item.value && item.size);
    if (!isValid) {
      toast.error('Please fill in all item fields');
      return;
    }
    setItemsData(items);
    navigate('/driver/register/receiver');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate('/driver/register/sender')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Item Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNext} className="space-y-6">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                  <h3 className="font-medium">Item {index + 1}</h3>
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`}>Item Name</Label>
                    <Input
                      id={`name-${index}`}
                      placeholder="Enter item name"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`category-${index}`}>Item Category</Label>
                    <Select value={item.category} onValueChange={(value) => handleItemChange(index, 'category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="documents">Documents</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`value-${index}`}>Item Value</Label>
                    <Input
                      id={`value-${index}`}
                      type="number"
                      placeholder="Enter value (₦)"
                      value={item.value}
                      onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`size-${index}`}>Item Size (Kg)</Label>
                    <Input
                      id={`size-${index}`}
                      type="number"
                      placeholder="Enter weight in Kg"
                      value={item.size}
                      onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Another Item
              </Button>
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