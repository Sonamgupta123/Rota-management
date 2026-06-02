import logoImg from '../assets/logo.png';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { ALL_AUDIT_QUESTIONS } from '../utils/auditQuestions';
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

const DAILY_WALKAROUND_QUESTIONS = [
  { id: 1, section: "Food & Fluid Charts", question: "Where a resident has a poor diet, it is clearly documented in the daily notes along with the actions taken." },
  { id: 2, section: "Food & Fluid Charts", question: "Any special instructions are clearly written" },
  { id: 3, section: "Food & Fluid Charts", question: "There is evidence that residents are offered snacks and supper. Residents are being toileted prior. Hands are being washed/wipes are being given" },
  { id: 4, section: "Food & Fluid Charts", question: "There is evidence that suitable fortification is carried out when possible. e.g. full fat milk/cream etc" },
  { id: 5, section: "Food & Fluid Charts", question: "If meals and snacks are declined this is also documented" },
  { id: 6, section: "Food & Fluid Charts", question: "Is the resident weighed weekly to ensure weight is stabilising" },
  { id: 7, section: "Food & Fluid Charts", question: "If residents weight isn’t stabilising, actions have been taken e.g. GP informed and referral to dietician" },

  { id: 8, section: "Fluid Charts", question: "Where a resident has a poor fluid intake this is clearly written in the daily notes and actions taken are clear" },
  { id: 9, section: "Fluid Charts", question: "Fluid charts record a running total and is total at every 24 hour period" },
  { id: 10, section: "Fluid Charts", question: "Fluid charts document amount of fluid intake and if fluid was declined" },
  { id: 11, section: "Fluid Charts", question: "There is a fluid chart for each resident who has a catheter in place to help identify any problems that may occur." },

  { id: 12, section: "Repositioning chart", question: "Planned care states frequency of reposition required." },
  { id: 13, section: "Repositioning chart", question: "Reposition chart clearly records that repositioning has taken place i.e. which position from & to." },
  { id: 14, section: "Repositioning chart", question: "Appropriate comments are written as required and do not contain abbreviations" },

  { id: 15, section: "Cream/Ointments Chart", question: "Creams are dated when opened" },
  { id: 16, section: "Cream/Ointments Chart", question: "Are there separate tiles for barrier cream and moisturising creams?" },
  { id: 17, section: "Cream/Ointments Chart", question: "Cream tiles are completed and any comments are written as required and do not contain abbreviations" },
  { id: 18, section: "Cream/Ointments Chart", question: "Is it clear as to which area of the body each cream should be applied? (consider a body map if required)" },
  { id: 19, section: "Cream/Ointments Chart", question: "Any special instructions are clearly written on the charts i.e. after bathing" },

  { id: 20, section: "Behaviour/observation Charts", question: "Behaviour and observation charts are used appropriately (If in use within the home)" },
  { id: 21, section: "Behaviour/observation Charts", question: "Behaviour & Observation charts have clear instructions for the reason and requested information is realistic and doesn’t pose any further undue stresses to the resident" },

  { id: 22, section: "General Audit care notes/observations/checks", question: "Are pad checks being done sufficiently day/night? Are the checks documented?" },
  { id: 23, section: "General Audit care notes/observations/checks", question: "Are residents being offered a choice? Is this documented?" },
  { id: 24, section: "General Audit care notes/observations/checks", question: "Does variety of activities take place? Are residents happy?" },
  { id: 25, section: "General Audit care notes/observations/checks", question: "Are residents being toileted prior to meal/snack time? Are they washing hands/using wipes before meal/snack time?" },
  { id: 26, section: "General Audit care notes/observations/checks", question: "Residents in their room do they have a jug of juice/water of their choice in their room and a snack?" },
  { id: 27, section: "General Audit care notes/observations/checks", question: "Are residents in their room spending at least 15 minutes a day with a carer to have a meaningful conversation?" }
];

const Compliance = () => {
  const { audits, submitAuditResult, scheduleAudit, employees, currentRole } = useApp();
  const [selectedAudit, setSelectedAudit] = useState(null); // Active audit being conducted
  const [auditAnswers, setAuditAnswers] = useState({});
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Completed', 'Pending', 'Overdue', 'Failed'

  const generateAuditDetails = (audit) => {
    if (!audit) return null;
    if (audit.details) return audit.details;

    const officer = employees.find(e => e.id === audit.officerId) || employees[0];
    const sourceQuestions = ALL_AUDIT_QUESTIONS[audit.type] || 
      (AUDIT_QUESTIONS[audit.type] || AUDIT_QUESTIONS["Daily Walkaround"]).map((qText, idx) => ({
        id: idx + 1,
        section: "General compliance",
        question: qText
      }));
    
    const targetScore = audit.score !== null ? audit.score : 95;
    const totalQ = sourceQuestions.length;
    const yesCount = Math.round((targetScore / 100) * totalQ);

    const questions = sourceQuestions.map((q, idx) => {
      const isYes = idx < yesCount;
      return {
        ...q,
        doq: isYes ? "D: Daily notes verify compliance. O: Visually checked." : "D: Incomplete entry. O: Issue identified.",
        comments: isYes ? "Adequate records observed, consistent documentation matching planned care." : "Some entries missing or documentation not matching planned care.",
        status: isYes ? "YES" : "NO",
        score: isYes ? "5/5" : "2/5",
        actionPlan: isYes ? "" : "Re-educate staff on accurate documentation procedures."
      };
    });

    const actionPlans = targetScore < 100 ? questions.filter(q => q.status === 'NO').map(q => ({
      section: q.section || 'General compliance',
      problem: 'Some entries missing or documentation not matching planned care.',
      actions: 'Re-educate staff on accurate documentation procedures.',
      responsible: 'Senior Care Assistant / Nurse',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reviewedBy: officer ? officer.name : 'Marcus Vance',
      signedOff: audit.status === 'Completed' ? 'Signed off' : 'Pending'
    })) : [];

    return {
      auditor: officer ? officer.name : 'Marcus Vance',
      signed: officer ? officer.name.split(' ').map(n => n[0]).join('') : 'MV',
      date: audit.lastCompleted !== 'Never' ? audit.lastCompleted : audit.scheduledDate,
      questions,
      actionPlans,
      completedBy: officer ? officer.name : 'Marcus Vance',
      designation: officer ? officer.title : 'Lead Compliance Officer',
      signature: officer ? officer.name : 'Marcus Vance',
      completionDate: audit.lastCompleted !== 'Never' ? audit.lastCompleted : audit.scheduledDate,
      actualScore: targetScore
    };
  };
  const [selectedCategory, setSelectedCategory] = useState(null); // To filter by Category on the left
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false); // To schedule new audit

  // Custom Daily Walkaround / Records Audit state
  const [dailyAuditForm, setDailyAuditForm] = useState(null);
  const [activeAuditTab, setActiveAuditTab] = useState("Food & Fluid Charts");
  const [viewReportAudit, setViewReportAudit] = useState(null);
  const [viewReportTab, setViewReportTab] = useState("Food & Fluid Charts");

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
    const officer = employees.find(e => e.id === audit.officerId) || employees[0];
    const sourceQuestions = ALL_AUDIT_QUESTIONS[audit.type] || 
      (AUDIT_QUESTIONS[audit.type] || AUDIT_QUESTIONS["Daily Walkaround"]).map((qText, idx) => ({
        id: idx + 1,
        section: "General compliance",
        question: qText
      }));

    const questions = sourceQuestions.map(q => {
      if (audit.type === 'Daily Walkaround' && q.id === 1) {
        return {
          ...q,
          doq: "D: Daily notes reviewed for Steven Gaines O: Food chart incomplete. Q: Staff unsure of escalation process.",
          comments: "Resident’s poor intake was not consistently documented. Food & fluid chart had missing entries and no evidence of escalation to GP.",
          status: "NO",
          score: "2/5",
          actionPlan: "Re-educate staff on accurate documentation and escalation procedures. Complete food/fluid charts fully."
        };
      }
      return {
        ...q,
        doq: "",
        comments: "",
        status: "YES",
        score: "5/5",
        actionPlan: ""
      };
    });

    const actionPlans = audit.type === 'Daily Walkaround' ? [
      { section: 'Food & Fluid Charts', problem: 'Resident’s poor intake was not consistently documented. Food & fluid chart had missing entries and no evidence of escalation to GP.', actions: 'Re-educate staff on accurate documentation and escalation procedures. Complete food/fluid charts fully.', responsible: 'Senior Care Assistant / Nurse', targetDate: '2026-06-15', reviewedBy: 'Marcus Vance', signedOff: 'Pending' }
    ] : [];

    setDailyAuditForm({
      auditor: officer ? officer.name : '',
      signed: '',
      date: audit.scheduledDate === 'Immediate' ? new Date().toISOString().split('T')[0] : audit.scheduledDate,
      questions,
      actionPlans,
      completedBy: officer ? officer.name : '',
      designation: officer ? officer.title : '',
      signature: '',
      completionDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmitAudit = (e) => {
    e.preventDefault();
    const totalQuestions = dailyAuditForm.questions.length;
    const naCount = dailyAuditForm.questions.filter(q => q.status === 'N/A').length;
    const totalEvaluated = totalQuestions - naCount;
    const score = totalEvaluated > 0 ? Math.round((dailyAuditForm.questions.filter(q => q.status === 'YES').length / totalEvaluated) * 100) : 100;

    submitAuditResult(selectedAudit.id, score, dailyAuditForm);
    setSelectedAudit(null);
    setDailyAuditForm(null);
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
        <div className="max-w-5xl mx-auto rounded-xl p-4 md:p-6 space-y-6 relative animate-slide-up bg-white text-black shadow-lg border border-slate-200">
          
          <div className="flex justify-start">
            <button 
              type="button" 
              onClick={() => { setSelectedAudit(null); setDailyAuditForm(null); }} 
              className="h-10 px-6 rounded-xl border border-slate-300 font-extrabold text-slate-700 bg-white hover:bg-slate-50 hover:text-black transition-all active:scale-[0.98]"
            >
              Go Back
            </button>
          </div>

          {/* Header / Brand Flex row */}
          <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-4 select-none">
            <div className="flex-1 text-center">
              <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase text-black">
                Quality & Compliance – The Swan Care Home {selectedAudit.type}
              </h2>
            </div>
            <div className="shrink-0 ml-4 flex flex-col items-end gap-1">
              <img src={logoImg} alt="AS CARE" className="h-10 md:h-12 object-contain" />
            </div>
          </div>

            {/* Header Details Table Grid */}
            <div className="w-full border border-black grid grid-cols-1 sm:grid-cols-4 text-xs font-semibold select-none mb-6">
              <div className="p-2 border-b sm:border-b-0 sm:border-r border-black flex items-center gap-2 sm:col-span-2">
                <span className="text-black">Auditor:</span>
                <input 
                  type="text" 
                  value={dailyAuditForm.auditor} 
                  onChange={(e) => setDailyAuditForm({ ...dailyAuditForm, auditor: e.target.value })} 
                  className="flex-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs" 
                  placeholder="Name of Auditor"
                />
              </div>
              <div className="p-2 border-b sm:border-b-0 sm:border-r border-black flex items-center gap-2">
                <span className="text-black">Signed:</span>
                <input 
                  type="text" 
                  value={dailyAuditForm.signed} 
                  onChange={(e) => setDailyAuditForm({ ...dailyAuditForm, signed: e.target.value })} 
                  className="flex-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs" 
                  placeholder="Initials"
                />
              </div>
              <div className="p-2 flex items-center gap-2">
                <span className="text-black">Date:</span>
                <input 
                  type="date" 
                  value={dailyAuditForm.date} 
                  onChange={(e) => setDailyAuditForm({ ...dailyAuditForm, date: e.target.value })} 
                  className="flex-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs" 
                />
              </div>
            </div>

            {/* Continuous document table */}
            <form onSubmit={handleSubmitAudit} className="space-y-6 text-xs">
              <div className="overflow-x-auto border-2 border-black rounded-sm">
                <table className="w-full text-left border-collapse min-w-[900px] text-black">
                  <tbody className="divide-y divide-black bg-white">
                    {Array.from(new Set(dailyAuditForm.questions.map(q => q.section))).map(section => (
                      <React.Fragment key={section}>
                        {/* Repeated Green Header Row for Each Section */}
                        <tr className="bg-[#92d050] text-black border-t border-black font-extrabold select-none">
                          <th className="p-2 border border-black text-center align-middle w-1/4">
                            <div className="font-extrabold text-xs">Audit Question</div>
                            <div className="underline font-bold mt-1 text-xs">{section}</div>
                          </th>
                          <th className="p-2 border border-black text-center align-middle text-xs w-1/5 leading-tight">
                            Documentation (D)<br />Observation (O)<br />Questioning (Q)
                          </th>
                          <th className="p-2 border border-black text-center align-middle text-xs w-1/5 leading-tight">
                            Comments
                          </th>
                          <th className="p-2 border border-black text-center align-middle text-xs w-[120px] leading-tight">
                            Yes/No/<br />Not Applicable<br />(N/A)
                          </th>
                          <th className="p-2 border border-black text-center align-middle text-xs w-16 leading-tight">
                            Score
                          </th>
                          <th className="p-2 border border-black text-center align-middle text-xs w-1/5 leading-tight">
                            Action Plan
                          </th>
                        </tr>

                        {dailyAuditForm.questions.filter(q => q.section === section).map(q => {
                          const globalIdx = dailyAuditForm.questions.findIndex(item => item.id === q.id);
                          return (
                            <tr key={q.id} className="hover:bg-slate-50 text-[11px] divide-x divide-black border border-black">
                              <td className="p-2 align-top font-bold text-black border-r border-black">
                                <span>{q.id}. {q.question}</span>
                              </td>
                              <td className="p-1 align-top border-r border-black bg-transparent">
                                <textarea
                                  rows="4"
                                  value={q.doq}
                                  onChange={(e) => {
                                    const updatedQ = [...dailyAuditForm.questions];
                                    updatedQ[globalIdx].doq = e.target.value;
                                    setDailyAuditForm({ ...dailyAuditForm, questions: updatedQ });
                                  }}
                                  className="w-full h-full min-h-[70px] p-1 bg-transparent border-none outline-none resize-none text-[11px] font-bold text-[#c00000] focus:ring-0"
                                  placeholder="D: Documentation... O: Observation... Q: Questioning..."
                                />
                              </td>
                              <td className="p-1 align-top border-r border-black bg-transparent">
                                <textarea
                                  rows="4"
                                  value={q.comments}
                                  onChange={(e) => {
                                    const updatedQ = [...dailyAuditForm.questions];
                                    updatedQ[globalIdx].comments = e.target.value;
                                    setDailyAuditForm({ ...dailyAuditForm, questions: updatedQ });
                                  }}
                                  className="w-full h-full min-h-[70px] p-1 bg-transparent border-none outline-none resize-none text-[11px] font-bold text-[#c00000] focus:ring-0"
                                  placeholder="Enter comments..."
                                />
                              </td>
                              <td className="p-1 align-top border-r border-black text-center justify-center bg-transparent">
                                <select
                                  value={q.status}
                                  onChange={(e) => {
                                    const updatedQ = [...dailyAuditForm.questions];
                                    updatedQ[globalIdx].status = e.target.value;
                                    setDailyAuditForm({ ...dailyAuditForm, questions: updatedQ });
                                  }}
                                  className="w-full text-center bg-transparent border-none outline-none font-extrabold text-[11px] text-[#c00000] cursor-pointer mt-2"
                                >
                                  <option value="YES" className="text-emerald-700 font-bold bg-white">YES</option>
                                  <option value="NO" className="text-rose-700 font-bold bg-white">NO</option>
                                  <option value="N/A" className="text-slate-600 font-bold bg-white">N/A</option>
                                </select>
                              </td>
                              <td className="p-1 align-top border-r border-black text-center bg-transparent">
                                <input
                                  type="text"
                                  value={q.score}
                                  onChange={(e) => {
                                    const updatedQ = [...dailyAuditForm.questions];
                                    updatedQ[globalIdx].score = e.target.value;
                                    setDailyAuditForm({ ...dailyAuditForm, questions: updatedQ });
                                  }}
                                  className="w-full bg-transparent border-none outline-none text-center font-extrabold text-[11px] text-[#c00000] mt-2"
                                  placeholder="Score"
                                />
                              </td>
                              <td className="p-1 align-top bg-transparent">
                                <textarea
                                  rows="4"
                                  value={q.actionPlan}
                                  onChange={(e) => {
                                    const updatedQ = [...dailyAuditForm.questions];
                                    updatedQ[globalIdx].actionPlan = e.target.value;
                                    setDailyAuditForm({ ...dailyAuditForm, questions: updatedQ });
                                  }}
                                  className="w-full h-full min-h-[70px] p-1 bg-transparent border-none outline-none resize-none text-[11px] font-bold text-[#c00000] focus:ring-0"
                                  placeholder="Enter action plan..."
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}

                    {/* Score summary rows inside the table */}
                    <tr className="border-t-2 border-black bg-slate-50 font-bold select-none text-[11px]">
                      <td colSpan="4" className="p-2 font-bold text-right border-r border-black text-black">Possible Score</td>
                      <td colSpan="2" className="p-2 font-extrabold text-left text-black">{dailyAuditForm.questions.length}</td>
                    </tr>
                    <tr className="border-t border-black bg-white font-bold select-none text-[11px]">
                      <td colSpan="4" className="p-2 font-bold text-right border-r border-black text-black">N/A</td>
                      <td colSpan="2" className="p-2 font-extrabold text-left text-[#c00000]">
                        {dailyAuditForm.questions.filter(q => q.status === 'N/A').length}
                      </td>
                    </tr>
                    <tr className="border-t border-black bg-slate-50 font-bold select-none text-[11px]">
                      <td colSpan="4" className="p-2 font-bold text-right border-r border-black text-black">Homes possible Score</td>
                      <td colSpan="2" className="p-2 font-extrabold text-left text-indigo-700">
                        {dailyAuditForm.questions.length - dailyAuditForm.questions.filter(q => q.status === 'N/A').length}
                      </td>
                    </tr>
                    <tr className="border-t border-black bg-[#e2f0d9]/60 font-bold select-none text-[11px]">
                      <td colSpan="4" className="p-2 font-bold text-right border-r border-black text-black">Actual Score</td>
                      <td colSpan="2" className="p-2 font-extrabold text-left text-[#c00000] text-sm">
                        {(() => {
                          const yesCount = dailyAuditForm.questions.filter(q => q.status === 'YES').length;
                          const naCount = dailyAuditForm.questions.filter(q => q.status === 'N/A').length;
                          const totalEvaluated = dailyAuditForm.questions.length - naCount;
                          return totalEvaluated > 0 ? Math.round((yesCount / totalEvaluated) * 100) : 100;
                        })()}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Plan Table */}
              <div className="overflow-x-auto border-2 border-black rounded-sm mt-8 select-none">
                <table className="w-full text-left border-collapse min-w-[900px] text-black">
                  <thead>
                    <tr className="bg-[#92d050] text-black border-b-2 border-black font-extrabold">
                      <th colSpan="8" className="p-2 text-center text-sm uppercase tracking-wider font-extrabold border-b border-black">
                        Action Plan
                      </th>
                    </tr>
                    <tr className="bg-[#92d050] text-black border-b border-black text-center font-bold text-[10px] sm:text-xs">
                      <th className="p-2 border-r border-black w-[12%]">Section</th>
                      <th className="p-2 border-r border-black w-[20%]">Problem Identified</th>
                      <th className="p-2 border-r border-black w-[20%]">Actions</th>
                      <th className="p-2 border-r border-black w-[13%]">Responsible Person</th>
                      <th className="p-2 border-r border-black w-[10%]">Date to be achieved</th>
                      <th className="p-2 border-r border-black w-[10%]">Reviewed by</th>
                      <th className="p-2 border-r border-black w-[12%]">Signed & Dated as completed</th>
                      <th className="p-2 w-8 text-center bg-[#92d050]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black font-semibold text-black bg-white">
                    {dailyAuditForm.actionPlans.map((ap, apIdx) => (
                      <tr key={apIdx} className="hover:bg-slate-50 text-xs">
                        <td className="p-1 border-r border-black align-middle">
                          <input 
                            type="text" 
                            value={ap.section} 
                            onChange={e => { const u = [...dailyAuditForm.actionPlans]; u[apIdx].section = e.target.value; setDailyAuditForm({...dailyAuditForm, actionPlans: u}); }} 
                            className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs" 
                            placeholder="e.g. Fluid Charts"
                          />
                        </td>
                        <td className="p-1 border-r border-black align-middle">
                          <textarea 
                            rows="2"
                            value={ap.problem} 
                            onChange={e => { const u = [...dailyAuditForm.actionPlans]; u[apIdx].problem = e.target.value; setDailyAuditForm({...dailyAuditForm, actionPlans: u}); }} 
                            className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs resize-none" 
                            placeholder="Describe problem..."
                          />
                        </td>
                        <td className="p-1 border-r border-black align-middle">
                          <textarea 
                            rows="2"
                            value={ap.actions} 
                            onChange={e => { const u = [...dailyAuditForm.actionPlans]; u[apIdx].actions = e.target.value; setDailyAuditForm({...dailyAuditForm, actionPlans: u}); }} 
                            className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs resize-none" 
                            placeholder="Describe actions required..."
                          />
                        </td>
                        <td className="p-1 border-r border-black align-middle">
                          <input 
                            type="text" 
                            value={ap.responsible} 
                            onChange={e => { const u = [...dailyAuditForm.actionPlans]; u[apIdx].responsible = e.target.value; setDailyAuditForm({...dailyAuditForm, actionPlans: u}); }} 
                            className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs text-center" 
                            placeholder="Responsible"
                          />
                        </td>
                        <td className="p-1 border-r border-black align-middle text-center">
                          <input 
                            type="date" 
                            value={ap.targetDate} 
                            onChange={e => { const u = [...dailyAuditForm.actionPlans]; u[apIdx].targetDate = e.target.value; setDailyAuditForm({...dailyAuditForm, actionPlans: u}); }} 
                            className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-[10px]" 
                          />
                        </td>
                        <td className="p-1 border-r border-black align-middle">
                          <input 
                            type="text" 
                            value={ap.reviewedBy} 
                            onChange={e => { const u = [...dailyAuditForm.actionPlans]; u[apIdx].reviewedBy = e.target.value; setDailyAuditForm({...dailyAuditForm, actionPlans: u}); }} 
                            className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs text-center" 
                            placeholder="Reviewer"
                          />
                        </td>
                        <td className="p-1 border-r border-black align-middle">
                          <input 
                            type="text" 
                            value={ap.signedOff} 
                            onChange={e => { const u = [...dailyAuditForm.actionPlans]; u[apIdx].signedOff = e.target.value; setDailyAuditForm({...dailyAuditForm, actionPlans: u}); }} 
                            className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs text-center" 
                            placeholder="Signature/Date"
                          />
                        </td>
                        <td className="p-1 text-center align-middle bg-white">
                          <button 
                            type="button" 
                            onClick={() => { const u = dailyAuditForm.actionPlans.filter((_, i) => i !== apIdx); setDailyAuditForm({...dailyAuditForm, actionPlans: u}); }} 
                            className="text-red-500 hover:text-red-700 font-bold text-base transition-colors"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-white">
                      <td colSpan="8" className="p-2 text-center bg-slate-50/50 hover:bg-slate-100 transition-colors">
                        <button 
                          type="button" 
                          onClick={() => setDailyAuditForm({...dailyAuditForm, actionPlans: [...dailyAuditForm.actionPlans, {section:'', problem:'', actions:'', responsible:'', targetDate:'', reviewedBy:'', signedOff:''}]})} 
                          className="text-brand-700 hover:text-brand-900 font-black text-xs flex items-center justify-center gap-1 mx-auto"
                        >
                          <Plus className="h-3 w-3" /> Add Action Item Row
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Completion Sign-Off Footer */}
              <div className="mt-8 border border-black p-4 bg-white text-black font-semibold text-xs space-y-4 rounded-sm select-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-end gap-1">
                    <span className="shrink-0 text-black">Completed by:</span>
                    <input 
                      type="text" 
                      value={dailyAuditForm.completedBy} 
                      onChange={e => setDailyAuditForm({...dailyAuditForm, completedBy: e.target.value})} 
                      className="flex-1 bg-transparent border-b border-dashed border-slate-500 outline-none px-1 font-bold text-[#c00000] text-xs" 
                    />
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="shrink-0 text-black">Designation:</span>
                    <input 
                      type="text" 
                      value={dailyAuditForm.designation} 
                      onChange={e => setDailyAuditForm({...dailyAuditForm, designation: e.target.value})} 
                      className="flex-1 bg-transparent border-b border-dashed border-slate-500 outline-none px-1 font-bold text-[#c00000] text-xs" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-end gap-1">
                    <span className="shrink-0 text-black">Signature:</span>
                    <input 
                      type="text" 
                      value={dailyAuditForm.signature} 
                      onChange={e => setDailyAuditForm({...dailyAuditForm, signature: e.target.value})} 
                      className="flex-1 bg-transparent border-b border-dashed border-slate-500 outline-none px-1 font-bold text-[#c00000] text-xs italic" 
                      placeholder="Type signature"
                    />
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="shrink-0 text-black">Date:</span>
                    <input 
                      type="date" 
                      value={dailyAuditForm.completionDate} 
                      onChange={e => setDailyAuditForm({...dailyAuditForm, completionDate: e.target.value})} 
                      className="flex-1 bg-transparent border-b border-dashed border-slate-500 outline-none px-1 font-bold text-[#c00000] text-xs" 
                    />
                  </div>
                </div>
              </div>
                   {/* Submit Buttons */}
            <div className="flex justify-end items-center pt-6 border-t border-slate-200">
              <button 
                type="submit" 
                className="h-10 px-8 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold flex items-center gap-1 shadow-md shadow-brand-500/10 active:scale-[0.98] transition-all"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Save & Submit Audit</span>
              </button>
            </div>
          </form>
        </div>
      ) : viewReportAudit ? (
        viewReportAudit.type === "Call Bell Audit" ? (
          <CallBellAuditReadOnly 
            viewReportAudit={viewReportAudit}
            setViewReportAudit={setViewReportAudit}
          />
        ) : (
        <div className="w-full max-w-[95vw] xl:max-w-7xl mx-auto rounded-xl p-4 md:p-6 space-y-6 relative animate-slide-up bg-white text-black shadow-lg border border-slate-200">
          
          {/* Header info */}
          <div className="flex justify-between items-start border-b pb-3 border-slate-200 mb-2 select-none">
            <div>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                (viewReportAudit.status === 'Completed' && viewReportAudit.score < 90)
                  ? 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-500/10 dark:text-rose-455'
                  : getStatusBadge(viewReportAudit.status)
              }`}>
                {(viewReportAudit.status === 'Completed' && viewReportAudit.score < 90) ? 'Failed' : viewReportAudit.status} Audit
              </span>
              <h3 className="text-xl font-black mt-2 text-slate-900">{viewReportAudit.type} Report</h3>
              <p className="text-[11px] text-slate-405 font-bold mt-0.5">
                Audit ID: {viewReportAudit.id} | {viewReportAudit.status === 'Completed' ? `Completed Date: ${viewReportAudit.lastCompleted}` : `Target Date: ${viewReportAudit.scheduledDate}`}
              </p>
            </div>
            <button
              onClick={() => { setViewReportAudit(null); }}
              className="text-xs font-bold text-slate-400 hover:text-slate-655 transition-colors"
            >
              Close Report
            </button>
          </div>

          {(() => {
            const details = generateAuditDetails(viewReportAudit);
            const officer = employees.find(e => e.id === viewReportAudit.officerId) || employees[0];

            return (
              <div className="space-y-6 text-black">
                
                {/* Brand Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-4 select-none">
                  <div className="flex-1 text-center">
                    <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase text-black">
                      Quality & Compliance – The Swan Care Home {viewReportAudit.type}
                    </h2>
                  </div>
                  <div className="shrink-0 ml-4 flex flex-col items-end gap-1">
                    <img src={logoImg} alt="AS CARE" className="h-10 md:h-12 object-contain" />
                  </div>
                </div>

                {/* Auditor / Officer Profile Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between select-none">
                  <div className="flex items-center gap-3">
                    <img 
                      src={officer.photo} 
                      alt={officer.name} 
                      className="h-12 w-12 rounded-full object-cover border border-slate-300 shrink-0" 
                    />
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#2e6559]">Auditor / Officer Details</span>
                      <h4 className="text-xs font-bold text-slate-800 leading-none">{officer.name}</h4>
                      <p className="text-[10px] text-slate-505 font-semibold mt-0.5">{officer.title}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px] text-slate-650 font-semibold w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
                    <div>
                      <span className="text-[8px] block text-slate-400 font-bold uppercase">Email Address</span>
                      <a href={`mailto:${officer.email}`} className="text-[#2e6559] hover:underline font-bold">{officer.email}</a>
                    </div>
                    <div>
                      <span className="text-[8px] block text-slate-400 font-bold uppercase">Contact Number</span>
                      <span className="text-slate-800 font-bold">{officer.phone}</span>
                    </div>
                    <div>
                      <span className="text-[8px] block text-slate-400 font-bold uppercase">User Role</span>
                      <span className="text-slate-800 font-bold">{officer.role}</span>
                    </div>
                    <div>
                      <span className="text-[8px] block text-slate-400 font-bold uppercase">Start Date</span>
                      <span className="text-slate-800 font-bold">{officer.startDate}</span>
                    </div>
                  </div>
                </div>

                {/* Header Details Table Grid */}
                <div className="w-full border border-black grid grid-cols-1 sm:grid-cols-4 text-xs font-semibold select-none mb-6">
                  <div className="p-2 border-b sm:border-b-0 sm:border-r border-black flex items-center gap-2 sm:col-span-2">
                    <span className="text-black">Auditor:</span>
                    <p className="font-bold text-[#c00000] text-xs">{details.auditor}</p>
                  </div>
                  <div className="p-2 border-b sm:border-b-0 sm:border-r border-black flex items-center gap-2">
                    <span className="text-black">Signed:</span>
                    <p className="font-bold text-[#c00000] text-xs">{details.signed}</p>
                  </div>
                  <div className="p-2 flex items-center gap-2">
                    <span className="text-black">Date:</span>
                    <p className="font-bold text-[#c00000] text-xs">{details.date}</p>
                  </div>
                </div>

                {/* Document-style continuous form (Read-Only) */}
                <div className="overflow-x-auto border-2 border-black rounded-sm">
                  <table className="w-full text-left border-collapse min-w-[900px] text-black">
                    <tbody className="divide-y divide-black bg-white">
                      {Array.from(new Set(details.questions.map(q => q.section))).map(section => (
                        <React.Fragment key={section}>
                          {/* Repeated Green Header Row for Each Section */}
                          <tr className="bg-[#92d050] text-black border-t border-black font-extrabold select-none">
                            <th className="p-2 border border-black text-center align-middle w-[30%] min-w-[250px]">
                              <div className="font-extrabold text-xs">Standard</div>
                              <div className="underline font-bold mt-1 text-xs">{section}</div>
                            </th>
                            <th className="p-2 border border-black text-center align-middle text-xs w-12 leading-tight">
                              Yes
                            </th>
                            <th className="p-2 border border-black text-center align-middle text-xs w-12 leading-tight">
                              No
                            </th>
                            <th className="p-2 border border-black text-center align-middle text-xs w-12 leading-tight">
                              N/A
                            </th>
                            <th className="p-2 border border-black text-center align-middle text-xs w-[25%] min-w-[200px] leading-tight">
                              Notes / Guidance
                            </th>
                            <th className="p-2 border border-black text-center align-middle text-xs w-[25%] min-w-[200px] leading-tight">
                              Comments / Findings
                            </th>
                          </tr>

                          {details.questions.filter(q => q.section === section).map(q => (
                            <tr key={q.id} className="hover:bg-slate-50 text-[11px] divide-x divide-black border border-black">
                              <td className="p-2 align-top font-bold text-black border-r border-black">
                                <span>{q.id}. {q.question}</span>
                              </td>
                              <td className="p-2 align-top border-r border-black text-center font-bold text-lg text-[#c00000]">
                                {q.status === 'YES' ? '✔' : ''}
                              </td>
                              <td className="p-2 align-top border-r border-black text-center font-bold text-lg text-[#c00000]">
                                {q.status === 'NO' ? '✔' : ''}
                              </td>
                              <td className="p-2 align-top border-r border-black text-center font-bold text-lg text-[#c00000]">
                                {q.status === 'N/A' ? '✔' : ''}
                              </td>
                              <td className="p-2 align-top border-r border-black text-[#c00000] font-bold whitespace-pre-line">
                                {q.notes || q.doq || "—"}
                              </td>
                              <td className="p-2 align-top text-[#c00000] font-bold whitespace-pre-line">
                                {q.comments || "—"}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                      
                      {/* Score summary rows */}
                      <tr className="border-t-2 border-black bg-slate-50 font-bold select-none text-[11px]">
                        <td colSpan="4" className="p-2 font-bold text-right border-r border-black text-black">Possible Score</td>
                        <td colSpan="2" className="p-2 font-extrabold text-left text-black">{details.questions.length}</td>
                      </tr>
                      <tr className="border-t border-black bg-white font-bold select-none text-[11px]">
                        <td colSpan="4" className="p-2 font-bold text-right border-r border-black text-black">N/A</td>
                        <td colSpan="2" className="p-2 font-extrabold text-left text-[#c00000]">
                          {details.questions.filter(q => q.status === 'N/A').length}
                        </td>
                      </tr>
                      <tr className="border-t border-black bg-slate-50 font-bold select-none text-[11px]">
                        <td colSpan="4" className="p-2 font-bold text-right border-r border-black text-black">Homes possible Score</td>
                        <td colSpan="2" className="p-2 font-extrabold text-left text-indigo-700">
                          {details.questions.length - details.questions.filter(q => q.status === 'N/A').length}
                        </td>
                      </tr>
                      <tr className="border-t border-black bg-[#e2f0d9]/60 font-bold select-none text-[11px]">
                        <td colSpan="4" className="p-2 font-bold text-right border-r border-black text-black">Actual Score</td>
                        <td colSpan="2" className="p-2 font-extrabold text-left text-[#c00000] text-sm">
                          {viewReportAudit.score !== null ? viewReportAudit.score : details.actualScore}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Action Plan Table */}
                <div className="overflow-x-auto border-2 border-black rounded-sm mt-8 select-none">
                  <table className="w-full text-left border-collapse min-w-[900px] text-black">
                    <thead>
                      <tr className="bg-[#92d050] text-black border-b-2 border-black font-extrabold">
                        <th colSpan="7" className="p-2 text-center text-sm uppercase tracking-wider font-extrabold border-b border-black">
                          Action Plan
                        </th>
                      </tr>
                      <tr className="bg-[#92d050] text-black border-b border-black text-center font-bold text-[10px] sm:text-xs">
                        <th className="p-2 border-r border-black w-[15%]">Section</th>
                        <th className="p-2 border-r border-black w-[22%]">Problem Identified</th>
                        <th className="p-2 border-r border-black w-[22%]">Actions</th>
                        <th className="p-2 border-r border-black w-[13%]">Responsible Person</th>
                        <th className="p-2 border-r border-black w-[10%]">Date to be achieved</th>
                        <th className="p-2 border-r border-black w-[10%]">Reviewed by</th>
                        <th className="p-2 w-[13%]">Signed & Dated as completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-semibold text-black bg-white">
                      {details.actionPlans.length === 0 ? (
                        <tr><td colSpan="7" className="p-4 text-center italic text-slate-500">No action plans required</td></tr>
                      ) : (
                        details.actionPlans.map((ap, apIdx) => (
                          <tr key={apIdx} className="hover:bg-slate-50 text-xs">
                            <td className="p-2 border-r border-black align-middle font-bold text-black">{ap.section}</td>
                            <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold">{ap.problem}</td>
                            <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold">{ap.actions}</td>
                            <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold text-center">{ap.responsible}</td>
                            <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold text-center">{ap.targetDate}</td>
                            <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold text-center">{ap.reviewedBy}</td>
                            <td className="p-2 align-middle text-[#c00000] font-bold text-center">{ap.signedOff}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Completion Sign-Off Footer */}
                <div className="mt-8 border border-black p-4 bg-white text-black font-semibold text-xs space-y-4 rounded-sm select-none">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-end gap-1">
                      <span className="shrink-0 text-black">Completed by:</span>
                      <p className="flex-1 border-b border-dashed border-slate-500 px-1 font-bold text-[#c00000] text-xs">{details.completedBy}</p>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="shrink-0 text-black">Designation:</span>
                      <p className="flex-1 border-b border-dashed border-slate-500 px-1 font-bold text-[#c00000] text-xs">{details.designation}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-end gap-1">
                      <span className="shrink-0 text-black">Signature:</span>
                      <p className="flex-1 border-b border-dashed border-slate-500 px-1 font-bold text-[#c00000] text-xs italic">{details.signature}</p>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="shrink-0 text-black">Date:</span>
                      <p className="flex-1 border-b border-dashed border-slate-500 px-1 font-bold text-[#c00000] text-xs">{details.completionDate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-6 border-t border-slate-200">
                  <button 
                    onClick={() => alert("Exported report summary to CSV format.")} 
                    className="h-10 px-6 rounded-xl border border-slate-300 font-extrabold text-slate-700 bg-white hover:bg-slate-50 hover:text-black transition-all active:scale-[0.98]"
                  >
                    Export Report
                  </button>
                  <button 
                    onClick={() => setViewReportAudit(null)} 
                    className="h-10 px-8 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold shadow-md shadow-brand-500/10 active:scale-[0.98] transition-all"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
        )
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
                            <td 
                              onClick={() => setViewReportAudit(aud)}
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
                                  onClick={() => {
                                    setViewReportAudit(aud);
                                  }}
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
      {scheduleModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
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
        </div>,
        document.body
      )}

      {/* Read-Only Report Viewer for Completed Daily Chart Audits */}
      {viewReportAudit && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-[95vw] xl:max-w-7xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl relative animate-slide-up text-xs space-y-6">
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b pb-3 border-slate-200 mb-2 select-none">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                  (viewReportAudit.status === 'Completed' && viewReportAudit.score < 90)
                    ? 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-500/10 dark:text-rose-455'
                    : getStatusBadge(viewReportAudit.status)
                }`}>
                  {(viewReportAudit.status === 'Completed' && viewReportAudit.score < 90) ? 'Failed' : viewReportAudit.status} Audit
                </span>
                <h3 className="text-xl font-black mt-2 text-slate-900">{viewReportAudit.type} Report</h3>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                  Audit ID: {viewReportAudit.id} | {viewReportAudit.status === 'Completed' ? `Completed Date: ${viewReportAudit.lastCompleted}` : `Target Date: ${viewReportAudit.scheduledDate}`}
                </p>
              </div>
              <button
                onClick={() => { setViewReportAudit(null); }}
                className="text-xs font-bold text-slate-400 hover:text-slate-655 transition-colors"
              >
                Close Report
              </button>
            </div>

            {(() => {
              const details = generateAuditDetails(viewReportAudit);
              const officer = employees.find(e => e.id === viewReportAudit.officerId) || employees[0];

              return (
                <div className="space-y-6 text-black">
                  
                  {/* Brand Header */}
                  <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-4 select-none">
                    <div className="flex-1 text-center">
                      <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase text-black">
                        Quality & Compliance – The Swan Care Home {viewReportAudit.type}
                      </h2>
                    </div>
                    <div className="shrink-0 ml-4 flex flex-col items-end gap-1">
                      <img src={logoImg} alt="AS CARE" className="h-10 md:h-12 object-contain" />
                    </div>
                  </div>

                  {/* Auditor / Officer Profile Card */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between select-none">
                    <div className="flex items-center gap-3">
                      <img 
                        src={officer.photo} 
                        alt={officer.name} 
                        className="h-12 w-12 rounded-full object-cover border border-slate-300 shrink-0" 
                      />
                      <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#2e6559]">Auditor / Officer Details</span>
                        <h4 className="text-xs font-bold text-slate-800 leading-none">{officer.name}</h4>
                        <p className="text-[10px] text-slate-505 font-semibold mt-0.5">{officer.title}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px] text-slate-650 font-semibold w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
                      <div>
                        <span className="text-[8px] block text-slate-400 font-bold uppercase">Email Address</span>
                        <a href={`mailto:${officer.email}`} className="text-[#2e6559] hover:underline font-bold">{officer.email}</a>
                      </div>
                      <div>
                        <span className="text-[8px] block text-slate-400 font-bold uppercase">Contact Number</span>
                        <span className="text-slate-800 font-bold">{officer.phone}</span>
                      </div>
                      <div>
                        <span className="text-[8px] block text-slate-400 font-bold uppercase">User Role</span>
                        <span className="text-slate-800 font-bold">{officer.role}</span>
                      </div>
                      <div>
                        <span className="text-[8px] block text-slate-400 font-bold uppercase">Start Date</span>
                        <span className="text-slate-800 font-bold">{officer.startDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Header Details Table Grid */}
                  <div className="w-full border border-black grid grid-cols-1 sm:grid-cols-4 text-xs font-semibold select-none mb-6">
                    <div className="p-2 border-b sm:border-b-0 sm:border-r border-black flex items-center gap-2 sm:col-span-2">
                      <span className="text-black">Auditor:</span>
                      <p className="font-bold text-[#c00000] text-xs">{details.auditor}</p>
                    </div>
                    <div className="p-2 border-b sm:border-b-0 sm:border-r border-black flex items-center gap-2">
                      <span className="text-black">Signed:</span>
                      <p className="font-bold text-[#c00000] text-xs">{details.signed}</p>
                    </div>
                    <div className="p-2 flex items-center gap-2">
                      <span className="text-black">Date:</span>
                      <p className="font-bold text-[#c00000] text-xs">{details.date}</p>
                    </div>
                  </div>

                  {/* Document-style continuous form (Read-Only) */}
                  <div className="overflow-x-auto border-2 border-black rounded-sm">
                    <table className="w-full text-left border-collapse min-w-[900px] text-black">
                      <tbody className="divide-y divide-black bg-white">
                        {Array.from(new Set(details.questions.map(q => q.section))).map(section => (
                          <React.Fragment key={section}>
                            {/* Repeated Green Header Row for Each Section */}
                            <tr className="bg-[#92d050] text-black border-t border-black font-extrabold select-none">
                              <th className="p-2 border border-black text-center align-middle w-[30%] min-w-[250px]">
                                <div className="font-extrabold text-xs">Standard</div>
                                <div className="underline font-bold mt-1 text-xs">{section}</div>
                              </th>
                              <th className="p-2 border border-black text-center align-middle text-xs w-12 leading-tight">
                                Yes
                              </th>
                              <th className="p-2 border border-black text-center align-middle text-xs w-12 leading-tight">
                                No
                              </th>
                              <th className="p-2 border border-black text-center align-middle text-xs w-12 leading-tight">
                                N/A
                              </th>
                              <th className="p-2 border border-black text-center align-middle text-xs w-[25%] min-w-[200px] leading-tight">
                                Notes / Guidance
                              </th>
                              <th className="p-2 border border-black text-center align-middle text-xs w-[25%] min-w-[200px] leading-tight">
                                Comments / Findings
                              </th>
                            </tr>

                            {details.questions.filter(q => q.section === section).map(q => (
                              <tr key={q.id} className="hover:bg-slate-50 text-[11px] divide-x divide-black border border-black">
                                <td className="p-2 align-top font-bold text-black border-r border-black">
                                  <span>{q.id}. {q.question}</span>
                                </td>
                                <td className="p-2 align-top border-r border-black text-center font-bold text-lg text-[#c00000]">
                                  {q.status === 'YES' ? '✔' : ''}
                                </td>
                                <td className="p-2 align-top border-r border-black text-center font-bold text-lg text-[#c00000]">
                                  {q.status === 'NO' ? '✔' : ''}
                                </td>
                                <td className="p-2 align-top border-r border-black text-center font-bold text-lg text-[#c00000]">
                                  {q.status === 'N/A' ? '✔' : ''}
                                </td>
                                <td className="p-2 align-top border-r border-black text-[#c00000] font-bold whitespace-pre-line">
                                  {q.notes || q.doq || "—"}
                                </td>
                                <td className="p-2 align-top text-[#c00000] font-bold whitespace-pre-line">
                                  {q.comments || "—"}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                        
                        {/* Score summary rows */}
                        <tr className="border-t-2 border-black bg-slate-50 font-bold select-none text-[11px]">
                          <td colSpan="4" className="p-2 font-bold text-right border-r border-black text-black">Possible Score</td>
                          <td colSpan="2" className="p-2 font-extrabold text-left text-black">{details.questions.length}</td>
                        </tr>
                        <tr className="border-t border-black bg-white font-bold select-none text-[11px]">
                          <td colSpan="4" className="p-2 font-bold text-right border-r border-black text-black">N/A</td>
                          <td colSpan="2" className="p-2 font-extrabold text-left text-[#c00000]">
                            {details.questions.filter(q => q.status === 'N/A').length}
                          </td>
                        </tr>
                        <tr className="border-t border-black bg-slate-50 font-bold select-none text-[11px]">
                          <td colSpan="4" className="p-2 font-bold text-right border-r border-black text-black">Homes possible Score</td>
                          <td colSpan="2" className="p-2 font-extrabold text-left text-indigo-700">
                            {details.questions.length - details.questions.filter(q => q.status === 'N/A').length}
                          </td>
                        </tr>
                        <tr className="border-t border-black bg-[#e2f0d9]/60 font-bold select-none text-[11px]">
                          <td colSpan="4" className="p-2 font-bold text-right border-r border-black text-black">Actual Score</td>
                          <td colSpan="2" className="p-2 font-extrabold text-left text-[#c00000] text-sm">
                            {viewReportAudit.score !== null ? viewReportAudit.score : details.actualScore}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Action Plan Table */}
                  <div className="overflow-x-auto border-2 border-black rounded-sm mt-8 select-none">
                    <table className="w-full text-left border-collapse min-w-[900px] text-black">
                      <thead>
                        <tr className="bg-[#92d050] text-black border-b-2 border-black font-extrabold">
                          <th colSpan="7" className="p-2 text-center text-sm uppercase tracking-wider font-extrabold border-b border-black">
                            Action Plan
                          </th>
                        </tr>
                        <tr className="bg-[#92d050] text-black border-b border-black text-center font-bold text-[10px] sm:text-xs">
                          <th className="p-2 border-r border-black w-[15%]">Section</th>
                          <th className="p-2 border-r border-black w-[22%]">Problem Identified</th>
                          <th className="p-2 border-r border-black w-[22%]">Actions</th>
                          <th className="p-2 border-r border-black w-[13%]">Responsible Person</th>
                          <th className="p-2 border-r border-black w-[10%]">Date to be achieved</th>
                          <th className="p-2 border-r border-black w-[10%]">Reviewed by</th>
                          <th className="p-2 w-[13%]">Signed & Dated as completed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black font-semibold text-black bg-white">
                        {details.actionPlans.length === 0 ? (
                          <tr><td colSpan="7" className="p-4 text-center italic text-slate-500">No action plans required</td></tr>
                        ) : (
                          details.actionPlans.map((ap, apIdx) => (
                            <tr key={apIdx} className="hover:bg-slate-50 text-xs">
                              <td className="p-2 border-r border-black align-middle font-bold text-black">{ap.section}</td>
                              <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold">{ap.problem}</td>
                              <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold">{ap.actions}</td>
                              <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold text-center">{ap.responsible}</td>
                              <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold text-center">{ap.targetDate}</td>
                              <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold text-center">{ap.reviewedBy}</td>
                              <td className="p-2 align-middle text-[#c00000] font-bold text-center">{ap.signedOff}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Completion Sign-Off Footer */}
                  <div className="mt-8 border border-black p-4 bg-white text-black font-semibold text-xs space-y-4 rounded-sm select-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-end gap-1">
                        <span className="shrink-0 text-black">Completed by:</span>
                        <p className="flex-1 border-b border-dashed border-slate-500 px-1 font-bold text-[#c00000] text-xs">{details.completedBy}</p>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="shrink-0 text-black">Designation:</span>
                        <p className="flex-1 border-b border-dashed border-slate-500 px-1 font-bold text-[#c00000] text-xs">{details.designation}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="flex items-end gap-1">
                        <span className="shrink-0 text-black">Signature:</span>
                        <p className="flex-1 border-b border-dashed border-slate-500 px-1 font-bold text-[#c00000] text-xs italic">{details.signature}</p>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="shrink-0 text-black">Date:</span>
                        <p className="flex-1 border-b border-dashed border-slate-500 px-1 font-bold text-[#c00000] text-xs">{details.completionDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-6 border-t border-slate-200">
                    <button 
                      onClick={() => alert("Exported report summary to CSV format.")} 
                      className="h-10 px-6 rounded-xl border border-slate-300 font-extrabold text-slate-700 bg-white hover:bg-slate-50 hover:text-black transition-all active:scale-[0.98]"
                    >
                      Export Report
                    </button>
                    <button 
                      onClick={() => setViewReportAudit(null)} 
                      className="h-10 px-8 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold shadow-md shadow-brand-500/10 active:scale-[0.98] transition-all"
                    >
                      Close Report
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Compliance;
