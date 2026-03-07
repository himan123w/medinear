# 🚀 MediNear - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Prepare Your Environment

```bash
cd /Users/rajpoothimanshusingh369/Desktop/medinear
```

### Step 2: Create `.env` File

Create a file named `.env` in the project root:

```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/medinear
JWT_SECRET=dev-secret-key-change-in-production
PORT=5001
NODE_ENV=development
```

> 💡 **Get MongoDB:** Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Step 3: Setup Project

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- ✅ Check Node.js installation
- ✅ Install backend dependencies
- ✅ Install frontend dependencies
- ✅ Create config files

### Step 4: Start the Project

**Option A - Automatic (Recommended):**
```bash
./start.sh
```

**Option B - Manual (2 Terminals):**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
cd medinear-frontend
npm start
```

### Step 5: Open in Browser

```
Frontend: http://localhost:5173
```

---

## 📱 First Time Usage

### Create Pharmacy Account
1. Click "✏️ Register Pharmacy"
2. Fill in pharmacy details:
   - Pharmacy Name: e.g., "City Pharmacy"
   - Owner Name: Your name
   - Phone: 10-digit number
   - Password: Secure password
   - Area: Location area
   - License: License number
3. Click "Register"

### Login to Dashboard
1. Click "🔐 Login"
2. Enter phone & password
3. Click "Login"
4. View your dashboard

### Add Medicines
1. In Dashboard, click "➕ Add Medicine"
2. Enter:
   - Medicine Name: e.g., "Aspirin"
   - Price: ₹100
   - Check "Available in Stock" if in stock
3. Click "Add Medicine"
4. View in your medicines list

### Search as Customer
1. Go to Home (logo click)
2. Click "🔍 Search Medicines"
3. Enter medicine name
4. View results with prices and pharmacies
5. Click "📞 Call" to contact pharmacy
6. Click "🛒 Order" to order (coming soon)

---

## 🔧 Common Issues & Fixes

### Port Already in Use
```bash
# Find process using port 5001
lsof -i :5001

# Kill it
kill -9 <PID>
```

### MongoDB Connection Error
- ✅ Check `.env` MONGO_URI
- ✅ Verify MongoDB cluster is running
- ✅ Check IP whitelist in MongoDB Atlas
- ✅ Check internet connection

### Frontend Can't Connect to Backend
```bash
# Check backend is running
curl http://localhost:5001/

# Verify .env.local in frontend
cat medinear-frontend/.env.local
```

### Dependencies Won't Install
```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
```

---

## 📊 Project Overview

```
Frontend (React + Vite)
    ↓ (API Calls)
Backend (Node.js + Express)
    ↓ (Queries)
Database (MongoDB)
```

### API Response Flow
```json
Request: GET /api/medicine/search?name=Aspirin

Response:
{
  "_id": "...",
  "name": "Aspirin",
  "price": 100,
  "available": true,
  "pharmacy": {
    "_id": "...",
    "name": "City Pharmacy",
    "area": "Downtown",
    "phone": "9876543210"
  }
}
```

---

## 🎯 Next Steps

- [ ] Create MongoDB Atlas account
- [ ] Configure `.env` with MongoDB URI
- [ ] Run `./setup.sh`
- [ ] Start backend (`npm run dev`)
- [ ] Start frontend (`npm start`)
- [ ] Register a pharmacy account
- [ ] Add medicines to inventory
- [ ] Search medicines as customer

---

## 💡 Tips & Tricks

### Live Updates
Both frontend and backend auto-reload on file changes:
- Backend: `nodemon` watches files
- Frontend: Vite hot reload

### Debug API Calls
```bash
# See all API requests
# Open browser DevTools → Network tab
```

### Test API Directly
```bash
# Test backend
curl http://localhost:5001/

# Search medicines
curl "http://localhost:5001/api/medicine/search?name=Aspirin"
```

### View Database
```bash
# Use MongoDB Compass (GUI)
# or MongoDB Atlas dashboard (Web UI)
```

---

## 📚 Documentation Links

- [React Docs](https://react.dev)
- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Vite Docs](https://vitejs.dev)
- [Axios Docs](https://axios-http.com)

---

## 🆘 Need Help?

1. **Check logs** - Both backend and frontend show error messages
2. **Verify .env** - Check all required variables
3. **Restart servers** - Stop and restart everything
4. **Clear cache** - `npm cache clean --force`
5. **Fresh install** - Remove node_modules and reinstall

---

## 🎉 You're Ready!

Your MediNear platform is set up and ready to use. 

**Start now:**
```bash
cd /Users/rajpoothimanshusingh369/Desktop/medinear
./setup.sh
./start.sh
```

Happy coding! 🚀

---

**Questions?** Check [COMPLETE_SETUP.md](./COMPLETE_SETUP.md) for detailed documentation.
