import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { ArrowLeft, Printer, CheckCircle, Check, X } from 'lucide-react';
import logoImg from '../../../assets/logo.png';

// Section definitions with their checklist columns
const SECTIONS = {
  bedrooms: {
    title: 'Section 1: Bedrooms',
    description: 'A sample of 25% of rooms should be audited, please list the room numbers in the column provided. This sample should be spread evenly across each floor and should include empty rooms.',
    countLabel: 'Number of bedrooms on site',
    columns: [
      'Bed/Mattress and Cover', 'Shelves/Ledges/Windowsills', 'Furniture', 'Skirting Boards',
      'Ceilings and Corners', 'Door Frames and Picture Frames', 'Light Fittings', 'Flooring',
      'Behind Furniture', 'Waste Bins', 'Curtains'
    ],
    ensuiteColumns: [
      'Vanity Sinks and Commode', 'Toilet, Sink and Surround', 'Soap Dishes', 'Medication Cupboard',
      'Shelves, Ledges and Mirrors', 'Toilet Brushes and Dispensers', 'Flooring', 'Ceilings & Corners',
      'Air Vents & Fans', 'Towels & Toiletries', 'Wall Tiles'
    ],
    rows: 14
  },
  bathrooms: {
    title: 'Section 2: Communal Bathrooms/Toilets',
    description: 'A sample of 25% of rooms should be audited, please list the room numbers in the column provided. This sample should be spread evenly across each floor.',
    countLabel: 'Number of communal bathrooms/toilets on site',
    columns: [
      'Toilet, Sink and Surround', 'Soap Dishes', 'Plugs', 'Shelves, Ledges and Mirrors',
      'Toilet Brushes and Dispensers', 'Flooring and Walls (Tiles)', 'Ceilings & Corners', 'Air Vents & Fans'
    ],
    rows: 10
  },
  lounges: {
    title: 'Section 3: Lounge and Dining Areas',
    description: 'A sample of 25% of rooms should be audited, please list the room numbers in the column provided. This sample should be spread evenly across each floor.',
    countLabel: 'Number of lounge and dining areas on site',
    columns: [
      'Shelves, Ledges, Windowsills', 'Windows and Mirrors', 'Entertainment Systems',
      'Picture Frames and Ornaments', 'Light Fittings and Door Frames', 'Bookcases and Display Units',
      'Furniture', 'Skirting Boards', 'Flooring', 'Curtains and Blinds', 'Waste Bins',
      'Fans, Air Vents, and AC Units', 'High Levels', 'Low Levels'
    ],
    rows: 8
  },
  familyAreas: {
    title: 'Section 4: Quiet Family Areas/Visitor Rooms',
    description: null,
    countLabel: null,
    columns: [
      'Shelves, Ledges, Windowsills', 'Windows and Mirrors', 'Picture Frames and Ornaments',
      'Light Fittings and Door Frames', 'Bookcases and Display Units', 'Furniture', 'Skirting Boards',
      'Flooring', 'Curtains and Blinds', 'Waste Bins', 'High Levels', 'Low Levels'
    ],
    rows: 3
  },
  corridors: {
    title: 'Section 5: Corridor/Staircases/Landing Areas',
    description: 'Please select 3 random areas as listed above.',
    countLabel: null,
    columns: [
      'Ceilings', 'Walls', 'Picture Frames', 'Windows and Windowsills', 'Handrail and Banisters',
      'Spindles', 'Flooring', 'Doorways', 'Under Stair Areas', 'Furniture', 'Skirting Boards'
    ],
    rows: 3
  },
  entrance: {
    title: 'Section 6: Entrance Area',
    description: null,
    countLabel: null,
    columns: [
      'Ceilings', 'Walls', 'Picture Frames/Wall Hangings', 'Windows and Windowsills',
      'Light Fittings and Door Frames', 'Bookcases and Display Units', 'Furniture', 'Skirting Boards',
      'Flooring', 'Curtains and Blinds', 'Doorways', 'Under Stair Areas', 'High Levels', 'Low Levels'
    ],
    rows: 2
  },
  offices: {
    title: 'Section 7: Offices',
    description: 'Please select 3 random offices.',
    countLabel: null,
    columns: [
      'Surface Areas', 'Walls', 'Picture Frames', 'Windows and Windowsills', 'Flooring',
      'Waste Bins', 'Doorways', 'Equipment Dust Free?', 'Furniture', 'Skirting Boards'
    ],
    rows: 3
  },
  miscRooms: {
    title: 'Section 8: Miscellaneous Rooms',
    description: 'Hairdresser/Treatment/Sluice/Meeting/Therapy/Activity/Training/Gym/Spa Rooms. Please select 2 random rooms (if applicable) — must NOT be the same as on the previous audit if possible.',
    countLabel: null,
    columns: [
      'Surface Areas', 'Walls', 'Picture Frames', 'Windows and Windowsills', 'Flooring',
      'Sinks', 'High and Low Levels', 'Equipment Dust Free?', 'Furniture', 'Dispensers'
    ],
    rows: 2
  }
};

const RECORD_KEEPING_QUESTIONS = [
  'Are cleaning problems identified and recorded?',
  'Are Random Room Checks being carried out daily and recorded?',
  'Are Cleaning Schedules completed and signed daily?',
  'Are extra records recorded in line with infection control procedures?'
];

const RESULT_SECTIONS = [
  { num: '1', label: 'Bedrooms' },
  { num: '2', label: 'Communal Bathrooms and Toilets' },
  { num: '3', label: 'Lounges' },
  { num: '4', label: 'Quiet Family Areas' },
  { num: '5', label: 'Corridors/Staircases/Landing Areas' },
  { num: '6', label: 'Entrance Area' },
  { num: '7', label: 'Offices' },
  { num: '8', label: 'Miscellaneous Rooms' },
  { num: '9', label: 'Record Keeping' }
];

const HouseKeepingAudit = ({ selectedAudit, submitAuditResult, setSelectedAudit, isEditMode }) => {
  const { employees } = useApp();
  const isReadOnly = selectedAudit.status === 'Completed' && !isEditMode;
  const assignedOfficer = employees.find(e => e.id === selectedAudit.officerId) || employees[0];

  // Metadata
  const [homeName, setHomeName] = useState('Oakfield Care Home');
  const [monthYear, setMonthYear] = useState('');
  const [managerName, setManagerName] = useState('');
  const [conductedBy, setConductedBy] = useState('');
  const [dateCompletion, setDateCompletion] = useState('');

  // Section grid data: { sectionKey: { roomLabel: [row label], checks: { colIdx: true/false } } }
  const [sectionData, setSectionData] = useState({});
  // Section room counts
  const [roomCounts, setRoomCounts] = useState({});
  // Section action comments
  const [sectionActions, setSectionActions] = useState({});

  // Record Keeping
  const [recordKeeping, setRecordKeeping] = useState({});
  const [recordActions, setRecordActions] = useState({ comments: '', timeFrame: '', responsible: '', completed: '' });

  // Section 10 results
  const [sectionResults, setSectionResults] = useState({});
  const [allCompleted, setAllCompleted] = useState('YES');

  // Signatures
  const [mgrSignName, setMgrSignName] = useState('');
  const [mgrSigned, setMgrSigned] = useState(false);
  const [mgrSignDate, setMgrSignDate] = useState('');
  const [domSignName, setDomSignName] = useState('');
  const [domSigned, setDomSigned] = useState(false);
  const [domSignDate, setDomSignDate] = useState('');
  const [dateFiled, setDateFiled] = useState('');

  // Initialize data
  useEffect(() => {
    const initData = {};
    const initActions = {};
    Object.keys(SECTIONS).forEach(key => {
      const sec = SECTIONS[key];
      const totalCols = sec.columns.length + (sec.ensuiteColumns ? sec.ensuiteColumns.length : 0);
      initData[key] = [];
      for (let r = 0; r < sec.rows; r++) {
        const checks = {};
        for (let c = 0; c < totalCols; c++) checks[c] = null; // null=empty, true=tick, false=cross
        initData[key].push({ room: '', checks });
      }
      initActions[key] = [
        { issue: '', comments: '', timeFrame: '', responsible: '', completed: '' },
        { issue: '', comments: '', timeFrame: '', responsible: '', completed: '' },
        { issue: '', comments: '', timeFrame: '', responsible: '', completed: '' }
      ];
    });

    const initRK = {};
    RECORD_KEEPING_QUESTIONS.forEach((_, i) => { initRK[i] = null; });

    const initResults = {};
    RESULT_SECTIONS.forEach(s => { initResults[s.num] = ''; });

    if (selectedAudit.status === 'Completed' && selectedAudit.details) {
      const d = selectedAudit.details;
      setSectionData(d.sectionData || initData);
      setSectionActions(d.sectionActions || initActions);
      setRoomCounts(d.roomCounts || {});
      setRecordKeeping(d.recordKeeping || initRK);
      setRecordActions(d.recordActions || { comments: '', timeFrame: '', responsible: '', completed: '' });
      setSectionResults(d.sectionResults || initResults);
      setAllCompleted(d.allCompleted || 'YES');

      setHomeName(d.metadata?.homeName || 'Oakfield Care Home');
      setMonthYear(d.metadata?.monthYear || '');
      setManagerName(d.metadata?.managerName || '');
      setConductedBy(d.metadata?.conductedBy || assignedOfficer?.name || '');
      setDateCompletion(d.metadata?.dateCompletion || selectedAudit.lastCompleted || '');

      setMgrSignName(d.signatures?.mgrSignName || '');
      setMgrSigned(d.signatures?.mgrSigned || false);
      setMgrSignDate(d.signatures?.mgrSignDate || '');
      setDomSignName(d.signatures?.domSignName || '');
      setDomSigned(d.signatures?.domSigned || false);
      setDomSignDate(d.signatures?.domSignDate || '');
      setDateFiled(d.signatures?.dateFiled || '');
    } else if (selectedAudit.status === 'Completed') {
      // Mock pre-fill for completed with no details
      Object.keys(initData).forEach(key => {
        const sec = SECTIONS[key];
        const totalCols = sec.columns.length + (sec.ensuiteColumns ? sec.ensuiteColumns.length : 0);
        initData[key].forEach((row, r) => {
          row.room = key === 'bedrooms' ? `Rm ${101 + r}` : key === 'bathrooms' ? `B${r + 1}` : `${r + 1}`;
          for (let c = 0; c < totalCols; c++) row.checks[c] = Math.random() > 0.15;
        });
      });
      RECORD_KEEPING_QUESTIONS.forEach((_, i) => { initRK[i] = true; });
      RESULT_SECTIONS.forEach(s => { initResults[s.num] = 'Y'; });

      setSectionData(initData);
      setSectionActions(initActions);
      setRecordKeeping(initRK);
      setSectionResults(initResults);
      setDateCompletion(selectedAudit.lastCompleted || selectedAudit.scheduledDate);
      setConductedBy(assignedOfficer?.name || '');
      setManagerName('Sarah Jenkins');
      setMgrSignName('Sarah Jenkins');
      setMgrSigned(true);
      setMgrSignDate(selectedAudit.lastCompleted || '');
    } else {
      setSectionData(initData);
      setSectionActions(initActions);
      setRecordKeeping(initRK);
      setSectionResults(initResults);
      const today = new Date().toISOString().split('T')[0];
      setDateCompletion(today);
      setConductedBy(assignedOfficer?.name || '');
      setManagerName('Sarah Jenkins');
      setMonthYear(new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }));
    }
  }, [selectedAudit, isEditMode]);

  // Toggle a cell
  const toggleCheck = (sectionKey, rowIdx, colIdx) => {
    if (isReadOnly) return;
    setSectionData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const cur = next[sectionKey][rowIdx].checks[colIdx];
      next[sectionKey][rowIdx].checks[colIdx] = cur === true ? false : cur === false ? null : true;
      return next;
    });
  };

  const setRoomLabel = (sectionKey, rowIdx, value) => {
    if (isReadOnly) return;
    setSectionData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[sectionKey][rowIdx].room = value;
      return next;
    });
  };

  const updateAction = (sectionKey, rowIdx, field, value) => {
    if (isReadOnly) return;
    setSectionActions(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[sectionKey][rowIdx][field] = value;
      return next;
    });
  };

  // Calculate overall score
  const calcScore = () => {
    let total = 0, passed = 0;
    Object.keys(SECTIONS).forEach(key => {
      const data = sectionData[key] || [];
      const sec = SECTIONS[key];
      const totalCols = sec.columns.length + (sec.ensuiteColumns ? sec.ensuiteColumns.length : 0);
      data.forEach(row => {
        if (!row.room) return;
        for (let c = 0; c < totalCols; c++) {
          if (row.checks[c] !== null) { total++; if (row.checks[c] === true) passed++; }
        }
      });
    });
    RECORD_KEEPING_QUESTIONS.forEach((_, i) => {
      if (recordKeeping[i] !== null) { total++; if (recordKeeping[i] === true) passed++; }
    });
    return total === 0 ? 100 : Math.round((passed / total) * 100);
  };

  const score = calcScore();

  const handleSubmit = () => {
    if (isReadOnly) return;
    submitAuditResult(selectedAudit.id, score, {
      sectionData, sectionActions, roomCounts, recordKeeping, recordActions, sectionResults, allCompleted,
      metadata: { homeName, monthYear, managerName, conductedBy, dateCompletion },
      signatures: { mgrSignName, mgrSigned, mgrSignDate, domSignName, domSigned, domSignDate, dateFiled }
    });
    setSelectedAudit(null);
  };

  const inputCls = "w-full bg-transparent border-none outline-none font-semibold text-slate-800 dark:text-slate-100 text-xs";
  const cellCls = "h-7 w-7 rounded flex items-center justify-center cursor-pointer border transition-all text-xs font-black select-none shrink-0";

  const renderCheckCell = (val, onClick) => {
    if (val === true) return <button onClick={onClick} disabled={isReadOnly} className={`${cellCls} bg-green-100 border-green-400 text-green-700 hover:bg-green-200`}><Check className="h-3.5 w-3.5" /></button>;
    if (val === false) return <button onClick={onClick} disabled={isReadOnly} className={`${cellCls} bg-red-100 border-red-400 text-red-600 hover:bg-red-200`}><X className="h-3.5 w-3.5" /></button>;
    return <button onClick={onClick} disabled={isReadOnly} className={`${cellCls} bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-300 hover:border-green-400 hover:bg-green-50`}>—</button>;
  };

  // Render a section grid
  const renderSection = (sectionKey) => {
    const sec = SECTIONS[sectionKey];
    const data = sectionData[sectionKey] || [];
    const allCols = [...sec.columns, ...(sec.ensuiteColumns || [])];
    const hasEnsuite = !!sec.ensuiteColumns;
    const mainColCount = sec.columns.length;

    return (
      <div key={sectionKey} className="space-y-4">
        {/* Section Header */}
        <div className="bg-[#e2f0d9] dark:bg-slate-800 border border-[#548235] dark:border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-black text-[#385723] dark:text-[#a9d18e] uppercase tracking-wide">{sec.title}</h3>
          {sec.description && <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mt-1 leading-relaxed">{sec.description}</p>}
          {sec.countLabel && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{sec.countLabel}:</span>
              <input type="number" disabled={isReadOnly} value={roomCounts[sectionKey] || ''}
                onChange={e => setRoomCounts(prev => ({ ...prev, [sectionKey]: e.target.value }))}
                className="h-7 w-16 px-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold outline-none" />
            </div>
          )}
        </div>

        {/* Checklist Grid */}
        <div className="overflow-x-auto border border-black dark:border-slate-700 rounded-lg">
          <table className="text-[9px] border-collapse w-full" style={{ minWidth: `${allCols.length * 55 + 80}px` }}>
            <thead>
              {hasEnsuite && (
                <tr className="bg-[#548235] text-white">
                  <th className="p-1.5 border-r border-black dark:border-slate-600 text-center font-bold" rowSpan={2}>#</th>
                  <th className="p-1.5 border-r border-black dark:border-slate-600 text-center font-bold" colSpan={mainColCount}>
                    PLACE A TICK OR CROSS DEPENDING ON OUTCOME
                  </th>
                  <th className="p-1.5 text-center font-bold" colSpan={sec.ensuiteColumns.length}>En-suite</th>
                </tr>
              )}
              <tr className="bg-[#70ad47] text-white">
                {!hasEnsuite && <th className="p-1.5 border-r border-black dark:border-slate-600 text-center font-bold">#</th>}
                {allCols.map((col, i) => (
                  <th key={i} className="p-1 border-r border-black/30 dark:border-slate-600 text-center font-bold leading-tight min-w-[50px]">
                    <span className="block" style={{ writingMode: allCols.length > 12 ? 'vertical-rl' : 'horizontal-tb', textOrientation: 'mixed', maxHeight: allCols.length > 12 ? '90px' : 'auto' }}>
                      {col}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rIdx) => (
                <tr key={rIdx} className="border-t border-black/20 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                  <td className="p-1 border-r border-black/30 dark:border-slate-700 text-center min-w-[70px]">
                    <input type="text" disabled={isReadOnly} value={row.room} placeholder={`Rm...`}
                      onChange={e => setRoomLabel(sectionKey, rIdx, e.target.value)}
                      className="w-full text-center bg-transparent border-none outline-none text-[9px] font-bold text-slate-700 dark:text-slate-300" />
                  </td>
                  {allCols.map((_, cIdx) => (
                    <td key={cIdx} className="p-0.5 border-r border-black/10 dark:border-slate-800 text-center">
                      {renderCheckCell(row.checks[cIdx], () => toggleCheck(sectionKey, rIdx, cIdx))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide text-center">
          If NO for any room please complete the comments below
        </p>

        {/* Actions Table */}
        <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-lg">
          <table className="w-full text-[10px] border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
                <th className="p-2 border-r border-slate-200 dark:border-slate-700 text-left w-[25%]">Issue Identified</th>
                <th className="p-2 border-r border-slate-200 dark:border-slate-700 text-left w-[30%]">Comments/Actions</th>
                <th className="p-2 border-r border-slate-200 dark:border-slate-700 text-left w-[12%]">Time Frame</th>
                <th className="p-2 border-r border-slate-200 dark:border-slate-700 text-left w-[18%]">Person Responsible</th>
                <th className="p-2 text-left w-[15%]">Date Actions Completed</th>
              </tr>
            </thead>
            <tbody>
              {(sectionActions[sectionKey] || []).map((act, aIdx) => (
                <tr key={aIdx} className="border-t border-slate-200 dark:border-slate-700">
                  {['issue', 'comments', 'timeFrame', 'responsible', 'completed'].map(field => (
                    <td key={field} className="p-1 border-r border-slate-200 dark:border-slate-700">
                      <input type="text" disabled={isReadOnly} value={act[field]}
                        onChange={e => updateAction(sectionKey, aIdx, field, e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-[10px] font-semibold text-slate-800 dark:text-slate-100 p-1"
                        placeholder="..." />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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

      {/* Document Title */}
      <div className="text-center space-y-2 pb-3">
        <h1 className="text-xl sm:text-2xl font-black text-[#548235] dark:text-[#70ad47] uppercase tracking-wide">
          Cleaning Standards Audit
        </h1>
        <p className="text-[10px] text-slate-500 font-bold">Monthly Cleaning Standards Audit</p>
      </div>

      {/* Metadata Grid */}
      <div className="border border-black dark:border-slate-700 overflow-hidden text-xs font-bold">
        {[
          { label: 'Name of Home', value: homeName, set: setHomeName, type: 'text' },
          { label: 'Month/Year', value: monthYear, set: setMonthYear, type: 'text' },
          { label: 'Name of Manager', value: managerName, set: setManagerName, type: 'text' },
          { label: 'Person conducting audit', value: conductedBy, set: setConductedBy, type: 'text' },
          { label: 'Date Of Completion', value: dateCompletion, set: setDateCompletion, type: 'date' }
        ].map((item, i) => (
          <div key={i} className={`grid grid-cols-[200px_1fr] ${i < 4 ? 'border-b border-black dark:border-slate-700' : ''}`}>
            <div className="p-2.5 bg-[#e2f0d9] dark:bg-slate-800 border-r border-black dark:border-slate-700 font-extrabold text-[#385723] dark:text-[#a9d18e]">
              {item.label}
            </div>
            <div className="p-2 bg-white dark:bg-slate-900">
              <input type={item.type} disabled={isReadOnly} value={item.value}
                onChange={e => item.set(e.target.value)}
                className={inputCls} placeholder={`Enter ${item.label.toLowerCase()}...`} />
            </div>
          </div>
        ))}
      </div>

      {/* Guidance Text */}
      <div className="border border-[#548235] dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900 space-y-2 text-xs">
        <h3 className="font-black text-[#548235] dark:text-[#70ad47] uppercase text-sm">Cleaning Standards Audit</h3>
        <p className="text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
          This audit is to be completed every month by the Registered Manager of the Home/Deputy manager or the Domestic Supervisor (if applicable). The audit can be delegated to a senior staff member whom is trained and knowledgeable to complete by the management team.
        </p>
        <p className="text-slate-700 dark:text-slate-300 font-bold">All areas listed within the Site are to be audited.</p>
        <p className="text-slate-600 dark:text-slate-400 font-semibold">For all areas a random sample of each type of room should be selected and the following should be checked:</p>
        <ul className="list-disc ml-5 space-y-1 text-slate-600 dark:text-slate-400 font-semibold">
          <li>All areas of neglect or build-up of dust or cobwebs that indicate poor cleaning practices especially high-level areas such as wardrobe tops, door frames etc. and low levels such as carpets, flooring and skirting boards.</li>
          <li>Presence of unpleasant odors.</li>
          <li>State of general tidiness.</li>
        </ul>
      </div>

      {/* Live Score */}
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-[#70ad47]/30 bg-[#f4fbef] dark:bg-slate-800 dark:border-slate-700 shadow-xs">
        <div className="flex-1 space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Overall Compliance Score</p>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${score}%`, background: score >= 90 ? '#22c55e' : score >= 75 ? '#f59e0b' : '#ef4444' }} />
          </div>
        </div>
        <div className="text-center shrink-0">
          <p className="text-2xl font-black text-[#548235] dark:text-[#70ad47]">{score}%</p>
          <span className={`px-2 py-0.5 rounded border text-[9px] font-extrabold uppercase ${score >= 90 ? 'text-green-700 bg-green-100 border-green-400' : score >= 75 ? 'text-amber-700 bg-amber-100 border-amber-400' : 'text-red-700 bg-red-100 border-red-400'}`}>
            {score >= 90 ? 'GREEN' : score >= 75 ? 'AMBER' : 'RED'}
          </span>
        </div>
      </div>

      {/* All 8 Sections */}
      {Object.keys(SECTIONS).map(key => renderSection(key))}

      {/* Section 9: Record Keeping */}
      <div className="space-y-4">
        <div className="bg-[#e2f0d9] dark:bg-slate-800 border border-[#548235] dark:border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-black text-[#385723] dark:text-[#a9d18e] uppercase tracking-wide">Section 9: Record Keeping</h3>
        </div>
        <div className="overflow-x-auto border border-black dark:border-slate-700 rounded-lg">
          <table className="w-full text-[10px] border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#70ad47] text-white font-bold uppercase">
                {RECORD_KEEPING_QUESTIONS.map((q, i) => (
                  <th key={i} className="p-2 border-r border-black/30 dark:border-slate-600 text-center font-bold" style={{ width: `${60 / RECORD_KEEPING_QUESTIONS.length}%` }}>{q}</th>
                ))}
                <th className="p-2 border-r border-black/30 dark:border-slate-600 text-center w-[10%]">Comments</th>
                <th className="p-2 border-r border-black/30 dark:border-slate-600 text-center w-[8%]">Time Frame</th>
                <th className="p-2 border-r border-black/30 dark:border-slate-600 text-center w-[10%]">Responsible</th>
                <th className="p-2 text-center w-[10%]">Completed</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {RECORD_KEEPING_QUESTIONS.map((_, i) => (
                  <td key={i} className="p-2 border-r border-slate-300 dark:border-slate-700 text-center">
                    {renderCheckCell(recordKeeping[i], () => {
                      if (isReadOnly) return;
                      setRecordKeeping(prev => {
                        const cur = prev[i];
                        return { ...prev, [i]: cur === true ? false : cur === false ? null : true };
                      });
                    })}
                  </td>
                ))}
                {['comments', 'timeFrame', 'responsible', 'completed'].map(field => (
                  <td key={field} className="p-1 border-r border-slate-300 dark:border-slate-700">
                    <input type="text" disabled={isReadOnly} value={recordActions[field]}
                      onChange={e => setRecordActions(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full bg-transparent border-none outline-none text-[10px] font-semibold p-1 text-slate-800 dark:text-slate-100" placeholder="..." />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 10: Audit Results */}
      <div className="space-y-4">
        <div className="bg-[#e2f0d9] dark:bg-slate-800 border border-[#548235] dark:border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-black text-[#385723] dark:text-[#a9d18e] uppercase tracking-wide">Section 10: Audit Results</h3>
        </div>
        <div className="border border-black dark:border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#70ad47] text-white font-bold uppercase">
                <th className="p-2.5 border-r border-black/30 text-left w-[10%]">Section</th>
                <th className="p-2.5 border-r border-black/30 text-left w-[60%]"></th>
                <th className="p-2.5 text-center w-[30%]">Actions Identified and Completed (Y/N)</th>
              </tr>
            </thead>
            <tbody>
              {RESULT_SECTIONS.map(s => (
                <tr key={s.num} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                  <td className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-black text-slate-700 dark:text-slate-300 text-center">{s.num}</td>
                  <td className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100">{s.label}</td>
                  <td className="p-1.5 text-center">
                    <select disabled={isReadOnly} value={sectionResults[s.num] || ''}
                      onChange={e => setSectionResults(prev => ({ ...prev, [s.num]: e.target.value }))}
                      className="h-7 px-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold outline-none">
                      <option value="">—</option>
                      <option value="Y">Y</option>
                      <option value="N">N</option>
                    </select>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-black dark:border-slate-600 bg-[#e2f0d9] dark:bg-slate-800">
                <td className="p-2.5 border-r border-slate-200 dark:border-slate-700"></td>
                <td className="p-2.5 border-r border-slate-200 dark:border-slate-700 font-black text-[#385723] dark:text-[#a9d18e] uppercase">Cleaning Standards Overall Result</td>
                <td className="p-2.5 text-center font-black text-lg text-[#548235] dark:text-[#70ad47]">{score}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* All Actions Completed */}
        <div className="border border-black dark:border-slate-700 rounded-lg p-4 flex items-center gap-4 bg-white dark:bg-slate-900">
          <span className="text-xs font-black text-slate-700 dark:text-slate-300">All Actions Completed:</span>
          <select disabled={isReadOnly} value={allCompleted}
            onChange={e => setAllCompleted(e.target.value)}
            className="h-8 px-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold outline-none">
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
        </div>
      </div>

      {/* Signature Block */}
      <div className="border border-black dark:border-slate-700 text-xs font-bold overflow-hidden rounded-lg">
        {/* Manager Row */}
        <div className="grid grid-cols-6 divide-x divide-black dark:divide-slate-700 border-b border-black dark:border-slate-700">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400">Manager:</div>
          <div className="p-2 col-span-1"><input type="text" disabled={isReadOnly} value={mgrSignName} onChange={e => setMgrSignName(e.target.value)} className={inputCls} placeholder="Name..." /></div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400">Signature:</div>
          <div className="p-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" disabled={isReadOnly} checked={mgrSigned} onChange={e => setMgrSigned(e.target.checked)} className="rounded border-slate-300 text-[#70ad47]" />
              <span className="text-slate-700 dark:text-slate-300">{mgrSigned ? '✓ E-Signed' : 'Sign'}</span>
            </label>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400">Date:</div>
          <div className="p-2"><input type="date" disabled={isReadOnly} value={mgrSignDate} onChange={e => setMgrSignDate(e.target.value)} className={inputCls} /></div>
        </div>
        {/* Domestic Supervisor Row */}
        <div className="grid grid-cols-6 divide-x divide-black dark:divide-slate-700 border-b border-black dark:border-slate-700">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400">Domestic Supervisor:</div>
          <div className="p-2 col-span-1"><input type="text" disabled={isReadOnly} value={domSignName} onChange={e => setDomSignName(e.target.value)} className={inputCls} placeholder="Name..." /></div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400">Signature:</div>
          <div className="p-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" disabled={isReadOnly} checked={domSigned} onChange={e => setDomSigned(e.target.checked)} className="rounded border-slate-300 text-[#70ad47]" />
              <span className="text-slate-700 dark:text-slate-300">{domSigned ? '✓ E-Signed' : 'Sign'}</span>
            </label>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400">Date:</div>
          <div className="p-2"><input type="date" disabled={isReadOnly} value={domSignDate} onChange={e => setDomSignDate(e.target.value)} className={inputCls} /></div>
        </div>
        {/* Date Filed */}
        <div className="grid grid-cols-[200px_1fr]">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border-r border-black dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400">Date Filed to Main Audit File:</div>
          <div className="p-2 bg-white dark:bg-slate-900"><input type="date" disabled={isReadOnly} value={dateFiled} onChange={e => setDateFiled(e.target.value)} className={inputCls} /></div>
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

export default HouseKeepingAudit;
