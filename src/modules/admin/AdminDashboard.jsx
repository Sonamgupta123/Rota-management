import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  UserCheck, 
  CalendarDays, 
  ShieldAlert, 
  Files, 
  Footprints, 
  CreditCard,
  TrendingUp,
  Percent,
  CheckCircle,
  FileCheck2,
  CalendarRange,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const { 
    employees, 
    shifts, 
    openShifts, 
    attendance, 
    audits, 
    visitors, 
    documents,
    setCurrentView,
    setDocStatusFilter
  } = useApp();

  // Dynamic calculations based on state
  const totalEmployees = employees.length;
  const activePresent = attendance.filter(a => a.date === '2026-06-01' && a.clockOut === 'Pending').length;
  const pendingAudits = audits.filter(a => a.status === 'Pending' || a.status === 'In Progress').length;
  const overdueAudits = audits.filter(a => a.status === 'Overdue').length;
  const visitorsToday = visitors.length;
  const openShiftsCount = openShifts.length;

  // Expiring documents count (Amber or Red compliance indicators)
  const expiringDocsCount = Object.values(documents).flat().filter(
    doc => doc.complianceIndicator === 'Amber' || doc.complianceIndicator === 'Red'
  ).length;

  // New compliance metrics calculations
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

  // Compliance score calculation
  const totalDocs = Object.values(documents).flat().length;
  const greenDocs = Object.values(documents).flat().filter(doc => doc.complianceIndicator === 'Green').length;
  const docScore = totalDocs > 0 ? (greenDocs / totalDocs) * 100 : 90;
  const completedAudits = audits.filter(a => a.status === 'Completed');
  const avgAuditScore = completedAudits.length > 0 
    ? completedAudits.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedAudits.length 
    : 95;
  const complianceScore = Math.round((docScore + avgAuditScore) / 2);

  // Quick stats lists
  const kpis = [
    { 
      label: 'Total Workforce', 
      val: totalEmployees, 
      desc: 'Active contracts', 
      icon: Users, 
      color: 'from-blue-500 to-indigo-600', 
      action: 'employees' 
    },
    { 
      label: 'Staff Present Today', 
      val: `${activePresent + 3}/${totalEmployees}`, // Mocking +3 standard shifts
      desc: 'Currently clocked-in', 
      icon: UserCheck, 
      color: 'from-emerald-500 to-teal-600', 
      action: 'attendance' 
    },
    { 
      label: 'Open Rotas / Shifts', 
      val: openShiftsCount, 
      desc: 'Immediate cover slots', 
      icon: CalendarDays, 
      color: 'from-orange-400 to-amber-600', 
      action: 'rota' 
    },
    { 
      label: 'Pending Health Audits', 
      val: pendingAudits, 
      desc: `${overdueAudits} overdue items`, 
      icon: ShieldAlert, 
      color: 'from-rose-500 to-red-600', 
      action: 'audits' 
    },
    { 
      label: 'Compliance Flags', 
      val: expiringDocsCount, 
      desc: 'Expiring/missing docs', 
      icon: Files, 
      color: 'from-purple-500 to-indigo-600', 
      action: 'documents' 
    },
    { 
      label: 'Reception Visitors', 
      val: visitors.filter(v => v.status === 'Currently Inside').length, 
      desc: 'Checked inside today', 
      icon: Footprints, 
      color: 'from-cyan-500 to-blue-600', 
      action: 'visitor-tablet' 
    },
    { 
      label: 'Weekly Payroll Hours', 
      val: '482h', 
      desc: '£6,748 gross est.', 
      icon: CreditCard, 
      color: 'from-emerald-600 to-brand-700', 
      action: 'payroll' 
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in p-2">
      
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-gradient-to-r from-brand-800 to-brand-600 p-6 md:p-8 text-white shadow-lg shadow-brand-900/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">Operational Overview</h1>
          <p className="mt-1 text-sm md:text-base text-brand-100 font-medium">
            Care Home Workforce, Document Audits & Shifts tracking system active.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentView('rota')}
            className="h-10 rounded-xl bg-white px-4 text-xs font-semibold text-brand-800 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <CalendarRange className="h-4 w-4" />
            <span>Manage Shift Rota</span>
          </button>
          <button 
            onClick={() => setCurrentView('audits')}
            className="h-10 rounded-xl bg-brand-500 hover:bg-brand-400 border border-brand-400 px-4 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Initiate Safety Audit</span>
          </button>
        </div>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 border border-amber-100 dark:border-amber-900/30">
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
            <ShieldAlert className="h-5 w-5" />
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
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx}
              onClick={() => setCurrentView(kpi.action)}
              className="glass-card glass-card-hover rounded-2xl p-4 flex items-center justify-between cursor-pointer border border-slate-200/60 dark:border-slate-800/80 shadow-sm relative overflow-hidden"
            >
              {/* background design */}
              <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.04]">
                <Icon className="h-28 w-28 text-slate-800" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <p className="text-2xl font-bold tracking-tight">{kpi.val}</p>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block">{kpi.desc}</span>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr ${kpi.color} text-white shadow-md shadow-brand-500/10`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Chart 1: Attendance Trends (Line/Area SVG Chart) */}
        <div className="glass-card rounded-2xl p-5 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base leading-tight">Weekly Attendance Trends</h3>
              <p className="text-xs text-slate-500">Clock-in success ratios & punctuality over the last 7 days</p>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              <TrendingUp className="h-3 w-3" />
              <span>+2.4% avg</span>
            </div>
          </div>

          {/* SVG Animated Chart */}
          <div className="relative w-full h-56 pt-2">
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
              {/* Grids */}
              <line x1="50" y1="20" x2="650" y2="20" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />
              <line x1="50" y1="70" x2="650" y2="70" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />
              <line x1="50" y1="120" x2="650" y2="120" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />
              <line x1="50" y1="170" x2="650" y2="170" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-800" />
              
              {/* Y Axis Labels */}
              <text x="15" y="25" fill="#94a3b8" fontSize="10" className="font-medium">100%</text>
              <text x="20" y="75" fill="#94a3b8" fontSize="10" className="font-medium">95%</text>
              <text x="20" y="125" fill="#94a3b8" fontSize="10" className="font-medium">90%</text>
              <text x="20" y="175" fill="#94a3b8" fontSize="10" className="font-medium">85%</text>

              {/* Data points: Mon (96), Tue (98), Wed (94), Thu (97), Fri (99), Sat (92), Sun (95) */}
              {/* Coordinates mappings:
                  X: 50, 150, 250, 350, 450, 550, 650
                  Y: 170 (for 85%) -> 20 (for 100%). Each 1% is 10px.
                  96% = 60, 98% = 40, 94% = 80, 97% = 50, 99% = 30, 92% = 100, 95% = 70
              */}
              {/* Area Gradient fill */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38a394" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#38a394" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              <path
                d="M 50 170 L 50 60 L 150 40 L 250 80 L 350 50 L 450 30 L 550 100 L 650 70 L 650 170 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Main Line */}
              <path
                d="M 50 60 L 150 40 L 250 80 L 350 50 L 450 30 L 550 100 L 650 70"
                fill="none"
                stroke="#38a394"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Dots & Interactive Hover labels */}
              {[
                { x: 50, y: 60, val: "96%", day: "Mon" },
                { x: 150, y: 40, val: "98%", day: "Tue" },
                { x: 250, y: 80, val: "94%", day: "Wed" },
                { x: 350, y: 50, val: "97%", day: "Thu" },
                { x: 450, y: 30, val: "99%", day: "Fri" },
                { x: 550, y: 100, val: "92%", day: "Sat" },
                { x: 650, y: 70, val: "95%", day: "Sun" }
              ].map((pt, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5.5"
                    fill="#38a394"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="transition-all group-hover:r-7 group-hover:stroke-brand-200 dark:stroke-slate-900"
                  />
                  {/* Tooltip on hover */}
                  <rect
                    x={pt.x - 22}
                    y={pt.y - 32}
                    width="44"
                    height="20"
                    rx="6"
                    fill="#1e293b"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 19}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    {pt.val}
                  </text>
                  <text
                    x={pt.x}
                    y="192"
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {pt.day}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Chart 2: Compliance Score Circular gauge */}
        <div className="glass-card rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base leading-tight">Total Compliance Index</h3>
            <p className="text-xs text-slate-500">Evaluated from 19 active checklist documents & audits</p>
          </div>

          <div className="relative flex items-center justify-center h-40">
            {/* SVG Donut Circle */}
            <svg width="150" height="150" className="transform -rotate-90">
              <circle
                cx="75"
                cy="75"
                r="60"
                stroke="#f1f5f9"
                strokeWidth="12"
                fill="transparent"
                className="dark:stroke-slate-800"
              />
              <circle
                cx="75"
                cy="75"
                r="60"
                stroke="#38a394"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={376.9}
                // StrokeDashoffset = 376.9 - (376.9 * complianceScore) / 100
                strokeDashoffset={376.9 - (376.9 * complianceScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold tracking-tight">{complianceScore}%</span>
              <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-wider uppercase">Excellent</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-brand-500" />
              <span>Docs Verified: {Math.round(docScore)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Audits Score: {Math.round(avgAuditScore)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: Staffing Coverage Bar Chart + Recent Logs */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Chart 3: Staffing Coverage Column Chart */}
        <div className="glass-card rounded-2xl p-5 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base leading-tight">Weekly Staffing Coverage</h3>
              <p className="text-xs text-slate-500">Ratio of filled shifts vs care safety requirements</p>
            </div>
            <div className="flex gap-3 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded bg-brand-500" />
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded bg-slate-200 dark:bg-slate-700" />
                <span>Required</span>
              </div>
            </div>
          </div>

          {/* SVG Animated Columns */}
          <div className="relative w-full h-56 pt-2">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />
              <line x1="40" y1="95" x2="580" y2="95" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-800" />

              {/* Y Axis labels */}
              <text x="15" y="23" fill="#94a3b8" fontSize="9" className="font-medium">100%</text>
              <text x="20" y="98" fill="#94a3b8" fontSize="9" className="font-medium">50%</text>
              <text x="25" y="173" fill="#94a3b8" fontSize="9" className="font-medium">0%</text>

              {/* Days Data: Mon (100%), Tue (100%), Wed (85% Understaffed), Thu (85% Understaffed), Fri (115% Overstaffed), Sat (60% Critical), Sun (100%) */}
              {[
                { day: "Mon", filled: 7, req: 7, x: 60, pct: "100%", status: "fully" },
                { day: "Tue", filled: 7, req: 7, x: 135, pct: "100%", status: "fully" },
                { day: "Wed", filled: 5, req: 7, x: 210, pct: "71%", status: "under" },
                { day: "Thu", filled: 5, req: 7, x: 285, pct: "71%", status: "under" },
                { day: "Fri", filled: 8, req: 7, x: 360, pct: "114%", status: "over" },
                { day: "Sat", filled: 3, req: 7, x: 435, pct: "42%", status: "critical" },
                { day: "Sun", filled: 7, req: 7, x: 510, pct: "100%", status: "fully" }
              ].map((bar, idx) => {
                // Height calculations. Max height at y=20 is 150px (representing 100%+ values)
                const reqHeight = 130; // Required is constant 7 shifts (represented as 130px height)
                const reqY = 170 - reqHeight;
                const filledHeight = (bar.filled / bar.req) * reqHeight;
                const filledY = 170 - filledHeight;

                const getBarColor = (status) => {
                  if (status === 'critical') return '#ef4444'; // Red
                  if (status === 'under') return '#f59e0b'; // Amber
                  if (status === 'over') return '#6366f1'; // Indigo
                  return '#38a394'; // Brand (Green)
                };

                return (
                  <g key={idx} className="group cursor-pointer">
                    {/* Required background bar */}
                    <rect
                      x={bar.x + 12}
                      y={reqY}
                      width="10"
                      height={reqHeight}
                      rx="3"
                      fill="#cbd5e1"
                      className="dark:fill-slate-700 opacity-60"
                    />
                    
                    {/* Filled foreground bar */}
                    <rect
                      x={bar.x}
                      y={filledY}
                      width="10"
                      height={filledHeight}
                      rx="3"
                      fill={getBarColor(bar.status)}
                    />
                    
                    {/* Label percentage on hover */}
                    <text
                      x={bar.x + 11}
                      y={filledY - 8}
                      fill={getBarColor(bar.status)}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {bar.pct}
                    </text>

                    {/* Day label */}
                    <text
                      x={bar.x + 11}
                      y="190"
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="500"
                      textAnchor="middle"
                    >
                      {bar.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Live Visitor Log widget */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">Active Visitor Log</h3>
            <button 
              onClick={() => setCurrentView('visitor-tablet')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Open Tablet UI
            </button>
          </div>

          <div className="space-y-3">
            {visitors.slice(0, 3).map((vis) => (
              <div 
                key={vis.id}
                className="flex items-start justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{vis.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{vis.company}</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-normal mt-1">
                    To see: <span className="font-semibold text-slate-700 dark:text-slate-300">{vis.visitingPerson}</span>
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 tracking-wider uppercase
                  ${vis.status === 'Currently Inside' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }
                `}>
                  {vis.status === 'Currently Inside' ? 'Inside' : 'Signed Out'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
