import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ClaimAnalyzer from './pages/ClaimAnalyzer';
import DashboardLayout from './layouts/DashboardLayout';
import { useAuth } from './hooks/useAuth';

import MyReports from './pages/MyReports';
import UploadReports from './pages/UploadReports';
import EmergencyProfile from './pages/EmergencyProfile';
import ProblemHub from './pages/innovation/ProblemHub';
import IdeaGenerator from './pages/innovation/IdeaGenerator';
import CollaborationThreads from './pages/innovation/CollaborationThreads';
import DataSandbox from './pages/innovation/DataSandbox';
import Settings from './pages/Settings';
import DiseaseHub from './pages/DiseaseHub';
import DoctorDashboard from './pages/DoctorDashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/upload" element={
        <ProtectedRoute>
          <DashboardLayout>
            <UploadReports />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MyReports />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/claims" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ClaimAnalyzer />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/disease-hub" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DiseaseHub />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <EmergencyProfile />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Innovation Lab */}
      <Route path="/innovation/problems" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProblemHub />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/innovation/ideas" element={
        <ProtectedRoute>
          <DashboardLayout>
            <IdeaGenerator />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/innovation/threads" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CollaborationThreads />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/innovation/sandbox" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DataSandbox />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/doctor" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DoctorDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
