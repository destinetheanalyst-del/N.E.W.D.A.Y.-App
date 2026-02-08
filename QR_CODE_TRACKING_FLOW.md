# QR Code Tracking System - Complete Flow Documentation

## Overview

The Goods Tracking System (GTS) uses QR codes to enable seamless parcel tracking. When a driver registers a parcel, the system generates both a **reference number** and a **QR code** that encodes that reference number. Officials can then scan the QR code to instantly retrieve and verify the parcel.

---

## Complete Flow

### 📦 Part 1: Driver Registers Parcel

#### Step 1: Driver Fills Multi-Step Form
```
Driver Home → Register Parcel
├── Step 1: Sender Details (name, address, contact)
├── Step 2: Item Details (name, quantity, weight, description)
└── Step 3: Receiver Details (name, contact, address)
```

#### Step 2: System Creates Parcel
**File:** `/src/app/context/ParcelContext.tsx` → `saveParcel()`

```typescript
const parcel = await createParcel({
  sender: { name, address, contact },
  receiver: { name, contact, address },
  items: [{ name, quantity, weight, description }],
  driverId: user.id,
});
```

#### Step 3: System Generates Reference Number
**File:** `/src/lib/parcels.ts` → `generateReferenceNumber()`

```typescript
Format: GTS-YYYYMMDD-XXXX

Example: GTS-20260202-1001

Components:
- GTS: Prefix (Goods Tracking System)
- 20260202: Date (February 2, 2026)
- 1001: Auto-increment sequence number
```

**Storage:**
- Reference number stored in parcel object
- Counter persisted in localStorage: `gts_parcel_counter`

#### Step 4: System Generates QR Code
**File:** `/src/app/components/driver/DriverParcelConfirmation.tsx`

```tsx
<QRCodeSVG 
  value={latestParcel.referenceNumber}  // ← Encodes "GTS-20260202-1001"
  size={200} 
/>
```

**What's Encoded:**
- The QR code contains **only** the reference number string
- Example: `"GTS-20260202-1001"`
- When scanned, returns this exact string

#### Step 5: Display Confirmation Screen

**UI Elements:**
```
┌─────────────────────────────────────┐
│     ✓ Parcel Registered            │
│        Successfully                 │
├─────────────────────────────────────┤
│                                     │
│     ┌─────────────────┐            │
│     │                 │            │
│     │   QR CODE HERE  │ ← 200x200  │
│     │                 │            │
│     └─────────────────┘            │
│                                     │
│     Reference Number                │
│     GTS-20260202-1001    [Copy]    │
│                                     │
│         [Save Button]               │
└─────────────────────────────────────┘
```

**Features:**
- ✅ QR code displays the reference number
- ✅ Reference number shown in large, copyable text
- ✅ Copy button for easy sharing
- ✅ Driver can save/print this screen

---

### 🔍 Part 2: Official Tracks Parcel

#### Step 1: Official Opens Track Parcel Page
**File:** `/src/app/components/official/TrackParcel.tsx`

```
Official Home → Track Parcel
```

**UI Options:**
```
┌─────────────────────────────────────┐
│        Track Parcel                 │
├─────────────────────────────────────┤
│                                     │
│    [📷 Scan QR Code]  ← Primary    │
│                                     │
│           ─── OR ───                │
│                                     │
│    Reference Number                 │
│    [________________]               │
│    [Submit]           ← Manual      │
│                                     │
└─────────────────────────────────────┘
```

#### Step 2a: Scan QR Code (Recommended)

**Implementation:** Uses `html5-qrcode` library

```typescript
import { Html5Qrcode } from 'html5-qrcode';

// When user clicks "Scan QR Code"
const html5QrCode = new Html5Qrcode("qr-reader");

await html5QrCode.start(
  { facingMode: "environment" },  // Use back camera on mobile
  {
    fps: 10,                      // 10 frames per second
    qrbox: { width: 250, height: 250 }  // Scan area size
  },
  (decodedText) => {
    // decodedText = "GTS-20260202-1001"
    setReferenceNumber(decodedText);
    stopScanning();
    toast.success('QR Code scanned successfully!');
  }
);
```

**User Experience:**
1. User clicks "Scan QR Code"
2. Camera opens with scan area overlay
3. User points camera at QR code
4. System automatically detects and decodes
5. Reference number auto-fills in input field
6. Camera stops automatically
7. Success toast appears

#### Step 2b: Manual Entry (Alternative)

User can also manually type the reference number:
```
Input: GTS-20260202-1001
Click: Submit
```

#### Step 3: Fetch Parcel Data

**File:** `/src/app/context/ParcelContext.tsx` → `getParcel()`

```typescript
const getParcel = async (reference: string) => {
  // reference = "GTS-20260202-1001"
  const parcel = await getParcelByReference(reference);
  // Returns full parcel object with all details
  return parcel;
};
```

**File:** `/src/lib/parcels.ts` → `getParcelByReference()`

```typescript
// Searches localStorage for parcel with matching reference
const parcels = getAllParcelsFromStorage();
const parcel = parcels.find(p => p.referenceNumber === reference);
```

#### Step 4: Display Parcel Details

**Navigation:**
```typescript
navigate(`/official/details/${parcel.id}`);
```

**File:** `/src/app/components/official/OfficialParcelDetails.tsx`

**UI Display:**
```
┌─────────────────────────────────────┐
│    [← Back]      Parcel Details     │
├─────────────────────────────────────┤
│                                     │
│  📋 Reference: GTS-20260202-1001    │
│  📍 Status: Registered              │
│  📅 Date: Feb 2, 2026              │
│                                     │
│  👤 Sender Information              │
│  Name: John Doe                     │
│  Address: 123 Main St               │
│  Contact: 1234567890                │
│                                     │
│  📦 Items                           │
│  • Package (2 units, 5kg)          │
│    Electronics                      │
│                                     │
│  👥 Receiver Information            │
│  Name: Jane Smith                   │
│  Address: 456 Oak Ave               │
│  Contact: 0987654321                │
│                                     │
│  [Acknowledge Parcel]   ← Button    │
│                                     │
└─────────────────────────────────────┘
```

#### Step 5: Official Verifies/Acknowledges Parcel

**Action:**
```typescript
onClick: acknowledgeParcel(referenceNumber)
```

**File:** `/src/lib/parcels.ts` → `updateParcelStatus()`

```typescript
// Find parcel by reference number
const parcelIndex = parcels.findIndex(
  p => p.referenceNumber === referenceNumber
);

// Update status
parcels[parcelIndex].status = 'verified';

// Save to localStorage
saveParcelsToStorage(parcels);
```

**Status Flow:**
```
registered → verified → delivered
   ↑           ↑           ↑
 Driver    Official    Official
 creates   scans &     marks
 parcel    verifies   delivered
```

---

## Technical Implementation

### QR Code Generation

**Library:** `qrcode.react` (v4.2.0)

**Component:**
```tsx
import { QRCodeSVG } from 'qrcode.react';

<QRCodeSVG 
  value="GTS-20260202-1001"  // Data to encode
  size={200}                  // Size in pixels
/>
```

**Output:**
- SVG format (scalable, crisp at any size)
- Black QR code on white background
- Contains error correction
- Scannable by any QR reader

### QR Code Scanning

**Library:** `html5-qrcode` (v2.3.8)

**Features:**
- ✅ Works on mobile and desktop
- ✅ Uses device camera
- ✅ Real-time scanning
- ✅ Auto-focus and auto-decode
- ✅ No app installation required
- ✅ Browser-based scanning

**Browser Support:**
- Chrome/Edge: ✅ Full support
- Safari: ✅ iOS 11+ (requires HTTPS)
- Firefox: ✅ Full support
- Mobile browsers: ✅ Works on iOS & Android

### Data Storage

**Storage Method:** Browser localStorage

**Keys:**
```
gts_parcels         → Array of all parcels
gts_parcel_counter  → Next sequence number
```

**Example Data:**
```json
{
  "gts_parcels": [
    {
      "id": "abc-123-def-456",
      "referenceNumber": "GTS-20260202-1001",
      "sender": { "name": "John Doe", ... },
      "receiver": { "name": "Jane Smith", ... },
      "items": [ { "name": "Package", ... } ],
      "status": "verified",
      "driverId": "user-uuid-123",
      "timestamp": "2026-02-02T10:00:00.000Z"
    }
  ],
  "gts_parcel_counter": "1001"
}
```

---

## User Workflows

### 👨‍💼 Driver Workflow

```
1. Login as Driver
2. Click "Register Parcel"
3. Fill Sender Details → Next
4. Add Item(s) → Next
5. Fill Receiver Details → Submit
6. ✓ See QR Code + Reference Number
7. Save/Print confirmation
8. Share QR code with receiver or official
```

**Time:** ~2 minutes per parcel

### 👮 Official Workflow (QR Scan)

```
1. Login as Official
2. Click "Track Parcel"
3. Click "Scan QR Code"
4. Point camera at QR code
5. ✓ Auto-filled reference number
6. View parcel details
7. Click "Acknowledge"
8. ✓ Status updated to "Verified"
```

**Time:** ~30 seconds per parcel

### 👮 Official Workflow (Manual Entry)

```
1. Login as Official
2. Click "Track Parcel"
3. Type reference number
4. Click "Submit"
5. View parcel details
6. Click "Acknowledge"
7. ✓ Status updated to "Verified"
```

**Time:** ~1 minute per parcel

---

## Testing the QR System

### Test Case 1: End-to-End Flow
```
✓ Driver registers parcel
✓ QR code displays on confirmation
✓ Driver can copy reference number
✓ Official scans QR code
✓ Correct parcel details load
✓ Official acknowledges parcel
✓ Status updates to "verified"
```

### Test Case 2: QR Code Scanning
```
✓ Camera opens when clicking "Scan QR Code"
✓ Scan area overlay appears
✓ QR code is detected automatically
✓ Reference number auto-fills
✓ Camera stops after scan
✓ Success toast appears
```

### Test Case 3: Manual Entry
```
✓ Can type reference number manually
✓ Can copy-paste reference number
✓ Submit button works
✓ Loads same parcel as QR scan
```

### Test Case 4: Error Handling
```
✓ Invalid reference shows "Parcel not found"
✓ Camera permission denied shows error
✓ No camera shows appropriate message
```

---

## Console Logs

### Parcel Creation
```
=== CREATE PARCEL START (Client-Side Storage) ===
Timestamp: 2026-02-02T10:00:00.000Z
Parcel data: { sender: {...}, receiver: {...}, items: [...] }
✓ Parcel created successfully (client-side)
Parcel ID: abc-123-def-456
Reference number: GTS-20260202-1001
=== CREATE PARCEL END ===
```

### QR Code Scan
```
Getting parcel by reference (client-side): GTS-20260202-1001
✓ Parcel found: abc-123-def-456
```

### Acknowledge Parcel
```
Updating parcel status (client-side): GTS-20260202-1001 verified
✓ Parcel status updated successfully
```

---

## Advantages of This System

### For Drivers
- ✅ **Fast Registration** - Multi-step form is intuitive
- ✅ **Instant QR Code** - No waiting for generation
- ✅ **Easy Sharing** - Can copy reference or share QR
- ✅ **Proof of Registration** - Visual confirmation screen

### For Officials
- ✅ **Quick Scanning** - QR scan is faster than typing
- ✅ **Accurate** - No typos from manual entry
- ✅ **Mobile-Friendly** - Works on phones and tablets
- ✅ **No App Required** - Browser-based scanning

### Technical
- ✅ **No Server Needed** - All client-side (Figma Make compatible)
- ✅ **Instant Performance** - No network latency
- ✅ **Reliable** - No server downtime issues
- ✅ **Simple** - Easy to understand and maintain

---

## Future Enhancements (Optional)

### Potential Improvements
1. **Print QR Code** - Add print button on confirmation screen
2. **Email QR Code** - Send QR code to receiver's email
3. **Bulk Scanning** - Scan multiple parcels in sequence
4. **Scan History** - Track which parcels were scanned by whom
5. **QR Code Size Options** - Different sizes for printing/display
6. **Download QR Code** - Save QR code as PNG/SVG file

### Advanced Features
1. **GPS Location** - Add location data to QR code
2. **Timestamp** - Record when QR was scanned
3. **Photo Attachment** - Attach photos to parcel
4. **Signature Capture** - Digital signature on acknowledgment
5. **Offline Sync** - Queue scans when offline, sync later

---

## Summary

The QR code tracking system is **fully implemented and working**:

✅ **Driver registers parcel** → Reference number + QR code generated  
✅ **QR code displays** on confirmation screen  
✅ **Reference number** is copyable and shareable  
✅ **Official can scan** QR code using device camera  
✅ **Official can also** manually enter reference number  
✅ **Parcel details load** instantly from localStorage  
✅ **Status updates** when official acknowledges  
✅ **All client-side** - no server required  
✅ **Fast and reliable** - instant results  

The system works perfectly in the Figma Make environment and provides a complete parcel tracking solution using modern web technologies.
