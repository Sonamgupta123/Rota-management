import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Mail,
  Users,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Shield,
  Clock,
  FileCheck
} from 'lucide-react';
import Logo from '../../layouts/shared/Logo';

const Login = () => {
  const { setIsLoggedIn, setCurrentRole, setCurrentView, setActiveEmployeeId } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle standard credentials login click
  const handleFormLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setCurrentRole('Admin');
      setActiveEmployeeId('EMP-001');
      setCurrentView('dashboard');
      setIsLoggedIn(true);
      setLoading(false);
    }, 600);
  };

  // Quick Direct Fast Pass Logins
  const handleFastPass = (role, empId) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentRole(role);
      setActiveEmployeeId(empId);
      if (role === 'Receptionist') {
        setCurrentView('visitor-tablet');
      } else if (role === 'Employee') {
        setCurrentView('employee-dashboard');
      } else {
        setCurrentView('dashboard');
      }
      setIsLoggedIn(true);
      setLoading(false);
    }, 300);
  };

  // Demo roles details mapping
  const fastPasses = [
    { role: 'Admin', empId: 'EMP-001', name: 'Sarah Jenkins', title: 'Director Admin', color: 'from-brand-600 to-brand-500' },
    { role: 'HR', empId: 'EMP-001', name: 'Sarah Jenkins', title: 'HR Manager', color: 'from-indigo-600 to-indigo-500' },
    { role: 'Compliance Officer', empId: 'EMP-006', name: 'Marcus Vance', title: 'Compliance Lead', color: 'from-violet-600 to-violet-500' },
    { role: 'Manager', empId: 'EMP-001', name: 'Sarah Jenkins', title: 'Operations Manager', color: 'from-amber-600 to-amber-500' },
    { role: 'Receptionist', empId: 'EMP-007', name: 'Chloe Bennett', title: 'Reception Desk', color: 'from-sky-600 to-sky-500' },
    { role: 'Employee', empId: 'EMP-002', name: 'James Carter', title: 'Roster Staff Nurse', color: 'from-emerald-600 to-emerald-500' },
  ];

  const features = [
    { icon: Shield, text: 'GDPR Compliant' },
    { icon: Clock, text: 'Real-time Tracking' },
    { icon: FileCheck, text: 'CQC Audit Ready' },
  ];

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-y-auto">

      {/* ─── LEFT / TOP BRAND PANEL ─── */}
      <div
        className="login-bg relative hidden lg:flex w-full lg:w-[45%] lg:min-h-screen flex-col items-center justify-center text-center overflow-hidden shrink-0"
      >
        {/* Decorative glows */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Content wrapper — compact on mobile, full on desktop */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 px-6 py-8 sm:py-12 lg:py-16 w-full max-w-md mx-auto">

          {/* Logo */}
          <div className="flex items-center justify-center">
            <Logo className="h-20 w-auto sm:h-28 lg:h-36 drop-shadow-2xl" />
          </div>

          {/* Badge pill */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-3 py-1 text-[10px] font-bold text-brand-300 border border-brand-500/20 uppercase tracking-widest">
            <Sparkles className="h-3 w-3 text-brand-400" />
            <span>Healthcare SaaS Platform</span>
          </span>

          {/* Headline */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Workforce &amp; Compliance
            </h1>
            <p className="text-xs sm:text-sm text-brand-100/60 font-medium leading-relaxed max-w-xs mx-auto">
              Complete care home workforce management, scheduling &amp; CQC compliance suite.
            </p>
          </div>

          {/* Feature pills — hide on very small screens */}
          <div className="hidden sm:flex items-center gap-3 flex-wrap justify-center mt-1">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-[10px] font-semibold text-brand-200/70 bg-brand-500/10 border border-brand-500/15 rounded-full px-3 py-1">
                <Icon className="h-3 w-3" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer copyright — show only on desktop */}
        <div className="hidden lg:block absolute bottom-5 left-0 right-0 text-center text-[10px] text-brand-300/30 font-semibold tracking-widest uppercase">
          © 2026 AS Care Technologies Ltd
        </div>
      </div>

      {/* ─── RIGHT / BOTTOM FORM PANEL ─── */}
      <div className="flex-1 w-full lg:min-h-screen bg-white text-slate-800 flex flex-col justify-center items-center px-5 py-8 sm:px-8 sm:py-10 lg:p-12 overflow-y-auto">

        <div className="w-full max-w-md mx-auto space-y-6">

          {/* Panel heading */}
          <div className="text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center justify-center lg:justify-start gap-2">
              <KeyRound className="h-5 w-5 text-brand-500 shrink-0" />
              <span>Workspace Login</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Enter your credentials or use a Fast Pass demo below.
            </p>
          </div>

          {/* ─── Login Form Card ─── */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 p-5 sm:p-7 space-y-4 sm:space-y-5">

            <form onSubmit={handleFormLogin} className="space-y-4 text-xs sm:text-sm">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 block uppercase tracking-widest text-[9px] sm:text-[10px]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="admin@oakfieldcare.co.uk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 text-slate-900 transition-all font-medium placeholder:text-slate-400 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 block uppercase tracking-widest text-[9px] sm:text-[10px]">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 text-slate-900 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:shadow-brand-500/30 active:scale-[0.98] disabled:opacity-70 text-sm uppercase tracking-wider mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span>Login as Administrator</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ─── Fast Pass Deck ─── */}
          <div className="space-y-3">
            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                <Users className="h-3.5 w-3.5 text-brand-500" />
                <span>Fast Pass Demo Login</span>
              </div>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Role cards grid — 2 columns on mobile, 3 on md+ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {fastPasses.map((pass, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFastPass(pass.role, pass.empId)}
                  disabled={loading}
                  className="group relative rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all text-left p-3 sm:p-3.5 overflow-hidden active:scale-[0.97] disabled:opacity-60 flex flex-col justify-between min-h-[64px] sm:min-h-[72px]"
                >
                  {/* Colored accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${pass.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div>
                    <span className="font-extrabold text-slate-800 text-[11px] sm:text-xs leading-tight block group-hover:text-brand-700 transition-colors">
                      {pass.role === 'Compliance Officer' ? 'Compliance' : pass.role}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block font-medium leading-tight mt-0.5 truncate">
                      {pass.title}
                    </span>
                  </div>

                  <CheckCircle2 className="h-3 w-3 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 self-end" />
                </button>
              ))}
            </div>

            {/* Tip note */}
            <p className="text-center text-[10px] text-slate-400 font-medium pt-1">
              No account needed · Click any role card to explore the demo
            </p>
          </div>

          {/* Footer on mobile */}
          <p className="text-center text-[10px] text-slate-300 font-medium pb-2 lg:hidden">
            © 2026 AS Care Technologies Ltd
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
