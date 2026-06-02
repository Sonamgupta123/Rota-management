        selectedAudit.type === 'Monthly Medication Audit' && medicationAuditForm ? (
          <div className="max-w-6xl mx-auto rounded-xl p-4 md:p-6 space-y-6 relative animate-slide-up bg-white text-black shadow-lg border border-slate-200">
            {/* Header / Brand Flex row */}
            <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-4 select-none">
              <div className="flex-1 text-center">
                <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase text-black">
                  Full Monthly Medication Audit
                </h2>
              </div>
              <div className="shrink-0 ml-4 flex flex-col items-end gap-1">
                <img src={logoImg} alt="AS CARE" className="h-10 md:h-12 object-contain" />
              </div>
            </div>

            {/* Header Details Grid */}
            <div className="w-full border-2 border-black text-xs font-semibold select-none mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="p-2 border-b sm:border-r border-black flex items-center justify-between">
                  <span className="text-black font-bold">Name of Home</span>
                  <input type="text" value={medicationAuditForm.homeName} onChange={e => setMedicationAuditForm({...medicationAuditForm, homeName: e.target.value})} className="bg-transparent border-none outline-none font-bold text-[#c00000] text-right" />
                </div>
                <div className="p-2 border-b border-black flex items-center justify-between">
                  <span className="text-black font-bold">Date of Audit</span>
                  <input type="date" value={medicationAuditForm.dateOfAudit} onChange={e => setMedicationAuditForm({...medicationAuditForm, dateOfAudit: e.target.value})} className="bg-transparent border-none outline-none font-bold text-[#c00000] text-right" />
                </div>
                <div className="p-2 border-b sm:border-r border-black flex items-center justify-between">
                  <span className="text-black font-bold">Completed by</span>
                  <input type="text" value={medicationAuditForm.completedBy} onChange={e => setMedicationAuditForm({...medicationAuditForm, completedBy: e.target.value})} className="bg-transparent border-none outline-none font-bold text-[#c00000] text-right" />
                </div>
                <div className="p-2 border-b border-black flex items-center justify-between">
                  <span className="text-black font-bold">Actions added to audit action plan</span>
                  <select value={medicationAuditForm.actionsAdded} onChange={e => setMedicationAuditForm({...medicationAuditForm, actionsAdded: e.target.value})} className="bg-transparent border-none outline-none font-bold text-[#c00000] text-right">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="p-2 border-b sm:border-r border-black flex items-center justify-between bg-slate-50">
                  <span className="text-black font-bold">Overall score of Audit</span>
                  <span className="font-black text-lg text-indigo-700">
                    {(() => {
                      const yesNa = medicationAuditForm.questions.filter(q => q.status === 'YES' || q.status === 'N/A').length;
                      return Math.round((yesNa / 54) * 100);
                    })()}%
                  </span>
                </div>
                <div className="p-2 border-b border-black flex items-center justify-between bg-slate-50">
                  <span className="text-black font-bold">Rag Rating</span>
                  {(() => {
                    const score = Math.round((medicationAuditForm.questions.filter(q => q.status === 'YES' || q.status === 'N/A').length / 54) * 100);
                    if (score >= 90) return <span className="font-black text-lg text-green-600">GREEN</span>;
                    if (score >= 75) return <span className="font-black text-lg text-amber-500">AMBER</span>;
                    return <span className="font-black text-lg text-red-600">RED</span>;
                  })()}
                </div>
              </div>
              <div className="p-3 bg-slate-100 border-t-2 border-black text-[11px] leading-tight space-y-1">
                <p className="font-extrabold text-sm underline mb-2">Scoring</p>
                <p>90% and above = <span className="text-green-600 font-bold">GREEN</span> | 75% - 89% = <span className="text-amber-500 font-bold">AMBER</span> | 0% - 75% = <span className="text-red-600 font-bold">RED</span></p>
                <p>To score – YES and N/A = 1 | No = 0</p>
                <p>Calculate the number of Yes and N/A answers and divide by 54 then multiply by 100 – this will give you an overall % of compliance.</p>
                <p className="font-bold text-black mt-2">Audit to be completed every Month by the Manager / Deputy / Care Team Leader of ALL residents.</p>
              </div>
            </div>

            {/* Questions Table */}
            <form onSubmit={handleSubmitAudit} className="space-y-6 text-xs">
              <div className="overflow-x-auto border-2 border-black rounded-sm">
                <table className="w-full text-left border-collapse min-w-[900px] text-black">
                  <tbody className="divide-y divide-black bg-white">
                    {Array.from(new Set(medicationAuditForm.questions.map(q => q.section))).map(section => (
                      <React.Fragment key={section}>
                        <tr className="bg-[#92d050] text-black border-t border-black font-extrabold select-none">
                          <th className="p-2 border-r border-black align-middle text-sm uppercase w-1/4">Standard: {section}</th>
                          <th className="p-2 border-r border-black text-center align-middle w-12">Yes</th>
                          <th className="p-2 border-r border-black text-center align-middle w-12">No</th>
                          <th className="p-2 border-r border-black text-center align-middle w-12">N/A</th>
                          <th className="p-2 border-r border-black align-middle w-1/4">Notes / Guidance</th>
                          <th className="p-2 align-middle w-1/4">Comments / Findings</th>
                        </tr>
                        {medicationAuditForm.questions.filter(q => q.section === section).map(q => {
                          const globalIdx = medicationAuditForm.questions.findIndex(item => item.id === q.id);
                          return (
                            <tr key={q.id} className="hover:bg-slate-50 text-[11px] divide-x divide-black border border-black">
                              <td className="p-2 align-top font-bold text-black border-r border-black whitespace-pre-wrap">{q.question}</td>
                              <td className="p-1 align-middle text-center border-r border-black cursor-pointer bg-white hover:bg-slate-100" onClick={() => {
                                const u = [...medicationAuditForm.questions]; u[globalIdx].status = 'YES'; setMedicationAuditForm({...medicationAuditForm, questions: u});
                              }}>
                                {q.status === 'YES' && <div className="mx-auto w-4 h-4 bg-emerald-600 rounded-full"></div>}
                              </td>
                              <td className="p-1 align-middle text-center border-r border-black cursor-pointer bg-white hover:bg-slate-100" onClick={() => {
                                const u = [...medicationAuditForm.questions]; u[globalIdx].status = 'NO'; setMedicationAuditForm({...medicationAuditForm, questions: u});
                              }}>
                                {q.status === 'NO' && <div className="mx-auto w-4 h-4 bg-rose-600 rounded-full"></div>}
                              </td>
                              <td className="p-1 align-middle text-center border-r border-black cursor-pointer bg-white hover:bg-slate-100" onClick={() => {
                                const u = [...medicationAuditForm.questions]; u[globalIdx].status = 'N/A'; setMedicationAuditForm({...medicationAuditForm, questions: u});
                              }}>
                                {q.status === 'N/A' && <div className="mx-auto w-4 h-4 bg-slate-500 rounded-full"></div>}
                              </td>
                              <td className="p-2 align-top text-slate-700 italic border-r border-black whitespace-pre-wrap">{q.notes}</td>
                              <td className="p-1 align-top bg-transparent">
                                <textarea
                                  rows="3"
                                  value={q.comments}
                                  onChange={(e) => {
                                    const u = [...medicationAuditForm.questions]; u[globalIdx].comments = e.target.value; setMedicationAuditForm({...medicationAuditForm, questions: u});
                                  }}
                                  className="w-full h-full min-h-[60px] p-1 bg-transparent border-none outline-none resize-none text-[11px] font-bold text-[#c00000] focus:ring-0"
                                  placeholder="Enter comments..."
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Scoring Summary Table Footer */}
              <div className="overflow-x-auto border-2 border-black rounded-sm mt-8 select-none">
                <table className="w-full text-left border-collapse text-black text-xs font-bold">
                  <thead>
                    <tr className="bg-[#92d050] border-b border-black">
                      <th className="p-2 border-r border-black w-1/4">Scoring Standard</th>
                      <th className="p-2 border-r border-black text-center w-1/4">Possible Score</th>
                      <th className="p-2 border-r border-black text-center w-1/4">Actual Score</th>
                      <th className="p-2 text-center w-1/4">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black bg-white">
                    {[
                      { section: "Ordering and Receiving Medicine", possible: 6 },
                      { section: "Storage", possible: 6, label: "Storage of medicine" },
                      { section: "Administration of Medicine", possible: 14, label: "Administration of medicine" },
                      { section: "Specialist Administrations", possible: 8, label: "Specialist Administration" },
                      { section: "Record Keeping / Training / policies", possible: 11, label: "Record Keeping" },
                      { section: "Dementia and Wellbeing", possible: 5 },
                      { section: "Disposal of Medication", possible: 3 },
                      { section: "Miscellaneous", possible: 1 }
                    ].map(s => {
                      const sQs = medicationAuditForm.questions.filter(q => q.section === s.section);
                      const actual = sQs.filter(q => q.status === 'YES' || q.status === 'N/A').length;
                      return (
                        <tr key={s.section}>
                          <td className="p-2 border-r border-black">{s.label || s.section}</td>
                          <td className="p-2 border-r border-black text-center">{s.possible}</td>
                          <td className="p-2 border-r border-black text-center text-[#c00000]">{actual}</td>
                          <td className="p-2 text-center text-[#c00000]">{Math.round((actual / s.possible) * 100)}%</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-black border-t-2 border-black">
                      <td className="p-2 border-r border-black uppercase text-right">Total score</td>
                      <td className="p-2 border-r border-black text-center">54</td>
                      <td className="p-2 border-r border-black text-center text-indigo-700">
                        {medicationAuditForm.questions.filter(q => q.status === 'YES' || q.status === 'N/A').length}
                      </td>
                      <td className="p-2 text-center text-indigo-700">
                        {Math.round((medicationAuditForm.questions.filter(q => q.status === 'YES' || q.status === 'N/A').length / 54) * 100)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Completion Footer */}
              <div className="mt-8 border-2 border-black p-4 bg-white text-black font-semibold text-xs space-y-4 rounded-sm select-none">
                <div className="font-extrabold uppercase border-b border-black pb-2 mb-2">Actions required following audit:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-end gap-2">
                    <span className="shrink-0 text-black">Audit Completed by:</span>
                    <input type="text" value={medicationAuditForm.completedBy} onChange={e => setMedicationAuditForm({...medicationAuditForm, completedBy: e.target.value})} className="flex-1 bg-transparent border-b border-dashed border-slate-500 outline-none px-1 font-bold text-[#c00000] text-xs" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="shrink-0 text-black">Position:</span>
                    <input type="text" value={medicationAuditForm.position} onChange={e => setMedicationAuditForm({...medicationAuditForm, position: e.target.value})} className="flex-1 bg-transparent border-b border-dashed border-slate-500 outline-none px-1 font-bold text-[#c00000] text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-end gap-2">
                    <span className="shrink-0 text-black">Signature:</span>
                    <input type="text" value={medicationAuditForm.signature} onChange={e => setMedicationAuditForm({...medicationAuditForm, signature: e.target.value})} className="flex-1 bg-transparent border-b border-dashed border-slate-500 outline-none px-1 font-bold text-[#c00000] text-xs italic" placeholder="Type signature" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="shrink-0 text-black">Date:</span>
                    <input type="date" value={medicationAuditForm.signedDate} onChange={e => setMedicationAuditForm({...medicationAuditForm, signedDate: e.target.value})} className="flex-1 bg-transparent border-b border-dashed border-slate-500 outline-none px-1 font-bold text-[#c00000] text-xs" />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                <button type="button" onClick={() => { setSelectedAudit(null); setMedicationAuditForm(null); }} className="h-10 px-6 rounded-xl border border-slate-300 font-extrabold text-slate-700 bg-white hover:bg-slate-50 hover:text-black transition-all active:scale-[0.98]">
                  Go Back
                </button>
                <button type="submit" className="h-10 px-8 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold flex items-center gap-1 shadow-md shadow-brand-500/10 active:scale-[0.98] transition-all">
                  <CheckCircle className="h-4 w-4" />
                  <span>Save & Submit Audit</span>
                </button>
              </div>
            </form>
          </div>
        ) : dailyAuditForm ? (
