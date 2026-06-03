import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import logoImg from '../../../assets/logo.png';
import AuditActionPlan from '../core/AuditActionPlan';

const QUESTIONS = [
  { id: 1, question: "Are the walls and tiles in a serviceable & clean condition?" },
  { id: 2, question: "Is the ceiling clean and well maintained?" },
  { id: 3, question: "Are the ceiling lights operational and clean?" },
  { id: 4, question: "Is there sufficient lighting in the kitchen?" },
  { id: 5, question: "Is the floor in good clean condition?" },
  { id: 6, question: "Are the seals to flooring sound?" },
  { id: 7, question: "Is the kitchen floor free of trip hazards?" },
  { id: 8, question: "Are the areas under the kitchen appliances clean and free from hazards?" },
  { id: 9, question: "Does the general ventilation within the kitchen and storage areas provide satisfactory extraction?" },
  { id: 10, question: "Are the ducting systems operating satisfactorily?" },
  { id: 11, question: "Are the filter systems clean and functioning?" },
  { id: 12, question: "Have the filter systems been cleaned within the last year?" },
  { id: 13, question: "Is the store in a clean tidy condition?" },
  { id: 14, question: "Are shelves tidy?" },
  { id: 15, question: "Are decanted goods correctly stored and dated?" },
  { id: 16, question: "Are all goods stored off the floor?" },
  { id: 17, question: "Is the cooker clean and functional?" },
  { id: 18, question: "Are the fridges and freezer seals in a sound and clean condition?" },
  { id: 19, question: "Are all temperature recording devices working correctly?" },
  { id: 20, question: "Are all fridges and freezers clean?" },
  { id: 21, question: "Is all food correctly stored, wrapped, decanted and labelled with a use by date?" },
  { id: 22, question: "Is the deep fat fryer clean and in good clean condition?" },
  { id: 23, question: "Is the microwave clean and in good condition?" },
  { id: 24, question: "Are the mixers/blenders clean and in good condition?" },
  { id: 25, question: "Are the toasters clean and in good condition?" },
  { id: 26, question: "Are the grills clean and in good condition?" },
  { id: 27, question: "Are the water boilers clean and in good condition?" },
  { id: 28, question: "Are the dishwashers clean and in good condition?" },
  { id: 29, question: "Is the tea trolley clean and in good condition?" },
  { id: 30, question: "Are the pans etc. clean and in good condition?" },
  { id: 31, question: "Is the cutlery and crockery clean and in good condition?" },
  { id: 32, question: "Are all cooked foods correctly probed for temperature? 73°C" },
  { id: 33, question: "Are all served temperatures above 63°C?" },
  { id: 34, question: "Are appropriate temperature records kept supporting this process?" },
  { id: 35, question: "Is the temperature probe calibrated on a monthly basis?" },
  { id: 36, question: "Are temperature probe cleaning wipes used?" },
  { id: 37, question: "Are eggs stored below 4°C?" },
  { id: 38, question: "Is all frozen food in freezer stored at below -18°C?" },
  { id: 39, question: "Are other food such as cooked meats, cheese, dairy products stored in fridge below 4°C?" },
  { id: 40, question: "Are records kept recording fridge freezer temperatures daily?" },
  { id: 41, question: "In accordance with Company Policy is regular delivery monitoring carried out and recorded?" },
  { id: 42, question: "Are cleaning schedules present?" },
  { id: 43, question: "Do cleaning schedules cover all areas of the kitchen?" },
  { id: 44, question: "Are they recorded?" },
  { id: 45, question: "Are COSHH notices suitably displayed?" },
  { id: 46, question: "Are all kitchen staff up to date with COSHH training?" },
  { id: 47, question: "Is there an appropriately stocked first aid box in the kitchen?" },
  { id: 48, question: "Have all catering staff got basic food hygiene certificates which are in date?" },
  { id: 49, question: "Are all staff maintaining the uniform policy?" },
  { id: 50, question: "Have hand washing procedures been observed as satisfactory?" },
  { id: 51, question: "Are menus displayed?" },
  { id: 52, question: "Are there a satisfactory range of alternatives for residents?" },
  { id: 53, question: "Are the kitchen following company guidelines using the specified nominated suppliers?" },
  { id: 54, question: "Are pest control measures in place?" },
  { id: 55, question: "Are fly screens in good working order?" },
  { id: 56, question: "Does food quality appear to be of a high standard?" },
  { id: 57, question: "Does presentation of food appear to be of a high standard?" },
  { id: 58, question: "Are dining room tables well presented?" },
  { id: 59, question: "Are trays well presented?" },
  { id: 60, question: "Does the chef meet all Residents on admission?" },
  { id: 61, question: "Does the chef regularly discuss food quality with the Residents?" },
  { id: 62, question: "Does the chef fortify diets where needed?" },
  { id: 63, question: "Is the chef informed by care staff of any Residents who have lost weight?" },
  { id: 64, question: "Is the chef aware of any residents who need texture modified diets?" },
  { id: 65, question: "Are texture modified diets presented appropriately?" },
  { id: 66, question: "Have all EHO requirements been addressed from last visit?" },
  { id: 67, question: "The Scores on the Door poster is displayed and is a satisfactory level" }
];

const TOTAL_Q = QUESTIONS.length; // 67

const KitchenAudit = ({ selectedAudit, submitAuditResult, setSelectedAudit, isEditMode }) => {
  const { employees } = useApp();
  const isReadOnly = selectedAudit.status === 'Completed' && !isEditMode;
  const assignedOfficer = employees.find(e => e.id === selectedAudit.officerId) || employees[0];

  // Per-row state
  const [rows, setRows] = useState({});
  const [actionPlans, setActionPlans] = useState([]);

  // Metadata
  const [homeUnit, setHomeUnit] = useState('Swan');
  const [auditDate, setAuditDate] = useState('');
  const [auditingManager, setAuditingManager] = useState('');
  const [homeManager, setHomeManager] = useState('');
  const [managerSigned, setManagerSigned] = useState(false);
  const [managerSignDate, setManagerSignDate] = useState('');

  // Signatures footer
  const [completedBy, setCompletedBy] = useState('');
  const [designation, setDesignation] = useState('');
  const [signDate, setSignDate] = useState('');

  const initRows = (scoreVal) => {
    const r = {};
    const yesCount = Math.round((TOTAL_Q * (scoreVal ?? 95)) / 100);
    QUESTIONS.forEach((q, idx) => {
      r[q.id] = {
        answer: idx < yesCount ? 'YES' : 'NO',
        doq: '',
        comment: '',
        score: '',
        actionPlan: '',
        dateCompletion: ''
      };
    });
    // Pre-fill Q1 example from document
    r[1] = {
      answer: 'NO',
      doq: 'O: Bathroom walls and tiles inspected. D: Cleaning schedule reviewed.',
      comment: 'Mould observed around shower tiles and grout discoloured in some areas. Minor cracks noted on wall near sink. Cleaning schedule not fully completed.',
      score: '2/5',
      actionPlan: 'Housekeeping to deep clean affected areas. Maintenance team to repair cracked wall and re-grout tiles. Monitor weekly to ensure standards maintained.',
      dateCompletion: ''
    };
    return r;
  };

  useEffect(() => {
    if (selectedAudit.status === 'Completed' && selectedAudit.details) {
      const d = selectedAudit.details;
      setRows(d.rows || initRows(selectedAudit.score));
      setActionPlans(d.actionPlans || []);
      setHomeUnit(d.metadata?.homeUnit || 'Swan');
      setAuditDate(d.metadata?.auditDate || selectedAudit.lastCompleted || '');
      setAuditingManager(d.metadata?.auditingManager || assignedOfficer?.name || '');
      setHomeManager(d.metadata?.homeManager || 'Sarah Jenkins');
      setManagerSigned(d.metadata?.managerSigned || false);
      setManagerSignDate(d.metadata?.managerSignDate || selectedAudit.lastCompleted || '');
      setCompletedBy(d.signatures?.completedBy || assignedOfficer?.name || '');
      setDesignation(d.signatures?.designation || assignedOfficer?.title || '');
      setSignDate(d.signatures?.signDate || selectedAudit.lastCompleted || '');
    } else if (selectedAudit.status === 'Completed') {
      setRows(initRows(selectedAudit.score));
      setAuditDate(selectedAudit.lastCompleted || selectedAudit.scheduledDate);
      setAuditingManager(assignedOfficer?.name || '');
      setHomeManager('Sarah Jenkins');
      setManagerSignDate(selectedAudit.lastCompleted || '');
      setCompletedBy(assignedOfficer?.name || '');
      setDesignation(assignedOfficer?.title || '');
      setSignDate(selectedAudit.lastCompleted || '');
    } else {
      setRows(initRows(null));
      const today = new Date().toISOString().split('T')[0];
      setAuditDate(today);
      setAuditingManager(assignedOfficer?.name || '');
      setHomeManager('Sarah Jenkins');
      setManagerSignDate(today);
      setCompletedBy(assignedOfficer?.name || '');
      setDesignation(assignedOfficer?.title || '');
      setSignDate(today);
    }
  }, [selectedAudit, isEditMode]);

  const setRow = (id, field, value) => {
    if (isReadOnly) return;
    setRows(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  // Score: YES + N/A = 1, NO = 0
  const calcScore = () => {
    let count = 0;
    QUESTIONS.forEach(q => {
      const ans = rows[q.id]?.answer || 'YES';
      if (ans === 'YES' || ans === 'N/A') count++;
    });
    return Math.round((count / TOTAL_Q) * 100);
  };

  const score = calcScore();
  const noCount = QUESTIONS.filter(q => rows[q.id]?.answer === 'NO').length;

  const getRag = (s) => {
    if (s >= 90) return { label: 'GREEN', cls: 'text-green-700 bg-green-100 border-green-400' };
    if (s >= 75) return { label: 'AMBER', cls: 'text-amber-700 bg-amber-100 border-amber-400' };
    return { label: 'RED', cls: 'text-red-700 bg-red-100 border-red-400' };
  };
  const rag = getRag(score);

  const handleSubmit = () => {
    if (isReadOnly) return;
    if (!completedBy) { alert('Please fill in Completed By field.'); return; }
    submitAuditResult(selectedAudit.id, score, {
      rows,
      actionPlans,
      metadata: { homeUnit, auditDate, auditingManager, homeManager, managerSigned, managerSignDate },
      signatures: { completedBy, designation, signDate }
    });
    setSelectedAudit(null);
  };

  const inputCls = "w-full bg-transparent border-none outline-none font-semibold text-slate-800 dark:text-slate-100 text-xs";
  const cellInput = "w-full p-1 bg-transparent border-none outline-none focus:bg-white/40 rounded text-xs font-semibold text-slate-800 dark:text-slate-100 resize-none";

  return (
    <div className="bg-[#fcfdfd] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6 max-w-[1500px] mx-auto print:border-none print:shadow-none print:bg-white print:p-0">

      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 print:hidden">
        <button onClick={() => setSelectedAudit(null)}
          className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-650 hover:bg-slate-50 flex items-center gap-1.5 dark:border-slate-800 dark:text-slate-400">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        <button onClick={() => window.print()}
          className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-650 hover:bg-slate-50 flex items-center gap-1.5 dark:border-slate-800 dark:text-slate-400">
          <Printer className="h-4 w-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Document Header: Logo + Title */}
      <div className="flex items-start justify-between gap-4 pb-3">
        <div className="flex-1">
          <p className="text-[10px] text-slate-500 font-semibold mb-1">Kitchen</p>
          <h1 className="text-xl sm:text-2xl font-black text-[#548235] dark:text-[#70ad47] leading-tight">
            Quality &amp; Compliance – The Swan Care Home – Kitchen Audit for Manager
          </h1>
          <div className="mt-3 border-b-2 border-slate-300 dark:border-slate-700" />
        </div>
        <img src={logoImg} alt="AS CARE" className="h-14 object-contain shrink-0" />
      </div>

      {/* Metadata Grid */}
      <div className="border border-black dark:border-slate-700 overflow-hidden text-xs font-bold">
        <div className="grid grid-cols-3 divide-x divide-black dark:divide-slate-700 border-b border-black dark:border-slate-700">
          <div className="p-2.5 flex items-center gap-2 bg-white dark:bg-slate-900">
            <span className="text-slate-600 dark:text-slate-400 shrink-0">Home/Unit:</span>
            <input type="text" disabled={isReadOnly} value={homeUnit} onChange={e => setHomeUnit(e.target.value)}
              className={inputCls} placeholder="Home/Unit..." />
          </div>
          <div className="p-2.5 flex items-center gap-2 bg-white dark:bg-slate-900">
            <span className="text-slate-600 dark:text-slate-400 shrink-0">Audit Date:</span>
            <input type="date" disabled={isReadOnly} value={auditDate} onChange={e => setAuditDate(e.target.value)}
              className={inputCls} />
          </div>
          <div className="p-2.5 flex items-center gap-2 bg-white dark:bg-slate-900">
            <span className="text-slate-600 dark:text-slate-400 shrink-0">Auditing Manager:</span>
            <input type="text" disabled={isReadOnly} value={auditingManager} onChange={e => setAuditingManager(e.target.value)}
              className={inputCls} placeholder="Manager name..." />
          </div>
        </div>
        <div className="p-2.5 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-black dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          The completed audit gives a true reflection of the equipment &amp; cleanliness within the kitchen environment.
        </div>
        <div className="grid grid-cols-3 divide-x divide-black dark:divide-slate-700">
          <div className="p-2.5 flex items-center gap-2 bg-white dark:bg-slate-900">
            <span className="text-slate-600 dark:text-slate-400 shrink-0">Home Manager:</span>
            <input type="text" disabled={isReadOnly} value={homeManager} onChange={e => setHomeManager(e.target.value)}
              className={inputCls} placeholder="Manager name..." />
          </div>
          <div className="p-2.5 flex items-center gap-2 bg-white dark:bg-slate-900">
            <span className="text-slate-600 dark:text-slate-400 shrink-0">Signed:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" disabled={isReadOnly} checked={managerSigned} onChange={e => setManagerSigned(e.target.checked)}
                className="rounded border-slate-300 text-[#70ad47]" />
              <span className="font-bold text-slate-800 dark:text-slate-200">{managerSigned ? 'E-Signed' : 'Click to Sign'}</span>
            </label>
          </div>
          <div className="p-2.5 flex items-center gap-2 bg-white dark:bg-slate-900">
            <span className="text-slate-600 dark:text-slate-400 shrink-0">Date:</span>
            <input type="date" disabled={isReadOnly} value={managerSignDate} onChange={e => setManagerSignDate(e.target.value)}
              className={inputCls} />
          </div>
        </div>
      </div>

      {/* Live Score Widget */}
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-[#70ad47]/30 bg-[#f4fbef] dark:bg-slate-800 dark:border-slate-700 shadow-xs">
        <div className="flex-1 space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Live Compliance Score</p>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${score}%`, background: score >= 90 ? '#22c55e' : score >= 75 ? '#f59e0b' : '#ef4444' }} />
          </div>
        </div>
        <div className="text-center shrink-0">
          <p className="text-2xl font-black text-[#548235] dark:text-[#70ad47]">{score}%</p>
          <span className={`px-2 py-0.5 rounded border text-[9px] font-extrabold uppercase ${rag.cls}`}>{rag.label}</span>
        </div>
        <div className="text-center shrink-0 text-xs">
          <p className="font-black text-slate-700 dark:text-slate-300">{noCount}</p>
          <p className="text-[9px] text-slate-400 uppercase font-bold">Actions</p>
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold border-l border-slate-200 dark:border-slate-700 pl-4 space-y-0.5">
          <p>YES &amp; N/A = 1 | NO = 0</p>
          <p>Total Questions: {TOTAL_Q}</p>
          <p>Score = (YES+N/A) ÷ {TOTAL_Q} × 100</p>
        </div>
      </div>

      {/* Main Audit Table */}
      <div className="overflow-x-auto border-2 border-black dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-950">
        <table className="w-full text-left border-collapse min-w-[1100px] text-xs">
          <thead>
            <tr className="bg-[#548235] text-white font-extrabold uppercase text-[11px]">
              <th className="p-3 border-r border-black dark:border-slate-700 w-[5%] text-center">No</th>
              <th className="p-3 border-r border-black dark:border-slate-700 w-[28%]">Audit Question</th>
              <th className="p-3 border-r border-black dark:border-slate-700 w-[14%]">Documentation (D)<br />Observation (O)<br />Questioning (Q)</th>
              <th className="p-3 border-r border-black dark:border-slate-700 w-[17%]">Comments</th>
              <th className="p-3 border-r border-black dark:border-slate-700 w-[8%] text-center">Yes / No / Not Applicable (N/A)</th>
              <th className="p-3 border-r border-black dark:border-slate-700 w-[5%] text-center">Score</th>
              <th className="p-3 border-r border-black dark:border-slate-700 w-[15%]">Action Plan</th>
              <th className="p-3 w-[8%] text-center">Date for Completion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-100">
            {QUESTIONS.map((q) => {
              const row = rows[q.id] || { answer: 'YES', doq: '', comment: '', score: '', actionPlan: '', dateCompletion: '' };
              const isNo = row.answer === 'NO';
              return (
                <tr key={q.id} className={`transition-colors border-b border-black dark:border-slate-800 ${isNo ? 'bg-rose-50/50 dark:bg-rose-950/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/30'}`}>
                  {/* No */}
                  <td className="p-2 border-r border-black dark:border-slate-800 text-center font-black text-slate-700 dark:text-slate-300 align-top">{q.id}</td>

                  {/* Question */}
                  <td className="p-2.5 border-r border-black dark:border-slate-800 align-top font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">{q.question}</td>

                  {/* DOQ */}
                  <td className="p-1.5 border-r border-black dark:border-slate-800 align-top">
                    <textarea disabled={isReadOnly} rows={2} value={row.doq}
                      onChange={e => setRow(q.id, 'doq', e.target.value)}
                      className={`${cellInput} min-h-[40px]`}
                      placeholder="D/O/Q..." />
                  </td>

                  {/* Comments */}
                  <td className="p-1.5 border-r border-black dark:border-slate-800 align-top">
                    <textarea disabled={isReadOnly} rows={2} value={row.comment}
                      onChange={e => setRow(q.id, 'comment', e.target.value)}
                      className={`${cellInput} min-h-[40px]`}
                      placeholder="Comments..." />
                  </td>

                  {/* Yes/No/N/A */}
                  <td className="p-2 border-r border-black dark:border-slate-800 align-middle">
                    <div className="flex flex-col gap-1 items-center">
                      {['YES', 'NO', 'N/A'].map(opt => (
                        <label key={opt} className="flex items-center gap-1 cursor-pointer">
                          <input type="radio" name={`ans-${q.id}`} disabled={isReadOnly}
                            checked={row.answer === opt}
                            onChange={() => setRow(q.id, 'answer', opt)}
                            className="accent-[#70ad47]" />
                          <span className={`text-[9px] font-black ${opt === 'YES' ? 'text-green-700' : opt === 'NO' ? 'text-red-600' : 'text-slate-500'}`}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </td>

                  {/* Score */}
                  <td className="p-1.5 border-r border-black dark:border-slate-800 align-top">
                    <input disabled={isReadOnly} type="text" value={row.score}
                      onChange={e => setRow(q.id, 'score', e.target.value)}
                      className={`${cellInput} text-center`}
                      placeholder="—" />
                  </td>

                  {/* Action Plan */}
                  <td className="p-1.5 border-r border-black dark:border-slate-800 align-top">
                    <textarea disabled={isReadOnly} rows={2} value={row.actionPlan}
                      onChange={e => setRow(q.id, 'actionPlan', e.target.value)}
                      className={`${cellInput} min-h-[40px]`}
                      placeholder="Action..." />
                  </td>

                  {/* Date for Completion */}
                  <td className="p-1.5 align-top">
                    <input disabled={isReadOnly} type="date" value={row.dateCompletion}
                      onChange={e => setRow(q.id, 'dateCompletion', e.target.value)}
                      className={`${cellInput} text-center`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action Plan section */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wide border-b pb-2 border-slate-200 dark:border-slate-800">
            Action Plan
          </h3>
          <p className="text-[10.5px] text-slate-500 font-semibold mt-1">
            If any standard was marked <strong className="text-rose-600 uppercase font-black">NO</strong>, a corrective action must be documented below.
          </p>
        </div>
        <AuditActionPlan actionPlans={actionPlans} setActionPlans={setActionPlans} isReadOnly={isReadOnly} />
      </div>

      {/* Footer Signature Block */}
      <div className="border border-black dark:border-slate-700 text-xs font-bold overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-black dark:divide-slate-700 border-b border-black dark:border-slate-700">
          <div className="p-3 flex items-center gap-2 bg-white dark:bg-slate-900">
            <span className="text-slate-600 dark:text-slate-400 shrink-0">Completed by:</span>
            <input type="text" disabled={isReadOnly} value={completedBy} onChange={e => setCompletedBy(e.target.value)}
              className={inputCls} placeholder="Full name..." />
          </div>
          <div className="p-3 flex items-center gap-2 bg-white dark:bg-slate-900">
            <span className="text-slate-600 dark:text-slate-400 shrink-0">Designation:</span>
            <input type="text" disabled={isReadOnly} value={designation} onChange={e => setDesignation(e.target.value)}
              className={inputCls} placeholder="Job title..." />
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-black dark:divide-slate-700">
          <div className="p-3 flex items-center gap-2 bg-white dark:bg-slate-900">
            <span className="text-slate-600 dark:text-slate-400 shrink-0">Signature:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" disabled={isReadOnly} checked={managerSigned} onChange={e => setManagerSigned(e.target.checked)}
                className="rounded border-slate-300 text-[#70ad47]" />
              <span className="text-slate-700 dark:text-slate-300">{managerSigned ? '✓ E-Signed' : 'Click to Sign'}</span>
            </label>
          </div>
          <div className="p-3 flex items-center gap-2 bg-white dark:bg-slate-900">
            <span className="text-slate-600 dark:text-slate-400 shrink-0">Date:</span>
            <input type="date" disabled={isReadOnly} value={signDate} onChange={e => setSignDate(e.target.value)}
              className={inputCls} />
          </div>
        </div>
      </div>

      {/* Submit */}
      {!isReadOnly && (
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-800 print:hidden">
          <button type="button" onClick={() => setSelectedAudit(null)}
            className="h-10 px-5 rounded-xl border border-slate-200 text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit}
            className="h-10 px-6 rounded-xl bg-[#548235] hover:bg-[#375720] text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all active:scale-[0.98]">
            <CheckCircle className="h-4 w-4" />
            <span>Complete &amp; Submit Audit</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default KitchenAudit;
