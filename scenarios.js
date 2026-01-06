/**
 * MedGuard Demo - Scenario Data
 */

// Patient list for AI scanning phase
const PATIENT_LIST = [
    { id: "patient-1", initials: "M.T.", age: 45, summary: "Routine diabetes review", status: "ok", scanResult: "No concerns identified" },
    { id: "patient-2", initials: "R.K.", age: 72, summary: "Blood pressure monitoring", status: "ok", scanResult: "Stable, within parameters" },
    { id: "patient-3", initials: "J.S.", age: 67, summary: "Recent renal function tests", status: "flagged", scanResult: "ALERT: Declining eGFR + NSAID use detected" },
    { id: "patient-4", initials: "A.P.", age: 58, summary: "Cholesterol check results", status: "ok", scanResult: "Lipid profile acceptable" },
    { id: "patient-5", initials: "S.W.", age: 34, summary: "Contraception review", status: "ok", scanResult: "No medication concerns" }
];

const NSAID_CKD_SCENARIO = {
    id: "nsaid-ckd-001",
    name: "NSAID Use with Declining Renal Function",
    flaggedPatientId: "patient-3",

    patient: {
        initials: "J.S.",
        age: 67,
        gender: "Male",
        nhsNumber: "943 476 5919",
        conditions: ["Type 2 Diabetes", "Hypertension", "CKD Stage 3a", "Osteoarthritis"],
        meds: [
            { name: "Metformin", dose: "500mg", frequency: "BD" },
            { name: "Lisinopril", dose: "10mg", frequency: "OD" },
            { name: "Amlodipine", dose: "5mg", frequency: "OD" },
            { name: "Ibuprofen", dose: "400mg", frequency: "TDS", flagged: true }
        ],
        allergies: ["Penicillin"],
        labs: [
            { name: "eGFR", value: "48", unit: "mL/min", date: "02-Jan-2024", flag: "low" },
            { name: "eGFR", value: "54", unit: "mL/min", date: "15-Oct-2023", flag: "low" },
            { name: "Creatinine", value: "118", unit: "μmol/L", date: "02-Jan-2024", flag: "high" }
        ]
    },

    // Streamlined patient chat (5 messages)
    patientChat: [
        { id: "p1", role: "assistant", text: "Hello. I'm the NHS Medication Safety Assistant contacting you about some recent test results. Can I confirm I'm speaking with J.S., date of birth 15th March 1957?", delayMs: 800 },
        { id: "p2", role: "patient", text: "Yes, that's me. Is everything okay?" },
        { id: "p3", role: "assistant", text: "Your recent blood test showed some changes we'd like to understand better. Are you currently taking any pain relief medications - either prescribed or bought over the counter?", delayMs: 900 },
        { id: "p4", role: "patient", text: "I've been taking ibuprofen from the chemist for my knee pain. About 3 times a day for the past couple of weeks." },
        { id: "p5", role: "assistant", text: "Thank you for letting me know. I've noted this and a clinician will review it today. They may be in touch with advice. If you feel unwell, please contact your GP or call 111.", delayMs: 800 }
    ],

    // Issue for clinician review
    issue: {
        title: "Potential NSAID-induced nephrotoxicity",
        description: "Patient with CKD Stage 3a showing declining eGFR (58→48 over 6 months) while taking regular ibuprofen. Concurrent ACE inhibitor (Lisinopril) increases nephrotoxicity risk.",
        evidence: [
            "eGFR declined 10 points (58→48) in 6 months",
            "Regular NSAID use: Ibuprofen 400mg TDS x 2 weeks",
            "Concurrent Lisinopril increases nephrotoxicity risk",
            "NICE CKD guidelines: avoid NSAIDs in Stage 3+"
        ]
    },

    // Actions for clinician approval
    actions: [
        {
            id: "action-1",
            title: "Advise patient to discontinue NSAID",
            impact: "HIGH",
            rationale: "Ibuprofen is likely contributing to declining renal function.",
            evidence: ["NSAID contraindicated in CKD Stage 3+", "Expected improvement within 1-2 weeks if drug-induced"],
            patientMessageDraft: "Following review of your blood tests, your GP advises stopping ibuprofen as it may affect your kidneys. Try paracetamol instead. We'll discuss other options for your knee pain."
        },
        {
            id: "action-2",
            title: "Schedule renal function recheck in 2 weeks",
            impact: "MEDIUM",
            rationale: "Monitor for eGFR stabilisation after NSAID cessation.",
            evidence: ["Repeat eGFR needed to confirm cause", "Early detection if decline continues"],
            patientMessageDraft: "We have arranged a follow-up blood test in 2 weeks to check your kidney function. You will receive an appointment notification."
        }
    ],

    auditEvents: [
        { trigger: "scan", actor: "System", text: "Medication safety alert generated: NSAID use in CKD patient" },
        { trigger: "patientStart", actor: "Assistant", text: "Patient engagement initiated via NHS App" },
        { trigger: "patientEnd", actor: "Assistant", text: "Patient confirmed OTC ibuprofen use (400mg TDS x 2 weeks)" },
        { trigger: "clinicianStart", actor: "System", text: "Case escalated to clinician for review" },
        { trigger: "issueAgreed", actor: "Clinician", text: "Clinician agreed with flagged issue assessment" },
        { trigger: "action1Approved", actor: "Clinician", text: "Approved: Advise patient to discontinue NSAID" },
        { trigger: "action2Approved", actor: "Clinician", text: "Approved: Schedule renal function recheck" },
        { trigger: "execute1", actor: "System", text: "Patient notification sent via NHS App" },
        { trigger: "execute2", actor: "System", text: "Pathology order placed for 2-week follow-up" },
        { trigger: "complete", actor: "System", text: "Workflow complete. Case closed." }
    ],

    guardrails: [
        "No medication changes without clinician approval",
        "No clinical advice given directly to patient",
        "No prescriptions issued or modified",
        "All actions required human approval"
    ],

    dataAccessed: [
        { item: "Patient demographics", code: "NHS-PDS" },
        { item: "GP medication record", code: "GP-MED-01" },
        { item: "Laboratory results", code: "PATH-RENAL" },
        { item: "Problem list", code: "GP-PROB-01" }
    ]
};

const SCENARIOS = [NSAID_CKD_SCENARIO];
