import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

const CallBellAudit = ({ selectedAudit, submitAuditResult, setSelectedAudit, isEditMode }) => {
  const { employees } = useApp();
  const isReadOnly = selectedAudit.status === 'Completed' && !isEditMode;
  const assignedOfficer = employees.find(e => e.id === selectedAudit.officerId) || employees[0];

  // Metadata States
  const [completedBy, setCompletedBy] = useState('');
  const [dateCompleted, setDateCompleted] = useState('');
  const [staffOnDuty, setStaffOnDuty] = useState('');
  const [adultsInService, setAdultsInService] = useState('');

  // Checklist Answers & Comments for Visual Inspection (4 Questions)
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState({});

  // Random Testing Grid (5 Rows)
  const [randomTests, setRandomTests] = useState([
    { room: '', response: '', comments: '' },
    { room: '', response: '', comments: '' },
    { room: '', response: '', comments: '' },
    { room: '', response: '', comments: '' },
    { room: '', response: '', comments: '' }
  ]);
  const [avgResponseTime, setAvgResponseTime] = useState('');
  const [expectationTime, setExpectationTime] = useState('3m 00s');
  const [actionsIdentified, setActionsIdentified] = useState('No');

  // Call Bell Feedback from Residents (3 Adults)
  const [feedback, setFeedback] = useState([
    { initials: '', q1: 'YES', q2: 'YES', comments: '' },
    { initials: '', q1: 'YES', q2: 'YES', comments: '' },
    { initials: '', q1: 'YES', q2: 'YES', comments: '' }
  ]);

  // Action Plan Grid (3 Rows)
  const [actionPlans, setActionPlans] = useState([
    { finding: '', action: '', responsible: '', date: '', signed: '' },
    { finding: '', action: '', responsible: '', date: '', signed: '' },
    { finding: '', action: '', responsible: '', date: '', signed: '' }
  ]);

  // Signatures
  const [assessorName, setAssessorName] = useState('');
  const [assessorRole, setAssessorRole] = useState('');
  const [managerComments, setManagerComments] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerSignDate, setManagerSignDate] = useState('');

  useEffect(() => {
    if (selectedAudit.status === 'Completed') {
      if (selectedAudit.details) {
        const details = selectedAudit.details;
        setCompletedBy(details.metadata?.completedBy || '');
        setDateCompleted(details.metadata?.dateCompleted || selectedAudit.lastCompleted || selectedAudit.scheduledDate);
        setStaffOnDuty(details.metadata?.staffOnDuty || '');
        setAdultsInService(details.metadata?.adultsInService || '');

        setAnswers(details.answers || {});
        setComments(details.comments || {});
        setRandomTests(details.randomTests || [
          { room: '', response: '', comments: '' },
          { room: '', response: '', comments: '' },
          { room: '', response: '', comments: '' },
          { room: '', response: '', comments: '' },
          { room: '', response: '', comments: '' }
        ]);
        setAvgResponseTime(details.metadata?.avgResponseTime || '');
        setExpectationTime(details.metadata?.expectationTime || '3m 00s');
        setActionsIdentified(details.metadata?.actionsIdentified || 'No');

        setFeedback(details.feedback || [
          { initials: '', q1: 'YES', q2: 'YES', comments: '' },
          { initials: '', q1: 'YES', q2: 'YES', comments: '' },
          { initials: '', q1: 'YES', q2: 'YES', comments: '' }
        ]);

        setActionPlans(details.actionPlans || [
          { finding: '', action: '', responsible: '', date: '', signed: '' },
          { finding: '', action: '', responsible: '', date: '', signed: '' },
          { finding: '', action: '', responsible: '', date: '', signed: '' }
        ]);

        setAssessorName(details.signatures?.assessor || '');
        setAssessorRole(details.signatures?.role || '');
        setManagerComments(details.signatures?.managerComments || 'Standard call bell responses reviewed.');
        setManagerName(details.signatures?.managerName || 'Sarah Jenkins');
        setManagerSignDate(details.signatures?.managerSignDate || selectedAudit.lastCompleted || selectedAudit.scheduledDate);
      } else {
        // Pre-populate completed details with mock data
        setCompletedBy(assignedOfficer?.name || '');
        setDateCompleted(selectedAudit.lastCompleted || selectedAudit.scheduledDate);
        setStaffOnDuty('4');
        setAdultsInService('16');

        const mockAnswers = {
          1: 'YES',
          2: 'YES',
          3: 'YES',
          4: 'YES'
        };
        const mockComments = {
          1: 'Clean and fully functional buttons',
          2: 'Reach checks completed in bedrooms',
          3: 'Communal areas accessible',
          4: 'Bells situated within direct resident reach'
        };
        setAnswers(mockAnswers);
        setComments(mockComments);

        setRandomTests([
          { room: 'Room 4', response: '1m 15s', comments: 'Prompt assistance' },
          { room: 'Room 12', response: '2m 10s', comments: 'Assisting resident' },
          { room: 'Room 9', response: '1m 30s', comments: 'Within normal limits' },
          { room: 'Room 18', response: '1m 55s', comments: 'Checked okay' },
          { room: 'Room 2', response: '1m 05s', comments: 'Immediate response' }
        ]);
        setAvgResponseTime('1m 35s');
        setExpectationTime('3m 00s');
        setActionsIdentified('No');

        setFeedback([
          { initials: 'MR', q1: 'YES', q2: 'YES', comments: 'Carers respond very quickly.' },
          { initials: 'GB', q1: 'YES', q2: 'YES', comments: 'Yes, they help me straight away.' },
          { initials: 'DF', q1: 'YES', q2: 'YES', comments: 'Usually quick, sometimes busy.' }
        ]);

        setActionPlans([
          { finding: '', action: '', responsible: '', date: '', signed: '' },
          { finding: '', action: '', responsible: '', date: '', signed: '' },
          { finding: '', action: '', responsible: '', date: '', signed: '' }
        ]);

        setAssessorName(assignedOfficer?.name || '');
        setAssessorRole(assignedOfficer?.title || 'Care Lead');
        setManagerComments('Call bell response times verified. Standards maintained.');
        setManagerName('Sarah Jenkins');
        setManagerSignDate(selectedAudit.lastCompleted || selectedAudit.scheduledDate);
      }
    } else {
      // In-progress or fresh session setup
      setCompletedBy(assignedOfficer?.name || '');
      setDateCompleted(new Date().toISOString().split('T')[0]);
      setStaffOnDuty('');
      setAdultsInService('');

      setAnswers({ 1: 'YES', 2: 'YES', 3: 'YES', 4: 'YES' });
      setComments({ 1: '', 2: '', 3: '', 4: '' });

      setRandomTests([
        { room: '', response: '', comments: '' },
        { room: '', response: '', comments: '' },
        { room: '', response: '', comments: '' },
        { room: '', response: '', comments: '' },
        { room: '', response: '', comments: '' }
      ]);
      setAvgResponseTime('');
      setExpectationTime('3m 00s');
      setActionsIdentified('No');

      setFeedback([
        { initials: '', q1: 'YES', q2: 'YES', comments: '' },
        { initials: '', q1: 'YES', q2: 'YES', comments: '' },
        { initials: '', q1: 'YES', q2: 'YES', comments: '' }
      ]);

      setActionPlans([
        { finding: '', action: '', responsible: '', date: '', signed: '' },
        { finding: '', action: '', responsible: '', date: '', signed: '' },
        { finding: '', action: '', responsible: '', date: '', signed: '' }
      ]);

      setAssessorName(assignedOfficer?.name || '');
      setAssessorRole(assignedOfficer?.title || '');
      setManagerComments('');
      setManagerName('Sarah Jenkins');
      setManagerSignDate(new Date().toISOString().split('T')[0]);
    }
  }, [selectedAudit, isReadOnly]);

  // Handle updates
  const handleAnswerChange = (idx, value) => {
    if (isReadOnly) return;
    setAnswers(prev => ({ ...prev, [idx]: value }));
  };

  const handleCommentChange = (idx, value) => {
    if (isReadOnly) return;
    setComments(prev => ({ ...prev, [idx]: value }));
  };

  const handleRandomTestChange = (index, field, value) => {
    if (isReadOnly) return;
    const updated = [...randomTests];
    updated[index] = { ...updated[index], [field]: value };
    setRandomTests(updated);
  };

  const handleFeedbackChange = (index, field, value) => {
    if (isReadOnly) return;
    const updated = [...feedback];
    updated[index] = { ...updated[index], [field]: value };
    setFeedback(updated);
  };

  const handleActionPlanChange = (index, field, value) => {
    if (isReadOnly) return;
    const updated = [...actionPlans];
    updated[index] = { ...updated[index], [field]: value };
    setActionPlans(updated);
  };

  // Score calculation: YES=1, NO=0 for visual inspection items
  const getOverallScore = () => {
    let scoreCount = 0;
    [1, 2, 3, 4].forEach(idx => {
      if (answers[idx] === 'YES') {
        scoreCount += 1;
      }
    });
    // Add feedback score: check if residents know call bell purpose & usage (total 6 questions)
    let feedbackYes = 0;
    let feedbackTotal = 0;
    feedback.forEach(f => {
      if (f.initials) {
        feedbackTotal += 2;
        if (f.q1 === 'YES') feedbackYes += 1;
        if (f.q2 === 'YES') feedbackYes += 1;
      }
    });

    const totalYes = scoreCount + feedbackYes;
    const totalPossible = 4 + feedbackTotal;
    if (totalPossible === 0) return 100;
    return Math.round((totalYes / totalPossible) * 100);
  };

  const calculatedScore = getOverallScore();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!assessorName || !assessorRole) {
      alert('Please fill in Assessor Name and Role.');
      return;
    }

    const details = {
      answers,
      comments,
      randomTests,
      feedback,
      actionPlans,
      metadata: {
        completedBy,
        dateCompleted,
        staffOnDuty,
        adultsInService,
        avgResponseTime,
        expectationTime,
        actionsIdentified,
        score: calculatedScore
      },
      signatures: {
        assessor: assessorName,
        role: assessorRole,
        date: dateCompleted,
        managerComments,
        managerName,
        managerSignDate
      }
    };

    submitAuditResult(selectedAudit.id, calculatedScore, details);
    setSelectedAudit(null);
  };

  const criteriaList = [
    { id: 1, text: 'Each call bell is clean, buttons in place and in a working condition?' },
    { id: 2, text: 'Call bells in rooms are within reach of the bed?' },
    { id: 3, text: 'Call bells in communal areas are located within reaching distance?' },
    { id: 4, text: 'Adults in their rooms have their call bell with them?' }
  ];

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

      {/* Title Header with logo */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-205 dark:border-slate-800 pb-4 select-none">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Call Bell Audit
        </h1>
        <img src={logoImg} alt="AS CARE" className="h-10 object-contain shrink-0" />
      </div>

      {/* Main Table Grid matching Word formatting */}
      <div className="overflow-x-auto border-2 border-black rounded-lg shadow-sm mt-4 bg-white dark:bg-slate-950 text-black select-none dark:text-white">
        <table className="w-full text-left border-collapse min-w-[1100px] text-xs">
          <tbody>
            
            {/* Top Metadata Section */}
            <tr className="border-b border-black">
              <td className="p-3 bg-[#d9e1f2] dark:bg-slate-850 font-black border-r border-black w-[15%]">Completed By:</td>
              <td className="p-2 w-[35%] border-r border-black bg-white dark:bg-slate-900">
                <input 
                  type="text" 
                  disabled={isReadOnly}
                  value={completedBy} 
                  onChange={e => setCompletedBy(e.target.value)} 
                  className="w-full bg-transparent border-none outline-none font-bold text-slate-850 dark:text-slate-100"
                  placeholder="Assessor name"
                />
              </td>
              <td className="p-3 bg-[#d9e1f2] dark:bg-slate-850 font-black border-r border-black w-[15%]">Date Completed:</td>
              <td className="p-2 bg-white dark:bg-slate-900">
                <input 
                  type="date" 
                  disabled={isReadOnly}
                  value={dateCompleted} 
                  onChange={e => setDateCompleted(e.target.value)} 
                  className="w-full bg-transparent border-none outline-none font-bold text-slate-850 dark:text-slate-100"
                />
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-3 bg-[#d9e1f2] dark:bg-slate-850 font-black border-r border-black">Number of Staff on Duty:</td>
              <td className="p-2 border-r border-black bg-white dark:bg-slate-900">
                <input 
                  type="number" 
                  disabled={isReadOnly}
                  value={staffOnDuty} 
                  onChange={e => setStaffOnDuty(e.target.value)} 
                  className="w-full bg-transparent border-none outline-none font-bold text-slate-850 dark:text-slate-100"
                  placeholder="Staff count"
                />
              </td>
              <td className="p-3 bg-[#d9e1f2] dark:bg-slate-850 font-black border-r border-black">Number of Adults in Service:</td>
              <td className="p-2 bg-white dark:bg-slate-900">
                <input 
                  type="number" 
                  disabled={isReadOnly}
                  value={adultsInService} 
                  onChange={e => setAdultsInService(e.target.value)} 
                  className="w-full bg-transparent border-none outline-none font-bold text-slate-850 dark:text-slate-100"
                  placeholder="Resident count"
                />
              </td>
            </tr>

            {/* Standard Headers Row */}
            <tr className="bg-[#d9e1f2] dark:bg-slate-800 text-[11px] font-black uppercase text-center border-b border-black">
              <td className="p-2.5 border-r border-black w-[20%] text-left font-black">Standard</td>
              <td className="p-2.5 border-r border-black w-[40%] text-left font-black">Criteria</td>
              <td className="p-2.5 border-r border-black w-[7%] font-black">Yes</td>
              <td className="p-2.5 border-r border-black w-[7%] font-black">No</td>
              <td className="p-2.5 font-black text-left">Comments</td>
            </tr>

            {/* Visual Inspection Section */}
            {criteriaList.map((item, idx) => {
              const ans = answers[item.id] || 'YES';
              const comment = comments[item.id] || '';
              return (
                <tr key={item.id} className="border-b border-black hover:bg-slate-50 dark:hover:bg-slate-900/30">
                  {idx === 0 && (
                    <td 
                      rowSpan="4" 
                      className="p-3 bg-[#f2f2f2] dark:bg-slate-850 border-r border-black font-black text-[#1f3864] text-center uppercase tracking-wide align-middle"
                    >
                      Visual Inspection of Call Bells
                    </td>
                  )}
                  <td className="p-3 border-r border-black font-bold align-middle">
                    {item.text}
                  </td>
                  <td className="p-3 border-r border-black text-center align-middle">
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      checked={ans === 'YES'}
                      onChange={() => handleAnswerChange(item.id, 'YES')}
                      className="h-4.5 w-4.5 rounded border-slate-350 text-[#1f3864] focus:ring-[#1f3864] cursor-pointer disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="p-3 border-r border-black text-center align-middle">
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      checked={ans === 'NO'}
                      onChange={() => handleAnswerChange(item.id, 'NO')}
                      className="h-4.5 w-4.5 rounded border-slate-355 text-rose-600 focus:ring-rose-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="p-2 align-middle">
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={comment}
                      onChange={e => handleCommentChange(item.id, e.target.value)}
                      className="w-full p-1.5 bg-transparent border border-slate-205 dark:border-slate-800 rounded outline-none focus:border-[#d9e1f2] text-xs font-semibold text-slate-850 dark:text-slate-100"
                      placeholder="Add inspection details..."
                    />
                  </td>
                </tr>
              );
            })}

            {/* Random Testing Section */}
            <tr className="border-b border-black">
              <td 
                rowSpan="8" 
                className="p-3 bg-[#f2f2f2] dark:bg-slate-850 border-r border-black font-black text-[#1f3864] text-center uppercase tracking-wide align-middle"
              >
                Random Testing
              </td>
              <td className="p-2.5 bg-[#d9e1f2] dark:bg-slate-800 font-black border-r border-black">Room number</td>
              <td colSpan="2" className="p-2.5 bg-[#d9e1f2] dark:bg-slate-800 font-black border-r border-black text-center">Response Time</td>
              <td className="p-2.5 bg-[#d9e1f2] dark:bg-slate-800 font-black text-left">Comments</td>
            </tr>

            {randomTests.map((test, index) => (
              <tr key={index} className="border-b border-black hover:bg-slate-50 dark:hover:bg-slate-900/30">
                <td className="p-2 border-r border-black">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={test.room}
                    onChange={e => handleRandomTestChange(index, 'room', e.target.value)}
                    className="w-full p-1 bg-transparent border border-slate-205 dark:border-slate-800 rounded outline-none text-xs font-semibold"
                    placeholder={`e.g. Room ${index + 1}`}
                  />
                </td>
                <td colSpan="2" className="p-2 border-r border-black">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={test.response}
                    onChange={e => handleRandomTestChange(index, 'response', e.target.value)}
                    className="w-full p-1 bg-transparent border border-slate-205 dark:border-slate-800 rounded outline-none text-xs font-semibold text-center"
                    placeholder="e.g. 1m 45s"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={test.comments}
                    onChange={e => handleRandomTestChange(index, 'comments', e.target.value)}
                    className="w-full p-1 bg-transparent border border-slate-205 dark:border-slate-800 rounded outline-none text-xs font-semibold"
                    placeholder="Comments..."
                  />
                </td>
              </tr>
            ))}

            {/* Average and Expectation times row */}
            <tr className="border-b border-black bg-slate-50 dark:bg-slate-900/40">
              <td className="p-2.5 border-r border-black font-bold flex items-center justify-between">
                <span>Average Response time:</span>
                <input 
                  type="text"
                  disabled={isReadOnly}
                  value={avgResponseTime}
                  onChange={e => handleCustomDataChange('avgResponseTime', e.target.value)}
                  className="h-7 px-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded font-bold text-xs outline-none w-28 text-center"
                  placeholder="e.g. 1m 30s"
                />
              </td>
              <td colSpan="2" className="p-2.5 border-r border-black font-bold text-center">
                <span className="block text-[9px] uppercase text-slate-400">Expectation Time</span>
                <input 
                  type="text"
                  disabled={isReadOnly}
                  value={expectationTime}
                  onChange={e => handleCustomDataChange('expectationTime', e.target.value)}
                  className="h-7 px-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded font-bold text-xs outline-none w-24 text-center mt-1"
                  placeholder="3m 00s"
                />
              </td>
              <td className="p-2.5 font-bold flex items-center gap-4">
                <span>Any Actions Identified?</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      checked={actionsIdentified === 'Yes'}
                      onChange={() => setActionsIdentified('Yes')}
                      className="h-4 w-4 rounded border-slate-350 text-[#1f3864] focus:ring-[#1f3864]"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      checked={actionsIdentified === 'No'}
                      onChange={() => setActionsIdentified('No')}
                      className="h-4 w-4 rounded border-slate-355 text-rose-600 focus:ring-rose-500"
                    />
                    <span>No</span>
                  </label>
                </div>
              </td>
            </tr>

            {/* Resident Feedback Section Header */}
            <tr className="bg-[#d9e1f2] dark:bg-slate-800 text-center border-b border-black">
              <td colSpan="5" className="p-3 text-xs font-black uppercase tracking-wider text-[#1f3864] dark:text-blue-300">
                Call Bell feedback from Residents
              </td>
            </tr>

            {/* Resident Feedback Table headers */}
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-black text-center font-bold text-[11px] text-slate-500">
              <td className="p-2 border-r border-black text-left">Adult</td>
              <td className="p-2 border-r border-black">Initials</td>
              <td className="p-2 border-r border-black w-[25%]">Do you know what call bell is for?</td>
              <td className="p-2 border-r border-black w-[25%]">Do you know how to use it?</td>
              <td className="p-2 text-left">If you use call bell, response comments</td>
            </tr>

            {/* Feedback rows */}
            {feedback.map((f, index) => (
              <tr key={index} className="border-b border-black hover:bg-slate-50 dark:hover:bg-slate-900/30">
                <td className="p-3 border-r border-black font-black text-[#1f3864] dark:text-blue-400">
                  Adult {index + 1}
                </td>
                <td className="p-2 border-r border-black">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={f.initials}
                    onChange={e => handleFeedbackChange(index, 'initials', e.target.value)}
                    className="w-full p-1 bg-transparent border border-slate-205 dark:border-slate-800 rounded outline-none text-center font-bold"
                    placeholder="Initials"
                  />
                </td>
                <td className="p-2 border-r border-black text-center">
                  <select
                    disabled={isReadOnly}
                    value={f.q1}
                    onChange={e => handleFeedbackChange(index, 'q1', e.target.value)}
                    className="p-1 bg-transparent border border-slate-205 dark:border-slate-800 rounded font-black outline-none"
                  >
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                  </select>
                </td>
                <td className="p-2 border-r border-black text-center">
                  <select
                    disabled={isReadOnly}
                    value={f.q2}
                    onChange={e => handleFeedbackChange(index, 'q2', e.target.value)}
                    className="p-1 bg-transparent border border-slate-205 dark:border-slate-800 rounded font-black outline-none"
                  >
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={f.comments}
                    onChange={e => handleFeedbackChange(index, 'comments', e.target.value)}
                    className="w-full p-1 bg-transparent border border-slate-205 dark:border-slate-800 rounded outline-none"
                    placeholder="Resident response comments..."
                  />
                </td>
              </tr>
            ))}

            {/* Action Plan Section Header */}
            <tr className="bg-[#d9e1f2] dark:bg-slate-800 text-center border-b border-black">
              <td colSpan="5" className="p-3 text-xs font-black uppercase tracking-wider text-[#1f3864] dark:text-blue-300">
                Action Plan
              </td>
            </tr>

            {/* Action Plan headers */}
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-black text-center font-bold text-[11px] text-slate-500">
              <td className="p-2 border-r border-black">Finding</td>
              <td className="p-2 border-r border-black">Action Required</td>
              <td className="p-2 border-r border-black">Responsible Person</td>
              <td className="p-2 border-r border-black">Date Completed</td>
              <td className="p-2">Sign When Completed</td>
            </tr>

            {/* Action Plan rows */}
            {actionPlans.map((ap, index) => (
              <tr key={index} className="border-b border-black hover:bg-slate-50 dark:hover:bg-slate-900/30">
                <td className="p-2 border-r border-black">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={ap.finding}
                    onChange={e => handleActionPlanChange(index, 'finding', e.target.value)}
                    className="w-full p-1 bg-transparent border border-slate-205 dark:border-slate-800 rounded outline-none"
                    placeholder="Describe gap..."
                  />
                </td>
                <td className="p-2 border-r border-black">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={ap.action}
                    onChange={e => handleActionPlanChange(index, 'action', e.target.value)}
                    className="w-full p-1 bg-transparent border border-slate-205 dark:border-slate-800 rounded outline-none"
                    placeholder="Action step"
                  />
                </td>
                <td className="p-2 border-r border-black">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={ap.responsible}
                    onChange={e => handleActionPlanChange(index, 'responsible', e.target.value)}
                    className="w-full p-1 bg-transparent border border-slate-205 dark:border-slate-800 rounded outline-none"
                    placeholder="Staff name"
                  />
                </td>
                <td className="p-2 border-r border-black">
                  <input
                    type="date"
                    disabled={isReadOnly}
                    value={ap.date}
                    onChange={e => handleActionPlanChange(index, 'date', e.target.value)}
                    className="w-full p-1 bg-transparent border-none outline-none"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={ap.signed}
                    onChange={e => handleActionPlanChange(index, 'signed', e.target.value)}
                    className="w-full p-1 bg-transparent border border-slate-205 dark:border-slate-800 rounded outline-none"
                    placeholder="Signature sign-off"
                  />
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

      {/* Assessors & Manager Sign-off Block */}
      <div className="border border-black bg-white text-black text-xs font-bold w-full overflow-hidden select-none dark:bg-slate-950 dark:text-white dark:border-slate-800 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black dark:divide-slate-800">
          <div className="p-2.5 flex items-center gap-2">
            <span>Assessors Signature:</span>
            <input
              type="text"
              disabled={isReadOnly}
              value={assessorName}
              onChange={e => setAssessorName(e.target.value)}
              className="bg-transparent border-none outline-none font-bold flex-1 dark:text-slate-100 text-black"
              placeholder="Signature Name"
            />
          </div>
          <div className="p-2.5 flex items-center gap-2">
            <span>Role:</span>
            <input
              type="text"
              disabled={isReadOnly}
              value={assessorRole}
              onChange={e => setAssessorRole(e.target.value)}
              className="bg-transparent border-none outline-none font-bold flex-1 dark:text-slate-100 text-black"
              placeholder="e.g. Care Manager"
            />
          </div>
          <div className="p-2.5 flex items-center gap-2">
            <span>Date:</span>
            <input
              type="date"
              disabled={isReadOnly}
              value={dateCompleted}
              onChange={e => setDateCompleted(e.target.value)}
              className="bg-transparent border-none outline-none font-bold flex-1 dark:text-slate-100 text-black"
            />
          </div>
        </div>
        <div className="border-t border-black dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-900/40 text-center font-bold text-[11px] uppercase tracking-wider">
          Manager Verification Review
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black dark:divide-slate-800 border-t border-black dark:border-slate-800">
          <div className="p-2.5 flex items-center gap-2 col-span-1 md:col-span-2">
            <span>Managers Comments:</span>
            <input
              type="text"
              disabled={isReadOnly}
              value={managerComments}
              onChange={e => setManagerComments(e.target.value)}
              className="bg-transparent border-none outline-none font-bold flex-1 dark:text-slate-100 text-black"
              placeholder="Review comments..."
            />
          </div>
          <div className="p-2.5 flex items-center gap-2">
            <span>Managers Signature:</span>
            <input
              type="text"
              disabled={isReadOnly}
              value={managerName}
              onChange={e => setManagerName(e.target.value)}
              className="bg-transparent border-none outline-none font-bold flex-1 dark:text-slate-100 text-black"
              placeholder="Signature Name"
            />
          </div>
        </div>
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

export default CallBellAudit;
