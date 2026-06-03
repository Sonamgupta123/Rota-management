import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  UserPlus, 
  FileCheck2, 
  Milestone, 
  Briefcase, 
  ArrowRight,
  Plus,
  Trash,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';

const HRDashboard = () => {
  const { employees, documents, leave, onboardEmployee, setCurrentView, setDocStatusFilter } = useApp();
  
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [onboardName, setOnboardName] = useState('');
  const [onboardTitle, setOnboardTitle] = useState('Care Assistant');
  const [onboardRole, setOnboardRole] = useState('Employee');
  const [onboardGroup, setOnboardGroup] = useState('Care Staff Day');
  const [onboardManager, setOnboardManager] = useState('Sarah Jenkins');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardPhone, setOnboardPhone] = useState('');
  const [onboardAddress, setOnboardAddress] = useState('');
  const [onboardDOB, setOnboardDOB] = useState('1995-01-01');

  // Calculations for HR dashboard
  const totalOnboarded = employees.length;
  const leavesCount = leave.filter(l => l.status === 'Approved').length;
  const joinersThisMonth = employees.filter(e => e.startDate.startsWith('2026') || e.startDate.startsWith('2024')).length;
  
  // Total missing files
  const missingDocsCount = Object.values(documents).flat().filter(d => d.complianceIndicator === 'Red').length;
  const expiringDocsCount = Object.values(documents).flat().filter(d => d.complianceIndicator === 'Amber').length;

  // New compliance metrics calculations for HR Dashboard
  const pendingVerificationCount = Object.values(documents).flat().filter(
    doc => doc.status === 'Pending Verification'
  ).length;

  const missingDocumentsCount = Object.values(documents).flat().filter(
    doc => doc.status === 'Not Uploaded'
  ).length;

  const expiringIn30DaysCount = Object.values(documents).flat().filter(
    doc => doc.expiryDate && doc.expiryDate !== 'N/A' && (() => {
      const exp = new Date(doc.expiryDate);
      const ref = new Date('2026-06-03');
      const diffTime = exp - ref;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    })()
  ).length;

  const handleOnboardSubmit = (e) => {
    e.preventDefault();
    if (!onboardName || !onboardEmail) return;

    onboardEmployee({
      name: onboardName,
      title: onboardTitle,
      role: onboardRole,
      group: onboardGroup,
      manager: onboardManager,
      email: onboardEmail,
      phone: onboardPhone,
      address: onboardAddress,
      dob: onboardDOB,
      holidayAllocation: 28,
      startDate: new Date().toISOString().split('T')[0]
    });

    // Reset
    setOnboardName('');
    setOnboardEmail('');
    setOnboardPhone('');
    setOnboardAddress('');
    setOnboardOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in p-2">
      
      {/* View Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight">HR Operations & Onboarding</h2>
          <p className="text-xs text-slate-500">Manage recruitment pipelines, onboarding workflows, and active holiday allocations</p>
        </div>

        <button
          onClick={() => setOnboardOpen(true)}
          className="h-9 px-4 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all flex items-center gap-1.5 shadow-sm self-start"
        >
          <UserPlus className="h-4 w-4" />
          <span>Onboard New Employee</span>
        </button>
      </div>

      {/* Compliance Verification Widgets */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div 
          onClick={() => {
            setDocStatusFilter('Pending');
            setCurrentView('employees');
          }}
          className="glass-card glass-card-hover rounded-2xl p-4 flex items-center justify-between cursor-pointer border border-amber-200/50 dark:border-amber-900/40 shadow-sm transition-all active:scale-[0.98]"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Pending Document Verification</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingVerificationCount}</p>
            <span className="text-[10px] text-slate-500 font-semibold">Pending Verification: {pendingVerificationCount}</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-955/20 text-amber-500 border border-amber-100 dark:border-amber-900/30">
            <FileCheck2 className="h-5 w-5" />
          </div>
        </div>

        <div 
          onClick={() => {
            setDocStatusFilter('Missing');
            setCurrentView('employees');
          }}
          className="glass-card glass-card-hover rounded-2xl p-4 flex items-center justify-between cursor-pointer border border-red-200/50 dark:border-red-900/40 shadow-sm transition-all active:scale-[0.98]"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Missing Documents</span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-455">{missingDocumentsCount}</p>
            <span className="text-[10px] text-slate-500 font-semibold">Missing Documents: {missingDocumentsCount}</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-955/20 text-rose-500 border border-red-100 dark:border-red-900/30">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div 
          onClick={() => {
            setDocStatusFilter('Expiring');
            setCurrentView('employees');
          }}
          className="glass-card glass-card-hover rounded-2xl p-4 flex items-center justify-between cursor-pointer border border-indigo-200/50 dark:border-indigo-900/40 shadow-sm transition-all active:scale-[0.98]"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Expiring Documents</span>
            <p className="text-2xl font-black text-indigo-650 dark:text-indigo-400">{expiringIn30DaysCount}</p>
            <span className="text-[10px] text-slate-500 font-semibold">Expiring In 30 Days: {expiringIn30DaysCount}</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 border border-indigo-100 dark:border-indigo-900/30">
            <Milestone className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">New Joiners (Roster)</span>
            <p className="text-2xl font-bold tracking-tight">{joinersThisMonth} Staff</p>
            <span className="text-[10px] text-slate-500 font-semibold">Onboarded this cycle</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center dark:bg-brand-950/20">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Missing Documents</span>
            <p className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">{missingDocsCount} Files</p>
            <span className="text-[10px] text-slate-500 font-semibold">Red status (CQC safety gap)</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center dark:bg-red-950/20">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Expiring Documents</span>
            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{expiringDocsCount} Files</p>
            <span className="text-[10px] text-slate-500 font-semibold">Amber status verification soon</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center dark:bg-amber-950/20">
            <FileCheck2 className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Employees On Leave</span>
            <p className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">{leavesCount} Active</p>
            <span className="text-[10px] text-slate-500 font-semibold">Approved holiday allowances</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center dark:bg-indigo-950/20">
            <Milestone className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* TWO PANEL SECTIONS: Recruitment pipeline + Onboarding checklist logs */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left Side: Recruitment Pipeline workflow board */}
        <div className="md:col-span-2 glass-card rounded-3xl p-5 md:p-6 space-y-4">
          <h3 className="font-bold text-sm">Recruitment & Interview Pipeline</h3>
          
          <div className="grid gap-3 sm:grid-cols-3">
            
            {/* Stage 1: Applied */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-3">
              <div className="flex justify-between border-b pb-1">
                <span className="font-bold text-slate-850 dark:text-slate-200">Applied (4)</span>
                <span className="h-2 w-2 rounded-full bg-slate-400" />
              </div>
              <div className="space-y-2">
                {["Oliver Smith (Care Assist)", "Sophie Lee (Registered Nurse)"].map((n, i) => (
                  <div key={i} className="rounded-xl border p-2.5 bg-white dark:bg-slate-950 font-medium">
                    <p className="font-bold">{n}</p>
                    <span className="text-[9px] text-slate-400 block">CV Screened - Excellent references</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage 2: Interviewing */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-3">
              <div className="flex justify-between border-b pb-1">
                <span className="font-bold text-indigo-650 dark:text-indigo-400">Interviewing (2)</span>
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                {["Mia Kowalski (Housekeep)", "Danny Rose (Sous Cook)"].map((n, i) => (
                  <div key={i} className="rounded-xl border p-2.5 bg-white dark:bg-slate-950 font-medium">
                    <p className="font-bold">{n}</p>
                    <span className="text-[9px] text-slate-400 block">Stage 2 Practical Assessment</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage 3: Offer Letter */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-3">
              <div className="flex justify-between border-b pb-1">
                <span className="font-bold text-emerald-650 dark:text-emerald-400">Offered (1)</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="space-y-2">
                <div className="rounded-xl border p-2.5 bg-white dark:bg-slate-950 font-medium relative">
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand-500 animate-ping" />
                  <p className="font-bold">Elijah Brown</p>
                  <span className="text-[9px] text-slate-400 block">Offer sent. Contract pending signature.</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Joiner list logs */}
        <div className="glass-card rounded-3xl p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
            <h3 className="font-bold text-sm">New Onboarded Joiners</h3>
            <button 
              onClick={() => setCurrentView('employees')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Directory
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
            {employees.slice(-3).map((emp) => (
              <div key={emp.id} className="flex gap-2.5 text-xs items-center">
                <img src={emp.photo} alt={emp.name} className="h-8 w-8 rounded-full object-cover border" />
                <div>
                  <p className="font-bold text-slate-850 dark:text-slate-100">{emp.name}</p>
                  <p className="text-[9px] text-slate-400">Start Date: {emp.startDate}</p>
                  <span className="text-[9px] text-indigo-700 font-semibold block">{emp.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Employee Onboarding Form Wizard overlay */}
      {onboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-modal p-6 md:p-8 shadow-xl relative animate-slide-up max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setOnboardOpen(false)}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-650 dark:hover:text-slate-205 transition-colors flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-500" />
              <span>Onboard New Care Staff Member</span>
            </h3>
            
            <p className="text-xs text-slate-400 mt-1">
              Initialize digital profile workspace. An empty compliance checklist will automatically generate for file sign-off.
            </p>

            <form onSubmit={handleOnboardSubmit} className="mt-4 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Smith"
                    value={onboardName}
                    onChange={(e) => setOnboardName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Official Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Care Support"
                    value={onboardTitle}
                    onChange={(e) => setOnboardTitle(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="liam.smith@oakfieldcare.co.uk"
                    value={onboardEmail}
                    onChange={(e) => setOnboardEmail(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 7700 900999"
                    value={onboardPhone}
                    onChange={(e) => setOnboardPhone(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Skill Group</label>
                  <select
                    value={onboardGroup}
                    onChange={(e) => setOnboardGroup(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="Care Staff Day">Care Staff Day</option>
                    <option value="Care Staff Night">Care Staff Night</option>
                    <option value="Cook">Catering / Cook</option>
                    <option value="Domestic">Domestic / Clean</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Security Auth Role</label>
                  <select
                    value={onboardRole}
                    onChange={(e) => setOnboardRole(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="Employee">Employee Portal</option>
                    <option value="Manager">Manager Portal</option>
                    <option value="HR">HR Portal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">Home Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 52 High Street, Birmingham, B4 7TA"
                  value={onboardAddress}
                  onChange={(e) => setOnboardAddress(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setOnboardOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold"
                >
                  Onboard Employee
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HRDashboard;
