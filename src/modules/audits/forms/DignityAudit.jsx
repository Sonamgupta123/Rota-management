import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { dignityConfig } from '../configs/dignity.config';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

const DIGNITY_PREFILLED_DATA = {
  1: { doq: 'Obs Q', comment: 'On observations staff were treating residents with respect knocking doors before entering rooms. Covering residents while providing personal care EG – when washing top half of body covering bottom half.', answer: 'YES', score: '1', action: '' },
  2: { doq: '', comment: 'NA', answer: 'N/A', score: '', action: '' },
  3: { doq: 'Obs', comment: 'This was observed on this occasion', answer: 'YES', score: '1', action: '' },
  4: { doq: 'Obs', comment: 'One residents name is actually Derek but however he likes to go by the name of Pat.', answer: 'YES', score: '1', action: '' },
  5: { doq: 'Obs', comment: 'Staff were observed being very polite and courteous towards residents', answer: 'YES', score: '1', action: '' },
  6: { doq: 'Obs', comment: 'Not seen on this occasion.', answer: 'YES', score: '1', action: '' },
  7: { doq: 'Q', comment: 'JE has asked staff if they would like to become dignity in care champion, no one has agreed as yet. Description of role is up on the staff notice board.', answer: 'NO', score: '0', action: '' },
  8: { doq: 'D', comment: 'There are residents monthly meeting and a residents board.', answer: 'YES', score: '1', action: '' },
  9: { doq: 'Obs', comment: 'Staff were observed not using childish language on this occasion.', answer: 'YES', score: '1', action: '' },
  10: { doq: 'Obs', comment: 'Staff were observed being very friendly to residents.', answer: 'YES', score: '1', action: '' },
  11: { doq: 'Obs', comment: 'It was observed that more explanation could be given to resident whist providing support', answer: 'NO', score: '0', action: 'It was felt that clearer instructions and explaining to resident would be more beneficial.' },
  12: { doq: 'Obs', comment: 'Staff were observed supporting resident with personal care and was very patient with resident that took their time.', answer: 'YES', score: '1', action: '' },
  13: { doq: 'Obs', comment: 'Staff remained calm during a difficult situation when a resident was refusing personal care.', answer: 'YES', score: '1', action: '' },
  14: { doq: 'Obs', comment: 'Staff were observed going at residents pace and ensuring that they were supporting the individuals whilst promoting their independence.', answer: 'YES', score: '1', action: '' },
  15: { doq: 'ObsQ', comment: 'Staff were observed shutting curtains and doors when supporting residents within their rooms. Discussion took place around privacy and maintaining residents privacy at all times.', answer: 'YES', score: '1', action: '' },
  16: { doq: 'Obs', comment: 'Staff were observed placing towels over residents when they were supporting with personal care', answer: 'YES', score: '1', action: '' },
  17: { doq: 'ObsQ', comment: 'Staff were observed gaining consent before providing support. Personal care was observed on this occasion. Discussion took place around the importance of gaining consent when providing personal care to check skin integrity', answer: 'YES', score: '1', action: '' },
  18: { doq: '', comment: 'Not seen on this occasion', answer: 'N/A', score: '', action: '' },
  19: { doq: '', comment: 'Not seen on this occasion', answer: 'N/A', score: '', action: '' },
  20: { doq: 'Obs', comment: 'Staff know the residents well and were observed on this occasion not tomake assumptions about their care and support', answer: 'YES', score: '1', action: '' },
  21: { doq: 'Obs', comment: 'Staff member was observed allowing the resident to have choice of what they would like to wear for the day. Even if they were unable to say they were able to point.', answer: 'YES', score: '1', action: '' },
  22: { doq: 'Obs', comment: 'Seen on this occasion', answer: 'YES', score: '1', action: '' },
  23: { doq: 'ObsQ', comment: 'A discussion took place around non verbal residents and how they would know what their support needs are. Staff member was able to say that you could use the flash cards as a prompt. Observation was seen of staff member asking and clarifying with the resident that the support needed was right.', answer: 'YES', score: '1', action: '' },
  24: { doq: '', comment: 'Not seen at this time.', answer: 'N/A', score: '', action: '' },
  25: { doq: 'Obs', comment: 'Staff were seen using the visual menus with residents and no one was seen to be offered alternative as they choose from the menu.', answer: 'YES', score: '1', action: '' },
  26: { doq: '', comment: 'Not seen at this time.', answer: 'N/A', score: '', action: '' },
  27: { doq: 'Obs', comment: 'Staff member was observed ensuring that the resident’s hair was brushed and styled nice following a bath.', answer: 'YES', score: '1', action: '' },
  28: { doq: 'Obs', comment: 'Staff were observed responding to a resident that was anxious by using distraction.', answer: 'YES', score: '1', action: '' },
  29: { doq: 'D', comment: 'Daily notes have been checked and the words that have been used are not always appropriate.', answer: 'NO', score: '0', action: 'Further support with staff needed in the daily care notes with terminology.' },
  30: { doq: 'ObsQ', comment: 'This was observed on this occasion', answer: 'YES', score: '1', action: '' },
  31: { doq: 'Q', comment: 'Staff that were on shift were able to recognise signs of abuse and if unsure would inform the manager', answer: 'YES', score: '1', action: '' },
  32: { doq: 'QD', comment: 'New staff need to complete their training', answer: 'NO', score: '0', action: 'New staff to attend their training as well as staff attending refresher training.' },
  33: { doq: 'Q', comment: 'One member of staff did not know what whistleblowing was.Both staff were able to say that they would raise any concerns that they may have to the manager.', answer: 'NO', score: '0', action: 'Did not feel assured that staff understood the whistleblowing procedure.' },
  34: { doq: 'Obs', comment: 'Staff were observed engaging residents in morning exercise and then some ball games which residents appeared to be enjoying.', answer: 'YES', score: '1', action: '' },
  35: { doq: '', comment: 'Not seen on this occasion', answer: 'N/A', score: '', action: '' },
  36: { doq: 'Obs', comment: 'It was felt that staff could have more interaction with residents even if it with sitting with them while they enter their daily notes rather then sitting away from them.', answer: 'NO', score: '0', action: 'This needs to be discussed with all staff at staff meeting and during 121 supervisions.' },
  37: { doq: '', comment: 'Not seen on this occasion', answer: 'N/A', score: '', action: '' },
  38: { doq: '', comment: 'Not seen on this occasion', answer: 'N/A', score: '', action: '' },
  39: { doq: 'Obs', comment: 'Staff were observed Responding to call bells in a timely manner and completing wellbeing checks on time in accordance with planed care day for residents.', answer: 'YES', score: '1', action: '' },
  40: { doq: '', comment: 'Not seen at this time', answer: 'N/A', score: '', action: '' }
};

const DignityAudit = ({ selectedAudit, submitAuditResult, setSelectedAudit, isEditMode }) => {
  const { employees } = useApp();
  const isReadOnly = selectedAudit.status === 'Completed' && !isEditMode;
  const assignedOfficer = employees.find(e => e.id === selectedAudit.officerId) || employees[0];

  // Core Audit Grid States
  const [answers, setAnswers] = useState({});
  const [doq, setDoq] = useState({});
  const [comments, setComments] = useState({});
  const [scores, setScores] = useState({});
  const [actionPlans, setActionPlans] = useState({});

  // Client Template Metadata States
  const [homeUnit, setHomeUnit] = useState('Swan');
  const [auditDate, setAuditDate] = useState('2026-03-27');
  const [auditingManager, setAuditingManager] = useState('Jo Edmeades');
  const [homeManager, setHomeManager] = useState('Jo Edmeades');
  const [managerSignature, setManagerSignature] = useState('Jo Edmeades');
  const [managerSignDate, setManagerSignDate] = useState('2026-03-27');

  useEffect(() => {
    if (selectedAudit.status === 'Completed') {
      if (selectedAudit.details) {
        const details = selectedAudit.details;
        setAnswers(details.answers || {});
        setDoq(details.doq || {});
        setComments(details.comments || details.notes || {});
        setScores(details.scores || {});
        setActionPlans(details.actionPlans || {});

        setHomeUnit(details.metadata?.homeUnit || 'Swan');
        setAuditDate(details.metadata?.auditDate || '2026-03-27');
        setAuditingManager(details.metadata?.auditingManager || 'Jo Edmeades');
        setHomeManager(details.signatures?.managerName || 'Jo Edmeades');
        setManagerSignature(details.signatures?.managerSignature || 'Jo Edmeades');
        setManagerSignDate(details.signatures?.managerSignDate || '2026-03-27');
      } else {
        // Pre-populate completed details with template pre-filled data
        const tempAnswers = {};
        const tempDoq = {};
        const tempComments = {};
        const tempScores = {};
        const tempActionPlans = {};

        dignityConfig.questions.forEach(q => {
          const defaultData = DIGNITY_PREFILLED_DATA[q.id] || { doq: '', comment: '', answer: 'YES', score: '1', action: '' };
          tempAnswers[q.id] = defaultData.answer;
          tempDoq[q.id] = defaultData.doq;
          tempComments[q.id] = defaultData.comment;
          tempScores[q.id] = defaultData.score;
          tempActionPlans[q.id] = defaultData.action;
        });

        setAnswers(tempAnswers);
        setDoq(tempDoq);
        setComments(tempComments);
        setScores(tempScores);
        setActionPlans(tempActionPlans);
      }
    } else {
      // In-progress or fresh audit session
      const tempAnswers = {};
      const tempDoq = {};
      const tempComments = {};
      const tempScores = {};
      const tempActionPlans = {};

      dignityConfig.questions.forEach(q => {
        // Setup fresh data pre-populated as a guiding default
        const defaultData = DIGNITY_PREFILLED_DATA[q.id] || { doq: '', comment: '', answer: 'YES', score: '1', action: '' };
        tempAnswers[q.id] = defaultData.answer;
        tempDoq[q.id] = defaultData.doq;
        tempComments[q.id] = defaultData.comment;
        tempScores[q.id] = defaultData.score;
        tempActionPlans[q.id] = defaultData.action;
      });

      setAnswers(tempAnswers);
      setDoq(tempDoq);
      setComments(tempComments);
      setScores(tempScores);
      setActionPlans(tempActionPlans);
      setAuditDate(new Date().toISOString().split('T')[0]);
      setManagerSignDate(new Date().toISOString().split('T')[0]);
    }
  }, [selectedAudit, isReadOnly]);

  // Handle inline edits
  const handleCellChange = (qId, field, value) => {
    if (isReadOnly) return;
    if (field === 'answer') {
      setAnswers(prev => ({ ...prev, [qId]: value }));
      setScores(prev => ({ ...prev, [qId]: value === 'YES' ? '1' : value === 'NO' ? '0' : '' }));
    }
    if (field === 'doq') setDoq(prev => ({ ...prev, [qId]: value }));
    if (field === 'comment') setComments(prev => ({ ...prev, [qId]: value }));
    if (field === 'score') setScores(prev => ({ ...prev, [qId]: value }));
    if (field === 'actionPlan') setActionPlans(prev => ({ ...prev, [qId]: value }));
  };

  // Group questions by section
  const sectionsMap = {};
  dignityConfig.questions.forEach(q => {
    if (!sectionsMap[q.section]) {
      sectionsMap[q.section] = [];
    }
    sectionsMap[q.section].push(q);
  });

  // Calculate scores: YES=1, NO=0, N/A or blank ignored
  const getOverallScore = () => {
    let yesCount = 0;
    let noCount = 0;
    dignityConfig.questions.forEach(q => {
      const ans = answers[q.id] || 'YES';
      if (ans === 'YES') yesCount += 1;
      if (ans === 'NO') noCount += 1;
    });
    const totalAnswered = yesCount + noCount;
    if (totalAnswered === 0) return 100;
    return Math.round((yesCount / totalAnswered) * 100);
  };

  const calculatedScore = getOverallScore();
  const calculatedActionsCount = Object.values(answers).filter(val => val === 'NO').length;

  const getRagRating = (score) => {
    if (score >= 90) return { label: 'GREEN', color: 'text-green-600 font-extrabold', bg: 'bg-green-100 border-green-400' };
    if (score >= 75) return { label: 'AMBER', color: 'text-amber-600 font-extrabold', bg: 'bg-amber-100 border-amber-400' };
    return { label: 'RED', color: 'text-red-600 font-extrabold', bg: 'bg-red-100 border-red-400' };
  };

  const rag = getRagRating(calculatedScore);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!auditingManager) {
      alert('Please fill in Auditing Manager.');
      return;
    }

    const details = {
      answers,
      doq,
      comments,
      scores,
      actionPlans,
      metadata: {
        homeUnit,
        auditDate,
        auditingManager,
        actionsCount: calculatedActionsCount.toString(),
        score: calculatedScore
      },
      signatures: {
        managerName: homeManager,
        managerSignature,
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

      {/* Corporate Title Block with AS CARE Logo */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Quality & Compliance – Swan Care Home - Dignity Audit for Manager/Service Managers
          </h1>
          <p className="text-xs text-slate-500 font-bold">
            The completed audit gives a true reflection of the control effectiveness of Dignity in the home
          </p>
        </div>
        <img src={logoImg} alt="AS CARE" className="h-12 object-contain shrink-0" />
      </div>

      {/* Word-like Metadata Box */}
      <div className="border border-black bg-white text-black text-xs font-bold w-full overflow-hidden select-none">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black">
          <div className="p-2.5 flex items-center gap-2">
            <span>Home/Unit:</span>
            <input
              type="text"
              disabled={isReadOnly}
              value={homeUnit}
              onChange={e => setHomeUnit(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-black flex-1"
            />
          </div>
          <div className="p-2.5 flex items-center gap-2">
            <span>Audit Date:</span>
            <input
              type="date"
              disabled={isReadOnly}
              value={auditDate}
              onChange={e => setAuditDate(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-black flex-1"
            />
          </div>
          <div className="p-2.5 flex items-center gap-2">
            <span>Auditing Manager:</span>
            <input
              type="text"
              disabled={isReadOnly}
              value={auditingManager}
              onChange={e => setAuditingManager(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-black flex-1"
            />
          </div>
        </div>
        <div className="border-t border-black p-2.5 bg-slate-50 text-center font-bold text-[11px] uppercase tracking-wider">
          The completed audit gives a true reflection of the control effectiveness of Dignity in the home
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black border-t border-black">
          <div className="p-2.5 flex items-center gap-2">
            <span>Home Manager:</span>
            <input
              type="text"
              disabled={isReadOnly}
              value={homeManager}
              onChange={e => setHomeManager(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-black flex-1"
            />
          </div>
          <div className="p-2.5 flex items-center gap-2">
            <span>Signed:</span>
            <input
              type="text"
              disabled={isReadOnly}
              value={managerSignature}
              onChange={e => setManagerSignature(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-black flex-1"
            />
          </div>
          <div className="p-2.5 flex items-center gap-2">
            <span>Date:</span>
            <input
              type="date"
              disabled={isReadOnly}
              value={managerSignDate}
              onChange={e => setManagerSignDate(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-black flex-1"
            />
          </div>
        </div>
      </div>

      {/* Scoring Card Panel */}
      <div className="grid gap-6 md:grid-cols-2 select-none">
        
        {/* Left Status metrics */}
        <div className="border border-[#70ad47] dark:border-slate-800 rounded-lg p-5 bg-white dark:bg-slate-900 space-y-4 shadow-2xs">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
            Live Compliance Rating
          </h4>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-350 ${
                calculatedScore >= 90 ? 'bg-emerald-500' : calculatedScore >= 75 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${calculatedScore}%` }}
            />
          </div>
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl p-3 inline-flex">
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Calculated Rating</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{calculatedScore}%</span>
            </div>
            <div className="h-6 w-px bg-slate-350 dark:bg-slate-800" />
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">RAG Status</span>
              <span className={`text-xs font-black uppercase ${rag.color}`}>{rag.label}</span>
            </div>
          </div>
        </div>

        {/* Right side Scoring guide */}
        <div className="border border-[#70ad47] dark:border-[#548235] rounded-lg p-5 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
          <h3 className="text-sm font-black text-[#548235] dark:text-[#70ad47] border-b border-slate-100 dark:border-slate-800 pb-1.5 uppercase">Scoring Criteria</h3>
          <ul className="space-y-1.5 text-xs font-bold">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-emerald-600 dark:text-emerald-455">90% and above = GREEN</span>
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
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold italic">
            To score – YES = 1, NO = 0. Answered fields calculate the percentage of compliance dynamically.
          </p>
        </div>
      </div>

      {/* High-fidelity custom table */}
      <div className="overflow-x-auto border-2 border-black rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse border-slate-400 min-w-[1100px] text-xs">
          <thead>
            {/* Bright green bg header with black text matching template screenshot */}
            <tr className="bg-[#92d050] text-black font-extrabold uppercase border-b-2 border-black text-[11px] sm:text-xs">
              <th className="p-3 border-r border-black w-[35%] align-top text-left font-black">
                Audit Question
              </th>
              <th className="p-3 border-r border-black w-[12%] align-top text-left font-black">
                Documentation (D)<br />Observation (O)<br />Questioning (Q)
              </th>
              <th className="p-3 border-r border-black w-[25%] align-top text-left font-black">
                Comments
              </th>
              <th className="p-3 border-r border-black w-[12%] align-top text-center font-black">
                Yes/No/<br />Not Applicable<br />(N/A)
              </th>
              <th className="p-3 border-r border-black w-[6%] align-top text-center font-black">
                Score
              </th>
              <th className="p-3 w-[10%] align-top text-left font-black">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black bg-white text-black font-semibold">
            {Object.keys(sectionsMap).map((sectionName) => (
              <React.Fragment key={sectionName}>
                {/* Section Header Row */}
                <tr className="bg-slate-100 border-y border-black font-black text-slate-800">
                  <td colSpan="6" className="p-2.5 pl-3 border-b border-black text-xs font-black uppercase tracking-wider text-[#25453e]">
                    Section: {sectionName}
                  </td>
                </tr>

                {sectionsMap[sectionName].map((q) => {
                  const ans = answers[q.id] || 'YES';
                  const dqVal = doq[q.id] || '';
                  const commentVal = comments[q.id] || '';
                  const scoreVal = scores[q.id] || '';
                  const apVal = actionPlans[q.id] || '';

                  return (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors border-b border-black">
                      {/* Column 1: Audit Question */}
                      <td className="p-3 border-r border-black align-top font-bold text-slate-900 w-[35%]">
                        {q.id}. {q.question}
                      </td>

                      {/* Column 2: Documentation / Observation / Questioning */}
                      <td className="p-2 border-r border-black align-top w-[12%]">
                        <textarea
                          disabled={isReadOnly}
                          rows="3"
                          value={dqVal}
                          onChange={e => handleCellChange(q.id, 'doq', e.target.value)}
                          className="w-full p-1.5 bg-transparent border border-slate-200 rounded outline-none focus:border-[#70ad47] text-xs font-semibold text-slate-850"
                          placeholder="e.g. Obs, ObsQ, D..."
                        />
                      </td>

                      {/* Column 3: Comments */}
                      <td className="p-2 border-r border-black align-top w-[25%]">
                        <textarea
                          disabled={isReadOnly}
                          rows="3"
                          value={commentVal}
                          onChange={e => handleCellChange(q.id, 'comment', e.target.value)}
                          className="w-full p-1.5 bg-transparent border border-slate-200 rounded outline-none focus:border-[#70ad47] text-xs font-semibold text-slate-850"
                          placeholder="Comments..."
                        />
                      </td>

                      {/* Column 4: Yes/No/NA select option */}
                      <td className="p-2 border-r border-black align-top text-center w-[12%]">
                        <select
                          disabled={isReadOnly}
                          value={ans}
                          onChange={e => handleCellChange(q.id, 'answer', e.target.value)}
                          className={`p-1 bg-transparent border border-slate-200 rounded font-black text-xs outline-none focus:border-[#70ad47] text-center ${
                            ans === 'YES' ? 'text-emerald-600' : ans === 'NO' ? 'text-rose-600' : 'text-slate-500'
                          }`}
                        >
                          <option value="YES">Yes</option>
                          <option value="NO">No</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </td>

                      {/* Column 5: Score */}
                      <td className="p-2 border-r border-black align-top text-center w-[6%]">
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={scoreVal}
                          onChange={e => handleCellChange(q.id, 'score', e.target.value)}
                          className="w-full p-1 bg-transparent border border-slate-200 rounded text-center outline-none focus:border-[#70ad47] text-xs font-bold text-slate-850"
                          placeholder="Score"
                        />
                      </td>

                      {/* Column 6: Actions */}
                      <td className="p-2 align-top w-[10%]">
                        <textarea
                          disabled={isReadOnly}
                          rows="3"
                          value={apVal}
                          onChange={e => handleCellChange(q.id, 'actionPlan', e.target.value)}
                          className="w-full p-1.5 bg-transparent border border-slate-200 rounded outline-none focus:border-[#70ad47] text-xs font-semibold text-slate-850"
                          placeholder="Actions required..."
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

export default DignityAudit;
