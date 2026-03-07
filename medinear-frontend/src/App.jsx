import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider } from './ToastContext';
import { ThemeProvider } from './ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import PharmacyRatingsPage from './pages/PharmacyRatingsPage';
import SaaSDashboard from './pages/SaaSDashboard';
import SaasBillingPlans from './pages/SaasBillingPlans';
import AIDemandInsights from './pages/AIDemandInsights';
import Dashboard from './pages/Dashboard';
import PrescriptionUpload from './pages/PrescriptionUpload';
import PrescriptionList from './pages/PrescriptionList';
import PrescriptionDetail from './pages/PrescriptionDetail';
import PrescriptionResponse from './pages/PrescriptionResponse';
import Emergency from './pages/Emergency';
import ComparePrice from './pages/ComparePrice';
import MedicineReminders from './pages/MedicineReminders';
import Delivery from './pages/Delivery';
import Subscription from './pages/Subscription';
import SubscriptionList from './pages/SubscriptionList';
import Reservations from './pages/Reservations';
import AreaHeatmap from './components/AreaHeatmap';
import InstallPrompt from './components/InstallPrompt';
import TopNavBar from './components/TopNavBar';
import BottomNavigation from './components/BottomNavigation';
import ToastContainer from './components/ToastContainer';
import './App.css';
import './theme.css';

// Debug component
function DebugTest() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', background: '#fff' }}>
      <h1 style={{ color: '#333' }}>✅ App is Loading!</h1>
      <p style={{ color: '#666' }}>If you see this, React is working.</p>
      <p style={{ color: '#667eea' }}>Redirecting to Home in 2 seconds...</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  return token ? children : <Navigate to="/login" />;
}

function ProtectedAdminRoute({ children }) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  if (!token || user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
}

function ProtectedPharmacyRoute({ children }) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  if (!token || user?.role !== 'pharmacy') {
    return <Navigate to="/" />;
  }

  return children;
}

function AppRoutes() {
  return (
    <>
      <TopNavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/pharmacy"
          element={
            <ProtectedPharmacyRoute>
              <PharmacyDashboard />
            </ProtectedPharmacyRoute>
          }
        />
        <Route
          path="/pharmacy/:id"
          element={
            <ProtectedRoute>
              <PharmacyRatingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-prescription"
          element={
            <ProtectedRoute>
              <PrescriptionUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute>
              <PrescriptionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription/:id"
          element={
            <ProtectedRoute>
              <PrescriptionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/prescriptions"
          element={
            <ProtectedRoute>
              <PrescriptionResponse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency"
          element={
            <ProtectedRoute>
              <Emergency />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare-price"
          element={
            <ProtectedRoute>
              <ComparePrice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicine-reminders"
          element={
            <ProtectedRoute>
              <MedicineReminders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery"
          element={
            <ProtectedRoute>
              <Delivery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <SubscriptionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <Reservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saas/dashboard/:pharmacyId"
          element={
            <ProtectedRoute>
              <SaaSDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saas/plans/:pharmacyId"
          element={
            <ProtectedRoute>
              <SaasBillingPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/insights"
          element={
            <ProtectedRoute>
              <AIDemandInsights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/heatmap"
          element={
            <ProtectedRoute>
              <AreaHeatmap />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNavigation />
    </>
  );
}

function App() {
  try {
    return (
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <AuthProvider>
              <InstallPrompt />
              <AppRoutes />
              <ToastContainer />
            </AuthProvider>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    );
  } catch (err) {
    console.error('App Error:', err);
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: '#fff' }}>
        <h1 style={{ color: '#c33' }}>⚠️ App Error!</h1>
        <p style={{ color: '#666' }}>{err?.message}</p>
        <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
          {err?.stack}
        </pre>
      </div>
    );
  }
}

export default App;
