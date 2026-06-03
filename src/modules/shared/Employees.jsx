import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Check,
  X,
  FileCheck,
  User,
  Milestone,
  Receipt,
  UserCheck,
  Building,
  ChevronLeft,
  DollarSign,
  Briefcase,
  Globe,
  PlusCircle,
  FileText,
  LayoutGrid,
  List,
  AlertTriangle,
  Eye,
  History
} from 'lucide-react';

const TABS = [
  { id: 'details', label: 'Employee Details', icon: Building },
  { id: 'personal', label: 'Personal Information', icon: User },
  { id: 'locations', label: 'Locations', icon: Globe },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'wages', label: 'Wage & Salary', icon: DollarSign },
  { id: 'schedule', label: 'Work Schedule', icon: Calendar },
  { id: 'logbook', label: 'Logbook', icon: UserCheck }
];

const ALL_ROLES_LIST = [
  "Cook",
  "Domestic",
  "HCA Lead",
  "Health care assistants",
  "Manager",
  "Night weekday",
  "Night weekend",
  "Team Lead",
  "Training"
];

const ALL_LOCATIONS_LIST = [
  "Swan care home",
  "Oakfield care home",
  "Birmingham medical",
  "Coventry clinic",
  "Solihull hub"
];

const Employees = () => {
  const {
    employees,
    documents,
    attendance,
    shifts,
    updateEmployee,
    addEmployeeDocument,
    onboardEmployee,
    currentRole,
    docStatusFilter,
    setDocStatusFilter,
    uploadEmployeeDocument,
    verifyEmployeeDocument,
    rejectEmployeeDocument,
    activeEmployeeId
  } = useApp();

  const getEmployeeDocStatus = (empId) => {
    const empDocs = documents[empId] || [];
    if (empDocs.length === 0) {
      return { label: 'Missing Documents', style: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400', badge: '⚠' };
    }
    
    const hasRejected = empDocs.some(d => d.status === 'Rejected');
    if (hasRejected) {
      return { label: 'Rejected Documents', style: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/40', badge: '❌' };
    }
    
    const hasPending = empDocs.some(d => d.status === 'Pending Verification' || (d.uploadStatus === 'Uploaded' && d.verifiedStatus === 'Needs Verification'));
    
    // Check if any of the 9 required types is missing (Not Uploaded / Pending)
    const requiredDocTypes = [
      "Passport", "Driving Licence", "National ID", "Proof of Address",
      "Right To Work", "DBS Check", "Qualification Certificate",
      "Training Certificate", "Other Documents"
    ];
    const hasMissing = requiredDocTypes.some(type => {
      const doc = empDocs.find(d => d.name === type || (type === 'Proof of Address' && d.name === 'Proof Of Address'));
      return !doc || doc.status === 'Not Uploaded' || doc.uploadStatus === 'Pending';
    });
    
    if (hasMissing) {
      return { label: 'Missing Documents', style: 'bg-amber-50 text-amber-705 border-amber-250 dark:bg-amber-500/10 dark:text-amber-400', badge: '⚠' };
    }
    
    if (hasPending) {
      return { label: 'Pending Verification', style: 'bg-indigo-50 text-indigo-705 border-indigo-250 dark:bg-indigo-500/10 dark:text-indigo-400', badge: '🟡' };
    }
    
    return { label: 'Complete', style: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400', badge: '✅' };
  };

  // Navigation and Search State
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [layoutView, setLayoutView] = useState('card'); // 'card' or 'table'
  const [complianceFilter, setComplianceFilter] = useState('All'); // 'All', 'Compliant', 'Non-Compliant'

  // Locations Tab States
  const [locationSearch, setLocationSearch] = useState('');
  const [tempLocations, setTempLocations] = useState([]);

  // Roles Tab States
  const [roleSearch, setRoleSearch] = useState('');
  const [tempRoles, setTempRoles] = useState([]);

  // Wages Tab States
  const [defaultWage, setDefaultWage] = useState('12.71');
  const [wageUnit, setWageUnit] = useState('hour');
  const [customRates, setCustomRates] = useState({
    Cook: { hour: '', shift: '' },
    Domestic: { hour: '', shift: '' },
    "Health care assistants": { hour: '', shift: '' },
    Training: { hour: '', shift: '' }
  });

  // Document Upload States
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');

  // Fine-grained Document upload & verification states
  const [selectedDocForVerification, setSelectedDocForVerification] = useState(null);
  const [originalSeen, setOriginalSeen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Helper to find document by type
  const findDoc = (type) => {
    return empDocs.find(d => d.name.toLowerCase() === type.toLowerCase() || 
      (type === 'Proof of Address' && d.name === 'Proof Of Address'));
  };

  // Helper to format date & time for history sorting
  const parseDateTime = (dStr, tStr) => {
    if (!dStr) return new Date(0);
    const parts = dStr.split('/');
    if (parts.length !== 3) return new Date(0);
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const timePart = tStr || '12:00 AM';
    return new Date(`${formattedDate} ${timePart}`);
  };

  // Helper to handle standard file upload
  const handleUploadFile = (docType, file) => {
    if (!file) return;
    const currentUserName = currentRole === 'Admin' ? 'Admin User' : (currentRole === 'Manager' ? 'Sarah Jenkins' : (selectedEmp?.name || 'Employee'));
    uploadEmployeeDocument(selectedEmp.id, docType, file.name, currentUserName);
  };

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
    const currentUserName = currentRole === 'Admin' ? 'Admin User' : (currentRole === 'Manager' ? 'Sarah Jenkins' : 'Manager');
    verifyEmployeeDocument(selectedEmp.id, selectedDocForVerification.name, currentUserName, verificationNotes);
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
    const currentUserName = currentRole === 'Admin' ? 'Admin User' : (currentRole === 'Manager' ? 'Sarah Jenkins' : 'Manager');
    rejectEmployeeDocument(selectedEmp.id, selectedDocForVerification.name, currentUserName, rejectionReason);
    setIsRejectionModalOpen(false);
    setSelectedDocForVerification(null);
    setOriginalSeen(false);
    setVerificationNotes('');
  };

  // Onboard Employee States
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [newEmpData, setNewEmpData] = useState({
    titlePrefix: 'Miss',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'Female',
    address1: '',
    address2: '',
    city: '',
    county: '',
    postcode: '',
    email: '',
    secondaryEmail: '',
    phone: '',
    secondaryPhone: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    jobTitle: '',
    role: 'Employee',
    group: 'Care Staff Day',
    manager: 'Sarah Jenkins',
    holidayAllocation: 28,
    startDate: new Date().toISOString().split('T')[0]
  });

  // Date of birth parts state
  const [dobDay, setDobDay] = useState('28');
  const [dobMonth, setDobMonth] = useState('April');
  const [dobYear, setDobYear] = useState('1999');

  const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];

  // Initialize Temporary Edit States when an employee is selected
  useEffect(() => {
    if (selectedEmp) {
      // Load locations (default to Swan care home if none exist)
      setTempLocations(selectedEmp.assignedLocations || ["Swan care home"]);

      // Load roles (default to title/group roles if none exist)
      setTempRoles(selectedEmp.assignedRoles || ["Cook", "Domestic", "Health care assistants", "Training"]);

      // Load wages
      setDefaultWage(selectedEmp.defaultWage || '12.71');
      setWageUnit(selectedEmp.wageUnit || 'hour');
      setCustomRates(selectedEmp.customRates || {
        Cook: { hour: '', shift: '' },
        Domestic: { hour: '', shift: '' },
        "Health care assistants": { hour: '', shift: '' },
        Training: { hour: '', shift: '' }
      });
    }
  }, [selectedEmpId]);

  // Filter staff list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.title.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || emp.role === roleFilter || emp.group === roleFilter;

    // Evaluate compliance matches
    const redDocsCount = (documents[emp.id] || []).filter(d => d.complianceIndicator === 'Red').length;
    let matchesCompliance = true;
    if (complianceFilter === 'Compliant') {
      matchesCompliance = redDocsCount === 0;
    } else if (complianceFilter === 'Non-Compliant') {
      matchesCompliance = redDocsCount > 0;
    }

    // Evaluate document status matches from dashboard widgets
    let matchesDocStatus = true;
    const empDocs = documents[emp.id] || [];
    if (docStatusFilter === 'Pending') {
      matchesDocStatus = empDocs.some(d => d.status === 'Pending Verification' || (d.uploadStatus === 'Uploaded' && d.verifiedStatus === 'Needs Verification'));
    } else if (docStatusFilter === 'Missing') {
      const requiredDocTypes = [
        "Passport", "Driving Licence", "National ID", "Proof of Address",
        "Right To Work", "DBS Check", "Qualification Certificate",
        "Training Certificate", "Other Documents"
      ];
      matchesDocStatus = requiredDocTypes.some(type => {
        const doc = empDocs.find(d => d.name === type || (type === 'Proof of Address' && d.name === 'Proof Of Address'));
        return !doc || doc.status === 'Not Uploaded' || doc.uploadStatus === 'Pending';
      });
    } else if (docStatusFilter === 'Expiring') {
      matchesDocStatus = empDocs.some(d => d.expiryDate && d.expiryDate !== 'N/A' && (() => {
        const exp = new Date(d.expiryDate);
        const ref = new Date('2026-06-03');
        const diffTime = exp - ref;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 30;
      })());
    }

    return matchesSearch && matchesRole && matchesCompliance && matchesDocStatus;
  });

  const empDocs = documents[selectedEmp?.id] || [];
  const empAttendance = attendance.filter(a => a.employeeId === selectedEmp?.id);
  const empShifts = shifts.filter(s => s.employeeId === selectedEmp?.id);

  // LOCATIONS ACTIONS
  const toggleLocation = (loc) => {
    if (tempLocations.includes(loc)) {
      setTempLocations(tempLocations.filter(l => l !== loc));
    } else {
      setTempLocations([...tempLocations, loc]);
    }
  };

  const handleSelectAllLocations = () => {
    setTempLocations(ALL_LOCATIONS_LIST);
  };

  const handleDeselectAllLocations = () => {
    setTempLocations([]);
  };

  const handleSaveLocations = () => {
    updateEmployee(selectedEmp.id, { assignedLocations: tempLocations });
    alert("Locations updated successfully.");
  };

  // ROLES ACTIONS
  const toggleRole = (roleItem) => {
    if (tempRoles.includes(roleItem)) {
      setTempRoles(tempRoles.filter(r => r !== roleItem));
    } else {
      setTempRoles([...tempRoles, roleItem]);
    }
  };

  const handleSelectAllRoles = () => {
    setTempRoles(ALL_ROLES_LIST);
  };

  const handleDeselectAllRoles = () => {
    setTempRoles([]);
  };

  const handleSaveRoles = () => {
    updateEmployee(selectedEmp.id, { assignedRoles: tempRoles });
    alert("Assigned roles updated successfully.");
  };

  // WAGES ACTIONS
  const handleSaveWages = () => {
    updateEmployee(selectedEmp.id, {
      defaultWage,
      wageUnit,
      customRates
    });
    alert("Wage & salary configurations updated successfully.");
  };

  const handleCustomRateChange = (roleKey, field, value) => {
    setCustomRates(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [field]: value
      }
    }));
  };

  // DOCUMENT ADD SUBMIT
  const handleAddDocumentSubmit = (e) => {
    e.preventDefault();
    if (!newDocName) return;

    // Append pdf if not present
    let docNameFormatted = newDocName;
    if (!docNameFormatted.endsWith('.pdf')) {
      docNameFormatted = `${docNameFormatted}.pdf`;
    }

    addEmployeeDocument(selectedEmp.id, docNameFormatted);
    setNewDocName('');
    setIsDocModalOpen(false);
  };

  // STAFF ONBOARD SUBMIT
  const handleOnboardSubmit = (e) => {
    e.preventDefault();
    const fullName = `${newEmpData.firstName} ${newEmpData.middleName ? newEmpData.middleName + ' ' : ''}${newEmpData.lastName}`;
    const addressFull = [newEmpData.address1, newEmpData.address2, newEmpData.city, newEmpData.county, newEmpData.postcode].filter(Boolean).join(', ');
    const emergencyContactFull = `${newEmpData.emergencyContactName} (${newEmpData.emergencyContactRelation}) - ${newEmpData.emergencyContactPhone}`;
    const dobStr = `${dobDay} ${dobMonth} ${dobYear}`;

    const onboardData = {
      name: fullName,
      title: newEmpData.jobTitle || 'Care Assistant',
      email: newEmpData.email,
      phone: newEmpData.phone,
      address: addressFull,
      dob: dobStr,
      emergencyContact: emergencyContactFull,
      role: newEmpData.role,
      group: newEmpData.group,
      manager: newEmpData.manager,
      holidayAllocation: newEmpData.holidayAllocation,
      startDate: newEmpData.startDate,
      // Store all fine-grained info for potential retrieval or editing
      titlePrefix: newEmpData.titlePrefix,
      firstName: newEmpData.firstName,
      middleName: newEmpData.middleName,
      lastName: newEmpData.lastName,
      gender: newEmpData.gender,
      address1: newEmpData.address1,
      address2: newEmpData.address2,
      city: newEmpData.city,
      county: newEmpData.county,
      postcode: newEmpData.postcode,
      secondaryEmail: newEmpData.secondaryEmail,
      secondaryPhone: newEmpData.secondaryPhone,
      emergencyContactName: newEmpData.emergencyContactName,
      emergencyContactRelation: newEmpData.emergencyContactRelation,
      emergencyContactPhone: newEmpData.emergencyContactPhone
    };

    onboardEmployee(onboardData);
    setIsOnboardModalOpen(false);

    // Reset state
    setNewEmpData({
      titlePrefix: 'Miss',
      firstName: '',
      middleName: '',
      lastName: '',
      gender: 'Female',
      address1: '',
      address2: '',
      city: '',
      county: '',
      postcode: '',
      email: '',
      secondaryEmail: '',
      phone: '',
      secondaryPhone: '',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactPhone: '',
      jobTitle: '',
      role: 'Employee',
      group: 'Care Staff Day',
      manager: 'Sarah Jenkins',
      holidayAllocation: 28,
      startDate: new Date().toISOString().split('T')[0]
    });
    setDobDay('28');
    setDobMonth('April');
    setDobYear('1999');
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in p-2">

        {/* 1. GRID LIST VIEW FOR ALL EMPLOYEES */}
        {viewMode === 'list' && (
          <div className="space-y-6 animate-fade-in">
            {docStatusFilter !== 'All' && (
              <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border border-indigo-200/80 rounded-2xl text-xs font-semibold text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-400 animate-fade-in select-none">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span>Showing filtered staff with <strong className="font-extrabold">{docStatusFilter} Documents</strong> based on your dashboard selection.</span>
                </div>
                <button
                  onClick={() => setDocStatusFilter('All')}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-slate-900 dark:border-slate-800 dark:text-indigo-400 rounded-lg transition-all"
                >
                  Clear Dashboard Filter
                </button>
              </div>
            )}
            {/* Header controls and filters */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Staff & Employee Directory</h2>
                <p className="text-xs text-slate-500">Manage digital employee profiles, documentation checklist, and payroll allocations</p>
              </div>

              {/* Controls in a premium layout matching user request */}
              <div className="flex flex-col items-stretch sm:items-end gap-3.5 w-full lg:w-auto">

                {/* Row 1: Search, Categories, Compliance status, Layout switcher */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative max-w-xs w-full sm:w-60">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search staff name or title..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="h-9 rounded-xl pl-3 pr-8 text-xs font-semibold bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-700 dark:text-slate-350 outline-none"
                    >
                      <option value="All">All Categories</option>
                      <option value="Manager">Managers</option>
                      <option value="Compliance Officer">Compliance Officers</option>
                      <option value="Employee">Employees</option>
                      <option value="Care Staff Day">Care Day Staff</option>
                      <option value="Care Staff Night">Care Night Staff</option>
                      <option value="Cook">Catering</option>
                      <option value="Domestic">Domestic</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={complianceFilter}
                      onChange={(e) => setComplianceFilter(e.target.value)}
                      className="h-9 rounded-xl pl-3 pr-8 text-xs font-semibold bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-700 dark:text-slate-350 outline-none"
                    >
                      <option value="All">All Compliance</option>
                      <option value="Compliant">Compliant Only</option>
                      <option value="Non-Compliant">Missing / Red Docs</option>
                    </select>
                  </div>

                  {/* Toggle switch for Table / Card view */}
                  <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/60 shadow-inner">
                    <button
                      onClick={() => setLayoutView('card')}
                      className={`p-1.5 rounded-lg transition-all ${layoutView === 'card' ? 'bg-white dark:bg-slate-950 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-400 hover:text-slate-650'}`}
                      title="Card Grid Layout"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setLayoutView('table')}
                      className={`p-1.5 rounded-lg transition-all ${layoutView === 'table' ? 'bg-white dark:bg-slate-950 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-400 hover:text-slate-650'}`}
                      title="Table List Layout"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Dark green 'Onboard New Staff' button (matching user photo) */}
                <div>
                  <button
                    onClick={() => setIsOnboardModalOpen(true)}
                    className="h-9 px-4 rounded-xl bg-[#2e6559] hover:bg-[#1f4940] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    <span>Onboard New Staff</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Directory Main List Content */}
            {layoutView === 'card' ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
                {filteredEmployees.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-slate-400 text-xs border border-dashed rounded-3xl">
                    No matching employees found.
                  </div>
                ) : (
                  filteredEmployees.map((emp) => {
                    const redDocsCount = (documents[emp.id] || []).filter(d => d.complianceIndicator === 'Red').length;
                    return (
                      <div
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmpId(emp.id);
                          setViewMode('details');
                          setActiveTab('details');
                        }}
                        className="glass-card hover-glow rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-5 flex flex-col items-center text-center cursor-pointer transition-all duration-200 group"
                      >
                        <img
                          src={emp.photo}
                          alt={emp.name}
                          className="h-20 w-20 rounded-2xl object-cover border dark:border-slate-800 shadow-sm transition-transform duration-200 group-hover:scale-[1.03]"
                        />
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight mt-4">
                          {emp.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{emp.title}</p>

                        <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold text-[8px]">
                            {emp.group}
                          </span>
                          {(() => {
                            const docStatus = getEmployeeDocStatus(emp.id);
                            return (
                              <span className={`px-2 py-0.5 rounded font-bold text-[8px] border ${docStatus.style}`}>
                                {docStatus.badge} {docStatus.label}
                              </span>
                            );
                          })()}
                        </div>

                        <div className="w-full border-t border-slate-150/40 dark:border-slate-800/40 mt-4 pt-3 flex justify-between items-center text-[10px] text-slate-400">
                          <span>ID: {emp.id}</span>
                          <span className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            <span>Profile Details</span>
                            <ChevronLeft className="h-3 w-3 rotate-180" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-850 text-[10px] font-bold text-slate-400 uppercase">
                        <th className="p-4 pl-6">Staff Profile</th>
                        <th className="p-4">ID Ref</th>
                        <th className="p-4">Skill Group</th>
                        <th className="p-4">Line Manager</th>
                        <th className="p-4">Compliance Status</th>
                        <th className="p-4">Document Status</th>
                        <th className="p-4 text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                      {filteredEmployees.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-6 text-center text-slate-400 italic">No staff profiles found.</td>
                        </tr>
                      ) : (
                        filteredEmployees.map((emp) => {
                          const redDocsCount = (documents[emp.id] || []).filter(d => d.complianceIndicator === 'Red').length;
                          return (
                            <tr key={emp.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                              <td className="p-4 pl-6 flex items-center gap-3">
                                <img
                                  src={emp.photo}
                                  alt={emp.name}
                                  className="h-10 w-10 rounded-xl object-cover border dark:border-slate-800 shadow-sm"
                                />
                                <div>
                                  <p className="font-extrabold text-slate-850 dark:text-white text-xs leading-snug">{emp.name}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">{emp.title}</p>
                                </div>
                              </td>
                              <td className="p-4 font-mono font-bold text-slate-500 dark:text-slate-400 text-[11px]">{emp.id}</td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold text-[8px]">
                                  {emp.group}
                                </span>
                              </td>
                              <td className="p-4 font-semibold text-slate-700 dark:text-slate-350">{emp.manager}</td>
                              <td className="p-4">
                                {redDocsCount > 0 ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 font-bold text-[9px] dark:bg-red-500/10 dark:text-red-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    <span>{redDocsCount} Missing Docs</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[9px] dark:bg-emerald-500/10 dark:text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span>Compliant</span>
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                {(() => {
                                  const docStatus = getEmployeeDocStatus(emp.id);
                                  return (
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-extrabold text-[8px] uppercase tracking-wide ${docStatus.style}`}>
                                      <span>{docStatus.badge}</span>
                                      <span>{docStatus.label}</span>
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="p-4 text-right pr-6">
                                <button
                                  onClick={() => {
                                    setSelectedEmpId(emp.id);
                                    setViewMode('details');
                                    setActiveTab('details');
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold dark:bg-brand-950/40 dark:text-brand-400 transition-all text-[10px]"
                                >
                                  View Employee
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
            )}
          </div>
        )}

        {/* 2. FULL PROFILE DETAILED VIEW (WITH TABBED LEFT SIDEBAR) */}
        {viewMode === 'details' && selectedEmp && (
          <div className="space-y-6">
            {/* Back button Toolbar */}
            {/* Back button Toolbar */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center gap-1.5 font-bold text-xs text-brand-600 hover:text-brand-700 transition-colors"
              >
                <ChevronLeft className="h-4.5 w-4.5 shrink-0" />
                <span>Back to Employees</span>
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">

              {/* LEFT TAB SIDEBAR (Matching Layout from photo 1) */}
              <div className="lg:col-span-1 space-y-2">
                <div className="glass-card rounded-3xl p-3 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">

                  {/* Active mini preview header */}
                  <div className="flex items-center gap-2.5 p-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                    <img
                      src={selectedEmp.photo}
                      alt={selectedEmp.name}
                      className="h-10 w-10 rounded-xl object-cover border dark:border-slate-800"
                    />
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs text-slate-800 dark:text-white truncate">{selectedEmp.name}</p>
                      <p className="text-[9px] text-slate-400 font-semibold truncate leading-none mt-0.5">{selectedEmp.title}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {TABS.filter(tab => {
                      if (tab.id === 'documents') {
                        return currentRole === 'Admin' || currentRole === 'Manager';
                      }
                      return true;
                    }).map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3.5 text-xs font-semibold transition-all group
                          ${isActive
                              ? 'bg-brand-50/50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 font-bold border-l-2 border-brand-500'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-white'
                            }
                        `}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`h-4 w-4 ${isActive ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-500'}`} />
                            <span className="truncate">{tab.label}</span>
                          </div>
                          <ChevronLeft className="h-3 w-3 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL CONTENT */}
              <div className="lg:col-span-3">
                <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-sm min-h-[500px]">

                  {/* ==================================================== */}
                  {/* TAB 1: EMPLOYEE DETAILS */}
                  {/* ==================================================== */}
                  {activeTab === 'details' && (
                    <div className="space-y-5 text-xs">
                      <h3 className="text-sm font-bold border-b pb-2 dark:border-slate-800 flex items-center gap-2">
                        <Building className="h-4.5 w-4.5 text-brand-500" />
                        <span>Assigned employment details</span>
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1 rounded-xl border border-slate-100 p-3 bg-slate-50/30 dark:border-slate-800/40">
                          <span className="font-bold text-slate-400 block uppercase text-[10px]">Assigned Role</span>
                          <p className="text-slate-800 font-semibold dark:text-slate-200">{selectedEmp.role}</p>
                        </div>

                        <div className="space-y-1 rounded-xl border border-slate-100 p-3 bg-slate-50/30 dark:border-slate-800/40">
                          <span className="font-bold text-slate-400 block uppercase text-[10px]">Staff Skill Group</span>
                          <p className="text-slate-800 font-semibold dark:text-slate-200">{selectedEmp.group}</p>
                        </div>

                        <div className="space-y-1 rounded-xl border border-slate-100 p-3 bg-slate-50/30 dark:border-slate-800/40">
                          <span className="font-bold text-slate-400 block uppercase text-[10px]">Line Manager Reference</span>
                          <p className="text-slate-800 font-semibold dark:text-slate-200">{selectedEmp.manager}</p>
                        </div>

                        <div className="space-y-1 rounded-xl border border-slate-100 p-3 bg-slate-50/30 dark:border-slate-800/40">
                          <span className="font-bold text-slate-400 block uppercase text-[10px]">Annual Holiday Allowance</span>
                          <p className="text-slate-800 font-semibold dark:text-slate-200">{selectedEmp.holidayAllocation} days / year</p>
                        </div>

                        <div className="space-y-1 rounded-xl border border-slate-100 p-3 bg-slate-50/30 dark:border-slate-800/40">
                          <span className="font-bold text-slate-400 block uppercase text-[10px]">Contract Start Date</span>
                          <p className="text-slate-800 font-semibold dark:text-slate-200 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{selectedEmp.startDate}</span>
                          </p>
                        </div>

                        <div className="space-y-1 rounded-xl border border-slate-100 p-3 bg-slate-50/30 dark:border-slate-800/40">
                          <span className="font-bold text-slate-400 block uppercase text-[10px]">Shift Coverage Tracker</span>
                          <p className="text-slate-800 font-semibold dark:text-slate-200">{empShifts.length} shifts active in roster planner</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* TAB 2: PERSONAL INFORMATION */}
                  {/* ==================================================== */}
                  {activeTab === 'personal' && (
                    <div className="space-y-5 text-xs">
                      <h3 className="text-sm font-bold border-b pb-2 dark:border-slate-800 flex items-center gap-2">
                        <User className="h-4.5 w-4.5 text-brand-500" />
                        <span>Personal Identification & Details</span>
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1 rounded-xl border border-slate-100 p-3 bg-slate-50/30 dark:border-slate-800/40">
                          <span className="font-bold text-slate-400 block uppercase text-[10px]">Full Name</span>
                          <p className="text-slate-800 font-semibold dark:text-slate-200">{selectedEmp.name}</p>
                        </div>

                        <div className="space-y-1 rounded-xl border border-slate-100 p-3 bg-slate-50/30 dark:border-slate-800/40">
                          <span className="font-bold text-slate-400 block uppercase text-[10px]">Date of Birth</span>
                          <p className="text-slate-800 font-semibold dark:text-slate-200">{selectedEmp.dob}</p>
                        </div>

                        <div className="space-y-1 rounded-xl border border-slate-100 p-3 bg-slate-50/30 dark:border-slate-800/40">
                          <span className="font-bold text-slate-400 block uppercase text-[10px]">Email Address</span>
                          <p className="text-slate-800 font-semibold dark:text-slate-200 flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{selectedEmp.email}</span>
                          </p>
                        </div>

                        <div className="space-y-1 rounded-xl border border-slate-100 p-3 bg-slate-50/30 dark:border-slate-800/40">
                          <span className="font-bold text-slate-400 block uppercase text-[10px]">Phone Number</span>
                          <p className="text-slate-800 font-semibold dark:text-slate-200 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{selectedEmp.phone}</span>
                          </p>
                        </div>

                        <div className="space-y-1 rounded-xl border border-slate-100 p-3 bg-slate-50/30 dark:border-slate-800/40 sm:col-span-2">
                          <span className="font-bold text-slate-400 block uppercase text-[10px]">Home Address</span>
                          <p className="text-slate-800 font-semibold dark:text-slate-200 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>{selectedEmp.address}</span>
                          </p>
                        </div>

                        <div className="space-y-1 rounded-xl border border-slate-100 p-3 bg-slate-50/30 dark:border-slate-800/40 sm:col-span-2">
                          <span className="font-bold text-slate-400 block uppercase text-[10px]">Emergency contact reference</span>
                          <p className="text-slate-800 font-semibold dark:text-slate-200">{selectedEmp.emergencyContact}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* TAB 3: LOCATIONS (Matching Screenshot 1) */}
                  {/* ==================================================== */}
                  {activeTab === 'locations' && (
                    <div className="space-y-5 text-xs animate-fade-in">

                      {/* Top inputs: Pill Search + Toggle links */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/10 p-3 rounded-2xl border dark:border-slate-800/60">
                        <div className="relative max-w-xs w-full">
                          <input
                            type="text"
                            placeholder="Search..."
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            className="h-8 w-full rounded-full border border-slate-200/80 bg-white pl-4 pr-3 text-[11px] outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white"
                          />
                        </div>

                        <div className="flex gap-2.5 text-[11px] font-bold text-brand-600 dark:text-brand-400">
                          <button onClick={handleSelectAllLocations} className="hover:underline">Select All</button>
                          <span>·</span>
                          <button onClick={handleDeselectAllLocations} className="hover:underline">Deselect All</button>
                        </div>
                      </div>

                      {/* Locations checklist */}
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 py-2">
                        {ALL_LOCATIONS_LIST.filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase())).map((loc) => {
                          const isChecked = tempLocations.includes(loc);
                          return (
                            <div
                              key={loc}
                              onClick={() => toggleLocation(loc)}
                              className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-150/60 bg-white dark:bg-slate-950 dark:border-slate-850 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-900/35"
                            >
                              <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all shrink-0
                              ${isChecked
                                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-500/15'
                                  : 'border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-750'
                                }
                            `}>
                                {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                              <span className="font-bold text-slate-850 dark:text-slate-150 truncate">{loc}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Form Save/Cancel Buttons */}
                      <div className="flex items-center gap-3.5 border-t border-slate-100 dark:border-slate-850 pt-4 mt-2">
                        <button
                          onClick={handleSaveLocations}
                          className="h-9 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setTempLocations(selectedEmp.assignedLocations || ["Swan care home"])}
                          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>

                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* TAB 4: ROLES (Matching Screenshot 2) */}
                  {/* ==================================================== */}
                  {activeTab === 'roles' && (
                    <div className="space-y-5 text-xs animate-fade-in">

                      {/* Top inputs: Pill Search + Toggle links */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/10 p-3 rounded-2xl border dark:border-slate-800/60">
                        <div className="relative max-w-xs w-full">
                          <input
                            type="text"
                            placeholder="Search..."
                            value={roleSearch}
                            onChange={(e) => setRoleSearch(e.target.value)}
                            className="h-8 w-full rounded-full border border-slate-200/80 bg-white pl-4 pr-3 text-[11px] outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white"
                          />
                        </div>

                        <div className="flex gap-2.5 text-[11px] font-bold text-brand-600 dark:text-brand-400">
                          <button onClick={handleSelectAllRoles} className="hover:underline">Select All</button>
                          <span>·</span>
                          <button onClick={handleDeselectAllRoles} className="hover:underline">Deselect All</button>
                        </div>
                      </div>

                      {/* Roles checklist grid */}
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 py-2">
                        {ALL_ROLES_LIST.filter(role => role.toLowerCase().includes(roleSearch.toLowerCase())).map((roleItem) => {
                          const isChecked = tempRoles.includes(roleItem);
                          return (
                            <div
                              key={roleItem}
                              onClick={() => toggleRole(roleItem)}
                              className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-150/60 bg-white dark:bg-slate-950 dark:border-slate-850 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-900/35"
                            >
                              <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all shrink-0
                              ${isChecked
                                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-500/15'
                                  : 'border border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-750'
                                }
                            `}>
                                {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                              <span className="font-bold text-slate-850 dark:text-slate-150 truncate">{roleItem}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Form Save/Cancel Buttons */}
                      <div className="flex items-center gap-3.5 border-t border-slate-100 dark:border-slate-850 pt-4 mt-2">
                        <button
                          onClick={handleSaveRoles}
                          className="h-9 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setTempRoles(selectedEmp.assignedRoles || ["Cook", "Domestic", "Health care assistants", "Training"])}
                          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>

                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* TAB 5: WAGE & SALARY (Matching Screenshot 3) */}
                  {/* ==================================================== */}
                  {activeTab === 'wages' && (
                    <div className="space-y-6 text-xs animate-fade-in">

                      {/* Section 1: Default wage rate */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wide">Default Wage / Salary</h4>

                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">£</span>
                          <input
                            type="text"
                            value={defaultWage}
                            onChange={(e) => setDefaultWage(e.target.value)}
                            className="h-9 w-24 rounded-xl border border-slate-200 text-center font-bold outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white"
                          />
                          <div className="relative">
                            <select
                              value={wageUnit}
                              onChange={(e) => setWageUnit(e.target.value)}
                              className="h-9 rounded-xl pl-3 pr-8 font-semibold bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-750 dark:text-slate-350 outline-none"
                            >
                              <option value="hour">per hour</option>
                              <option value="shift">per shift</option>
                              <option value="month">per month</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Custom rates grid */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Custom Role Rates</h4>

                        <div className="border border-slate-150/60 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-900/5">
                          <div className="p-3 border-b border-slate-150/60 dark:border-slate-800/80 grid grid-cols-12 font-bold text-[10px] text-slate-400 uppercase">
                            <div className="col-span-4">Role</div>
                            <div className="col-span-4 text-center">Hourly Rate</div>
                            <div className="col-span-4 text-center">Shift Rate</div>
                          </div>

                          <div className="divide-y divide-slate-100 dark:divide-slate-850">
                            {["Cook", "Domestic", "Health care assistants", "Training"].map((roleKey) => (
                              <div key={roleKey} className="p-3 grid grid-cols-12 items-center text-xs">
                                <div className="col-span-4 font-bold text-slate-800 dark:text-slate-200">{roleKey}</div>

                                <div className="col-span-4 flex items-center justify-center gap-1.5">
                                  <span className="text-slate-400">£</span>
                                  <input
                                    type="text"
                                    placeholder="0.00"
                                    value={customRates[roleKey]?.hour || ''}
                                    onChange={(e) => handleCustomRateChange(roleKey, 'hour', e.target.value)}
                                    className="h-8 w-20 rounded-lg border border-slate-200 bg-white text-center outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white"
                                  />
                                  <span className="text-[10px] text-slate-400 font-medium">per hour</span>
                                </div>

                                <div className="col-span-4 flex items-center justify-center gap-1.5">
                                  <span className="text-slate-400">£</span>
                                  <input
                                    type="text"
                                    placeholder="0.00"
                                    value={customRates[roleKey]?.shift || ''}
                                    onChange={(e) => handleCustomRateChange(roleKey, 'shift', e.target.value)}
                                    className="h-8 w-20 rounded-lg border border-slate-200 bg-white text-center outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white"
                                  />
                                  <span className="text-[10px] text-slate-400 font-medium">per shift</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Form Save/Cancel Buttons */}
                      <div className="flex items-center gap-3.5 border-t border-slate-100 dark:border-slate-850 pt-4 mt-2">
                        <button
                          onClick={handleSaveWages}
                          className="h-9 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setDefaultWage(selectedEmp.defaultWage || '12.71');
                            setWageUnit(selectedEmp.wageUnit || 'hour');
                            setCustomRates(selectedEmp.customRates || {
                              Cook: { hour: '', shift: '' },
                              Domestic: { hour: '', shift: '' },
                              "Health care assistants": { hour: '', shift: '' },
                              Training: { hour: '', shift: '' }
                            });
                          }}
                          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>

                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* TAB 6: WORK SCHEDULE ( Weekly shifts ) */}
                  {/* ==================================================== */}
                  {activeTab === 'schedule' && (
                    <div className="space-y-4 text-xs">
                      <h3 className="font-bold text-sm border-b pb-2 dark:border-slate-800">Weekly shift calendar planner</h3>
                      <div className="space-y-2">
                        {empShifts.length === 0 ? (
                          <div className="text-center py-10 text-slate-400 italic">No weekly shifts assigned.</div>
                        ) : (
                          empShifts.map((sh) => (
                            <div
                              key={sh.id}
                              className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center"
                            >
                              <div>
                                <p className="font-extrabold text-slate-800 dark:text-slate-100">{sh.day}</p>
                                <span className="text-[10px] text-slate-400 block font-normal mt-0.5">{sh.role}</span>
                              </div>
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                                Timings: {sh.type}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* TAB 7: DOCUMENTS - ENHANCED DOCUMENT MANAGEMENT */}
                  {/* ==================================================== */}
                  {activeTab === 'documents' && (currentRole === 'Admin' || currentRole === 'Manager') && (() => {
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

                    const uploadedDocs = empDocs.filter(d => d.uploadStatus === 'Uploaded');

                    // Compile document history across all employee's documents
                    const allHistory = [];
                    empDocs.forEach(d => {
                      if (d.history && Array.isArray(d.history)) {
                        d.history.forEach(h => {
                          allHistory.push({
                            ...h,
                            docName: d.name,
                            notes: h.action === 'Verified' ? d.verificationNotes : ''
                          });
                        });
                      }
                    });
                    
                    // Sort history reverse-chronologically
                    allHistory.sort((a, b) => parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time));

                    return (
                      <div className="space-y-8 text-xs animate-fade-in">

                        {/* SECTION 1: UPLOAD DOCUMENTS (9 MANDATORY TYPES GRID) */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                            <div>
                              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">1. Required Compliance Documents</h3>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Upload and update mandatory onboarding document folders</p>
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
                              
                              // Default status values if not uploaded
                              const isUploaded = doc && doc.uploadStatus === 'Uploaded';
                              const status = doc ? doc.status : 'Not Uploaded';
                              const fileName = isUploaded ? doc.fileName : '';
                              const expiryDate = doc ? doc.expiryDate : 'N/A';
                              
                              // Compliance / Expiry evaluation
                              let expiryLabel = expiryDate;
                              let expiryStyle = 'text-slate-500 dark:text-slate-400';
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
                                  expiryStyle = "text-amber-500 font-bold dark:text-amber-400";
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
                                badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-250 dark:bg-indigo-500/10 dark:text-indigo-400';
                              } else if (status === 'Rejected') {
                                badgeText = 'Rejected';
                                badgeStyle = 'bg-red-50 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-400';
                              }

                              // Card boundary indicators
                              let cardBorder = 'border-slate-200/70 dark:border-slate-800/80';
                              if (status === 'Verified') cardBorder = 'border-emerald-500/20 dark:border-emerald-500/15';
                              else if (status === 'Pending Verification') cardBorder = 'border-indigo-500/20 dark:border-indigo-500/15';
                              else if (status === 'Rejected') cardBorder = 'border-red-500/20 dark:border-red-500/15';

                              return (
                                <div key={type} className={`glass-card rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all hover:shadow-md ${cardBorder}`}>
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="font-extrabold text-slate-850 dark:text-slate-100 text-xs truncate max-w-[130px] sm:max-w-none" title={type}>
                                        {type}
                                      </h4>
                                      <span className={`px-2 py-0.5 rounded font-extrabold text-[8px] border uppercase ${badgeStyle}`}>
                                        {badgeText}
                                      </span>
                                    </div>
                                    
                                    <div className="space-y-1 text-[10px] text-slate-400">
                                      <div className="flex justify-between">
                                        <span>File:</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-250 truncate max-w-[150px]">{fileName || 'No file uploaded'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Expiry:</span>
                                        <span className={`font-semibold ${expiryStyle}`}>{expiryLabel}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850/60 pt-3 mt-1 gap-2">
                                    {/* Standard file input tag hidden behind custom button */}
                                    <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-650 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-400 font-bold text-[9px] cursor-pointer transition-all border border-slate-200/50 dark:border-slate-800 shadow-sm shrink-0">
                                      <span>{isUploaded ? 'Re-upload File' : 'Upload File'}</span>
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
                                    
                                    {/* If manager/admin, they can review documents that need verification */}
                                    {status === 'Pending Verification' && (currentRole === 'Manager' || currentRole === 'Admin') && (
                                      <button
                                        onClick={() => handleOpenVerification(doc)}
                                        className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-[9px] transition-all shadow shadow-brand-500/10 shrink-0"
                                      >
                                        Review & Verify
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* SECTION 2: VERIFICATION STATUS TABLE */}
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">2. Document Verification Status</h3>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Manager verification controls and checking log</p>
                          </div>

                          <div className="border border-slate-150/60 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-850 text-[10px] font-bold text-slate-400 uppercase">
                                    <th className="p-3.5 pl-5">Document Type</th>
                                    <th className="p-3.5">File Name</th>
                                    <th className="p-3.5">Upload Date</th>
                                    <th className="p-3.5">Uploaded By</th>
                                    <th className="p-3.5">Status</th>
                                    <th className="p-3.5">Verified By</th>
                                    <th className="p-3.5 text-right pr-5">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-[11px]">
                                  {uploadedDocs.length === 0 ? (
                                    <tr>
                                      <td colSpan="7" className="p-6 text-center text-slate-400 italic">No uploaded documents require verification.</td>
                                    </tr>
                                  ) : (
                                    uploadedDocs.map((doc, idx) => {
                                      let statusBadgeText = 'Needs Review';
                                      let statusBadgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400';
                                      if (doc.status === 'Verified') {
                                        statusBadgeText = 'Verified';
                                        statusBadgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-500/10 dark:text-emerald-455';
                                      } else if (doc.status === 'Rejected') {
                                        statusBadgeText = 'Rejected';
                                        statusBadgeStyle = 'bg-red-50 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-400';
                                      }

                                      return (
                                        <tr key={idx} className="hover:bg-slate-50/45 dark:hover:bg-slate-900/10 transition-colors">
                                          <td className="p-3.5 pl-5 font-bold text-slate-850 dark:text-slate-200">{doc.name}</td>
                                          <td className="p-3.5 font-semibold text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                              <FileText className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                                              <span className="truncate max-w-[150px]">{doc.fileName}</span>
                                            </div>
                                          </td>
                                          <td className="p-3.5 text-slate-400 font-semibold">{doc.uploadDate || 'N/A'}</td>
                                          <td className="p-3.5 text-slate-500 dark:text-slate-400 font-semibold">{doc.uploadedBy || 'Employee'}</td>
                                          <td className="p-3.5">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase ${statusBadgeStyle}`}>
                                              {statusBadgeText}
                                            </span>
                                          </td>
                                          <td className="p-3.5 font-semibold text-slate-500 dark:text-slate-400">
                                            {doc.status === 'Verified' ? (
                                              <div>
                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold block">
                                                  {doc.verifiedBy || 'Manager'}
                                                </span>
                                                {doc.verificationDate && (
                                                  <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">
                                                    {doc.verificationDate} {doc.verificationTime}
                                                  </span>
                                                )}
                                              </div>
                                            ) : doc.status === 'Rejected' ? (
                                              <div>
                                                <span className="text-red-600 dark:text-red-400 font-bold block">
                                                  {doc.rejectedBy || 'Manager'}
                                                </span>
                                                {doc.rejectedDate && (
                                                  <span className="text-[9px] text-red-500/80 block mt-0.5 font-medium">
                                                    {doc.rejectedDate} {doc.rejectedTime}
                                                  </span>
                                                )}
                                              </div>
                                            ) : (
                                              <span className="text-slate-400 font-medium">-</span>
                                            )}
                                          </td>
                                          <td className="p-3.5 text-right pr-5">
                                            {(currentRole === 'Manager' || currentRole === 'Admin') ? (
                                              <button
                                                onClick={() => handleOpenVerification(doc)}
                                                className="px-3 py-1 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold dark:bg-brand-950/40 dark:text-brand-400 transition-all text-[10px]"
                                              >
                                                Review Document
                                              </button>
                                            ) : (
                                              <span className="text-slate-400 font-medium text-[10px]">Verification Pending</span>
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
                        </div>

                        {/* SECTION 3: DOCUMENT HISTORY TIMELINE */}
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">3. Document History & Audit Trail</h3>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Chronological record of document management logs</p>
                          </div>

                          <div className="glass-card rounded-2xl border border-slate-150/60 dark:border-slate-850 p-5 max-h-80 overflow-y-auto bg-white/30 dark:bg-slate-950/20 shadow-sm relative">
                            {allHistory.length === 0 ? (
                              <div className="text-center py-10 text-slate-400 italic">No activity logged in the audit trail.</div>
                            ) : (
                              <div className="relative pl-6 space-y-5">
                                {/* Vertical line marker */}
                                <div className="absolute left-[9px] top-1.5 bottom-1.5 w-0.5 bg-slate-200 dark:bg-slate-800" />
                                
                                {allHistory.map((hist, idx) => {
                                  let indicatorColor = 'bg-amber-400 border-amber-200 dark:border-amber-900';
                                  if (hist.action === 'Verified' || hist.action === 'Original Seen Checked') {
                                    indicatorColor = 'bg-emerald-500 border-emerald-250 dark:border-emerald-900';
                                  } else if (hist.action === 'Rejected') {
                                    indicatorColor = 'bg-red-500 border-red-200 dark:border-red-900';
                                  }

                                  return (
                                    <div key={idx} className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 group select-none text-[11px]">
                                      {/* Dot marker */}
                                      <div className={`absolute -left-[21px] h-2.5 w-2.5 rounded-full border-2 ${indicatorColor}`} />
                                      
                                      <div className="space-y-0.5">
                                        <p className="font-bold text-slate-800 dark:text-slate-200">
                                          <span className="text-brand-600 dark:text-brand-400 font-extrabold">{hist.docName}</span>: {hist.action}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                          Performed by <span className="font-bold text-slate-500 dark:text-slate-350">{hist.user}</span>
                                          {hist.reason && <span className="text-red-500 block mt-0.5 font-bold">Reason: {hist.reason}</span>}
                                          {hist.notes && <span className="text-slate-500 dark:text-slate-400 block mt-0.5 font-semibold">Notes: {hist.notes}</span>}
                                        </p>
                                      </div>

                                      <span className="text-[9px] font-bold text-slate-400 sm:text-right shrink-0">
                                        {hist.time}, {hist.date}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })()}

                  {/* ==================================================== */}
                  {/* TAB 8: LOGBOOK ( Historical attendance ) */}
                  {/* ==================================================== */}
                  {activeTab === 'logbook' && (
                    <div className="space-y-4 text-xs">
                      <h3 className="font-bold text-sm border-b pb-2 dark:border-slate-800">Historical clockings & logbook</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px] text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 font-bold uppercase">
                              <th className="p-2.5">Date</th>
                              <th className="p-2.5">Clock In</th>
                              <th className="p-2.5">Clock Out</th>
                              <th className="p-2.5">Breaks Status</th>
                              <th className="p-2.5">Alert Badge</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {empAttendance.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="p-4 text-center text-slate-400 italic">No logbook data logged.</td>
                              </tr>
                            ) : (
                              empAttendance.map((log) => (
                                <tr key={log.id}>
                                  <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300">{log.date}</td>
                                  <td className="p-2.5 font-extrabold text-emerald-600">{log.clockIn}</td>
                                  <td className="p-2.5 font-extrabold text-slate-700 dark:text-slate-350">{log.clockOut}</td>
                                  <td className="p-2.5 font-medium">{log.breaks.length} breaks</td>
                                  <td className="p-2.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase
                                    ${log.status === 'On Time' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10' : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10'}
                                  `}>
                                      {log.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 3. MODAL DIALOGS */}
      {/* ==================================================== */}

      {/* MODAL 1: ADD NEW COMPLIANCE DOCUMENT */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-sm w-full rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl relative animate-slide-up max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setIsDocModalOpen(false)}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-650 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-3 mb-4 flex items-center gap-2">
              <PlusCircle className="h-4.5 w-4.5 text-brand-500" />
              <span>Upload document file</span>
            </h3>

            <form onSubmit={handleAddDocumentSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 block uppercase text-[9px]">Document File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Contract, Right to Work"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 justify-end border-t pt-3">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="h-8 px-4 rounded-xl border font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ONBOARD NEW EMPLOYEE STAFF */}
      {isOnboardModalOpen && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="glass-modal max-w-4xl w-full rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-y-auto max-h-[90vh] bg-white dark:bg-slate-950 animate-slide-up">
            <button
              onClick={() => setIsOnboardModalOpen(false)}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-650 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-3 mb-4 flex items-center gap-2">
              <PlusCircle className="h-4.5 w-4.5 text-brand-500" />
              <span>Onboard New Care Staff</span>
            </h3>

            <form onSubmit={handleOnboardSubmit} className="space-y-6 text-xs text-slate-800 dark:text-slate-100">

              {/* Form Grid: Two wide columns */}
              <div className="grid gap-6 md:grid-cols-2">

                {/* LEFT COLUMN: Basic Information & Emergency Contacts */}
                <div className="space-y-5">

                  {/* Basic Information section */}
                  <div className="space-y-3.5 border-b border-slate-100 dark:border-slate-800/85 pb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Basic Information</h4>

                    {/* Title & Gender select dropdowns side by side */}
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Title</label>
                        <select
                          value={newEmpData.titlePrefix}
                          onChange={(e) => setNewEmpData({ ...newEmpData, titlePrefix: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        >
                          <option value="Miss">Miss</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Mr">Mr</option>
                          <option value="Ms">Ms</option>
                          <option value="Dr">Dr</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Gender</label>
                        <select
                          value={newEmpData.gender}
                          onChange={(e) => setNewEmpData({ ...newEmpData, gender: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* First Name & Middle Name side by side */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">First Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Abhi"
                          value={newEmpData.firstName}
                          onChange={(e) => setNewEmpData({ ...newEmpData, firstName: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Middle Name(s)</label>
                        <input
                          type="text"
                          placeholder="e.g. Soundaraj"
                          value={newEmpData.middleName}
                          onChange={(e) => setNewEmpData({ ...newEmpData, middleName: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 block uppercase text-[9px]">Last Name</label>
                      <input
                          type="text"
                          required
                          placeholder="e.g. Soundaraj"
                          value={newEmpData.lastName}
                          onChange={(e) => setNewEmpData({ ...newEmpData, lastName: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                      />
                    </div>

                    {/* Date of Birth: 3 separate dropdowns exactly as shown in your screenshot */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 block uppercase text-[9px]">Date of Birth</label>
                      <div className="grid gap-2 grid-cols-3">
                        <select
                          value={dobDay}
                          onChange={(e) => setDobDay(e.target.value)}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        >
                          {Array.from({ length: 31 }, (_, i) => String(i + 1)).map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>

                        <select
                          value={dobMonth}
                          onChange={(e) => setDobMonth(e.target.value)}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        >
                          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>

                        <select
                          value={dobYear}
                          onChange={(e) => setDobYear(e.target.value)}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        >
                          {Array.from({ length: 70 }, (_, i) => String(new Date().getFullYear() - 16 - i)).map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact section */}
                  <div className="space-y-3.5">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Emergency Contact</h4>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 block uppercase text-[9px]">Emergency Contact Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mary Soundaraj"
                        value={newEmpData.emergencyContactName}
                        onChange={(e) => setNewEmpData({ ...newEmpData, emergencyContactName: e.target.value })}
                        className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
                      />
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Relationship to Employee</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Partner, Mother"
                          value={newEmpData.emergencyContactRelation}
                          onChange={(e) => setNewEmpData({ ...newEmpData, emergencyContactRelation: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Emergency Phone Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. +44 7700 900888"
                          value={newEmpData.emergencyContactPhone}
                          onChange={(e) => setNewEmpData({ ...newEmpData, emergencyContactPhone: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Contact Details & Workspace Roles */}
                <div className="space-y-5">

                  {/* Contact Details section */}
                  <div className="space-y-3.5 border-b border-slate-100 dark:border-slate-800/85 pb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Contact Details</h4>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Address 1</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 24 High Street"
                          value={newEmpData.address1}
                          onChange={(e) => setNewEmpData({ ...newEmpData, address1: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Address 2</label>
                        <input
                          type="text"
                          placeholder="e.g. Solihull"
                          value={newEmpData.address2}
                          onChange={(e) => setNewEmpData({ ...newEmpData, address2: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">City</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Birmingham"
                          value={newEmpData.city}
                          onChange={(e) => setNewEmpData({ ...newEmpData, city: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">County</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Southminster"
                          value={newEmpData.county}
                          onChange={(e) => setNewEmpData({ ...newEmpData, county: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Postcode</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. B91 3RD"
                          value={newEmpData.postcode}
                          onChange={(e) => setNewEmpData({ ...newEmpData, postcode: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. abhi@oakfieldcare.co.uk"
                          value={newEmpData.email}
                          onChange={(e) => setNewEmpData({ ...newEmpData, email: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        />
                        <span className="text-[8px] text-slate-400 block mt-0.5">This will be used for email notifications</span>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Secondary Email Address</label>
                        <input
                          type="email"
                          placeholder="e.g. abhi.personal@gmail.com"
                          value={newEmpData.secondaryEmail}
                          onChange={(e) => setNewEmpData({ ...newEmpData, secondaryEmail: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Phone Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. +44 7412 345678"
                          value={newEmpData.phone}
                          onChange={(e) => setNewEmpData({ ...newEmpData, phone: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-850 dark:text-white font-semibold"
                        />
                        <span className="text-[8px] text-slate-400 block mt-0.5">This will be used for SMS notifications</span>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Secondary Phone Number</label>
                        <input
                          type="text"
                          placeholder="e.g. +44 7412 000111"
                          value={newEmpData.secondaryPhone}
                          onChange={(e) => setNewEmpData({ ...newEmpData, secondaryPhone: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Profile Details section */}
                  <div className="space-y-3.5">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Workspace Roles & Details</h4>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Job Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Registered Care Nurse"
                          value={newEmpData.jobTitle}
                          onChange={(e) => setNewEmpData({ ...newEmpData, jobTitle: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Assigned Manager</label>
                        <select
                          value={newEmpData.manager}
                          onChange={(e) => setNewEmpData({ ...newEmpData, manager: e.target.value })}
                          className="h-9 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-white font-semibold"
                        >
                          <option value="Admin User">Admin User</option>
                          <option value="Sarah Jenkins">Sarah Jenkins</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Start Date</label>
                        <input
                          type="date"
                          required
                          value={newEmpData.startDate}
                          onChange={(e) => setNewEmpData({ ...newEmpData, startDate: e.target.value })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Workspace Role</label>
                        <select
                          value={newEmpData.role}
                          onChange={(e) => setNewEmpData({ ...newEmpData, role: e.target.value })}
                          className="h-9 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-white font-semibold"
                        >
                          <option value="Employee">Employee</option>
                          <option value="Manager">Manager</option>
                          <option value="Compliance Officer">Compliance Officer</option>
                          <option value="HR">HR</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 block uppercase text-[9px]">Holiday Allowance (Days)</label>
                        <input
                          type="number"
                          required
                          value={newEmpData.holidayAllocation}
                          onChange={(e) => setNewEmpData({ ...newEmpData, holidayAllocation: parseInt(e.target.value) || 28 })}
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 block uppercase text-[9px]">Skill Group Assignment</label>
                      <select
                        value={newEmpData.group}
                        onChange={(e) => setNewEmpData({ ...newEmpData, group: e.target.value })}
                        className="h-9 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 outline-none dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-white font-semibold"
                      >
                        <option value="Care Staff Day">Care Day Staff</option>
                        <option value="Care Staff Night">Care Night Staff</option>
                        <option value="Team Lead">Team Lead</option>
                        <option value="HCA Lead">HCA Lead</option>
                        <option value="Cook">Catering</option>
                        <option value="Domestic">Domestic</option>
                      </select>
                    </div>

                  </div>

                </div>

              </div>

              {/* Form Bottom Row with Action buttons */}
              <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800/80 pt-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="h-9 px-5 rounded-xl border font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all active:scale-[0.98] shadow-md shadow-brand-500/10"
                >
                  Onboard Staff Member
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: DOCUMENT REVIEW & VERIFICATION PANEL */}
      {selectedDocForVerification && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-3xl w-full rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-850 shadow-2xl relative bg-white dark:bg-slate-950 animate-slide-up max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => {
                setSelectedDocForVerification(null);
                setOriginalSeen(false);
                setVerificationNotes('');
              }}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-650 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b pb-3 mb-5 flex items-center gap-2">
              <FileCheck className="h-4.5 w-4.5 text-brand-500" />
              <span>Review Compliance Document: {selectedDocForVerification.name}</span>
            </h3>

            <div className="grid gap-6 md:grid-cols-12 text-xs">
              {/* LEFT COLUMN: Document Preview Frame */}
              <div className="md:col-span-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border dark:border-slate-850 flex flex-col justify-between min-h-[280px]">
                <div className="w-full h-full border border-dashed border-slate-250 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-950 flex flex-col justify-between items-center shadow-inner relative overflow-hidden">
                  
                  {/* Mock Watermark stamp */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[15deg] text-slate-100 dark:text-slate-900/20 text-3xl font-black uppercase select-none pointer-events-none tracking-widest text-center">
                    COMPLIANCE LOG<br />PREVIEW ONLY
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
                      <span>Uploaded By:</span>
                      <span className="text-slate-800 dark:text-slate-200">{selectedDocForVerification.uploadedBy || 'Employee'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Upload Date:</span>
                      <span className="text-slate-800 dark:text-slate-200">{selectedDocForVerification.uploadDate || 'Just now'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File format:</span>
                      <span className="text-slate-800 dark:text-slate-200">Portable Document (PDF)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Action Verification Panel */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                <form onSubmit={handleVerifySubmit} className="space-y-4 flex-1">
                  
                  {/* Instructions */}
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl dark:bg-indigo-950/10 dark:border-indigo-950/40 text-[10px] leading-relaxed text-indigo-700 dark:text-indigo-400 font-semibold">
                    Before verifying this file, ensure you have inspected the original physical document and checked details against current onboarding standards.
                  </div>

                  {/* Checklist checkbox (original seen) */}
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/30">
                    <input
                      type="checkbox"
                      id="originalSeenCheck"
                      checked={originalSeen}
                      onChange={(e) => setOriginalSeen(e.target.checked)}
                      className="h-4.5 w-4.5 mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-850 dark:bg-slate-900 cursor-pointer"
                    />
                    <label htmlFor="originalSeenCheck" className="font-bold text-slate-800 dark:text-slate-200 select-none cursor-pointer leading-tight">
                      Confirm Original Seen
                      <span className="block text-[9px] text-slate-400 font-medium mt-0.5">I confirm that I have physically seen and validated the original document.</span>
                    </label>
                  </div>

                  {/* Notes text area */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-550 block uppercase text-[9px]">Verification Notes</label>
                    <textarea
                      placeholder="Enter verification comments or compliance checks details..."
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

      {/* MODAL 4: DOCUMENT REJECTION REASON DIALOG */}
      {isRejectionModalOpen && createPortal(
        <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-modal max-w-md w-full rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-white dark:bg-slate-950 animate-scale-up max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setIsRejectionModalOpen(false)}
              className="absolute right-4 top-4 h-7 w-7 text-slate-400 hover:text-slate-650 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-850"
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
                  placeholder="Explain why this document is rejected (e.g. Blur file, Expired passport, Incorrect document format)..."
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-850 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectionModalOpen(false)}
                  className="h-8.5 px-4 rounded-xl border font-bold text-slate-550 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-md shadow-red-500/10"
                >
                  Confirm Rejection
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

export default Employees;
