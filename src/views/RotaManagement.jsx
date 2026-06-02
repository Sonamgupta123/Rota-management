import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  UserPlus,
  HelpCircle,
  Filter,
  Check
} from 'lucide-react';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHIFT_TYPES = ["8AM–2PM", "2PM–8PM", "8AM–8PM", "8PM–8AM"];
const ROLES = ["Care Staff Day", "Care Staff Night", "Cook", "Domestic"];

const RotaManagement = () => {
  const { 
    shifts, 
    employees, 
    openShifts, 
    addShift, 
    removeShift, 
    createOpenShift,
    claimOpenShift,
    currentRole,
    activeEmployeeId
  } = useApp();

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState({ day: null, type: null });
  const [selectedRole, setSelectedRole] = useState("Care Staff Day");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [openShiftFormOpen, setOpenShiftFormOpen] = useState(false);

  // Day filter state: 'all' | 'weekdays' | 'weekend'
  const [dayRange, setDayRange] = useState('weekdays'); 
  
  // Sidebar tab state: 'vacant' | 'availability'
  const [sidebarTab, setSidebarTab] = useState('vacant');

  // Form states for adding open shift
  const [newOpenDay, setNewOpenDay] = useState("Monday");
  const [newOpenType, setNewOpenType] = useState("8AM–2PM");
  const [newOpenRole, setNewOpenRole] = useState("Care Staff Day");
  const [newOpenReason, setNewOpenReason] = useState("");

  // Calculate staffing counts for a specific day and role
  const getStaffingCount = (day, role) => {
    return shifts.filter(s => s.day === day && s.role === role).length;
  };

  // Staffing targets
  const getTarget = (role) => {
    if (role === "Care Staff Day") return 3;
    if (role === "Care Staff Night") return 2;
    return 1; // Cook and Domestic target is 1
  };

  // Color Coding helper for ratios:
  const getCoverageColor = (count, target) => {
    if (count < target) return "text-rose-600 bg-rose-50/60 border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/40";
    if (count > target) return "text-amber-600 bg-amber-50/60 border-amber-100 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/40";
    return "text-emerald-605 bg-emerald-50/60 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
  };

  // Quick select cell click handler
  const handleCellClick = (day, type) => {
    if (currentRole === 'Employee' || currentRole === 'Receptionist') return;
    setSelectedCell({ day, type });
    setSelectedEmployeeId(employees[0]?.id || "");
    setAssignModalOpen(true);
  };

  // Submit shift assignment
  const handleAssignShift = (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    addShift(selectedCell.day, selectedCell.type, selectedEmployeeId, selectedRole);
    setAssignModalOpen(false);
  };

  // Submit Open Shift creator
  const handleCreateOpenShift = (e) => {
    e.preventDefault();
    createOpenShift(newOpenDay, newOpenType, newOpenRole, newOpenReason);
    setNewOpenReason("");
    setOpenShiftFormOpen(false);
  };

  // Filter days based on dayRange state
  const filteredDays = DAYS.filter(day => {
    if (dayRange === 'weekdays') return day !== 'Saturday' && day !== 'Sunday';
    if (dayRange === 'weekend') return day === 'Saturday' || day === 'Sunday';
    return true; // 'all'
  });

  return (
    <div className="space-y-5 animate-fade-in p-1 max-w-[1600px] mx-auto">
      
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Smart Rota Planner</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Live planning board with care safety compliance ratios</p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Day range filter tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 shrink-0">
            <button
              onClick={() => setDayRange('weekdays')}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${dayRange === 'weekdays' ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-805'}`}
            >
              Weekdays
            </button>
            <button
              onClick={() => setDayRange('weekend')}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${dayRange === 'weekend' ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-805'}`}
            >
              Weekends
            </button>
            <button
              onClick={() => setDayRange('all')}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${dayRange === 'all' ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-805'}`}
            >
              All 7 Days
            </button>
          </div>

          {/* Manager/Admin Actions */}
          {currentRole !== 'Employee' && currentRole !== 'Receptionist' && (
            <div className="flex gap-2">
              <button
                onClick={() => setOpenShiftFormOpen(true)}
                className="h-9 px-4 rounded-xl text-sm font-semibold bg-brand-50 text-brand-650 border border-brand-200 hover:bg-brand-100 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900/50 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                <span>Advertise</span>
              </button>
              <button
                onClick={() => {
                  setSelectedCell({ day: 'Monday', type: '8AM–2PM' });
                  setAssignModalOpen(true);
                }}
                className="h-9 px-4 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/10"
              >
                <Plus className="h-4 w-4" />
                <span>Assign Shift</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Board Layout Grid */}
      <div className="grid gap-5 xl:grid-cols-4 items-start w-full max-w-full min-w-0">
        
        {/* Weekly Grid (3 columns on XL screen) */}
        <div className="xl:col-span-3 space-y-4 w-full min-w-0 overflow-hidden">
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-900 shadow-md bg-white dark:bg-slate-950 w-full max-w-full">
            <table className="w-full border-collapse text-xs">
              
              {/* Daily Staffing Requirements Ratios Headers */}
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 dark:bg-slate-900/60 dark:border-slate-900">
                  <th className="p-3 text-left font-bold text-slate-500 dark:text-slate-400 w-32 border-r border-slate-100 dark:border-slate-900 align-middle text-[11px]">
                    Shift Timings
                  </th>
                  {filteredDays.map((day) => {
                    const careDay = getStaffingCount(day, "Care Staff Day");
                    const careNight = getStaffingCount(day, "Care Staff Night");
                    const cook = getStaffingCount(day, "Cook");
                    const domestic = getStaffingCount(day, "Domestic");

                    return (
                      <th key={day} className="p-2.5 border-r border-slate-100 dark:border-slate-900 font-sans min-w-[160px] align-top text-left space-y-1.5">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs block border-b border-slate-100 dark:border-slate-900 pb-1 mb-1">
                          {day}
                        </span>
                        
                        {/* Compact Inline Ratios Grid */}
                        <div className="grid grid-cols-2 gap-1">
                          <div className={`flex justify-between items-center px-1.5 py-0.5 rounded-md border text-[9px] font-bold ${getCoverageColor(careDay, getTarget("Care Staff Day"))}`} title="Care Staff Day">
                            <span>CD</span>
                            <span>{careDay}/{getTarget("Care Staff Day")}</span>
                          </div>
                          <div className={`flex justify-between items-center px-1.5 py-0.5 rounded-md border text-[9px] font-bold ${getCoverageColor(careNight, getTarget("Care Staff Night"))}`} title="Care Staff Night">
                            <span>CN</span>
                            <span>{careNight}/{getTarget("Care Staff Night")}</span>
                          </div>
                          <div className={`flex justify-between items-center px-1.5 py-0.5 rounded-md border text-[9px] font-bold ${getCoverageColor(cook, getTarget("Cook"))}`} title="Cook staffing ratio">
                            <span>CK</span>
                            <span>{cook}/{getTarget("Cook")}</span>
                          </div>
                          <div className={`flex justify-between items-center px-1.5 py-0.5 rounded-md border text-[9px] font-bold ${getCoverageColor(domestic, getTarget("Domestic"))}`} title="Domestic ratio">
                            <span>DM</span>
                            <span>{domestic}/{getTarget("Domestic")}</span>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Rota Timings Rows */}
              <tbody>
                {SHIFT_TYPES.map((type) => (
                  <tr key={type} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                    <td className="p-3 font-semibold text-slate-700 border-r border-slate-100 dark:text-slate-350 dark:border-slate-900 align-middle">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-205">{type}</span>
                      </div>
                    </td>
                    
                    {/* Days column values */}
                    {filteredDays.map((day) => {
                      const cellShifts = shifts.filter(s => s.day === day && s.type === type);
                      return (
                        <td 
                          key={day} 
                          onClick={() => handleCellClick(day, type)}
                          className={`p-2 border-r border-slate-100 dark:border-slate-900 align-top transition-colors relative group min-h-[90px]
                            ${currentRole !== 'Employee' && currentRole !== 'Receptionist' ? 'cursor-pointer hover:bg-slate-50/30 dark:hover:bg-slate-900/10' : ''}
                          `}
                        >
                          <div className="space-y-1">
                            {cellShifts.map((sh) => {
                              const emp = employees.find(e => e.id === sh.employeeId);
                              if (!emp) return null;
                              return (
                                <div 
                                  key={sh.id}
                                  onClick={(e) => e.stopPropagation()} // Stop modal trigger
                                  className="relative flex items-center justify-between gap-1 rounded-lg border border-slate-100 dark:border-slate-850 p-1.5 shadow-sm bg-white dark:bg-slate-900/80 text-[10px] font-medium transition-all hover:shadow-md"
                                >
                                  <div className="flex items-center gap-1.5 overflow-hidden">
                                    <img 
                                      src={emp.photo} 
                                      alt={emp.name} 
                                      className="h-5 w-5 rounded-full object-cover shrink-0 border border-slate-100"
                                    />
                                    <div className="truncate">
                                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate leading-none">{emp.name}</p>
                                      <span className="text-[8px] font-semibold text-slate-400 capitalize block truncate mt-0.5">{sh.role.split(' ')[0]}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Delete Shift button */}
                                  {currentRole !== 'Employee' && currentRole !== 'Receptionist' && (
                                    <button 
                                      onClick={() => removeShift(sh.id)}
                                      className="rounded-md p-0.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 opacity-0 group-hover:opacity-100 dark:hover:bg-rose-950/20 transition-all shrink-0"
                                      title="Delete Shift assignment"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                            
                            {/* Empty state hint */}
                            {cellShifts.length === 0 && currentRole !== 'Employee' && currentRole !== 'Receptionist' && (
                              <div className="flex h-9 items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-350 opacity-0 group-hover:opacity-100 dark:border-slate-800 transition-opacity">
                                <Plus className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* Rota Legend Guideline */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
            <span className="font-bold text-slate-700 dark:text-slate-300">Coverage Index:</span>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px]">Fully Staffed</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-[11px]">Understaffed</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-[11px]">Overstaffed</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold ml-auto text-[11px]">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <span>Warnings: 12h Rest & 6-Day Cap checks active.</span>
            </div>
          </div>
        </div>

        {/* Sidebar Panel: Compact & Tabbed */}
        <div className="space-y-4 w-full min-w-0">
          
          {/* Tabbed Sidebar card */}
          <div className="glass-card rounded-2xl p-4 space-y-4">
            
            {/* Header Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-0.5 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850">
              <button
                onClick={() => setSidebarTab('vacant')}
                className={`flex-1 text-center py-1.5 text-[11px] font-bold rounded-lg transition-all ${sidebarTab === 'vacant' ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-805'}`}
              >
                Vacant ({openShifts.length})
              </button>
              <button
                onClick={() => setSidebarTab('availability')}
                className={`flex-1 text-center py-1.5 text-[11px] font-bold rounded-lg transition-all ${sidebarTab === 'availability' ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-805'}`}
              >
                Workload Check
              </button>
            </div>

            {/* TAB CONTENT: Vacant Shifts */}
            {sidebarTab === 'vacant' && (
              <div className="space-y-2.5 max-h-96 overflow-y-auto custom-scrollbar pr-0.5">
                {openShifts.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                    No advertised open shifts currently.<br/>All targets met!
                  </div>
                ) : (
                  openShifts.map((os) => (
                    <div 
                      key={os.id}
                      className="rounded-xl border border-slate-100 dark:border-slate-850 p-3 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-2 hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-slate-800 dark:text-slate-105">{os.day}</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                          {os.role.split(' ')[0]}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[10px]">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{os.type}</span>
                      </div>

                      <p className="text-[9px] text-slate-400 italic">"Reason: {os.reason}"</p>

                      {/* Quick claim action */}
                      {currentRole === 'Employee' ? (
                        <button
                          onClick={() => claimOpenShift(os.id, activeEmployeeId)}
                          className="w-full h-7 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold transition-all shadow-sm active:scale-[0.98]"
                        >
                          Claim Shift
                        </button>
                      ) : currentRole !== 'Receptionist' ? (
                        <button
                          onClick={() => {
                            setSelectedCell({ day: os.day, type: os.type });
                            setSelectedRole(os.role);
                            setAssignModalOpen(true);
                          }}
                          className="w-full h-7 rounded-lg border border-brand-200 hover:bg-brand-50 dark:border-brand-900/50 text-brand-600 text-[10px] font-bold transition-all dark:text-brand-400 dark:hover:bg-brand-950/20 shadow-xs"
                        >
                          Assign Staff
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: Workload Check */}
            {sidebarTab === 'availability' && (
              <div className="space-y-2.5 max-h-96 overflow-y-auto custom-scrollbar pr-0.5">
                {employees.map((emp) => {
                  const empWeeklyShifts = shifts.filter(s => s.employeeId === emp.id);
                  const shiftCount = empWeeklyShifts.length;
                  const hoursCount = shiftCount * 8;

                  return (
                    <div key={emp.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img 
                          src={emp.photo} 
                          alt={emp.name} 
                          className="h-7 w-7 rounded-full object-cover border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-105 truncate leading-tight">{emp.name}</p>
                          <p className="text-[9px] text-slate-400 truncate mt-0.5">{emp.title.split(' ')[0]}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold block
                          ${shiftCount >= 6 
                            ? 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-450' 
                            : shiftCount >= 4
                              ? 'bg-brand-50 text-brand-700 border border-brand-100 dark:bg-brand-500/10 dark:text-brand-400'
                              : 'bg-slate-50 text-slate-600 border border-slate-100 dark:bg-slate-800 dark:text-slate-400'
                          }
                        `}>
                          {shiftCount} Sh ({hoursCount}h)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Rota Assignment Quick Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl glass-modal p-5 shadow-2xl relative animate-slide-up bg-white">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-brand-500" />
              <span>Assign Weekly Rota Shift</span>
            </h3>
            
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Select details for <strong>{selectedCell.day}</strong> timing slot <strong>{selectedCell.type}</strong>.
            </p>

            <form onSubmit={handleAssignShift} className="mt-4 space-y-4 text-xs">
              
              {/* Role select */}
              <div className="space-y-1">
                <label className="font-bold text-slate-550 block">Select Staff Function Group</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none ring-brand-500/20 focus:border-brand-500 focus:bg-white focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-semibold"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Employee list */}
              <div className="space-y-1">
                <label className="font-bold text-slate-555 block">Select Available Employee</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none ring-brand-500/20 focus:border-brand-500 focus:bg-white focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-semibold"
                >
                  <option value="" disabled>-- Choose staff member --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.title}) - Active shifts: {shifts.filter(s => s.employeeId === emp.id).length}
                    </option>
                  ))}
                </select>
              </div>

              {/* Safety checks indicators */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 rounded-xl p-3 text-[10px] text-amber-700 dark:text-amber-400 space-y-1 font-medium">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Compliance Engine Check:</span>
                </div>
                <p>1. Ensure employees maintain a 12-hour rest window between shifts.</p>
                <p>2. Maximum safe weekly threshold is 6 working shifts (48 hours).</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center gap-1 shadow-md shadow-brand-500/10 active:scale-[0.98]"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Publish Shift</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Advertise Open Shift Form Modal */}
      {openShiftFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl glass-modal p-5 shadow-2xl relative animate-slide-up bg-white">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-indigo-500" />
              <span>Advertise Open Shift Vacancy</span>
            </h3>
            
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Publish a vacant care slot for employees to claim on their portal dashboards.
            </p>

            <form onSubmit={handleCreateOpenShift} className="mt-4 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-550 block">Select Day</label>
                  <select
                    value={newOpenDay}
                    onChange={(e) => setNewOpenDay(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-semibold"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-550 block">Shift Timing</label>
                  <select
                    value={newOpenType}
                    onChange={(e) => setNewOpenType(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-semibold"
                  >
                    {SHIFT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-555 block">Required Skill Role</label>
                <select
                  value={newOpenRole}
                  onChange={(e) => setNewOpenRole(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-semibold"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-555 block">Justification Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thomas McGregor annual leave cover"
                  value={newOpenReason}
                  onChange={(e) => setNewOpenReason(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none focus:border-brand-500 focus:bg-white font-medium"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setOpenShiftFormOpen(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md shadow-brand-500/10 active:scale-[0.98]"
                >
                  Advertise Vacancy
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RotaManagement;
