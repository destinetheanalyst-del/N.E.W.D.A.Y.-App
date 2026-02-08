import { supabase, ParcelItem } from './supabase';
import { getSession } from './auth';

export interface ParcelData {
  id: string;
  referenceNumber: string;
  sender: {
    name: string;
    address: string;
    contact: string;
  };
  receiver: {
    name: string;
    contact: string;
    address: string;
  };
  items: ParcelItem[];
  status: 'registered' | 'verified' | 'delivered';
  driverId: string;
  timestamp: string;
}

// ============================================
// CLIENT-SIDE STORAGE (LocalStorage KV Store)
// ============================================
// Due to Figma Make deployment constraints, we use localStorage as a KV store
// This allows the app to work without server endpoints

const PARCELS_STORAGE_KEY = 'gts_parcels';
const COUNTER_STORAGE_KEY = 'gts_parcel_counter';

/**
 * Generate a unique reference number
 */
const generateReferenceNumber = (): string => {
  // Get current counter
  const counter = parseInt(localStorage.getItem(COUNTER_STORAGE_KEY) || '1000', 10);
  const newCounter = counter + 1;
  localStorage.setItem(COUNTER_STORAGE_KEY, newCounter.toString());
  
  // Format: GTS-YYYYMMDD-XXXX
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const sequence = String(newCounter).padStart(4, '0');
  
  return `GTS-${year}${month}${day}-${sequence}`;
};

/**
 * Generate a unique UUID
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Get all parcels from localStorage
 */
const getAllParcelsFromStorage = (): ParcelData[] => {
  try {
    const stored = localStorage.getItem(PARCELS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading parcels from storage:', error);
    return [];
  }
};

/**
 * Save parcels to localStorage
 */
const saveParcelsToStorage = (parcels: ParcelData[]): void => {
  try {
    localStorage.setItem(PARCELS_STORAGE_KEY, JSON.stringify(parcels));
  } catch (error) {
    console.error('Error saving parcels to storage:', error);
  }
};

/**
 * Create a new parcel (client-side)
 */
export const createParcel = async (
  parcelData: Omit<ParcelData, 'id' | 'referenceNumber' | 'timestamp' | 'status'>
) => {
  try {
    console.log('=== CREATE PARCEL START (Client-Side Storage) ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Parcel data:', JSON.stringify(parcelData, null, 2));
    
    // Verify authentication
    const session = await getSession();
    if (!session) {
      console.error('No session found - user not authenticated');
      throw new Error('Not authenticated - please log in again');
    }

    // Generate unique IDs
    const id = generateUUID();
    const referenceNumber = generateReferenceNumber();
    const timestamp = new Date().toISOString();

    // Create parcel object
    const newParcel: ParcelData = {
      id,
      referenceNumber,
      sender: parcelData.sender,
      receiver: parcelData.receiver,
      items: parcelData.items,
      status: 'registered',
      driverId: parcelData.driverId,
      timestamp,
    };

    // Get existing parcels
    const parcels = getAllParcelsFromStorage();
    
    // Add new parcel
    parcels.push(newParcel);
    
    // Save to storage
    saveParcelsToStorage(parcels);

    console.log('✓ Parcel created successfully (client-side)');
    console.log('Parcel ID:', id);
    console.log('Reference number:', referenceNumber);
    console.log('=== CREATE PARCEL END ===');
    
    return newParcel;
  } catch (error: any) {
    console.error('=== CREATE PARCEL ERROR ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error:', error);
    console.error('========================');
    throw error;
  }
};

/**
 * Get a parcel by reference number
 */
export const getParcelByReference = async (referenceNumber: string) => {
  try {
    console.log('Getting parcel by reference (client-side):', referenceNumber);
    
    const session = await getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Get from localStorage
    const parcels = getAllParcelsFromStorage();
    const parcel = parcels.find(p => p.referenceNumber === referenceNumber);
    
    if (!parcel) {
      console.log('Parcel not found:', referenceNumber);
      return null;
    }

    console.log('✓ Parcel found:', parcel.id);
    return parcel;
  } catch (error) {
    console.error('Get parcel by reference error:', error);
    return null;
  }
};

/**
 * Get a parcel by ID
 */
export const getParcelById = async (id: string) => {
  try {
    console.log('Getting parcel by ID (client-side):', id);
    
    const session = await getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Get from localStorage
    const parcels = getAllParcelsFromStorage();
    const parcel = parcels.find(p => p.id === id);
    
    if (!parcel) {
      console.log('Parcel not found:', id);
      return null;
    }

    console.log('✓ Parcel found:', parcel.referenceNumber);
    return parcel;
  } catch (error) {
    console.error('Get parcel by ID error:', error);
    return null;
  }
};

/**
 * Get all parcels for a driver
 */
export const getParcelsByDriver = async (driverId: string) => {
  try {
    console.log('Getting parcels for driver (client-side):', driverId);
    
    const session = await getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Get from localStorage and filter by driver
    const parcels = getAllParcelsFromStorage();
    const driverParcels = parcels.filter(p => p.driverId === driverId);
    
    console.log(`✓ Found ${driverParcels.length} parcels for driver`);
    return driverParcels;
  } catch (error) {
    console.error('Get parcels by driver error:', error);
    return [];
  }
};

/**
 * Update parcel status
 */
export const updateParcelStatus = async (
  referenceNumber: string,
  status: 'registered' | 'verified' | 'delivered'
) => {
  try {
    console.log('Updating parcel status (client-side):', referenceNumber, status);
    
    const session = await getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Get all parcels
    const parcels = getAllParcelsFromStorage();
    
    // Find and update the parcel
    const parcelIndex = parcels.findIndex(p => p.referenceNumber === referenceNumber);
    
    if (parcelIndex === -1) {
      throw new Error('Parcel not found');
    }

    parcels[parcelIndex].status = status;
    
    // Save updated parcels
    saveParcelsToStorage(parcels);
    
    console.log('✓ Parcel status updated successfully');
    return parcels[parcelIndex];
  } catch (error) {
    console.error('Update parcel status error:', error);
    throw error;
  }
};

/**
 * Acknowledge/Verify a parcel
 */
export const acknowledgeParcel = async (referenceNumber: string) => {
  return updateParcelStatus(referenceNumber, 'verified');
};

/**
 * Get all parcels (for officials)
 */
export const getAllParcels = async () => {
  try {
    console.log('Getting all parcels (client-side)');
    
    const session = await getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Get all parcels from localStorage
    const parcels = getAllParcelsFromStorage();
    
    console.log(`✓ Found ${parcels.length} total parcels`);
    return parcels;
  } catch (error) {
    console.error('Get all parcels error:', error);
    return [];
  }
};