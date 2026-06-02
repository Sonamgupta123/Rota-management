import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  ClipboardList, 
  Search, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  FileCheck,
  FileDown,
  Plus,
  Play,
  FileText,
  User,
  Activity,
  AlertOctagon,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const AUDIT_QUESTIONS = {
  "Daily Walkaround": [
    "Are all communal lounges, dining rooms, and hallways clean, odorless, and perfectly tidy?",
    "Are corridors, fire exits, and stairwells completely free of clutter, laundry cages, and mobility hoists?",
    "Are care staff actively engaged, properly dressed in clean uniforms, and wearing their ID badges?",
    "Is the secure entry keypad fully functional and the visitor log register signed by all current guests?"
  ],
  "Monthly Medication Audit": [
    "Are all Medication Administration Records (MAR charts) audited with 100% completion and zero blanks?",
    "Is there a perfect stock count balance across all blister packs and liquid bottles with zero count errors?",
    "Are controlled drugs physically double-counted and verified against the register with double signatures?",
    "Has the monthly clinical pharmacist review of GP prescriptions been fully logged and signed off?"
  ],
  "Weekly Medication Audit": [
    "Are newly delivered medications cross-checked against GP prescriptions and signed into stock logs?",
    "Are handovers and risk assessments for new or altered dosages dual-verified by senior charge nurses?",
    "Are controlled drug registers checked for mathematical errors with dual witness logs weekly?",
    "Are any near-miss logs or minor medication admin errors reviewed with action plans signed off?"
  ],
  "Storage of Medication Audit": [
    "Are clinical fridges locked and logged daily within the mandatory temperature range of 2°C to 8°C?",
    "Are medication trolleys securely anchored to wall brackets via combination locks when not in use?",
    "Are clinical treatment rooms locked, secure, and maintained within safe limits (under 25°C)?",
    "Are expired, damaged, or pharmacy-return medications stored securely inside the double-locked waste bins?"
  ],
  "Daily Care Notes Audit": [
    "Are daily care and progress notes written and signed within 1 hour of care delivery for all residents?",
    "Is the written language respectful, objective, person-centered, and focused on resident strengths?",
    "Are food, fluid, and target nutrition charts completed accurately post-delivery for flagged residents?",
    "Are repositioning sheets, behavior charts, and clinical observations signed and verified on schedule?"
  ],
  "Meal Time Audit": [
    "Is dining support provided with dignity, at the resident's pace, and tailored to nutritional preferences?",
    "Are modified texture and pureed dishes prepared precisely according to individual IDDSI target stages?",
    "Are special plates, weighted cutlery, and assistive drinking cups provided for independent eating?",
    "Are exact fluid intakes and food percentages logged in the digital portal immediately after meal service?"
  ],
  "Infection Control Audit": [
    "Are clinical PPE stations (aprons, gloves, sanitizers) fully stocked outside every resident bedroom?",
    "Are yellow clinical waste bags and general domestic bags segregated, tied, and disposed of appropriately?",
    "Are hand wash stations clean, active, and stocked with paper towels and clinical soap dispensers?",
    "Has laundry thermal disinfection cycles met strict compliance (minimum 65°C for 10 mins or 71°C for 3 mins)?"
  ],
  "Care Plan Audit": [
    "Have all resident care plans been reviewed, validated, and signed off in the last 30 calendar days?",
    "Are clinical assessment logs (MUST weight checks, Waterlow pressure checks, Falls risk) completely up-to-date?",
    "Are DNACPR status forms, GP medical letters, and family consent signatures kept in the front of files?",
    "Are the resident's life history, cultural wishes, and active social goals fully customized and logged?"
  ],
  "Dignity Audit": [
    "Do carers consistently knock, state their name, and wait for permission before entering resident rooms?",
    "Are privacy curtains fully drawn and bedroom doors closed before any personal care task is conducted?",
    "Are residents dressed in clean, personal, and coordinated clothing matching their dignity preferences?",
    "Do staff speak to residents with warmth, using preferred honorifics, and avoid patronizing language?"
  ],
  "Fire Audit": [
    "Are all designated fire doors, exit paths, and fire assembly points completely free of obstructions?",
    "Have fire alarm panels, emergency lighting, and smoke detectors passed their weekly activation checks?",
    "Are all fire extinguishers, hoses, and fire blankets mounted, pressurized, and in-date for testing?",
    "Are personal emergency evacuation plans (PEEPs) present and updated for all current residents?"
  ],
  "Service User Finance Audit": [
    "Are resident petty cash tins balanced daily against ledgers with dual nursing signatures?",
    "Are clear purchase receipts physically present for every coin spent on behalf of a resident?",
    "Are personal allowance ledgers up-to-date with zero balancing errors or unaccounted items?",
    "Is cash stored in the secure office safe with strictly controlled, logged key access protocols?"
  ],
  "Health & Safety Audit": [
    "Are LOLER hoists, passenger lifts, and bathroom slings tagged and in-date for their 6-month safety checks?",
    "Are hot water TMV safety valves tested and regulating tap water below the scalp hazard threshold of 43°C?",
    "Are COSHH chemical cleaning fluids locked securely in secure cupboards with up-to-date safety data sheets?",
    "Are corridors and communal flooring transitions completely free of tears, loose mats, or spill hazards?"
  ],
  "Pressure Mattress Audit": [
    "Are dynamic alternating air mattresses plugged in, switched on, and working on their continuous cycles?",
    "Is the dynamic mattress pressure dial calibrated precisely to match the resident's current weight?",
    "Are backup battery packs and emergency power failure alarms verified as fully functional?",
    "Are mattress top covers intact, clean, and checked for internal fluid ingress or zip failure?"
  ],
  "Pressure Cushion Audit": [
    "Are pressure-relieving seat cushions correctly oriented, positioned, and inflated in resident armchairs?",
    "Are cushions clean, intact, and regularly inspected for foam compression or gel leaks?",
    "Is the cushion specification aligned with the resident's Waterlow score and skin integrity plan?",
    "Are carers checking skin integrity and signing repositioning charts after seating sessions?"
  ],
  "Call Bell Audit": [
    "Are call bell handsets physically placed in the hands or immediate reach of all bed or chair-bound residents?",
    "Are call bell buttons, lights, and room indicator boards checked and registering correctly?",
    "Are bathroom and wet-room orange emergency pull cords dangling fully to the floor level?",
    "Are call response reports audited weekly to verify average response times are below 3 minutes?"
  ],
  "Sensor Mat Audit": [
    "Are bed and floor pressure sensor mats plugged into call points, turned on, and actively armed?",
    "Are mats clean, flat under sheets, and free from dangerous creasing, tears, or slipping hazards?",
    "Are mat alarm control boxes loaded with functional batteries showing active green status lights?",
    "Are sensor mat alarm triggers tested and verified as operational at the start of every care shift?"
  ],
  "Bed Rail Audit": [
    "Are bed rail risk assessments fully signed by MDT, in-date, and agreed upon with resident families?",
    "Are bed rail bumper pads securely fitted with zero gaps to prevent resident entrapment or injury?",
    "Are bed rail lock clamps securely tightened to the bed frame with no mechanical play?",
    "Are 2-hourly night-time safety checks logged consistently in care records by night roster staff?"
  ],
  "Nutrition & Hydration Audit": [
    "Are MUST nutritional screenings updated monthly and resident weights logged with zero gaps?",
    "Are fluid intake target logs complete for residents flagged with dehydration risk?",
    "Is fresh drinking water placed within reach and refreshed twice daily in all resident bedrooms?",
    "Are weekly weights logged and clinical alerts raised for any resident showing rapid drops?"
  ],
  "Dementia Friendly Environment Audit": [
    "Are bedroom doors fitted with high-contrast, personalized name plates and clear photo icons?",
    "Is communal bathroom and lounge signage clear, highly visible, and using pictorial symbols?",
    "Is there high-contrast, shadow-free lighting in corridors and doorways to prevent resident falls?",
    "Are large communal clocks, digital calendars, and visual schedules up-to-date and highly visible?"
  ],
  "Complaints Audit": [
    "Are all complaints recorded in the central register with precise entry dates and reference codes?",
    "Are formal acknowledgment letters drafted and sent to families within the 3-working-day target?",
    "Are full investigation reports, statements, and response drafts archived in the audit file?",
    "Are monthly root-cause analyses conducted and lessons learned shared with the clinical team?"
  ],
  "Compliment Audit": [
    "Are thank-you letters, emails, and cards scanned, registered, and filed in the registry?",
    "Are compliments shared openly on staff boards and celebrated during morning handovers?",
    "Are care staff nominated for monthly excellence awards backed by compliment logs?",
    "Are compliments categorized by department for monthly feedback metrics?"
  ],
  "Accident & Incident Audit": [
    "Are all resident falls, trips, and accidents logged in the incident register within 2 hours?",
    "Are 24-hour neurological observations checklists completed for all resident head impacts?",
    "Are monthly falls maps updated to analyze environmental triggers (lighting, footwear, times)?",
    "Have RIDDOR or CQC notifications been filed, tracked, and signed off for all severe incidents?"
  ]
};

const Compliance = () => {
  const { audits, submitAuditResult, scheduleAudit, employees, currentRole } = useApp();
  const [selectedAudit, setSelectedAudit] = useState(null); // Active audit being conducted
  const [auditAnswers, setAuditAnswers] = useState({});
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Completed', 'Pending', 'Overdue', 'Failed'
  const [selectedCategory, setSelectedCategory] = useState(null); // To filter by Category on the left
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false); // To schedule new audit

  // Form states for scheduling a new audit
  const [newAuditType, setNewAuditType] = useState('Daily Walkaround');
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
    setSelectedAudit(audit);
    const questions = AUDIT_QUESTIONS[audit.type] || AUDIT_QUESTIONS["Daily Walkaround"];
    const initialAnswers = {};
    questions.forEach((q, i) => {
      initialAnswers[i] = true;
    });
    setAuditAnswers(initialAnswers);
  };

  const handleAnswerToggle = (idx, value) => {
    setAuditAnswers(prev => ({
      ...prev,
      [idx]: value
    }));
  };

  const handleSubmitAudit = (e) => {
    e.preventDefault();
    const questions = AUDIT_QUESTIONS[selectedAudit.type] || AUDIT_QUESTIONS["Daily Walkaround"];
    const totalQuestions = questions.length;
    const yesAnswers = Object.values(auditAnswers).filter(Boolean).length;
    const score = Math.round((yesAnswers / totalQuestions) * 100);

    submitAuditResult(selectedAudit.id, score);
    setSelectedAudit(null);
  };

  // Handle scheduling submit
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!newAuditDate || !newAuditOfficer) return;
    
    scheduleAudit(newAuditType, newAuditDate, newAuditOfficer);
    setScheduleModalOpen(false);
  };

  // Filter Roster Log List
  const filteredAudits = audits.filter((aud) => {
    // 1. Status Filter
    if (statusFilter === 'Completed' && aud.status !== 'Completed') return false;
    if (statusFilter === 'Pending' && aud.status !== 'Pending' && aud.status !== 'In Progress') return false;
    if (statusFilter === 'Overdue' && aud.status !== 'Overdue') return false;
    if (statusFilter === 'Failed' && (aud.status !== 'Completed' || aud.score >= 90)) return false;

    // 2. Left Category Selector Filter
    if (selectedCategory && aud.type !== selectedCategory) return false;

    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in p-1 max-w-[1600px] mx-auto">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-105 dark:border-slate-800/80 pb-4">
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
            className="h-9 px-5 rounded-full text-xs font-bold bg-[#2e6559] hover:bg-[#1f4940] text-white transition-all flex items-center gap-1.5 shadow-md shadow-[#2e6559]/10 active:scale-[0.98] shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Schedule New Audit</span>
          </button>
        )}
      </div>

      {/* Interactive Audit Sheet Form overlays when conducting audit */}
      {selectedAudit ? (
        <div className="max-w-2xl mx-auto glass-card rounded-3xl p-6 md:p-8 space-y-6 relative animate-slide-up bg-white">
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-[10px] font-bold text-brand-700 dark:bg-brand-950/40 dark:text-brand-400">
                Live Session Audit
              </span>
              <h3 className="text-xl font-black mt-2 text-slate-900 dark:text-white">{selectedAudit.type}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">ID: {selectedAudit.id} | Date: {selectedAudit.scheduledDate}</p>
            </div>
            <button
              onClick={() => setSelectedAudit(null)}
              className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors"
            >
              Cancel Audit
            </button>
          </div>

          <form onSubmit={handleSubmitAudit} className="space-y-5 text-xs">
            <div className="space-y-4">
              {(AUDIT_QUESTIONS[selectedAudit.type] || AUDIT_QUESTIONS["Daily Walkaround"]).map((q, idx) => (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30 space-y-3"
                >
                  <p className="font-bold text-slate-850 dark:text-slate-100 text-sm leading-relaxed">{q}</p>
                  
                  <div className="flex gap-4 font-bold">
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        checked={auditAnswers[idx] === true}
                        onChange={() => handleAnswerToggle(idx, true)}
                        className="h-4.5 w-4.5 accent-emerald-600"
                      />
                      <span className="text-emerald-650 group-hover:text-emerald-500 transition-colors">YES / Pass</span>
                    </label>
                    
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        checked={auditAnswers[idx] === false}
                        onChange={() => handleAnswerToggle(idx, false)}
                        className="h-4.5 w-4.5 accent-rose-600"
                      />
                      <span className="text-rose-650 group-hover:text-rose-500 transition-colors">NO / Fail</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 flex gap-3 text-emerald-800 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <span className="font-bold block text-slate-900 dark:text-white">Submit Compliance Report</span>
                <p className="text-[10px] leading-relaxed mt-0.5 font-medium">
                  Submitting this audit registers the results immediately inside reports. Unresolved failures automatically raise high priority notifications to Manager Dashboards.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-805 font-bold"
              >
                Go Back
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold flex items-center gap-1 shadow-md shadow-brand-500/10 active:scale-[0.98]"
              >
                <span>Save & Submit Audit</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Standard split-pane dashboard
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
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Failed Audits</span>
                <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-450">{failedCount}</p>
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
            <div className="glass-card rounded-2xl p-4 space-y-3.5 shadow-sm bg-white min-h-[500px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
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
              
              {/* Category scroll deck */}
              <div className="space-y-1.5 max-h-[540px] overflow-y-auto custom-scrollbar pr-1">
                {Object.keys(AUDIT_QUESTIONS).map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(isActive ? null : cat)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all group
                        ${isActive 
                          ? 'bg-brand-50 text-brand-750 border-l-4 border-l-brand-600 shadow-sm dark:bg-slate-900' 
                          : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-900'
                        }
                      `}
                    >
                      <ClipboardList className={`h-4 w-4 shrink-0 transition-colors
                        ${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-500'}
                      `} />
                      <span className="truncate flex-1">{cat}</span>
                      
                      {/* Interactive hover quick execution tag */}
                      {(currentRole === 'Admin' || currentRole === 'Compliance Officer') && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            const mockAudit = { id: `AUD-MOCK-${Math.floor(Math.random()*100)}`, type: cat, scheduledDate: "Immediate", status: "In Progress" };
                            handleStartAudit(mockAudit);
                          }}
                          className="opacity-0 group-hover:opacity-100 shrink-0 h-5 w-5 bg-brand-50 hover:bg-brand-100 text-brand-600 flex items-center justify-center rounded-md transition-opacity shadow-xs"
                          title={`Launch ${cat} instantly`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Audit Log Schedule & History (3/4 Width) */}
            <div className="lg:col-span-3 glass-card rounded-2xl shadow-sm bg-white overflow-hidden min-h-[500px]">
              
              {/* Log Table Controls */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/20">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Audit Log</h3>
                  {selectedCategory && (
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Filtering category: <strong className="text-slate-600">{selectedCategory}</strong></p>
                  )}
                </div>
                
                {/* Status Dropdown selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Filter Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-brand-500 font-semibold dark:border-slate-850 dark:bg-slate-900 dark:text-white"
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
                    <tr className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900 dark:border-slate-900 text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Audit Type</th>
                      <th className="p-3.5">Auditor / Officer</th>
                      <th className="p-3.5">Scheduled Date</th>
                      <th className="p-3.5">Score</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-semibold text-slate-700 dark:text-slate-300">
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
                          <tr key={aud.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-[200px] truncate">{aud.type}</td>
                            
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
                                <span className={`text-[10px] font-extrabold ${isFailed ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-450'}`}>
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
                              {isFailed ? (
                                <button
                                  onClick={() => alert(`🚨 Action Plan Raised: Corrective tasks generated for failed ${aud.type}. Check settings logs.`)}
                                  className="h-7 px-3 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-650 font-bold text-[10px] transition-all shadow-sm active:scale-[0.98]"
                                >
                                  Action Plan
                                </button>
                              ) : isCompleted ? (
                                <button
                                  onClick={() => alert(`Report PDF generated: ${aud.type} summary - Score: ${aud.score}%`)}
                                  className="h-7 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 font-bold text-[10px] inline-flex items-center gap-1 transition-all shadow-sm active:scale-[0.98]"
                                >
                                  <FileDown className="h-3.5 w-3.5" />
                                  <span>View Report</span>
                                </button>
                              ) : (currentRole === 'Admin' || currentRole === 'Compliance Officer' || currentRole === 'Manager') ? (
                                <button
                                  onClick={() => handleStartAudit(aud)}
                                  className="h-7 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] transition-all shadow-sm active:scale-[0.98]"
                                >
                                  Execute Audit
                                </button>
                              ) : (
                                <span className="text-slate-350 text-[10px] font-semibold italic">No actions</span>
                              )}
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
      )}

      {/* Schedule Audit Modal (Admin/Officer access) */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl glass-modal p-5 shadow-2xl relative animate-slide-up bg-white">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-brand-500" />
              <span>Schedule New Care Audit</span>
            </h3>
            
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Create a scheduled audit session in the master compliance calendar roster.
            </p>

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4 text-xs">
              
              {/* Audit Type selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-550 block">Select Audit Category</label>
                <select
                  value={newAuditType}
                  onChange={(e) => setNewAuditType(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-semibold"
                >
                  {Object.keys(AUDIT_QUESTIONS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Date pick */}
              <div className="space-y-1">
                <label className="font-bold text-slate-550 block">Scheduled Target Date</label>
                <input
                  type="date"
                  required
                  value={newAuditDate}
                  onChange={(e) => setNewAuditDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-850 dark:bg-slate-900 dark:text-white font-semibold"
                />
              </div>

              {/* Auditor pick */}
              <div className="space-y-1">
                <label className="font-bold text-slate-555 block">Assign Compliance Officer</label>
                <select
                  value={newAuditOfficer}
                  onChange={(e) => setNewAuditOfficer(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900 dark:text-white font-semibold"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.title})</option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-805 font-bold"
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
        </div>
      )}

    </div>
  );
};

export default Compliance;
