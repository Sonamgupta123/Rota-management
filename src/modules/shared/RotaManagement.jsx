import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
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
  Check,
  X
} from 'lucide-react';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHIFT_TYPES = ["8AM–2PM", "2PM–8PM", "8AM–8PM", "8PM–8AM"];
const ROLES = ["Care Staff Day", "Care Staff Night", "Cook", "Domestic"];

const DAY_DATE_MAP = {
  "Monday": "01 Jun 2026",
  "Tuesday": "02 Jun 2026",
  "Wednesday": "03 Jun 2026",
  "Thursday": "04 Jun 2026",
  "Friday": "05 Jun 2026",
  "Saturday": "06 Jun 2026",
  "Sunday": "07 Jun 2026"
};

const DAY_SHORT_DATE_MAP = {
  "Monday": "01 Jun",
  "Tuesday": "02 Jun",
  "Wednesday": "03 Jun",
  "Thursday": "04 Jun",
  "Friday": "05 Jun",
  "Saturday": "06 Jun",
  "Sunday": "07 Jun"
};

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
    activeEmployeeId,
    dayNotes,
    addDayNote,
    editDayNote,
    deleteDayNote,
    leave,
    setCurrentView
  } = useApp();

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState({ day: null, type: null });
  const [selectedRole, setSelectedRole] = useState("Care Staff Day");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [openShiftFormOpen, setOpenShiftFormOpen] = useState(false);

  // Day Notes states
  const [dayDetailsOpen, setDayDetailsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [coverageTableExpanded, setCoverageTableExpanded] = useState(false);

  // Form states for Add/Edit Note
  const [noteType, setNoteType] = useState("General Note");
  const [customNoteType, setCustomNoteType] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");
  const [notePriority, setNotePriority] = useState("Low");
  const [noteVisibility, setNoteVisibility] = useState("All Staff");

  // Permissions helpers
  const isReceptionist = currentRole === 'Receptionist';
  const isEmployee = currentRole === 'Employee';
  const isCompliance = currentRole === 'Compliance Officer';
  const isManager = currentRole === 'Manager';
  const isAdmin = currentRole === 'Admin';

  const canCreateNotes = isAdmin || isManager || isCompliance;
  const canEditNotes = isAdmin || isManager || isCompliance;
  const canDeleteNotes = isAdmin || isManager;

  const canViewNote = (note) => {
    if (isAdmin || isManager) return true;
    if (isCompliance && note.visibility !== 'Managers Only') return true;
    if (isEmployee && note.visibility === 'All Staff') return true;
    return false;
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    const finalType = noteType === 'Other' ? (customNoteType || 'Other') : noteType;
    const noteData = {
      type: finalType,
      title: noteTitle,
      description: noteDescription,
      priority: notePriority,
      visibility: noteVisibility
    };

    const creatorName = currentRole === 'Compliance Officer' ? 'Compliance' : currentRole;

    if (editingNote) {
      editDayNote(editingNote.id, {
        ...noteData,
        updatedBy: creatorName
      });
    } else {
      addDayNote(selectedDay, {
        ...noteData,
        createdBy: creatorName
      });
    }

    setAddNoteModalOpen(false);
  };

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
    if (role === "Care Staff Day" || role === "Cook") {
      const morningShifts = shifts.filter(s => s.day === day && s.role === role && (s.type === "8AM–2PM" || s.type === "8AM–8PM"));
      const afternoonShifts = shifts.filter(s => s.day === day && s.role === role && (s.type === "2PM–8PM" || s.type === "8AM–8PM"));
      return Math.min(morningShifts.length, afternoonShifts.length);
    }
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

  const getDayDateString = (dayName) => {
    const dates = {
      "Monday": "2026-06-01",
      "Tuesday": "2026-06-02",
      "Wednesday": "2026-06-03",
      "Thursday": "2026-06-04",
      "Friday": "2026-06-05",
      "Saturday": "2026-06-06",
      "Sunday": "2026-06-07"
    };
    return dates[dayName];
  };

  const getApprovedLeaveOnDay = (employeeId, dayName) => {
    const dateStr = getDayDateString(dayName);
    if (!dateStr || !leave) return null;
    return leave.find(l => 
      l.employeeId === employeeId && 
      l.status === 'Approved' && 
      dateStr >= l.start && 
      dateStr <= l.end
    );
  };

  // Filter days based on dayRange state
  const filteredDays = DAYS.filter(day => {
    if (dayRange === 'weekdays') return day !== 'Saturday' && day !== 'Sunday';
    if (dayRange === 'weekend') return day === 'Saturday' || day === 'Sunday';
    return true; // 'all'
  });

  const careDayVal = getStaffingCount(selectedDay, "Care Staff Day");
  const careNightVal = getStaffingCount(selectedDay, "Care Staff Night");
  const cookVal = getStaffingCount(selectedDay, "Cook");
  const domesticVal = getStaffingCount(selectedDay, "Domestic");
  const dayShifts = shifts.filter(s => s.day === selectedDay);
  const dayNotesForDay = dayNotes ? dayNotes.filter(n => n.day === selectedDay && canViewNote(n)) : [];

  // Coverage computations
  const morningShifts = dayShifts.filter(sh => sh.type === '8AM–2PM' || sh.type === '8AM–8PM');
  const afternoonShifts = dayShifts.filter(sh => sh.type === '2PM–8PM' || sh.type === '8AM–8PM');
  const eveningShifts = dayShifts.filter(sh => sh.type === '8PM–8AM');
  const totalAssignedStaffCount = new Set(dayShifts.map(s => s.employeeId)).size;

  const getSlotCoverageStatus = (count) => {
    if (count >= 3) {
      return {
        text: "Adequate Coverage",
        color: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
        dot: "bg-emerald-500"
      };
    } else if (count === 2) {
      return {
        text: "Low Coverage",
        color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
        dot: "bg-amber-500"
      };
    } else if (count === 1) {
      return {
        text: "Understaffed",
        color: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
        dot: "bg-rose-500"
      };
    } else {
      return {
        text: "Not Available",
        color: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
        dot: "bg-slate-400"
      };
    }
  };

  const morningStatus = getSlotCoverageStatus(morningShifts.length);
  const afternoonStatus = getSlotCoverageStatus(afternoonShifts.length);
  const eveningStatus = getSlotCoverageStatus(eveningShifts.length);

  const morningNames = morningShifts.map(sh => employees.find(e => e.id === sh.employeeId)?.name).filter(Boolean);
  const afternoonNames = afternoonShifts.map(sh => employees.find(e => e.id === sh.employeeId)?.name).filter(Boolean);
  const eveningNames = eveningShifts.map(sh => employees.find(e => e.id === sh.employeeId)?.name).filter(Boolean);

  return (
    <div className="space-y-5 animate-fade-in p-1 max-w-[1600px] mx-auto relative min-h-[calc(100vh-120px)]">
      
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
                className="h-9 px-4 rounded-xl text-sm font-semibold bg-brand-50 text-brand-600 border border-brand-200 hover:bg-brand-100 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900/50 transition-all flex items-center gap-1.5 shadow-sm"
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

                    const dayNotesForDay = dayNotes.filter(n => n.day === day && canViewNote(n));
                    const hasNotes = dayNotesForDay.length > 0;

                    return (
                      <th 
                        key={day} 
                        onClick={() => {
                          if (currentRole !== 'Receptionist') {
                            setSelectedDay(day);
                            setDayDetailsOpen(true);
                          }
                        }}
                        className={`p-2.5 border-r border-slate-100 dark:border-slate-900 font-sans min-w-[160px] align-top text-left space-y-1.5 select-none
                          ${currentRole !== 'Receptionist' ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors' : ''}
                        `}
                      >
                        <div className="border-b border-slate-100 dark:border-slate-900 pb-1 mb-1">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                              {day}
                            </span>
                            <span className="text-[10px] font-normal text-slate-400">
                              {DAY_SHORT_DATE_MAP[day]}
                            </span>
                          </div>
                          {hasNotes ? (
                            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/30 px-1.5 py-0.5 rounded-md border border-brand-100 dark:border-brand-900/40 w-fit">
                              <span>📌</span>
                              <span>{dayNotesForDay.length} {dayNotesForDay.length === 1 ? 'Note' : 'Notes'}</span>
                            </div>
                          ) : (
                            <div className="mt-1 h-[18px]" />
                          )}
                        </div>
                        
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
                            {/* Shift Target & Assigned Indicator */}
                            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 pb-1 border-b border-slate-50 dark:border-slate-900/50 mb-1.5 select-none">
                              <span>Target: 3</span>
                              <span className={`px-1.5 py-0.5 rounded-md ${
                                cellShifts.length >= 3 
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450'
                              }`}>
                                {cellShifts.length}/3
                              </span>
                            </div>

                            {cellShifts.map((sh) => {
                              const emp = employees.find(e => e.id === sh.employeeId);
                              if (!emp) return null;
                              
                              // Check if employee is on leave on this day
                              const approvedLeave = getApprovedLeaveOnDay(emp.id, day);

                              return (
                                <div 
                                  key={sh.id}
                                  onClick={(e) => e.stopPropagation()} // Stop modal trigger
                                  className="relative flex flex-col gap-1 rounded-lg border border-slate-100 dark:border-slate-850 p-1.5 shadow-sm bg-white dark:bg-slate-900/80 text-[10px] font-medium transition-all hover:shadow-md"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 overflow-hidden font-sans">
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

                                  {/* Approved Leave indicator */}
                                  {approvedLeave && (
                                    <div className="mt-0.5 flex items-center justify-center gap-1 bg-amber-50/70 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30 rounded-md py-0.5 px-1 text-[8px] font-extrabold select-none">
                                      <span>🏝️ On Leave ({approvedLeave.type})</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            
                            {/* Empty state hint - ALWAYS VISIBLE */}
                            {cellShifts.length === 0 && currentRole !== 'Employee' && currentRole !== 'Receptionist' && (
                              <div className="flex h-10 items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500 hover:text-brand-600 hover:bg-brand-50/50 hover:border-brand-300 dark:hover:bg-brand-950/20 dark:hover:border-brand-800/80 transition-all cursor-pointer select-none">
                                <Plus className="h-4 w-4 mr-1 shrink-0" />
                                <span className="text-[10px] font-bold">Assign</span>
                              </div>
                            )}

                            {/* Add button inside non-empty cells - ALWAYS VISIBLE */}
                            {cellShifts.length > 0 && currentRole !== 'Employee' && currentRole !== 'Receptionist' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCellClick(day, type);
                                }}
                                className="w-full flex items-center justify-center gap-1 py-1 mt-1.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-[9px] font-bold text-slate-400 hover:text-brand-600 hover:bg-brand-50/50 hover:border-brand-300 dark:hover:bg-brand-950/20 dark:hover:border-brand-800/80 transition-all select-none"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Add Staff</span>
                              </button>
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
                className={`flex-1 text-center py-1.5 text-[11px] font-bold rounded-lg transition-all ${sidebarTab === 'vacant' ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-550 hover:text-slate-805'}`}
              >
                Vacant ({openShifts.length})
              </button>
              <button
                onClick={() => setSidebarTab('availability')}
                className={`flex-1 text-center py-1.5 text-[11px] font-bold rounded-lg transition-all ${sidebarTab === 'availability' ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-550 hover:text-slate-805'}`}
              >
                Workload Check
              </button>
              <button
                onClick={() => setSidebarTab('leaves')}
                className={`flex-1 text-center py-1.5 text-[11px] font-bold rounded-lg transition-all ${sidebarTab === 'leaves' ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-550 hover:text-slate-805'}`}
              >
                Leaves ({leave.length})
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
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{os.day}</span>
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
                          <p className="font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{emp.name}</p>
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

            {/* TAB CONTENT: Leaves */}
            {sidebarTab === 'leaves' && (
              <div className="space-y-3.5 max-h-96 overflow-y-auto custom-scrollbar pr-0.5">
                <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Leave Applications</span>
                  <button
                    onClick={() => setCurrentView('leave')}
                    className="text-[10px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 hover:underline"
                  >
                    Manage Leaves →
                  </button>
                </div>

                {leave.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-405 font-semibold">
                    No active leave records found.
                  </div>
                ) : (
                  leave.map((lv) => {
                    const emp = employees.find(e => e.id === lv.employeeId);
                    if (!emp) return null;

                    return (
                      <div 
                        key={lv.id}
                        className="rounded-xl border border-slate-100 dark:border-slate-850 p-2.5 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-1.5 hover:bg-slate-50 transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <img 
                            src={emp.photo} 
                            alt={emp.name} 
                            className="h-6 w-6 rounded-full object-cover border border-slate-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-850 dark:text-slate-100 truncate">{emp.name}</p>
                            <p className="text-[9px] text-slate-400 truncate mt-0.5">{emp.title}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-100/60 dark:border-slate-850">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-350">{lv.type}</span>
                            <span className="text-[9px] text-slate-400 block font-normal mt-0.5">
                              📅 {lv.start} to {lv.end} ({lv.days} {lv.days === 1 ? 'day' : 'days'})
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase
                            ${lv.status === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-150 dark:bg-emerald-500/10 dark:text-emerald-400' 
                              : lv.status === 'Rejected'
                                ? 'bg-red-50 text-red-700 border border-red-150 dark:bg-red-500/10 dark:text-red-400'
                                : 'bg-amber-50 text-amber-700 border border-amber-150 dark:bg-amber-500/10 dark:text-amber-400'
                            }
                          `}>
                            {lv.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Rota Assignment Quick Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:items-center animate-fade-in">
          <div className="w-full max-w-md rounded-2xl glass-modal p-5 shadow-2xl relative animate-slide-up bg-white max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar my-auto">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
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
                  {employees.map((emp) => {
                    const dateStr = getDayDateString(selectedCell.day);
                    const isOnLeave = leave ? leave.some(l => 
                      l.employeeId === emp.id && 
                      l.status === 'Approved' && 
                      dateStr >= l.start && 
                      dateStr <= l.end
                    ) : false;
                    return (
                      <option key={emp.id} value={emp.id} disabled={isOnLeave}>
                        {emp.name} ({emp.title}) {isOnLeave ? '🏝️ (On Leave)' : ''} - Active shifts: {shifts.filter(s => s.employeeId === emp.id).length}
                      </option>
                    );
                  })}
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:items-center animate-fade-in">
          <div className="w-full max-w-md rounded-2xl glass-modal p-5 shadow-2xl relative animate-slide-up bg-white max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar my-auto">
            <button
              type="button"
              onClick={() => setOpenShiftFormOpen(false)}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
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

      {/* Day Details Panel Modal */}
      {dayDetailsOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl relative bg-white dark:bg-slate-900 my-4 animate-slide-up">
            <button 
              onClick={() => setDayDetailsOpen(false)}
              className="absolute top-4 right-4 h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-500" />
              <span>Day Details: {selectedDay} ({DAY_DATE_MAP[selectedDay]})</span>
            </h3>

            {/* Shift Summary Section */}
            <div className="space-y-2 mt-4">
              <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Shift Summary
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex justify-between items-center px-3 py-2 rounded-xl border text-xs font-semibold ${getCoverageColor(careDayVal, getTarget("Care Staff Day"))}`}>
                  <span>Care Staff Day</span>
                  <span>{careDayVal}/{getTarget("Care Staff Day")}</span>
                </div>
                <div className={`flex justify-between items-center px-3 py-2 rounded-xl border text-xs font-semibold ${getCoverageColor(careNightVal, getTarget("Care Staff Night"))}`}>
                  <span>Care Staff Night</span>
                  <span>{careNightVal}/{getTarget("Care Staff Night")}</span>
                </div>
                <div className={`flex justify-between items-center px-3 py-2 rounded-xl border text-xs font-semibold ${getCoverageColor(cookVal, getTarget("Cook"))}`}>
                  <span>Cook</span>
                  <span>{cookVal}/{getTarget("Cook")}</span>
                </div>
                <div className={`flex justify-between items-center px-3 py-2 rounded-xl border text-xs font-semibold ${getCoverageColor(domesticVal, getTarget("Domestic"))}`}>
                  <span>Domestic</span>
                  <span>{domesticVal}/{getTarget("Domestic")}</span>
                </div>
              </div>
            </div>

            {/* Staff Coverage Overview Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 space-y-4">
              <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Staff Coverage Overview
              </h4>
              
              {/* Coverage Cards Grid */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Morning Card */}
                <div className="p-3 rounded-xl border border-slate-150 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/30 flex flex-col justify-between space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Morning Coverage</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-base font-extrabold text-slate-800 dark:text-white">{morningShifts.length} Staff</span>
                    <span className={`inline-flex items-center h-2 w-2 rounded-full ${morningStatus.dot}`} title={morningStatus.text} />
                  </div>
                </div>

                {/* Afternoon Card */}
                <div className="p-3 rounded-xl border border-slate-150 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/30 flex flex-col justify-between space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Afternoon Coverage</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-base font-extrabold text-slate-800 dark:text-white">{afternoonShifts.length} Staff</span>
                    <span className={`inline-flex items-center h-2 w-2 rounded-full ${afternoonStatus.dot}`} title={afternoonStatus.text} />
                  </div>
                </div>

                {/* Evening Card */}
                <div className="p-3 rounded-xl border border-slate-150 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/30 flex flex-col justify-between space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Evening Coverage</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-base font-extrabold text-slate-800 dark:text-white">{eveningShifts.length} Staff</span>
                    <span className={`inline-flex items-center h-2 w-2 rounded-full ${eveningStatus.dot}`} title={eveningStatus.text} />
                  </div>
                </div>

                {/* Total Card */}
                <div className="p-3 rounded-xl border border-slate-150 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/30 flex flex-col justify-between space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Assigned</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-base font-extrabold text-slate-800 dark:text-white">{totalAssignedStaffCount} Staff</span>
                    <span className="inline-flex items-center h-2 w-2 rounded-full bg-indigo-500" title="Active workforce" />
                  </div>
                </div>
              </div>

              {/* Coverage Timeline */}
              <div className="space-y-2 mt-4 bg-slate-50/20 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Coverage Timeline
                </h5>
                <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-4">
                  {/* Morning slot */}
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 border border-white dark:border-slate-900" />
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700 dark:text-slate-250">08:00 AM - 02:00 PM</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${morningStatus.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${morningStatus.dot}`} />
                          <span>{morningStatus.text}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-550 dark:text-slate-400">
                        <span className="font-bold">Assigned Staff:</span>
                        {morningNames.length === 0 ? (
                          <span className="italic ml-1">No staff assigned</span>
                        ) : (
                          <span className="ml-1">{morningNames.map((name, i) => `• ${name}`).join(' ')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Afternoon slot */}
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 border border-white dark:border-slate-900" />
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700 dark:text-slate-250">02:00 PM - 08:00 PM</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${afternoonStatus.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${afternoonStatus.dot}`} />
                          <span>{afternoonStatus.text}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-550 dark:text-slate-400">
                        <span className="font-bold">Assigned Staff:</span>
                        {afternoonNames.length === 0 ? (
                          <span className="italic ml-1">No staff assigned</span>
                        ) : (
                          <span className="ml-1">{afternoonNames.map((name, i) => `• ${name}`).join(' ')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Evening slot */}
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 border border-white dark:border-slate-900" />
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700 dark:text-slate-250">08:00 PM - 08:00 AM</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${eveningStatus.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${eveningStatus.dot}`} />
                          <span>{eveningStatus.text}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-550 dark:text-slate-400">
                        <span className="font-bold">Assigned Staff:</span>
                        {eveningNames.length === 0 ? (
                          <span className="italic ml-1">No staff assigned</span>
                        ) : (
                          <span className="ml-1">{eveningNames.map((name, i) => `• ${name}`).join(' ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Panel for Coverage Details */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCoverageTableExpanded(!coverageTableExpanded)}
                  className="w-full flex justify-between items-center text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-750 dark:hover:text-slate-200 transition-colors select-none"
                >
                  <span className="flex items-center gap-1">📊 Coverage Details Table</span>
                  <span>{coverageTableExpanded ? '▲' : '▼'}</span>
                </button>

                {coverageTableExpanded && (
                  <div className="mt-2 overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="p-2">Time Slot</th>
                          <th className="p-2 text-center">Assigned Count</th>
                          <th className="p-2">Coverage Status</th>
                          <th className="p-2">Staff Names</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="p-2 font-bold text-slate-700 dark:text-slate-350">08:00 AM - 02:00 PM</td>
                          <td className="p-2 text-center font-bold text-slate-800 dark:text-white">{morningShifts.length}</td>
                          <td className="p-2">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold border ${morningStatus.color}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${morningStatus.dot}`} />
                              <span>{morningStatus.text}</span>
                            </span>
                          </td>
                          <td className="p-2 text-slate-550 dark:text-slate-400 font-semibold">{morningNames.join(', ') || 'None'}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="p-2 font-bold text-slate-700 dark:text-slate-350">02:00 PM - 08:00 PM</td>
                          <td className="p-2 text-center font-bold text-slate-800 dark:text-white">{afternoonShifts.length}</td>
                          <td className="p-2">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold border ${afternoonStatus.color}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${afternoonStatus.dot}`} />
                              <span>{afternoonStatus.text}</span>
                            </span>
                          </td>
                          <td className="p-2 text-slate-555 dark:text-slate-400 font-semibold">{afternoonNames.join(', ') || 'None'}</td>
                        </tr>
                        <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="p-2 font-bold text-slate-700 dark:text-slate-350">08:00 PM - 08:00 AM</td>
                          <td className="p-2 text-center font-bold text-slate-800 dark:text-white">{eveningShifts.length}</td>
                          <td className="p-2">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold border ${eveningStatus.color}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${eveningStatus.dot}`} />
                              <span>{eveningStatus.text}</span>
                            </span>
                          </td>
                          <td className="p-2 text-slate-555 dark:text-slate-400 font-semibold">{eveningNames.join(', ') || 'None'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Day Notes Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <span>📌</span>
                  <span>Day Notes</span>
                </h4>
                {canCreateNotes && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNote(null);
                      setNoteType("General Note");
                      setCustomNoteType("");
                      setNoteTitle("");
                      setNoteDescription("");
                      setNotePriority("Low");
                      setNoteVisibility("All Staff");
                      setAddNoteModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-sm flex items-center gap-1 active:scale-[0.98]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Note</span>
                  </button>
                )}
              </div>

              {/* Notes List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {dayNotesForDay.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] py-4 text-center">No notes recorded for this day.</p>
                ) : (
                  dayNotesForDay.map(note => (
                    <div key={note.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-1.5 hover:shadow-xs transition-shadow">
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border 
                          ${note.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30' : 
                            note.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' : 
                            'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          {note.priority} Priority
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-400 border border-slate-200/80 dark:border-slate-800 px-1.5 py-0.5 rounded-md">
                            {note.type}
                          </span>
                          {canEditNotes && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNote(note);
                                const standardTypes = ["General Note", "Shift Note", "Management Note", "Clinical Note", "Visitor Note"];
                                if (standardTypes.includes(note.type)) {
                                  setNoteType(note.type);
                                  setCustomNoteType("");
                                } else {
                                  setNoteType("Other");
                                  setCustomNoteType(note.type);
                                }
                                setNoteTitle(note.title);
                                setNoteDescription(note.description);
                                setNotePriority(note.priority);
                                setNoteVisibility(note.visibility);
                                setAddNoteModalOpen(true);
                              }}
                              className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                            >
                              Edit
                            </button>
                          )}
                          {canDeleteNotes && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this note?")) {
                                  deleteDayNote(note.id);
                                }
                              }}
                              className="text-[10px] font-bold text-rose-600 dark:text-rose-450 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{note.title}</p>
                      {note.description && (
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed whitespace-pre-wrap">{note.description}</p>
                      )}
                      
                      <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 dark:border-slate-850 pt-1.5 mt-1.5 font-medium">
                        <span>Created by {note.createdBy}</span>
                        <span>{note.createdDate}</span>
                      </div>
                      {note.updatedBy && (
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                          <span>Updated by {note.updatedBy}</span>
                          <span>{note.updatedDate}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Staff Assignment List */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 space-y-3">
              <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Staff Assignment List
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {dayShifts.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] py-2 text-center font-medium">No staff assigned for this day.</p>
                ) : (
                  dayShifts.map(sh => {
                    const emp = employees.find(e => e.id === sh.employeeId);
                    if (!emp) return null;
                    return (
                      <div key={sh.id} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/20 dark:bg-slate-900/10 text-xs">
                        <div className="flex items-center gap-2">
                          <img src={emp.photo} alt={emp.name} className="h-6 w-6 rounded-full object-cover border border-slate-100" />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-205">{emp.name}</p>
                            <p className="text-[9px] font-semibold text-slate-400">{sh.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100/60 dark:bg-slate-900 px-2 py-0.5 rounded-lg border dark:border-slate-800">
                            {sh.type}
                          </span>
                          {(isAdmin || isManager) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove ${emp.name} from this shift?`)) {
                                  removeShift(sh.id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Staff on Approved Leave */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 space-y-3">
              <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <span>🏝️</span>
                <span>Staff on Approved Leave</span>
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {(() => {
                  const dateStr = getDayDateString(selectedDay);
                  const employeesOnLeave = leave ? leave.filter(l => 
                    l.status === 'Approved' && 
                    dateStr >= l.start && 
                    dateStr <= l.end
                  ).map(l => {
                    const emp = employees.find(e => e.id === l.employeeId);
                    return {
                      ...l,
                      empName: emp ? emp.name : 'Unknown Employee',
                      empPhoto: emp ? emp.photo : '',
                      empTitle: emp ? emp.title : ''
                    };
                  }) : [];

                  if (employeesOnLeave.length === 0) {
                    return (
                      <p className="text-slate-400 italic text-[11px] py-2 text-center font-medium">No staff on leave for this day.</p>
                    );
                  }

                  return employeesOnLeave.map(l => (
                    <div key={l.id} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-amber-50/10 dark:bg-amber-950/5 text-xs">
                      <div className="flex items-center gap-2">
                        <img src={l.empPhoto} alt={l.empName} className="h-6 w-6 rounded-full object-cover border border-slate-100" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-205">{l.empName}</p>
                          <p className="text-[9px] font-semibold text-slate-400">{l.empTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/20 px-2 py-0.5 rounded-lg border border-amber-100/50 dark:border-amber-900/30 font-bold text-[9px]">
                        <span>{l.type}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDayDetailsOpen(false)}
                className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 font-bold"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add/Edit Day Note Modal */}
      {addNoteModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:items-center animate-fade-in">
          <div className="w-full max-w-md rounded-2xl glass-modal p-5 shadow-2xl relative animate-slide-up bg-white max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar my-auto">
            <button 
              onClick={() => setAddNoteModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📌</span>
              <span>{editingNote ? 'Edit' : 'Add'} Day Note</span>
            </h3>

            <form onSubmit={handleSaveNote} className="mt-4 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Note Type</label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-semibold"
                  >
                    <option value="General Note">General Note</option>
                    <option value="Shift Note">Shift Note</option>
                    <option value="Management Note">Management Note</option>
                    <option value="Clinical Note">Clinical Note</option>
                    <option value="Visitor Note">Visitor Note</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Date</label>
                  <input
                    type="text"
                    readOnly
                    value={`${selectedDay} (${DAY_DATE_MAP[selectedDay]})`}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 font-semibold cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              {noteType === 'Other' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Specify Note Type</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maintenance Note"
                    value={customNoteType}
                    onChange={(e) => setCustomNoteType(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none focus:border-brand-500 focus:bg-white font-semibold"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GP Visit at 11 AM"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none focus:border-brand-500 focus:bg-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">Description</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Dr. Cook visiting for routine care planning audits..."
                  value={noteDescription}
                  onChange={(e) => setNoteDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white outline-none focus:border-brand-500 focus:bg-white font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Priority</label>
                  <select
                    value={notePriority}
                    onChange={(e) => setNotePriority(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block">Visibility</label>
                  <select
                    value={noteVisibility}
                    onChange={(e) => setNoteVisibility(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Managers Only">Managers Only</option>
                    <option value="Management & Compliance">Management & Compliance</option>
                    <option value="All Staff">All Staff</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAddNoteModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md shadow-brand-500/10 active:scale-[0.98]"
                >
                  Save Note
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
