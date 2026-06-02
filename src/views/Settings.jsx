import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Bell, 
  Save, 
  Sparkles,
  Lock,
  Eye,
  Camera
} from 'lucide-react';

const Settings = () => {
  const { employees, activeEmployeeId, updateEmployee } = useApp();
  const currentEmp = employees.find(e => e.id === activeEmployeeId) || employees[0];

  // Profile Form States
  const [name, setName] = useState(currentEmp.name || '');
  const [dob, setDob] = useState(currentEmp.dob || '');
  const [email, setEmail] = useState(currentEmp.email || '');
  const [phone, setPhone] = useState(currentEmp.phone || '');
  const [address, setAddress] = useState(currentEmp.address || '');
  const [emergencyContact, setEmergencyContact] = useState(currentEmp.emergencyContact || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' or null

  // System Settings States
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSms, setNotifSms] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate save network speed
    setTimeout(() => {
      updateEmployee(currentEmp.id, {
        name,
        dob,
        email,
        phone,
        address,
        emergencyContact
      });
      setIsSaving(false);
      setSaveStatus('success');
      
      // Auto clear toast status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in p-2 max-w-4xl mx-auto">
      
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          System settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal profile details, notification preferences, and account security.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left Column: Profile Card Preview */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-5 text-center relative overflow-hidden flex flex-col items-center">
            {/* Ambient Background decoration */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-90 z-0" />
            
            <div className="relative mt-8 z-10">
              <img
                src={currentEmp.photo}
                alt={currentEmp.name}
                className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-md"
              />
              <button className="absolute bottom-0 right-0 h-7 w-7 bg-brand-600 text-white rounded-full flex items-center justify-center hover:bg-brand-500 shadow border border-white dark:border-slate-900 transition-all">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 relative z-10 w-full">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                {currentEmp.name}
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{currentEmp.title}</p>
              
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-indigo-50/80 px-2.5 py-0.5 text-[9px] font-bold text-brand-700 dark:bg-brand-950/40 dark:text-brand-400">
                <Sparkles className="h-2.5 w-2.5" />
                <span>Reference ID: {currentEmp.id}</span>
              </div>
            </div>

            <div className="w-full border-t border-slate-100 dark:border-slate-800 mt-5 pt-4 text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Account Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>{currentEmp.status || 'Active'}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Department Role</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{currentEmp.group || 'Clinical Care'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Join Date</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{currentEmp.startDate || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Quick Security Status Mockup */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <h4 className="font-bold text-xs flex items-center gap-1.5 border-b pb-2 dark:border-slate-800">
              <ShieldCheck className="h-4 w-4 text-brand-500" />
              <span>Security & Access</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Two-Factor Auth</p>
                  <p className="text-[10px] text-slate-400">Enhance your session safety</p>
                </div>
                <button className="h-5 px-2 rounded-lg bg-slate-150 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Roster Pin Lock</p>
                  <p className="text-[10px] text-slate-400">Lock tablet views automatically</p>
                </div>
                <button className="h-5 px-2 rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                  Active
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update Details Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Edit Panel */}
          <div className="glass-card rounded-3xl p-5 md:p-6 space-y-5">
            <h3 className="font-bold text-sm flex items-center gap-1.5 border-b pb-3 dark:border-slate-800">
              <User className="h-4 w-4 text-brand-500" />
              <span>Personal Information Update</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="grid gap-4 sm:grid-cols-2 text-xs">
              
              <div className="space-y-1.5 sm:col-span-1">
                <label className="font-bold text-slate-500 block uppercase text-[10px]">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Sarah Jenkins"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label className="font-bold text-slate-500 block uppercase text-[10px]">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label className="font-bold text-slate-500 block uppercase text-[10px]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="sarah.jenkins@oakfieldcare.co.uk"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label className="font-bold text-slate-500 block uppercase text-[10px]">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 7700 900077"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-500 block uppercase text-[10px]">Home Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="24 Maple Drive, Birmingham, B12 6XY"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-500 block uppercase text-[10px]">Emergency Contact Roster Reference</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="David Jenkins (Spouse) - +44 7700 900088"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Form buttons */}
              <div className="sm:col-span-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                {saveStatus === 'success' && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs animate-bounce">
                    ✓ Profile saved successfully!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-9 px-5 ml-auto rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all flex items-center gap-2 shadow-sm text-xs"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Preferences Settings Block */}
          <div className="glass-card rounded-3xl p-5 md:p-6 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5 border-b pb-3 dark:border-slate-800">
              <Bell className="h-4 w-4 text-brand-500" />
              <span>Notifications Preferences</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Email Alerts</p>
                  <p className="text-[10px] text-slate-400">Receive Rota shift notifications and Compliance updates via email</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifEmail} 
                  onChange={(e) => setNotifEmail(e.target.checked)}
                  className="h-4 w-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Desktop Push Notifications</p>
                  <p className="text-[10px] text-slate-400">Receive real-time pop-ups on clock-in / clock-out events</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifPush} 
                  onChange={(e) => setNotifPush(e.target.checked)}
                  className="h-4 w-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">SMS / WhatsApp Shifts Broadcast</p>
                  <p className="text-[10px] text-slate-400">Broadcast open shifts available for claiming to mobile device</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifSms} 
                  onChange={(e) => setNotifSms(e.target.checked)}
                  className="h-4 w-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer" 
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;
