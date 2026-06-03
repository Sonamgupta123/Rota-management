import React from 'react';
import { useApp } from '../../context/AppContext';
import Logo from './Logo';
import { X, LogOut, Settings as SettingsIcon } from 'lucide-react';

// Import configurations
import { adminMenu } from '../../config/sidebar/adminMenu';
import { hrMenu } from '../../config/sidebar/hrMenu';
import { managerMenu } from '../../config/sidebar/managerMenu';
import { complianceMenu } from '../../config/sidebar/complianceMenu';
import { receptionistMenu } from '../../config/sidebar/receptionistMenu';
import { employeeMenu } from '../../config/sidebar/employeeMenu';

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

  const getMenuConfig = () => {
    switch (currentRole) {
      case 'Admin':
        return adminMenu;
      case 'HR':
        return hrMenu;
      case 'Compliance Officer':
        return complianceMenu;
      case 'Manager':
        return managerMenu;
      case 'Receptionist':
        return receptionistMenu;
      case 'Employee':
        return employeeMenu;
      default:
        return [];
    }
  };

  const menuItems = getMenuConfig();
  const hasSettings = menuItems.some(item => item.id === 'settings');
  const navLinks = hasSettings ? menuItems : [...menuItems, { id: 'settings', label: 'Settings', icon: SettingsIcon }];

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
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-50 border-r-2 border-slate-200 dark:bg-slate-900 dark:border-slate-700 transition-all duration-305 ease-in-out lg:static w-64 shrink-0 shadow-2xl lg:shadow-[4px_0_20px_rgba(0,0,0,0.06)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        `}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b-2 border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 overflow-hidden">
            <Logo className="h-14 w-auto shrink-0 drop-shadow-sm" showText={false} />
            <span className="text-xl font-black tracking-widest uppercase text-[#2e6559] dark:text-[#3a8273] font-sans">
              AS CARE
            </span>
          </div>

          {/* Close button for Mobile screen */}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-905 lg:hidden dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto custom-scrollbar">
          <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
            {`${currentRole} Workspace`}
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;

            if (link.isExpandable) {
              const isAnySubmenuActive = link.submenu.some(sub => currentView === sub.id) || currentView === link.id;
              const showAttendanceSubmenu = ['Admin', 'HR', 'Manager', 'Compliance Officer', 'Employee'].includes(currentRole);

              return (
                <div key={link.id} className="space-y-1">
                  {/* Parent Expandable Menu Item */}
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
                    <span className="truncate">{link.label}</span>
                    <span className="ml-auto text-[10px] font-bold text-slate-400 dark:text-slate-500 transition-transform duration-200">
                      {rotaExpanded ? '▼' : '►'}
                    </span>
                  </button>

                  {/* Submenu Items */}
                  {rotaExpanded && (
                    <div className="pl-6 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-5 mt-1 animate-fade-in">
                      {link.submenu.map(sub => {
                        const isSubActive = currentView === sub.id;
                        if (sub.id === 'attendance' && !showAttendanceSubmenu) return null;

                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setCurrentView(sub.id);
                              setIsOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all
                              ${isSubActive
                                ? 'text-[#2e6559] dark:text-[#3a8273] bg-white dark:bg-slate-800 shadow-sm border border-slate-200/85 dark:border-slate-700'
                                : 'text-slate-555 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                              }
                            `}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isSubActive ? 'bg-[#2e6559] dark:bg-[#3a8273]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
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
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group
                  ${isActive
                    ? 'bg-white text-[#2e6559] dark:bg-slate-800 dark:text-[#3a8273] font-semibold shadow-sm shadow-[#2e6559]/10 border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:border hover:border-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-700'
                  }
                `}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105
                  ${isActive ? 'text-[#2e6559] dark:text-[#3a8273]' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-350'}
                `} />
                <span className="truncate">{link.label}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#2e6559] dark:bg-[#3a8273] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Logout Button */}
        <div className="p-3 border-t-2 border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/40">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200/60 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-950/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300 transition-all font-bold text-xs active:scale-[0.98] shadow-sm shadow-red-500/5"
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
