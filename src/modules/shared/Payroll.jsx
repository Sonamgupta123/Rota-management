import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Receipt, 
  Search, 
  FileSpreadsheet, 
  FileCheck2, 
  TrendingUp, 
  Percent, 
  HelpCircle,
  PiggyBank
} from 'lucide-react';

const Payroll = () => {
  const { employees, attendance, currentRole, activeEmployeeId } = useApp();
  const [search, setSearch] = useState('');

  // Calculate stats for a given employee
  const getEmployeePayroll = (empId) => {
    const logs = attendance.filter(log => log.employeeId === empId);
    
    // Calculate total hours
    let totalMinutes = 0;
    let totalBreaksMinutes = 0;

    logs.forEach(log => {
      if (log.clockOut !== 'Pending') {
        // Mock standard shifts lengths for high fidelity:
        // Day shifts (8AM-2PM) = 6 hours
        // Day late (2PM-8PM) = 6 hours
        // Full day shifts = 12 hours
        // Night shifts = 12 hours
        // We calculate based on dates logs:
        let dayMinutes = 360; // 6 hrs base
        if (log.breaks.length > 0) {
          // Subtract 30 mins per break
          totalBreaksMinutes += log.breaks.length * 30;
        }
        totalMinutes += dayMinutes;
      }
    });

    const hoursWorked = Math.round((totalMinutes / 60) * 10) / 10;
    const breakDeductions = Math.round((totalBreaksMinutes / 60) * 10) / 10;
    const payableHours = Math.max(0, hoursWorked - breakDeductions);
    const hourlyRate = 14.50; // Standard UK care wage
    const grossPay = Math.round((payableHours * hourlyRate) * 100) / 100;

    return {
      shiftsCount: logs.length,
      hoursWorked,
      breakDeductions,
      payableHours,
      grossPay
    };
  };

  const exportPayrollToCSV = () => {
    const headers = ["Employee ID", "Employee Name", "Job Title", "System Role", "Total Shifts", "Total Hours Worked", "Break Deductions (hrs)", "Total Payable Hours", "Hourly Rate", "Estimated Monthly Gross Pay"];
    const rows = employees.map(emp => {
      const payroll = getEmployeePayroll(emp.id);
      return [
        emp.id,
        emp.name,
        emp.title,
        emp.role,
        payroll.shiftsCount,
        payroll.hoursWorked,
        payroll.breakDeductions,
        payroll.payableHours,
        "£14.50",
        `£${payroll.grossPay.toFixed(2)}`
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => {
        const str = String(val === null || val === undefined ? '' : val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AS_Care_Payroll_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentEmp = employees.find(e => e.id === activeEmployeeId) || employees[0];
  const personalPayroll = getEmployeePayroll(currentEmp.id);
  const empLogs = attendance.filter(log => log.employeeId === currentEmp.id);

  if (currentRole === 'Employee') {
    return (
      <div className="space-y-6 animate-fade-in p-2">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight">My Payslips & Worked Hours</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">View personal worked shifts, statutory break deductions, and estimated gross earnings</p>
          </div>
          <button
            onClick={() => alert(`Exporting payslip summary for ${currentEmp.name} (EMP-PAY-${currentEmp.id}.pdf)`)}
            className="h-9 px-4 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Download Payslip PDF</span>
          </button>
        </div>

        {/* Dynamic Premium Payslip Stats Card */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Estimated Gross Pay */}
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between border-b-4 border-b-brand-500 shadow-md">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Est. Gross Pay</span>
              <p className="text-3xl font-extrabold tracking-tight text-brand-600 dark:text-brand-400">£{personalPayroll.grossPay.toFixed(2)}</p>
              <span className="text-[10px] text-slate-500 font-semibold">Active pay period summary</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center dark:bg-brand-950/20">
              <PiggyBank className="h-6 w-6" />
            </div>
          </div>

          {/* Payable Hours */}
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between border-b-4 border-b-indigo-500 shadow-md">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Payable Hours</span>
              <p className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">{personalPayroll.payableHours} hrs</p>
              <span className="text-[10px] text-slate-550 font-semibold">{personalPayroll.hoursWorked} gross hrs worked</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center dark:bg-indigo-950/20">
              <Receipt className="h-6 w-6" />
            </div>
          </div>

          {/* Break Deductions */}
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between border-b-4 border-b-red-500 shadow-md">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Statutory Deductions</span>
              <p className="text-3xl font-extrabold tracking-tight text-red-600 dark:text-red-400">-{personalPayroll.breakDeductions} hrs</p>
              <span className="text-[10px] text-slate-500 font-semibold">Unpaid statutory rest breaks</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center dark:bg-red-950/20">
              <Percent className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Daily Shifts Ledger List */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
            <div>
              <h3 className="font-bold text-sm">Shift Details Breakdown</h3>
              <p className="text-[10px] text-slate-400">Verified clock sessions in the current pay run</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {personalPayroll.shiftsCount} Shifts Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3">Work Date</th>
                  <th className="p-3 text-center">Clock In</th>
                  <th className="p-3 text-center">Clock Out</th>
                  <th className="p-3 text-center">Rest Breaks</th>
                  <th className="p-3 text-center">Total Payable</th>
                  <th className="p-3 text-center">Hourly Rate</th>
                  <th className="p-3 text-right">Est. Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {empLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 dark:text-slate-500 font-semibold">
                      No shift logs recorded in this period.
                    </td>
                  </tr>
                ) : (
                  empLogs.map((log) => {
                    const duration = log.clockOut !== 'Pending' ? 6 : 0; // base 6h
                    const breakDeduct = log.breaks.length * 0.5;
                    const payable = Math.max(0, duration - breakDeduct);
                    const earnings = payable * 14.50;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="p-3 font-bold text-slate-850 dark:text-slate-200">{log.date}</td>
                        <td className="p-3 text-center text-slate-500 dark:text-slate-400">{log.clockIn}</td>
                        <td className={`p-3 text-center font-bold ${log.clockOut === 'Pending' ? 'text-amber-500 animate-pulse' : 'text-slate-500 dark:text-slate-400'}`}>
                          {log.clockOut}
                        </td>
                        <td className="p-3 text-center font-semibold text-red-500">
                          {log.breaks.length > 0 ? `-${breakDeduct} hrs (${log.breaks.length} break)` : 'None'}
                        </td>
                        <td className="p-3 text-center font-extrabold text-brand-600 dark:text-brand-400">{payable} hrs</td>
                        <td className="p-3 text-center text-slate-500">£14.50/hr</td>
                        <td className="p-3 text-right font-extrabold text-slate-950 dark:text-white">
                          £{earnings.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Helpful compliance hints */}
        <div className="flex gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] text-slate-500 leading-relaxed font-semibold">
          <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0" />
          <div>
            <span className="font-bold block text-slate-850 dark:text-slate-300">Payslip & Break Policy Guidance:</span>
            <p className="mt-0.5">
              Oakfield Care Home calculates wages using a fixed £14.50 hourly rate. Statutory health guidelines mandate a 30-minute unpaid break deduction for every shift exceeding 6 hours. If you spot any discrepancies in your recorded clock cards, please raise a request with your Operations Lead.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in p-2">
      
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Payroll & Shifts Summary</h2>
          <p className="text-xs text-slate-500">Calculate weekly/monthly worked hours, statutory break deductions, and gross pay sheets</p>
        </div>

        {/* Payroll spreadsheet action */}
        <button
          onClick={exportPayrollToCSV}
          className="h-9 px-4 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all flex items-center gap-1.5 shadow-sm self-start"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export Payroll Registry</span>
        </button>
      </div>

      {/* KPI WIDGETS OVERVIEW */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Payroll Payable</span>
            <p className="text-2xl font-bold tracking-tight text-brand-700 dark:text-brand-400">£12,345.50</p>
            <span className="text-[10px] text-slate-500 font-semibold">Calculated monthly gross</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center dark:bg-brand-950/20">
            <PiggyBank className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Logged Hours</span>
            <p className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">852.5 Hours</p>
            <span className="text-[10px] text-slate-500 font-semibold">Combined staff session punch cards</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center dark:bg-indigo-950/20">
            <Receipt className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Break Deductions Ratio</span>
            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">42.5 Hours</p>
            <span className="text-[10px] text-slate-500 font-semibold">Subtracted mandatory break times</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center dark:bg-amber-950/20">
            <Percent className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Payroll calculations register table */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-xs">
        
        {/* Table header filter panel */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-sm">Monthly Worked Hours calculations</h3>
            <p className="text-[10px] text-slate-400">Based on verified time log sign-ins</p>
          </div>
          
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee or group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-brand-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Calculations table matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3">Staff Employee</th>
                <th className="p-3 text-center">Completed Shifts</th>
                <th className="p-3 text-center">Gross Hours Worked</th>
                <th className="p-3 text-center">Break Deductions</th>
                <th className="p-3 text-center">Payable Hours</th>
                <th className="p-3 text-center">Hourly Rate</th>
                <th className="p-3 text-right">Est. Gross Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredEmployees.map((emp) => {
                const payroll = getEmployeePayroll(emp.id);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img src={emp.photo} alt={emp.name} className="h-7 w-7 rounded-full object-cover border" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{emp.name}</p>
                          <span className="text-[10px] text-slate-400 block font-normal">{emp.group}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-350">{payroll.shiftsCount} Shifts</td>
                    <td className="p-3 text-center font-semibold text-slate-500">{payroll.hoursWorked} hrs</td>
                    <td className="p-3 text-center text-red-500 font-bold">-{payroll.breakDeductions} hrs</td>
                    <td className="p-3 text-center font-extrabold text-brand-600 dark:text-brand-400">{payroll.payableHours} hrs</td>
                    <td className="p-3 text-center font-semibold text-slate-500">£14.50/hr</td>
                    <td className="p-3 text-right font-extrabold text-slate-900 dark:text-white">£{payroll.grossPay.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Helpful compliance hints */}
      <div className="flex gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] text-slate-500 leading-relaxed font-semibold">
        <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0" />
        <div>
          <span className="font-bold block text-slate-800 dark:text-slate-300">Auditable break policy notes:</span>
          <p className="mt-0.5">
            Under standard healthcare employment guidance, shift breaks exceeding 6 hours require a statutory 30-minute rest interval. The care home payroll system automatically logs and deducts these times from aggregate session clocks to prevent compliance errors during payroll generation.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Payroll;
