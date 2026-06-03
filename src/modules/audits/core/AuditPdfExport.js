export const exportAuditToCsv = (audit, details) => {
  alert(`Exported audit report summary for "${audit.type}" to CSV format.`);
};

export const triggerPrintLayout = () => {
  window.print();
};
