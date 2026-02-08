# Supabase Backend Integration Guide

This document provides step-by-step instructions for setting up Supabase backend for the Goods Tracking System.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- Git

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - Project name: `goods-tracking-system`
   - Database password: (choose a strong password)
   - Region: (select closest to your users)
4. Click "Create new project"
5. Wait for your project to be set up (takes about 2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, click on the "Settings" icon (gear) in the left sidebar
2. Click on "API" in the settings menu
3. You'll see two important values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: A long string starting with `eyJ...`

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root of your project (copy from `.env.example`):

```bash
cp .env.example .env
```

2. Edit the `.env` file and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Never commit the `.env` file to Git. It's already in `.gitignore`.

## Step 4: Set Up Database Tables

1. In your Supabase dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase-migration.sql` file
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration
6. You should see "Success. No rows returned" message

This creates:
- `user_profiles` table for storing user information
- `parcels` table for storing parcel data
- Necessary indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamps

## Step 5: Configure Phone Authentication

Since this app uses phone authentication, you need to enable it:

1. Go to "Authentication" → "Providers" in your Supabase dashboard
2. Find "Phone" in the providers list
3. Enable the "Phone" toggle
4. Choose an SMS provider:
   - **Twilio** (recommended for production)
   - **MessageBird**
   - Or use Supabase's built-in provider (limited free messages)

### For Development (Using Twilio):

1. Sign up at https://www.twilio.com
2. Get your Twilio credentials:
   - Account SID
   - Auth Token
   - Phone Number
3. In Supabase, enter your Twilio credentials
4. Click "Save"

### For Testing Without SMS:

For development, you can temporarily disable phone verification:

1. Go to "Authentication" → "Providers" → "Phone"
2. Scroll down to "Phone OTP verification settings"
3. Enable "Skip verification for certain phone numbers"
4. Add test phone numbers (e.g., `+1234567890`)

## Step 6: Configure Authentication Settings

1. Go to "Authentication" → "URL Configuration"
2. Add your site URL:
   - For development: `http://localhost:5173`
   - For production: Your actual domain

3. Go to "Authentication" → "Policies"
4. The SQL migration already created RLS policies, but verify they're enabled

## Step 7: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Open the app in your browser
3. Try to sign up with a test account
4. Check your Supabase dashboard under "Authentication" → "Users" to see if the user was created
5. Check "Table Editor" → "user_profiles" to see if the profile was created

## Database Schema

### user_profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| full_name | TEXT | User's full name |
| phone | TEXT | Phone number |
| role | TEXT | 'driver' or 'official' |
| vehicle_number | TEXT | Vehicle number (for drivers) |
| created_at | TIMESTAMPTZ | Timestamp |
| updated_at | TIMESTAMPTZ | Timestamp |

### parcels
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| reference_number | TEXT | Unique tracking number |
| sender_name | TEXT | Sender's name |
| sender_address | TEXT | Sender's address |
| sender_contact | TEXT | Sender's contact |
| receiver_name | TEXT | Receiver's name |
| receiver_address | TEXT | Receiver's address |
| receiver_contact | TEXT | Receiver's contact |
| items | JSONB | Array of items |
| status | TEXT | 'registered', 'verified', 'delivered' |
| driver_id | UUID | Foreign key to auth.users |
| created_at | TIMESTAMPTZ | Timestamp |
| updated_at | TIMESTAMPTZ | Timestamp |

## Security Features

The app implements Row Level Security (RLS):

- **Drivers** can:
  - View only their own parcels
  - Create new parcels
  - Update only their own profile

- **Officials** can:
  - View all parcels
  - Update parcel status (verify/acknowledge)
  - Update only their own profile

## API Functions

The app provides these Supabase functions:

### Authentication (`/src/lib/auth.ts`)
- `signUp()` - Register new user
- `signIn()` - Login user
- `signOut()` - Logout user
- `getSession()` - Get current session
- `getCurrentUser()` - Get current user
- `getUserProfile()` - Get user profile
- `verifyOTP()` - Verify OTP code
- `resendOTP()` - Resend OTP

### Parcels (`/src/lib/parcels.ts`)
- `createParcel()` - Create new parcel
- `getParcelByReference()` - Get parcel by reference number
- `getParcelById()` - Get parcel by ID
- `getParcelsByDriver()` - Get all parcels for a driver
- `updateParcelStatus()` - Update parcel status
- `acknowledgeParcel()` - Verify/acknowledge parcel
- `getAllParcels()` - Get all parcels (for officials)

## Troubleshooting

### "Invalid API key" error
- Check that your `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your development server after changing `.env`

### "Row level security policy violation" error
- Make sure you ran the complete migration SQL
- Check that RLS policies are enabled for your tables
- Verify the user is authenticated before making requests

### Phone authentication not working
- Check that Phone provider is enabled in Supabase
- Verify your SMS provider credentials are correct
- For testing, add test phone numbers in settings

### Users can't see their data
- Check RLS policies in the database
- Verify the user is logged in (check `useAuth()` hook)
- Check browser console for errors

## Production Deployment

Before deploying to production:

1. **Enable email confirmation** (optional but recommended)
2. **Set up proper SMS provider** (Twilio, MessageBird)
3. **Configure rate limiting** in Supabase dashboard
4. **Enable database backups**
5. **Set up monitoring** and alerts
6. **Use environment-specific URLs** in your deployment platform
7. **Review and test all RLS policies**

## Support

For Supabase-specific issues:
- Documentation: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

For app-specific issues:
- Check the browser console for errors
- Review the API response messages
- Check Supabase logs in the dashboard
