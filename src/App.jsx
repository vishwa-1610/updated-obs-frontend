import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, BrowserRouter, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import { ThemeProvider, useTheme } from './components/Theme/ThemeProvider';

// Guards
import ProtectedRoute from './components/Auth/ProtectedRoute';
import OnboardingLayout from './components/Layout/OnboardingLayout';

// Pages
import Home from './components/Layout/Home';
import Onboarding from './components/Layout/Onboarding';
import Client from './components/Layout/Client';
import Employee from './components/Layout/Employee';
import Subcontractor from './components/Layout/Subcontractor';
import Templates from './components/Layout/Templates';
import Admin from './components/Layout/Admin';
import AttendanceDashboard from './components/attendance/AttendanceDashboard';

// Employee Forms
import StateTaxPage from './components/Layout/StateTaxPage';
import I9Form from './components/Onboarding/StateForms/I9Form';
import FederalTaxForm from './components/Onboarding/Federal/FederalTaxForm';
import PersonalDetailsPage from './components/Onboarding/PersonalDetailsPage';
import EmergencyContactPage from './components/Onboarding/EmergencyContactPage';
import DirectDepositPage from './components/Onboarding/DirectDepositPage';
import OnboardingCompletePage from './components/Onboarding/OnboardingCompletePage';

// Auth
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import LandingPage from './components/Layout/LandingPage';
import CompanyRegister from './components/companyIntake/CompanyRegister';
import CompanyContacts from './components/companyIntake/CompanyContacts';
import CompanyType from './components/companyIntake/CompanyType';
import WorkflowSteps from './components/companyIntake/WorkflowSteps';
import CompanyDocuments from './components/companyIntake/CompanyDocuments';
import ClientDocument from './components/companyIntake/ClientDocument';
import DigitalSignature from './components/companyIntake/DigitalSignature';
import CompanyBranding from './components/companyIntake/CompanyBranding';
import CompanyHosting from './components/companyIntake/CompanyHosting';
import CompanyPayment from './components/companyIntake/CompnayPayment';

import Profile from './components/Layout/Profile';
import Reports from './components/Layout/Report';
import RuleEngine from './components/Layout/RuleEngine';
import Jobs from './components/Layout/Jobs';
import Documents from './components/Layout/Documents';
import TaskDashboard from './components/tasks/TaskDashboard';
import { OnboardingProvider } from './context/OnboardingContext';

// --- ScrollToTop Component ---
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  const location = useLocation();
  const { isDarkMode } = useTheme();

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSidebar = () => toggleMobileMenu();

  const hideLayoutRoutes = [
    "/login", "/signup", "/landing",
    "/personal-details", "/emergency-contact", "/federal", 
    "/state", "/i9", "/direct-deposit", "/onboarding-completed",
    "/company-register", "/add-company-contacts", "/set-company-type",
    "/workflow-steps", "/company-documents", "/client-documents",
    "/digital-signature", "/branding", "/hosting", "/payment"
  ];

  const hideLayout = hideLayoutRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith(route + "/")
  );

  return (
    <div className={`min-h-screen antialiased transition-colors duration-150 font-sans ${
      isDarkMode ? 'bg-[#09090b] text-[#f4f4f5]' : 'bg-[#f8fafc] text-[#0f172a]'
    }`}>
      <ScrollToTop />

      {!hideLayout && (
        <>
          <Navbar isSidebarOpen={isMobileMenuOpen} toggleSidebar={toggleSidebar} />
          
          <div className="hidden md:block">
            <Sidebar 
              isOpen={false} 
              onToggle={toggleMobileMenu} 
              isExpanded={isSidebarExpanded}
              onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
            />
          </div>
          
          <div className="md:hidden">
            <Sidebar isOpen={isMobileMenuOpen} onToggle={toggleMobileMenu} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className={`min-h-[calc(100vh-4rem)] transition-all duration-200 ease-in-out ${
        hideLayout 
          ? "" 
          : `pb-16 md:pb-8 ${isSidebarExpanded ? 'md:ml-60' : 'md:ml-18'}`
      }`}>
        <Routes>
          {/* 1. PUBLIC ROUTES */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* 2. PROTECTED HR ROUTES (With Navbar & Sidebar) */}
          <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} /> 
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/tasks/*" element={<TaskDashboard />} />
              <Route path="/client" element={<Client />} />
              <Route path="/employee" element={<Employee />} />
              <Route path="/subcontractor" element={<Subcontractor />} />
              <Route path="/attendance" element={<AttendanceDashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/rules" element={<RuleEngine />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/careers" element={<Jobs />} />
              <Route path="/rule-engine" element={<RuleEngine />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 3. PROTECTED EMPLOYEE ONBOARDING ROUTES */}
          <Route element={
            <OnboardingProvider>
              <OnboardingLayout />
            </OnboardingProvider>
          }>
              <Route path="/personal-details" element={<PersonalDetailsPage />} />
              <Route path="/emergency-contact" element={<EmergencyContactPage />} />
              <Route path="/federal" element={<FederalTaxForm />} />
              <Route path="/state" element={<StateTaxPage />} />
              <Route path="/i9" element={<I9Form />} />
              <Route path="/direct-deposit" element={<DirectDepositPage />} />
              <Route path="/onboarding-completed" element={<OnboardingCompletePage />} />
          </Route>

          {/* 4. COMPANY INTAKE WIZARD */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/company-register" element={<CompanyRegister />} />
          <Route path="/add-company-contacts" element={<CompanyContacts />} />
          <Route path="/set-company-type" element={<CompanyType />} />
          <Route path="/workflow-steps" element={<WorkflowSteps />} />
          <Route path="/company-documents" element={<CompanyDocuments />} />
          <Route path="/client-documents" element={<ClientDocument />} />
          <Route path="/digital-signature" element={<DigitalSignature />} />
          <Route path="/branding" element={<CompanyBranding />} />
          <Route path="/hosting" element={<CompanyHosting />} />
          <Route path="/payment" element={<CompanyPayment />} />

          <Route path="/onboarding-start" element={<Navigate to="/personal-details" replace />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
