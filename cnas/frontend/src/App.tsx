import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CyberBackground } from './components/CyberBackground';
import { OfficialHeaderBar } from './components/OfficialHeaderBar';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { ScrollToTop } from './components/ScrollToTop';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { GraphExplorer } from './pages/GraphExplorer';
import { TimelineGIS } from './pages/TimelineGIS';
import { AIAssistant } from './pages/AIAssistant';
import { CasesList } from './pages/CasesList';
import { CaseDetail } from './pages/CaseDetail';

import { MobileBottomNav } from './components/MobileBottomNav';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 relative">
      <CyberBackground />
      {/* Permanently Fixed Top Header Container */}
      <div className="fixed top-0 left-0 right-0 z-40 w-full flex flex-col bg-slate-950/95 backdrop-blur-2xl shadow-2xl">
        <OfficialHeaderBar />
        <Navbar />
      </div>

      <div className="flex-1 flex w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-[136px] relative gap-6">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-w-0 pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
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
