import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, Plus, Calendar, Clock, AlertCircle, FileText, CheckCircle, 
  Search, User, ClipboardList, Shield, AlertTriangle, ShieldAlert, Award, 
  FileClock, Trash2, ArrowLeft, Upload, CheckCircle2, ChevronRight, UserCheck, HelpCircle
} from 'lucide-react';

const COMPETENCY_TYPES = [
  'Medication Competency', 'Medication Error Competency', 'Fire Safety Competency', 
  'Infection Control Competency', 'Health & Safety Competency', 'Manual Handling Competency', 
  'Care Planning Competency', 'Food Hygiene Competency', 'First Aid Competency', 'Other'
];

const MEDICATION_CHECKLIST = [
  'MAR Chart Understanding', 'Safe Administration', 'Hand Hygiene', 
  'Consent Procedures', 'Medication Storage', 'Controlled Drugs Handling', 
  'Record Keeping', 'PRN Medication Knowledge', 'Error Reporting'
];

const MED_ERROR_CHECKLIST = [
  'Error Identification', 'Near Miss Reporting', 'Duty Of Candour', 
  'Incident Reporting', 'Escalation Process', 'Documentation Requirements', 
  'Corrective Actions'
];

const CompetencyManagement = () => {
  const {
    assessments,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    renewCompetency,
    uploadCompetencyEvidence,
    employees,
    activeEmployeeId,
    currentRole
  } = useApp();

  const [viewState, setViewState] = useState('dashboard'); // 'dashboard', 'details'
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  
  // Requests Log for managers requesting training/assessments
  const [requestedAssessments, setRequestedAssessments] = useState([
    { id: 'REQ-101', staffName: 'Amira Patel', employeeId: 'EMP-003', competencyType: 'Medication Competency', reason: 'Annual renewal due next month', status: 'Pending', date: '2026-06-02' }
  ]);

  // Form State for creating/editing assessments
  const [formData, setFormData] = useState({
    staffMember: '',
    employeeId: '',
    department: 'Care',
    type: 'Medication Competency',
    customType: '',
    assessorName: '',
    assessmentDate: new Date().toISOString().split('T')[0],
    reviewDate: '',
    expiryDate: '',
    result: 'Pass',
    score: '',
    comments: '',
    recommendations: '',
    checklist: {}
  });

  // Renewal Form State
  const [renewalData, setRenewalData] = useState({
    assessorName: '',
    reviewDate: '',
    expiryDate: ''
  });

  // Request Assessment Form State (for managers)
  const [requestData, setRequestData] = useState({
    employeeId: '',
    competencyType: 'Medication Competency',
    reason: ''
  });

  // Access check
  if (currentRole === 'Receptionist') {
    return (
      <div className="glass-card rounded-3xl p-8 text-center max-w-xl mx-auto my-12 shadow-lg border border-slate-200 dark:border-slate-800">
        <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Access Denied</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Your role ({currentRole}) does not have permission to access the Competency Module. Please contact an administrator.
        </p>
      </div>
    );
  }

  const currentEmp = employees.find(e => e.id === activeEmployeeId);

  // RBAC Helper functions
  const isTeamAssessment = (assessment) => {
    if (currentRole === 'Admin' || currentRole === 'HR' || currentRole === 'Compliance Officer') return true;
    if (currentRole === 'Manager') {
      const staffEmp = employees.find(e => e.id === assessment.employeeId);
      return (
        assessment.employeeId === activeEmployeeId ||
        (staffEmp && staffEmp.manager === currentEmp?.name)
      );
    }
    if (currentRole === 'Employee') {
      return assessment.employeeId === activeEmployeeId;
    }
    return false;
  };

  const canManage = () => {
    return ['Admin', 'HR'].includes(currentRole);
  };

  const canDelete = () => {
    return currentRole === 'Admin';
  };

  const canRenew = () => {
    return ['Admin', 'HR'].includes(currentRole);
  };

  const canRequest = () => {
    return currentRole === 'Manager';
  };

  // Filter calculations
  const filteredAssessments = assessments
    .filter(isTeamAssessment)
    .filter(a => {
      const matchesSearch = a.staffMember.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'All' || a.type === typeFilter;
      return matchesSearch && matchesType;
    });

  // Expiry Calculations
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const exp = new Date(expiryDate);
    const now = new Date();
    const diffTime = exp - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return exp >= now && diffDays <= 30;
  };

  // Dashboard Stats Calculations
  const distinctAssessed = new Set(filteredAssessments.map(a => a.employeeId)).size;
  const competentCount = new Set(filteredAssessments.filter(a => a.result === 'Pass' && !isExpired(a.expiryDate)).map(a => a.employeeId)).size;
  const expiringCount = filteredAssessments.filter(a => isExpiringSoon(a.expiryDate)).length;
  const expiredCount = filteredAssessments.filter(a => isExpired(a.expiryDate)).length;
  const failedCount = filteredAssessments.filter(a => a.result === 'Fail').length;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'type') {
        updated.checklist = {}; // reset checklist
      }
      if (name === 'employeeId') {
        const selectedStaff = employees.find(emp => emp.id === value);
        if (selectedStaff) {
          updated.staffMember = selectedStaff.name;
          updated.department = selectedStaff.group || 'Care';
        }
      }
      return updated;
    });
  };

  const handleChecklistChange = (item) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [item]: !prev.checklist[item]
      }
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (selectedAssessment) {
      updateAssessment(selectedAssessment.id, formData);
      const updated = assessments.find(a => a.id === selectedAssessment.id);
      if (updated) setSelectedAssessment(updated);
    } else {
      addAssessment(formData);
    }
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setSelectedAssessment(null);
    const firstStaff = employees[0] || { id: '', name: '', group: '' };
    setFormData({
      staffMember: firstStaff.name,
      employeeId: firstStaff.id,
      department: firstStaff.group || 'Care',
      type: 'Medication Competency',
      customType: '',
      assessorName: currentEmp ? currentEmp.name : 'Sarah Jenkins',
      assessmentDate: new Date().toISOString().split('T')[0],
      reviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +6 months
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +1 year
      result: 'Pass',
      score: '90',
      comments: '',
      recommendations: '',
      checklist: {}
    });
    setIsModalOpen(true);
  };

  const openEditModal = (a) => {
    setSelectedAssessment(a);
    setFormData({ ...a });
    setIsModalOpen(true);
  };

  const handleRenewSubmit = (e) => {
    e.preventDefault();
    renewCompetency(
      selectedAssessment.id,
      renewalData.reviewDate,
      renewalData.expiryDate,
      renewalData.assessorName
    );
    setIsRenewModalOpen(false);
    setTimeout(() => {
      const updated = assessments.find(a => a.id === selectedAssessment.id);
      if (updated) setSelectedAssessment(updated);
    }, 100);
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const staff = employees.find(emp => emp.id === requestData.employeeId);
    if (!staff) return;
    
    const newReq = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      staffName: staff.name,
      employeeId: requestData.employeeId,
      competencyType: requestData.competencyType,
      reason: requestData.reason,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    setRequestedAssessments([newReq, ...requestedAssessments]);
    setIsRequestModalOpen(false);
    alert(`Success: Competency assessment request submitted for ${staff.name}`);
  };

  const handleEvidenceUpload = () => {
    const docTypes = ['signed_checklist.pdf', 'assessor_signoff_log.png', 'practical_feedback_score.pdf'];
    const randomFile = docTypes[Math.floor(Math.random() * docTypes.length)];
    const sizes = ['450 KB', '1.1 MB', '720 KB'];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    
    uploadCompetencyEvidence(selectedAssessment.id, randomFile, randomSize);
    
    setTimeout(() => {
      const updated = assessments.find(a => a.id === selectedAssessment.id);
      if (updated) setSelectedAssessment(updated);
    }, 100);
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Staff Competency Management</h2>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1 ml-10">Track certifications, checklists, renewals, and regulatory training compliance.</p>
        </div>
        
        <div className="flex gap-2">
          {viewState === 'details' && (
            <button 
              onClick={() => setViewState('dashboard')}
              className="h-9 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4"/>
              Back to Dashboard
            </button>
          )}
          {canManage() && (
            <button
              onClick={openCreateModal}
              className="h-9 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Assessment
            </button>
          )}
          {canRequest() && (
            <button
              onClick={() => {
                const team = employees.filter(emp => emp.manager === currentEmp?.name);
                const firstTeam = team[0] || { id: '' };
                setRequestData({
                  employeeId: firstTeam.id,
                  competencyType: 'Medication Competency',
                  reason: ''
                });
                setIsRequestModalOpen(true);
              }}
              className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <ClipboardList className="h-4 w-4" />
              Request Assessment
            </button>
          )}
        </div>
      </div>

      {viewState === 'dashboard' && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
            <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Assessed Staff</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{distinctAssessed}</span>
                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"><User className="h-4 w-4"/></div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-emerald-500">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Competent Staff</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{competentCount}</span>
                <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600"><CheckCircle className="h-4 w-4"/></div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-brand-500">
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Pending / Failures</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{failedCount}</span>
                <div className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600"><HelpCircle className="h-4 w-4"/></div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-amber-500">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">Expiring Soon</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{expiringCount}</span>
                <div className="h-8 w-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600"><Clock className="h-4 w-4"/></div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-rose-500">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">Expired</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{expiredCount}</span>
                <div className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600"><AlertTriangle className="h-4 w-4"/></div>
              </div>
            </div>
          </div>

          {/* Assessment records Table */}
          <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 gap-4">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Assessment Board</h3>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search staff member..." 
                    className="h-8 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white w-full sm:w-48"
                  />
                </div>
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="All">All Competencies</option>
                  {COMPETENCY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase tracking-wider text-slate-500 font-extrabold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 font-bold">Staff Member</th>
                    <th className="p-3 font-bold">Competency Type</th>
                    <th className="p-3 font-bold">Assessor</th>
                    <th className="p-3 font-bold">Expiry Date</th>
                    <th className="p-3 font-bold">Result</th>
                    <th className="p-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAssessments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 text-xs font-semibold">
                        No competency assessment records logged.
                      </td>
                    </tr>
                  ) : (
                    filteredAssessments.map(a => {
                      const expired = isExpired(a.expiryDate);
                      const warning = isExpiringSoon(a.expiryDate);
                      return (
                        <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group text-xs">
                          <td className="p-3">
                            <div className="font-extrabold text-slate-900 dark:text-slate-100">{a.staffMember}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{a.employeeId} • {a.department}</div>
                          </td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                            {a.type === 'Other' ? a.customType : a.type}
                          </td>
                          <td className="p-3 font-semibold text-slate-655 dark:text-slate-400">
                            {a.assessorName}
                          </td>
                          <td className="p-3">
                            <span className={`font-semibold flex items-center gap-1
                              ${expired 
                                ? 'text-rose-600 dark:text-rose-455 font-bold' 
                                : warning 
                                  ? 'text-amber-600 dark:text-amber-455 font-bold' 
                                  : 'text-slate-600 dark:text-slate-400'}
                            `}>
                              {expired ? <AlertTriangle className="h-3.5 w-3.5"/> : warning ? <Clock className="h-3.5 w-3.5"/> : null}
                              {a.expiryDate} {expired ? '(Expired)' : warning ? '(Expiring Soon)' : ''}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border
                              ${a.result === 'Pass' 
                                ? 'border-emerald-250 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400' 
                                : 'border-rose-250 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-400'}
                            `}>
                              {a.result}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {canManage() && (
                              <button 
                                onClick={() => openEditModal(a)}
                                className="text-[11px] font-bold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400"
                              >
                                Edit
                              </button>
                            )}
                            <button 
                              onClick={() => { setSelectedAssessment(a); setViewState('details'); }}
                              className="text-[11px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-lg border border-brand-100 dark:border-brand-900/40"
                            >
                              Details
                            </button>
                            {canDelete() && (
                              <button 
                                onClick={() => deleteAssessment(a.id)}
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-450 dark:hover:text-rose-350"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Requested Assessments list for Manager/HR/Admin visibility */}
          {requestedAssessments.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden shadow-sm mt-6">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                  <ClipboardList className="h-4.5 w-4.5 text-indigo-500" />
                  Manager Requested Assessments
                </h3>
              </div>
              <div className="p-4">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {requestedAssessments.map(req => (
                    <div key={req.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950 text-xs">
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-slate-800 dark:text-slate-200">{req.staffName}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{req.date}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{req.competencyType}</p>
                      <p className="text-slate-650 dark:text-slate-405 font-medium mt-1.5 italic">"{req.reason}"</p>
                      
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-850">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-[9px] font-extrabold uppercase border border-amber-100">
                          {req.status}
                        </span>
                        {canManage() && (
                          <button
                            onClick={() => {
                              const emp = employees.find(e => e.id === req.employeeId);
                              setSelectedAssessment(null);
                              setFormData({
                                staffMember: req.staffName,
                                employeeId: req.employeeId,
                                department: emp?.group || 'Care',
                                type: req.competencyType,
                                customType: '',
                                assessorName: currentEmp?.name || 'Assessor',
                                assessmentDate: new Date().toISOString().split('T')[0],
                                reviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                result: 'Pass',
                                score: '90',
                                comments: '',
                                recommendations: '',
                                checklist: {}
                              });
                              setRequestedAssessments(prev => prev.filter(r => r.id !== req.id));
                              setIsModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-brand-600 hover:text-brand-700"
                          >
                            Approve & Assess
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {viewState === 'details' && selectedAssessment && (
        <div className="grid gap-6 lg:grid-cols-3 animate-slide-up">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Details Panel */}
            <div className="glass-card rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-extrabold uppercase text-slate-500">
                    Competency Sign-Off Record
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                    {selectedAssessment.type === 'Other' ? selectedAssessment.customType : selectedAssessment.type}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Assessed on {selectedAssessment.assessmentDate} by {selectedAssessment.assessorName}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border
                    ${selectedAssessment.result === 'Pass' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40' 
                      : 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-455 dark:border-rose-900/40'}
                  `}>
                    Result: {selectedAssessment.result} ({selectedAssessment.score}%)
                  </span>
                  {canRenew() && (
                    <button
                      onClick={() => {
                        setRenewalData({
                          assessorName: currentEmp?.name || selectedAssessment.assessorName,
                          reviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        });
                        setIsRenewModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-white bg-brand-600 hover:bg-brand-500 px-3.5 py-1 rounded-lg transition-all shadow-sm"
                    >
                      Renew Competency
                    </button>
                  )}
                </div>
              </div>

              {/* Checklist details if applicable */}
              {(selectedAssessment.type === 'Medication Competency' || selectedAssessment.type === 'Medication Error Competency') ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 mb-6">
                  <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-200 dark:border-slate-750">
                    Template Verification Checklist
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(selectedAssessment.checklist || {}).map(([item, val]) => (
                      <div key={item} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/60 text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate mr-2">{item}</span>
                        {val ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 shrink-0"><CheckCircle className="h-4 w-4"/> Verified</span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5 shrink-0"><AlertCircle className="h-4 w-4"/> Failed</span>
                        )}
                      </div>
                    ))}
                    {Object.keys(selectedAssessment.checklist || {}).length === 0 && (
                      <p className="text-xs text-slate-450 italic py-2 sm:col-span-2">No checklist details stored for this assessment.</p>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Comments & Recommendations */}
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Assessor Feedback Comments</h4>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-250/60 dark:bg-slate-900/50 dark:border-slate-800 text-xs font-semibold text-slate-655 dark:text-slate-350">
                    {selectedAssessment.comments || 'No feedback logged.'}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Development Recommendations</h4>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-250/60 dark:bg-slate-900/50 dark:border-slate-800 text-xs font-semibold text-slate-655 dark:text-slate-350">
                    {selectedAssessment.recommendations || 'No recommendations.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Previous History logs */}
            <div className="glass-card rounded-2xl p-6 shadow-sm">
              <h4 className="font-black text-sm text-slate-800 dark:text-white mb-3 flex items-center gap-1.5">
                <FileClock className="h-4.5 w-4.5 text-indigo-500" />
                Competency Assessment History
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 text-[10px] uppercase font-bold">
                      <th className="py-2">Date</th>
                      <th className="py-2">Assessor</th>
                      <th className="py-2">Score</th>
                      <th className="py-2">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                    {assessments
                      .filter(a => a.employeeId === selectedAssessment.employeeId && a.id !== selectedAssessment.id)
                      .map(hist => (
                        <tr key={hist.id} className="text-slate-655 dark:text-slate-405">
                          <td className="py-2 font-mono">{hist.assessmentDate}</td>
                          <td className="py-2 font-semibold">{hist.assessorName}</td>
                          <td className="py-2">{hist.score}%</td>
                          <td className="py-2">
                            <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${hist.result === 'Pass' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {hist.result}
                            </span>
                          </td>
                        </tr>
                      ))}
                    {assessments.filter(a => a.employeeId === selectedAssessment.employeeId && a.id !== selectedAssessment.id).length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-3 text-slate-400 italic text-[11px]">
                          No prior assessment logs recorded for this staff member.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Sidebar Columns */}
          <div className="space-y-6">
            
            {/* Staff Profile Card */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-4">Assessed Staff Profile</h4>
              
              {(() => {
                const staff = employees.find(e => e.id === selectedAssessment.employeeId);
                if (!staff) {
                  return (
                    <div>
                      <h5 className="font-black text-slate-800 dark:text-white">{selectedAssessment.staffMember}</h5>
                      <p className="text-xs text-slate-450 mt-1">ID Reference: {selectedAssessment.employeeId}</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={staff.photo} 
                        alt={staff.name} 
                        className="h-14 w-14 rounded-full object-cover border-2 border-brand-100 dark:border-brand-900"
                      />
                      <div>
                        <h5 className="font-black text-slate-900 dark:text-white">{staff.name}</h5>
                        <p className="text-[11px] text-slate-500 font-semibold">{staff.title}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">ID: {staff.id} • {staff.group}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 font-semibold text-slate-600 dark:text-slate-350">
                      <div className="flex justify-between"><span className="text-slate-400">Direct Manager:</span> <span>{staff.manager || 'Sarah Jenkins'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Employment:</span> <span>{staff.startDate} ({staff.status})</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Direct Email:</span> <span className="font-mono text-[10px]">{staff.email}</span></div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Expiry Tracking Status Card */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-3">Expiry Tracking</h4>
              
              {(() => {
                const expired = isExpired(selectedAssessment.expiryDate);
                const warning = isExpiringSoon(selectedAssessment.expiryDate);
                
                return (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-xl border text-xs font-semibold ${expired ? 'bg-rose-50 border-rose-200/50 text-rose-700' : warning ? 'bg-amber-50 border-amber-200/50 text-amber-700' : 'bg-emerald-50 border-emerald-200/50 text-emerald-700'}`}>
                      <div className="flex items-center gap-1.5">
                        {expired ? <AlertTriangle className="h-4.5 w-4.5"/> : warning ? <Clock className="h-4.5 w-4.5"/> : <CheckCircle className="h-4.5 w-4.5"/>}
                        <span className="uppercase text-[9px] font-black tracking-widest">
                          {expired ? 'EXPIRED' : warning ? 'EXPIRING SOON' : 'VALID CERTIFICATION'}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Expiry Date: <span className="font-bold font-mono">{selectedAssessment.expiryDate}</span>
                      </p>
                      {selectedAssessment.reviewDate && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Scheduled Review: {selectedAssessment.reviewDate}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Uploaded Evidence Card */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Uploaded Evidence</h4>
                {canManage() && (
                  <button 
                    onClick={handleEvidenceUpload}
                    className="text-[10px] font-black text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                  >
                    <Upload className="h-3 w-3" /> Upload
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {(!selectedAssessment.evidence || selectedAssessment.evidence.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No evidence checklists uploaded.</p>
                ) : (
                  selectedAssessment.evidence.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-655 dark:text-slate-350">
                      <span className="truncate mr-2 font-mono text-[10px]">{file.name}</span>
                      <span className="text-[9px] text-slate-400 shrink-0">{file.size}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Renewal Log History */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-3">Renewal History Log</h4>
              
              <div className="space-y-2.5">
                {(!selectedAssessment.renewalHistory || selectedAssessment.renewalHistory.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No renewals logged. This is the initial assessment.</p>
                ) : (
                  selectedAssessment.renewalHistory.map((renew, idx) => (
                    <div key={idx} className="flex gap-2 text-xs border-l-2 border-indigo-400 pl-2.5">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{renew.action}</p>
                        <p className="text-[9px] text-slate-450 mt-0.5">{renew.date} • by {renew.by}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      </div>

      {/* Assessment Edit/Create Modal Form */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-950 shadow-2xl p-6 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar animate-slide-up">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-brand-500" />
              {selectedAssessment ? 'Edit Assessment details' : 'Record New Competency Assessment'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Staff Member</label>
                  <select 
                    name="employeeId" 
                    value={formData.employeeId} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none"
                  >
                    <option value="">Select Staff...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assessor</label>
                  <input 
                    type="text" 
                    name="assessorName" 
                    value={formData.assessorName} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Competency Type</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleInputChange} 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none"
                  >
                    {COMPETENCY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assessment Result</label>
                  <select 
                    name="result" 
                    value={formData.result} 
                    onChange={handleInputChange} 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none"
                  >
                    <option value="Pass">Pass / Competent</option>
                    <option value="Fail">Fail / Needs Improvement</option>
                  </select>
                </div>
              </div>

              {formData.type === 'Other' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Custom Competency Name</label>
                  <input 
                    type="text" 
                    name="customType" 
                    value={formData.customType} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. Catheter Care Competency"
                    className="w-full h-9 px-3 rounded-lg border border-brand-200 bg-brand-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-brand-900/20 dark:border-brand-800/50 dark:text-white outline-none" 
                  />
                </div>
              )}

              {/* Checklist Section for template support */}
              {(formData.type === 'Medication Competency' || formData.type === 'Medication Error Competency') && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center justify-between">
                    <span>{formData.type} Template Checklist</span>
                    <span className="text-[9px] text-slate-450 normal-case">Check off verified steps</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(formData.type === 'Medication Competency' ? MEDICATION_CHECKLIST : MED_ERROR_CHECKLIST).map(item => (
                      <label key={item} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-655 dark:text-slate-350 hover:text-slate-800">
                        <input 
                          type="checkbox" 
                          checked={formData.checklist[item] || false}
                          onChange={() => handleChecklistChange(item)}
                          className="h-3.5 w-3.5 rounded text-brand-600 focus:ring-brand-500" 
                        />
                        <span className="truncate">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score achieved (%)</label>
                  <input 
                    type="number" 
                    name="score" 
                    value={formData.score} 
                    onChange={handleInputChange} 
                    required 
                    max="100" 
                    min="0" 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assessment Date</label>
                  <input 
                    type="date" 
                    name="assessmentDate" 
                    value={formData.assessmentDate} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Expiration Date</label>
                  <input 
                    type="date" 
                    name="expiryDate" 
                    value={formData.expiryDate} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assessor Evaluator Comments</label>
                <textarea 
                  name="comments" 
                  value={formData.comments} 
                  onChange={handleInputChange} 
                  rows="2" 
                  placeholder="Record summary observations about practical skills..."
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none resize-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recommendations & Directives</label>
                <textarea 
                  name="recommendations" 
                  value={formData.recommendations} 
                  onChange={handleInputChange} 
                  rows="2" 
                  placeholder="e.g. Schedule refresh in 6 months. Standard monitoring."
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="h-10 px-5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="h-10 px-6 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4"/>
                  Save Assessment Record
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Renewal Modal Form */}
      {isRenewModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-950 shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-slide-up">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-500" />
              Renew Certify Competency
            </h3>

            <form onSubmit={handleRenewSubmit} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">Assessor Sign-Off</label>
                <input 
                  type="text" 
                  value={renewalData.assessorName}
                  onChange={(e) => setRenewalData({ ...renewalData, assessorName: e.target.value })}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">Next Review Date</label>
                  <input 
                    type="date" 
                    value={renewalData.reviewDate}
                    onChange={(e) => setRenewalData({ ...renewalData, reviewDate: e.target.value })}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">New Expiry Date</label>
                  <input 
                    type="date" 
                    value={renewalData.expiryDate}
                    onChange={(e) => setRenewalData({ ...renewalData, expiryDate: e.target.value })}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsRenewModalOpen(false)}
                  className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:text-slate-305 transition-all text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="h-9 px-4 rounded-lg text-white bg-brand-600 hover:bg-brand-500 transition-all text-xs font-bold"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Request Assessment Modal Form (for Manager) */}
      {isRequestModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-955 shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-slide-up">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-500" />
              Request Training Assessment
            </h3>

            <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-350">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">Select Team Member</label>
                <select 
                  value={requestData.employeeId}
                  onChange={(e) => setRequestData({ ...requestData, employeeId: e.target.value })}
                  required
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none"
                >
                  {employees.filter(emp => emp.manager === currentEmp?.name).map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.title})</option>
                  ))}
                  {employees.filter(emp => emp.manager === currentEmp?.name).length === 0 && (
                    <option value="">No Team Staff Registered</option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">Competency Required</label>
                <select 
                  value={requestData.competencyType}
                  onChange={(e) => setRequestData({ ...requestData, competencyType: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none"
                >
                  {COMPETENCY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">Reason for Request</label>
                <textarea 
                  value={requestData.reason}
                  onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                  required
                  rows="3"
                  placeholder="e.g. Annual renewal due or performance improvement directive..."
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none resize-none font-medium text-slate-700 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsRequestModalOpen(false)}
                  className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-all text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="h-9 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-all text-xs font-bold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </>
  );
};

export default CompetencyManagement;
