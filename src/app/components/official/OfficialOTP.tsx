import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/app/components/ui/input-otp';
import { toast } from 'sonner';

export function OfficialOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    if (otp.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    toast.success('Phone number verified!');
    navigate('/official/home');
  };

  const handleResend = () => {
    toast.success('OTP resent successfully');
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verify Phone Number</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your phone number
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button onClick={handleVerify} className="w-full" size="lg">
            Verify
          </Button>
          <p className="text-center text-sm text-gray-600">
            Didn't receive code?{' '}
            <button
              type="button"
              className="text-green-600 hover:underline"
              onClick={handleResend}
            >
              Resend OTP
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
