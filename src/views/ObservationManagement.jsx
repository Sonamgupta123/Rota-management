import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  Eye, Plus, Calendar, Clock, MapPin, User, AlertCircle, FileText, CheckCircle, 
  Clock3, Search, Activity, MoreVertical, Paperclip, ChevronRight, UserCheck, 
  ShieldAlert, FileClock, Trash2, ArrowLeft, Send, CheckCircle2, AlertTriangle, FileSpreadsheet
} from 'lucide-react';

const OBSERVATION_TYPES = [
  'Behaviour', 'Fall Risk', 'Medication Concern', 'Refusal Of Care', 
  'Nutrition', 'Hydration', 'Infection', 'Mobility', 'Mental Health', 
  'Safeguarding', 'Other'
];

const RESIDENT_PROFILES = {
  'Eleanor Vance': { room: 'Room 102', age: 84, risk: 'High Fall Risk', admissionDate: '2023-05-12', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120', carerNotes: 'Requires 1-to-1 assistance when transferring from chair to walker.' },
  'Arthur Pendelton': { room: 'Room 205', age: 79, risk: 'Medium Mobility', admissionDate: '2024-02-18', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', carerNotes: 'Meds compliance should be checked daily. Prone to refusing morning doses.' },
  'Mary Green': { room: 'Room 114', age: 91, risk: 'High Dementia', admissionDate: '2022-09-01', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120', carerNotes: 'Gets disoriented during evening hours. Needs gentle reassurance.' },
  'Harold Smith': { room: 'Room 108', age: 82, risk: 'High Infection Risk', admissionDate: '2023-11-05', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', carerNotes: 'Monitor hydration levels closely. Log all fluid intakes.' },
  'Mary Berry': { room: 'Room 211', age: 87, risk: 'Medium Fall Risk', admissionDate: '2024-01-15', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120', carerNotes: 'Uses walking frame. Ensure path is clear of clutter.' }
};

const getResidentProfile = (name) => {
  return RESIDENT_PROFILES[name] || { 
    room: 'Room 110', 
    age: 85, 
    risk: 'Standard Care', 
    admissionDate: '2024-01-10', 
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', 
    carerNotes: 'Follow standard care home observation plan.' 
  };
};

const ObservationManagement = () => {
  const {
    observations,
    addObservation,
    updateObservation,
    deleteObservation,
    addObservationNote,
    addObservationAttachment,
    employees,
    activeEmployeeId,
    currentRole
  } = useApp();

  const [viewState, setViewState] = useState('dashboard'); // 'dashboard', 'details'
  const [selectedObs, setSelectedObs] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [noteInput, setNoteInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    resident: '',
    type: 'Behaviour',
    customType: '',
    priority: 'Low',
    location: '',
    description: '',
    notes: '',
    actionTaken: '',
    assignedStaff: '',
    followUpRequired: false,
    followUpDate: '',
    status: 'Open'
  });

  // Access check
  if (currentRole === 'Receptionist' || currentRole === 'HR') {
    return (
      <div className="glass-card rounded-3xl p-8 text-center max-w-xl mx-auto my-12 shadow-lg border border-slate-200 dark:border-slate-800">
        <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Access Denied</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Your role ({currentRole}) does not have permission to access the Observation Module. Please contact an administrator.
        </p>
      </div>
    );
  }

  const currentEmp = employees.find(e => e.id === activeEmployeeId);

  // RBAC Helper functions
  const isTeamObservation = (obs) => {
    if (currentRole === 'Admin' || currentRole === 'Compliance Officer') return true;
    if (currentRole === 'Manager') {
      const assignedEmp = employees.find(e => e.id === obs.assignedStaff);
      return (
        obs.createdBy === activeEmployeeId ||
        obs.assignedStaff === activeEmployeeId ||
        (assignedEmp && assignedEmp.manager === currentEmp?.name)
      );
    }
    if (currentRole === 'Employee') {
      return obs.createdBy === activeEmployeeId || obs.assignedStaff === activeEmployeeId;
    }
    return false;
  };

  const canCreate = () => {
    return ['Admin', 'Manager', 'Employee'].includes(currentRole);
  };

  const canEdit = (obs) => {
    if (!obs) return false;
    if (currentRole === 'Admin') return true;
    if (currentRole === 'Manager') return isTeamObservation(obs);
    if (currentRole === 'Employee') return obs.createdBy === activeEmployeeId && obs.status === 'Open';
    return false;
  };

  const canDelete = () => {
    return currentRole === 'Admin';
  };

  const canAssign = () => {
    return ['Admin', 'Manager'].includes(currentRole);
  };

  const canClose = () => {
    return ['Admin', 'Manager'].includes(currentRole);
  };

  const canAddFollowUp = () => {
    return ['Admin', 'Manager'].includes(currentRole);
  };

  // Filtering
  const filteredObservations = observations
    .filter(isTeamObservation)
    .filter(obs => {
      const matchesSearch = obs.resident.toLowerCase().includes(searchQuery.toLowerCase()) || 
        obs.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'All' || obs.type === typeFilter;
      return matchesSearch && matchesType;
    });

  // Derived Stats
  const totalObs = filteredObservations.length;
  const openObs = filteredObservations.filter(o => o.status === 'Open').length;
  const closedObs = filteredObservations.filter(o => o.status === 'Closed').length;
  
  // Overdue follow-up check
  const isOverdue = (obs) => {
    if (!obs.followUpRequired || obs.status === 'Closed' || !obs.followUpDate) return false;
    return new Date(obs.followUpDate) < new Date();
  };

  const highPriority = filteredObservations.filter(o => o.priority === 'High' && o.status === 'Open').length;
  const followUpsDue = filteredObservations.filter(o => o.followUpRequired && o.status === 'Open').length;
  const overdueFollowUps = filteredObservations.filter(isOverdue).length;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (selectedObs) {
      // Edit
      updateObservation(selectedObs.id, {
        ...formData,
        notes: undefined // Notes are handled through notesHistory
      });
      // Sync detailed view
      const updated = observations.find(o => o.id === selectedObs.id);
      if (updated) setSelectedObs(updated);
    } else {
      // Create
      addObservation({
        ...formData,
        createdBy: activeEmployeeId
      });
    }
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setSelectedObs(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resident: Object.keys(RESIDENT_PROFILES)[0], // default to first resident
      type: 'Behaviour',
      customType: '',
      priority: 'Low',
      location: 'Lounge Area',
      description: '',
      notes: '',
      actionTaken: '',
      assignedStaff: activeEmployeeId,
      followUpRequired: false,
      followUpDate: '',
      status: 'Open'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (obs) => {
    setSelectedObs(obs);
    setFormData({ ...obs });
    setIsModalOpen(true);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    const author = currentEmp ? currentEmp.name : 'System User';
    addObservationNote(selectedObs.id, noteInput.trim(), author);
    setNoteInput('');
    // refresh detail panel view
    setTimeout(() => {
      const updated = observations.find(o => o.id === selectedObs.id);
      if (updated) setSelectedObs(updated);
    }, 100);
  };

  const handleFileUpload = () => {
    const fileNames = ['clinical_vitals_sheet.pdf', 'behavioral_log_photo.jpg', 'gp_notes.png', 'care_plan_annex.pdf'];
    const randomFile = fileNames[Math.floor(Math.random() * fileNames.length)];
    const sizes = ['240 KB', '1.4 MB', '890 KB', '450 KB'];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    const author = currentEmp ? currentEmp.name : 'System User';
    
    addObservationAttachment(selectedObs.id, randomFile, randomSize, author);
    
    // refresh detail view
    setTimeout(() => {
      const updated = observations.find(o => o.id === selectedObs.id);
      if (updated) setSelectedObs(updated);
    }, 100);
  };

  const handleStatusToggle = () => {
    if (!canClose()) return;
    const nextStatus = selectedObs.status === 'Open' ? 'Closed' : 'Open';
    updateObservation(selectedObs.id, {
      ...selectedObs,
      status: nextStatus
    });
    setTimeout(() => {
      const updated = observations.find(o => o.id === selectedObs.id);
      if (updated) setSelectedObs(updated);
    }, 100);
  };

  const handleAssignStaff = (staffId) => {
    if (!canAssign()) return;
    updateObservation(selectedObs.id, {
      ...selectedObs,
      assignedStaff: staffId
    });
    setTimeout(() => {
      const updated = observations.find(o => o.id === selectedObs.id);
      if (updated) setSelectedObs(updated);
    }, 100);
  };

  // COMPLIANCE SPECIALIZED CARDS OR STANDARD CARDS
  const renderDashboardCards = () => {
    if (currentRole === 'Compliance Officer') {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
          <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-brand-500">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Open Cases</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-800 dark:text-white">{openObs}</span>
              <div className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600"><AlertCircle className="h-4 w-4"/></div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-rose-500">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">High Risk Cases</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-800 dark:text-white">{highPriority}</span>
              <div className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600"><AlertTriangle className="h-4 w-4"/></div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-amber-500">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">Overdue Follow-Ups</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-800 dark:text-white">{overdueFollowUps}</span>
              <div className="h-8 w-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600"><Clock3 className="h-4 w-4"/></div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-emerald-500">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Closed Cases</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-800 dark:text-white">{closedObs}</span>
              <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600"><CheckCircle className="h-4 w-4"/></div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-indigo-500">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Compliance Score</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-800 dark:text-white">
                {totalObs > 0 ? Math.round((closedObs / totalObs) * 100) : 100}%
              </span>
              <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600"><FileClock className="h-4 w-4"/></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Observations</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{totalObs}</span>
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400"><Activity className="h-4 w-4"/></div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-brand-500">
          <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Open</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{openObs}</span>
            <div className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600"><AlertCircle className="h-4 w-4"/></div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Closed</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{closedObs}</span>
            <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600"><CheckCircle className="h-4 w-4"/></div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-rose-500">
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">High Priority</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{highPriority}</span>
            <div className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600"><AlertCircle className="h-4 w-4"/></div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex flex-col shadow-sm border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">Follow-Ups Due</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800 dark:text-white">{followUpsDue}</span>
            <div className="h-8 w-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600"><Clock3 className="h-4 w-4"/></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400 flex items-center justify-center">
              <Eye className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Observation Management</h2>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1 ml-10">Track resident behaviors, safeguarding events, and clinical concerns.</p>
        </div>
        <div className="flex gap-2">
          {viewState === 'details' && (
            <button 
              onClick={() => setViewState('dashboard')}
              className="h-9 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4"/>
              Back to List
            </button>
          )}
          {canCreate() && (
            <button
              onClick={openCreateModal}
              className="h-9 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Observation
            </button>
          )}
        </div>
      </div>

      {viewState === 'dashboard' && (
        <>
          {renderDashboardCards()}

          <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
            {/* Filters Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 gap-4">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Resident Observations</h3>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search resident or ID..." 
                    className="h-8 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white w-full sm:w-48"
                  />
                </div>
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="All">All Types</option>
                  {OBSERVATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] uppercase tracking-wider text-slate-500 font-extrabold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 font-bold">ID & Date</th>
                    <th className="p-3 font-bold">Resident</th>
                    <th className="p-3 font-bold">Type</th>
                    <th className="p-3 font-bold">Priority</th>
                    <th className="p-3 font-bold">Assigned To</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredObservations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400 text-xs font-semibold">
                        No observations found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredObservations.map(obs => {
                      const staff = employees.find(e => e.id === obs.assignedStaff);
                      return (
                        <tr key={obs.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group text-xs">
                          <td className="p-3">
                            <div className="font-extrabold text-slate-900 dark:text-slate-100">{obs.id}</div>
                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3"/> {obs.date}</div>
                          </td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                            {obs.resident}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-600 dark:text-slate-400">{obs.type === 'Other' ? obs.customType : obs.type}</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide
                              ${obs.priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                obs.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              }
                            `}>
                              {obs.priority}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">
                            {staff ? staff.name : obs.assignedStaff || 'Unassigned'}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border flex items-center gap-1 w-fit
                              ${obs.status === 'Open' 
                                ? isOverdue(obs)
                                  ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-400'
                                  : 'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-400' 
                                : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'}
                            `}>
                              <span className={`h-1.5 w-1.5 rounded-full ${obs.status === 'Open' ? isOverdue(obs) ? 'bg-rose-500' : 'bg-brand-500' : 'bg-slate-400'}`} />
                              {obs.status} {isOverdue(obs) && '(Overdue)'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {canEdit(obs) && (
                              <button 
                                onClick={() => openEditModal(obs)}
                                className="text-[11px] font-bold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400"
                              >
                                Edit
                              </button>
                            )}
                            <button 
                              onClick={() => { setSelectedObs(obs); setViewState('details'); }}
                              className="text-[11px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-lg border border-brand-100 dark:border-brand-900/40"
                            >
                              Details
                            </button>
                            {canDelete() && (
                              <button 
                                onClick={() => deleteObservation(obs.id)}
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
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
        </>
      )}

      {viewState === 'details' && selectedObs && (
        <div className="grid gap-6 lg:grid-cols-3 animate-slide-up">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Details Card */}
            <div className="glass-card rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-extrabold uppercase text-slate-500">
                      Observation Log
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide
                      ${selectedObs.priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                        selectedObs.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }
                    `}>
                      {selectedObs.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                    {selectedObs.id} - {selectedObs.resident}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Logged on {selectedObs.date} at {selectedObs.time}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border
                    ${selectedObs.status === 'Open' ? 'border-brand-200 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' : 'border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'}
                  `}>
                    {selectedObs.status}
                  </span>
                  {canClose() && selectedObs.status === 'Open' && (
                    <button
                      onClick={handleStatusToggle}
                      className="text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-500 px-3 py-1 rounded-lg transition-all shadow-sm"
                    >
                      Close Case
                    </button>
                  )}
                </div>
              </div>

              {/* Grid fields */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observation Type</span>
                  <p className="font-extrabold text-slate-800 dark:text-slate-250">
                    {selectedObs.type === 'Other' ? selectedObs.customType : selectedObs.type}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Incident Location</span>
                  <p className="font-extrabold text-slate-800 dark:text-slate-250">{selectedObs.location || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Created By</span>
                  <p className="font-extrabold text-slate-800 dark:text-slate-250">
                    {employees.find(e => e.id === selectedObs.createdBy)?.name || selectedObs.createdBy || 'System'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Staff Code</span>
                  <p className="font-extrabold text-slate-855 dark:text-slate-250">{selectedObs.assignedStaff || 'Not Assigned'}</p>
                </div>
              </div>

              {/* Description & Action */}
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Observation Description</h4>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 dark:bg-slate-900/50 dark:border-slate-800 text-xs font-semibold text-slate-655 dark:text-slate-300">
                    {selectedObs.description}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Immediate Corrective Action Taken</h4>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 dark:bg-slate-900/50 dark:border-slate-800 text-xs font-semibold text-slate-655 dark:text-slate-300">
                    {selectedObs.actionTaken || 'No action recorded yet.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes History Card */}
            <div className="glass-card rounded-2xl p-6 shadow-sm">
              <h4 className="font-black text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-brand-500" />
                Notes History ({selectedObs.notesHistory?.length || 0})
              </h4>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {(!selectedObs.notesHistory || selectedObs.notesHistory.length === 0) ? (
                  <p className="text-xs text-slate-450 italic py-2">No historical notes logged on this observation.</p>
                ) : (
                  selectedObs.notesHistory.map((note, index) => (
                    <div key={index} className="p-3 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/40 dark:border-slate-800 text-xs">
                      <div className="flex justify-between font-bold text-slate-500 mb-1 text-[10px]">
                        <span>{note.authorName}</span>
                        <span>{note.date}</span>
                      </div>
                      <p className="font-semibold text-slate-700 dark:text-slate-350">{note.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Type notes and click send..."
                  className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                <button 
                  type="submit" 
                  className="h-9 w-9 rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"
                >
                  <Send className="h-4 w-4"/>
                </button>
              </form>
            </div>

            {/* Attachments & Evidence Card */}
            <div className="glass-card rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Paperclip className="h-4.5 w-4.5 text-brand-500" />
                  Evidence Attachments
                </h4>
                <button
                  onClick={handleFileUpload}
                  className="h-7 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 transition-all flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Attach File
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {(!selectedObs.attachments || selectedObs.attachments.length === 0) ? (
                  <p className="text-xs text-slate-450 italic py-2 sm:col-span-2">No attachments uploaded yet.</p>
                ) : (
                  selectedObs.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950 text-xs">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{file.size} • by {file.uploadedBy}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Sidebar Columns */}
          <div className="space-y-6">
            
            {/* Resident Profile Card */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-4">Resident Profile Card</h4>
              
              {(() => {
                const profile = getResidentProfile(selectedObs.resident);
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={profile.photo} 
                        alt={selectedObs.resident} 
                        className="h-14 w-14 rounded-full object-cover border-2 border-brand-100 dark:border-brand-900"
                      />
                      <div>
                        <h5 className="font-black text-slate-900 dark:text-white">{selectedObs.resident}</h5>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{profile.room} • Age {profile.age}</p>
                        <span className="inline-block mt-1 px-2 py-0.2 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[8px] font-extrabold uppercase tracking-wide">
                          {profile.risk}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Key Care Directives</span>
                      <p className="text-slate-600 dark:text-slate-350 font-semibold leading-relaxed">{profile.carerNotes}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Assigned Staff Card */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-4">Assigned Care Staff</h4>
              
              {(() => {
                const staff = employees.find(e => e.id === selectedObs.assignedStaff);
                if (!staff) {
                  return (
                    <div className="text-center py-4">
                      <p className="text-xs text-slate-400 italic">No staff assigned to this case yet.</p>
                      {canAssign() && (
                        <div className="mt-3">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assign Staff Member</label>
                          <select 
                            onChange={(e) => handleAssignStaff(e.target.value)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-white"
                          >
                            <option value="">Select staff...</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.title})</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={staff.photo} 
                        alt={staff.name} 
                        className="h-12 w-12 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                      />
                      <div>
                        <h5 className="font-black text-slate-900 dark:text-white">{staff.name}</h5>
                        <p className="text-[10px] text-slate-500 font-semibold">{staff.title}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">ID Reference: {staff.id}</p>
                      </div>
                    </div>

                    {canAssign() && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reassign Case</label>
                        <select 
                          value={selectedObs.assignedStaff}
                          onChange={(e) => handleAssignStaff(e.target.value)}
                          className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold outline-none dark:border-slate-850 dark:bg-slate-950 dark:text-white"
                        >
                          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Follow-Up Card */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-3">Follow-Up Action Status</h4>
              
              {selectedObs.followUpRequired ? (
                <div className={`p-3 rounded-xl border text-xs ${isOverdue(selectedObs) ? 'bg-rose-50 border-rose-200/60 dark:bg-rose-950/20 dark:border-rose-900/40' : 'bg-amber-50 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/40'}`}>
                  <div className="flex justify-between font-bold mb-1">
                    <span className={isOverdue(selectedObs) ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                      {isOverdue(selectedObs) ? '⚠️ Follow-Up Overdue' : 'Due Follow-Up'}
                    </span>
                    <span className="font-mono">{selectedObs.followUpDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Review observation actions and log resolution comments before archiving case.</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/40 dark:border-slate-800 text-xs text-slate-450 italic">
                  No subsequent follow-up actions flagged.
                </div>
              )}

              {canAddFollowUp() && selectedObs.status === 'Open' && (
                <button
                  onClick={() => {
                    const dateStr = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +2 days
                    updateObservation(selectedObs.id, {
                      ...selectedObs,
                      followUpRequired: true,
                      followUpDate: dateStr
                    });
                    setTimeout(() => {
                      const updated = observations.find(o => o.id === selectedObs.id);
                      if (updated) setSelectedObs(updated);
                    }, 100);
                  }}
                  className="w-full mt-3 h-8 rounded-lg border border-brand-200 bg-brand-50 hover:bg-brand-100 text-[10px] font-bold text-brand-700 dark:border-brand-900 dark:bg-brand-950 dark:hover:bg-brand-900 dark:text-brand-400 transition-all flex items-center justify-center gap-1"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Set Follow-Up Due
                </button>
              )}
            </div>

            {/* Activity Timeline Card */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <h4 className="font-black text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-brand-500" />
                Activity Timeline
              </h4>

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-6">
                {selectedObs.timeline?.map((event, idx) => (
                  <div key={idx} className="relative text-xs">
                    <div className="absolute -left-7 top-1 h-2 w-2 rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-950"></div>
                    <div className="font-bold text-slate-800 dark:text-slate-250">{event.action}</div>
                    <div className="text-[9px] text-slate-400 font-semibold mt-0.5">{event.date} • by {event.by}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      </div>

      {/* Modal Form */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-950 shadow-2xl p-6 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar animate-slide-up">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-brand-500" />
              {selectedObs ? 'Edit Observation Details' : 'Record New Observation'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time</label>
                  <input 
                    type="time" 
                    name="time" 
                    value={formData.time} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resident</label>
                  <select 
                    name="resident" 
                    value={formData.resident} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none"
                  >
                    {Object.keys(RESIDENT_PROFILES).map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Staff</label>
                  <select 
                    name="assignedStaff" 
                    value={formData.assignedStaff} 
                    onChange={handleInputChange} 
                    disabled={!canAssign()}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none disabled:opacity-60"
                  >
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.title})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Observation Type</label>
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleInputChange} 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none"
                  >
                    {OBSERVATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Priority Level</label>
                  <select 
                    name="priority" 
                    value={formData.priority} 
                    onChange={handleInputChange} 
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              {formData.type === 'Other' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Specify Observation Type</label>
                  <input 
                    type="text" 
                    name="customType" 
                    value={formData.customType} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. Clinical Skin Rash"
                    className="w-full h-9 px-3 rounded-lg border border-brand-200 bg-brand-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-brand-900/20 dark:border-brand-800/50 dark:text-white outline-none" 
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Observation Location</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Lounge Area" 
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detailed Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  required 
                  rows="3" 
                  placeholder="Describe the resident state, incident or clinical observation..."
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none resize-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Immediate Action Taken</label>
                <textarea 
                  name="actionTaken" 
                  value={formData.actionTaken} 
                  onChange={handleInputChange} 
                  rows="2" 
                  placeholder="What steps did staff execute immediately?"
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none resize-none"
                ></textarea>
              </div>

              {canAddFollowUp() && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 flex gap-4 items-center">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-200">
                    <input 
                      type="checkbox" 
                      name="followUpRequired" 
                      checked={formData.followUpRequired} 
                      onChange={handleInputChange} 
                      className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500" 
                    />
                    Follow-Up Action Required?
                  </label>
                  {formData.followUpRequired && (
                    <input 
                      type="date" 
                      name="followUpDate" 
                      value={formData.followUpDate} 
                      onChange={handleInputChange} 
                      required 
                      className="h-9 px-3 rounded-lg border border-brand-200 bg-white font-semibold dark:bg-slate-950 dark:border-brand-800 dark:text-white outline-none ml-auto" 
                    />
                  )}
                </div>
              )}

              {canClose() && selectedObs && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Observation Case Status</label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleInputChange} 
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none"
                    >
                      <option value="Open">Open Case</option>
                      <option value="Closed">Closed / Resolved</option>
                    </select>
                  </div>
                </div>
              )}

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
                  Save Observation
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

export default ObservationManagement;
