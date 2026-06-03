import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AccessDenied = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 animate-fade-in">
      <div className="glass-card max-w-md w-full rounded-3xl p-8 border border-red-500/20 dark:border-red-500/10 shadow-2xl text-center space-y-6 bg-white/40 dark:bg-slate-950/30 backdrop-blur-md">
        
        {/* Animated Icon Container */}
        <div className="mx-auto h-20 w-20 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 flex items-center justify-center shadow-lg border border-red-150/40 dark:border-red-900/30 animate-pulse">
          <ShieldAlert className="h-10 w-10" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
            Access Denied
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Your current workspace role does not have authorization to view this resource. Please contact your system administrator if you believe this is in error.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setCurrentView('dashboard')}
          className="w-full h-11 px-5 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-md shadow-red-500/20 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
