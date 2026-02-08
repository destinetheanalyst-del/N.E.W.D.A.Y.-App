# Network Error Fix - "Failed to fetch" getUserProfile

## Issue
After login, the application was showing:
```
Network error fetching profile (CORS/network issue) - using metadata fallback
```

This error occurred when trying to fetch the user profile from the Supabase Edge Function endpoint.

## Root Cause
1. **Edge Function Not Available**: The application was trying to fetch from a Supabase Edge Function endpoint that doesn't exist or isn't accessible in the Figma Make environment.

2. **Unnecessary Server Fetch**: Since we're using user metadata to store profile information (due to deployment constraints), the server fetch was completely unnecessary.

3. **CORS/Network Issues**: The Edge Function endpoint had CORS or network connectivity issues.

## Solution Implemented

### Complete Removal of Server Profile Fetch

Instead of trying to work around the network error, we completely removed the server fetch and now rely 100% on user metadata, which is:
- ✅ Always available
- ✅ Set during signup via the server
- ✅ Stored in Supabase Auth
- ✅ Fast and reliable
- ✅ No network calls needed

### Changes Made

#### 1. Updated `getUserProfile` in `/src/lib/auth.ts`

**Before:** Attempted to fetch from Edge Function with timeout and error handling
**After:** Simply reads from user metadata

```typescript
export const getUserProfile = async (userId?: string) => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured - skipping profile fetch');
    return null;
  }
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('Session error when getting profile:', sessionError.message);
      return null;
    }
    
    if (!session || !session.user) {
      console.warn('No session or user found when getting profile');
      return null;
    }

    // Return profile directly from user metadata
    const user = session.user;
    const metadata = user.user_metadata;
    
    if (!metadata) {
      console.warn('No user metadata found');
      return null;
    }

    const profile = {
      id: user.id,
      user_id: user.id,
      full_name: metadata.full_name || metadata.name || 'Unknown User',
      phone: metadata.phone || '',
      role: (metadata.role || 'driver') as 'driver' | 'official',
      vehicle_number: metadata.vehicle_number || undefined,
    };

    console.log('✓ Profile retrieved from user metadata');
    return profile;
  } catch (error: any) {
    console.warn('Get user profile error:', error.message);
    return null;
  }
};
```

#### 2. Simplified `loadUserProfile` in `/src/app/context/AuthContext.tsx`

**Before:** Tried to fetch from server in background
**After:** Only uses metadata

```typescript
const loadUserProfile = async (userId: string, user?: User) => {
  // Get profile from user metadata (primary and only source)
  if (user?.user_metadata) {
    const metadata = user.user_metadata;
    const metadataProfile: UserProfile = {
      id: user.id,
      user_id: user.id,
      full_name: metadata.full_name || metadata.name || 'Unknown User',
      phone: metadata.phone || '',
      role: metadata.role || 'driver',
      vehicle_number: metadata.vehicle_number || undefined,
    };
    setProfile(metadataProfile);
    console.log('✓ Profile loaded successfully');
  } else {
    console.warn('No user metadata available');
  }
};
```

#### 3. Cleaned Up `handleLogin` Function

**Before:** Called server profile fetch in background
**After:** Sets profile directly from metadata

```typescript
const handleLogin = async (phone: string, password: string, role: 'driver' | 'official') => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    const authData = await signIn({ phone, password });
    console.log('✓ Auth data received');
    
    if (authData.user && authData.session) {
      console.log('✓ User authenticated:', authData.user.id);
      setUser(authData.user);
      setSession(authData.session);
      
      // Create profile from user metadata
      const actualProfile = {
        id: authData.user.id,
        user_id: authData.user.id,
        full_name: authData.user.user_metadata?.full_name || 'Unknown User',
        phone: authData.user.user_metadata?.phone || phone,
        role: (authData.user.user_metadata?.role || 'driver') as 'driver' | 'official',
        vehicle_number: authData.user.user_metadata?.vehicle_number || undefined,
      };
      
      // Verify role matches
      if (actualProfile.role !== role) {
        console.error(`Role mismatch: expected ${role}, got ${actualProfile.role}`);
        await supabase.auth.signOut();
        throw new Error(`This account is registered as a ${actualProfile.role}, not a ${role}`);
      }
      
      // Set profile from metadata
      setProfile(actualProfile);
      console.log('✓ Login complete - profile set from metadata');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

## How It Works Now

### Authentication & Profile Flow:

1. **Signup:**
   - User enters details in signup form
   - Server Edge Function creates user with metadata
   - Metadata includes: `full_name`, `phone`, `role`, `vehicle_number`

2. **Login:**
   - User enters credentials
   - Supabase authenticates user
   - Profile is immediately extracted from user metadata
   - No network calls to external endpoints
   - ✅ Instant profile availability

3. **Session Persistence:**
   - On app load, session is restored
   - Profile is extracted from session user metadata
   - No delays, no network errors

### Profile Data Source:

**User Metadata (Supabase Auth):**
```json
{
  "full_name": "John Doe",
  "phone": "1234567890",
  "role": "driver",
  "vehicle_number": "ABC123"
}
```

This metadata is:
- Set during signup by the server Edge Function
- Stored in Supabase Auth's user object
- Available immediately with the user session
- No separate database queries needed

## Benefits

1. ✅ **No Network Errors**: Eliminated CORS and "Failed to fetch" errors completely
2. ✅ **Faster**: Profile is available instantly from session
3. ✅ **Simpler Code**: Removed complex error handling and retry logic
4. ✅ **More Reliable**: No dependency on external endpoints
5. ✅ **Cleaner Logs**: No warning messages about fallbacks
6. ✅ **Better UX**: No delays or loading states for profile data

## Testing

To verify the fix works:
1. ✅ Login with valid credentials
2. ✅ Check console - should see "✓ Profile loaded successfully"
3. ✅ No network error warnings
4. ✅ Profile data is immediately available
5. ✅ App loads faster without network calls

## Files Modified

1. `/src/lib/auth.ts` - Simplified `getUserProfile` to only read from metadata
2. `/src/app/context/AuthContext.tsx` - Removed server fetch logic from `loadUserProfile` and `handleLogin`

## Architecture Notes

This solution works because:

- **Signup Flow**: The server Edge Function (`/functions/v1/make-server-a0f1c773/signup`) creates users with proper metadata during registration
- **Metadata Storage**: Supabase Auth stores user metadata securely and makes it available with the session
- **No Database Needed**: Profile information doesn't need separate database tables or KV store
- **Session Includes Everything**: The session object contains all profile data we need

This is the recommended approach for Figma Make deployments where database access is limited.
