import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, ChevronLeft, ChevronRight, Info } from 'lucide-react';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHIFT_TYPES = ["8AM–2PM", "2PM–8PM", "8AM–8PM", "8PM–8AM"];
const DAY_SHORT_DATE_MAP = {
  "Monday": "01 Jun",
  "Tuesday": "02 Jun",
  "Wednesday": "03 Jun",
  "Thursday": "04 Jun",
  "Friday": "05 Jun",
  "Saturday": "06 Jun",
  "Sunday": "07 Jun"
};

const RotaCalendar = () => {
  const { shifts, employees } = useApp();
  const [activeTab, setActiveTab] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'
  const [selectedDailyDay, setSelectedDailyDay] = useState('Monday');

  // Month grid variables for June 2026
  // June 1st, 2026 is a Monday. Total days = 30.
  const totalDaysInMonth = 30;
  const monthName = "June 2026";

  // Group shifts by day for easy lookups
  const getShiftsForDayOfWeek = (dayName) => {
    return shifts.filter(s => s.day === dayName);
  };

  // Helper to map calendar day index (1-30) to day of week name
  const getDayNameFromDate = (dateNum) => {
    const idx = (dateNum - 1) % 7;
    return DAYS[idx];
  };

  return (
    <div className="space-y-6 animate-fade-in p-1 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Rota Calendar</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Read-only view of daily, weekly, and monthly shift schedules</p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 shrink-0">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'daily' ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-550 hover:text-slate-900'}`}
          >
            Daily View
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'weekly' ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-550 hover:text-slate-900'}`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'monthly' ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm' : 'text-slate-550 hover:text-slate-900'}`}
          >
            Monthly View
          </button>
        </div>
      </div>

      {/* DAILY VIEW */}
      {activeTab === 'daily' && (
        <div className="grid gap-6 md:grid-cols-4 items-start">
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <span className="text-[10px] font-bold text-slate-405 block uppercase tracking-wider">Select Day</span>
            <div className="space-y-1">
              {DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDailyDay(d)}
                  className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between
                    ${selectedDailyDay === d
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 border border-brand-200 dark:border-brand-900/50'
                      : 'text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                    }
                  `}
                >
                  <span>{d}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{DAY_SHORT_DATE_MAP[d]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 glass-card rounded-2xl p-5 min-h-[350px]">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <Calendar className="h-4.5 w-4.5 text-brand-500" />
              <span>Duty Schedule: {selectedDailyDay} ({DAY_SHORT_DATE_MAP[selectedDailyDay]} Jun 2026)</span>
            </h3>

            <div className="space-y-3">
              {getShiftsForDayOfWeek(selectedDailyDay).length === 0 ? (
                <p className="text-slate-400 italic text-xs py-10 text-center">No shifts scheduled for this day.</p>
              ) : (
                getShiftsForDayOfWeek(selectedDailyDay).map(sh => {
                  const emp = employees.find(e => e.id === sh.employeeId);
                  if (!emp) return null;
                  return (
                    <div key={sh.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-900/30 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={emp.photo} alt={emp.name} className="h-8 w-8 rounded-full object-cover border" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{sh.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-bold text-slate-700 dark:text-slate-350">{sh.type}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY VIEW */}
      {activeTab === 'weekly' && (
        <div className="glass-card rounded-2xl p-5 overflow-hidden">
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-850">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 dark:bg-slate-900/60 dark:border-slate-900">
                  <th className="p-3 font-bold text-slate-500 w-32 border-r dark:border-slate-850">Timings</th>
                  {DAYS.map(day => (
                    <th key={day} className="p-3 border-r font-bold text-slate-800 dark:text-slate-200 dark:border-slate-850">
                      <div>{day}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{DAY_SHORT_DATE_MAP[day]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHIFT_TYPES.map(type => (
                  <tr key={type} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/10">
                    <td className="p-3 border-r dark:border-slate-850 font-bold text-slate-700 flex items-center gap-1.5 align-middle">
                      <Clock className="h-3.5 w-3.5 text-brand-500" />
                      <span>{type}</span>
                    </td>
                    {DAYS.map(day => {
                      const dayShifts = shifts.filter(s => s.day === day && s.type === type);
                      return (
                        <td key={day} className="p-2 border-r dark:border-slate-850 align-top min-h-[80px]">
                          <div className="space-y-1.5">
                            {/* Shift Target & Assigned Indicator */}
                            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 pb-1 border-b border-slate-50 dark:border-slate-800 mb-1 select-none">
                              <span>Target: 3</span>
                              <span className={`px-1 rounded ${
                                dayShifts.length >= 3 
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450'
                              }`}>
                                {dayShifts.length}/3
                              </span>
                            </div>

                            {dayShifts.map(sh => {
                              const emp = employees.find(e => e.id === sh.employeeId);
                              if (!emp) return null;
                              return (
                                <div key={sh.id} className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px]">
                                  <img src={emp.photo} alt={emp.name} className="h-5 w-5 rounded-full object-cover shrink-0" />
                                  <div className="truncate">
                                    <p className="font-bold text-slate-800 dark:text-slate-205 leading-none truncate">{emp.name}</p>
                                    <span className="text-[8px] text-slate-400 truncate block mt-0.5">{sh.role.split(' ')[0]}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MONTHLY VIEW */}
      {activeTab === 'monthly' && (
        <div className="glass-card rounded-2xl p-3 sm:p-5">
          <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 sm:pb-3">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>📅</span>
              <span>{monthName} Calendar View</span>
            </h3>
            <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">Birmingham Roster Active</span>
          </div>

          <div className="grid grid-cols-7 gap-1 bg-slate-100 dark:bg-slate-800 p-1 sm:p-1.5 rounded-xl text-center text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2">
            {DAYS.map(d => <div key={d} className="py-1">{d.slice(0, 3)}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
              const dateNum = idx + 1;
              const dayName = getDayNameFromDate(dateNum);
              const dayShifts = getShiftsForDayOfWeek(dayName);
              const hasShifts = dayShifts.length > 0;

              return (
                <div 
                  key={idx} 
                  className={`min-h-[62px] sm:min-h-[90px] p-1 sm:p-2 border rounded-lg sm:rounded-xl flex flex-col justify-between transition-all bg-white dark:bg-slate-900/60
                    ${hasShifts ? 'border-brand-100 dark:border-brand-900/30' : 'border-slate-100 dark:border-slate-800'}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs leading-none">{dateNum}</span>
                    {hasShifts && (
                      <span className="px-0.5 sm:px-1 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[7px] sm:text-[8px] font-black border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/40 leading-none">
                        {dayShifts.length} Sh
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 max-h-10 sm:max-h-12 overflow-y-auto mt-0.5 sm:mt-1 custom-scrollbar">
                    {dayShifts.slice(0, 2).map(sh => {
                      const emp = employees.find(e => e.id === sh.employeeId);
                      return (
                        <div key={sh.id} className="text-[7px] sm:text-[8px] font-semibold text-slate-500 dark:text-slate-400 truncate leading-tight">
                          • {emp ? emp.name.split(' ')[0] : 'Staff'} ({sh.type.split('–')[0]})
                        </div>
                      );
                    })}
                    {dayShifts.length > 2 && (
                      <div className="text-[6px] sm:text-[7px] font-bold text-brand-600 dark:text-brand-400 leading-none">
                        + {dayShifts.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RotaCalendar;
