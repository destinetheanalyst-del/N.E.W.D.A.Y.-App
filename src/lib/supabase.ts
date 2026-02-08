import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && 
  projectId && projectId !== 'placeholder');

// Create Supabase client with credentials from Figma Make
// Explicitly configure auth to use localStorage for session persistence
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  }
);

// Database types
export interface Database {
  public: {
    Tables: {
      parcels: {
        Row: {
          id: string;
          reference_number: string;
          sender_name: string;
          sender_address: string;
          sender_contact: string;
          receiver_name: string;
          receiver_address: string;
          receiver_contact: string;
          items: ParcelItem[];
          status: 'registered' | 'verified' | 'delivered';
          driver_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference_number: string;
          sender_name: string;
          sender_address: string;
          sender_contact: string;
          receiver_name: string;
          receiver_address: string;
          receiver_contact: string;
          items: ParcelItem[];
          status?: 'registered' | 'verified' | 'delivered';
          driver_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reference_number?: string;
          sender_name?: string;
          sender_address?: string;
          sender_contact?: string;
          receiver_name?: string;
          receiver_address?: string;
          receiver_contact?: string;
          items?: ParcelItem[];
          status?: 'registered' | 'verified' | 'delivered';
          driver_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          role: 'driver' | 'official';
          vehicle_number?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          role: 'driver' | 'official';
          vehicle_number?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string;
          role?: 'driver' | 'official';
          vehicle_number?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export interface ParcelItem {
  name: string;
  category: string;
  value: string;
  size: string;
}