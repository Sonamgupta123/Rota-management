import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { calculateAuditScore } from '../core/AuditScoringEngine';
import { dailyWalkaroundConfig } from '../configs/dailyWalkaround.config';
import { ArrowLeft, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

const DailyWalkaroundAudit = ({ selectedAudit, submitAuditResult, setSelectedAudit, isEditMode }) => {
  const { employees } = useApp();
  const isReadOnly = selectedAudit.status === 'Completed' && !isEditMode;
  const assignedOfficer = employees.find(e => e.id === selectedAudit.officerId) || employees[0];

  // States for the table rows
  const [answers, setAnswers] = useState({});
  const [doq, setDoq] = useState({});
  const [comments, setComments] = useState({});
  const [scores, setScores] = useState({});
  const [actionPlans, setActionPlans] = useState({});

  // States for verification/signatures
  const [auditorName, setAuditorName] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const [dateCompleted, setDateCompleted] = useState('');

  useEffect(() => {
    if (isReadOnly) {
      if (selectedAudit.details) {
        const details = selectedAudit.details;
        setAnswers(details.answers || {});
        setDoq(details.doq || {});
        setComments(details.comments || {});
        setScores(details.scores || {});
        setActionPlans(details.actionPlans || {});
        setAuditorName(details.signatures?.auditor || '');
        setIsSigned(details.signatures?.isSigned || false);
        setDateCompleted(selectedAudit.lastCompleted || '');
      } else {
        // Pre-populate completed details with mock data
        const tempAnswers = {};
        const tempDoq = {};
        const tempComments = {};
        const tempScores = {};
        const tempActionPlans = {};

        // Question 1 Example (from screenshot)
        tempAnswers[1] = 'NO';
        tempDoq[1] = 'D: Daily notes reviewed for Steven Gaines O: Food chart incomplete. Q: Staff unsure of escalation process.';
        tempComments[1] = 'Resident’s poor intake was not consistently documented. Food & fluid chart had missing entries and no evidence of escalation to nurse or GP.';
        tempScores[1] = '2/5';
        tempActionPlans[1] = 'Re-educate staff on accurate documentation and escalation procedures. Complete food/fluid charts fully. Senior staff to audit charts weekly';

        // Prepopulate other questions with mock data matching the historical score
        const scoreVal = selectedAudit.score !== null ? selectedAudit.score : 95;
        const totalQ = dailyWalkaroundConfig.questions.length;
        const yesCount = Math.round((totalQ * scoreVal) / 100);

        dailyWalkaroundConfig.questions.forEach(q => {
          if (q.id === 1) return;
          if (q.id <= yesCount) {
            tempAnswers[q.id] = 'YES';
            tempDoq[q.id] = 'D: Notes reviewed. O: Charts up to date.';
            tempComments[q.id] = 'Good compliance observed.';
            tempScores[q.id] = '5/5';
            tempActionPlans[q.id] = '';
          } else {
            tempAnswers[q.id] = 'NO';
            tempDoq[q.id] = 'D: Chart checked.';
            tempComments[q.id] = 'Minor gaps identified in records.';
            tempScores[q.id] = '3/5';
            tempActionPlans[q.id] = 'Remind staff to sign off charts during handovers.';
          }
        });

        setAnswers(tempAnswers);
        setDoq(tempDoq);
        setComments(tempComments);
        setScores(tempScores);
        setActionPlans(tempActionPlans);
        setAuditorName(assignedOfficer?.name || '');
        setIsSigned(true);
        setDateCompleted(selectedAudit.lastCompleted || selectedAudit.scheduledDate);
      }
    } else {
      // Setup default new audit with Question 1 example pre-filled
      const initialAnswers = { 1: 'NO' };
      const initialDoq = { 1: 'D: Daily notes reviewed for Steven Gaines O: Food chart incomplete. Q: Staff unsure of escalation process.' };
      const initialComments = { 1: 'Resident’s poor intake was not consistently documented. Food & fluid chart had missing entries and no evidence of escalation to nurse or GP.' };
      const initialScores = { 1: '2/5' };
      const initialActionPlans = { 1: 'Re-educate staff on accurate documentation and escalation procedures. Complete food/fluid charts fully. Senior staff to audit charts weekly' };

      // Initialize remaining questions to YES/empty
      dailyWalkaroundConfig.questions.forEach(q => {
        if (q.id === 1) return;
        initialAnswers[q.id] = 'YES';
        initialDoq[q.id] = '';
        initialComments[q.id] = '';
        initialScores[q.id] = '';
        initialActionPlans[q.id] = '';
      });

      setAnswers(initialAnswers);
      setDoq(initialDoq);
      setComments(initialComments);
      setScores(initialScores);
      setActionPlans(initialActionPlans);
      setAuditorName(assignedOfficer?.name || '');
      setIsSigned(false);
      setDateCompleted(new Date().toISOString().split('T')[0]);
    }
  }, [selectedAudit, isReadOnly]);

  // Handle cell edits
  const handleCellChange = (qId, field, value) => {
    if (isReadOnly) return;
    if (field === 'answer') setAnswers(prev => ({ ...prev, [qId]: value }));
    if (field === 'doq') setDoq(prev => ({ ...prev, [qId]: value }));
    if (field === 'comment') setComments(prev => ({ ...prev, [qId]: value }));
    if (field === 'score') setScores(prev => ({ ...prev, [qId]: value }));
    if (field === 'actionPlan') setActionPlans(prev => ({ ...prev, [qId]: value }));
  };

  // Group questions by section
  const sectionsMap = {};
  dailyWalkaroundConfig.questions.forEach(q => {
    if (!sectionsMap[q.section]) {
      sectionsMap[q.section] = [];
    }
    sectionsMap[q.section].push(q);
  });

  // Score calculation
  const questionsListForScoring = dailyWalkaroundConfig.questions.map(q => ({
    ...q,
    status: answers[q.id] || 'YES'
  }));
  const scoreResult = calculateAuditScore(questionsListForScoring);
  const currentScore = scoreResult.actualScore;
  const isPassed = currentScore >= dailyWalkaroundConfig.targetScore;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!auditorName) {
      alert('Please enter Auditor name.');
      return;
    }

    const details = {
      answers,
      doq,
      comments,
      scores,
      actionPlans,
      signatures: {
        auditor: auditorName,
        isSigned: isSigned,
        date: dateCompleted
      }
    };

    submitAuditResult(selectedAudit.id, currentScore, details);
  };

  return (
    <div className="bg-[#fcfdfd] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6 max-w-[1400px] mx-auto print:border-none print:shadow-none print:bg-white print:p-0">
      
      {/* Action Header */}
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

      {/* Corporate Letterhead Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Quality & Compliance – The Swan Care Home Daily Records Audit
          </h1>
          <p className="text-xs text-slate-500 font-bold">
            When residents of the day is being done, this audit can be completed to ensure full compliance.
          </p>
        </div>
        <img src={logoImg} alt="AS CARE" className="h-10 object-contain shrink-0" />
      </div>

      {/* Word-like Auditor Signature Header Block */}
      <div className="border border-black bg-white text-black text-xs font-bold w-full overflow-hidden select-none">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black">
          <div className="p-3 flex items-center gap-2">
            <span>Auditor:</span>
            <input
              type="text"
              disabled={isReadOnly}
              value={auditorName}
              onChange={e => setAuditorName(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-black flex-1"
              placeholder="Enter auditor name..."
            />
          </div>
          <div className="p-3 flex items-center gap-2">
            <span>Signed:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                disabled={isReadOnly}
                checked={isSigned}
                onChange={e => setIsSigned(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="font-bold text-black">{isSigned ? 'E-Signed' : 'Click to Sign'}</span>
            </label>
          </div>
          <div className="p-3 flex items-center gap-2">
            <span>Date:</span>
            <input
              type="date"
              disabled={isReadOnly}
              value={dateCompleted}
              onChange={e => setDateCompleted(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-black flex-1"
            />
          </div>
        </div>
      </div>

      {/* Live Scoring Widget */}
      <div className="glass-card border-brand-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-1.5 flex-1">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Live Audit Scoring Matrix</span>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
              isPassed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
            }`}>
              {isPassed ? 'PASSING' : 'FAILING'}
            </span>
          </h4>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-350 ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${currentScore}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shrink-0">
          <div className="text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Current Score</span>
            <span className={`text-2xl font-black ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>{currentScore}%</span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Target Pass</span>
            <span className="text-2xl font-black text-slate-700 dark:text-slate-350">{dailyWalkaroundConfig.targetScore}%</span>
          </div>
        </div>
      </div>

      {/* High-fidelity custom table */}
      <div className="overflow-x-auto border-2 border-black rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse border-slate-400 min-w-[1100px] text-xs">
          <thead>
            {/* Bright green bg header with black text */}
            <tr className="bg-[#92d050] text-black font-extrabold uppercase border-b-2 border-black text-[11px] sm:text-xs">
              <th className="p-3 border-r border-black w-[30%] align-top">
                Audit Question
              </th>
              <th className="p-3 border-r border-black w-[20%] align-top">
                Documentation (D)<br />Observation (O)<br />Questioning (Q)
              </th>
              <th className="p-3 border-r border-black w-[20%] align-top">
                Comments
              </th>
              <th className="p-3 border-r border-black w-[10%] align-top text-center">
                Yes/No/<br />Not Applicable<br />(N/A)
              </th>
              <th className="p-3 border-r border-black w-[7%] align-top text-center">
                Score
              </th>
              <th className="p-3 w-[18%] align-top">
                Action Plan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black bg-white text-black font-semibold">
            {Object.keys(sectionsMap).map((sectionName) => (
              <React.Fragment key={sectionName}>
                {/* Section Header Row */}
                <tr className="bg-slate-100 border-y border-black font-black text-slate-800">
                  <td colSpan="6" className="p-2.5 pl-3 border-b border-black text-xs font-bold uppercase tracking-wider text-[#25453e]">
                    Section: {sectionName}
                  </td>
                </tr>

                {sectionsMap[sectionName].map((q) => {
                  const ans = answers[q.id] || 'YES';
                  const dqVal = doq[q.id] || '';
                  const commentVal = comments[q.id] || '';
                  const scoreVal = scores[q.id] || '';
                  const apVal = actionPlans[q.id] || '';

                  // Special color highlighting for Question 1 example
                  const isQ1 = q.id === 1;

                  return (
                    <tr key={q.id} className={`hover:bg-slate-50 transition-colors ${isQ1 ? 'bg-red-50/10' : ''}`}>
                      {/* Column 1: Audit Question */}
                      <td className="p-3 border-r border-black align-top font-bold text-slate-900">
                        {q.id}. {q.question}
                        {q.notes && (
                          <div className="text-[10px] text-slate-500 font-semibold italic mt-1">
                            Note: {q.notes}
                          </div>
                        )}
                      </td>

                      {/* Column 2: Documentation / Observation / Questioning */}
                      <td className="p-2 border-r border-black align-top">
                        <textarea
                          disabled={isReadOnly}
                          rows="3"
                          value={dqVal}
                          onChange={e => handleCellChange(q.id, 'doq', e.target.value)}
                          className={`w-full p-1 bg-transparent border border-slate-200 rounded outline-none focus:border-brand-500 text-xs font-medium text-slate-800 ${isQ1 ? 'text-[#c00000] border-transparent font-bold' : ''}`}
                          placeholder="e.g. D: check daily notes..."
                        />
                      </td>

                      {/* Column 3: Comments */}
                      <td className="p-2 border-r border-black align-top">
                        <textarea
                          disabled={isReadOnly}
                          rows="3"
                          value={commentVal}
                          onChange={e => handleCellChange(q.id, 'comment', e.target.value)}
                          className={`w-full p-1 bg-transparent border border-slate-200 rounded outline-none focus:border-brand-500 text-xs font-medium text-slate-800 ${isQ1 ? 'text-[#c00000] border-transparent font-bold' : ''}`}
                          placeholder="Add comments/findings..."
                        />
                      </td>

                      {/* Column 4: Yes/No/NA dropdown selector */}
                      <td className="p-2 border-r border-black align-top text-center">
                        <select
                          disabled={isReadOnly}
                          value={ans}
                          onChange={e => handleCellChange(q.id, 'answer', e.target.value)}
                          className={`p-1 bg-transparent border border-slate-200 rounded font-black text-xs outline-none focus:border-brand-500 text-center ${
                            ans === 'YES' ? 'text-emerald-600' : ans === 'NO' ? 'text-rose-600' : 'text-slate-500'
                          } ${isQ1 ? 'text-[#c00000] border-transparent font-bold' : ''}`}
                        >
                          <option value="YES">Yes</option>
                          <option value="NO">No</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </td>

                      {/* Column 5: Score */}
                      <td className="p-2 border-r border-black align-top text-center">
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={scoreVal}
                          onChange={e => handleCellChange(q.id, 'score', e.target.value)}
                          className={`w-full p-1 bg-transparent border border-slate-200 rounded text-center outline-none focus:border-brand-500 text-xs font-bold text-slate-850 ${isQ1 ? 'text-[#c00000] border-transparent font-bold' : ''}`}
                          placeholder="5/5"
                        />
                      </td>

                      {/* Column 6: Action Plan */}
                      <td className="p-2 align-top">
                        <textarea
                          disabled={isReadOnly}
                          rows="3"
                          value={apVal}
                          onChange={e => handleCellChange(q.id, 'actionPlan', e.target.value)}
                          className={`w-full p-1 bg-transparent border border-slate-200 rounded outline-none focus:border-brand-500 text-xs font-medium text-slate-850 ${isQ1 ? 'text-[#c00000] border-transparent font-bold' : ''}`}
                          placeholder="Describe correction path..."
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

      {/* Form Submit Footer */}
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
            onClick={handleSubmit}
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

export default DailyWalkaroundAudit;
