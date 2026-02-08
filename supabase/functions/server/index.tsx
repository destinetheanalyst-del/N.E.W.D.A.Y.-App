import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Create Supabase admin client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Helper function to generate unique IDs
const generateId = () => crypto.randomUUID();

// Helper function to generate reference number for parcels
const generateReferenceNumber = () => {
  const prefix = 'NEWDAY';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a0f1c773/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint - uses admin API to bypass email validation
app.post("/make-server-a0f1c773/signup", async (c) => {
  try {
    const { phone, password, fullName, role, vehicleNumber, companyName } = await c.req.json();

    if (!phone || !password || !fullName || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Convert phone to valid email format
    const cleanPhone = phone.replace(/\D/g, '');
    const email = `user${cleanPhone}@gtsapp.com`;

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      return c.json({ 
        error: 'An account with this phone number already exists. Please login instead.',
        code: 'user_exists'
      }, 409);
    }

    // Create user with admin API
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone,
        role: role,
        vehicle_number: vehicleNumber,
        company_name: companyName,
      },
    });

    if (userError) {
      console.error('User creation error:', userError);
      
      if (userError.message?.includes('already been registered')) {
        return c.json({ 
          error: 'An account with this phone number already exists. Please login instead.',
          code: 'user_exists'
        }, 409);
      }
      
      return c.json({ error: userError.message }, 400);
    }

    // Store user profile in KV store
    if (userData.user) {
      const userId = userData.user.id;
      const userProfile = {
        id: userId,
        user_id: userId,
        full_name: fullName,
        phone: phone,
        role: role,
        vehicle_number: vehicleNumber || null,
        company_name: companyName || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      await kv.set(`user:${userId}`, userProfile);
      await kv.set(`user:phone:${cleanPhone}`, userId); // Index by phone
    }

    return c.json({ 
      success: true,
      message: 'User created successfully',
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return c.json({ error: error.message || 'Signup failed' }, 500);
  }
});

// Get user profile endpoint
app.get("/make-server-a0f1c773/profile", async (c) => {
  try {
    console.log('=== GET PROFILE ENDPOINT ===');
    const authHeader = c.req.header('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    const accessToken = authHeader?.split(' ')[1];
    
    if (!accessToken) {
      console.error('Missing access token in request');
      return c.json({ error: 'Missing access token' }, 401);
    }

    console.log('Access token (first 20 chars):', accessToken.substring(0, 20) + '...');
    console.log('Validating token with Supabase...');

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (error) {
      console.error('Supabase auth.getUser error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      return c.json({ error: 'Invalid or expired token: ' + error.message }, 401);
    }
    
    if (!user) {
      console.error('No user returned from auth.getUser');
      return c.json({ error: 'User not found' }, 401);
    }

    console.log('User validated successfully:', user.id);

    // Get profile from KV store
    console.log('Fetching profile from KV store...');
    let profile = await kv.get(`user:${user.id}`);
    
    // If profile doesn't exist in KV, create it from user metadata
    if (!profile) {
      console.log('Profile not found in KV, creating from auth metadata for user:', user.id);
      
      const metadata = user.user_metadata || {};
      profile = {
        id: user.id,
        user_id: user.id,
        full_name: metadata.full_name || metadata.name || 'Unknown User',
        phone: metadata.phone || '',
        role: metadata.role || 'driver',
        vehicle_number: metadata.vehicle_number || null,
        company_name: metadata.company_name || null,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Store in KV for future requests
      await kv.set(`user:${user.id}`, profile);
      
      // Index by phone if available
      if (metadata.phone) {
        const cleanPhone = metadata.phone.replace(/\D/g, '');
        await kv.set(`user:phone:${cleanPhone}`, user.id);
      }
    }

    console.log('Profile retrieved successfully');
    console.log('=== GET PROFILE ENDPOINT END ===');
    return c.json({ profile });
  } catch (error: any) {
    console.error('=== GET PROFILE ENDPOINT ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error:', error);
    console.error('==================================');
    return c.json({ error: error.message || 'Failed to get profile' }, 500);
  }
});

// Create parcel endpoint
app.post("/make-server-a0f1c773/parcels", async (c) => {
  try {
    console.log('=== CREATE PARCEL ENDPOINT START ===');
    
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.error('Missing access token');
      return c.json({ error: 'Missing access token' }, 401);
    }

    console.log('Validating access token...');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError) {
      console.error('Auth error:', authError);
      return c.json({ error: 'Unauthorized: ' + authError.message }, 401);
    }
    
    if (!user) {
      console.error('No user found with access token');
      return c.json({ error: 'Unauthorized: User not found' }, 401);
    }

    console.log('User authenticated:', user.id);

    const parcelData = await c.req.json();
    
    console.log('Received parcel data:', JSON.stringify(parcelData, null, 2));
    
    // Validate required fields
    if (!parcelData.sender_name || !parcelData.sender_address || !parcelData.sender_contact) {
      console.error('Missing sender data:', parcelData);
      return c.json({ error: 'Missing sender information' }, 400);
    }
    
    if (!parcelData.receiver_name || !parcelData.receiver_address || !parcelData.receiver_contact) {
      console.error('Missing receiver data:', parcelData);
      return c.json({ error: 'Missing receiver information' }, 400);
    }
    
    if (!parcelData.items || parcelData.items.length === 0) {
      console.error('Missing items data:', parcelData);
      return c.json({ error: 'Missing items information' }, 400);
    }
    
    // Generate unique ID and reference number
    const parcelId = generateId();
    const referenceNumber = generateReferenceNumber();
    
    console.log('Generated parcel ID:', parcelId);
    console.log('Generated reference number:', referenceNumber);
    
    const parcel = {
      id: parcelId,
      reference_number: referenceNumber,
      sender_name: parcelData.sender_name,
      sender_address: parcelData.sender_address,
      sender_contact: parcelData.sender_contact,
      receiver_name: parcelData.receiver_name,
      receiver_address: parcelData.receiver_address,
      receiver_contact: parcelData.receiver_contact,
      items: parcelData.items || [],
      status: 'registered',
      driver_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Parcel object created:', JSON.stringify(parcel, null, 2));

    try {
      // Store parcel in KV store
      console.log('Saving parcel to KV store...');
      await kv.set(`parcel:${parcelId}`, parcel);
      console.log('Parcel saved successfully');
      
      console.log('Creating reference index...');
      await kv.set(`parcel:ref:${referenceNumber}`, parcelId);
      console.log('Reference index created');
      
      // Add to driver's parcel list
      console.log('Adding to driver parcel list...');
      const driverParcelsKey = `driver:${user.id}:parcels`;
      const driverParcels = await kv.get(driverParcelsKey) || [];
      driverParcels.push(parcelId);
      await kv.set(driverParcelsKey, driverParcels);
      console.log('Added to driver parcel list');
    } catch (kvError: any) {
      console.error('KV Store error:', kvError);
      console.error('KV error message:', kvError.message);
      console.error('KV error stack:', kvError.stack);
      return c.json({ 
        error: 'Database error: ' + (kvError.message || 'Failed to save parcel to database'),
        details: kvError.toString()
      }, 500);
    }

    console.log('Parcel creation complete. Returning response.');
    console.log('=== CREATE PARCEL ENDPOINT END ===');

    return c.json({ parcel });
  } catch (error: any) {
    console.error('=== CREATE PARCEL ENDPOINT ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error:', error);
    console.error('===================================');
    return c.json({ error: error.message || 'Failed to create parcel' }, 500);
  }
});

// Get parcel by reference number endpoint
app.get("/make-server-a0f1c773/parcels/:reference", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Missing access token' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reference = c.req.param('reference');
    
    // Get parcel ID from reference
    const parcelId = await kv.get(`parcel:ref:${reference}`);
    
    if (!parcelId) {
      return c.json({ error: 'Parcel not found' }, 404);
    }

    // Get parcel data
    const parcel = await kv.get(`parcel:${parcelId}`);
    
    if (!parcel) {
      return c.json({ error: 'Parcel not found' }, 404);
    }

    return c.json({ parcel });
  } catch (error: any) {
    console.error('Get parcel error:', error);
    return c.json({ error: error.message || 'Failed to get parcel' }, 500);
  }
});

// Get all parcels for driver endpoint
app.get("/make-server-a0f1c773/parcels", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Missing access token' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user profile to check role
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    let parcels = [];

    if (profile.role === 'driver') {
      // Get driver's parcels
      const parcelIds = await kv.get(`driver:${user.id}:parcels`) || [];
      parcels = await kv.mget(parcelIds.map((id: string) => `parcel:${id}`));
    } else if (profile.role === 'official') {
      // Get all parcels for officials
      const allParcels = await kv.getByPrefix('parcel:');
      // Filter out index entries (those with :ref: in key)
      parcels = allParcels.filter((p: any) => p && p.id);
    }

    return c.json({ parcels });
  } catch (error: any) {
    console.error('Get parcels error:', error);
    return c.json({ error: error.message || 'Failed to get parcels' }, 500);
  }
});

// Update parcel status endpoint
app.put("/make-server-a0f1c773/parcels/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Missing access token' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const parcelId = c.req.param('id');
    const { status } = await c.req.json();

    // Get parcel
    const parcel = await kv.get(`parcel:${parcelId}`);
    
    if (!parcel) {
      return c.json({ error: 'Parcel not found' }, 404);
    }

    // Update parcel status
    parcel.status = status;
    parcel.updated_at = new Date().toISOString();
    
    await kv.set(`parcel:${parcelId}`, parcel);

    return c.json({ parcel });
  } catch (error: any) {
    console.error('Update parcel error:', error);
    return c.json({ error: error.message || 'Failed to update parcel' }, 500);
  }
});

Deno.serve(app.fetch);