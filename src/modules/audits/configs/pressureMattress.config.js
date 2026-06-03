export const pressureMattressConfig = {
  title: "Pressure Mattress Audit",
  category: "Compliance",
  frequency: "Scheduled",
  targetScore: 100, // Must be 100% (all deviations are fails)
  questions: [
    {
      "id": 1,
      "section": "Criteria for Mattress Covers",
      "question": "Is there a breach in the integrity of the mattress cover, e.g. torn or damaged?",
      "notes": "If YES, the cover has failed and must be replaced."
    },
    {
      "id": 2,
      "section": "Criteria for Mattress Covers",
      "question": "Removable mattress covers: is the mattress cover fastening compromised, e.g. is the zip or any other cover fastening device broken?",
      "notes": "If YES, the cover has failed and must be replaced."
    },
    {
      "id": 3,
      "section": "Criteria for Mattress Covers",
      "question": "Non-removable mattress covers, e.g. no zip: did the cover fail the 'Water Penetration test'?",
      "notes": "If YES, the cover has failed and must be replaced."
    },
    {
      "id": 4,
      "section": "Criteria for Mattress Covers",
      "question": "Does the mattress cover have any staining that cleaning cannot remove?",
      "notes": "If YES, the cover has failed and must be replaced."
    },
    {
      "id": 5,
      "section": "Criteria for Mattresses",
      "question": "Undo the removable cover. Is the mattress soiled or stained?",
      "notes": "If YES, the mattress has failed and must be replaced. (Not applicable to sealed mattress covers without a zip)"
    },
    {
      "id": 6,
      "section": "Criteria for Mattresses",
      "question": "Does the mattress have an offensive odour?",
      "notes": "If YES, the mattress has failed and must be replaced."
    },
    {
      "id": 7,
      "section": "Criteria for Mattresses",
      "question": "Did the mattress fail the 'hand compression assessment'?",
      "notes": "If YES, the mattress has failed and must be replaced. (Not applicable to air mattresses)"
    }
  ]
};
