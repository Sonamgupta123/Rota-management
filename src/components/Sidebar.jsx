import React from 'react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';
import {
  LayoutDashboard,
  CalendarDays,
  UserCheck,
  Users,
  FileCheck,
  ShieldCheck,
  Milestone,
  Receipt,
  Settings,
  X,
  ClipboardList,
  LogOut,
  BarChart3
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { currentRole, currentView, setCurrentView, setIsLoggedIn } = useApp();
  const [rotaExpanded, setRotaExpanded] = React.useState(true);

  // Auto-expand Rota parent when any of its submenus are active
  React.useEffect(() => {
    const isAnySubmenuActive = ['rota', 'shift-planning', 'day-notes', 'attendance'].includes(currentView);
    if (isAnySubmenuActive) {
      setRotaExpanded(true);
    }
  }, [currentView]);

  // Render navigation links based on RBAC file specifications
  const getNavLinks = () => {
    switch (currentRole) {
      case 'Admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'employees', label: 'Employee Profiles', icon: Users },
          { id: 'documents', label: 'Compliance Checklist', icon: FileCheck },
          { id: 'rota', label: 'Rota Planner', icon: CalendarDays },
          { id: 'leave', label: 'Leave Manager', icon: Milestone },
          { id: 'payroll', label: 'Payroll Summary', icon: Receipt },
          { id: 'reports', label: 'Reports Insights', icon: BarChart3 },
          { id: 'visitor-tablet', label: 'Visitor Registration', icon: ClipboardList },
          { id: 'audits', label: 'Audits Panel', icon: ShieldCheck }
        ];

      case 'HR':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'employees', label: 'Employee Profiles', icon: Users },
          { id: 'documents', label: 'Documents Manager', icon: FileCheck },
          { id: 'leave', label: 'Leave Approvals', icon: Milestone },
          { id: 'payroll', label: 'Payroll Summary', icon: Receipt },
          { id: 'rota', label: 'Rota View', icon: CalendarDays }
        ];

      case 'Compliance Officer':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'audits', label: 'Scheduled Audits', icon: ShieldCheck },
          { id: 'documents', label: 'Document Audits', icon: FileCheck },
          { id: 'rota', label: 'Rota View', icon: CalendarDays }
        ];

      case 'Manager':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'employees', label: 'Employee Directory', icon: Users },
          { id: 'rota', label: 'Rota Planner', icon: CalendarDays },
          { id: 'documents', label: 'Document Verify', icon: FileCheck },
          { id: 'leave', label: 'Leave Approvals', icon: Milestone },
          { id: 'payroll', label: 'Hours Monitor', icon: Receipt },
          { id: 'audits', label: 'Audits Panel', icon: ShieldCheck }
        ];

      case 'Receptionist':
        return [
          { id: 'visitor-tablet', label: 'Visitor Desk UI', icon: ClipboardList }
        ];

      case 'Employee':
        return [
          { id: 'employee-dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'rota', label: 'My Rota Schedule', icon: CalendarDays },
          { id: 'documents', label: 'My Checklist', icon: FileCheck },
          { id: 'leave', label: 'Request Leave', icon: Milestone },
          { id: 'payroll', label: 'My Payslips', icon: Receipt }
        ];

      default:
        return [];
    }
  };

  const navLinks = [...getNavLinks(), { id: 'settings', label: 'Settings', icon: Settings }];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-50 border-r-2 border-slate-200 dark:bg-slate-900 dark:border-slate-700 transition-all duration-300 ease-in-out lg:static w-64 shrink-0 shadow-2xl lg:shadow-[4px_0_20px_rgba(0,0,0,0.06)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        `}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b-2 border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 overflow-hidden">
            <Logo className="h-14 w-auto shrink-0 drop-shadow-sm" showText={false} />
            <span className="text-xl font-black tracking-widest uppercase text-brand-600 dark:text-brand-400 font-sans">
              AS CARE
            </span>
          </div>
          
          {/* Close button for Mobile screen */}
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto custom-scrollbar">
          <div className="px-2 mb-2 text-[10px] font-bold text-slate-450 dark:text-slate-500 tracking-wider uppercase">
            {`${currentRole} Workspace`}
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;

            if (link.id === 'rota') {
              const isRotaActive = currentView === 'rota';
              const isShiftPlanningActive = currentView === 'shift-planning';
              const isDayNotesActive = currentView === 'day-notes';
              const isAttendanceActive = currentView === 'attendance';
              const isAnySubmenuActive = isRotaActive || isShiftPlanningActive || isDayNotesActive || isAttendanceActive;
              const showAttendanceSubmenu = ['Admin', 'HR', 'Manager', 'Compliance Officer', 'Employee'].includes(currentRole);

              return (
                <div key="rota-menu-group" className="space-y-1">
                  {/* Parent Rota Menu Item */}
                  <button
                    onClick={() => setRotaExpanded(!rotaExpanded)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-155 group
                      ${isAnySubmenuActive
                        ? 'bg-slate-100/80 text-brand-600 dark:bg-slate-800/60 dark:text-brand-400 font-semibold border border-slate-200/50 dark:border-slate-800'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:border hover:border-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-700'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105
                      ${isAnySubmenuActive ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-350'}
                    `} />
                    <span className="truncate">Rota</span>
                    <span className="ml-auto text-[10px] font-bold text-slate-400 dark:text-slate-500 transition-transform duration-200">
                      {rotaExpanded ? '▼' : '►'}
                    </span>
                  </button>

                  {/* Submenu Items */}
                  {rotaExpanded && (
                    <div className="pl-6 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-5 mt-1 animate-fade-in">
                      {/* Rota Calendar */}
                      <button
                        onClick={() => {
                          setCurrentView('rota');
                          setIsOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all
                          ${isRotaActive 
                            ? 'text-brand-650 dark:text-brand-400 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/85 dark:border-slate-700' 
                            : 'text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                          }
                        `}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isRotaActive ? 'bg-brand-500 dark:bg-brand-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <span>Rota Calendar</span>
                      </button>

                      {/* Shift Planning */}
                      <button
                        onClick={() => {
                          setCurrentView('shift-planning');
                          setIsOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all
                          ${isShiftPlanningActive 
                            ? 'text-brand-650 dark:text-brand-400 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/85 dark:border-slate-700' 
                            : 'text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                          }
                        `}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isShiftPlanningActive ? 'bg-brand-500 dark:bg-brand-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <span>Shift Planning</span>
                      </button>

                      {/* Day Notes */}
                      <button
                        onClick={() => {
                          setCurrentView('day-notes');
                          setIsOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all
                          ${isDayNotesActive 
                            ? 'text-brand-650 dark:text-brand-400 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/85 dark:border-slate-700' 
                            : 'text-slate-555 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                          }
                        `}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isDayNotesActive ? 'bg-brand-500 dark:bg-brand-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <span>Day Notes</span>
                      </button>

                      {/* Attendance Submenu */}
                      {showAttendanceSubmenu && (
                        <button
                          onClick={() => {
                            setCurrentView('attendance');
                            setIsOpen(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all
                            ${isAttendanceActive 
                              ? 'text-brand-650 dark:text-brand-400 bg-white dark:bg-slate-800 shadow-sm border border-slate-200/85 dark:border-slate-700' 
                              : 'text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }
                          `}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isAttendanceActive ? 'bg-brand-500 dark:bg-brand-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                          <span>Attendance</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentView(link.id);
                  setIsOpen(false); // Auto close drawer on mobile selection
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group
                  ${isActive 
                    ? 'bg-white text-brand-600 dark:bg-slate-800 dark:text-brand-400 font-semibold shadow-sm shadow-brand-500/10 border border-slate-200 dark:border-slate-700' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:border hover:border-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-700'
                  }
                `}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105
                  ${isActive ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-350'}
                `} />
                <span className="truncate">{link.label}</span>
                {/* Active mini dot indicators */}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500 dark:bg-brand-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Logout Button */}
        <div className="p-3 border-t-2 border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/40">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200/60 bg-red-50 text-red-650 hover:bg-red-100 hover:text-red-750 dark:border-red-950/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300 transition-all font-bold text-xs active:scale-[0.98] shadow-sm shadow-red-500/5"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
