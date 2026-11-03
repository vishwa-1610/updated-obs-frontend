// src/config/features.js

/**
 * Feature Flags Configuration
 * Set any feature to 'true' to re-enable it across the UI, Sidebar, Navbar, and Routes.
 */
export const FEATURES = {
  TASKS: false,                    // Tasks & Projects module
  ATTENDANCE: false,               // Attendance & PTO tracker
  FORM_RULES: false,               // Form Rules & PDF Mapper (RuleEngine)
  E_VERIFY: false,                 // USCIS E-Verify & automated background screening
  BENEFIT_PLANS: false,            // Corporate Benefit Plans Catalog
  COMPANY_POLICIES: false,         // Policies & Handbooks digital signatures
  EXPIRATION_RADAR: false,         // Document Expiration Tracker
  SUBCONTRACTOR_PLACEMENTS: false, // Subcontractor 1099 Placements
  SUBCONTRACTOR_INVOICES: false,   // Subcontractor Invoices & Remittances
  SUBCONTRACTOR_W9: false,         // Subcontractor Form W-9 Tax Suite
  PAYROLL_EXPORT: false,           // 1-Click Payroll CSV Export
};
