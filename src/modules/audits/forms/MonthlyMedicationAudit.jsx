import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { monthlyMedicationConfig } from '../configs/monthlyMedication.config';
import AuditActionPlan from '../core/AuditActionPlan';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

const MonthlyMedicationAudit = ({ selectedAudit, submitAuditResult, setSelectedAudit, isEditMode }) => {
  const { employees } = useApp();
  const isReadOnly = selectedAudit.status === 'Completed' && !isEditMode;
  const assignedOfficer = employees.find(e => e.id === selectedAudit.officerId) || employees[0];

  // Core audit answers and comments
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState({});
  const [actionPlans, setActionPlans] = useState([]);

  // Client layout metadata table states
  const [homeName, setHomeName] = useState('Oakfield Care Home');
  const [auditDate, setAuditDate] = useState('');
  const [completedBy, setCompletedBy] = useState('');

  // Signatures
  const [auditorName, setAuditorName] = useState('');
  const [auditorRole, setAuditorRole] = useState('');
  const [managerComments, setManagerComments] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerSignDate, setManagerSignDate] = useState('');

  useEffect(() => {
    if (selectedAudit.status === 'Completed') {
      if (selectedAudit.details) {
        const details = selectedAudit.details;
        setAnswers(details.answers || {});
        setComments(details.comments || details.notes || {});
        setActionPlans(details.actionPlans || []);

        setHomeName(details.metadata?.homeName || 'Oakfield Care Home');
        setAuditDate(details.metadata?.auditDate || selectedAudit.lastCompleted || selectedAudit.scheduledDate);
        setCompletedBy(details.metadata?.completedBy || details.signatures?.auditor || assignedOfficer?.name || '');

        setAuditorName(details.signatures?.auditor || '');
        setAuditorRole(details.signatures?.auditorRole || '');
        setManagerComments(details.signatures?.managerComments || 'Standard review completed. All action items resolved.');
        setManagerName(details.signatures?.managerName || 'Sarah Jenkins');
        setManagerSignDate(details.signatures?.managerSignDate || selectedAudit.lastCompleted || selectedAudit.scheduledDate);
      } else {
        // Pre-populate completed details with mock data
        const tempAnswers = {};
        const tempComments = {};
        const scoreVal = selectedAudit.score !== null ? selectedAudit.score : 96;
        const yesCount = Math.round((54 * scoreVal) / 100);

        monthlyMedicationConfig.questions.forEach((q, idx) => {
          if (idx < yesCount) {
            tempAnswers[q.id] = 'YES';
            tempComments[q.id] = '';
          } else {
            tempAnswers[q.id] = 'NO';
            tempComments[q.id] = 'Action plan item generated.';
          }
        });

        setAnswers(tempAnswers);
        setComments(tempComments);
        setAuditDate(selectedAudit.lastCompleted || selectedAudit.scheduledDate);
        setCompletedBy(assignedOfficer?.name || '');

        const noCount = 54 - yesCount;
        const mockActions = [];
        for (let i = 0; i < noCount; i++) {
          const q = monthlyMedicationConfig.questions[yesCount + i];
          if (q) {
            mockActions.push({
              section: q.section,
              problem: `Gap in standard: ${q.question.substring(0, 50)}...`,
              actions: `Rectify and verify compliance for: ${q.question.substring(0, 40)}`,
              responsible: assignedOfficer?.name || 'Care Assistant',
              targetDate: selectedAudit.scheduledDate,
              reviewedBy: 'Sarah Jenkins',
              signedOff: `Completed ${selectedAudit.scheduledDate}`
            });
          }
        }
        setActionPlans(mockActions);

        setAuditorName(assignedOfficer?.name || '');
        setAuditorRole(assignedOfficer?.title || '');
        setManagerComments(scoreVal < 90 ? 'Audit failed target. Action plan reviews are underway.' : 'Overall compliance maintained successfully.');
        setManagerName('Sarah Jenkins');
        setManagerSignDate(selectedAudit.lastCompleted || selectedAudit.scheduledDate);
      }
    } else {
      // In progress / active session
      const initialAnswers = {};
      const initialComments = {};
      monthlyMedicationConfig.questions.forEach(q => {
        initialAnswers[q.id] = 'YES';
        initialComments[q.id] = '';
      });
      setAnswers(initialAnswers);
      setComments(initialComments);
      setAuditDate(new Date().toISOString().split('T')[0]);
      setCompletedBy(assignedOfficer?.name || '');

      setAuditorName(assignedOfficer?.name || '');
      setAuditorRole(assignedOfficer?.title || '');
      setManagerComments('');
      setManagerName('Sarah Jenkins');
      setManagerSignDate(new Date().toISOString().split('T')[0]);
    }
  }, [selectedAudit, isReadOnly]);

  // Handle answers and comments edits
  const handleAnswerChange = (qId, value) => {
    if (isReadOnly) return;
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleCommentChange = (qId, value) => {
    if (isReadOnly) return;
    setComments(prev => ({ ...prev, [qId]: value }));
  };

  // Dynamic calculations based on formula: YES and N/A = 1, NO = 0. Divide by 54.
  const getCalculatedScore = () => {
    let scoreCount = 0;
    monthlyMedicationConfig.questions.forEach(q => {
      const ans = answers[q.id] || 'YES';
      if (ans === 'YES' || ans === 'N/A') {
        scoreCount += 1;
      }
    });
    return Math.round((scoreCount / 54) * 100);
  };

  const calculatedScore = getCalculatedScore();
  const calculatedActionsCount = Object.values(answers).filter(val => val === 'NO').length;

  const getRagRating = (score) => {
    if (score >= 90) return { label: 'GREEN', color: 'text-green-600 font-extrabold', bg: 'bg-green-100 border-green-400' };
    if (score >= 75) return { label: 'AMBER', color: 'text-amber-600 font-extrabold', bg: 'bg-amber-100 border-amber-400' };
    return { label: 'RED', color: 'text-red-600 font-extrabold', bg: 'bg-red-100 border-red-400' };
  };

  const rag = getRagRating(calculatedScore);

  // Group questions by section for custom rendering
  const sectionsMap = {};
  monthlyMedicationConfig.questions.forEach(q => {
    if (!sectionsMap[q.section]) {
      sectionsMap[q.section] = [];
    }
    sectionsMap[q.section].push(q);
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!auditorName || !auditorRole) {
      alert('Please fill in Auditor Name and Auditor Job Title.');
      return;
    }

    const details = {
      answers,
      comments,
      actionPlans,
      metadata: {
        homeName,
        auditDate,
        completedBy,
        actionsCount: calculatedActionsCount.toString(),
        score: calculatedScore
      },
      signatures: {
        auditor: auditorName,
        auditorRole: auditorRole,
        date: auditDate,
        managerComments,
        managerName,
        managerSignDate
      }
    };

    submitAuditResult(selectedAudit.id, calculatedScore, details);
    setSelectedAudit(null);
  };

  return (
    <div className="bg-[#fcfdfd] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6 max-w-[1450px] mx-auto print:border-none print:shadow-none print:bg-white print:p-0">
      
      {/* Action Header bar */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 print:hidden">
        <button
          onClick={() => setSelectedAudit(null)}
          className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-650 hover:bg-slate-50 flex items-center gap-1.5 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={() => window.print()}
          className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-650 hover:bg-slate-50 flex items-center gap-1.5 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Header Panel with Double border-like wrapper */}
      <div className="border-4 border-[#70ad47] p-6 text-center bg-white my-4 dark:bg-slate-950 dark:border-[#548235]">
        <h1 className="text-2xl sm:text-3xl font-black text-[#548235] tracking-wide uppercase dark:text-[#70ad47]">
          Full Monthly Medication Audit
        </h1>
      </div>

      {/* Split Metadata block */}
      <div className="grid gap-6 md:grid-cols-2 select-none">
        
        {/* Left Metadata Grid Table */}
        <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full text-xs font-bold border-collapse">
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-750">
                <td className="w-1/2 p-3 bg-[#70ad47] text-white font-extrabold uppercase border-r border-slate-200 dark:border-slate-700">Name of Home</td>
                <td className="p-2 bg-white dark:bg-slate-900">
                  <input 
                    type="text" 
                    disabled={isReadOnly}
                    value={homeName} 
                    onChange={e => setHomeName(e.target.value)} 
                    className="w-full bg-transparent border-none outline-none font-bold text-slate-800 dark:text-slate-100"
                  />
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-750">
                <td className="p-3 bg-[#70ad47] text-white font-extrabold uppercase border-r border-slate-200 dark:border-slate-700">Date of Audit</td>
                <td className="p-2 bg-white dark:bg-slate-900">
                  <input 
                    type="date" 
                    disabled={isReadOnly}
                    value={auditDate} 
                    onChange={e => setAuditDate(e.target.value)} 
                    className="w-full bg-transparent border-none outline-none font-bold text-slate-800 dark:text-slate-100"
                  />
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-750">
                <td className="p-3 bg-[#70ad47] text-white font-extrabold uppercase border-r border-slate-200 dark:border-slate-700">Completed by</td>
                <td className="p-2 bg-white dark:bg-slate-900">
                  <input 
                    type="text" 
                    disabled={isReadOnly}
                    value={completedBy} 
                    onChange={e => setCompletedBy(e.target.value)} 
                    className="w-full bg-transparent border-none outline-none font-bold text-slate-800 dark:text-slate-100"
                  />
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-750">
                <td className="p-3 bg-[#70ad47] text-white font-extrabold uppercase border-r border-slate-200 dark:border-slate-700">Actions added to audit action plan</td>
                <td className="p-3 bg-white dark:bg-slate-900 font-extrabold text-slate-800 dark:text-slate-200">
                  {calculatedActionsCount}
                </td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-750">
                <td className="p-3 bg-[#70ad47] text-white font-extrabold uppercase border-r border-slate-200 dark:border-slate-700">Overall score of Audit</td>
                <td className="p-3 bg-white dark:bg-slate-900 font-extrabold text-[#2e6559] dark:text-brand-400 text-sm sm:text-base">
                  {calculatedScore}%
                </td>
              </tr>
              <tr>
                <td className="p-3 bg-[#70ad47] text-white font-extrabold uppercase border-r border-slate-200 dark:border-slate-700">Rag Rating</td>
                <td className={`p-3 bg-white dark:bg-slate-900 font-extrabold text-xs uppercase border-none`}>
                  <span className={`px-3 py-1.5 rounded border inline-block ${rag.bg} ${rag.color}`}>
                    {rag.label}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right side Scoring guide */}
        <div className="border border-[#70ad47] dark:border-[#548235] rounded-lg p-5 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
          <h3 className="text-sm font-black text-[#548235] dark:text-[#70ad47] border-b border-slate-100 dark:border-slate-800 pb-1.5 uppercase">Scoring</h3>
          <ul className="space-y-1.5 text-xs font-bold">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-emerald-600 dark:text-emerald-450">90% and above = GREEN</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span className="text-amber-500">75% - 89% = AMBER</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-600 shrink-0" />
              <span className="text-rose-600 dark:text-rose-455">0% - 75% = RED</span>
            </li>
          </ul>
          <p className="text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed font-black pt-1">
            To score – YES and N/A = 1 No – 0
          </p>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold italic">
            Calculate the number of Yes and N/A answers and divide by the 54 then multiply by 100 – this will give you an overall % of compliance.
          </p>
        </div>
      </div>

      {/* Audit Form Table */}
      <div className="overflow-x-auto border-2 border-black rounded-lg shadow-sm mt-6 bg-white dark:bg-slate-950 dark:border-slate-800 text-black dark:text-white">
        <table className="w-full text-left border-collapse border-slate-400 min-w-[1100px] text-xs">
          <thead>
            <tr className="bg-[#70ad47] text-white font-extrabold uppercase border-b border-black">
              <td colSpan="6" className="p-3 text-center text-xs font-black tracking-wide bg-[#548235] border-b border-black">
                Audit to be completed every Month by the Manager / Deputy /Care Team Leader of ALL residents.
              </td>
            </tr>
            <tr className="bg-[#70ad47] text-white font-extrabold uppercase border-b-2 border-black dark:bg-[#548235] dark:border-slate-800 text-[11px]">
              <th className="p-3 border-r border-black dark:border-slate-800 w-[35%] align-middle text-left font-extrabold">Standard</th>
              <th className="p-3 border-r border-black dark:border-slate-800 w-[6%] align-middle text-center font-extrabold">Yes</th>
              <th className="p-3 border-r border-black dark:border-slate-800 w-[6%] align-middle text-center font-extrabold">No</th>
              <th className="p-3 border-r border-black dark:border-slate-800 w-[6%] align-middle text-center font-extrabold">N/A</th>
              <th className="p-3 border-r border-black dark:border-slate-800 w-[27%] align-middle text-left font-extrabold">Notes / Guidance</th>
              <th className="p-3 w-[20%] align-middle text-left font-extrabold">Comments / Findings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-100">
            {Object.keys(sectionsMap).map((sectionName) => (
              <React.Fragment key={sectionName}>
                {/* Section Heading Header Row */}
                <tr className="bg-[#e2f0d9] border-y border-black dark:border-slate-800 dark:bg-slate-800 font-black text-[#385723] dark:text-[#a9d18e]">
                  <td colSpan="6" className="p-2.5 pl-3 text-xs font-black uppercase tracking-wider">
                    {sectionName}
                  </td>
                </tr>
                {sectionsMap[sectionName].map((q) => {
                  const ans = answers[q.id] || 'YES';
                  const comment = comments[q.id] || '';
                  return (
                    <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-b border-black dark:border-slate-800">
                      {/* Standard */}
                      <td className="p-3 border-r border-black dark:border-slate-800 align-top font-bold text-slate-900 dark:text-slate-100">
                        {q.id}. {q.question}
                      </td>
                      
                      {/* Yes Toggle Checkbox */}
                      <td className="p-3 border-r border-black dark:border-slate-800 align-middle text-center">
                        <input
                          type="checkbox"
                          disabled={isReadOnly}
                          checked={ans === 'YES'}
                          onChange={() => handleAnswerChange(q.id, 'YES')}
                          className="h-4.5 w-4.5 rounded border-slate-300 text-[#70ad47] focus:ring-[#70ad47] cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* No Toggle Checkbox */}
                      <td className="p-3 border-r border-black dark:border-slate-800 align-middle text-center">
                        <input
                          type="checkbox"
                          disabled={isReadOnly}
                          checked={ans === 'NO'}
                          onChange={() => handleAnswerChange(q.id, 'NO')}
                          className="h-4.5 w-4.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* N/A Toggle Checkbox */}
                      <td className="p-3 border-r border-black dark:border-slate-800 align-middle text-center">
                        <input
                          type="checkbox"
                          disabled={isReadOnly}
                          checked={ans === 'N/A'}
                          onChange={() => handleAnswerChange(q.id, 'N/A')}
                          className="h-4.5 w-4.5 rounded border-slate-300 text-slate-500 focus:ring-slate-400 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>

                      {/* Notes / Guidance */}
                      <td className="p-3 border-r border-black dark:border-slate-800 align-top text-slate-500 dark:text-slate-400 font-semibold italic text-[11px] whitespace-pre-line leading-relaxed">
                        {q.notes}
                      </td>

                      {/* Comments / Findings */}
                      <td className="p-2 align-top">
                        <textarea
                          disabled={isReadOnly}
                          rows="2"
                          value={comment}
                          onChange={e => handleCommentChange(q.id, e.target.value)}
                          className="w-full p-1.5 bg-transparent border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-[#70ad47] text-xs font-semibold text-slate-800 dark:text-slate-100"
                          placeholder="Enter findings..."
                        />
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Corrective Action Plan */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2 border-slate-100 dark:border-slate-800 uppercase tracking-wide">
          Corrective Action Plan
        </h3>
        <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
          If any of the standard medication audit criteria above was marked as <strong className="text-rose-600 uppercase font-black">NO</strong>, a corrective action line must be generated below detailing the path to resolution.
        </p>

        <AuditActionPlan 
          actionPlans={actionPlans} 
          setActionPlans={setActionPlans} 
          isReadOnly={isReadOnly} 
        />
      </div>

      {/* Signatures and Sign-off Panel */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-5 text-xs text-black select-none dark:text-white">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">Audit Verification Signatures</h4>

        <div className="grid gap-5 sm:grid-cols-2 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850 rounded-2xl p-5">
          {/* Auditor Sign-off */}
          <div className="space-y-3">
            <span className="text-[9px] font-black uppercase text-[#548235] dark:text-[#70ad47]">Auditor / Assessor Sign-Off</span>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  disabled={isReadOnly}
                  value={auditorName} 
                  onChange={e => setAuditorName(e.target.value)} 
                  placeholder="Auditor Full Name"
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none w-full"
                />
                <input 
                  type="text" 
                  disabled={isReadOnly}
                  value={auditorRole} 
                  onChange={e => setAuditorRole(e.target.value)} 
                  placeholder="Auditor Job Title"
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none w-full"
                />
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-[10px] text-slate-400 font-bold block shrink-0">Completion Date:</span>
                <input 
                  type="date" 
                  disabled={isReadOnly}
                  value={auditDate} 
                  onChange={e => setAuditDate(e.target.value)} 
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Manager Countersign */}
          <div className="space-y-3">
            <span className="text-[9px] font-black uppercase text-[#548235] dark:text-[#70ad47]">Manager Countersign & Comments</span>
            <div className="space-y-2">
              <textarea 
                rows="2"
                disabled={isReadOnly}
                value={managerComments} 
                onChange={e => setManagerComments(e.target.value)} 
                placeholder="Manager review comments..."
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none resize-none"
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  disabled={isReadOnly}
                  value={managerName} 
                  onChange={e => setManagerName(e.target.value)} 
                  placeholder="Manager Name"
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none w-full"
                />
                <input 
                  type="date" 
                  disabled={isReadOnly}
                  value={managerSignDate} 
                  onChange={e => setManagerSignDate(e.target.value)} 
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action panel footer */}
      {!isReadOnly && (
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-800 print:hidden">
          <button
            type="button"
            onClick={() => setSelectedAudit(null)}
            className="h-10 px-5 rounded-xl border border-slate-200 text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleFormSubmit}
            className="h-10 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-md shadow-brand-600/10 flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Complete & Submit Audit</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default MonthlyMedicationAudit;
