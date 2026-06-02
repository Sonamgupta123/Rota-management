import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import logoImg from '../assets/logo.png';

// Light blue color from the PDF header
const T_BG = "bg-[#dce6f1]";

// Reusable table cell component
const TCell = ({ children, className = "" }) => (
  <td className={`p-1.5 sm:p-2 border border-black ${className}`}>
    {children}
  </td>
);

const THeader = ({ children, className = "" }) => (
  <th className={`p-1.5 sm:p-2 border border-black font-bold text-center ${className}`}>
    {children}
  </th>
);

export const CallBellAuditEditable = ({ selectedAudit, submitAuditResult, setSelectedAudit }) => {
  // Define full form state matching the PDF
  const [formState, setFormState] = useState({
    completedBy: "",
    dateCompleted: new Date().toISOString().split('T')[0],
    staffOnDuty: "",
    adultsInService: "",
    visualInspection: [
      { criteria: "Each call bell is clean, buttons in place and in a working condition?", yes: false, no: false, comments: "" },
      { criteria: "Call bells in rooms are within reach of the bed?", yes: false, no: false, comments: "" },
      { criteria: "Call bells in communal areas are located within reaching distance?", yes: false, no: false, comments: "" },
      { criteria: "Adults in their rooms have their call bell with them?", yes: false, no: false, comments: "" }
    ],
    randomTesting: Array(6).fill({ roomNumber: "", responseTime: "", comments: "" }),
    averageResponseTime: "",
    serviceExpectationTime: "",
    anyActionsIdentified: "",
    residentFeedback: Array(3).fill({
      initials: "",
      q1: { yes: false, no: false, comments: "" },
      q2: { yes: false, no: false, comments: "" },
      q3: { yes: false, no: false, comments: "" }
    }),
    actionPlan: Array(5).fill({ finding: "", actionRequired: "", responsiblePerson: "", dateCompleted: "", signCompleted: "" }),
    assessorsSignature: "",
    role: "",
    managersComments: "",
    managersSignature: "",
    signDate: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Default score logic based on yes answers in Visual inspection
    const totalQ = formState.visualInspection.length;
    const yesCount = formState.visualInspection.filter(q => q.yes).length;
    const score = Math.round((yesCount / totalQ) * 100) || 100;
    
    // Pass form state directly as details
    submitAuditResult(selectedAudit.id, score, { ...formState, isCustomCallBellForm: true });
    setSelectedAudit(null);
  };

  const handleVisualChange = (index, field, value) => {
    const newVisual = [...formState.visualInspection];
    newVisual[index] = { ...newVisual[index], [field]: value };
    // Mutually exclusive yes/no
    if (field === 'yes' && value) newVisual[index].no = false;
    if (field === 'no' && value) newVisual[index].yes = false;
    setFormState({ ...formState, visualInspection: newVisual });
  };

  const handleRandomChange = (index, field, value) => {
    const newRandom = [...formState.randomTesting];
    newRandom[index] = { ...newRandom[index], [field]: value };
    setFormState({ ...formState, randomTesting: newRandom });
  };

  const handleFeedbackChange = (adultIndex, questionKey, field, value) => {
    const newFeed = [...formState.residentFeedback];
    if (field === 'initials') {
      newFeed[adultIndex] = { ...newFeed[adultIndex], initials: value };
    } else {
      newFeed[adultIndex] = { 
        ...newFeed[adultIndex], 
        [questionKey]: { 
          ...newFeed[adultIndex][questionKey], 
          [field]: value 
        } 
      };
      if (field === 'yes' && value) newFeed[adultIndex][questionKey].no = false;
      if (field === 'no' && value) newFeed[adultIndex][questionKey].yes = false;
    }
    setFormState({ ...formState, residentFeedback: newFeed });
  };

  const handleActionChange = (index, field, value) => {
    const newActions = [...formState.actionPlan];
    newActions[index] = { ...newActions[index], [field]: value };
    setFormState({ ...formState, actionPlan: newActions });
  };

  const Input = ({ value, onChange, placeholder = "", className = "" }) => (
    <input 
      type="text" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      className={`w-full bg-transparent border-none outline-none font-bold text-[#c00000] text-xs px-1 ${className}`} 
    />
  );

  const Checkbox = ({ checked, onChange }) => (
    <div className="flex justify-center items-center h-full w-full">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={e => onChange(e.target.checked)} 
        className="w-4 h-4 cursor-pointer accent-[#c00000]"
      />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto rounded-xl p-4 md:p-6 space-y-6 relative animate-slide-up bg-white text-black shadow-lg border border-slate-200">
      
      {/* Top action button */}
      <div className="flex justify-start">
        <button 
          type="button" 
          onClick={() => setSelectedAudit(null)} 
          className="h-10 px-6 rounded-xl border border-slate-300 font-extrabold text-slate-700 bg-white hover:bg-slate-50 hover:text-black transition-all active:scale-[0.98] flex items-center gap-1.5"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span>Go Back</span>
        </button>
      </div>

      {/* Title / Brand Header */}
      <div className="flex justify-between items-start mb-6 select-none border-b-2 border-black pb-4">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-black text-black tracking-tight">Call Bell Audit</h1>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1 ml-4">
          <img src={logoImg} alt="AS CARE" className="h-12 md:h-16 object-contain" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs text-black">
        <div className="w-full border-2 border-black overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
            <tbody className="divide-y divide-black">
              
              {/* Row 1: Header */}
              <tr className="divide-x divide-black">
                <THeader className={`${T_BG} w-[20%]`}>Completed By:</THeader>
                <TCell className="w-[30%]"><Input value={formState.completedBy} onChange={v => setFormState({...formState, completedBy: v})} /></TCell>
                <THeader className={`${T_BG} w-[20%]`}>Date Completed:</THeader>
                <TCell className="w-[30%]">
                  <input type="date" value={formState.dateCompleted} onChange={e => setFormState({...formState, dateCompleted: e.target.value})} className="w-full bg-transparent border-none outline-none font-bold text-[#c00000] text-xs" />
                </TCell>
              </tr>

              {/* Row 2: Header */}
              <tr className="divide-x divide-black">
                <THeader className={`${T_BG}`}>Number of Staff on Duty:</THeader>
                <TCell><Input value={formState.staffOnDuty} onChange={v => setFormState({...formState, staffOnDuty: v})} /></TCell>
                <THeader className={`${T_BG}`}>Number of Adults in Service:</THeader>
                <TCell><Input value={formState.adultsInService} onChange={v => setFormState({...formState, adultsInService: v})} /></TCell>
              </tr>

              {/* Visual Inspection Section Headers */}
              <tr className="divide-x divide-black">
                <THeader className={`${T_BG}`}>Standard</THeader>
                <THeader className={`${T_BG}`}>Criteria</THeader>
                <THeader className={`${T_BG} w-10`}>Yes</THeader>
                <THeader className={`${T_BG} w-10`}>No</THeader>
                <THeader className={`${T_BG}`}>Comments</THeader>
              </tr>

              {/* Visual Inspection Rows */}
              {formState.visualInspection.map((item, idx) => (
                <tr key={`vi-${idx}`} className="divide-x divide-black">
                  {idx === 0 && (
                    <THeader rowSpan={4} className={`${T_BG} align-middle`}>Visual Inspection of Call Bells:</THeader>
                  )}
                  <TCell className="font-bold">{item.criteria}</TCell>
                  <TCell><Checkbox checked={item.yes} onChange={v => handleVisualChange(idx, 'yes', v)} /></TCell>
                  <TCell><Checkbox checked={item.no} onChange={v => handleVisualChange(idx, 'no', v)} /></TCell>
                  <TCell><Input value={item.comments} onChange={v => handleVisualChange(idx, 'comments', v)} /></TCell>
                </tr>
              ))}

              {/* Random Testing Headers */}
              <tr className="divide-x divide-black">
                <THeader rowSpan={10} className={`${T_BG} align-middle`}>Random Testing</THeader>
                <THeader className={`${T_BG}`}>Room number</THeader>
                <THeader colSpan={2} className={`${T_BG}`}>Response Time</THeader>
                <THeader className={`${T_BG}`}>Comments</THeader>
              </tr>

              {/* Random Testing Rows */}
              {formState.randomTesting.map((item, idx) => (
                <tr key={`rt-${idx}`} className="divide-x divide-black">
                  <TCell><Input value={item.roomNumber} onChange={v => handleRandomChange(idx, 'roomNumber', v)} /></TCell>
                  <TCell colSpan={2}><Input value={item.responseTime} onChange={v => handleRandomChange(idx, 'responseTime', v)} /></TCell>
                  <TCell><Input value={item.comments} onChange={v => handleRandomChange(idx, 'comments', v)} /></TCell>
                </tr>
              ))}

              {/* Random Testing Summary Rows */}
              <tr className="divide-x divide-black">
                <THeader colSpan={3} className={`${T_BG} text-right pr-4`}>Average Response time:</THeader>
                <TCell><Input value={formState.averageResponseTime} onChange={v => setFormState({...formState, averageResponseTime: v})} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader colSpan={3} className={`${T_BG} text-right pr-4`}>Service expectation time:</THeader>
                <TCell><Input value={formState.serviceExpectationTime} onChange={v => setFormState({...formState, serviceExpectationTime: v})} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader colSpan={3} className={`${T_BG} text-right pr-4`}>Any Actions Identified?</THeader>
                <TCell className="text-center font-bold">
                  <div className="flex justify-center gap-4">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={formState.anyActionsIdentified === 'Yes'} onChange={() => setFormState({...formState, anyActionsIdentified: 'Yes'})} className="accent-[#c00000]" /> Yes
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" checked={formState.anyActionsIdentified === 'No'} onChange={() => setFormState({...formState, anyActionsIdentified: 'No'})} className="accent-[#c00000]" /> No
                    </label>
                  </div>
                </TCell>
              </tr>

              {/* Resident Feedback Headers */}
              <tr className="divide-x divide-black">
                <THeader className={`${T_BG}`}>Call Bell feedback from Residents</THeader>
                <THeader colSpan={2} className={`${T_BG}`}>Audit criteria</THeader>
                <THeader className={`${T_BG}`}>Yes</THeader>
                <THeader className={`${T_BG}`}>No</THeader>
                <THeader className={`${T_BG}`}>Comments</THeader>
              </tr>

              {/* Adult 1 */}
              <tr className="divide-x divide-black">
                <THeader className={`${T_BG}`}>Adult 1</THeader>
                <TCell colSpan={2} className="font-bold">Do you know what your call bell is for?</TCell>
                <TCell><Checkbox checked={formState.residentFeedback[0].q1.yes} onChange={v => handleFeedbackChange(0, 'q1', 'yes', v)} /></TCell>
                <TCell><Checkbox checked={formState.residentFeedback[0].q1.no} onChange={v => handleFeedbackChange(0, 'q1', 'no', v)} /></TCell>
                <TCell><Input value={formState.residentFeedback[0].q1.comments} onChange={v => handleFeedbackChange(0, 'q1', 'comments', v)} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader rowSpan={2} className={`${T_BG} align-top`}>Initials:<br/><Input value={formState.residentFeedback[0].initials} onChange={v => handleFeedbackChange(0, null, 'initials', v)} /></THeader>
                <TCell colSpan={2} className="font-bold">Do you know how to use your call bell?</TCell>
                <TCell><Checkbox checked={formState.residentFeedback[0].q2.yes} onChange={v => handleFeedbackChange(0, 'q2', 'yes', v)} /></TCell>
                <TCell><Checkbox checked={formState.residentFeedback[0].q2.no} onChange={v => handleFeedbackChange(0, 'q2', 'no', v)} /></TCell>
                <TCell><Input value={formState.residentFeedback[0].q2.comments} onChange={v => handleFeedbackChange(0, 'q2', 'comments', v)} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <TCell colSpan={2} className="font-bold">If you use your call bell, what is the response like?</TCell>
                <TCell><Checkbox checked={formState.residentFeedback[0].q3.yes} onChange={v => handleFeedbackChange(0, 'q3', 'yes', v)} /></TCell>
                <TCell><Checkbox checked={formState.residentFeedback[0].q3.no} onChange={v => handleFeedbackChange(0, 'q3', 'no', v)} /></TCell>
                <TCell><Input value={formState.residentFeedback[0].q3.comments} onChange={v => handleFeedbackChange(0, 'q3', 'comments', v)} /></TCell>
              </tr>

              {/* Adult 2 */}
              <tr className="divide-x divide-black border-t-2 border-black">
                <THeader className={`${T_BG}`}>Adult 2</THeader>
                <TCell colSpan={2} className="font-bold">Do you know what your call bell is for?</TCell>
                <TCell><Checkbox checked={formState.residentFeedback[1].q1.yes} onChange={v => handleFeedbackChange(1, 'q1', 'yes', v)} /></TCell>
                <TCell><Checkbox checked={formState.residentFeedback[1].q1.no} onChange={v => handleFeedbackChange(1, 'q1', 'no', v)} /></TCell>
                <TCell><Input value={formState.residentFeedback[1].q1.comments} onChange={v => handleFeedbackChange(1, 'q1', 'comments', v)} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader rowSpan={2} className={`${T_BG} align-top`}>Initials:<br/><Input value={formState.residentFeedback[1].initials} onChange={v => handleFeedbackChange(1, null, 'initials', v)} /></THeader>
                <TCell colSpan={2} className="font-bold">Do you know how to use your call bell?</TCell>
                <TCell><Checkbox checked={formState.residentFeedback[1].q2.yes} onChange={v => handleFeedbackChange(1, 'q2', 'yes', v)} /></TCell>
                <TCell><Checkbox checked={formState.residentFeedback[1].q2.no} onChange={v => handleFeedbackChange(1, 'q2', 'no', v)} /></TCell>
                <TCell><Input value={formState.residentFeedback[1].q2.comments} onChange={v => handleFeedbackChange(1, 'q2', 'comments', v)} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <TCell colSpan={2} className="font-bold">If you use your call bell, what is the response like?</TCell>
                <TCell><Checkbox checked={formState.residentFeedback[1].q3.yes} onChange={v => handleFeedbackChange(1, 'q3', 'yes', v)} /></TCell>
                <TCell><Checkbox checked={formState.residentFeedback[1].q3.no} onChange={v => handleFeedbackChange(1, 'q3', 'no', v)} /></TCell>
                <TCell><Input value={formState.residentFeedback[1].q3.comments} onChange={v => handleFeedbackChange(1, 'q3', 'comments', v)} /></TCell>
              </tr>

              {/* Adult 3 */}
              <tr className="divide-x divide-black border-t-2 border-black">
                <THeader className={`${T_BG}`}>Adult 3</THeader>
                <TCell colSpan={2} className="font-bold">Do you know what your call bell is for?</TCell>
                <TCell><Checkbox checked={formState.residentFeedback[2].q1.yes} onChange={v => handleFeedbackChange(2, 'q1', 'yes', v)} /></TCell>
                <TCell><Checkbox checked={formState.residentFeedback[2].q1.no} onChange={v => handleFeedbackChange(2, 'q1', 'no', v)} /></TCell>
                <TCell><Input value={formState.residentFeedback[2].q1.comments} onChange={v => handleFeedbackChange(2, 'q1', 'comments', v)} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader rowSpan={2} className={`${T_BG} align-top`}>Initials:<br/><Input value={formState.residentFeedback[2].initials} onChange={v => handleFeedbackChange(2, null, 'initials', v)} /></THeader>
                <TCell colSpan={2} className="font-bold">Do you know how to use your call bell?</TCell>
                <TCell><Checkbox checked={formState.residentFeedback[2].q2.yes} onChange={v => handleFeedbackChange(2, 'q2', 'yes', v)} /></TCell>
                <TCell><Checkbox checked={formState.residentFeedback[2].q2.no} onChange={v => handleFeedbackChange(2, 'q2', 'no', v)} /></TCell>
                <TCell><Input value={formState.residentFeedback[2].q2.comments} onChange={v => handleFeedbackChange(2, 'q2', 'comments', v)} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <TCell colSpan={2} className="font-bold">If you use your call bell, what is the response like?</TCell>
                <TCell><Checkbox checked={formState.residentFeedback[2].q3.yes} onChange={v => handleFeedbackChange(2, 'q3', 'yes', v)} /></TCell>
                <TCell><Checkbox checked={formState.residentFeedback[2].q3.no} onChange={v => handleFeedbackChange(2, 'q3', 'no', v)} /></TCell>
                <TCell><Input value={formState.residentFeedback[2].q3.comments} onChange={v => handleFeedbackChange(2, 'q3', 'comments', v)} /></TCell>
              </tr>

              {/* Action Plan */}
              <tr className="divide-x divide-black border-t-2 border-black">
                <THeader colSpan={6} className={`${T_BG} text-center`}>Action Plan</THeader>
              </tr>
              <tr className="divide-x divide-black">
                <THeader colSpan={2} className={`${T_BG}`}>Finding</THeader>
                <THeader className={`${T_BG}`}>Action Required:</THeader>
                <THeader className={`${T_BG}`}>Responsible Person:</THeader>
                <THeader className={`${T_BG}`}>Date Completed:</THeader>
                <THeader className={`${T_BG}`}>Sign When Completed:</THeader>
              </tr>
              {formState.actionPlan.map((item, idx) => (
                <tr key={`ap-${idx}`} className="divide-x divide-black">
                  <TCell colSpan={2}><Input value={item.finding} onChange={v => handleActionChange(idx, 'finding', v)} /></TCell>
                  <TCell><Input value={item.actionRequired} onChange={v => handleActionChange(idx, 'actionRequired', v)} /></TCell>
                  <TCell><Input value={item.responsiblePerson} onChange={v => handleActionChange(idx, 'responsiblePerson', v)} /></TCell>
                  <TCell><Input value={item.dateCompleted} onChange={v => handleActionChange(idx, 'dateCompleted', v)} /></TCell>
                  <TCell><Input value={item.signCompleted} onChange={v => handleActionChange(idx, 'signCompleted', v)} /></TCell>
                </tr>
              ))}

              {/* Footer */}
              <tr className="divide-x divide-black border-t-2 border-black">
                <THeader className={`${T_BG} text-right`}>Assessors Signature:</THeader>
                <TCell colSpan={3}><Input value={formState.assessorsSignature} onChange={v => setFormState({...formState, assessorsSignature: v})} /></TCell>
                <THeader className={`${T_BG} text-right`}>Role:</THeader>
                <TCell><Input value={formState.role} onChange={v => setFormState({...formState, role: v})} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader colSpan={6} className={`${T_BG} text-center`}>Managers Comments:</THeader>
              </tr>
              <tr className="divide-x divide-black">
                <TCell colSpan={6} className="h-24 align-top">
                  <textarea 
                    value={formState.managersComments}
                    onChange={e => setFormState({...formState, managersComments: e.target.value})}
                    className="w-full h-full resize-none bg-transparent border-none outline-none font-bold text-[#c00000] text-xs p-1"
                  />
                </TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader className={`${T_BG} text-right`}>Mangers Signature:</THeader>
                <TCell colSpan={3}><Input value={formState.managersSignature} onChange={v => setFormState({...formState, managersSignature: v})} /></TCell>
                <THeader className={`${T_BG} text-right`}>Date:</THeader>
                <TCell><input type="date" value={formState.signDate} onChange={e => setFormState({...formState, signDate: e.target.value})} className="w-full bg-transparent border-none outline-none font-bold text-[#c00000] text-xs" /></TCell>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
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
  );
};

export const CallBellAuditReadOnly = ({ viewReportAudit, setViewReportAudit }) => {
  const formState = viewReportAudit.details || {};

  const Output = ({ value }) => (
    <span className="font-bold text-[#c00000] text-xs px-1">{value || "—"}</span>
  );

  const Checked = ({ checked }) => (
    <div className="flex justify-center items-center h-full w-full font-black text-lg text-[#c00000]">
      {checked ? '✔' : ''}
    </div>
  );

  // Fallback for missing fields in case data is incomplete
  const visual = formState.visualInspection || Array(4).fill({});
  const random = formState.randomTesting || Array(6).fill({});
  const feedback = formState.residentFeedback || Array(3).fill({ q1: {}, q2: {}, q3: {} });
  const actions = formState.actionPlan || Array(5).fill({});

  return (
    <div className="w-full max-w-[95vw] xl:max-w-7xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl relative animate-slide-up text-xs space-y-6">
      
      {/* Top Header info */}
      <div className="flex justify-between items-start border-b pb-3 border-slate-200 mb-2 select-none">
        <div>
          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
            (viewReportAudit.score < 90)
              ? 'bg-rose-50 text-rose-700 border-rose-250'
              : 'bg-emerald-50 text-emerald-700 border-emerald-250'
          }`}>
            {viewReportAudit.status} Audit
          </span>
          <h3 className="text-xl font-black mt-2 text-slate-900">{viewReportAudit.type} Report</h3>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">
            Audit ID: {viewReportAudit.id} | Completed Date: {viewReportAudit.lastCompleted}
          </p>
        </div>
        <button
          onClick={() => setViewReportAudit(null)}
          className="text-xs font-bold text-slate-400 hover:text-slate-655 transition-colors"
        >
          Close Report
        </button>
      </div>

      <div className="space-y-6 text-black select-none">
        {/* Title / Brand Header */}
        <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black text-black tracking-tight">Call Bell Audit</h1>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1 ml-4">
            <img src={logoImg} alt="AS CARE" className="h-12 md:h-16 object-contain" />
          </div>
        </div>

        <div className="w-full border-2 border-black overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
            <tbody className="divide-y divide-black">
              {/* Row 1: Header */}
              <tr className="divide-x divide-black">
                <THeader className={`${T_BG} w-[20%]`}>Completed By:</THeader>
                <TCell className="w-[30%]"><Output value={formState.completedBy} /></TCell>
                <THeader className={`${T_BG} w-[20%]`}>Date Completed:</THeader>
                <TCell className="w-[30%]"><Output value={formState.dateCompleted} /></TCell>
              </tr>

              {/* Row 2: Header */}
              <tr className="divide-x divide-black">
                <THeader className={`${T_BG}`}>Number of Staff on Duty:</THeader>
                <TCell><Output value={formState.staffOnDuty} /></TCell>
                <THeader className={`${T_BG}`}>Number of Adults in Service:</THeader>
                <TCell><Output value={formState.adultsInService} /></TCell>
              </tr>

              {/* Visual Inspection Section Headers */}
              <tr className="divide-x divide-black">
                <THeader className={`${T_BG}`}>Standard</THeader>
                <THeader className={`${T_BG}`}>Criteria</THeader>
                <THeader className={`${T_BG} w-10`}>Yes</THeader>
                <THeader className={`${T_BG} w-10`}>No</THeader>
                <THeader className={`${T_BG}`}>Comments</THeader>
              </tr>

              {/* Visual Inspection Rows */}
              {visual.map((item, idx) => (
                <tr key={`vi-${idx}`} className="divide-x divide-black">
                  {idx === 0 && (
                    <THeader rowSpan={4} className={`${T_BG} align-middle`}>Visual Inspection of Call Bells:</THeader>
                  )}
                  <TCell className="font-bold">{item.criteria || [
                    "Each call bell is clean, buttons in place and in a working condition?",
                    "Call bells in rooms are within reach of the bed?",
                    "Call bells in communal areas are located within reaching distance?",
                    "Adults in their rooms have their call bell with them?"
                  ][idx]}</TCell>
                  <TCell><Checked checked={item.yes} /></TCell>
                  <TCell><Checked checked={item.no} /></TCell>
                  <TCell><Output value={item.comments} /></TCell>
                </tr>
              ))}

              {/* Random Testing Headers */}
              <tr className="divide-x divide-black">
                <THeader rowSpan={10} className={`${T_BG} align-middle`}>Random Testing</THeader>
                <THeader className={`${T_BG}`}>Room number</THeader>
                <THeader colSpan={2} className={`${T_BG}`}>Response Time</THeader>
                <THeader className={`${T_BG}`}>Comments</THeader>
              </tr>

              {/* Random Testing Rows */}
              {random.map((item, idx) => (
                <tr key={`rt-${idx}`} className="divide-x divide-black">
                  <TCell><Output value={item.roomNumber} /></TCell>
                  <TCell colSpan={2}><Output value={item.responseTime} /></TCell>
                  <TCell><Output value={item.comments} /></TCell>
                </tr>
              ))}

              {/* Random Testing Summary Rows */}
              <tr className="divide-x divide-black">
                <THeader colSpan={3} className={`${T_BG} text-right pr-4`}>Average Response time:</THeader>
                <TCell><Output value={formState.averageResponseTime} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader colSpan={3} className={`${T_BG} text-right pr-4`}>Service expectation time:</THeader>
                <TCell><Output value={formState.serviceExpectationTime} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader colSpan={3} className={`${T_BG} text-right pr-4`}>Any Actions Identified?</THeader>
                <TCell className="text-center"><Output value={formState.anyActionsIdentified} /></TCell>
              </tr>

              {/* Resident Feedback Headers */}
              <tr className="divide-x divide-black">
                <THeader className={`${T_BG}`}>Call Bell feedback from Residents</THeader>
                <THeader colSpan={2} className={`${T_BG}`}>Audit criteria</THeader>
                <THeader className={`${T_BG}`}>Yes</THeader>
                <THeader className={`${T_BG}`}>No</THeader>
                <THeader className={`${T_BG}`}>Comments</THeader>
              </tr>

              {/* Adult 1 */}
              <tr className="divide-x divide-black">
                <THeader className={`${T_BG}`}>Adult 1</THeader>
                <TCell colSpan={2} className="font-bold">Do you know what your call bell is for?</TCell>
                <TCell><Checked checked={feedback[0].q1?.yes} /></TCell>
                <TCell><Checked checked={feedback[0].q1?.no} /></TCell>
                <TCell><Output value={feedback[0].q1?.comments} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader rowSpan={2} className={`${T_BG} align-top`}>Initials:<br/><Output value={feedback[0].initials} /></THeader>
                <TCell colSpan={2} className="font-bold">Do you know how to use your call bell?</TCell>
                <TCell><Checked checked={feedback[0].q2?.yes} /></TCell>
                <TCell><Checked checked={feedback[0].q2?.no} /></TCell>
                <TCell><Output value={feedback[0].q2?.comments} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <TCell colSpan={2} className="font-bold">If you use your call bell, what is the response like?</TCell>
                <TCell><Checked checked={feedback[0].q3?.yes} /></TCell>
                <TCell><Checked checked={feedback[0].q3?.no} /></TCell>
                <TCell><Output value={feedback[0].q3?.comments} /></TCell>
              </tr>

              {/* Adult 2 */}
              <tr className="divide-x divide-black border-t-2 border-black">
                <THeader className={`${T_BG}`}>Adult 2</THeader>
                <TCell colSpan={2} className="font-bold">Do you know what your call bell is for?</TCell>
                <TCell><Checked checked={feedback[1].q1?.yes} /></TCell>
                <TCell><Checked checked={feedback[1].q1?.no} /></TCell>
                <TCell><Output value={feedback[1].q1?.comments} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader rowSpan={2} className={`${T_BG} align-top`}>Initials:<br/><Output value={feedback[1].initials} /></THeader>
                <TCell colSpan={2} className="font-bold">Do you know how to use your call bell?</TCell>
                <TCell><Checked checked={feedback[1].q2?.yes} /></TCell>
                <TCell><Checked checked={feedback[1].q2?.no} /></TCell>
                <TCell><Output value={feedback[1].q2?.comments} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <TCell colSpan={2} className="font-bold">If you use your call bell, what is the response like?</TCell>
                <TCell><Checked checked={feedback[1].q3?.yes} /></TCell>
                <TCell><Checked checked={feedback[1].q3?.no} /></TCell>
                <TCell><Output value={feedback[1].q3?.comments} /></TCell>
              </tr>

              {/* Adult 3 */}
              <tr className="divide-x divide-black border-t-2 border-black">
                <THeader className={`${T_BG}`}>Adult 3</THeader>
                <TCell colSpan={2} className="font-bold">Do you know what your call bell is for?</TCell>
                <TCell><Checked checked={feedback[2].q1?.yes} /></TCell>
                <TCell><Checked checked={feedback[2].q1?.no} /></TCell>
                <TCell><Output value={feedback[2].q1?.comments} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader rowSpan={2} className={`${T_BG} align-top`}>Initials:<br/><Output value={feedback[2].initials} /></THeader>
                <TCell colSpan={2} className="font-bold">Do you know how to use your call bell?</TCell>
                <TCell><Checked checked={feedback[2].q2?.yes} /></TCell>
                <TCell><Checked checked={feedback[2].q2?.no} /></TCell>
                <TCell><Output value={feedback[2].q2?.comments} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <TCell colSpan={2} className="font-bold">If you use your call bell, what is the response like?</TCell>
                <TCell><Checked checked={feedback[2].q3?.yes} /></TCell>
                <TCell><Checked checked={feedback[2].q3?.no} /></TCell>
                <TCell><Output value={feedback[2].q3?.comments} /></TCell>
              </tr>

              {/* Action Plan */}
              <tr className="divide-x divide-black border-t-2 border-black">
                <THeader colSpan={6} className={`${T_BG} text-center`}>Action Plan</THeader>
              </tr>
              <tr className="divide-x divide-black">
                <THeader colSpan={2} className={`${T_BG}`}>Finding</THeader>
                <THeader className={`${T_BG}`}>Action Required:</THeader>
                <THeader className={`${T_BG}`}>Responsible Person:</THeader>
                <THeader className={`${T_BG}`}>Date Completed:</THeader>
                <THeader className={`${T_BG}`}>Sign When Completed:</THeader>
              </tr>
              {actions.map((item, idx) => (
                <tr key={`ap-${idx}`} className="divide-x divide-black">
                  <TCell colSpan={2}><Output value={item.finding} /></TCell>
                  <TCell><Output value={item.actionRequired} /></TCell>
                  <TCell><Output value={item.responsiblePerson} /></TCell>
                  <TCell><Output value={item.dateCompleted} /></TCell>
                  <TCell><Output value={item.signCompleted} /></TCell>
                </tr>
              ))}

              {/* Footer */}
              <tr className="divide-x divide-black border-t-2 border-black">
                <THeader className={`${T_BG} text-right`}>Assessors Signature:</THeader>
                <TCell colSpan={3}><Output value={formState.assessorsSignature} /></TCell>
                <THeader className={`${T_BG} text-right`}>Role:</THeader>
                <TCell><Output value={formState.role} /></TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader colSpan={6} className={`${T_BG} text-center`}>Managers Comments:</THeader>
              </tr>
              <tr className="divide-x divide-black">
                <TCell colSpan={6} className="h-24 align-top whitespace-pre-line">
                  <Output value={formState.managersComments} />
                </TCell>
              </tr>
              <tr className="divide-x divide-black">
                <THeader className={`${T_BG} text-right`}>Mangers Signature:</THeader>
                <TCell colSpan={3}><Output value={formState.managersSignature} /></TCell>
                <THeader className={`${T_BG} text-right`}>Date:</THeader>
                <TCell><Output value={formState.signDate} /></TCell>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 pt-6 border-t border-slate-200">
          <button 
            onClick={() => setViewReportAudit(null)} 
            className="h-10 px-8 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold shadow-md shadow-brand-500/10 active:scale-[0.98] transition-all"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
