import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Plus, 
  X, 
  Check, 
  AlertTriangle, 
  Upload,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import AccessDenied from '../shared/AccessDenied';

const MyDocuments = () => {
  const {
    employees,
    documents,
    activeEmployeeId,
    uploadEmployeeDocument,
    currentRole
  } = useApp();

  // Strict RBAC Guard
  if (currentRole !== 'Employee') {
    return <AccessDenied />;
  }

  const currentEmp = employees.find(e => e.id === activeEmployeeId) || employees[0];
  const empDocs = documents[currentEmp.id] || [];

  // Fine-grained state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');

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

  // Helper to find document by type
  const findDoc = (type) => {
    return empDocs.find(d => d.name.toLowerCase() === type.toLowerCase() || 
      (type === 'Proof of Address' && d.name === 'Proof Of Address'));
  };

  // Helper to handle standard file upload
  const handleUploadFile = (docType, file) => {
    if (!file) return;
    const currentUserName = currentEmp.name;
    uploadEmployeeDocument(currentEmp.id, docType, file.name, currentUserName);
  };

  // Document Add Submit
  const handleAddDocumentSubmit = (e) => {
    e.preventDefault();
    if (!newDocName) return;

    let docNameFormatted = newDocName;
    if (!docNameFormatted.endsWith('.pdf')) {
      docNameFormatted = `${docNameFormatted}.pdf`;
    }

    uploadEmployeeDocument(currentEmp.id, docNameFormatted, docNameFormatted, currentEmp.name);
    setNewDocName('');
    setIsDocModalOpen(false);
  };

  const uploadedDocs = empDocs.filter(d => d.uploadStatus === 'Uploaded');

  return (
    <div className="space-y-6 animate-fade-in p-2 text-slate-800 dark:text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight">My Documents & Folders</h2>
        <p className="text-xs text-slate-500">Upload your onboarding documents and monitor their verification status</p>
      </div>

      {/* SECTION 1: UPLOAD DOCUMENTS (9 MANDATORY TYPES GRID) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">1. Required Compliance Documents</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Upload mandatory onboarding files to request verification</p>
          </div>
          
          <button
            onClick={() => setIsDocModalOpen(true)}
            className="h-8 px-3.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold dark:bg-brand-950/40 dark:text-brand-400 transition-all text-[10px] flex items-center gap-1.5"
            title="Add Custom Document"
          >
            <Plus className="h-4 w-4" />
            <span>Add Custom Doc</span>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REQ_DOC_TYPES.map((type) => {
            const doc = findDoc(type);
            
            const isUploaded = doc && doc.uploadStatus === 'Uploaded';
            const status = doc ? doc.status : 'Not Uploaded';
            const fileName = isUploaded ? doc.fileName : '';
            const expiryDate = doc ? doc.expiryDate : 'N/A';
            
            // Expiry Check
            let expiryLabel = expiryDate;
            let expiryStyle = 'text-slate-550 dark:text-slate-400';
            if (isUploaded && expiryDate && expiryDate !== 'N/A') {
              const exp = new Date(expiryDate);
              const ref = new Date('2026-06-03');
              const diffTime = exp - ref;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays < 0) {
                expiryLabel = `${expiryDate} (Expired)`;
                expiryStyle = "text-red-500 font-bold dark:text-red-400";
              } else if (diffDays <= 30) {
                expiryLabel = `${expiryDate} (Expiring in ${diffDays} days)`;
                expiryStyle = "text-amber-500 font-bold dark:text-amber-450";
              }
            }

            // Badge configuration based on status
            let badgeText = 'Missing';
            let badgeStyle = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400';
            if (status === 'Verified') {
              badgeText = 'Verified';
              badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-500/10 dark:text-emerald-450';
            } else if (status === 'Pending Verification') {
              badgeText = 'Pending Verification';
              badgeStyle = 'bg-indigo-50 text-indigo-750 border-indigo-250 dark:bg-indigo-500/10 dark:text-indigo-400';
            } else if (status === 'Rejected') {
              badgeText = 'Rejected';
              badgeStyle = 'bg-red-50 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-400';
            }

            // Card border color
            let cardBorder = 'border-slate-200/70 dark:border-slate-800/80';
            if (status === 'Verified') cardBorder = 'border-emerald-500/20 dark:border-emerald-500/15';
            else if (status === 'Pending Verification') cardBorder = 'border-indigo-500/20 dark:border-indigo-500/15';
            else if (status === 'Rejected') cardBorder = 'border-red-500/20 dark:border-red-500/15';

            return (
              <div key={type} className={`glass-card rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all hover:shadow-sm ${cardBorder}`}>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-slate-850 dark:text-slate-150 text-xs truncate max-w-[130px] sm:max-w-none" title={type}>
                      {type}
                    </h4>
                    <span className={`px-2 py-0.5 rounded font-extrabold text-[8px] border uppercase ${badgeStyle}`}>
                      {badgeText}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span>File Name:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-250 truncate max-w-[150px]">{fileName || 'No file uploaded'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expiry Date:</span>
                      <span className={`font-semibold ${expiryStyle}`}>{expiryLabel}</span>
                    </div>
                    {status === 'Rejected' && doc && doc.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-2 rounded-lg mt-2 text-[9px] border border-red-200/40">
                        <strong>Reason:</strong> {doc.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-150/40 dark:border-slate-850/60 pt-3 mt-1 gap-2">
                  <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-650 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-400 font-bold text-[9px] cursor-pointer transition-all border border-slate-200/50 dark:border-slate-800 shadow-sm shrink-0">
                    <Upload className="h-3 w-3" />
                    <span>{isUploaded ? 'Re-upload Document' : 'Upload Document'}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadFile(type, e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: MY UPLOADS TABLE (NO VERIFIER COLUMN EXPOSED) */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">2. Document Verification Status</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Summary of documents submitted for verification</p>
        </div>

        <div className="border border-slate-150/60 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-850 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="p-3.5 pl-5">Document Type</th>
                  <th className="p-3.5">File Name</th>
                  <th className="p-3.5">Upload Stamp</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-[11px]">
                {uploadedDocs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-400 italic">You have not uploaded any documents yet.</td>
                  </tr>
                ) : (
                  uploadedDocs.map((doc, idx) => {
                    let statusBadgeText = 'Needs Review';
                    let statusBadgeStyle = 'bg-indigo-50 text-indigo-705 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400';
                    if (doc.status === 'Verified') {
                      statusBadgeText = 'Verified';
                      statusBadgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-500/10';
                    } else if (doc.status === 'Rejected') {
                      statusBadgeText = 'Rejected';
                      statusBadgeStyle = 'bg-red-50 text-red-700 border-red-300 dark:bg-red-500/20';
                    }

                    return (
                      <tr key={idx} className="hover:bg-slate-50/45 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="p-3.5 pl-5 font-bold text-slate-800 dark:text-slate-250">{doc.name}</td>
                        <td className="p-3.5 font-semibold text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{doc.fileName}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-400 font-semibold">{doc.uploadTime}, {doc.uploadDate}</td>
                        <td className="p-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase ${statusBadgeStyle}`}>
                            {statusBadgeText}
                          </span>
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

      {/* MODAL: ADD NEW COMPLIANCE DOCUMENT */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-sm w-full rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-white dark:bg-slate-950 animate-slide-up max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setIsDocModalOpen(false)}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-650 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-3 mb-4 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-brand-500" />
              <span>Add Custom Document</span>
            </h3>

            <form onSubmit={handleAddDocumentSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 block uppercase text-[9px]">Document File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health Declaration"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 justify-end border-t pt-3">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="h-8.5 px-4 rounded-xl border font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyDocuments;
