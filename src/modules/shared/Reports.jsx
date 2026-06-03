import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building, 
  Shield, 
  FileSpreadsheet, 
  HelpCircle,
  PiggyBank,
  CheckCircle,
  Clock,
  Compass
} from 'lucide-react';

const Reports = () => {
  const { employees, attendance } = useApp();

  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Calculate monthly stats
  const getEmployeePayroll = (empId) => {
    const logs = attendance.filter(log => log.employeeId === empId);
    let totalMinutes = 0;
    let totalBreaksMinutes = 0;

    logs.forEach(log => {
      if (log.clockOut !== 'Pending') {
        totalMinutes += 360; // 6 hrs base
        if (log.breaks.length > 0) {
          totalBreaksMinutes += log.breaks.length * 30;
        }
      }
    });

    const hoursWorked = Math.round((totalMinutes / 60) * 10) / 10;
    const breakDeductions = Math.round((totalBreaksMinutes / 60) * 10) / 10;
    const payableHours = Math.max(0, hoursWorked - breakDeductions);
    const grossPay = payableHours * 14.50;

    return {
      shiftsCount: logs.length,
      hoursWorked,
      breakDeductions,
      payableHours,
      grossPay
    };
  };

  // Compile totals across all employees
  let totalHours = 0;
  let totalCost = 0;
  let totalShifts = 0;

  employees.forEach(emp => {
    const pay = getEmployeePayroll(emp.id);
    totalHours += pay.payableHours;
    totalCost += pay.grossPay;
    totalShifts += pay.shiftsCount;
  });

  const locationHours = {
    "Swan care home": 0,
    "Oakfield care home": 0,
    "Solihull hub": 0,
    "Birmingham medical": 0,
    "Coventry clinic": 0
  };

  attendance.forEach(log => {
    if (log.clockOut !== 'Pending') {
      const loc = log.location || "Oakfield care home";
      const duration = 6; // base 6h
      const breakDeduct = log.breaks.length * 0.5;
      const payable = Math.max(0, duration - breakDeduct);
      if (loc in locationHours) {
        locationHours[loc] += payable;
      } else {
        locationHours[loc] = payable;
      }
    }
  });

  const groupCounts = {};
  employees.forEach(emp => {
    const grp = emp.group || "Care Staff Day";
    groupCounts[grp] = (groupCounts[grp] || 0) + 1;
  });

  const exportGeneralReport = () => {
    const headers = ["Employee ID", "Employee Name", "Job Title", "System Role", "Total Shifts Work", "Gross Hours (hrs)", "Break Deductions (hrs)", "Net Payable Hours", "Gross Labor Cost"];
    const rows = employees.map(emp => {
      const pay = getEmployeePayroll(emp.id);
      return [
        emp.id,
        emp.name,
        emp.title,
        emp.role,
        pay.shiftsCount,
        pay.hoursWorked,
        pay.breakDeductions,
        pay.payableHours,
        `£${pay.grossPay.toFixed(2)}`
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => {
        const str = String(val === null || val === undefined ? '' : val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AS_Care_General_Report_Insights_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Reports & Insights Registry</h2>
          <p className="text-xs text-slate-500">View real-time timesheet summaries, gross labor costs, geographical coverage, and skill matrix</p>
        </div>

        {/* Action Button */}
        <button
          onClick={exportGeneralReport}
          className="h-9 px-4 rounded-xl text-xs font-black bg-[#2e6559] hover:bg-[#234c43] text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] self-start"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export Reports Registry (.csv)</span>
        </button>
      </div>

      {/* 4 Premium Stats Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Hours & Costs */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-b-4 border-b-[#2e6559] shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Monthly Labor Cost</span>
            <p className="text-2xl font-black text-[#2e6559] dark:text-[#38a394]">£{totalCost.toFixed(2)}</p>
            <span className="text-[9px] text-slate-500 font-semibold">{totalHours} total payable hrs</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#2e6559] flex items-center justify-center dark:bg-emerald-950/20">
            <PiggyBank className="h-5 w-5" />
          </div>
        </div>

        {/* Employee Totals */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-b-4 border-b-indigo-500 shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Employee Total</span>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{employees.length} Staff</p>
            <span className="text-[9px] text-slate-500 font-semibold">{employees.filter(e => e.status === 'Active').length} active records</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center dark:bg-indigo-950/20">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Location Totals */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-b-4 border-b-amber-500 shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Locations Total</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">5 Care Homes</p>
            <span className="text-[9px] text-slate-500 font-semibold">Active duty tracking hubs</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center dark:bg-amber-950/20">
            <Building className="h-5 w-5" />
          </div>
        </div>

        {/* Role Totals */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-b-4 border-b-rose-500 shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Skill Roles Total</span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{Object.keys(groupCounts).length} Groups</p>
            <span className="text-[9px] text-slate-500 font-semibold">Roster matrix classifications</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center dark:bg-rose-950/20">
            <Shield className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs using CSS/SVG */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Geographical Hours worked Chart */}
        <div className="glass-card rounded-3xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <Compass className="h-4.5 w-4.5 text-[#2e6559] animate-pulse" />
              <span>Location Duty Clock Hours</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Estimated gross hours spent at active Care Home sites</p>
          </div>

          {/* Chart Container */}
          <div className="relative h-64 w-full flex items-end justify-between px-4 pb-10 pt-6">
            {/* Dashed Gridlines background */}
            <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none pb-10 pt-6">
              {[100, 75, 50, 25, 0].map((tick) => (
                <div key={tick} className="w-full flex items-center gap-2">
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-600 w-6 text-right">{tick}%</span>
                  <div className="grow border-t border-dashed border-slate-100 dark:border-slate-800/80" />
                </div>
              ))}
            </div>

            {/* Vertical Bar Columns */}
            {Object.entries(locationHours).map(([loc, hrs]) => {
              const maxHrs = Math.max(...Object.values(locationHours), 1);
              const barHeightPct = Math.round((hrs / maxHrs) * 100);
              const percentage = Math.min(100, Math.round((hrs / Math.max(1, totalHours)) * 100));
              const displayLoc = loc.replace(" care home", "").replace(" medical", "").replace(" clinic", "").replace(" hub", "");

              return (
                <div 
                  key={loc} 
                  className="flex-1 flex flex-col items-center group relative z-10"
                  onMouseEnter={() => setHoveredBar(loc)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Floating Glassmorphic Tooltip */}
                  <div 
                    className={`absolute bottom-full mb-3 bg-slate-900/95 dark:bg-slate-950/95 text-white text-[10px] font-black py-1.5 px-3 rounded-xl shadow-xl border border-slate-700/40 backdrop-blur-md transition-all duration-300 pointer-events-none flex flex-col items-center gap-0.5 z-30 ${
                      hoveredBar === loc ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'
                    }`}
                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                  >
                    <span className="capitalize text-slate-300 font-bold text-[9px]">{loc}</span>
                    <span className="text-[#38a394] font-black text-xs">{hrs} Hours Worked</span>
                    <span className="text-slate-400 text-[8px] font-bold">({percentage}% of entire network)</span>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-950" />
                  </div>

                  {/* Vertical Bar Container */}
                  <div className="w-8 sm:w-10 md:w-11 bg-slate-50 dark:bg-slate-800/40 rounded-t-xl h-44 flex items-end overflow-hidden relative border border-slate-100 dark:border-slate-800/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                    {/* Glowing animated bar filler */}
                    <div 
                      className="w-full bg-gradient-to-t from-[#2e6559] via-[#38a394] to-[#4ebfb0] rounded-t-lg transition-all duration-1000 ease-out origin-bottom"
                      style={{ 
                        height: animate ? `${barHeightPct}%` : '0%',
                        opacity: hoveredBar && hoveredBar !== loc ? 0.75 : 1,
                        boxShadow: '0 0 16px rgba(56, 163, 148, 0.3)'
                      }}
                    />
                  </div>

                  {/* Simple compact x-axis label */}
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center capitalize px-0.5">
                    {displayLoc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Matrix Distribution - SVG Donut Chart */}
        <div className="glass-card rounded-3xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
              <span>Operational Roles & Skill Staffing</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Staff counts across key skill group assignments</p>
          </div>

          {/* Donut layout structure */}
          {(() => {
            const totalStaff = employees.length;
            const groups = Object.entries(groupCounts);
            const C = 251.327; // Circumference for Radius = 40 (2 * pi * 40)
            
            // Map colors to categories dynamically
            const colors = [
              { stroke: '#2e6559', text: 'text-[#2e6559]', bg: 'bg-[#2e6559]' },
              { stroke: '#6366f1', text: 'text-indigo-500', bg: 'bg-indigo-500' },
              { stroke: '#f59e0b', text: 'text-amber-500', bg: 'bg-amber-500' },
              { stroke: '#f43f5e', text: 'text-rose-500', bg: 'bg-rose-500' },
              { stroke: '#8b5cf6', text: 'text-purple-500', bg: 'bg-purple-500' },
              { stroke: '#06b6d4', text: 'text-cyan-500', bg: 'bg-cyan-500' }
            ];

            let currentOffset = 0;
            const chartSegments = groups.map(([grp, count], index) => {
              const pct = count / totalStaff;
              const strokeLength = pct * C;
              const offset = currentOffset;
              currentOffset += strokeLength;
              const color = colors[index % colors.length];

              return {
                grp,
                count,
                pct: Math.round(pct * 100),
                strokeLength,
                strokeOffset: offset,
                color
              };
            });

            const activeSegment = hoveredSegment ? chartSegments.find(s => s.grp === hoveredSegment) : null;

            return (
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2 pb-1 grow">
                {/* SVG Donut Circle */}
                <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="40"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="8"
                      className="dark:stroke-slate-800/60"
                    />
                    {chartSegments.map((segment) => (
                      <circle
                        key={segment.grp}
                        cx="60"
                        cy="60"
                        r="40"
                        fill="transparent"
                        stroke={segment.color.stroke}
                        strokeWidth={hoveredSegment === segment.grp ? "12" : "9"}
                        strokeDasharray={`${segment.strokeLength} ${C}`}
                        strokeDashoffset={-segment.strokeOffset}
                        className="transition-all duration-350 cursor-pointer origin-center hover:scale-[1.01]"
                        onMouseEnter={() => setHoveredSegment(segment.grp)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        style={{
                          transformOrigin: '60px 60px',
                          strokeLinecap: 'round'
                        }}
                      />
                    ))}
                  </svg>

                  {/* Absolute Center Labels (not rotated) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
                    <span className="text-2xl font-black text-slate-800 dark:text-white transition-all duration-200">
                      {activeSegment ? activeSegment.count : totalStaff}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block leading-none">
                      {activeSegment ? 'Staff' : 'Total Staff'}
                    </span>
                    <span 
                      className={`text-[9px] font-extrabold truncate w-24 block mt-1 transition-all duration-200 uppercase ${
                        activeSegment ? activeSegment.color.text : 'text-[#2e6559] dark:text-emerald-450'
                      }`}
                    >
                      {activeSegment ? activeSegment.grp : 'Active Logged'}
                    </span>
                  </div>
                </div>

                {/* Skill Roster Legend List */}
                <div className="grow w-full max-w-xs flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {chartSegments.map((segment) => (
                    <div 
                      key={segment.grp}
                      className={`flex items-center justify-between gap-3 p-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        hoveredSegment === segment.grp 
                          ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 scale-[1.02] shadow-[0_2px_8px_rgba(0,0,0,0.04)]' 
                          : 'border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                      }`}
                      onMouseEnter={() => setHoveredSegment(segment.grp)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${segment.color.bg}`} />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate capitalize">
                          {segment.grp}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-black text-slate-800 dark:text-white block">
                          {segment.count} {segment.count === 1 ? 'Record' : 'Records'}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 leading-none">
                          {segment.pct}% of total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Compliance Help Note */}
      <div className="flex gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] text-slate-500 leading-relaxed font-semibold">
        <HelpCircle className="h-5 w-5 text-[#2e6559] shrink-0" />
        <div>
          <span className="font-bold block text-slate-850 dark:text-slate-300">Auditable Reports & Spreadsheet Policies:</span>
          <p className="mt-0.5">
            Timesheets are automatically audited against rota planning limits (12-hour rest rules, 6-day maximum consecutive work periods). Estimations are generated dynamically from mock attendance clocks at standard base care wages (£14.50/hr). Exporting saves timesheet data in universal Microsoft Excel-ready CSV formats.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
