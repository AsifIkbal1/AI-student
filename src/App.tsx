import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import { LanguageProvider } from "./components/LanguageContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { AITutor } from "./components/AITutor";
import { NeuroTest } from "./components/NeuroTest/NeuroTest";
import { LandingPage } from "./components/LandingPage";
import { Loader2, Settings } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

import { AINoteMaker } from "./components/AINoteMaker";
import { AIQuiz } from "./components/AIQuiz";
import { DigitalNotes } from "./components/DigitalNotes";
import { CortexStudio } from "./components/CortexStudio/CortexStudio";
import { AdminDashboard } from "./components/AdminDashboard";

import { AIEssayWriter } from "./components/AIEssayWriter";
import { AIStudyPlanner } from "./components/AIStudyPlanner";
import { Subscription } from "./components/Subscription";

import { AIDoubtSolver } from "./components/AIDoubtSolver";
import { AIVideoSummarizer } from "./components/AIVideoSummarizer";
import { AICodeHelper } from "./components/AICodeHelper";

import { AIFlashcards } from "./components/AIFlashcards";

import { StudyPlannerTracker } from "./components/StudyPlannerTracker";

import { AISlideGenerator } from "./components/AISlideGenerator";
import { ChatWithPDF } from "./components/ChatWithPDF";
import { SmartStudyMode } from "./components/SmartStudyMode";
import { CareerRoadmapGenerator } from "./components/CareerRoadmapGenerator";
import { ZenPathAI } from "./components/ZenPathAI";
import { AIDiagramGenerator } from "./components/AIDiagramGenerator";
import { SmartResources } from "./components/SmartResources";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AccessPage } from "./components/AccessPage";
import { PolicyPage } from "./components/PolicyPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { SupportPage } from "./components/SupportPage";
import { ReferralPage } from "./components/ReferralPage";


const ProtectedRoute: React.FC<{ children: React.ReactNode, requireAccess?: boolean }> = ({ children, requireAccess = true }) => {
  const { user, profile, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className={cn(
        "h-screen flex items-center justify-center",
        theme === 'dark' ? "bg-gray-900" : "bg-white"
      )}>
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (requireAccess && profile) {
    const hasAccess = profile.role === "admin" || profile.isApproved || (profile.subscription?.plan !== "free" && profile.subscription?.active);
    if (!hasAccess) {
      return <Navigate to="/access" />;
    }
  }

  return <Layout>{children}</Layout>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className={cn(
        "h-screen flex items-center justify-center",
        theme === 'dark' ? "bg-gray-900" : "bg-white"
      )}>
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return <Layout>{children}</Layout>;
};

const MaintenanceWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setMaintenanceMode(data.maintenance_mode === 'true');
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  if (checking || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (maintenanceMode && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-gray-800 p-10 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-700">
          <div className="w-20 h-20 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="text-blue-500 animate-spin-slow" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Under Maintenance</h1>
          <p className="text-gray-400 mb-8">
            We are currently upgrading the platform to bring you new features. 
            Please check back in a few minutes.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <MaintenanceWrapper>
              <Router>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<HomeRoute />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/neurotest-ai" element={<ProtectedRoute requireAccess={false}><NeuroTest /></ProtectedRoute>} />
                <Route path="/digital-notes" element={<ProtectedRoute><DigitalNotes /></ProtectedRoute>} />
                <Route path="/cortex-studio" element={<ProtectedRoute><CortexStudio /></ProtectedRoute>} />
                <Route path="/zenpath" element={<ProtectedRoute><ZenPathAI /></ProtectedRoute>} />
                <Route path="/tutor" element={<ProtectedRoute><AITutor /></ProtectedRoute>} />
                {/* Placeholder routes for other features */}
                <Route path="/notes" element={<ProtectedRoute><AINoteMaker /></ProtectedRoute>} />
                <Route path="/quiz" element={<ProtectedRoute><AIQuiz /></ProtectedRoute>} />
                <Route path="/essay" element={<ProtectedRoute><AIEssayWriter /></ProtectedRoute>} />
                <Route path="/flashcards" element={<ProtectedRoute><AIFlashcards /></ProtectedRoute>} />
                <Route path="/planner" element={<ProtectedRoute><AIStudyPlanner /></ProtectedRoute>} />
                <Route path="/doubt-solver" element={<ProtectedRoute><AIDoubtSolver /></ProtectedRoute>} />
                <Route path="/video-summarizer" element={<ProtectedRoute><AIVideoSummarizer /></ProtectedRoute>} />
                <Route path="/code-helper" element={<ProtectedRoute><AICodeHelper /></ProtectedRoute>} />
                <Route path="/slides" element={<ProtectedRoute><AISlideGenerator /></ProtectedRoute>} />
                <Route path="/chat-pdf" element={<ProtectedRoute><ChatWithPDF /></ProtectedRoute>} />
                <Route path="/smart-study" element={<ProtectedRoute><SmartStudyMode /></ProtectedRoute>} />
                <Route path="/career-roadmap" element={<ProtectedRoute><CareerRoadmapGenerator /></ProtectedRoute>} />
                <Route path="/tracker" element={<ProtectedRoute><StudyPlannerTracker /></ProtectedRoute>} />
                <Route path="/diagrams" element={<ProtectedRoute><AIDiagramGenerator /></ProtectedRoute>} />
                <Route path="/smart-resources" element={<ProtectedRoute><SmartResources /></ProtectedRoute>} />
                <Route path="/subscription" element={<ProtectedRoute requireAccess={false}><Subscription /></ProtectedRoute>} />
                <Route path="/access" element={<ProtectedRoute requireAccess={false}><AccessPage /></ProtectedRoute>} />
                <Route path="/checkout/:planId/:interval" element={<ProtectedRoute requireAccess={false}><CheckoutPage /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute requireAccess={false}><SupportPage /></ProtectedRoute>} />
                <Route path="/referrals" element={<ProtectedRoute requireAccess={false}><ReferralPage /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/policy/:type" element={<PolicyPage />} />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
            </MaintenanceWrapper>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : <LandingPage />;
};

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
    <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
    <p className="text-gray-500">This feature is coming soon! Stay tuned.</p>
    <div className="bg-blue-50 p-12 rounded-3xl border-2 border-dashed border-blue-200">
      <Sparkles className="text-blue-600 mx-auto mb-4" size={48} />
      <p className="text-blue-600 font-semibold">AI Powering Up...</p>
    </div>
  </div>
);

import { Sparkles } from "lucide-react";
import { cn } from "./lib/utils";

export default App;
