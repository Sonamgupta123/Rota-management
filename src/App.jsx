import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './layouts/shared/Sidebar';
import Header from './layouts/shared/Header';
import { AppRouter } from './routes';
import Login from './modules/shared/Login';

const getRoleSlug = (role) => {
  if (!role) return 'admin';
  const r = role.toLowerCase();
  if (r.includes('compliance')) return 'compliance';
  return r;
};

const getRoleFromSlug = (slug) => {
  switch (slug) {
    case 'admin': return 'Admin';
    case 'hr': return 'HR';
    case 'compliance': return 'Compliance Officer';
    case 'manager': return 'Manager';
    case 'receptionist': return 'Receptionist';
    case 'employee': return 'Employee';
    default: return null;
  }
};

const getRouteInfoFromPath = (path, isLoggedIn, currentRole) => {
  const cleanPath = path.replace(/^\//, ''); // Remove leading slash
  if (!isLoggedIn) {
    return { view: 'login', role: currentRole };
  }
  
  if (cleanPath === 'login') {
    return { view: 'login', role: currentRole };
  }
  
  const parts = cleanPath.split('/');
  if (parts.length === 2) {
    const role = getRoleFromSlug(parts[0]);
    let view = parts[1];
    
    if (role) {
      if (role === 'Employee' && view === 'dashboard') {
        view = 'employee-dashboard';
      } else if (role === 'Receptionist' && view === 'dashboard') {
        view = 'visitor-tablet';
      }
      return { view, role };
    }
  }
  
  // Fallbacks for backward compatibility
  switch (cleanPath) {
    case 'admin-dashboard':
      return { view: 'dashboard', role: 'Admin' };
    case 'hr-dashboard':
      return { view: 'dashboard', role: 'HR' };
    case 'compliance-dashboard':
      return { view: 'dashboard', role: 'Compliance Officer' };
    case 'visitor-tablet':
      return { view: 'visitor-tablet', role: 'Receptionist' };
    case 'employee-dashboard':
      return { view: 'employee-dashboard', role: 'Employee' };
    case 'employees':
      return { view: 'employees', role: currentRole };
    case 'documents':
      return { view: 'documents', role: currentRole };
    case 'rota':
      return { view: 'rota', role: currentRole };
    case 'shift-planning':
      return { view: 'shift-planning', role: currentRole };
    case 'day-notes':
      return { view: 'day-notes', role: currentRole };
    case 'attendance':
      return { view: 'attendance', role: currentRole };
    case 'leave':
      return { view: 'leave', role: currentRole };
    case 'payroll':
      return { view: 'payroll', role: currentRole };
    case 'observation':
      return { view: 'observation', role: currentRole };
    case 'competency':
      return { view: 'competency', role: currentRole };
    case 'settings':
      return { view: 'settings', role: currentRole };
    default: {
      const defaultView = currentRole === 'Employee' 
        ? 'employee-dashboard' 
        : (currentRole === 'Receptionist' ? 'visitor-tablet' : 'dashboard');
      return { view: defaultView, role: currentRole };
    }
  }
};

const getPathFromState = (isLoggedIn, role, view) => {
  if (!isLoggedIn) {
    return '/login';
  }
  
  const roleSlug = getRoleSlug(role);
  
  let viewSlug = view;
  if (view === 'employee-dashboard' || view === 'dashboard') {
    viewSlug = 'dashboard';
  } else if (view === 'visitor-tablet' && role === 'Receptionist') {
    viewSlug = 'dashboard';
  }
  
  return `/${roleSlug}/${viewSlug}`;
};

const AppContent = () => {
  const { 
    isLoggedIn, 
    currentRole, 
    setCurrentRole, 
    currentView, 
    setCurrentView 
  } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stateRef = React.useRef({ currentRole, currentView });
  React.useEffect(() => {
    stateRef.current = { currentRole, currentView };
  }, [currentRole, currentView]);

  // URL routing synchronization from window location
  React.useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (!isLoggedIn) {
        if (path !== '/login') {
          window.history.replaceState(null, '', '/login');
        }
        return;
      }
      
      const { currentRole: activeRole, currentView: activeView } = stateRef.current;
      const routeInfo = getRouteInfoFromPath(path, isLoggedIn, activeRole);
      
      if (routeInfo.view !== activeView) {
        setCurrentView(routeInfo.view);
      }
      if (routeInfo.role !== activeRole) {
        setCurrentRole(routeInfo.role);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    
    // Sync initially
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [isLoggedIn]);

  // Sync state changes back to window location
  React.useEffect(() => {
    const expectedPath = getPathFromState(isLoggedIn, currentRole, currentView);
    if (window.location.pathname !== expectedPath) {
      window.history.pushState(null, '', expectedPath);
    }
  }, [isLoggedIn, currentRole, currentView]);

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      
      {/* Sidebar Layout */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Header Layout */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Content body container */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
          <AppRouter />
        </main>

      </div>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
