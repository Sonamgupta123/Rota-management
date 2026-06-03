import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Pause,
  Square,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
  Timer,
  UserCheck,
  Coffee,
  HelpCircle,
  Compass,
  MapPin
} from 'lucide-react';

const Attendance = () => {
  const {
    attendance,
    employees,
    currentRole,
    clockState,
    setClockState,
    handleClockIn,
    handleClockOut,
    handleStartBreak,
    handleEndBreak,
    activeEmployeeId
  } = useApp();

  const [activeTab, setActiveTab] = useState(currentRole === 'Employee' ? 'my-clocker' : 'live'); // 'live', 'logs', 'my-clocker'
  const [simulateInside, setSimulateInside] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Oakfield care home');
  const [locationMeta, setLocationMeta] = useState({
    lat: 52.6369,
    lng: -1.1398,
    distance: 15,
    accuracy: "±5 meters",
    status: "Inside"
  });

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getLocationDetails = (locName, isInside) => {
    const coordsMap = {
      "Swan care home": { lat: 52.4862, lng: -1.8904 },
      "Oakfield care home": { lat: 52.6369, lng: -1.1398 },
      "Solihull hub": { lat: 52.4128, lng: -1.7781 },
      "Birmingham medical": { lat: 52.4815, lng: -1.9025 },
      "Coventry clinic": { lat: 52.4068, lng: -1.5197 }
    };

    const base = coordsMap[locName] || coordsMap["Oakfield care home"];

    if (isInside) {
      return {
        lat: base.lat + (Math.random() * 0.0002 - 0.0001),
        lng: base.lng + (Math.random() * 0.0002 - 0.0001),
        distance: Math.floor(Math.random() * 15 + 5), // 5 to 20m
        accuracy: "±5 meters",
        status: "Inside"
      };
    } else {
      return {
        lat: base.lat + 0.0245,
        lng: base.lng - 0.0189,
        distance: Math.floor(Math.random() * 800 + 1500), // 1500 to 2300m
        accuracy: "±18 meters",
        status: "Outside"
      };
    }
  };

  // Generate coordinates when selected location or simulation inside changes
  useEffect(() => {
    const meta = getLocationDetails(selectedLocation, simulateInside);
    setLocationMeta({
      lat: parseFloat(meta.lat.toFixed(4)),
      lng: parseFloat(meta.lng.toFixed(4)),
      distance: meta.distance,
      accuracy: meta.accuracy,
      status: meta.status
    });
  }, [selectedLocation, simulateInside]);

  const handleRefreshLocation = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const meta = getLocationDetails(selectedLocation, simulateInside);
      setLocationMeta({
        lat: parseFloat(meta.lat.toFixed(4)),
        lng: parseFloat(meta.lng.toFixed(4)),
        distance: meta.distance,
        accuracy: meta.accuracy,
        status: meta.status
      });
      setIsRefreshing(false);
    }, 600);
  };

  // Enforce privacy by auto-switching tab based on role
  useEffect(() => {
    if (currentRole === 'Employee') {
      setActiveTab('my-clocker');
    } else {
      setActiveTab('live');
    }
  }, [currentRole]);

  // Handle active running clock timer increments
  useEffect(() => {
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

  // Format running seconds timer into HH:MM:SS format
  const formatTimer = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const exportAttendanceToCSV = () => {
    const headers = ["Log ID", "Employee ID", "Employee Name", "Job Title", "Shift Date", "Clock In", "Clock Out", "Breaks Count", "Status", "Location", "Latitude", "Longitude", "Distance (m)", "Geofence Status"];
    const rows = attendance.map(log => {
      const emp = employees.find(e => e.id === log.employeeId) || { name: 'Unknown', title: 'N/A' };
      return [
        log.id,
        log.employeeId,
        emp.name,
        emp.title,
        log.date,
        log.clockIn,
        log.clockOut,
        log.breaks.length,
        log.status,
        log.location || "Oakfield care home",
        log.latitude || "",
        log.longitude || "",
        log.distance || "",
        log.geofenceStatus || ""
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
    link.setAttribute("download", `AS_Care_Attendance_Sheet_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentEmp = employees.find(e => e.id === activeEmployeeId) || employees[0];
  const myLogs = attendance.filter(log => log.employeeId === currentEmp.id);

  // Calculations for Manager dashboard
  const todayDate = new Date().toISOString().split('T')[0];
  const todayLogs = attendance.filter(a => a.date === todayDate || a.date === '2026-06-01');
  const clockedInToday = todayLogs.filter(a => a.clockOut === 'Pending').length;
  const lateArrivals = todayLogs.filter(a => a.status === 'Late').length;
  const missingClockOuts = attendance.filter(a => a.clockOut === 'Pending' && a.date !== todayDate).length;

  return (
    <div className="space-y-6 animate-fade-in p-2">

      {/* Header with Navigation tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Attendance & Time Logs</h2>
          <p className="text-xs text-slate-500">Track shifts clocks, breaks, and compliance logs</p>
        </div>

        {/* Clocker Navigation Controls */}
        {(currentRole !== 'Employee' && currentRole !== 'Receptionist') && (
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200/50 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${activeTab === 'live'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                  : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }
              `}
            >
              Live Monitor
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${activeTab === 'logs'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                  : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }
              `}
            >
              Clocks &amp; Breaks Logs
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: Live Monitor (Manager dashboard overview) */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* Manager widgets overview */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Present Right Now</span>
                <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{clockedInToday} Active</p>
                <span className="text-[10px] text-slate-400">Staff clocked-in inside building</span>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-900/60">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Late Arrivals today</span>
                <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{lateArrivals} Flagged</p>
                <span className="text-[10px] text-slate-400">Clocked-in after 08:05 AM grace</span>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-500 dark:bg-rose-950/20 dark:border-rose-900/60">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Missing Clock Outs</span>
                <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{missingClockOuts} Shifts</p>
                <span className="text-[10px] text-slate-400">Past schedules without sign-out</span>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-500 dark:bg-amber-950/20 dark:border-amber-900/60">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="glass-card rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-semibold text-sm">Active Sessions & Today's Clocks</h3>
              <div className="flex flex-col sm:flex-row gap-2.5 items-center max-w-lg w-full justify-end">
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter by staff name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
                <button
                  onClick={exportAttendanceToCSV}
                  className="h-9 px-4 rounded-xl bg-[#2e6559] hover:bg-[#234c43] text-white text-xs font-black transition-all active:scale-[0.98] shadow flex items-center gap-1.5 whitespace-nowrap"
                >
                  <FileText className="h-4 w-4" />
                  <span>Export Attendance (.csv)</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3">Staff Employee</th>
                    <th className="p-3">Schedule Date</th>
                    <th className="p-3">Clock In</th>
                    <th className="p-3">Clock Out</th>
                    <th className="p-3">Location</th>
                    <th className="p-3 text-center">Active Breaks</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attendance
                    .filter((log) => {
                      const empName = employees.find(e => e.id === log.employeeId)?.name || "";
                      return empName.toLowerCase().includes(searchQuery.toLowerCase());
                    })
                    .map((log) => {
                      const emp = employees.find(e => e.id === log.employeeId);
                      if (!emp) return null;

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="p-3 font-semibold">
                            <div className="flex items-center gap-2.5">
                              <img src={emp.photo} alt={emp.name} className="h-7 w-7 rounded-full object-cover border" />
                              <div>
                                <p className="font-bold text-slate-800 dark:text-slate-100">{emp.name}</p>
                                <span className="text-[10px] text-slate-400 block font-normal">{emp.title}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-slate-500 font-medium">{log.date}</td>
                          <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{log.clockIn}</td>
                          <td className="p-3 font-bold">
                            {log.clockOut === 'Pending' ? (
                              <span className="text-red-500 animate-pulse bg-red-50 border border-red-200 px-2 py-0.5 rounded-full dark:bg-red-500/10 dark:border-red-500/20 text-[9px] uppercase tracking-wide">
                                Clock Missing
                              </span>
                            ) : (
                              <span className="text-slate-700 dark:text-slate-300">{log.clockOut}</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800 dark:text-slate-200 capitalize block">{log.location || 'Oakfield care home'}</span>
                            {log.latitude && (
                              <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-550">
                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${log.geofenceStatus === 'Inside' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <span className="font-mono">{log.latitude}, {log.longitude}</span>
                                <span className="text-slate-400 font-semibold">({log.distance}m, {log.geofenceStatus})</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center text-slate-500 font-medium">
                            {log.breaks.length === 0 ? (
                              <span className="text-slate-400 italic">None</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold dark:bg-slate-800 dark:text-slate-400">
                                <Coffee className="h-3 w-3 text-brand-500" />
                                <span>{log.breaks.length} breaks</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase
                              ${log.status === 'On Time'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : log.status === 'Late'
                                  ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400'
                              }
                            `}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Clock & Break Logs (Complete historical view) */}
      {activeTab === 'logs' && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Full Shift Break & Clock Logs</h3>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-xs">Compliance auditable logs active</span>
              <button
                onClick={exportAttendanceToCSV}
                className="h-8 px-3 rounded-lg bg-[#2e6559] hover:bg-[#234c43] text-white text-[10px] font-black transition-all active:scale-[0.98] shadow flex items-center gap-1"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Export logs (.csv)</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {attendance.map((log) => {
              const emp = employees.find(e => e.id === log.employeeId);
              if (!emp) return null;

              return (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <img src={emp.photo} alt={emp.name} className="h-7 w-7 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{emp.name}</p>
                        <p className="text-[10px] text-slate-400">{log.date} ({log.status})</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-400">
                      ID: {log.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 dark:border-slate-800 pt-2 font-medium">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Punch Work Timings</span>
                      <p className="text-slate-700 dark:text-slate-200">
                        In: <strong className="text-emerald-600 dark:text-emerald-400">{log.clockIn}</strong> | Out: <strong className="text-slate-800 dark:text-slate-100">{log.clockOut}</strong>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 capitalize">
                        📍 Duty Location: <strong className="text-slate-700 dark:text-slate-350">{log.location || 'Oakfield care home'}</strong>
                        {log.latitude && (
                          <span className="block mt-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 normal-case">
                            🌍 Geolocation punch: <strong className="text-slate-650 dark:text-slate-300 font-mono font-black">{log.latitude}, {log.longitude}</strong> (Distance: {log.distance}m, Geofence: <strong className={log.geofenceStatus === 'Inside' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-450'}>{log.geofenceStatus}</strong>)
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Break Intervals Logged</span>
                      <div className="space-y-1">
                        {log.breaks.length === 0 ? (
                          <span className="text-slate-400 italic">No breaks claimed on this shift.</span>
                        ) : (
                          log.breaks.map((br, index) => (
                            <span key={index} className="inline-block bg-slate-100 rounded px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300 mr-1.5">
                              ☕ {br.start} - {br.end} (30 mins deduction)
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: My Clock Desk (Interactive Employee Punch timer Widget) */}
      {activeTab === 'my-clocker' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="glass-card rounded-3xl p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800/80">
            {/* Radial premium glowing designs */}
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-6 -translate-y-6 rounded-full bg-brand-500/10 dark:bg-brand-500/5 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-6 translate-y-6 rounded-full bg-brand-500/10 dark:bg-brand-500/5 blur-2xl pointer-events-none" />

            <div className="space-y-1.5 z-10 w-full flex flex-col items-center">
              <span className="px-3 py-1 rounded-full bg-brand-55/15 border border-[#2e6559]/20 text-[9px] font-black text-brand-700 dark:text-[#4ebfb0] uppercase tracking-wider">
                Self Service Clocking Desk
              </span>
              <h3 className="text-xl font-black mt-2.5 text-slate-900 dark:text-white">
                Hi, {currentEmp.name}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Register clock-ins, breaks, and outs for your scheduled duty shifts.
              </p>

              {/* Circular Timer Clock display with interactive tap actions (MOVED UP & ENLARGED) */}
              <div className="my-8 relative z-10">
                <div
                  onClick={() => {
                    if (clockState.status === 'Clocked Out') {
                      handleClockIn(currentEmp.id, selectedLocation, locationMeta);
                    } else if (clockState.status === 'On Break') {
                      handleEndBreak(currentEmp.id);
                    } else if (clockState.status === 'Clocked In') {
                      handleClockOut(currentEmp.id);
                    }
                  }}
                  className={`h-64 w-64 md:h-80 md:w-80 rounded-full flex flex-col items-center justify-center bg-white dark:bg-slate-950 shadow-2xl relative transition-all duration-305 cursor-pointer overflow-hidden group select-none
                      ${clockState.status === 'Clocked In'
                      ? 'shadow-emerald-500/10 hover:shadow-red-500/20'
                      : clockState.status === 'On Break'
                        ? 'shadow-amber-500/10 hover:shadow-emerald-500/20'
                        : 'shadow-slate-300/40 hover:shadow-emerald-500/20 dark:shadow-none'
                    }
                    `}
                >
                  {/* SVG Boundary Progress Circular Border (Teal-Green with Gap) */}
                  <svg className="w-full h-full absolute inset-0 transform -rotate-90 select-none pointer-events-none scale-[1.02]" viewBox="0 0 200 200">
                    {/* Background grey track */}
                    <circle
                      cx="100"
                      cy="100"
                      r="88"
                      className="stroke-slate-100 dark:stroke-slate-900"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    {/* Active stroke boundary */}
                    <circle
                      cx="100"
                      cy="100"
                      r="88"
                      className={`transition-all duration-700 ease-out stroke-current
                          ${clockState.status === 'Clocked In'
                          ? 'text-emerald-500'
                          : clockState.status === 'On Break'
                            ? 'text-amber-500'
                            : 'text-slate-350 dark:text-slate-700'
                        }
                        `}
                      strokeWidth="10"
                      strokeDasharray="552"
                      strokeDashoffset={
                        clockState.status === 'Clocked In'
                          ? "48"
                          : clockState.status === 'On Break'
                            ? "180"
                            : "500"
                      }
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  {/* Pulsing indicator dots */}
                  {clockState.status !== 'Clocked Out' && (
                    <div className={`absolute top-6 h-2 w-2 rounded-full animate-ping opacity-60
                        ${clockState.status === 'Clocked In' ? 'bg-emerald-500' : 'bg-amber-500'}
                      `} />
                  )}

                  {/* Inner Text and Timer */}
                  <div className="flex flex-col items-center justify-center z-10 px-6 text-center pointer-events-none group-hover:scale-95 transition-transform duration-200">
                    <Clock className={`h-6 w-6 mb-2 transition-colors
                        ${clockState.status === 'Clocked In'
                        ? 'text-emerald-500'
                        : clockState.status === 'On Break'
                          ? 'text-amber-500'
                          : 'text-slate-400'
                      }
                      `} />

                    <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none mb-1">
                      {clockState.status === 'Clocked Out' ? currentTime : formatTimer(clockState.timer)}
                    </span>

                    <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase mt-2.5
                        ${clockState.status === 'Clocked In'
                        ? 'bg-emerald-55 text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-400'
                        : clockState.status === 'On Break'
                          ? 'bg-amber-55 text-amber-700 dark:bg-amber-955/40 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }
                      `}>
                      {clockState.status}
                    </span>

                    {/* Action Hint text */}
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wide mt-2.5 animate-pulse uppercase">
                      {clockState.status === 'Clocked Out'
                        ? 'Tap to Clock In'
                        : clockState.status === 'On Break'
                          ? 'Tap to Resume'
                          : ''
                      }
                    </span>
                  </div>

                  {/* Inner Break Button specifically overlayed inside the circle */}
                  {clockState.status === 'Clocked In' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartBreak();
                      }}
                      className="absolute bottom-8 h-9 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 hover:shadow-md hover:scale-105 active:scale-95 text-white font-extrabold text-[10px] uppercase flex items-center justify-center gap-1 shadow-sm transition-all z-20"
                    >
                      <Coffee className="h-3.5 w-3.5" />
                      <span>Take Break</span>
                    </button>
                  )}

                  {/* Red Stop / Power Overlay on Hover when Clocked In */}
                  {clockState.status === 'Clocked In' && (
                    <div className="absolute inset-0 bg-red-600/95 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                      <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mb-1.5">
                        <Square className="h-6 w-6 fill-current" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider">Clock Out</span>
                      <span className="text-[9px] text-red-200 mt-0.5">Click to end session</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Geofence Status Card (Redesigned & scaled to max-w-md) */}
              <div className={`w-full max-w-md rounded-2xl border p-4 text-left transition-all duration-305 mt-2 space-y-3 ${locationMeta.status === 'Inside'
                  ? 'border-emerald-500/20 bg-emerald-50/5 dark:border-emerald-800/20 dark:bg-emerald-950/5'
                  : 'border-rose-500/20 bg-rose-50/5 dark:border-rose-800/20 dark:bg-rose-955/5'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${locationMeta.status === 'Inside' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                    <span className={`text-[10px] font-black uppercase tracking-wider ${locationMeta.status === 'Inside' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {locationMeta.status === 'Inside' ? 'Geofence Verified' : 'Geofence Alert'}
                    </span>
                  </div>
                  {clockState.status === 'Clocked Out' && (
                    <button
                      onClick={handleRefreshLocation}
                      disabled={isRefreshing}
                      className="text-[10px] font-bold text-[#2e6559] hover:text-[#234c43] dark:text-[#38a394] flex items-center gap-1 active:scale-95 disabled:opacity-50 transition-all select-none"
                    >
                      <Compass className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isRefreshing ? 'Syncing...' : 'Sync GPS'}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    {locationMeta.status === 'Inside' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>Inside Authorized Zone</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                        <span>Outside Authorized Zone</span>
                      </>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {locationMeta.status === 'Inside'
                      ? `Within range of ${selectedLocation}.`
                      : `You are ${locationMeta.distance.toLocaleString()}m away from ${selectedLocation}.`
                    }
                  </p>
                </div>

                {/* Sleek status details panel */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="text-slate-400 dark:text-slate-550 block uppercase text-[8px] font-bold">Coordinates</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{locationMeta.lat}, {locationMeta.lng}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 dark:text-slate-550 block uppercase text-[8px] font-bold">Accuracy / Range</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{locationMeta.accuracy} ({locationMeta.distance}m)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timings tracker mini widget (ONLY IF NOT CLOCKED OUT, max-w-md) */}
            {clockState.status !== 'Clocked Out' && (
              <div className="w-full space-y-3 mt-6 mb-6 z-10 max-w-md">
                <div className="grid grid-cols-2 gap-4 w-full border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase text-[8px]">Session Start</span>
                    <p className="text-slate-850 dark:text-slate-200 mt-0.5">{clockState.timeIn}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase text-[8px]">Break Deductions</span>
                    <p className="text-slate-850 dark:text-slate-200 mt-0.5">{clockState.totalBreaks} mins</p>
                  </div>
                </div>
                {clockState.latitude && (
                  <div className="w-full border border-emerald-500/20 dark:border-emerald-800/40 rounded-2xl p-3 bg-emerald-50/10 dark:bg-emerald-955/5 text-left text-xs font-semibold space-y-1">
                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-555 block uppercase tracking-wider">Logged Punch Location</span>
                    <p className="font-bold text-slate-850 dark:text-slate-200 capitalize">
                      📍 {clockState.location}
                    </p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-455 mt-0.5">
                      🌍 Coordinates: <span className="font-mono font-black">{clockState.latitude}, {clockState.longitude}</span> (Distance: {clockState.distance}m, Geofence: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{clockState.geofenceStatus}</strong>)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help & Compliance card */}
          <div className="flex gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] text-slate-500 leading-relaxed font-semibold">
            <HelpCircle className="h-5 w-5 text-brand-500 shrink-0" />
            <p>
              Your punches are automatically compared with scheduled shift rosters to register coverage. Breaks are calculated based on standard care home payroll policies (30 mins automatic deduction for shifts over 6 hours).
            </p>
          </div>

          {/* Real-time personal clock logs */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2.5">
              <h4 className="font-extrabold text-[10px] tracking-wider uppercase text-slate-400 dark:text-slate-500">My Shift Clock Logs</h4>
              <span className="text-[9px] bg-brand-50 border border-brand-200 text-brand-700 px-2 py-0.5 rounded-full font-extrabold dark:bg-brand-950/40 dark:text-brand-400 dark:border-brand-500/25">
                {myLogs.length} Sessions Logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-2 pr-2">Shift Date</th>
                    <th className="py-2 px-2">Clock In</th>
                    <th className="py-2 px-2">Clock Out</th>
                    <th className="py-2 px-2">Active Breaks</th>
                    <th className="py-2 pl-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 pr-2 font-bold text-slate-800 dark:text-slate-200">{log.date}</td>
                      <td className="py-3 px-2 font-semibold text-emerald-600 dark:text-emerald-400">{log.clockIn}</td>
                      <td className="py-3 px-2">
                        {log.clockOut === 'Pending' ? (
                          <span className="inline-flex items-center gap-1.5 text-red-500 animate-pulse font-extrabold text-[10px] uppercase">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                            Active Now
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-700 dark:text-slate-350">{log.clockOut}</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-500">
                        {log.breaks.length === 0 ? (
                          <span className="text-slate-400 dark:text-slate-500 italic">No breaks</span>
                        ) : (
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {log.breaks.length} breaks ({log.breaks.map(b => `${b.start}-${b.end}`).join(', ')})
                          </span>
                        )}
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase
                            ${log.status === 'On Time'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : log.status === 'Late'
                              ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
                          }
                          `}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Attendance;
