import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  ChevronDown, 
  LogOut,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const { 
    darkMode, 
    toggleDarkMode, 
    setIsLoggedIn,
    currentRole, 
    notifications,
    markAllNotificationsRead,
    employees,
    activeEmployeeId
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const activeEmp = employees.find(e => e.id === activeEmployeeId) || employees[0];
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default:
        return <Info className="h-4 w-4 text-indigo-500" />;
    }
  };

  const getNotifBg = (type) => {
    switch (type) {
      case 'alert':
        return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400';
      case 'warning':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400';
      case 'success':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
      default:
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition-all duration-200">
      
      {/* Left side: Hamburger button only */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-xl border border-slate-200/60 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white transition-all shadow-sm"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications Icon Tray */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className={`relative rounded-xl border border-slate-200/60 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white transition-all shadow-sm
              ${notifOpen ? 'bg-slate-50 dark:bg-slate-900' : ''}
            `}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950 animate-bounce">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl glass-modal py-2 shadow-xl ring-1 ring-slate-900/5 z-50 animate-slide-up">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-sm">Notifications Center</span>
                {unreadNotifs > 0 && (
                  <button 
                    onClick={() => {
                      markAllNotificationsRead();
                      setNotifOpen(false);
                    }}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto custom-scrollbar px-1 py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-405">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`flex gap-3 px-3 py-2.5 rounded-xl text-xs leading-normal hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors
                        ${!notif.read ? 'bg-brand-50/20 font-medium' : ''}
                      `}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${getNotifBg(notif.type)}`}>
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800 dark:text-slate-200">{notif.text}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>{notif.time}</span>
                        </div>
                      </div>
                      {!notif.read && (
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500 self-center" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card and Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800/85 transition-all"
          >
            <img
              src={activeEmp.photo}
              alt={activeEmp.name}
              className="h-8 w-8 rounded-full border border-slate-200 object-cover dark:border-slate-800"
            />
            <div className="hidden md:block text-left pr-1.5">
              <p className="text-xs font-semibold leading-tight">{activeEmp.name}</p>
              <p className="text-[10px] font-medium text-slate-500 capitalize leading-none mt-0.5">{currentRole}</p>
            </div>
            <ChevronDown className="h-4.5 w-4.5 text-slate-400 hidden md:block" />
          </button>

          {/* Profile Dropdown Panel */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-modal py-1.5 shadow-xl ring-1 ring-slate-900/5 z-50 animate-slide-up">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="block font-semibold text-slate-900 dark:text-white truncate">{activeEmp.name}</span>
                <span className="block text-slate-500 truncate mt-0.5">{activeEmp.email}</span>
                <span className="inline-flex mt-1.5 items-center gap-1.5 rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-400">
                  <Sparkles className="h-2.5 w-2.5 text-brand-500" />
                  <span>ID: {activeEmp.id}</span>
                </span>
              </div>
              <div className="p-1">
                <button 
                  onClick={() => { setProfileOpen(false); setIsLoggedIn(false); }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
