# JWT Error Fix - "Invalid JWT" on Parcel Creation

## Issue
When trying to create a parcel, the server returned an error:
```
Server returned error: Invalid JWT
Full error response: {
  "code": 401,
  "message": "Invalid JWT"
}
```

This was causing parcel registration to fail completely.

## Root Cause

When calling Supabase Edge Functions, **both** the `Authorization` header and the `apikey` header are required:

1. **`Authorization: Bearer <access_token>`** - The user's session token (JWT)
2. **`apikey: <anon_key>`** - The project's public anonymous key

The code was only sending the `Authorization` header, which caused the Edge Function to reject the request with "Invalid JWT".

## Solution

Added the `apikey` header to **all** Edge Function calls in `/src/lib/parcels.ts`.

### Before:
```typescript
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  },
  body: JSON.stringify(payload),
});
```

### After:
```typescript
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': publicAnonKey,  // ← Added this header
  },
  body: JSON.stringify(payload),
});
```

## Functions Updated

All Edge Function calls in `/src/lib/parcels.ts` now include the `apikey` header:

1. ✅ **`createParcel`** - Create new parcels (POST)
2. ✅ **`getParcelByReference`** - Get parcel by reference number (GET)
3. ✅ **`getParcelById`** - Get parcel by ID (GET)
4. ✅ **`getParcelsByDriver`** - Get all parcels for a driver (GET)
5. ✅ **`updateParcelStatus`** - Update parcel status (PUT)
6. ✅ **`getAllParcels`** - Get all parcels for officials (GET)

## Why Both Headers Are Required

Supabase Edge Functions validate requests using **both** headers:

- **`apikey`**: Validates the request is coming from an authorized client (identifies the project)
- **`Authorization`**: Validates the user is authenticated and authorized to perform the action

Without the `apikey` header, the Edge Function can't verify which project the request is for, resulting in the "Invalid JWT" error.

## Testing

To verify the fix:
1. ✅ Log in as a driver
2. ✅ Complete the parcel registration form
3. ✅ Submit the form
4. ✅ Parcel should be created successfully
5. ✅ QR code should be generated
6. ✅ No "Invalid JWT" errors in console

## Additional Notes

- The `publicAnonKey` is imported from `/utils/supabase/info.tsx`
- This key is safe to expose on the client side (it's the public anonymous key)
- The Edge Function still validates user permissions using the JWT token
- This is a standard requirement for all Supabase Edge Function calls

## Related Files

- `/src/lib/parcels.ts` - All parcel-related API calls
- `/utils/supabase/info.tsx` - Contains `projectId` and `publicAnonKey`
- `/src/lib/auth.ts` - Authentication functions (already had `apikey` header)

## References

Supabase Edge Functions documentation: https://supabase.com/docs/guides/functions/invoke
