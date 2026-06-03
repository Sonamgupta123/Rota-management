import React from 'react';
import { useApp } from '../context/AppContext';

// Import Layout/Views from Role Modules
import AdminDashboard from '../modules/admin/AdminDashboard';
import HRDashboard from '../modules/hr/HRDashboard';
import VisitorTablet from '../modules/receptionist/VisitorTablet';
import EmployeeDashboard from '../modules/employee/EmployeeDashboard';
import VerificationAuditLog from '../modules/admin/VerificationAuditLog';
import DocumentVerification from '../modules/manager/DocumentVerification';
import MyDocuments from '../modules/employee/MyDocuments';
import AccessDenied from '../modules/shared/AccessDenied';

// Import Views from Shared Modules
import Settings from '../modules/shared/Settings';
import Employees from '../modules/shared/Employees';
import Documents from '../modules/shared/Documents';
import RotaCalendar from '../modules/shared/RotaCalendar';
import RotaManagement from '../modules/shared/RotaManagement';
import DayNotes from '../modules/shared/DayNotes';
import Attendance from '../modules/shared/Attendance';
import Leave from '../modules/shared/Leave';
import Payroll from '../modules/shared/Payroll';
import Reports from '../modules/shared/Reports';
import ObservationManagement from '../modules/shared/ObservationManagement';
import CompetencyManagement from '../modules/shared/CompetencyManagement';

// Import Audits Module
import AuditDashboard from '../modules/audits/AuditDashboard';

export const AppRouter = () => {
  const { currentRole, currentView } = useApp();

  const renderDashboardView = () => {
    switch (currentRole) {
      case 'HR':
        return <HRDashboard />;
      case 'Compliance Officer':
        return <AuditDashboard />;
      case 'Receptionist':
        return <VisitorTablet />;
      case 'Employee':
        return <EmployeeDashboard />;
      case 'Manager':
      case 'Admin':
      default:
        return <AdminDashboard />;
    }
  };

  switch (currentView) {
    case 'dashboard':
      return renderDashboardView();
    case 'employees':
      return <Employees />;
    case 'my-documents':
      return currentRole === 'Employee' ? <MyDocuments /> : <AccessDenied />;
    case 'document-verification':
      return currentRole === 'Manager' ? <DocumentVerification /> : <AccessDenied />;
    case 'verification-audit-log':
      return currentRole === 'Admin' ? <VerificationAuditLog /> : <AccessDenied />;
    case 'documents':
      return <Documents />;
    case 'rota':
      return <RotaCalendar />;
    case 'shift-planning':
      return <RotaManagement />;
    case 'day-notes':
      return <DayNotes />;
    case 'attendance':
      return <Attendance />;
    case 'leave':
      return <Leave />;
    case 'payroll':
      return <Payroll />;
    case 'visitor-tablet':
      return <VisitorTablet />;
    case 'audits':
      return <AuditDashboard />;
    case 'employee-dashboard':
      return <EmployeeDashboard />;
    case 'settings':
      return <Settings />;
    case 'reports':
      return <Reports />;
    case 'observation':
      return <ObservationManagement />;
    case 'competency':
      return <CompetencyManagement />;
    default:
      return renderDashboardView();
  }
};
