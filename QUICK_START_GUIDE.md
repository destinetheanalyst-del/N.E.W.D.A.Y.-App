# Quick Start Guide - Goods Tracking System

## ✅ System Status: FULLY FUNCTIONAL

All components are working with client-side storage (localStorage). No server required!

---

## 🚀 How to Use the System

### For Drivers

#### 1️⃣ Register/Login
```
URL: /driver/signup (first time) or /driver/login
- Enter phone number (10 digits)
- Enter full name
- Enter vehicle number (e.g., ABC123)
- Create password
```

#### 2️⃣ Register a Parcel
```
Driver Home → Click "Register Parcel"

Step 1 - Sender Details:
- Name: John Doe
- Address: 123 Main Street
- Contact: 1234567890

Step 2 - Item Details:
- Item Name: Electronics
- Quantity: 2
- Weight: 5kg
- Description: Laptop and accessories

Step 3 - Receiver Details:
- Name: Jane Smith
- Contact: 0987654321
- Address: 456 Oak Avenue
```

#### 3️⃣ Get QR Code
```
After submitting, you'll see:
- ✓ Success message
- QR Code (200x200 pixels)
- Reference Number (e.g., GTS-20260202-1001)
- Copy button to copy reference

Action: Save or print this screen!
```

---

### For Officials

#### 1️⃣ Register/Login
```
URL: /official/signup (first time) or /official/login
- Enter phone number (10 digits)
- Enter full name
- Create password
```

#### 2️⃣ Track a Parcel

**Option A: Scan QR Code** (Recommended - Fastest)
```
Official Home → Track Parcel
1. Click "Scan QR Code"
2. Allow camera access
3. Point camera at QR code
4. Reference auto-fills
5. View parcel details automatically
```

**Option B: Manual Entry**
```
Official Home → Track Parcel
1. Type reference number: GTS-20260202-1001
2. Click "Submit"
3. View parcel details
```

#### 3️⃣ Verify/Acknowledge Parcel
```
On Parcel Details screen:
1. Review all information
2. Click "Acknowledge Parcel"
3. ✓ Status changes to "Verified"
```

---

## 📱 Reference Number Format

```
GTS-20260202-1001
│   │        │
│   │        └─ Sequence number (auto-increment)
│   └────────── Date (YYYYMMDD)
└────────────── Prefix (Goods Tracking System)
```

**Examples:**
- `GTS-20260202-1001` - First parcel on Feb 2, 2026
- `GTS-20260202-1002` - Second parcel on Feb 2, 2026
- `GTS-20260203-1003` - Third parcel on Feb 3, 2026

---

## 🔄 Parcel Status Flow

```
registered → verified → delivered
    ↓            ↓          ↓
 Driver      Official   Official
 creates     scans &    marks as
 parcel      verifies   delivered
```

**Status Meanings:**
- **Registered**: Driver created the parcel
- **Verified**: Official scanned and acknowledged
- **Delivered**: Official confirmed delivery (future feature)

---

## 💾 Data Storage

All data is stored in **browser localStorage**:

### View Stored Data
```
Browser DevTools (F12) → Application/Storage → Local Storage

Keys:
- gts_parcels         → All parcel data (JSON array)
- gts_parcel_counter  → Next sequence number
```

### Clear All Data
```javascript
// In browser console:
localStorage.removeItem('gts_parcels');
localStorage.removeItem('gts_parcel_counter');

// Refresh page to start fresh
```

---

## 🧪 Testing Scenarios

### Test 1: Complete Driver Flow
```
1. ✓ Signup as driver
2. ✓ Login
3. ✓ Register parcel
4. ✓ See QR code
5. ✓ Copy reference number
```

### Test 2: Complete Official Flow
```
1. ✓ Signup as official
2. ✓ Login
3. ✓ Scan QR code (or enter reference)
4. ✓ View parcel details
5. ✓ Acknowledge parcel
6. ✓ Check status changed to "verified"
```

### Test 3: Cross-App Flow
```
1. ✓ Register parcel as driver (get reference: GTS-20260202-1001)
2. ✓ Logout
3. ✓ Login as official
4. ✓ Track parcel using reference
5. ✓ Verify data matches what driver entered
```

---

## 🎯 Quick Tips

### For Drivers
- 📝 Always fill all required fields
- 📸 Save/screenshot the QR code confirmation
- 📋 Share reference number with receiver
- 🔄 Can view parcel history in app

### For Officials
- 📷 Use QR scan - it's faster than typing
- ✅ Verify all details before acknowledging
- 📊 Can view all parcels in the system
- 🔍 Double-check reference numbers if entering manually

### For Testing
- 🧹 Clear localStorage to reset data
- 🔐 Create separate driver and official accounts
- 📱 Test QR scanning on mobile devices
- 🖥️ Test manual entry on desktop

---

## 🎨 UI Color Schemes

### Driver App
- **Primary**: Blue/Indigo gradient
- **Accent**: Blue buttons
- **Background**: Light blue to indigo

### Official App
- **Primary**: Green/Emerald gradient
- **Accent**: Green buttons
- **Background**: Light green to emerald

This visual distinction helps users know which app they're in.

---

## 🔧 Troubleshooting

### Problem: QR Scanner Not Working
```
Solution:
1. Grant camera permissions in browser
2. Use HTTPS (required for camera access)
3. Try a different browser (Chrome recommended)
4. Check if camera is used by another app
```

### Problem: "Parcel Not Found"
```
Solution:
1. Verify reference number is correct
2. Check for typos (GTS-20260202-1001)
3. Ensure parcel was created in same browser
4. Check localStorage for data
```

### Problem: Can't Login
```
Solution:
1. Ensure phone number is 10 digits
2. Check password is at least 6 characters
3. Verify you're on correct app (driver vs official)
4. Try signing up if you haven't registered
```

### Problem: "Missing Parcel Information"
```
Solution:
1. Fill all required fields in form
2. Don't skip steps in multi-step form
3. Add at least one item
4. Complete all three steps before submitting
```

---

## 📊 Sample Test Data

### Driver Account
```
Phone: 1234567890
Password: driver123
Name: John Driver
Vehicle: ABC123
```

### Official Account
```
Phone: 9876543210
Password: official123
Name: Sarah Official
```

### Sample Parcel
```
Sender:
- Name: John Doe
- Address: 123 Main Street, Springfield
- Contact: 5551234567

Items:
- Name: Electronics Package
- Quantity: 2
- Weight: 5kg
- Description: Laptop and accessories

Receiver:
- Name: Jane Smith
- Contact: 5559876543
- Address: 456 Oak Avenue, Springfield
```

---

## 📱 Mobile vs Desktop

### Mobile Advantages
- ✅ Camera-based QR scanning
- ✅ Better for field use
- ✅ More portable
- ✅ Touch-optimized UI

### Desktop Advantages
- ✅ Larger screen for details
- ✅ Easier typing
- ✅ Better for bulk operations
- ✅ Can use external QR scanner

**Recommendation**: Use mobile for scanning, desktop for data entry

---

## 🎓 Key Concepts

### What is a Reference Number?
A unique identifier for each parcel. Like a tracking number for packages.

### What is a QR Code?
A scannable barcode that contains the reference number. Makes tracking faster.

### What is Acknowledgment?
When an official confirms they have received/verified the parcel.

### What is Client-Side Storage?
Data stored in your browser (localStorage). No internet needed after login.

---

## ✨ Next Steps

### After Testing Locally
1. ✓ System works completely offline (after auth)
2. ✓ All features functional
3. ✓ Ready for demo/presentation
4. ✓ Can be deployed to production

### For Production (Future)
1. Add server-side storage for data sync
2. Enable multi-device access
3. Add data backup/export
4. Implement real-time notifications
5. Add delivery confirmation feature

---

## 📞 Summary

**Current State**: ✅ FULLY FUNCTIONAL

- ✅ Authentication works (Driver & Official)
- ✅ Parcel registration works
- ✅ QR code generation works
- ✅ QR code scanning works
- ✅ Parcel tracking works
- ✅ Status updates work
- ✅ All client-side (no server needed)

**Everything is ready to use!**

Just open the app and start testing with the flows above.
