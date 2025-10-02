import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useUserAuth } from './hooks/useUserAuth';
import Home from './pages/Dashboard/Home';
import Expense from './pages/Dashboard/Expense';
import Income from './pages/Dashboard/Income';
import Analytics from './pages/Dashboard/Analytics';
import Profile from './pages/Profile/Profile';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/Signup';
import ProtectedRoute from './components/ProtectedRoute';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/income" element={<Income />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>

        {/* Catch all other routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

const Root = () => {
  const { user, loading } = useUserAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is logged in, redirect to dashboard or intended page
  if (user) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // If not logged in, redirect to login
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default App;