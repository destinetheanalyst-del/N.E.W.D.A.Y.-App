import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, WifiOff } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { supabase } from '@/lib/supabase';

export function ConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    supabaseConfig?: { success: boolean; message: string };
    authSession?: { success: boolean; message: string; details?: string };
    edgeFunctionPing?: { success: boolean; message: string; time?: number };
  }>({});

  const runTests = async () => {
    setTesting(true);
    setResults({});

    // Test 1: Supabase Configuration
    console.log('=== CONNECTION TEST 1: Supabase Config ===');
    const configResult = {
      success: !!projectId && !!publicAnonKey,
      message: projectId && publicAnonKey
        ? `Project ID: ${projectId}`
        : 'Supabase not configured',
    };
    setResults((prev) => ({ ...prev, supabaseConfig: configResult }));
    console.log('Config test:', configResult);

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Test 2: Auth Session
    console.log('=== CONNECTION TEST 2: Auth Session ===');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      const sessionResult = {
        success: !!session && !error,
        message: session
          ? 'Session valid'
          : error
          ? `Error: ${error.message}`
          : 'No active session',
        details: session
          ? `User ID: ${session.user?.id}`
          : undefined,
      };
      setResults((prev) => ({ ...prev, authSession: sessionResult }));
      console.log('Session test:', sessionResult);
    } catch (error: any) {
      setResults((prev) => ({
        ...prev,
        authSession: { success: false, message: `Error: ${error.message}` },
      }));
      console.error('Session test error:', error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Test 3: Edge Function Health Check
    console.log('=== CONNECTION TEST 3: Edge Function Ping ===');
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a0f1c773/health`;
      console.log('Testing URL:', url);
      
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      console.log('Response status:', response.status);
      console.log('Response time:', responseTime + 'ms');

      const data = await response.json();
      console.log('Response data:', data);

      const edgeResult = {
        success: response.ok && data.status === 'ok',
        message: response.ok
          ? `Edge Function reachable (${responseTime}ms)`
          : `HTTP ${response.status}: ${JSON.stringify(data)}`,
        time: responseTime,
      };
      setResults((prev) => ({ ...prev, edgeFunctionPing: edgeResult }));
      console.log('Edge function test:', edgeResult);
    } catch (error: any) {
      console.error('Edge function test error:', error);
      
      let errorMessage = 'Unknown error';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out (>10s)';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error - cannot reach server';
      } else {
        errorMessage = error.message;
      }
      
      setResults((prev) => ({
        ...prev,
        edgeFunctionPing: { success: false, message: errorMessage },
      }));
    }

    setTesting(false);
    console.log('=== CONNECTION TEST COMPLETE ===');
  };

  const getIcon = (result?: { success: boolean }) => {
    if (!result) return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    return result.success ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WifiOff className="h-5 w-5" />
          Connection Diagnostics
        </CardTitle>
        <CardDescription>
          Test your connection to the Goods Tracking System backend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={testing} className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Connection Tests'
          )}
        </Button>

        {Object.keys(results).length > 0 && (
          <div className="space-y-3 mt-4">
            <Alert variant={results.supabaseConfig?.success ? 'default' : 'destructive'}>
              <div className="flex items-start gap-2">
                {getIcon(results.supabaseConfig)}
                <div className="flex-1">
                  <AlertTitle className="text-sm font-medium">
                    1. Supabase Configuration
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    {results.supabaseConfig?.message || 'Testing...'}
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            <Alert variant={results.authSession?.success ? 'default' : 'destructive'}>
              <div className="flex items-start gap-2">
                {getIcon(results.authSession)}
                <div className="flex-1">
                  <AlertTitle className="text-sm font-medium">
                    2. Authentication Session
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    {results.authSession?.message || 'Testing...'}
                    {results.authSession?.details && (
                      <div className="mt-1 text-xs opacity-70">
                        {results.authSession.details}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            <Alert variant={results.edgeFunctionPing?.success ? 'default' : 'destructive'}>
              <div className="flex items-start gap-2">
                {getIcon(results.edgeFunctionPing)}
                <div className="flex-1">
                  <AlertTitle className="text-sm font-medium">
                    3. Edge Function Health
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    {results.edgeFunctionPing?.message || 'Testing...'}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </div>
        )}

        {!testing && Object.keys(results).length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600">
              {results.supabaseConfig?.success &&
              results.authSession?.success &&
              results.edgeFunctionPing?.success ? (
                <span className="text-green-700 font-medium">
                  ✓ All tests passed. Your connection is working properly.
                </span>
              ) : (
                <span className="text-red-700 font-medium">
                  ✗ Some tests failed. Check the console for detailed error messages.
                </span>
              )}
            </p>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> If the Edge Function test fails, the server may not be deployed
            or accessible. Check your Supabase project settings and Edge Functions dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
