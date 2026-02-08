import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  createParcel,
  getParcelByReference,
  getParcelById,
  acknowledgeParcel as acknowledgeParcelAPI,
  ParcelData,
} from '@/lib/parcels';
import { ParcelItem } from '@/lib/supabase';
import { toast } from 'sonner';

interface SenderData {
  name: string;
  address: string;
  contact: string;
}

interface ReceiverData {
  name: string;
  contact: string;
  address: string;
}

interface CurrentParcelData {
  sender?: SenderData;
  receiver?: ReceiverData;
  items?: ParcelItem[];
}

interface ParcelContextType {
  currentParcel: CurrentParcelData;
  setSenderData: (data: SenderData) => void;
  setItemsData: (items: ParcelItem[]) => void;
  setReceiverData: (data: ReceiverData) => void;
  saveParcel: (receiverData?: ReceiverData) => Promise<ParcelData | null>;
  getParcel: (reference: string) => Promise<ParcelData | null>;
  getParcelDetails: (id: string) => Promise<ParcelData | null>;
  acknowledgeParcel: (reference: string) => Promise<void>;
  resetCurrentParcel: () => void;
}

const ParcelContext = createContext<ParcelContextType | undefined>(undefined);

export function ParcelProvider({ children }: { children: ReactNode }) {
  const [currentParcel, setCurrentParcel] = useState<CurrentParcelData>({});

  const setSenderData = (data: SenderData) => {
    console.log('[ParcelContext] Setting sender data:', data);
    setCurrentParcel((prev) => {
      const updated = { ...prev, sender: data };
      console.log('[ParcelContext] Updated parcel state:', updated);
      return updated;
    });
  };

  const setItemsData = (items: ParcelItem[]) => {
    console.log('[ParcelContext] Setting items data:', items);
    setCurrentParcel((prev) => {
      const updated = { ...prev, items };
      console.log('[ParcelContext] Updated parcel state:', updated);
      return updated;
    });
  };

  const setReceiverData = (data: ReceiverData) => {
    console.log('[ParcelContext] Setting receiver data:', data);
    setCurrentParcel((prev) => {
      const updated = { ...prev, receiver: data };
      console.log('[ParcelContext] Updated parcel state:', updated);
      return updated;
    });
  };

  const saveParcel = async (receiverData?: ReceiverData): Promise<ParcelData | null> => {
    try {
      console.log('=== SAVE PARCEL DEBUG START ===');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Receiver data passed:', receiverData);
      console.log('Current parcel state:', currentParcel);
      
      // Get auth info dynamically from supabase
      console.log('Step 1: Importing supabase library...');
      const { supabase } = await import('@/lib/supabase');
      console.log('Step 2: Supabase library imported successfully');
      
      console.log('Step 3: Getting session...');
      const startTime = Date.now();
      const { data: { session } } = await supabase.auth.getSession();
      const sessionTime = Date.now() - startTime;
      console.log(`Step 4: Session retrieved in ${sessionTime}ms`);
      
      const user = session?.user;
      
      console.log('Session info:', {
        hasSession: !!session,
        hasUser: !!user,
        userId: user?.id,
        accessToken: session?.access_token ? 'present' : 'missing'
      });
      
      if (!user) {
        console.error('Authentication check failed - no user found');
        toast.error('You must be logged in to save parcels');
        return null;
      }

      // Use passed receiverData or fall back to state
      const receiver = receiverData || currentParcel.receiver;
      
      console.log('Step 5: Validating parcel data...');
      if (!currentParcel.sender || !receiver || !currentParcel.items) {
        console.error('Missing parcel data:', {
          hasSender: !!currentParcel.sender,
          hasReceiver: !!receiver,
          hasItems: !!currentParcel.items,
          receiverData,
          currentParcel
        });
        toast.error('Missing parcel information');
        return null;
      }

      console.log('Step 6: Calling createParcel API...');
      console.log('Parcel summary:', {
        hasSender: !!currentParcel.sender,
        hasReceiver: !!receiver,
        hasItems: !!currentParcel.items,
        itemCount: currentParcel.items?.length,
        driverId: user.id
      });

      const createParcelStart = Date.now();
      const parcel = await createParcel({
        sender: currentParcel.sender,
        receiver: receiver,
        items: currentParcel.items,
        driverId: user.id,
      });
      const createParcelTime = Date.now() - createParcelStart;

      console.log(`Step 7: createParcel completed in ${createParcelTime}ms`);
      console.log('Parcel created successfully:', parcel);
      console.log('=== SAVE PARCEL DEBUG END ===');
      
      toast.success('Parcel saved successfully!');
      return parcel;
    } catch (error: any) {
      console.error('=== SAVE PARCEL ERROR ===');
      console.error('Timestamp:', new Date().toISOString());
      console.error('Error message:', error?.message);
      console.error('Error details:', error);
      console.error('========================');
      
      // Show the specific error message from the server/API
      const errorMessage = error?.message || 'Failed to save parcel';
      toast.error(errorMessage);
      return null;
    }
  };

  const getParcel = async (reference: string): Promise<ParcelData | null> => {
    try {
      const parcel = await getParcelByReference(reference);
      if (!parcel) {
        toast.error('Parcel not found');
      }
      return parcel;
    } catch (error) {
      console.error('Get parcel error:', error);
      toast.error('Failed to fetch parcel');
      return null;
    }
  };

  const getParcelDetails = async (id: string): Promise<ParcelData | null> => {
    try {
      const parcel = await getParcelById(id);
      if (!parcel) {
        toast.error('Parcel not found');
      }
      return parcel;
    } catch (error) {
      console.error('Get parcel details error:', error);
      toast.error('Failed to fetch parcel details');
      return null;
    }
  };

  const acknowledgeParcel = async (reference: string): Promise<void> => {
    try {
      await acknowledgeParcelAPI(reference);
      toast.success('Parcel verified successfully!');
    } catch (error) {
      console.error('Acknowledge parcel error:', error);
      toast.error('Failed to verify parcel');
      throw error;
    }
  };

  const resetCurrentParcel = () => {
    setCurrentParcel({});
  };

  return (
    <ParcelContext.Provider
      value={{
        currentParcel,
        setSenderData,
        setItemsData,
        setReceiverData,
        saveParcel,
        getParcel,
        getParcelDetails,
        acknowledgeParcel,
        resetCurrentParcel,
      }}
    >
      {children}
    </ParcelContext.Provider>
  );
}

export function useParcel() {
  const context = useContext(ParcelContext);
  if (!context) {
    throw new Error('useParcel must be used within ParcelProvider');
  }
  return context;
}

// Re-export types
export type { ParcelData, ParcelItem };