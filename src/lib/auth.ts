import { supabase, isSupabaseConfigured } from './supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface SignUpData {
  phone: string;
  password: string;
  fullName: string;
  role: 'driver' | 'official';
  vehicleNumber?: string;
  companyName?: string;
}

export interface LoginData {
  phone: string;
  password: string;
}

/**
 * Convert phone number to email format for Supabase auth
 * Since phone auth is disabled, we use email auth with phone-based emails
 */
const phoneToEmail = (phone: string): string => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Convert to valid email format with a proper domain
  return `user${cleanPhone}@gtsapp.com`;
};

/**
 * Sign up a new user with phone and password
 * Uses server-side admin API to bypass email validation
 */
export const signUp = async (data: SignUpData) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please connect your Supabase project first.');
  }
  
  try {
    // Call server endpoint for signup
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a0f1c773/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          phone: data.phone,
          password: data.password,
          fullName: data.fullName,
          role: data.role,
          vehicleNumber: data.vehicleNumber,
          companyName: data.companyName,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Sign up failed');
    }

    return result;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Sign in with phone and password
 */
export const signIn = async (data: LoginData) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please connect your Supabase project first.');
  }
  
  try {
    const email = phoneToEmail(data.phone);
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password: data.password,
    });

    if (error) throw error;
    return authData;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Get the current user session
 */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

/**
 * Get user profile from user metadata
 * Since we're using metadata instead of database tables, this returns the profile from the current user
 */
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

/**
 * Verify OTP
 */
export const verifyOTP = async (phone: string, token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

/**
 * Resend OTP
 */
export const resendOTP = async (phone: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw error;
  }
};