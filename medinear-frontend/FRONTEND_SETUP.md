# MediNear Frontend

A modern React frontend for the MediNear medicine availability platform. Users can search for medicines across pharmacies, and pharmacy owners can manage their inventory.

## Features

- 🔐 **Authentication**: Secure pharmacy login and registration
- 🔍 **Medicine Search**: Search available medicines across pharmacies
- 💊 **Pharmacy Dashboard**: Manage medicine inventory
- 📊 **Real-time Updates**: View pharmacies and medicine availability
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **JavaScript (ES6+)** - Language

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
VITE_API_URL=http://localhost:5000/api
```

### Development Server

Run the development server:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── pages/                    # Page components
│   ├── Home.jsx             # Landing page with search
│   ├── Login.jsx            # Pharmacy login
│   ├── Register.jsx         # Pharmacy registration
│   ├── Dashboard.jsx        # Pharmacy inventory management
│   └── *.css                # Page-specific styles
├── api.js                   # API client configuration
├── AuthContext.jsx          # Authentication state management
├── App.jsx                  # Main app component with routing
├── App.css                  # Global styles
└── main.jsx                 # Entry point
```

## Available Routes

- `/` - Home page (search medicines and view pharmacies)
- `/login` - Pharmacy login
- `/register` - Pharmacy registration
- `/dashboard` - Pharmacy dashboard (protected route)

## Environment Variables

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:5000/api
```

## Usage

### For Users (Customers)

1. Go to the home page
2. Search for medicines by name
3. View available medicines and pharmacy details
4. Click on a pharmacy's phone number to contact them

### For Pharmacies

1. Register a new pharmacy account on the `/register` page
2. Login with your phone and password on the `/login` page
3. Go to Dashboard to:
   - Add new medicines
   - Update existing medicine details
   - Delete medicines
   - View all your medicines and their availability status

## API Integration

The frontend connects to the following backend endpoints:

- `POST /api/auth/register` - Register pharmacy
- `POST /api/auth/login` - Login pharmacy
- `GET /api/medicine/search?name=<name>` - Search medicines
- `POST /api/medicine/add` - Add medicine (protected)
- `GET /api/medicine/my-medicines` - Get pharmacy's medicines (protected)
- `PUT /api/medicine/:id` - Update medicine (protected)
- `DELETE /api/medicine/:id` - Delete medicine (protected)
- `GET /api/pharmacy` - Get all pharmacies

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Error Handling

The app includes comprehensive error handling:
- API errors are caught and displayed to users
- Authentication errors redirect to login
- Form validation on client-side
- Protected routes for authenticated users only

## Security Features

- JWT token-based authentication
- Tokens stored in localStorage
- Authorization headers added to all API requests
- Protected routes that require authentication
- Password hashing on backend

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run `npm run lint` to check code quality
4. Commit and push your changes
5. Create a pull request

## License

This project is part of the MediNear platform.
