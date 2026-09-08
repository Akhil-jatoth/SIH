import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CyberBackground } from './components/CyberBackground';
import { OfficialHeaderBar } from './components/OfficialHeaderBar';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { GraphExplorer } from './pages/GraphExplorer';
import { TimelineGIS } from './pages/TimelineGIS';
import { AIAssistant } from './pages/AIAssistant';
import { CasesList } from './pages/CasesList';
import { CaseDetail } from './pages/CaseDetail';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 relative">
      <CyberBackground />
      <OfficialHeaderBar />
      <Navbar />

      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 gap-6">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/graph"
            element={
              <ProtectedLayout>
                <GraphExplorer />
              </ProtectedLayout>
            }
          />
          <Route
            path="/timeline-gis"
            element={
              <ProtectedLayout>
                <TimelineGIS />
              </ProtectedLayout>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedLayout>
                <AIAssistant />
              </ProtectedLayout>
            }
          />
          <Route
            path="/cases"
            element={
              <ProtectedLayout>
                <CasesList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/cases/:id"
            element={
              <ProtectedLayout>
                <CaseDetail />
              </ProtectedLayout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
