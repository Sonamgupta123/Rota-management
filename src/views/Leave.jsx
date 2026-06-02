import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarDays, 
  Milestone, 
  CheckCircle, 
  XCircle, 
  Plus, 
  ArrowRight
} from 'lucide-react';

const Leave = () => {
  const { 
    leave, 
    employees, 
    applyLeaveRequest, 
    approveLeaveRequest, 
    rejectLeaveRequest,
    currentRole,
    activeEmployeeId 
  } = useApp();

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [daysCount, setDaysCount] = useState(1);
  const [reason, setReason] = useState('');

  const currentEmp = employees.find(e => e.id === activeEmployeeId) || employees[0];

  // Calculate personal holiday statistics
  const empLeaves = leave.filter(l => l.employeeId === currentEmp.id && l.status === 'Approved');
  const usedDays = empLeaves.reduce((acc, curr) => acc + curr.days, 0);
  const allowance = currentEmp.holidayAllocation || 28;
  const remainingDays = allowance - usedDays;

  // Handle leave apply submission
  const handleApply = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    applyLeaveRequest(currentEmp.id, {
      type: leaveType,
      start: startDate,
      end: endDate,
      days: Number(daysCount),
      reason
    });

    // Reset
    setStartDate('');
    setEndDate('');
    setDaysCount(1);
    setReason('');
    setApplyModalOpen(false);
  };

  // Filter leaves depending on role for privacy (RBAC)
  const visibleLeaves = currentRole === 'Employee' 
    ? leave.filter(l => l.employeeId === currentEmp.id)
    : leave;

  const visibleSummary = currentRole === 'Employee'
    ? leave.filter(l => l.employeeId === currentEmp.id && l.status === 'Approved')
    : leave.filter(l => l.status === 'Approved');

  return (
    <div className="space-y-6 animate-fade-in p-2">
      
      {/* View Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Holiday & Leave Manager</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Track holiday balance allowances, request reviews, and schedules</p>
        </div>

        {/* Leave application triggers */}
        <button
          onClick={() => setApplyModalOpen(true)}
          className="h-9 px-4 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all flex items-center gap-1.5 shadow-sm self-start active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* BALANCES DASHBOARD CARDS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-b-4 border-b-indigo-500 shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Annual Holiday Allowance</span>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{allowance} Days</p>
            <span className="text-[10px] text-slate-500 font-semibold">Total annual allocation contracted</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center dark:bg-indigo-950/20">
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-b-4 border-b-amber-500 shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Vacation Days Used</span>
            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{usedDays} Days</p>
            <span className="text-[10px] text-slate-500 font-semibold">Approved leave taken this year</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-550 flex items-center justify-center dark:bg-amber-950/20">
            <Milestone className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-b-4 border-b-emerald-500 shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Remaining Balances</span>
            <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{remainingDays} Days</p>
            <span className="text-[10px] text-slate-500 font-semibold">Free holiday pool remaining</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-505 flex items-center justify-center dark:bg-emerald-950/20">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* TWO PANEL CONTENT: Manager Approvals (RBAC) + Global Calendar list */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left Side (2 cols on MD screens): Holiday Request Registry list */}
        <div className="md:col-span-2 glass-card rounded-3xl p-5 md:p-6 space-y-4 shadow-md bg-white">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {currentRole === 'Employee' ? 'My Leave Request History' : 'Active Holiday Request Registry'}
          </h3>
          
          <div className="space-y-3">
            {visibleLeaves.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-bold">
                No leave requests filed yet.
              </div>
            ) : (
              visibleLeaves.map((lv) => {
                const emp = employees.find(e => e.id === lv.employeeId);
                if (!emp) return null;
                const isPending = lv.status === 'Pending';

                return (
                  <div 
                    key={lv.id}
                    className="rounded-2xl border border-slate-150 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5">
                        <img src={emp.photo} alt={emp.name} className="h-7 w-7 rounded-full object-cover border border-slate-100" />
                        <div>
                          <p className="font-bold text-slate-850 dark:text-slate-100">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{emp.title}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border
                        ${lv.status === 'Approved' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10' 
                          : lv.status === 'Pending'
                            ? 'bg-amber-50 text-amber-705 border-amber-250 dark:bg-amber-500/10 animate-pulse'
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10'
                        }
                      `}>
                        {lv.status}
                      </span>
                    </div>

                    <div className="border-t border-slate-150 dark:border-slate-850 pt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold">
                      <div>
                        <span>Leave Dates</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {lv.start} <ArrowRight className="h-3 w-3 inline text-slate-400" /> {lv.end}
                        </p>
                      </div>
                      <div>
                        <span>Duration & Reason</span>
                        <p className="font-bold text-slate-850 dark:text-slate-200 mt-0.5">
                          {lv.days} Days ({lv.type})
                        </p>
                        <p className="text-[9px] text-slate-400 font-semibold italic">"{lv.reason}"</p>
                      </div>
                    </div>

                    {/* Manager approval toggles */}
                    {isPending && (currentRole === 'Admin' || currentRole === 'HR' || currentRole === 'Manager') && (
                      <div className="flex gap-2 pt-2 border-t border-slate-150 dark:border-slate-850">
                        <button
                          onClick={() => rejectLeaveRequest(lv.id)}
                          className="flex-1 h-8 rounded-lg border border-red-200 hover:bg-rose-50 hover:text-rose-600 font-bold text-[10px] flex items-center justify-center gap-1 dark:border-red-900/40 dark:hover:bg-red-950/20 transition-all active:scale-[0.98]"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Decline Request</span>
                        </button>
                        <button
                          onClick={() => approveLeaveRequest(lv.id)}
                          className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-sm transition-all active:scale-[0.98]"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve Leave</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side (1 col on MD screens): Holiday Schedule summary widget */}
        <div className="glass-card rounded-3xl p-5 space-y-4 shadow-md bg-white">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {currentRole === 'Employee' ? 'My Approved Vacations' : 'Vacation Calendar Summary'}
            </h3>
            <p className="text-[10px] text-slate-450 font-bold mt-0.5">
              {currentRole === 'Employee' ? 'Your approved roster rest dates' : 'Total roster leave status'}
            </p>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
            {visibleSummary.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                No approved holidays yet.
              </div>
            ) : (
              visibleSummary.map((lv) => {
                const emp = employees.find(e => e.id === lv.employeeId);
                if (!emp) return null;

                return (
                  <div key={lv.id} className="flex gap-2.5 text-xs items-start p-1 rounded-lg hover:bg-slate-50 transition-all">
                    <img src={emp.photo} alt={emp.name} className="h-7 w-7 rounded-full object-cover border shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{emp.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{lv.start} to {lv.end}</p>
                      <span className="inline-block bg-indigo-50 border border-indigo-100 text-[9px] font-extrabold text-indigo-700 px-1.5 py-0.2 rounded mt-1.5 dark:bg-indigo-950/20 dark:border-indigo-900/40">
                        {lv.type}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Apply Leave request Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl glass-modal p-6 shadow-2xl relative animate-slide-up bg-white">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-brand-500" />
              <span>Submit Leave Application</span>
            </h3>
            
            <p className="text-xs text-slate-400 mt-1 font-medium">
              File a digital holiday request. Balance deduction is applied only upon manager validation.
            </p>

            <form onSubmit={handleApply} className="mt-4 space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-550 block">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-850 dark:bg-slate-900 dark:text-white font-semibold"
                >
                  <option value="Annual Leave">Annual Leave (Holiday pool)</option>
                  <option value="Sick Leave">Sick Leave (Statutory check)</option>
                  <option value="Compassionate Leave">Compassionate Leave</option>
                  <option value="Maternity / Paternity">Maternity / Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-550 block">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-850 dark:bg-slate-900 dark:text-white font-semibold"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-550 block">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-850 dark:bg-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-555 block">Total Working Days Count</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={remainingDays > 0 ? remainingDays : 30}
                  value={daysCount}
                  onChange={(e) => setDaysCount(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-850 dark:bg-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-555 block">Leave justification Reason</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe justification (e.g., family summer holiday, medical checkup)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-850 dark:bg-slate-900 dark:text-white outline-none focus:border-brand-500 focus:bg-white font-medium"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-805 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-md shadow-brand-500/10 active:scale-[0.98]"
                >
                  Submit Request
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Leave;
