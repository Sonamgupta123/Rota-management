import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck2, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle,
  FileUp,
  UserCheck2,
  Trash
} from 'lucide-react';

const MANDATORY_DOCS = [
  "Pension Form", "Payroll Form", "Right To Work", "Employer References", 
  "Friend Reference", "Application Form", "Equal Opportunity Form", "Contract", 
  "Offer Letter", "Interview Letter", "Successful Letter", "Proof Of Address", 
  "Job Description", "Interview File", "Passport", "Birth Certificate", 
  "Driving Licence", "Induction", "ID Verification"
];

const Documents = () => {
  const { 
    employees, 
    documents, 
    updateDocumentStatus, 
    currentRole,
    activeEmployeeId
  } = useApp();

  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || "");
  const [docFilter, setDocFilter] = useState('All');
  const [search, setSearch] = useState('');

  const selectedEmpIdToUse = currentRole === 'Employee' ? activeEmployeeId : selectedEmpId;
  const selectedEmp = employees.find(e => e.id === selectedEmpIdToUse) || employees[0];
  const empDocs = documents[selectedEmp?.id] || [];

  // Filter checklist documents
  const filteredDocs = empDocs.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = docFilter === 'All' || 
                          (docFilter === 'Green' && d.complianceIndicator === 'Green') ||
                          (docFilter === 'Amber' && d.complianceIndicator === 'Amber') ||
                          (docFilter === 'Red' && d.complianceIndicator === 'Red');
    return matchesSearch && matchesFilter;
  });

  const getIndicatorStyle = (ind) => {
    if (ind === 'Red') return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40';
    if (ind === 'Amber') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/40';
  };

  const getIndicatorDot = (ind) => {
    if (ind === 'Red') return 'bg-red-500 animate-pulse';
    if (ind === 'Amber') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6 animate-fade-in p-2">
      
      {/* Header and filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight">CQC Document Compliance Checklist</h2>
          <p className="text-xs text-slate-500">Track and verify mandatory employment file audits and signatures</p>
        </div>

        {/* Selected employee selection */}
        <div className="flex gap-2.5 flex-wrap items-center">
          {currentRole !== 'Employee' && (
            <div className="relative">
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="h-9 rounded-xl pl-3 pr-8 text-xs font-semibold bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none shadow-sm"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                ))}
              </select>
            </div>
          )}

          <div className="relative">
            <select
              value={docFilter}
              onChange={(e) => setDocFilter(e.target.value)}
              className="h-9 rounded-xl pl-3 pr-8 text-xs font-semibold bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none shadow-sm"
            >
              <option value="All">All Indicators</option>
              <option value="Green">Compliant (Green)</option>
              <option value="Amber">Verification Required (Amber)</option>
              <option value="Red">Missing / Expired (Red)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Compliant files</span>
            <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {empDocs.filter(d => d.complianceIndicator === 'Green').length}/19 Verified
            </p>
            <span className="text-[10px] text-slate-500 font-semibold">Green status documents</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center dark:bg-emerald-950/20">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Needs Review</span>
            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {empDocs.filter(d => d.complianceIndicator === 'Amber').length} Uploaded
            </p>
            <span className="text-[10px] text-slate-500 font-semibold">Amber status verification required</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center dark:bg-amber-950/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Missing / Expired</span>
            <p className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
              {empDocs.filter(d => d.complianceIndicator === 'Red').length} Items
            </p>
            <span className="text-[10px] text-slate-500 font-semibold">Red status (CQC safety audit hazard)</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center dark:bg-red-950/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Checklist details list */}
      <div className="glass-card rounded-3xl p-5 md:p-6 space-y-4">
        
        {/* Header toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm">Active File Audit: {selectedEmp?.name}</h3>
            <p className="text-[10px] text-slate-400">Verify file logs in real time to satisfy regulatory mandates</p>
          </div>
          
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
        </div>

        {/* High fidelity checklist matrix cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDocs.map((doc, index) => (
            <div 
              key={index} 
              className="rounded-2xl border border-slate-200/80 p-4 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-3 relative overflow-hidden"
            >
              {/* Compliance side strip */}
              <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                doc.complianceIndicator === 'Red' ? 'bg-red-500' : doc.complianceIndicator === 'Amber' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />

              <div className="pl-2 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900 dark:text-white truncate block max-w-[70%]">
                    {doc.name}
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-bold tracking-wider uppercase shrink-0 flex items-center gap-1 ${getIndicatorStyle(doc.complianceIndicator)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${getIndicatorDot(doc.complianceIndicator)}`} />
                    <span>{doc.complianceIndicator}</span>
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px] text-slate-500 font-medium">
                  <div className="flex justify-between">
                    <span>Expiry Date:</span>
                    <strong className="text-slate-800 dark:text-slate-300">{doc.expiryDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Employee Sign:</span>
                    <strong className="text-slate-700 dark:text-slate-400">{doc.employeeSignature}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Manager Stamp:</span>
                    <strong className="text-slate-700 dark:text-slate-400">{doc.managerSignature}</strong>
                  </div>
                </div>

                {/* Audit verification triggers */}
                {currentRole !== 'Employee' && currentRole !== 'Receptionist' ? (
                  <div className="flex gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-850">
                    <button
                      onClick={() => updateDocumentStatus(selectedEmp.id, doc.name, 'uploadStatus', doc.uploadStatus === 'Uploaded' ? 'Pending' : 'Uploaded')}
                      className={`flex-1 h-7 rounded-lg font-semibold text-[10px] flex items-center justify-center gap-1 transition-all
                        ${doc.uploadStatus === 'Uploaded'
                          ? 'border border-slate-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:hover:bg-red-950/20'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                        }
                      `}
                    >
                      <FileUp className="h-3.5 w-3.5" />
                      <span>{doc.uploadStatus === 'Uploaded' ? 'Revoke File' : 'Upload File'}</span>
                    </button>

                    <button
                      onClick={() => updateDocumentStatus(selectedEmp.id, doc.name, 'verifiedStatus', doc.verifiedStatus === 'Verified' ? 'Needs Verification' : 'Verified')}
                      className={`flex-1 h-7 rounded-lg font-semibold text-[10px] flex items-center justify-center gap-1 transition-all
                        ${doc.verifiedStatus === 'Verified'
                          ? 'border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                        }
                      `}
                    >
                      <UserCheck2 className="h-3.5 w-3.5" />
                      <span>{doc.verifiedStatus === 'Verified' ? 'Unverify' : 'Verify File'}</span>
                    </button>
                  </div>
                ) : (
                  // Employee portal self upload mock
                  currentRole === 'Employee' && doc.uploadStatus === 'Pending' && (
                    <button
                      onClick={() => updateDocumentStatus(selectedEmp.id, doc.name, 'uploadStatus', 'Uploaded')}
                      className="w-full h-7 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-[10px] flex items-center justify-center gap-1 transition-all mt-1"
                    >
                      <FileUp className="h-3.5 w-3.5" />
                      <span>Upload & Sign Document</span>
                    </button>
                  )
                )}

              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default Documents;
