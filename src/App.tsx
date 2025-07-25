import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/common/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Devices } from './pages/Devices';
import { DeviceTypes } from './pages/DeviceTypes';
import { Assignments } from './pages/Assignments';
import { Reports } from './pages/Reports';
import { ActivityLogs } from './pages/ActivityLogs';
import { DeviceMovements } from './pages/DeviceMovements';
import { CostCenter } from './pages/CostCenter';
import { Areas } from './pages/Areas';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
          } 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/devices"
          element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <Devices />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/device-types"
          element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <DeviceTypes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <Assignments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-logs"
          element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <ActivityLogs />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/device-movements"
          element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <DeviceMovements />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cost-center"
          element={
            <ProtectedRoute>
              <Layout>
                <CostCenter />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/areas"
          element={
            <ProtectedRoute>
              <Layout>
                <Areas />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;