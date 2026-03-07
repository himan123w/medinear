
# 🏥 MediNear - Medicine Availability Platform

> **Smart medicine search platform connecting pharmacies with customers in real-time**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-v14%2B-brightgreen)

---

## ⚡ Quick Start

**Get started in 5 minutes:**

```bash
# 1. Clone and setup
cd medinear
chmod +x setup.sh
./setup.sh

# 2. Configure MongoDB
# Edit .env file with your MongoDB URI

# 3. Run
./start.sh
```

👉 **[Full Setup Guide →](./QUICK_START.md)**

---

## ✨ Features

### 🔍 For Customers
- Real-time medicine search across pharmacies
- Price and location filters
- Direct pharmacy contact
- Medicine availability status
- Interactive search results

### 💊 For Pharmacies
- Pharmacy registration & secure login
- Manage medicine inventory (add/edit/delete)
- Track stock status
- Dashboard analytics
- View customer searches

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT, BCrypt |
| **API** | RESTful, CORS |

---

## 📂 Project Structure

```
medinear/
├── 📄 QUICK_START.md          ← Start here!
├── 📄 COMPLETE_SETUP.md       ← Full documentation
├── 📄 setup.sh                ← Automated setup
├── 📄 start.sh                ← Production launcher
├── server.js                  ← Backend entry
├── controllers/               ← API logic
├── models/                    ← Database schemas
├── routes/                    ← API endpoints
└── medinear-frontend/         ← React app
    ├── src/pages/             ← React pages
    └── public/                ← Static files
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v14+ ([Download](https://nodejs.org/))
- MongoDB Atlas account ([Free tier](https://www.mongodb.com/cloud/atlas))

### Installation

**1. Clone this repository**
```bash
cd medinear
```

**2. Run setup script**
```bash
chmod +x setup.sh
./setup.sh
```

**3. Configure environment**

Create `.env` in project root:
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/medinear
JWT_SECRET=your-secret-key
PORT=5001
NODE_ENV=development
```

**4. Start development servers**
```bash
./start.sh
```

Or manually in separate terminals:
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend  
cd medinear-frontend
npm start
```

### Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api

---

## 📱 Usage

### Register as Pharmacy
1. Click "Register Pharmacy"
2. Fill pharmacy details
3. Verify phone number
4. Access pharmacy dashboard

### Manage Medicines
1. Login to dashboard
2. Click "Add Medicine"
3. Fill medicine details
4. Save and view in inventory

### Search Medicines (Customer)
1. Go to home page
2. Enter medicine name
3. View results with prices & locations
4. Call pharmacy or order

---

## 🔌 API Endpoints

```bash
# Auth
POST   /api/auth/register        # Register pharmacy
POST   /api/auth/login           # Login

# Medicines
GET    /api/medicine/search      # Search medicines
GET    /api/medicine/my-medicines # Get my medicines (protected)
POST   /api/medicine/add         # Add medicine (protected)
PUT    /api/medicine/update/:id  # Update (protected)
DELETE /api/medicine/delete/:id  # Delete (protected)

# Pharmacies
GET    /api/pharmacy             # Get all pharmacies
POST   /api/pharmacy/add         # Add pharmacy
```

---

## 🎨 UI Features

- ✨ Modern gradient design
- 🎭 Smooth animations
- 📱 Fully responsive
- 🔔 Toast notifications
- ⚡ Fast load times
- 🎯 Intuitive UX

---

## 🧪 Testing

### Test API Endpoints
```bash
# Test backend
curl http://localhost:5001/

# Search medicines
curl "http://localhost:5001/api/medicine/search?name=Aspirin"
```

### Frontend Testing
```bash
cd medinear-frontend
npm test
```

---

## 📚 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - 5-minute setup
- **[Complete Setup](./COMPLETE_SETUP.md)** - Detailed documentation
- **[API Documentation](#api-endpoints)** - All endpoints above
- **[Frontend Setup](./medinear-frontend/FRONTEND_SETUP.md)** - React specific

---

## 🚢 Deployment

### Frontend
```bash
cd medinear-frontend
npm run build
# Deploy dist/ to Vercel, Netlify, etc.
```

### Backend
```bash
npm install --production
NODE_ENV=production npm start
# Deploy to Heroku, Railway, Render, AWS
```

**Deploy platforms:**
- Frontend: Vercel, Netlify, GitHub Pages
- Backend: Heroku, Railway, Render
- Database: MongoDB Atlas

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5001 in use | `lsof -i :5001` then `kill -9 <PID>` |
| MongoDB connection fails | Check `.env` URI and cluster status |
| Frontend can't connect | Verify backend running on localhost:5001 |
| Dependencies error | `rm -rf node_modules && npm install` |

**More help:** See [COMPLETE_SETUP.md](./COMPLETE_SETUP.md#troubleshooting)

---

## 🗺 Roadmap

- [x] Core platform
- [x] Pharmacy dashboard
- [x] Medicine search
- [ ] Online payments
- [ ] Real-time notifications
- [ ] Mobile apps
- [ ] Order tracking
- [ ] Advanced analytics

---

## 🤝 Contributing

Contributions welcome! 

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 📞 Support & Contact

- 📖 [Read Documentation](./COMPLETE_SETUP.md)
- 🐛 [Report Issues](https://github.com/yourusername/medinear/issues)
- 💬 [Join Community](https://discord.gg/yourinvite)
- 📧 Email: support@medinear.com

---

## 🙏 Acknowledgments

- React & Vite communities
- Express.js framework
- MongoDB database
- All open-source contributors

---

**Built with ❤️ for better medicine accessibility**

© 2026 MediNear Platform

[⬆ Back to top](#medinear---medicine-availability-platform)
