import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CalendarDays, 
  Milestone, 
  FileCheck, 
  Sparkles, 
  Coffee 
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { 
    employees, 
    activeEmployeeId, 
    shifts, 
    openShifts, 
    leave, 
    documents, 
    setCurrentView,
    clockState,
    setClockState,
    handleClockIn,
    handleClockOut,
    handleStartBreak,
    handleEndBreak
  } = useApp();

  const currentEmp = employees.find(e => e.id === activeEmployeeId) || employees[0];
  const [dashLocation, setDashLocation] = React.useState('Oakfield care home');
  const empShifts = shifts.filter(s => s.employeeId === currentEmp.id);
  const empDocs = documents[currentEmp.id] || [];
  
  // Dynamic stats
  const nextShift = empShifts[0]; // Assuming first shift is next
  const totalOpen = openShifts.length;
  
  const empLeaves = leave.filter(l => l.employeeId === currentEmp.id && l.status === 'Approved');
  const usedDays = empLeaves.reduce((acc, curr) => acc + curr.days, 0);
  const allowance = currentEmp.holidayAllocation || 28;
  const remainingDays = allowance - usedDays;

  // Running clock timer incrementer
  React.useEffect(() => {
    let interval = null;
    if (clockState.status !== 'Clocked Out') {
      interval = setInterval(() => {
        setClockState(prev => ({
          ...prev,
          timer: prev.timer + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [clockState.status]);

  const formatTimer = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Dynamic Grid: Greeting Banner + Punch Clocker side-by-side */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Greeting Banner (Left 2 columns) */}
        <div className="md:col-span-2 rounded-3xl bg-gradient-to-r from-brand-800 to-indigo-700 p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-[0.15]">
            <Sparkles className="h-32 w-32" />
          </div>
          
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500 border border-brand-400 text-[10px] font-bold tracking-wider uppercase">
              Oakfield Employee Portal
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold font-sans mt-3">Welcome Back, {currentEmp.name}</h2>
            <p className="text-xs text-brand-100 font-semibold mt-1">
              Role: Senior Nursing Roster | ID Reference: {currentEmp.id}
            </p>
          </div>

          <div className="flex gap-2.5 mt-5">
            <button 
              onClick={() => setCurrentView('leave')}
              className="h-9 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold text-xs border border-brand-400 transition-all active:scale-[0.98]"
            >
              Request Holiday
            </button>
          </div>
        </div>

        {/* Stateful Self-Service Clocker Widget (Right 1 column) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950 p-5 text-center flex flex-col justify-between items-center shadow-lg relative overflow-hidden min-h-[220px] transition-all duration-305">
          
          {/* Radial visual glows in background */}
          <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-900/30 blur-xl opacity-60 pointer-events-none" />
          
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-extrabold uppercase text-slate-500">
            Duty Shift Tracker
          </span>

          {/* Geographical Duty Selector Dropdown */}
          {clockState.status === 'Clocked Out' && (
            <div className="w-full max-w-[140px] mt-2">
              <select
                value={dashLocation}
                onChange={(e) => setDashLocation(e.target.value)}
                className="h-7 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 outline-none dark:border-slate-850 dark:bg-slate-900 text-slate-805 dark:text-white font-bold text-[10px] transition-all focus:border-brand-500"
              >
                <option value="Swan care home">Swan Care Home</option>
                <option value="Oakfield care home">Oakfield Care Home</option>
                <option value="Solihull hub">Solihull Hub</option>
                <option value="Birmingham medical">Birmingham Medical</option>
                <option value="Coventry clinic">Coventry Clinic</option>
              </select>
            </div>
          )}

          {/* Premium Circular Clock Face */}
          <div className="my-2 relative">
            <div 
              onClick={() => {
                if (clockState.status === 'Clocked Out') {
                  handleClockIn(currentEmp.id, dashLocation);
                } else if (clockState.status === 'On Break') {
                  handleEndBreak(currentEmp.id);
                } else if (clockState.status === 'Clocked In') {
                  handleClockOut(currentEmp.id);
                }
              }}
              className={`h-36 w-36 rounded-full flex flex-col items-center justify-center bg-white dark:bg-slate-950 shadow-md relative transition-all duration-300 cursor-pointer overflow-hidden group select-none
                ${clockState.status === 'Clocked In' 
                  ? 'shadow-emerald-500/10 hover:shadow-red-500/20' 
                  : clockState.status === 'On Break'
                    ? 'shadow-amber-500/10 hover:shadow-emerald-500/20'
                    : 'shadow-slate-300/40 hover:shadow-emerald-500/20 dark:shadow-none'
                }
              `}
            >
              {/* SVG Boundary Progress Circular Border */}
              <svg className="w-full h-full absolute inset-0 transform -rotate-90 select-none pointer-events-none scale-[1.02]" viewBox="0 0 120 120">
                {/* Background track */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="stroke-slate-100 dark:stroke-slate-900"
                  strokeWidth="6"
                  fill="transparent"
                />
                {/* Active stroke */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className={`transition-all duration-700 ease-out stroke-current
                    ${clockState.status === 'Clocked In'
                      ? 'text-emerald-500'
                      : clockState.status === 'On Break'
                        ? 'text-amber-500'
                        : 'text-slate-355 dark:text-slate-750'
                    }
                  `}
                  strokeWidth="6"
                  strokeDasharray="327"
                  strokeDashoffset={
                    clockState.status === 'Clocked In'
                      ? "32"
                      : clockState.status === 'On Break'
                        ? "100"
                        : "300"
                  }
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Inner content */}
              <div className="flex flex-col items-center justify-center z-10 px-2 text-center pointer-events-none group-hover:scale-95 transition-transform duration-200">
                <span className="text-lg font-black font-mono tracking-tight text-slate-800 dark:text-white leading-none mb-0.5">
                  {clockState.status === 'Clocked Out' ? "00:00:00" : formatTimer(clockState.timer)}
                </span>
                
                <span className={`px-2 py-0.2 rounded-full text-[7px] font-extrabold tracking-wider uppercase mt-1
                  ${clockState.status === 'Clocked In' 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                    : clockState.status === 'On Break'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }
                `}>
                  {clockState.status}
                </span>

                <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold tracking-wide mt-1 animate-pulse uppercase">
                  {clockState.status === 'Clocked Out' 
                    ? 'Tap to In' 
                    : clockState.status === 'On Break'
                      ? 'Tap to Resume'
                      : ''
                  }
                </span>
              </div>

              {/* Small Inner Break button */}
              {clockState.status === 'Clocked In' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartBreak();
                  }}
                  className="absolute bottom-3.5 h-6.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 hover:shadow-md hover:scale-105 active:scale-95 text-white font-extrabold text-[8px] uppercase flex items-center justify-center gap-1 shadow-sm transition-all z-20"
                >
                  <Coffee className="h-3 w-3" />
                  <span>Break</span>
                </button>
              )}

              {/* Red Overlay on Hover */}
              {clockState.status === 'Clocked In' && (
                <div className="absolute inset-0 bg-red-600/95 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                  <span className="text-[10px] font-black uppercase tracking-wider">Clock Out</span>
                </div>
              )}
            </div>
          </div>

          {/* Session Details */}
          {clockState.status !== 'Clocked Out' ? (
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block select-none">Started: {clockState.timeIn}</span>
          ) : (
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block select-none">Ready for shift</span>
          )}
        </div>

      </div>

      {/* THREE STATS WIDGETS */}
      <div className="grid gap-4 sm:grid-cols-3">
        
        {/* Next Shift Widget */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Scheduled Next Shift</span>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">
              {nextShift ? `${nextShift.day} - ${nextShift.type}` : 'No shifts scheduled'}
            </p>
            <span className="text-[10px] text-slate-500 font-semibold">Group Duty: {nextShift?.role || 'Rest Period'}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-550 flex items-center justify-center dark:bg-indigo-950/20">
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>

        {/* Holiday remaining widget */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Holidays Pool Remaining</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{remainingDays} Days Left</p>
            <span className="text-[10px] text-slate-500 font-semibold">{usedDays} approved days taken</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center dark:bg-emerald-950/20">
            <Milestone className="h-5 w-5" />
          </div>
        </div>

        {/* Document verification checklist status */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Compliance Checklist</span>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {empDocs.filter(d => d.complianceIndicator === 'Green').length}/19 Verified
            </p>
            <span className="text-[10px] text-slate-500 font-semibold">
              {empDocs.filter(d => d.complianceIndicator === 'Red').length} files missing
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center dark:bg-slate-800">
            <FileCheck className="h-5 w-5 animate-pulse" />
          </div>
        </div>

      </div>

      {/* TWO PANEL split */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Roster schedule list */}
        <div className="md:col-span-2 glass-card rounded-3xl p-5 md:p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-sm">My Weekly Shift Planner</h3>
            <button 
              onClick={() => setCurrentView('rota')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Calendar Board
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {empShifts.map((sh) => (
              <div 
                key={sh.id}
                className="rounded-2xl border border-slate-200/85 p-3 bg-slate-50/50 dark:bg-slate-900/30 dark:border-slate-800/85 flex flex-col justify-between text-xs transition-all hover:scale-[1.01]"
              >
                <div>
                  <p className="font-extrabold text-slate-850 dark:text-slate-100">{sh.day}</p>
                  <span className="text-[10px] text-slate-400 block font-normal mt-0.5">{sh.role}</span>
                </div>
                <span className="mt-3.5 inline-block text-center px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/25">
                  {sh.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Claims Open shifts */}
        <div className="glass-card rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-sm">Open Shifts Available</h3>
            <span className="h-5 px-1.5 rounded-full bg-red-50 text-[10px] font-bold text-red-600 flex items-center dark:bg-red-500/10">
              {totalOpen} advertised
            </span>
          </div>

          <div className="space-y-3">
            {openShifts.map((os) => (
              <div 
                key={os.id}
                className="rounded-xl border p-3 bg-slate-50/30 dark:bg-slate-900/30 text-[11px] font-medium space-y-2"
              >
                <div className="flex justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{os.day}</span>
                  <span className="text-[9px] bg-slate-100 px-1.5 py-0.2 rounded font-bold dark:bg-slate-800">{os.role}</span>
                </div>
                
                <p className="text-slate-500 font-semibold">{os.type}</p>
                <p className="text-[10px] text-slate-400 italic">"Reason: {os.reason}"</p>

                <button
                  onClick={() => setCurrentView('rota')}
                  className="w-full h-7 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all text-[10px]"
                >
                  View Scheduler to Claim
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default EmployeeDashboard;
