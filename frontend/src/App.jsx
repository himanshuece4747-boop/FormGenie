import React, { useContext } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import FormBuilder from './pages/FormBuilder';
import ManualFormBuilder from './pages/ManualFormBuilder';
import FormView from './pages/FormView';
import ResponsesView from './pages/ResponsesView';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const LegacyFormRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/view/${id}`} />;
};

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== 'Admin') {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
      <div className="min-h-screen bg-mesh font-sans">
        <Toaster position="top-right" toastOptions={{ className: 'glass-panel text-sm font-medium' }} />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Public Form Taking Route */}
          <Route path="/view/:id" element={<FormView />} />
          {/* Backwards compatibility resolving the literal string params bug */}
          <Route path="/form/:id" element={<LegacyFormRedirect />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute requireAdmin={true}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/builder" 
            element={
              <PrivateRoute requireAdmin={true}>
                <FormBuilder />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/manual-builder" 
            element={
              <PrivateRoute requireAdmin={true}>
                <ManualFormBuilder />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/responses/:id" 
            element={
              <PrivateRoute requireAdmin={true}>
                <ResponsesView />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
  );
}

export default App;
