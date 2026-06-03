import React, { useState } from 'react';
import BaseAuditForm from '../core/BaseAuditForm';
import { pressureMattressConfig } from '../configs/pressureMattress.config';

const PressureMattressAudit = ({ selectedAudit, submitAuditResult, setSelectedAudit, isEditMode }) => {
  const [customData, setCustomData] = useState({
    establishment: 'Oakfield Care Home',
    unitName: '',
    location: '',
    serialNumber: ''
  });

  const isReadOnly = selectedAudit.status === 'Completed' && !isEditMode;

  const handleCustomDataChange = (field, value) => {
    if (isReadOnly) return;
    setCustomData(prev => ({ ...prev, [field]: value }));
  };

  const customHeaderFields = (
    <>
      <div className="space-y-1">
        <label className="text-[10px] text-slate-400 uppercase block">Establishment Name</label>
        <input 
          type="text"
          disabled={isReadOnly}
          value={customData.establishment}
          onChange={e => handleCustomDataChange('establishment', e.target.value)}
          className="h-8 px-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none text-slate-900 dark:text-white"
          placeholder="Establishment"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-slate-400 uppercase block">Unit Name (if applicable)</label>
        <input 
          type="text"
          disabled={isReadOnly}
          value={customData.unitName}
          onChange={e => handleCustomDataChange('unitName', e.target.value)}
          className="h-8 px-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none text-slate-900 dark:text-white"
          placeholder="e.g. Lavender Wing"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-slate-400 uppercase block">Room / Location</label>
        <input 
          type="text"
          disabled={isReadOnly}
          value={customData.location}
          onChange={e => handleCustomDataChange('location', e.target.value)}
          className="h-8 px-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none text-slate-900 dark:text-white"
          placeholder="e.g. Room 14"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-slate-400 uppercase block">Mattress Number (ID)</label>
        <input 
          type="text"
          disabled={isReadOnly}
          value={customData.serialNumber}
          onChange={e => handleCustomDataChange('serialNumber', e.target.value)}
          className="h-8 px-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold outline-none text-slate-900 dark:text-white"
          placeholder="e.g. MAT-1049"
        />
      </div>
    </>
  );

  return (
    <BaseAuditForm 
      config={pressureMattressConfig}
      selectedAudit={selectedAudit}
      submitAuditResult={submitAuditResult}
      setSelectedAudit={setSelectedAudit}
      isEditMode={isEditMode}
      customHeaderFields={customHeaderFields}
      customDataState={customData}
      setCustomDataState={setCustomData}
    />
  );
};

export default PressureMattressAudit;
