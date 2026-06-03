import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Search, 
  Filter, 
  History, 
  Calendar,
  User,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  X,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import AccessDenied from '../shared/AccessDenied';

const VerificationAuditLog = () => {
  const {
    employees,
    documents,
    currentRole,
    verifyEmployeeDocument,
    rejectEmployeeDocument
  } = useApp();

  // Strict RBAC Guard
  if (currentRole !== 'Admin') {
    return <AccessDenied />;
  }

  // Filter States
  const [searchEmployee, setSearchEmployee] = useState('');
  const [filterManager, setFilterManager] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchEmployee, filterManager, filterStatus]);

  // Verification states for Admin
  const [selectedDocForVerification, setSelectedDocForVerification] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [originalSeen, setOriginalSeen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleOpenVerification = (doc) => {
    const emp = employees.find(e => e.id === doc.employeeId);
    setSelectedEmp(emp);
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
    const currentUserName = 'Admin User';
    verifyEmployeeDocument(selectedEmp.id, selectedDocForVerification.name, currentUserName, verificationNotes);
    
    setSelectedDocForVerification(null);
    setSelectedEmp(null);
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
    const currentUserName = 'Admin User';
    rejectEmployeeDocument(selectedEmp.id, selectedDocForVerification.name, currentUserName, rejectionReason);
    
    setIsRejectionModalOpen(false);
    setSelectedDocForVerification(null);
    setSelectedEmp(null);
    setOriginalSeen(false);
    setVerificationNotes('');
  };

  // Gather all uploaded documents across all employees
  const allUploadedDocs = [];
  const allLogs = [];

  employees.forEach(emp => {
    const empDocs = documents[emp.id] || [];
    empDocs.forEach(doc => {
      // Gather documents that have been uploaded
      if (doc.uploadStatus === 'Uploaded' || doc.status === 'Rejected' || doc.status === 'Verified' || doc.status === 'Pending Verification') {
        allUploadedDocs.push({
          ...doc,
          employeeId: emp.id,
          employeeName: emp.name,
          employeePhoto: emp.photo,
          employeeTitle: emp.title
        });
      }

      // Gather audit history logs
      if (doc.history && Array.isArray(doc.history)) {
        doc.history.forEach(h => {
          allLogs.push({
            ...h,
            docName: doc.name,
            employeeName: emp.name,
            notes: h.action === 'Verified' ? doc.verificationNotes : (h.action === 'Rejected' ? doc.rejectionReason : '')
          });
        });
      }
    });
  });

  // Unique list of managers for filtering
  const allManagersList = ['All', 'Sarah Jenkins', 'Admin User'];

  // Helper to parse dates for sorting
  const parseDateTime = (dStr, tStr) => {
    if (!dStr) return new Date(0);
    const parts = dStr.split('/');
    if (parts.length !== 3) return new Date(0);
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const timePart = tStr || '12:00 AM';
    return new Date(`${formattedDate} ${timePart}`);
  };

  // Sort logs reverse-chronologically
  allLogs.sort((a, b) => parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time));

  // Limit total documents to 50 for now as requested
  const limitedUploadedDocs = allUploadedDocs.slice(0, 50);

  // Filtered documents
  const filteredDocs = limitedUploadedDocs.filter(doc => {
    const matchesSearch = doc.employeeName.toLowerCase().includes(searchEmployee.toLowerCase());
    
    let matchesManager = true;
    if (filterManager !== 'All') {
      const verifier = doc.status === 'Verified' ? doc.verifiedBy : (doc.status === 'Rejected' ? doc.rejectedBy : '');
      matchesManager = verifier === filterManager;
    }

    let matchesStatus = true;
    if (filterStatus !== 'All') {
      matchesStatus = doc.status === filterStatus;
    }

    return matchesSearch && matchesManager && matchesStatus;
  });

  // Pagination Calculations
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocs = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate Metrics
  const totalVerified = limitedUploadedDocs.filter(d => d.status === 'Verified').length;
  const totalPending = limitedUploadedDocs.filter(d => d.status === 'Pending Verification').length;
  const totalRejected = limitedUploadedDocs.filter(d => d.status === 'Rejected').length;

  return (
    <div className="space-y-6 animate-fade-in p-2 text-slate-800 dark:text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          <span>Verification Audit Log Dashboard</span>
        </h2>
        <p className="text-xs text-slate-500">System-wide monitoring of employee document compliance, verifiers, and audit trails</p>
      </div>

      {/* METRIC BOXES */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="glass-card rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4 bg-white/40 dark:bg-slate-950/20 shadow-sm flex flex-col justify-between">
          <span className="font-bold text-[10px] text-slate-400 uppercase">Total Logged Submissions</span>
          <span className="text-2xl font-black mt-2 text-slate-800 dark:text-white">{limitedUploadedDocs.length}</span>
        </div>
        <div className="glass-card rounded-2xl border border-emerald-500/10 dark:border-emerald-500/5 p-4 bg-emerald-50/10 dark:bg-emerald-950/5 shadow-sm flex flex-col justify-between">
          <span className="font-bold text-[10px] text-emerald-600 dark:text-emerald-500 uppercase">Verified Uploads</span>
          <span className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">{totalVerified}</span>
        </div>
        <div className="glass-card rounded-2xl border border-indigo-500/10 dark:border-indigo-500/5 p-4 bg-indigo-50/10 dark:bg-indigo-950/5 shadow-sm flex flex-col justify-between">
          <span className="font-bold text-[10px] text-indigo-600 dark:text-indigo-400 uppercase">Pending Review</span>
          <span className="text-2xl font-black mt-2 text-indigo-600 dark:text-indigo-400">{totalPending}</span>
        </div>
        <div className="glass-card rounded-2xl border border-red-500/10 dark:border-red-500/5 p-4 bg-red-50/10 dark:bg-red-950/5 shadow-sm flex flex-col justify-between">
          <span className="font-bold text-[10px] text-red-600 dark:text-red-400 uppercase">Rejected Uploads</span>
          <span className="text-2xl font-black mt-2 text-red-600 dark:text-red-400">{totalRejected}</span>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-wrap items-center gap-3 bg-white/40 dark:bg-slate-950/20 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm text-xs">
        <div className="relative max-w-xs w-full sm:w-60">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchEmployee}
            onChange={(e) => setSearchEmployee(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-xl pl-3 pr-8 font-semibold bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified Only</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Rejected">Rejected Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Verifier:</span>
          <select
            value={filterManager}
            onChange={(e) => setFilterManager(e.target.value)}
            className="h-9 rounded-xl pl-3 pr-8 font-semibold bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none"
          >
            {allManagersList.map(mgr => (
              <option key={mgr} value={mgr}>{mgr === 'All' ? 'All Managers' : mgr}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* LEFT/CENTER PANELS: COMPLIANCE MATRIX TABLE */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="p-3.5 pl-5">Staff Member</th>
                    <th className="p-3.5">Document Type</th>
                    <th className="p-3.5">Uploaded</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Verified By / Action Log</th>
                    <th className="p-3.5 text-right pr-5">Review Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-slate-400 italic">No matching compliance submissions found.</td>
                    </tr>
                  ) : (
                    currentDocs.map((doc, idx) => {
                      let badgeText = 'Pending';
                      let badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400';
                      if (doc.status === 'Verified') {
                        badgeText = 'Verified';
                        badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400';
                      } else if (doc.status === 'Rejected') {
                        badgeText = 'Rejected';
                        badgeStyle = 'bg-red-50 text-red-700 border-red-300 dark:bg-red-500/20';
                      }

                      // Determine button style based on status
                      let reviewBtnText = 'Review & Verify';
                      let reviewBtnStyle = 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm';
                      if (doc.status === 'Verified') {
                        reviewBtnText = 'Re-verify / Edit';
                        reviewBtnStyle = 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800';
                      } else if (doc.status === 'Rejected') {
                        reviewBtnText = 'Re-verify & Approve';
                        reviewBtnStyle = 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/35';
                      }

                      return (
                        <tr key={idx} className="hover:bg-slate-50/45 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="p-3.5 pl-5 flex items-center gap-2.5">
                            <img
                              src={doc.employeePhoto}
                              alt={doc.employeeName}
                              className="h-8 w-8 rounded-lg object-cover border dark:border-slate-800"
                            />
                            <div>
                              <p className="font-extrabold text-slate-800 dark:text-white">{doc.employeeName}</p>
                              <p className="text-[9px] text-slate-400 font-medium">{doc.employeeTitle}</p>
                            </div>
                          </td>
                          <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">{doc.name}</td>
                          <td className="p-3.5 text-slate-400 font-semibold">{doc.uploadDate || 'N/A'}</td>
                          <td className="p-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase ${badgeStyle}`}>
                              {badgeText}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {doc.status === 'Verified' ? (
                              <div>
                                <span className="font-bold text-emerald-650 dark:text-emerald-400 block">
                                  {doc.verifiedBy || 'Manager'}
                                </span>
                                <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">
                                  {doc.verificationDate} {doc.verificationTime}
                                </span>
                                {doc.verificationNotes && (
                                  <span className="text-[9px] text-slate-400 italic block mt-1">
                                    Notes: "{doc.verificationNotes}"
                                  </span>
                                )}
                              </div>
                            ) : doc.status === 'Rejected' ? (
                              <div>
                                <span className="font-bold text-red-600 dark:text-red-400 block">
                                  {doc.rejectedBy || 'Manager'}
                                </span>
                                <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">
                                  {doc.rejectedDate} {doc.rejectedTime}
                                </span>
                                {doc.rejectionReason && (
                                  <span className="text-[9px] text-red-500/80 italic block mt-1 font-bold">
                                    Reason: "{doc.rejectionReason}"
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Pending verification review</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right pr-5">
                            <button
                              onClick={() => handleOpenVerification(doc)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[9px] transition-all ${reviewBtnStyle}`}
                            >
                              {reviewBtnText}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-5 py-3 bg-slate-50/50 dark:bg-slate-900/10 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">
                  Showing <span className="text-slate-800 dark:text-white font-extrabold">{indexOfFirstItem + 1}</span> to <span className="text-slate-800 dark:text-white font-extrabold">{Math.min(indexOfLastItem, filteredDocs.length)}</span> of <span className="text-slate-800 dark:text-white font-extrabold">{filteredDocs.length}</span> documents
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${currentPage === 1 ? 'bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 border-slate-200/50 dark:border-slate-800/40 cursor-not-allowed' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 active:scale-95'}`}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${currentPage === totalPages ? 'bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 border-slate-200/50 dark:border-slate-800/40 cursor-not-allowed' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 active:scale-95'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: SYSTEM-WIDE TIMELINE LOG FEED */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white/40 dark:bg-slate-950/20 flex flex-col h-full">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <History className="h-4.5 w-4.5" />
              <span>Audit Trail Timeline</span>
            </h3>

            <div className="relative pl-5 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar text-xs">
              {/* Vertical line marker */}
              <div className="absolute left-[9px] top-1.5 bottom-1.5 w-0.5 bg-slate-200 dark:bg-slate-800" />

              {allLogs.length === 0 ? (
                <p className="text-slate-400 italic py-4">No events logged in the audit trail.</p>
              ) : (
                allLogs.slice(0, 5).map((hist, idx) => {
                  let indicatorColor = 'bg-amber-400 border-amber-200';
                  if (hist.action === 'Verified' || hist.action === 'Original Seen Checked') {
                    indicatorColor = 'bg-emerald-500 border-emerald-200';
                  } else if (hist.action === 'Rejected') {
                    indicatorColor = 'bg-red-500 border-red-200';
                  }

                  return (
                    <div key={idx} className="relative flex flex-col gap-1 text-[11px]">
                      {/* Dot marker */}
                      <div className={`absolute -left-[20px] h-2.5 w-2.5 rounded-full border-2 ${indicatorColor}`} />

                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {hist.employeeName} · <span className="text-brand-600 dark:text-brand-400">{hist.docName}</span>
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 shrink-0">
                          {hist.time}, {hist.date}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-tight">
                        Action: <strong className="text-slate-600 dark:text-slate-300">{hist.action}</strong> by <strong>{hist.user}</strong>
                      </p>
                      
                      {hist.reason && (
                        <p className="text-[9px] text-red-500/80 font-bold">Reason: "{hist.reason}"</p>
                      )}
                      {hist.notes && (
                        <p className="text-[9px] text-slate-400 italic">Notes: "{hist.notes}"</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: DOCUMENT REVIEW & VERIFICATION PANEL FOR ADMIN */}
      {selectedDocForVerification && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:items-center">
          <div className="glass-modal max-w-3xl w-full rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-white dark:bg-slate-950 animate-slide-up max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar my-auto">
            <button
              onClick={() => {
                setSelectedDocForVerification(null);
                setSelectedEmp(null);
                setOriginalSeen(false);
                setVerificationNotes('');
              }}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-600 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-3 mb-5 flex items-center gap-2">
              <FileCheck className="h-4.5 w-4.5 text-brand-500" />
              <span>Admin Compliance Review: {selectedDocForVerification.name}</span>
            </h3>

            <div className="grid gap-6 md:grid-cols-12 text-xs">
              
              {/* LEFT COLUMN: Document Preview Frame */}
              <div className="md:col-span-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border dark:border-slate-800 flex flex-col justify-between min-h-[280px]">
                <div className="w-full h-full border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-950 flex flex-col justify-between items-center shadow-inner relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[15deg] text-slate-100 dark:text-slate-900/20 text-3xl font-black uppercase select-none pointer-events-none tracking-widest text-center">
                    ADMIN PREVIEW
                  </div>

                  <div className="flex flex-col items-center gap-3.5 relative z-10 mt-2">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                      <FileText className="h-7 w-7" />
                    </div>
                    <div className="text-center">
                      <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">{selectedDocForVerification.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold truncate max-w-[200px]">{selectedDocForVerification.fileName}</p>
                    </div>
                  </div>

                  <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-3 text-[10px] text-slate-400 font-semibold space-y-1.5 text-left relative z-10">
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
                  <div className="p-3 bg-indigo-50 border border-brand-200 rounded-2xl dark:bg-brand-950/10 dark:border-brand-900 text-[10px] leading-relaxed text-slate-600 dark:text-slate-400 font-bold">
                    System Administrator override. You may verify or reject this compliance file directly.
                  </div>

                  {/* Original Seen check */}
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30">
                    <input
                      type="checkbox"
                      id="adminOriginalSeenCheck"
                      checked={originalSeen}
                      onChange={(e) => setOriginalSeen(e.target.checked)}
                      className="h-4.5 w-4.5 mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
                    />
                    <label htmlFor="adminOriginalSeenCheck" className="font-bold text-slate-800 dark:text-slate-200 select-none cursor-pointer leading-tight">
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
                      className={`flex-1 h-9 rounded-xl font-bold text-white transition-all shadow-sm ${originalSeen ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10' : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
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
      {/* MODAL: DOCUMENT REJECTION REASON DIALOG FOR ADMIN */}
      {isRejectionModalOpen && createPortal(
        <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:items-center">
          <div className="glass-modal max-w-md w-full rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-white dark:bg-slate-950 animate-scale-up max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar my-auto">
            <button
              onClick={() => setIsRejectionModalOpen(false)}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-600 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-3 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
              <span>Reject Compliance Document (Admin Override)</span>
            </h3>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 block uppercase text-[9px]">Reason for Rejection</label>
                <textarea
                  required
                  placeholder="Explain why this document is rejected..."
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

export default VerificationAuditLog;
