import React, { useState, useEffect } from 'react';
import { calculateAuditScore } from './AuditScoringEngine';
import AuditActionPlan from './AuditActionPlan';
import { useApp } from '../../../context/AppContext';
import { ShieldCheck, AlertTriangle, Printer, ArrowLeft, CheckCircle } from 'lucide-react';

const BaseAuditForm = ({
  config,
  selectedAudit,
  submitAuditResult,
  setSelectedAudit,
  isEditMode = false,
  customHeaderFields = null, // Extra input elements for the header
  customSections = null,      // Extra sections for tables/cushions/testing
  customDataState = null,     // Custom data object state if needed
  setCustomDataState = null,  // Setter for custom data
  onCalculateCustomScore = null // Custom scoring function override
}) => {
  const { employees } = useApp();
  const isReadOnly = selectedAudit.status === 'Completed' && !isEditMode;

  // State initialization
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [actionPlans, setActionPlans] = useState([]);
  
  const [auditorName, setAuditorName] = useState('');
  const [auditorRole, setAuditorRole] = useState('');
  const [dateCompleted, setDateCompleted] = useState('');
  const [managerComments, setManagerComments] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerSignDate, setManagerSignDate] = useState('');

  // Find assigned officer
  const assignedOfficer = employees.find(e => e.id === selectedAudit.officerId) || employees[0];

  useEffect(() => {
    // Determine if we should load existing details or generate mock details
    if (isReadOnly) {
      if (selectedAudit.details) {
        // Load saved details
        const details = selectedAudit.details;
        setAnswers(details.answers || {});
        setNotes(details.notes || {});
        setActionPlans(details.actionPlans || []);
        setAuditorName(details.signatures?.auditor || assignedOfficer?.name || '');
        setAuditorRole(details.signatures?.auditorRole || assignedOfficer?.title || '');
        setDateCompleted(selectedAudit.lastCompleted || '');
        setManagerComments(details.signatures?.managerComments || 'Standard review completed. All action items resolved.');
        setManagerName(details.signatures?.managerName || 'Sarah Jenkins');
        setManagerSignDate(details.signatures?.managerSignDate || selectedAudit.lastCompleted || '');
        
        if (setCustomDataState && details.customData) {
          setCustomDataState(details.customData);
        }
      } else {
        // Generate mock details based on the score
        const scoreVal = selectedAudit.score !== null ? selectedAudit.score : 100;
        const totalQ = config.questions.length;
        const yesCount = Math.round((totalQ * scoreVal) / 100);
        
        const newAnswers = {};
        const newNotes = {};
        const newActionPlans = [];

        config.questions.forEach((q, idx) => {
          if (idx < yesCount) {
            newAnswers[q.id] = 'YES';
            newNotes[q.id] = 'Compliant during visual check.';
          } else {
            newAnswers[q.id] = 'NO';
            newNotes[q.id] = 'Requires correction.';
            
            // Add a mock action plan row
            newActionPlans.push({
              section: q.section,
              problem: `Issue identified: ${q.question.substring(0, 45)}...`,
              actions: `Rectify and verify compliance for: ${q.question.substring(0, 40)}`,
              responsible: assignedOfficer?.name || 'Care Assistant',
              targetDate: selectedAudit.scheduledDate,
              reviewedBy: 'Sarah Jenkins',
              signedOff: `Completed ${selectedAudit.scheduledDate}`
            });
          }
        });

        setAnswers(newAnswers);
        setNotes(newNotes);
        setActionPlans(newActionPlans);
        setAuditorName(assignedOfficer?.name || '');
        setAuditorRole(assignedOfficer?.title || '');
        setDateCompleted(selectedAudit.lastCompleted || selectedAudit.scheduledDate);
        
        // If it was a failed audit (score < targetScore)
        if (scoreVal < config.targetScore) {
          setManagerComments('Audit failed target threshold. Action plan generated and corrective actions assigned.');
        } else {
          setManagerComments('All standards met or exceeded. Good compliance maintained.');
        }
        setManagerName('Sarah Jenkins');
        setManagerSignDate(selectedAudit.lastCompleted || selectedAudit.scheduledDate);

        // Prepopulate custom data if custom mapping is active
        if (setCustomDataState) {
          // Provide mock fields depending on audit type
          if (config.title === 'Call Bell Audit') {
            setCustomDataState({
              staffOnDuty: 4,
              adultsInService: 15,
              avgResponseTime: '2m 15s',
              expectationTime: '3m 00s',
              actionsIdentified: 'No',
              randomTests: [
                { room: '12', response: '1m 45s', comments: 'Within expectation' },
                { room: '15', response: '2m 10s', comments: 'Within expectation' },
                { room: '8', response: '2m 50s', comments: 'Within expectation' }
              ],
              residentsFeedback: {
                adult1Initials: 'MK',
                adult1Q1: 'YES', adult1Q2: 'YES', adult1Q3: 'Response is quick',
                adult2Initials: 'RT',
                adult2Q1: 'YES', adult2Q2: 'YES', adult2Q3: 'Very friendly staff',
                adult3Initials: 'JW',
                adult3Q1: 'YES', adult3Q2: 'YES', adult3Q3: 'Usually within 2 minutes'
              }
            });
          } else if (config.title.toLowerCase().includes('mattress') || config.title.toLowerCase().includes('cushion')) {
            setCustomDataState({
              establishment: 'Oakfield Care Home',
              unitName: 'Dementia Wing',
              location: 'Room 12 (Bed A)',
              serialNumber: 'MC-9921',
              coverIntegrity: 'YES',
              coverFastening: 'YES',
              waterTest: 'YES',
              coverStains: 'YES',
              mattressStains: 'YES',
              mattressOdour: 'YES',
              handCompression: 'YES'
            });
          }
        }
      }
    } else {
      // In progress / conducting new audit - set default header info
      setAuditorName(assignedOfficer?.name || '');
      setAuditorRole(assignedOfficer?.title || '');
      setDateCompleted(new Date().toISOString().split('T')[0]);
      
      const isMattressOrCushion = config.title.toLowerCase().includes('mattress') || config.title.toLowerCase().includes('cushion');
      const defaultVal = isMattressOrCushion ? 'NO' : 'YES';
      
      // Set default answers based on the audit type
      const defaultAnswers = {};
      const defaultNotes = {};
      config.questions.forEach(q => {
        defaultAnswers[q.id] = defaultVal;
        defaultNotes[q.id] = '';
      });
      setAnswers(defaultAnswers);
      setNotes(defaultNotes);
    }
  }, [selectedAudit, isReadOnly]);

  // Handle answers and calculation
  const handleAnswerChange = (questionId, value) => {
    if (isReadOnly) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNoteChange = (questionId, value) => {
    if (isReadOnly) return;
    setNotes(prev => ({ ...prev, [questionId]: value }));
  };

  // Calculate score
  const isMattressOrCushion = config.title.toLowerCase().includes('mattress') || config.title.toLowerCase().includes('cushion');
  
  const questionsListForScoring = config.questions.map(q => ({
    ...q,
    status: answers[q.id] || (isMattressOrCushion ? 'NO' : 'YES')
  }));

  const standardScoreResult = calculateAuditScore(questionsListForScoring);
  
  // Custom score calculation for Mattress/Cushion audits (any YES response fails the audit)
  const getCustomScore = () => {
    if (isMattressOrCushion) {
      const hasFailure = Object.values(answers).some(val => val === 'YES');
      return {
        possibleScore: config.questions.length,
        naCount: Object.values(answers).filter(val => val === 'N/A').length,
        evaluatedScore: config.questions.length,
        actualScore: hasFailure ? 0 : 100
      };
    }
    return standardScoreResult;
  };
  
  const scoreResult = onCalculateCustomScore 
    ? onCalculateCustomScore(answers, customDataState) 
    : getCustomScore();

  const currentScore = scoreResult.actualScore;
  const isPassed = currentScore >= config.targetScore;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!auditorName || !auditorRole) {
      alert('Please fill in Auditor Name and Role.');
      return;
    }

    const details = {
      answers,
      notes,
      actionPlans,
      customData: customDataState || null,
      signatures: {
        auditor: auditorName,
        auditorRole: auditorRole,
        date: dateCompleted,
        managerComments,
        managerName,
        managerSignDate
      }
    };

    submitAuditResult(selectedAudit.id, currentScore, details);
  };

  const handlePrint = () => {
    window.print();
  };

  // Group questions by section
  const sectionsMap = {};
  config.questions.forEach(q => {
    if (!sectionsMap[q.section]) {
      sectionsMap[q.section] = [];
    }
    sectionsMap[q.section].push(q);
  });

  return (
    <div className="bg-[#fcfdfd] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6 max-w-[1200px] mx-auto print:border-none print:shadow-none print:bg-white print:p-0">
      
      {/* Navigation & Actions Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 print:hidden">
        <button
          onClick={() => setSelectedAudit(null)}
          className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-650 hover:bg-slate-50 flex items-center gap-1.5 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-650 hover:bg-slate-50 flex items-center gap-1.5 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Corporate Letterhead Banner for PDF prints */}
      <div className="text-center space-y-2 border-b-2 border-black pb-5">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">{config.title}</h1>
        <p className="text-xs text-brand-600 font-extrabold uppercase dark:text-brand-400">{config.category} Compliance Program</p>
        <p className="text-[10px] text-slate-400 font-bold">AS CARE OAKFIELD CLINICAL CARE FACILITY</p>
      </div>

      {/* Metadata Fields Section */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 text-xs font-bold text-slate-700 dark:text-slate-300">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase">Audit Target</span>
          <p className="text-slate-900 dark:text-white">{selectedAudit.type}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase">Assigned Auditor</span>
          <p className="text-slate-900 dark:text-white">{assignedOfficer?.name} ({assignedOfficer?.title})</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase">Target Pass Score</span>
          <p className="text-slate-900 dark:text-white">{config.targetScore}%</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase">Status</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
            isReadOnly ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            {isReadOnly ? 'COMPLETED (READ-ONLY)' : 'ACTIVE SESSION'}
          </span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase">Scheduled Date</span>
          <p className="text-slate-900 dark:text-white">{selectedAudit.scheduledDate}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase">Last Completed</span>
          <p className="text-slate-900 dark:text-white">{selectedAudit.lastCompleted || 'Never'}</p>
        </div>

        {/* Custom Header Fields if supplied */}
        {customHeaderFields}
      </div>

      {/* Score and Progress Widget */}
      <div className="glass-card border-brand-200 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Active Audit Scoring Grid</h4>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
              isPassed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
            }`}>
              {isPassed ? 'PASSING' : 'FAILING'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold">
            Calculated as YES count divided by evaluated questions (Total: {config.questions.length} | Evaluated: {scoreResult.evaluatedScore} | N/A: {scoreResult.naCount}).
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-350 ${
                isPassed ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${currentScore}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shrink-0 justify-around sm:justify-start">
          <div className="text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Compliance score</span>
            <span className={`text-2xl font-black ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
              {currentScore}%
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div className="text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Target Pass</span>
            <span className="text-2xl font-black text-slate-700 dark:text-slate-350">
              {config.targetScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Render Custom Forms Sections (e.g. Call Bell Testing / Cushion Metadata) */}
      {customSections}

      {/* Main Checklist Questionnaire */}
      {config.questions.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2 border-slate-100 dark:border-slate-800 uppercase tracking-wide">
            Audit Standards Checklist
          </h3>

          <div className="space-y-8">
            {Object.keys(sectionsMap).map((sectionName) => (
              <div key={sectionName} className="space-y-4">
                {/* Section Subheading */}
                <h4 className="text-xs font-black text-slate-900 bg-slate-100/80 dark:bg-slate-800/80 dark:text-white px-3 py-2 rounded-xl flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-[#4d8b7d] rounded-full" />
                  <span>{sectionName}</span>
                </h4>

                {/* Question List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {sectionsMap[sectionName].map((q) => {
                    const ans = answers[q.id] || 'YES';
                    const note = notes[q.id] || '';
                    
                    return (
                      <div key={q.id} className="py-4 flex flex-col md:flex-row gap-4 items-start justify-between text-xs select-none">
                        
                        {/* Question Text */}
                        <div className="space-y-1.5 flex-1 pr-4">
                          <p className="font-extrabold text-slate-850 dark:text-slate-200 leading-snug">
                            {q.id}. {q.question}
                          </p>
                          {q.notes && (
                            <p className="text-[10px] text-slate-500 font-semibold italic">
                              Note: {q.notes}
                            </p>
                          )}
                        </div>

                        {/* Answers Controls (YES, NO, N/A) */}
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
                          
                          {/* YES/NO/NA Toggle */}
                          <div className="flex border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden shadow-2xs h-8 shrink-0 bg-white dark:bg-slate-900">
                            <button
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => handleAnswerChange(q.id, 'YES')}
                              className={`px-4 text-[10px] font-black uppercase transition-all flex-1 sm:flex-none ${
                                ans === 'YES' 
                                  ? 'bg-emerald-500 text-white shadow-xs' 
                                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => handleAnswerChange(q.id, 'NO')}
                              className={`px-4 text-[10px] font-black uppercase border-x border-slate-200 dark:border-slate-850 transition-all flex-1 sm:flex-none ${
                                ans === 'NO' 
                                  ? 'bg-rose-500 text-white shadow-xs' 
                                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              No
                            </button>
                            <button
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => handleAnswerChange(q.id, 'N/A')}
                              className={`px-4 text-[10px] font-black uppercase transition-all flex-1 sm:flex-none ${
                                ans === 'N/A' 
                                  ? 'bg-slate-400 text-white shadow-xs' 
                                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              N/A
                            </button>
                          </div>

                          {/* Notes/Comments Textbox */}
                          <input 
                            type="text" 
                            disabled={isReadOnly}
                            value={note}
                            onChange={e => handleNoteChange(q.id, e.target.value)}
                            placeholder="Add comments / findings..."
                            className="h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 outline-none focus:border-brand-500 w-full sm:w-[220px] font-medium placeholder:text-slate-400"
                          />
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Corrective Action Plan */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2 border-slate-100 dark:border-slate-800 uppercase tracking-wide">
          Corrective Action Plan
        </h3>
        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
          If any of the standard audit criteria above was marked as <strong className="text-rose-600 uppercase font-black">NO</strong>, a corrective action line must be generated below detailing the path to resolution.
        </p>

        <AuditActionPlan 
          actionPlans={actionPlans} 
          setActionPlans={setActionPlans} 
          isReadOnly={isReadOnly} 
        />
      </div>

      {/* Signatures and Sign-off Panel */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-5 text-xs text-black select-none">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">Audit Verification Signatures</h4>

        <div className="grid gap-5 sm:grid-cols-2 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850 rounded-2xl p-5">
          {/* Auditor Sign-off */}
          <div className="space-y-3">
            <span className="text-[9px] font-black uppercase text-brand-600 dark:text-brand-400">Auditor / Assessor Sign-Off</span>
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
                  value={dateCompleted} 
                  onChange={e => setDateCompleted(e.target.value)} 
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Manager Countersign */}
          <div className="space-y-3">
            <span className="text-[9px] font-black uppercase text-brand-600 dark:text-brand-400">Manager Countersign & Comments</span>
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

      {/* Submit / Action Buttons */}
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

export default BaseAuditForm;
