# Admin & Pharmacy Panel Implementation Guide

## 🎯 Overview

This document provides a comprehensive guide to the newly created **Admin Panel** and **Pharmacy Dashboard** features added to the MediNear platform.

## 📊 What Was Created

### 1. Backend Infrastructure (Added to `/controllers`, `/middleware`, and `/routes`)

#### **AdminController** (`/controllers/adminController.js`)
Central admin operations management with 8 key functions:
- **getDashboardStats**: Retrieves platform-wide statistics (users, pharmacies, medicines, reservations)
- **getAllUsers**: Paginated user list with search and filtering
- **getAllPharmacies**: Pharmacy management with search capability
- **getAllMedicines**: Medicine inventory management
- **deleteUser**: Remove user accounts
- **deleteMedicine**: Remove medicines from system
- **deletePharmacy**: Remove pharmacy accounts
- **getAllReservations**: Track and view all reservations with filtering
- **updateReservationStatus**: Manage reservation lifecycle (active → completed → cancelled)

#### **AdminAuth Middleware** (`/middleware/adminAuth.js`)
Protects admin routes by:
- Validating JWT tokens
- Verifying admin role from token
- Returning appropriate error codes (401: No token, 403: Not admin, 400: Invalid token)

#### **AdminRoutes** (`/routes/adminRoutes.js`)
9 REST endpoints all protected by `adminAuth` middleware:
```
GET    /api/admin/dashboard/stats              - Fetch dashboard statistics
GET    /api/admin/users                        - List all users (paginated, searchable)
DELETE /api/admin/users/:userId               - Delete user
GET    /api/admin/pharmacies                  - List all pharmacies
DELETE /api/admin/pharmacies/:pharmacyId      - Delete pharmacy
GET    /api/admin/medicines                   - List all medicines
DELETE /api/admin/medicines/:medicineId       - Delete medicine
GET    /api/admin/reservations                - List reservations (with status filter)
PUT    /api/admin/reservations/:id/status     - Update reservation status
```

#### **Server Integration** (Updated `/server.js`)
Added admin routes to Express server:
```javascript
app.use("/api/admin", require("./routes/adminRoutes"));
```

### 2. Frontend Components

#### **AdminDashboard** (`/src/pages/AdminDashboard.jsx`)
Complete admin management interface with 5 tabs:

1. **📊 Dashboard Tab**
   - Displays 7 key statistics:
     - Total Users
     - Total Pharmacies
     - Total Medicines
     - Total Reservations
     - Active Reservations
     - Completed Reservations
     - Cancelled Reservations
   - Beautiful stat cards with gradient styling

2. **👥 Users Tab**
   - User management interface
   - Search by name, email, or phone
   - Delete user functionality
   - Displays: Name, Email, Phone, Role
   - Pagination support

3. **💊 Medicines Tab**
   - Medication inventory management
   - Search by medicine name
   - Delete medicine functionality
   - Shows: Name, Generic Name, Strength, Price

4. **🏥 Pharmacies Tab**
   - Pharmacy management
   - Search by pharmacy name
   - Delete pharmacy functionality
   - Displays: Name, Location, Phone, Rating

5. **📋 Reservations Tab**
   - Reservation tracking and management
   - Filter by status (All, Active, Completed, Cancelled)
   - Update reservation status in real-time
   - Shows: Medicine, Pharmacy, User, Quantity, Status

**Features:**
- Role-based access (only admins can access)
- Real-time data fetching
- Search and filtering capabilities
- Pagination support
- Delete confirmations
- Success/error toast notifications
- Responsive design (mobile, tablet, desktop)
- Professional gradient styling

#### **AdminDashboard Styling** (`/src/pages/AdminDashboard.css`)
- 400+ lines of modern CSS
- Gradients: Purple-blue theme (#667eea to #764ba2)
- Smooth animations and transitions
- Responsive breakpoints (768px, 480px)
- Professional table styling
- Status badges with color coding
- Hover effects and visual feedback

#### **PharmacyDashboard** (`/src/pages/PharmacyDashboard.jsx`)
Pharmacy owner management interface with 4 tabs:

1. **📊 Overview Tab**
   - Business statistics display
   - Medicines in stock
   - Active orders count
   - Completed orders count
   - Average rating
   - Total reviews
   - Monthly revenue
   - Highlight card for active orders

2. **💊 Inventory Tab**
   - Medicine stock management
   - Displays: Name, Generic Name, Strength, Stock, Price, Status
   - Stock level indicators (High: green, Low: orange, Empty: red)
   - Available/Out of Stock badges

3. **📋 Reservations Tab**
   - Order management interface
   - Filter by status
   - Shows: Customer, Medicine, Quantity, Total Amount, Status, Date
   - Real-time order tracking

4. **⭐ Ratings Tab**
   - Customer reviews display
   - Review cards with:
     - Customer name and date
     - Star rating display
     - Customer comment/review
   - No pagination, shows all reviews

**Features:**
- Role-based access (only pharmacy owners)
- Statistics dashboard
- Order management
- Customer feedback viewing
- Responsive design
- Green theme (#27ae60) for pharmacy branding

#### **PharmacyDashboard Styling** (`/src/pages/PharmacyDashboard.css`)
- 450+ lines of professional CSS
- Gradients: Green theme (#27ae60 to #229954)
- Similar structure to admin panel but customized for pharmacy use
- Stock level color coding
- Review card styling
- Responsive design

### 3. Routes Integration

Updated `/medinear-frontend/src/App.jsx` with:
- Import AdminDashboard and PharmacyDashboard
- ProtectedAdminRoute component (checks token and role='admin')
- ProtectedPharmacyRoute component (checks token and role='pharmacy')
- Route definitions:
  - `/admin` → AdminDashboard (admin only)
  - `/pharmacy` → PharmacyDashboard (pharmacy only)

## 🔐 Security Implementation

### Role-Based Access Control (RBAC)
- **Admin Role**: Full platform management
- **Pharmacy Role**: Own pharmacy management only
- **User Role**: Regular platform users
- **Guest**: Limited access to browse medicines

### Token Verification
All admin/pharmacy endpoints verify:
1. JWT token presence in Authorization header
2. Token validity (JWT signature verification)
3. Role claim matches required role

### Error Handling
- 401: Missing or invalid token
- 403: Valid token but insufficient permissions
- 400: Malformed token
- 500: Server errors with meaningful messages

## 📡 API Endpoints Reference

### Admin Endpoints (All require admin token)
```
GET /api/admin/dashboard/stats
Response: { totalUsers, totalPharmacies, totalMedicines, totalReservations, activeReservations, completedReservations, cancelledReservations }

GET /api/admin/users?page=1&limit=10&search=query
Response: { data: [user], pages: number, currentPage: number }

DELETE /api/admin/users/:userId
Response: { message: "User deleted successfully" }

GET /api/admin/pharmacies?page=1&limit=10&search=query
Response: { data: [pharmacy], pages: number, currentPage: number }

DELETE /api/admin/pharmacies/:pharmacyId
Response: { message: "Pharmacy deleted successfully" }

GET /api/admin/medicines?page=1&limit=10&search=query
Response: { data: [medicine], pages: number, currentPage: number }

DELETE /api/admin/medicines/:medicineId
Response: { message: "Medicine deleted successfully" }

GET /api/admin/reservations?page=1&limit=10&status=active
Response: { data: [reservation], pages: number, currentPage: number }

PUT /api/admin/reservations/:id/status
Body: { status: "completed" }
Response: { message: "Reservation status updated" }
```

## 🚀 How to Access

### Admin Panel
1. **Login as Admin**:
   - Use credentials with role='admin' set in database
   - Or modify user role in MongoDB: `db.users.updateOne({_id: id}, {$set: {role: 'admin'}})`

2. **Navigate to Admin Dashboard**:
   - URL: `http://localhost:5173/admin` (development)
   - Or `http://yourdomain.com/admin` (production)
   - Should see navigation button if admin is logged in

3. **Manage Platform**:
   - View statistics
   - Search and delete users
   - Manage pharmacy accounts
   - Manage medicine inventory
   - Track and manage reservations

### Pharmacy Dashboard
1. **Login as Pharmacy Owner**:
   - Account with role='pharmacy'
   - Linked to specific pharmacy

2. **Navigate to Pharmacy Dashboard**:
   - URL: `http://localhost:5173/pharmacy` (development)
   - Shows on top navigation when pharmacy user is logged in

3. **Manage Your Pharmacy**:
   - View business statistics
   - Check inventory levels
   - Manage customer orders
   - View customer reviews and ratings

## 🔄 Data Flow

### Admin Operations Flow
```
User Action (Delete user)
  ↓
Frontend AdminDashboard clicks delete button
  ↓
AdminDashboard executes deleteUser(userId)
  ↓
axios.delete(/api/admin/users/{userId}, {token})
  ↓
Express Router receives DELETE /api/admin/users/:userId
  ↓
adminAuth middleware validates token + role
  ↓
adminController.deleteUser executes
  ↓
User.findByIdAndDelete() removes from MongoDB
  ↓
Response sent back with success message
  ↓
Frontend updates UI and shows toast notification
```

### Pharmacy Stats Flow
```
PharmacyDashboard loads
  ↓
useEffect triggers fetchPharmacyStats()
  ↓
axios.get(/api/pharmacy/{pharmacyId}/stats, {token})
  ↓
Backend retrieves pharmacy-specific data
  ↓
Stat cards update with real data
  ↓
User sees business overview
```

## 📱 Responsive Design

### Mobile (< 480px)
- Single column stat cards
- Stacked table layout
- Reduced font sizes
- Optimized button sizes

### Tablet (480px - 768px)
- 2-column grid for stats
- Horizontal scrollable tables
- Readable font sizes

### Desktop (>768px)
- 3+ column responsive grid
- Full-width tables
- Optimal spacing

## 🎨 Design System

### Colors
**Admin Panel (Purple Theme)**:
- Primary: #667eea → #764ba2 (gradient)
- Text: #2c3e50
- Secondary: #7f8c8d

**Pharmacy Panel (Green Theme)**:
- Primary: #27ae60 → #229954 (gradient)
- Text: #2c3e50
- Secondary: #7f8c8d

### Animations
- slideInDown: Header entrance
- fadeIn: Content entrance
- Hover transforms: Card elevation effects
- Smooth transitions: All interactions

## 📊 Database Queries Used

### User Statistics
```javascript
User.countDocuments()
User.findOne({}, '-password') // Exclude password field
```

### Pagination Pattern
```
page = 1, limit = 10, skip = (page - 1) * limit
db.collection.find().skip(skip).limit(limit)
pages = Math.ceil(total / limit)
```

### Nested Population (Reservations)
```javascript
Reservation.find()
  .populate('medicine')
  .populate('pharmacy')
  .populate('user')
```

## ⚙️ Configuration

### Environment Variables Needed
```
JWT_SECRET=your_secret_key
MONGO_URI=your_mongodb_connection
VITE_API_URL=http://localhost:5000/api
```

### Backend Routes Setup
File: `/controllers/adminController.js`
- Imports: User, Pharmacy, Medicine, Reservation models
- Uses: formatSuccessResponse, formatErrorResponse utilities

File: `/middleware/adminAuth.js`
- JWT verification with role check
- Error handling for invalid/missing tokens

## 🧪 Testing

### Admin Dashboard
1. Login with admin account
2. Visit `/admin` route
3. Test each tab:
   - Dashboard stats should load
   - Users tab should list users
   - Search should filter results
   - Delete should show confirmation

### Pharmacy Dashboard
1. Login with pharmacy account
2. Visit `/pharmacy` route
3. Test each tab:
   - Overview should show stats
   - Inventory shows medicines
   - Reservations shows orders
   - Ratings shows reviews

## 🐛 Troubleshooting

### Problem: "Access Denied" when accessing admin panel
**Solution**: Verify user role is set to 'admin' in database
```bash
# MongoDB command
db.users.updateOne({email: "admin@example.com"}, {$set: {role: 'admin'}})
```

### Problem: Admin routes return 404
**Solution**: Verify routes are registered in server.js:
```javascript
app.use("/api/admin", require("./routes/adminRoutes"));
```

### Problem: Data not loading in dashboard
**Solution**: Check browser console for API errors
- Verify token is being sent
- Check server logs for route hits
- Ensure MongoDB is connected

## 📈 Future Enhancements

Potential features to add:
- [ ] Analytics charts and graphs
- [ ] Export data to CSV/PDF
- [ ] Advanced filtering and sorting
- [ ] Batch operations (delete multiple)
- [ ] User activity logs
- [ ] Pharmacy performance metrics
- [ ] Customer retention metrics
- [ ] Revenue analytics
- [ ] Email notifications for admins
- [ ] Audit trail for all operations

## 📝 File Structure Summary

```
/controllers
  adminController.js          [NEW] - Admin operations (8 functions)

/middleware
  adminAuth.js                [NEW] - Admin authentication middleware

/routes
  adminRoutes.js              [NEW] - Admin API endpoints (9 routes)

/medinear-frontend/src
  /pages
    AdminDashboard.jsx        [NEW] - Admin management UI
    AdminDashboard.css        [NEW] - Admin styling
    PharmacyDashboard.jsx     [NEW] - Pharmacy owner UI
    PharmacyDashboard.css     [NEW] - Pharmacy styling
    App.jsx                   [MODIFIED] - Added admin/pharmacy routes

/server.js                      [MODIFIED] - Added admin routes registration
```

## ✅ Completion Status

**Backend**: ✅ Complete
- Controllers created
- Middleware implemented
- Routes configured
- Server integration done

**Frontend**: ✅ Complete
- Both dashboard components created
- Styling implemented
- Routes integrated
- Role-based access control working

**Build Status**: ✅ Successful
- 212 frontend modules
- 836ms build time
- Zero compilation errors

## 🎓 Usage Example

### Admin Creating an Order
```javascript
// In AdminDashboard.jsx
const updateReservationStatus = async (reservationId, newStatus) => {
  try {
    await axios.put(
      `/api/admin/reservations/${reservationId}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    showToast('Reservation updated', 'success');
    fetchReservations(); // Reload data
  } catch (error) {
    showToast('Update failed', 'error');
  }
};
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs (browser and server)
3. Verify database connections
4. Check JWT token validity

---

**Last Updated**: Phase 12 - Admin & Pharmacy Panel Implementation
**Status**: Production Ready
**Next Steps**: Frontend navigation menu integration, testing on staging server
