import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import AuditRenderer from './core/AuditRenderer';
import logoImg from '../../assets/logo.png';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  ClipboardList, 
  FileDown, 
  Plus, 
  Calendar,
  X
} from 'lucide-react';

const AUDIT_CATEGORIES = [
  "Meal Time Audit",
  "Monthly Medication Audit",
  "Weekly Medication Audit",
  "Care Plan Audit",
  "Dignity Audit",
  "Call Bell Audit",
  "Daily Chart Audit",
  "Fire Audit",
  "Health & Safety Audit",
  "House Keeping Cleaning Standards",
  "Infection Control Audit",
  "Kitchen Audit",
  "Mattress Audit",
  "Meal Nutrition Audit",
  "Ordering and Receipt of Medication Audit"
];

const AuditDashboard = () => {
  const { audits, submitAuditResult, scheduleAudit, employees, currentRole } = useApp();
  const [selectedAudit, setSelectedAudit] = useState(null); // Active audit being conducted or viewed
  const [isEditMode, setIsEditMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Completed', 'Pending', 'Overdue', 'Failed'
  const [selectedCategory, setSelectedCategory] = useState(null); // To filter by Category on the left
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false); // To schedule new audit

  // Form states for scheduling a new audit
  const [newAuditType, setNewAuditType] = useState(AUDIT_CATEGORIES[0]);
  const [newAuditDate, setNewAuditDate] = useState('');
  const [newAuditOfficer, setNewAuditOfficer] = useState(() => employees[0]?.id || '');

  // Summary Metrics
  const upcomingCount = audits.filter(a => a.status === 'Pending' || a.status === 'In Progress').length;
  const completedCount = audits.filter(a => a.status === 'Completed').length;
  const failedCount = audits.filter(a => a.status === 'Completed' && a.score < 90).length;
  const overdueCount = audits.filter(a => a.status === 'Overdue').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'Overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-455 animate-pulse';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400';
    }
  };

  const handleStartAudit = (audit) => {
    setIsEditMode(false);
    setSelectedAudit(audit);
  };

  const handleEditAudit = (audit) => {
    setIsEditMode(true);
    setSelectedAudit(audit);
  };

  const handleSubmitAudit = (auditId, score, details) => {
    submitAuditResult(auditId, score, details);
    setSelectedAudit(null);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!newAuditDate || !newAuditOfficer) return;
    scheduleAudit(newAuditType, newAuditDate, newAuditOfficer);
    setScheduleModalOpen(false);
  };

  // Filter Audits
  const filteredAudits = audits.filter((aud) => {
    if (statusFilter === 'Completed' && aud.status !== 'Completed') return false;
    if (statusFilter === 'Pending' && aud.status !== 'Pending' && aud.status !== 'In Progress') return false;
    if (statusFilter === 'Overdue' && aud.status !== 'Overdue') return false;
    if (statusFilter === 'Failed' && (aud.status !== 'Completed' || aud.score >= 90)) return false;
    if (selectedCategory && aud.type !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in p-1 max-w-[1600px] mx-auto">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Audit Management</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Schedule, execute, and review facility audits to maintain compliance.</p>
        </div>

        {/* Manager/Admin Actions */}
        {(currentRole === 'Admin' || currentRole === 'Compliance Officer' || currentRole === 'Manager') && (
          <button
            onClick={() => {
              setNewAuditOfficer(employees[0]?.id || '');
              setNewAuditDate(new Date().toISOString().split('T')[0]);
              setScheduleModalOpen(true);
            }}
            className="h-9 w-full sm:w-auto px-5 rounded-full text-xs font-bold bg-brand-600 hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/10 active:scale-[0.98] shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Schedule New Audit</span>
          </button>
        )}
      </div>

      {/* Render active audit execution screen */}
      <div className="space-y-5">
          
          {/* STATS OVERVIEW CARDS */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Upcoming Audits</span>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{upcomingCount}</p>
                <span className="text-[10px] text-slate-500 font-semibold">Pending & active</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-550 flex items-center justify-center dark:bg-indigo-950/20 shadow-xs shrink-0">
                <Clock className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Completed (This Month)</span>
                <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-450">{completedCount}</p>
                <span className="text-[10px] text-slate-500 font-semibold">Compliance signed off</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center dark:bg-emerald-950/20 shadow-xs shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Failed Audits</span>
                <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-455">{failedCount}</p>
                <span className="text-[10px] text-slate-500 font-semibold">Score below 90% target</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center dark:bg-rose-950/20 shadow-xs shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Overdue Audits</span>
                <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{overdueCount}</p>
                <span className="text-[10px] text-slate-500 font-semibold">Action required now</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center dark:bg-amber-950/20 shadow-xs shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* SPLIT PANE CONTAINER: Categories on Left + Log list on Right */}
          <div className="grid gap-5 lg:grid-cols-4 items-start">
            
            {/* LEFT COLUMN: Audit Categories (1/4 Width) */}
            <div className="glass-card rounded-2xl p-4 space-y-3.5 shadow-sm bg-white min-h-[500px] dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Audit Categories</h3>
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-[10px] font-bold text-brand-600 hover:text-brand-700"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              
              <div className="space-y-1.5 max-h-[540px] overflow-y-auto custom-scrollbar pr-1">
                {AUDIT_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(isActive ? null : cat)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all group relative
                        ${isActive 
                          ? 'bg-[#e9f2f0] text-[#2e6559] border-l-4 border-l-[#2e6559] shadow-sm dark:bg-slate-800 dark:text-[#4ad1b0]' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                        }
                      `}
                    >
                      <ClipboardList className={`h-4 w-4 shrink-0 transition-colors
                        ${isActive ? 'text-[#2e6559] dark:text-[#4ad1b0]' : 'text-slate-400 group-hover:text-slate-500'}
                      `} />
                      <span className="truncate flex-1 pr-6">{cat}</span>
                      
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          const newAudit = scheduleAudit(cat, new Date().toISOString().split('T')[0], employees[0]?.id || 'EMP-006');
                          if (newAudit) {
                            handleStartAudit(newAudit);
                          }
                        }}
                        title={`Start ${cat} immediately`}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-[#2e6559]/10 text-[#2e6559] hover:bg-[#2e6559] hover:text-white rounded-full h-5 w-5 flex items-center justify-center font-bold text-xs shadow-xs"
                      >
                        +
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Audit Log Schedule & History (3/4 Width) */}
            <div className="lg:col-span-3 glass-card rounded-2xl shadow-sm bg-white overflow-hidden min-h-[500px] dark:bg-slate-900">
              
              {/* Log Table Controls */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/20">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Audit Log</h3>
                  {selectedCategory && (
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Filtering category: <strong className="text-slate-600 dark:text-slate-350">{selectedCategory}</strong></p>
                  )}
                </div>
                
                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-brand-500 font-semibold dark:border-slate-850 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending / Active</option>
                    <option value="Failed">Failed Audits</option>
                    <option value="Overdue">Overdue Audits</option>
                  </select>
                </div>
              </div>

              {/* Audit logs Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-950 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Audit Type</th>
                      <th className="p-3.5">Auditor / Officer</th>
                      <th className="p-3.5">Scheduled Date</th>
                      <th className="p-3.5">Score</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                    {filteredAudits.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 font-bold">
                          No matching audits found for selected filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAudits.map((aud) => {
                        const officer = employees.find(e => e.id === aud.officerId) || employees[0];
                        const isCompleted = aud.status === 'Completed';
                        const isFailed = isCompleted && aud.score < 90;

                        return (
                          <tr key={aud.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors">
                            <td 
                              onClick={() => setSelectedAudit(aud)}
                              className="p-3.5 font-bold text-[#2e6559] hover:text-[#1f4940] hover:underline cursor-pointer max-w-[200px] truncate"
                              title="Click to view audit details"
                            >
                              {aud.type}
                            </td>
                            
                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <img src={officer.photo} alt={officer.name} className="h-6 w-6 rounded-full border border-slate-100 object-cover shrink-0" />
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-200 leading-none">{officer.name}</p>
                                  <span className="text-[8px] text-slate-400 capitalize block mt-0.5">{officer.title.split(' ')[0]}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5 text-slate-500 font-semibold">{aud.scheduledDate}</td>
                            
                            <td className="p-3.5 font-bold">
                              {isCompleted ? (
                                <span className={`text-[10px] font-extrabold ${isFailed ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-455'}`}>
                                  {aud.score}%
                                </span>
                              ) : (
                                <span className="text-slate-350">—</span>
                              )}
                            </td>

                            <td className="p-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold uppercase shrink-0 ${getStatusBadge(aud.status)}`}>
                                {isFailed ? 'Failed' : isCompleted ? 'Passed' : aud.status}
                              </span>
                            </td>

                            <td className="p-3.5 text-right pr-6">
                              <div className="flex gap-2 justify-end items-center">
                                {isCompleted ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setIsEditMode(false);
                                        setSelectedAudit(aud);
                                      }}
                                      className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 font-bold text-[10px] inline-flex items-center gap-1 transition-all shadow-sm active:scale-[0.98] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                    >
                                      <FileDown className="h-3.5 w-3.5" />
                                      <span>View Report</span>
                                    </button>
                                    <button
                                      onClick={() => handleEditAudit(aud)}
                                      className="h-7 px-2.5 rounded-lg border border-[#2e6559]/20 bg-[#2e6559]/10 hover:bg-[#2e6559]/20 text-[#2e6559] font-bold text-[10px] inline-flex items-center gap-1 transition-all shadow-sm active:scale-[0.98] dark:border-[#2e6559]/50 dark:text-[#4ad1b0] dark:hover:bg-[#2e6559]/30"
                                    >
                                      <span>Edit</span>
                                    </button>
                                  </>
                                ) : (currentRole === 'Admin' || currentRole === 'Compliance Officer' || currentRole === 'Manager') ? (
                                  <button
                                    onClick={() => handleStartAudit(aud)}
                                    className="h-7 px-3 rounded-lg bg-[#2e6559] hover:bg-[#1f4940] text-white font-bold text-[10px] transition-all shadow-sm active:scale-[0.98]"
                                  >
                                    Execute Audit
                                  </button>
                                ) : (
                                  <span className="text-slate-350 text-[10px] font-semibold italic">No actions</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      {/* Active Audit Execution Modal */}
      {selectedAudit && createPortal(
        <div className="fixed inset-0 z-[9990] bg-slate-900/60 backdrop-blur-sm p-4 md:p-8 overflow-y-auto flex justify-center items-start animate-fade-in">
          <button
            onClick={() => setSelectedAudit(null)}
            className="fixed top-4 right-4 z-[9995] h-10 w-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center font-bold shadow-md border border-slate-700/50 transition-all active:scale-95 print:hidden"
            title="Close and return to dashboard"
          >
            ✕
          </button>
          <div className="w-full max-w-[1250px] relative animate-slide-up mt-10 mb-10">
            <AuditRenderer 
              selectedAudit={selectedAudit}
              submitAuditResult={handleSubmitAudit}
              setSelectedAudit={setSelectedAudit}
              isEditMode={isEditMode}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Schedule Audit Modal */}
      {scheduleModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl glass-modal p-5 shadow-2xl relative animate-slide-up bg-white">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-brand-500" />
              <span>Schedule New Care Audit</span>
            </h3>
            
            <p className="text-xs text-slate-405 mt-1 font-medium">
              Create a scheduled audit session in the master compliance calendar roster.
            </p>

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-550 block">Select Audit Category</label>
                <select
                  value={newAuditType}
                  onChange={(e) => setNewAuditType(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-semibold"
                >
                  {AUDIT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-550 block">Scheduled Target Date</label>
                <input
                  type="date"
                  required
                  value={newAuditDate}
                  onChange={(e) => setNewAuditDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-555 block">Assign Compliance Officer</label>
                <select
                  value={newAuditOfficer}
                  onChange={(e) => setNewAuditOfficer(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-semibold"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.title})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md shadow-brand-500/10 active:scale-[0.98]"
                >
                  Schedule Audit
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default AuditDashboard;
