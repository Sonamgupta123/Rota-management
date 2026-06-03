import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  QrCode, 
  UserCheck, 
  LogOut, 
  Users, 
  Search, 
  HelpCircle,
  Tablet,
  CheckCircle,
  FileSpreadsheet,
  Plus
} from 'lucide-react';

const VisitorTablet = () => {
  const { visitors, registerVisitor, checkoutVisitor, currentRole } = useApp();
  const [tabletMode, setTabletMode] = useState(true); // Toggle between Kiosk Tablet UI & Office Registers

  // Kiosk form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [visitingPerson, setVisitingPerson] = useState('');
  const [activePass, setActivePass] = useState(null); // Generated mock badge

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !visitingPerson) return;
    
    registerVisitor(name, company, phone, purpose, visitingPerson);
    
    // Generate visitor badge
    setActivePass({
      name,
      company,
      visitingPerson,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      code: `V-PASS-${Math.floor(1000 + Math.random() * 9000)}`
    });

    // Reset fields
    setName('');
    setCompany('');
    setPhone('');
    setPurpose('');
    setVisitingPerson('');
  };

  const insideCount = visitors.filter(v => v.status === 'Currently Inside').length;
  const signedOutCount = visitors.filter(v => v.status === 'Signed Out').length;
  const totalToday = visitors.length;

  return (
    <div className="space-y-6 animate-fade-in p-2">
      
      {/* View Header toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Visitor Management & Reception</h2>
          <p className="text-xs text-slate-500">Track care home relatives, contractors, and agency nursing signs</p>
        </div>

        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200/50 dark:border-slate-800">
          <button
            onClick={() => { setTabletMode(true); setActivePass(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1
              ${tabletMode 
                ? 'bg-brand-600 text-white shadow-sm dark:bg-brand-500' 
                : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
              }
            `}
          >
            <Tablet className="h-3.5 w-3.5" />
            <span>Kiosk Tablet UI</span>
          </button>
          <button
            onClick={() => setTabletMode(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1
              ${!tabletMode 
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white' 
                : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
              }
            `}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Office Visitor Logs</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Kiosk Tablet UI (iPad design) */}
      {tabletMode && (
        <div className="max-w-4xl mx-auto rounded-3xl border-8 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden min-h-[500px]">
          
          <div className="grid md:grid-cols-2 text-xs">
            
            {/* LEFT PANEL: Greeting, instruction, and QR scanner */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-brand-900 to-brand-700 text-white flex flex-col justify-between space-y-8 relative">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-brand-300 uppercase tracking-widest block">Oakfield Care Residence</span>
                <h3 className="text-xl font-bold tracking-tight">Front Desk Kiosk</h3>
                <p className="text-[11px] text-brand-200 leading-normal font-medium">
                  Welcome to our residential care home. For health and safety, please register your check-in.
                </p>
              </div>

              {/* QR scanner visual device */}
              <div className="flex flex-col items-center justify-center border border-white/20 rounded-2xl p-4 bg-white/5 backdrop-blur-md">
                <div className="h-28 w-28 bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
                  {/* Simulated QR Code SVG */}
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <rect x="0" y="0" width="25" height="25" fill="#1e293b" />
                    <rect x="5" y="5" width="15" height="15" fill="#ffffff" />
                    <rect x="75" y="0" width="25" height="25" fill="#1e293b" />
                    <rect x="80" y="5" width="15" height="15" fill="#ffffff" />
                    <rect x="0" y="75" width="25" height="25" fill="#1e293b" />
                    <rect x="5" y="80" width="15" height="15" fill="#ffffff" />
                    {/* Random patterns */}
                    <rect x="35" y="10" width="10" height="10" fill="#1e293b" />
                    <rect x="50" y="25" width="15" height="10" fill="#1e293b" />
                    <rect x="30" y="50" width="20" height="20" fill="#1e293b" />
                    <rect x="60" y="45" width="10" height="15" fill="#1e293b" />
                    <rect x="80" y="80" width="15" height="15" fill="#1e293b" />
                  </svg>
                </div>
                <span className="text-[10px] text-brand-100 font-bold uppercase tracking-wider mt-3 flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-emerald-400" />
                  <span>Scan QR code to checkout</span>
                </span>
              </div>

              {/* Safety notification banner */}
              <p className="text-[9px] text-brand-300 leading-relaxed font-semibold">
                ⚠️ Information is treated in absolute privacy under GDPR guidelines. Hand sanitizer sanitization is mandatory upon entry.
              </p>
            </div>

            {/* RIGHT PANEL: Sign-in/out options */}
            <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900/40 flex flex-col justify-center">
              {activePass ? (
                // SUCCESS PASS DISPLAY SCREEN
                <div className="text-center space-y-4 animate-scale-in flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mx-auto dark:bg-emerald-950/20">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Check-in Registered Successfully</h4>
                    <p className="text-[10px] text-slate-400">Please wear your generated digital visitor pass at all times inside.</p>
                  </div>

                  {/* Generated Badge Pass */}
                  <div className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-950 p-4 text-xs space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-600" />
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                      <span>OAKFIELD CARE GUEST</span>
                      <span>{activePass.code}</span>
                    </div>

                    <div className="space-y-1 text-center py-2">
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white">{activePass.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{activePass.company}</p>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2 grid grid-cols-2 text-[9px] text-slate-500 font-medium">
                      <div>
                        <span>Host Person</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{activePass.visitingPerson}</p>
                      </div>
                      <div>
                        <span>Clock In</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{activePass.time}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActivePass(null)}
                    className="h-9 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-sm transition-all text-[10px] w-full"
                  >
                    Complete Check In
                  </button>
                </div>
              ) : (
                // CHECK IN FORM SCREEN
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                    Visitor Registration Desk
                  </h4>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 block uppercase text-[9px]">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Helena Green"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 block uppercase text-[9px]">Company / Rel</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Supplies, Family"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-brand-500"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="font-bold text-slate-400 block uppercase text-[9px]">Phone No</label>
                        <input
                          type="tel"
                          required
                          placeholder="+44 7911 123456"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 block uppercase text-[9px]">Visiting Resident / Staff</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins (Senior Care)"
                        value={visitingPerson}
                        onChange={(e) => setVisitingPerson(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 block uppercase text-[9px]">Purpose of Visit</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Relative visit, contractor maintenance"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-sm transition-all mt-4 flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="h-4.5 w-4.5" />
                    <span>Register Check In</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: Office registers dashboard */}
      {!tabletMode && (
        <div className="space-y-6">
          {/* Office visitor statistics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Visitors Today</span>
                <p className="text-2xl font-bold tracking-tight">{totalToday}</p>
                <span className="text-[10px] text-slate-500 font-semibold">Total front desk check-ins</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center dark:bg-indigo-950/20">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Currently Inside</span>
                <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{insideCount}</p>
                <span className="text-[10px] text-slate-500 font-semibold">Guest badges active</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center dark:bg-emerald-950/20">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Signed Out</span>
                <p className="text-2xl font-bold tracking-tight text-slate-500">{signedOutCount}</p>
                <span className="text-[10px] text-slate-500 font-semibold">Guest badges deactivated</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center dark:bg-slate-800">
                <LogOut className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Visitor registry grid logs */}
          <div className="glass-card rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-sm">Auditable Visitors Register logs</h3>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3">Guest Name</th>
                    <th className="p-3">Company / Relationship</th>
                    <th className="p-3">Purpose of Visit</th>
                    <th className="p-3">Visiting Person</th>
                    <th className="p-3">Arrival Time</th>
                    <th className="p-3">Checkout Time</th>
                    <th className="p-3 text-center">Desk Checkout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {visitors.map((vis) => (
                    <tr key={vis.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{vis.name}</td>
                      <td className="p-3 text-slate-655 font-semibold">{vis.company}</td>
                      <td className="p-3 text-slate-500">{vis.purpose}</td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{vis.visitingPerson}</td>
                      <td className="p-3 text-emerald-600 font-bold">{vis.clockIn}</td>
                      <td className="p-3 text-slate-500 font-bold">{vis.clockOut}</td>
                      <td className="p-3 text-center">
                        {vis.status === 'Currently Inside' ? (
                          <button
                            onClick={() => checkoutVisitor(vis.id)}
                            className="h-7 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-[10px] inline-flex items-center gap-1 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/40"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Sign Out Guest</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VisitorTablet;
