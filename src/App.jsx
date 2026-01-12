import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, BrowserRouter, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import { ThemeProvider } from './components/Theme/ThemeProvider';

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

// Employee Forms
import StateTaxPage from './components/Layout/StateTaxPage';
import I9Form from './components/Onboarding/StateForms/I9Form';
import FederalTaxForm from './components/Onboarding/Federal/FederalTaxForm';
import PersonalDetailsPage from './components/Onboarding/PersonalDetailsPage';
import EmergencyContactPage from './components/Onboarding/EmergencyContactPage';
import DirectDepositPage from './components/Onboarding/DirectDepositPage';

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
  const location = useLocation();

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSidebar = () => toggleMobileMenu();

  // ✅ CONFIGURATION:
  // Defined routes where the Navbar/Sidebar should be HIDDEN.
  // We do NOT include "/" here, so the Dashboard is visible on Home.
  const hideLayoutRoutes = [
    "/login", 
    "/signup", 
    "/landing",
    
    // Employee Onboarding Flow
    "/personal-details", 
    "/emergency-contact", 
    "/federal", 
    "/state", 
    "/i9", 
    "/direct-deposit",
    
    // Company Intake Flow
    "/company-register",
    "/add-company-contacts",
    "/set-company-type",
    "/workflow-steps",
    "/company-documents",
    "/client-documents",
    "/digital-signature",
    "/branding",
    "/hosting",
    "/payment"
  ];

  // Check if current path matches exact route or is a sub-route
  const hideLayout = hideLayoutRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith(route + "/")
  );

  return (
    <div className="min-h-screen">
      <ScrollToTop />

      {/* === HR DASHBOARD LAYOUT === */}
      {/* This renders on "/" (Home) but hides on /login, /workflow-steps, etc. */}
      {!hideLayout && (
        <>
          <Navbar isSidebarOpen={isMobileMenuOpen} toggleSidebar={toggleSidebar} />
          <div className="hidden md:block">
            <Sidebar isOpen={false} onToggle={toggleMobileMenu} />
          </div>
          <div className="md:hidden">
            <Sidebar isOpen={isMobileMenuOpen} onToggle={toggleMobileMenu} />
          </div>
        </>
      )}

      {/* === MAIN CONTENT === */}
      {/* Adds padding only if the Layout is visible */}
      <main className={`min-h-screen ${hideLayout ? "" : "pt-16 md:pt-20 pb-16 md:pb-0"}`}>
        <Routes>
          
          {/* 1. PUBLIC ROUTES */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* 2. PROTECTED HR ROUTES (Navbar VISIBLE) */}
          <Route element={<ProtectedRoute />}>
              {/* Home is here, so it gets the Navbar */}
              <Route path="/" element={<Home />} /> 
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/client" element={<Client />} />
              <Route path="/employee" element={<Employee />} />
              <Route path="/subcontractor" element={<Subcontractor />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/admin" element={<Admin />} />
          </Route>

          {/* 3. PROTECTED EMPLOYEE ROUTES (Navbar HIDDEN) */}
          <Route element={<OnboardingLayout />}>
              <Route path="/personal-details" element={<PersonalDetailsPage />} />
              <Route path="/emergency-contact" element={<EmergencyContactPage />} />
              <Route path="/federal" element={<FederalTaxForm />} />
              <Route path="/state" element={<StateTaxPage />} />
              <Route path="/i9" element={<I9Form />} />
              <Route path="/direct-deposit" element={<DirectDepositPage />} />
          </Route>

          {/* 4. COMPANY INTAKE ROUTES (Navbar HIDDEN) */}
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
          <Route path="/profile" element={<Profile />} />

          <Route path="/onboarding-start" element={<Navigate to="/personal-details" replace />} />

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