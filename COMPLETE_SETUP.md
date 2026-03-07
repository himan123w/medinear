# 🏥 MediNear - Medicine Availability Platform

A complete full-stack platform connecting pharmacies with customers to search and locate available medicines in real-time.

---

## ✨ Features

### 👥 For Customers
- 🔍 **Search Medicines** - Real-time medicine availability search across pharmacies
- 💰 **Price Filtering** - Filter medicines by maximum price
- 📍 **Location Filtering** - Find medicines by pharmacy area
- 📊 **Smart Sorting** - Sort by price or pharmacy name
- 📞 **Direct Contact** - Call pharmacies directly from the app
- 🛒 **Order Medicines** - Order medicines online (coming soon)

### 💊 For Pharmacies
- 📋 **Dashboard** - Manage medicines inventory
- ➕ **Add Medicines** - List new medicines with price and availability
- ✏️ **Edit Inventory** - Update medicine details and stock status
- 🔒 **Secure Login** - JWT-based authentication for pharmacies
- 📊 **Analytics** - View statistics (coming soon)

---

## 🛠 Tech Stack

### Frontend
- **React 19** - Latest React with hooks
- **Vite** - Lightning-fast development server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Modern styling with animations
- **Tailwind CSS** - Utility-first CSS (configured)

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Secure authentication
- **BCrypt** - Password hashing
- **CORS** - Cross-origin support

---

## 📋 Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** - Comes with Node.js
- **MongoDB** - Local or Atlas account - [Sign up free](https://www.mongodb.com/cloud/atlas)

---

## 🚀 Quick Start

### 1️⃣ Clone & Setup

```bash
# Navigate to project directory
cd /path/to/medinear

# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

### 2️⃣ Configure Environment Variables

#### Backend Configuration
Create `.env` in the project root:

```bash
# Edit backend/.env (or create from example)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medinear
JWT_SECRET=your-super-secret-key-change-this-in-production
PORT=5001
NODE_ENV=development
```

<details>
<summary><strong>📌 Get MongoDB Connection String</strong></summary>

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` and default database name with `medinear`
6. Paste in `.env`

</details>

#### Frontend Configuration
Create `.env.local` in `medinear-frontend/`:

```bash
VITE_API_URL=http://localhost:5001/api
```

### 3️⃣ Start the Project

**Option A: Quick Start (Automatic)**
```bash
chmod +x start.sh
./start.sh
```

**Option B: Manual (Two Terminals)**

Terminal 1 - Backend:
```bash
npm run dev
```

Terminal 2 - Frontend:
```bash
cd medinear-frontend
npm start
```

### 4️⃣ Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api

---

## 📱 How to Use

### For Customers

1. **Visit Home Page**
   - Browse available pharmacies
   - See medicine inventory

2. **Search Medicines**
   - Enter medicine name (e.g., "Aspirin", "Ibuprofen")
   - Click "Search"
   - View results with prices and locations

3. **Filter & Sort**
   - Filter by pharmacy area
   - Filter by price range
   - Sort by price or pharmacy name

4. **Contact Pharmacy**
   - Click "📞 Call" to directly contact
   - "🛒 Order" to place an order (coming soon)

### For Pharmacies

1. **Register**
   - Click "Register Pharmacy"
   - Fill in pharmacy details
   - Create account with secure password

2. **Login**
   - Use phone number and password
   - Access dashboard

3. **Manage Inventory**
   - Click "📊 Dashboard"
   - "➕ Add Medicine" to list new items
   - ✏️ "Edit" existing medicines
   - 🗑️ "Delete" out-of-stock items
   - Check stock statistics

---

## 📁 Project Structure

```
medinear/
├── server.js                 # Backend entry point
├── package.json             # Backend dependencies
├── .env.example             # Environment variables template
├── setup.sh                 # Automated setup script
├── start.sh                 # Production launcher
├── README.md               # This file
│
├── controllers/            # Request handlers
│   ├── authController.js
│   ├── medicineController.js
│   └── pharmacyController.js
│
├── models/                # Database schemas
│   ├── Medicine.js
│   └── Pharmacy.js
│
├── middleware/            # Auth & validation
│   └── authMiddleware.js
│
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── medicineRoutes.js
│   └── pharmacyRoutes.js
│
└── medinear-frontend/   # React app
    ├── src/
    │   ├── App.jsx
    │   ├── AuthContext.jsx
    │   ├── api.js
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   └── assets/
    ├── package.json
    ├── vite.config.js
    └── index.html
```

---

## 🔌 API Endpoints

### Authentication
```bash
POST   /api/auth/register        # Register pharmacy
POST   /api/auth/login           # Login pharmacy
```

### Medicines
```bash
GET    /api/medicine/search?name=Aspirin     # Search medicines (public)
GET    /api/medicine/my-medicines             # Get pharmacy's medicines (protected)
POST   /api/medicine/add                     # Add medicine (protected)
PUT    /api/medicine/update/:id              # Update medicine (protected)
DELETE /api/medicine/delete/:id              # Delete medicine (protected)
```

### Pharmacies
```bash
GET    /api/pharmacy              # Get all pharmacies
POST   /api/pharmacy/add          # Add pharmacy
```

---

## 🔐 Authentication

- **JWT-based** token system
- Tokens stored in `localStorage`
- Auto-included in protected requests
- Token format: `Bearer <token>`
- Expiry: 7 days

---

## 🎨 UI/UX Features

- ✨ **Modern Gradient Design** - Purple to violet gradient theme
- 🎭 **Smooth Animations** - Fade-in, slide-in effects
- 📱 **Fully Responsive** - Mobile, tablet, desktop optimized
- 🎯 **Interactive Cards** - Hover effects and shadows
- 🔔 **Toast Notifications** - Success, error, and info messages
- ⌨️ **Keyboard Accessible** - Full keyboard navigation support
- 🌙 **Dark Mode Ready** - Easily extendable for dark theme

---

## ⚙️ Configuration & Deployment

### Environment Variables

```env
# Backend
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/medinear
JWT_SECRET=your-secret-key
PORT=5001
NODE_ENV=production

# Frontend
VITE_API_URL=https://api.yourdomain.com/api
```

### Production Build

```bash
# Frontend
cd medinear-frontend
npm run build
# Output in dist/

# Backend
npm install --production
NODE_ENV=production npm start
```

### Deployment Options

- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, Render, AWS
- **Database**: MongoDB Atlas (free tier available)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5001 is free
lsof -i :5001

# Check MongoDB connection
cat .env | grep MONGO_URI
```

### Frontend shows "Cannot connect to API"
```bash
# Verify backend is running
curl http://localhost:5001/

# Check VITE_API_URL in .env.local
cat medinear-frontend/.env.local
```

### Database connection errors
1. Check MongoDB URI in `.env`
2. Verify MongoDB cluster is active
3. Check IP whitelist in MongoDB Atlas

---

## 📚 Learning & Development

### Adding a New Feature

1. **Create API endpoint** in `routes/`
2. **Add controller** in `controllers/`
3. **Update frontend** in `src/pages/`
4. **Test with Postman** or `curl`

### Running Tests
```bash
# Backend tests (setup required)
npm test

# Frontend tests
cd medinear-frontend
npm test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🎯 Future Roadmap

- [ ] Online ordering & payment
- [ ] Real-time notifications
- [ ] Medicine reviews & ratings
- [ ] Prescription uploads
- [ ] Delivery tracking
- [ ] Analytics dashboard
- [ ] Mobile apps (iOS/Android)
- [ ] Multi-language support

---

## 📞 Support

For issues, questions, or suggestions:
- 📧 Email: support@medinear.com
- 🐛 GitHub Issues: [Create issue](https://github.com/yourusername/medinear/issues)
- 💬 Discord: [Join server](https://discord.gg/yourinvite)

---

## 🙏 Acknowledgments

- React & Vite communities
- Express.js documentation
- MongoDB docs and Atlas
- All contributors and users

---

**Made with ❤️ for better medicine accessibility**

© 2026 MediNear by Himansh & Team
