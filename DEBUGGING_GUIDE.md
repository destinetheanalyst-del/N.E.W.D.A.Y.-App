# Parcel Registration Debugging Guide

## Problem
When clicking "Register Parcel" in the Driver app, the button shows "Registering Parcel..." indefinitely and never completes or shows an error.

## Changes Made

### 1. Enhanced Logging
We've added comprehensive step-by-step logging throughout the parcel registration flow:

**DriverReceiverDetails.tsx:**
- Added timestamps to track how long each step takes
- Added a 45-second safety timeout that will reset the UI and show an error if registration takes too long
- Enhanced error logging with error type, message, and stack trace

**ParcelContext.tsx:**
- Step-by-step logging showing:
  - Step 1-2: Supabase library import
  - Step 3-4: Session retrieval with timing
  - Step 5: Data validation
  - Step 6-7: API call with timing

**lib/parcels.ts (createParcel function):**
- Comprehensive logging at every stage:
  - Step 1: Session refresh attempt
  - Step 2: Session retrieval with timing
  - Step 3: Request preparation
  - Step 4: Fetch request with 20-second timeout
  - Step 5: Response processing
- Better error messages for common failures:
  - Timeout errors
  - Network errors (Failed to fetch)
  - Authentication errors
  - Invalid responses

### 2. Reduced Timeout
- Changed timeout from 30 seconds to 20 seconds for faster feedback
- Added 45-second safety timeout in the UI to prevent infinite loading

### 3. Connection Diagnostics Tool
Created a new diagnostic page accessible at `/driver/diagnostics` or `/diagnostics` that tests:

1. **Supabase Configuration** - Verifies projectId and publicAnonKey are present
2. **Authentication Session** - Checks if user is logged in with valid session
3. **Edge Function Health** - Pings the Edge Function health endpoint to verify it's reachable

Access the diagnostics from:
- Direct URL: `/driver/diagnostics`
- Button on the receiver details page: "Connection Diagnostics"

## How to Debug

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Try to register a parcel
4. Look for these log groups:
   - `=== RECEIVER DETAILS SUBMIT ===`
   - `=== SAVE PARCEL DEBUG START ===`
   - `=== CREATE PARCEL START ===`

### Step 2: Identify Where It's Hanging
The logs will show you exactly which step is taking too long:

- **If you don't see "Step 1"**: The issue is before the API call (likely context or session)
- **If you see "Step 1" but not "Step 2"**: Session refresh is hanging
- **If you see "Step 2" but not "Step 3"**: Session retrieval is hanging
- **If you see "Step 3" but not "Step 4"**: Request preparation issue
- **If you see "Step 4" but not "Step 5"**: The fetch request is hanging (server not responding)
- **If you see "Step 5"**: The server responded, check the response details

### Step 3: Run Connection Diagnostics
1. Navigate to `/driver/diagnostics`
2. Click "Run Connection Tests"
3. Check which tests pass/fail:
   - ✓ All green = Everything is working
   - ✗ Red tests = Specific component is failing

### Step 4: Common Issues and Solutions

#### Issue: Edge Function Test Fails
**Symptoms:**
- "Network error - cannot reach server"
- "Request timed out (>10s)"

**Possible Causes:**
- Edge Function not deployed
- Edge Function URL is incorrect
- CORS issues
- Network connectivity problems

**Solution:**
1. Verify the Edge Function is deployed in Supabase Dashboard
2. Check the URL in `/utils/supabase/info.tsx` matches your project
3. Check Supabase Edge Functions logs for errors

#### Issue: Authentication Session Fails
**Symptoms:**
- "No active session"
- "Invalid or expired token"

**Solution:**
1. Log out and log back in
2. Check if session is expiring (logs will show time until expiry)
3. Verify Supabase auth is configured correctly

#### Issue: Request Times Out After 20 Seconds
**Symptoms:**
- Console shows "Request timeout triggered after 20 seconds"
- Error: "Request timed out. The server may be slow or unreachable"

**Possible Causes:**
- Edge Function is slow to respond
- KV store operations are taking too long
- Database connection issues

**Solution:**
1. Check Supabase Edge Function logs for performance issues
2. Check if KV store table exists: `kv_store_a0f1c773`
3. Verify Edge Function has proper permissions to access the table

#### Issue: Session Retrieval Takes Too Long
**Symptoms:**
- "Session retrieval took XXXXms" where XXXX > 5000
- Hanging at Step 2 or Step 3

**Solution:**
1. Check network connection
2. Try refreshing the page
3. Log out and log back in
4. Check Supabase status page

## Expected Timing
Under normal conditions:
- Session retrieval: < 500ms
- Session refresh: < 1000ms
- API request: < 3000ms
- Total registration: < 5000ms (5 seconds)

If any step takes longer than these values, there's likely an issue.

## Console Output Example (Successful Registration)

```
=== RECEIVER DETAILS SUBMIT ===
Form data: {name: "John Doe", contact: "+1234567890", address: "123 Main St"}
Setting loading to true...
Setting receiver data in context...
Calling saveParcel...
Timestamp: 2026-02-02T...
=== SAVE PARCEL DEBUG START ===
Timestamp: 2026-02-02T...
Step 1: Importing supabase library...
Step 2: Supabase library imported successfully
Step 3: Getting session...
Step 4: Session retrieved in 234ms
Session info: {hasSession: true, hasUser: true, userId: "...", accessToken: "present"}
Step 5: Validating parcel data...
Step 6: Calling createParcel API...
=== CREATE PARCEL START ===
Step 1: Attempting to refresh session...
Session refresh took 345ms
Step 2: Getting current session...
Session retrieval took 123ms
Session expires in 59 minutes
Step 3: Preparing request...
Step 4: Sending POST request...
Fetch completed in 2345ms
Step 5: Processing response...
Response status: 200
Response ok: true
Parsed result: {parcel: {...}}
Parcel created successfully: abc-123-def
=== CREATE PARCEL END ===
Step 7: createParcel completed in 2456ms
=== SAVE PARCEL DEBUG END ===
saveParcel returned at: 2026-02-02T...
Navigating to confirmation...
```

## Next Steps

1. **Try the registration again** and watch the console logs
2. **Run the Connection Diagnostics** to identify which component is failing
3. **Share the console output** with the error logs to identify the exact failure point
4. **Check Supabase Dashboard**:
   - Edge Functions → Functions → make-server-a0f1c773 → Logs
   - Database → Tables → kv_store_a0f1c773
   - Authentication → Users

## Files Modified

1. `/src/app/components/driver/DriverReceiverDetails.tsx` - Added safety timeout and diagnostics button
2. `/src/app/context/ParcelContext.tsx` - Added step-by-step logging
3. `/src/lib/parcels.ts` - Enhanced logging, reduced timeout, better error messages
4. `/src/app/components/ConnectionTest.tsx` - New diagnostic tool
5. `/src/app/routes.ts` - Added diagnostics routes
6. `/DEBUGGING_GUIDE.md` - This file

## Support

If the issue persists after following this guide:
1. Copy the complete console log output
2. Run the connection diagnostics and screenshot the results
3. Check the Supabase Edge Function logs
4. Share all three pieces of information for further assistance
