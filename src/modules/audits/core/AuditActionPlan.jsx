import React from 'react';
import { Plus } from 'lucide-react';

const AuditActionPlan = ({ actionPlans, setActionPlans, isReadOnly = false }) => {
  const handleActionChange = (index, field, value) => {
    const updated = [...actionPlans];
    updated[index] = { ...updated[index], [field]: value };
    setActionPlans(updated);
  };

  const addRow = () => {
    setActionPlans([
      ...actionPlans,
      { section: '', problem: '', actions: '', responsible: '', targetDate: '', reviewedBy: '', signedOff: '' }
    ]);
  };

  const deleteRow = (index) => {
    setActionPlans(actionPlans.filter((_, i) => i !== index));
  };

  return (
    <div className="overflow-x-auto border-2 border-black rounded-sm mt-8 select-none">
      <table className="w-full text-left border-collapse min-w-[900px] text-black">
        <thead>
          <tr className="bg-[#92d050] text-black border-b-2 border-black font-extrabold">
            <th colSpan={isReadOnly ? "7" : "8"} className="p-2 text-center text-sm uppercase tracking-wider font-extrabold border-b border-black">
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
            {!isReadOnly && <th className="p-2 w-8 text-center bg-[#92d050]"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-black font-semibold text-black bg-white">
          {actionPlans.length === 0 ? (
            <tr>
              <td colSpan={isReadOnly ? "7" : "8"} className="p-4 text-center italic text-slate-500 bg-white">
                No action plans required
              </td>
            </tr>
          ) : (
            actionPlans.map((ap, apIdx) => (
              <tr key={apIdx} className="hover:bg-slate-50 text-xs">
                {isReadOnly ? (
                  <>
                    <td className="p-2 border-r border-black align-middle font-bold text-black">{ap.section}</td>
                    <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold">{ap.problem}</td>
                    <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold">{ap.actions}</td>
                    <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold text-center">{ap.responsible}</td>
                    <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold text-center">{ap.targetDate}</td>
                    <td className="p-2 border-r border-black align-middle text-[#c00000] font-bold text-center">{ap.reviewedBy}</td>
                    <td className="p-2 align-middle text-[#c00000] font-bold text-center">{ap.signedOff}</td>
                  </>
                ) : (
                  <>
                    <td className="p-1 border-r border-black align-middle">
                      <input 
                        type="text" 
                        value={ap.section} 
                        onChange={e => handleActionChange(apIdx, 'section', e.target.value)} 
                        className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs" 
                        placeholder="e.g. Fluid Charts"
                      />
                    </td>
                    <td className="p-1 border-r border-black align-middle">
                      <textarea 
                        rows="2"
                        value={ap.problem} 
                        onChange={e => handleActionChange(apIdx, 'problem', e.target.value)} 
                        className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs resize-none" 
                        placeholder="Describe problem..."
                      />
                    </td>
                    <td className="p-1 border-r border-black align-middle">
                      <textarea 
                        rows="2"
                        value={ap.actions} 
                        onChange={e => handleActionChange(apIdx, 'actions', e.target.value)} 
                        className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs resize-none" 
                        placeholder="Describe actions required..."
                      />
                    </td>
                    <td className="p-1 border-r border-black align-middle">
                      <input 
                        type="text" 
                        value={ap.responsible} 
                        onChange={e => handleActionChange(apIdx, 'responsible', e.target.value)} 
                        className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs text-center" 
                        placeholder="Responsible"
                      />
                    </td>
                    <td className="p-1 border-r border-black align-middle text-center">
                      <input 
                        type="date" 
                        value={ap.targetDate} 
                        onChange={e => handleActionChange(apIdx, 'targetDate', e.target.value)} 
                        className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-[10px]" 
                      />
                    </td>
                    <td className="p-1 border-r border-black align-middle">
                      <input 
                        type="text" 
                        value={ap.reviewedBy} 
                        onChange={e => handleActionChange(apIdx, 'reviewedBy', e.target.value)} 
                        className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs text-center" 
                        placeholder="Reviewer"
                      />
                    </td>
                    <td className="p-1 border-r border-black align-middle">
                      <input 
                        type="text" 
                        value={ap.signedOff} 
                        onChange={e => handleActionChange(apIdx, 'signedOff', e.target.value)} 
                        className="w-full p-1 bg-transparent border-none outline-none font-bold text-[#c00000] text-xs text-center" 
                        placeholder="Signature/Date"
                      />
                    </td>
                    <td className="p-1 text-center align-middle bg-white">
                      <button 
                        type="button" 
                        onClick={() => deleteRow(apIdx)} 
                        className="text-red-500 hover:text-red-700 font-bold text-base transition-colors"
                      >
                        ×
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
          {!isReadOnly && (
            <tr className="bg-white">
              <td colSpan="8" className="p-2 text-center bg-slate-50/50 hover:bg-slate-100 transition-colors">
                <button 
                  type="button" 
                  onClick={addRow} 
                  className="text-brand-700 hover:text-brand-900 font-black text-xs flex items-center justify-center gap-1 mx-auto"
                >
                  <Plus className="h-3 w-3" /> Add Action Plan Row
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AuditActionPlan;
