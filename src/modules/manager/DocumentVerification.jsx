import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Check, 
  X, 
  AlertTriangle, 
  Search, 
  User, 
  Building,
  ChevronLeft,
  FileCheck
} from 'lucide-react';
import AccessDenied from '../shared/AccessDenied';

const DocumentVerification = () => {
  const {
    employees,
    documents,
    currentRole,
    verifyEmployeeDocument,
    rejectEmployeeDocument
  } = useApp();

  // Strict RBAC Guard
  if (currentRole !== 'Manager') {
    return <AccessDenied />;
  }

  // State
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Verification states
  const [selectedDocForVerification, setSelectedDocForVerification] = useState(null);
  const [originalSeen, setOriginalSeen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const REQ_DOC_TYPES = [
    "Passport",
    "Driving Licence",
    "National ID",
    "Proof of Address",
    "Right To Work",
    "DBS Check",
    "Qualification Certificate",
    "Training Certificate",
    "Other Documents"
  ];

  // Filter employees (Manager can verify documents for all employee-role users)
  const filteredEmployees = employees.filter(emp => {
    // Only show users who are not Admins/Managers to the manager for document verification, or show all standard employees
    const isEmployee = emp.role === 'Employee';
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.title.toLowerCase().includes(searchQuery.toLowerCase());
    return isEmployee && matchesSearch;
  });

  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  const empDocs = selectedEmp ? (documents[selectedEmp.id] || []) : [];

  const handleOpenVerification = (doc) => {
    setSelectedDocForVerification(doc);
    setOriginalSeen(doc.originalSeen || false);
    setVerificationNotes(doc.verificationNotes || '');
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!originalSeen) {
      alert("You must confirm you have seen the original physical document first.");
      return;
    }
    // Hardcode Manager's name as 'Sarah Jenkins' for state stamping
    const currentUserName = 'Sarah Jenkins';
    verifyEmployeeDocument(selectedEmp.id, selectedDocForVerification.name, currentUserName, verificationNotes);
    
    // Refresh local document reference
    setSelectedDocForVerification(null);
    setOriginalSeen(false);
    setVerificationNotes('');
  };

  const handleOpenRejection = () => {
    setIsRejectionModalOpen(true);
    setRejectionReason('');
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert("A rejection reason is required.");
      return;
    }
    const currentUserName = 'Sarah Jenkins';
    rejectEmployeeDocument(selectedEmp.id, selectedDocForVerification.name, currentUserName, rejectionReason);
    
    setIsRejectionModalOpen(false);
    setSelectedDocForVerification(null);
    setOriginalSeen(false);
    setVerificationNotes('');
  };

  // Helper to find document
  const findDoc = (type) => {
    return empDocs.find(d => d.name.toLowerCase() === type.toLowerCase() || 
      (type === 'Proof of Address' && d.name === 'Proof Of Address'));
  };

  return (
    <div className="space-y-6 animate-fade-in p-2 text-slate-800 dark:text-slate-100">
      
      {!selectedEmp ? (
        <>
          {/* Page Header */}
          <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 pb-5">
            <h2 className="text-xl font-bold tracking-tight">Document Verification Portal</h2>
            <p className="text-xs text-slate-500">Review, verify, and reject onboarding compliance files submitted by employees</p>
          </div>

          {/* Directory Section */}
          <div className="glass-card rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/20 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-250">Employee Compliance Directory</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Select a staff member below to inspect and verify their compliance documents.</p>
              </div>
              
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employee by name or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
                />
              </div>
            </div>

            {/* Directory Table */}
            <div className="border border-slate-150/60 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-850 text-[10px] font-bold text-slate-400 uppercase">
                      <th className="p-4 pl-5">Staff Member</th>
                      <th className="p-4">Group / Dept</th>
                      <th className="p-4">Onboarding Progress</th>
                      <th className="p-4">Pending Docs</th>
                      <th className="p-4">Verified Docs</th>
                      <th className="p-4 text-right pr-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-[11px]">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-10 text-center text-slate-400 italic">No employees found.</td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => {
                        const empDocs = documents[emp.id] || [];
                        const uploadedCount = empDocs.filter(d => d.uploadStatus === 'Uploaded').length;
                        const verifiedCount = empDocs.filter(d => d.status === 'Verified').length;
                        const pendingCount = empDocs.filter(d => d.status === 'Pending Verification' && d.uploadStatus === 'Uploaded').length;
                        const progressPercent = Math.round((verifiedCount / REQ_DOC_TYPES.length) * 100);

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/45 dark:hover:bg-slate-900/10 transition-colors">
                            <td className="p-4 pl-5 flex items-center gap-3">
                              <img
                                src={emp.photo}
                                alt={emp.name}
                                className="h-9 w-9 rounded-xl object-cover border dark:border-slate-800"
                              />
                              <div>
                                <p className="font-extrabold text-slate-800 dark:text-white text-xs">{emp.name}</p>
                                <p className="text-[9px] text-slate-400 font-medium">{emp.title}</p>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-slate-500 dark:text-slate-400">
                              {emp.group || 'Care Staff'}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                                <span className="font-bold text-[10px] text-slate-500 dark:text-slate-400">
                                  {verifiedCount}/{REQ_DOC_TYPES.length} ({progressPercent}%)
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              {pendingCount > 0 ? (
                                <span className="inline-flex px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-755 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 text-[9px] font-bold animate-pulse">
                                  {pendingCount} Pending
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              {verifiedCount > 0 ? (
                                <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-705 border border-emerald-250 dark:bg-emerald-500/10 dark:text-emerald-450 text-[9px] font-bold">
                                  {verifiedCount} Verified
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">-</span>
                              )}
                            </td>
                            <td className="p-4 text-right pr-5">
                              <button
                                onClick={() => setSelectedEmpId(emp.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all text-[10px] shadow-sm ml-auto"
                              >
                                Verify Documents
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Back button & Header */}
          <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
            <button
              onClick={() => setSelectedEmpId(null)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold transition-all w-fit"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Employee List</span>
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Onboarding Verification</h2>
                <p className="text-xs text-slate-500">Review compliance documents uploaded by {selectedEmp.name}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmp.photo}
                  alt={selectedEmp.name}
                  className="h-10 w-10 rounded-xl object-cover border dark:border-slate-800"
                />
                <div>
                  <p className="font-extrabold text-xs text-slate-800 dark:text-white">{selectedEmp.name}</p>
                  <p className="text-[9px] text-slate-400 font-medium">{selectedEmp.title} · {selectedEmp.group}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-sm space-y-6">
            {/* Document Checklist Grid */}
            <div className="space-y-3.5">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Required Onboarding Documents</h4>
              
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {REQ_DOC_TYPES.map((type) => {
                  const doc = findDoc(type);
                  const isUploaded = doc && doc.uploadStatus === 'Uploaded';
                  const status = doc ? doc.status : 'Not Uploaded';
                  const fileName = isUploaded ? doc.fileName : '';
                  
                  let badgeStyle = 'bg-red-50 text-red-705 border-red-200 dark:bg-red-500/10 dark:text-red-400';
                  let cardBorder = 'border-slate-200 dark:border-slate-800';
                  
                  if (status === 'Verified') {
                    badgeStyle = 'bg-emerald-50 text-emerald-705 border-emerald-250 dark:bg-emerald-500/10';
                    cardBorder = 'border-emerald-500/15 dark:border-emerald-500/10';
                  } else if (status === 'Pending Verification') {
                    badgeStyle = 'bg-indigo-50 text-indigo-705 border-indigo-250 dark:bg-indigo-500/10';
                    cardBorder = 'border-indigo-500/15 dark:border-indigo-500/10';
                  } else if (status === 'Rejected') {
                    badgeStyle = 'bg-red-50 text-red-755 border-red-300 dark:bg-red-500/20';
                    cardBorder = 'border-red-500/15 dark:border-red-500/10';
                  }

                  // Determine button style based on upload/verification status
                  let reviewBtnText = 'Review & Verify';
                  let reviewBtnStyle = 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm';
                  
                  if (status === 'Verified') {
                    reviewBtnText = 'Re-verify / Edit';
                    reviewBtnStyle = 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-355 border border-slate-200/50 dark:border-slate-800';
                  } else if (status === 'Rejected') {
                    reviewBtnText = 'Re-verify & Approve';
                    reviewBtnStyle = 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/35';
                  }

                  return (
                    <div key={type} className={`glass-card rounded-2xl border p-4 flex flex-col justify-between gap-3 shadow-sm ${cardBorder}`}>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-1">
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]" title={type}>{type}</h5>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border uppercase tracking-wider shrink-0 ${badgeStyle}`}>
                            {status === 'Not Uploaded' ? 'Missing' : status}
                          </span>
                        </div>

                        <div className="space-y-1 text-[10px] text-slate-400">
                          <div className="flex justify-between">
                            <span>File:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-355 truncate max-w-[120px]" title={fileName || 'N/A'}>
                              {fileName || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expiry:</span>
                            <span className="font-semibold">{doc ? doc.expiryDate : 'N/A'}</span>
                          </div>
                          {status === 'Rejected' && doc && doc.rejectionReason && (
                            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-2 rounded-lg mt-2 text-[9px] border border-red-200/40">
                              <strong>Reason:</strong> {doc.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Verification Trigger Button (Clickable for any uploaded doc) */}
                      {isUploaded && (
                        <button
                          onClick={() => handleOpenVerification(doc)}
                          className={`w-full h-7 rounded-xl font-bold text-[9px] transition-all ${reviewBtnStyle}`}
                        >
                          {reviewBtnText}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verification Summary Table */}
            <div className="space-y-3.5 pt-4">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Document Summary Table</h4>
              
              <div className="border border-slate-150/60 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-850 text-[10px] font-bold text-slate-400 uppercase">
                        <th className="p-3 pl-5">Document Type</th>
                        <th className="p-3">File Name</th>
                        <th className="p-3">Upload Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right pr-5">Review Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                      {empDocs.filter(d => d.uploadStatus === 'Uploaded').length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-slate-400 italic">No uploaded documents found.</td>
                        </tr>
                      ) : (
                        empDocs.filter(d => d.uploadStatus === 'Uploaded').map((doc, idx) => {
                          let badgeStyle = 'bg-indigo-50 text-indigo-705 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400';
                          if (doc.status === 'Verified') {
                            badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-500/10';
                          } else if (doc.status === 'Rejected') {
                            badgeStyle = 'bg-red-50 text-red-700 border-red-305 dark:bg-red-500/20';
                          }

                          return (
                            <tr key={idx} className="hover:bg-slate-50/45 dark:hover:bg-slate-900/10 transition-colors">
                              <td className="p-3 pl-5 font-bold text-slate-800 dark:text-slate-250">{doc.name}</td>
                              <td className="p-3 font-semibold text-slate-500 dark:text-slate-455">
                                <div className="flex items-center gap-1.5">
                                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-[150px]">{doc.fileName}</span>
                                </div>
                              </td>
                              <td className="p-3 text-slate-400 font-semibold">{doc.uploadDate || 'N/A'}</td>
                              <td className="p-3">
                                <span className={`inline-flex px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase ${badgeStyle}`}>
                                  {doc.status}
                                </span>
                              </td>
                              <td className="p-3 text-right pr-5">
                                <button
                                  onClick={() => handleOpenVerification(doc)}
                                  className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold dark:bg-brand-950/40 dark:text-brand-400 transition-all text-[9px]"
                                >
                                  Review
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </>
      )}


      {/* MODAL: DOCUMENT REVIEW & VERIFICATION PANEL */}
      {selectedDocForVerification && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:items-center">
          <div className="glass-modal max-w-3xl w-full rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-white dark:bg-slate-950 animate-slide-up max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar my-auto">
            <button
              onClick={() => {
                setSelectedDocForVerification(null);
                setOriginalSeen(false);
                setVerificationNotes('');
              }}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-600 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-3 mb-5 flex items-center gap-2">
              <FileCheck className="h-4.5 w-4.5 text-brand-500" />
              <span>Review Compliance Document: {selectedDocForVerification.name}</span>
            </h3>

            <div className="grid gap-6 md:grid-cols-12 text-xs">
              
              {/* LEFT COLUMN: Document Preview Frame */}
              <div className="md:col-span-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border dark:border-slate-800 flex flex-col justify-between min-h-[280px]">
                <div className="w-full h-full border border-dashed border-slate-250 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-950 flex flex-col justify-between items-center shadow-inner relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[15deg] text-slate-100 dark:text-slate-900/20 text-3xl font-black uppercase select-none pointer-events-none tracking-widest text-center">
                    VERIFICATION<br />PREVIEW
                  </div>

                  <div className="flex flex-col items-center gap-3.5 relative z-10 mt-2">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                      <FileText className="h-7 w-7" />
                    </div>
                    <div className="text-center">
                      <p className="font-extrabold text-slate-850 dark:text-slate-150 text-xs">{selectedDocForVerification.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold truncate max-w-[200px]">{selectedDocForVerification.fileName}</p>
                    </div>
                  </div>

                  <div className="w-full border-t border-slate-100 dark:border-slate-850 pt-3 text-[10px] text-slate-400 font-semibold space-y-1.5 text-left relative z-10">
                    <div className="flex justify-between">
                      <span>Owner:</span>
                      <span className="text-slate-800 dark:text-slate-200">{selectedEmp?.name || 'Employee'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Upload Date:</span>
                      <span className="text-slate-800 dark:text-slate-200">{selectedDocForVerification.uploadDate || 'Just now'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span className="text-slate-800 dark:text-slate-200">PDF Document</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Action Verification Panel */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                <form onSubmit={handleVerifySubmit} className="space-y-4 flex-1">
                  <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-2xl dark:bg-indigo-950/10 dark:border-indigo-900 text-[10px] leading-relaxed text-indigo-700 dark:text-indigo-400 font-semibold">
                    Ensure details match current care standards and you have physically checked the original physical document.
                  </div>

                  {/* Original Seen check */}
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30">
                    <input
                      type="checkbox"
                      id="originalSeenCheck"
                      checked={originalSeen}
                      onChange={(e) => setOriginalSeen(e.target.checked)}
                      className="h-4.5 w-4.5 mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
                    />
                    <label htmlFor="originalSeenCheck" className="font-bold text-slate-800 dark:text-slate-200 select-none cursor-pointer leading-tight">
                      Confirm Original Seen
                      <span className="block text-[9px] text-slate-400 font-medium mt-0.5">I confirm that I have physically seen and validated the original document.</span>
                    </label>
                  </div>

                  {/* Notes text area */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 block uppercase text-[9px]">Verification Notes</label>
                    <textarea
                      placeholder="Add comments or compliance check details..."
                      rows="3"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={!originalSeen}
                      className={`flex-1 h-9 rounded-xl font-bold text-white transition-all shadow-sm ${originalSeen ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10' : 'bg-slate-300 dark:bg-slate-800 text-slate-400'}`}
                    >
                      Verify & Approve
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenRejection}
                      className="h-9 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/35 transition-all"
                    >
                      Reject File
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: DOCUMENT REJECTION REASON DIALOG */}
      {isRejectionModalOpen && createPortal(
        <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:items-center">
          <div className="glass-modal max-w-md w-full rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-white dark:bg-slate-950 animate-scale-up max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar my-auto">
            <button
              onClick={() => setIsRejectionModalOpen(false)}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-650 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-3 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
              <span>Reject Compliance Document</span>
            </h3>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 block uppercase text-[9px]">Reason for Rejection</label>
                <textarea
                  required
                  placeholder="Explain why this document is rejected (e.g. Blur file, incorrect format)..."
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectionModalOpen(false)}
                  className="h-8.5 px-4 rounded-xl border font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-md"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default DocumentVerification;
