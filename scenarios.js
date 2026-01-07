/**
 * NHFM Demo - Scenario Data
 */

// Patient list for AI scanning phase - expanded with full profiles
const PATIENT_LIST = [
    {
        id: "patient-1",
        initials: "M.T.",
        fullName: "Margaret Thompson",
        nhsNumber: "485 291 7634",
        age: 45,
        gender: "Female",
        summary: "Routine diabetes review",
        conditions: ["Type 2 Diabetes", "Obesity"],
        currentMeds: ["Metformin 500mg BD", "Atorvastatin 20mg OD"],
        status: "ok",
        scanResult: "No concerns identified"
    },
    {
        id: "patient-2",
        initials: "R.K.",
        fullName: "Robert Kingsley",
        nhsNumber: "732 584 1920",
        age: 72,
        gender: "Male",
        summary: "Blood pressure monitoring",
        conditions: ["Essential Hypertension", "Atrial Fibrillation"],
        currentMeds: ["Amlodipine 10mg OD", "Bisoprolol 5mg OD", "Apixaban 5mg BD"],
        status: "ok",
        scanResult: "Stable, within parameters"
    },
    {
        id: "patient-3",
        initials: "J.S.",
        fullName: "James Sullivan",
        nhsNumber: "943 476 5919",
        age: 67,
        gender: "Male",
        summary: "Recent renal function tests",
        conditions: ["Type 2 Diabetes", "Hypertension", "CKD Stage 3a", "Osteoarthritis"],
        currentMeds: ["Metformin 500mg BD", "Lisinopril 10mg OD", "Amlodipine 5mg OD", "Ibuprofen 400mg TDS"],
        status: "flagged",
        scanResult: "ALERT: Declining eGFR detected. Checking for NSAID use...",
        actionRequired: "Further information required from patient"
    },
    {
        id: "patient-4",
        initials: "A.P.",
        fullName: "Angela Patel",
        nhsNumber: "281 739 4562",
        age: 58,
        gender: "Female",
        summary: "Cholesterol check results",
        conditions: ["Hyperlipidemia", "Pre-diabetes"],
        currentMeds: ["Rosuvastatin 10mg OD"],
        status: "ok",
        scanResult: "Lipid profile acceptable"
    },
    {
        id: "patient-5",
        initials: "S.W.",
        fullName: "Sophie Williams",
        nhsNumber: "619 842 3057",
        age: 34,
        gender: "Female",
        summary: "Contraception review",
        conditions: ["None significant"],
        currentMeds: ["Desogestrel 75mcg OD"],
        status: "ok",
        scanResult: "No medication concerns"
    },
    {
        id: "patient-6",
        initials: "D.H.",
        fullName: "David Henderson",
        nhsNumber: "847 163 9284",
        age: 61,
        gender: "Male",
        summary: "Annual cardiovascular review",
        conditions: ["Ischaemic Heart Disease", "Hyperlipidemia"],
        currentMeds: ["Aspirin 75mg OD", "Atorvastatin 40mg OD", "Ramipril 5mg OD"],
        status: "ok",
        scanResult: "Medication regime appropriate"
    },
    {
        id: "patient-7",
        initials: "E.C.",
        fullName: "Eleanor Chen",
        nhsNumber: "392 517 8046",
        age: 29,
        gender: "Female",
        summary: "Asthma medication check",
        conditions: ["Moderate Persistent Asthma"],
        currentMeds: ["Salbutamol 100mcg PRN", "Beclometasone 200mcg BD"],
        status: "ok",
        scanResult: "Inhaler technique reviewed, no issues"
    },
    {
        id: "patient-8",
        initials: "P.M.",
        fullName: "Patrick Murphy",
        nhsNumber: "654 928 1375",
        age: 78,
        gender: "Male",
        summary: "Polypharmacy review",
        conditions: ["COPD", "Type 2 Diabetes", "Benign Prostatic Hyperplasia"],
        currentMeds: ["Tiotropium 18mcg OD", "Metformin 1g BD", "Tamsulosin 400mcg OD", "Salbutamol PRN"],
        status: "ok",
        scanResult: "Medications reviewed, no interactions identified"
    },
    {
        id: "patient-9",
        initials: "L.B.",
        fullName: "Linda Brooks",
        nhsNumber: "178 463 5921",
        age: 52,
        gender: "Female",
        summary: "Thyroid function monitoring",
        conditions: ["Hypothyroidism"],
        currentMeds: ["Levothyroxine 100mcg OD"],
        status: "ok",
        scanResult: "TSH within target range"
    },
    {
        id: "patient-10",
        initials: "G.R.",
        fullName: "Graham Richardson",
        nhsNumber: "523 894 7160",
        age: 69,
        gender: "Male",
        summary: "Gout flare assessment",
        conditions: ["Gout", "Hypertension", "CKD Stage 2"],
        currentMeds: ["Allopurinol 300mg OD", "Losartan 50mg OD"],
        status: "ok",
        scanResult: "Urate levels stable, no acute concerns"
    },
    {
        id: "patient-11",
        initials: "N.F.",
        fullName: "Natasha Foster",
        nhsNumber: "891 352 4687",
        age: 41,
        gender: "Female",
        summary: "Depression medication review",
        conditions: ["Major Depressive Disorder", "Generalised Anxiety"],
        currentMeds: ["Sertraline 100mg OD", "Propranolol 40mg BD PRN"],
        status: "ok",
        scanResult: "Stable on current regime"
    },
    {
        id: "patient-12",
        initials: "C.T.",
        fullName: "Christopher Taylor",
        nhsNumber: "264 718 9035",
        age: 55,
        gender: "Male",
        summary: "Post-MI follow-up",
        conditions: ["Previous MI (2023)", "Hyperlipidemia", "Hypertension"],
        currentMeds: ["Aspirin 75mg OD", "Clopidogrel 75mg OD", "Atorvastatin 80mg OD", "Ramipril 10mg OD", "Bisoprolol 2.5mg OD"],
        status: "ok",
        scanResult: "Secondary prevention optimised"
    },
    {
        id: "patient-13",
        initials: "H.J.",
        fullName: "Helen Jenkins",
        nhsNumber: "437 691 2854",
        age: 83,
        gender: "Female",
        summary: "Falls risk medication review",
        conditions: ["Osteoporosis", "Postural Hypotension", "Mild Cognitive Impairment"],
        currentMeds: ["Alendronic acid 70mg weekly", "Colecalciferol 800IU OD", "Fludrocortisone 100mcg OD"],
        status: "ok",
        scanResult: "Reviewed sedatives - none prescribed"
    },
    {
        id: "patient-14",
        initials: "B.A.",
        fullName: "Benjamin Adams",
        nhsNumber: "759 124 8361",
        age: 47,
        gender: "Male",
        summary: "Epilepsy monitoring",
        conditions: ["Focal Epilepsy"],
        currentMeds: ["Levetiracetam 500mg BD"],
        status: "ok",
        scanResult: "Seizure-free 18 months, levels therapeutic"
    },
    {
        id: "patient-15",
        initials: "F.O.",
        fullName: "Fiona O'Brien",
        nhsNumber: "612 485 7923",
        age: 36,
        gender: "Female",
        summary: "Migraine prophylaxis review",
        conditions: ["Chronic Migraine", "Medication Overuse Headache (resolved)"],
        currentMeds: ["Topiramate 50mg BD", "Sumatriptan 50mg PRN (max 2/week)"],
        status: "ok",
        scanResult: "Frequency reduced, no overuse detected"
    },
    {
        id: "patient-16",
        initials: "W.D.",
        fullName: "William Davies",
        nhsNumber: "348 972 1546",
        age: 74,
        gender: "Male",
        summary: "Parkinson's medication timing",
        conditions: ["Parkinson's Disease", "Orthostatic Hypotension"],
        currentMeds: ["Co-careldopa 25/100mg QDS", "Pramipexole 0.7mg TDS", "Midodrine 5mg TDS"],
        status: "ok",
        scanResult: "On-off fluctuations noted, neurology referral pending"
    },
    {
        id: "patient-17",
        initials: "J.L.",
        fullName: "Jennifer Lewis",
        nhsNumber: "895 236 4178",
        age: 63,
        gender: "Female",
        summary: "DMARD monitoring bloods",
        conditions: ["Rheumatoid Arthritis"],
        currentMeds: ["Methotrexate 15mg weekly", "Folic acid 5mg weekly", "Hydroxychloroquine 200mg BD"],
        status: "ok",
        scanResult: "FBC and LFTs within normal limits"
    },
    {
        id: "patient-18",
        initials: "K.M.",
        fullName: "Kenneth Morrison",
        nhsNumber: "571 843 6029",
        age: 59,
        gender: "Male",
        summary: "Sleep apnoea follow-up",
        conditions: ["Obstructive Sleep Apnoea", "Obesity", "Type 2 Diabetes"],
        currentMeds: ["Metformin 1g BD", "Empagliflozin 10mg OD"],
        status: "ok",
        scanResult: "CPAP compliance good, no medication changes"
    },
    {
        id: "patient-19",
        initials: "T.W.",
        fullName: "Teresa Walsh",
        nhsNumber: "234 687 9415",
        age: 71,
        gender: "Female",
        summary: "Anticoagulation review",
        conditions: ["Atrial Fibrillation", "Previous TIA"],
        currentMeds: ["Rivaroxaban 20mg OD", "Atenolol 50mg OD"],
        status: "ok",
        scanResult: "CHA2DS2-VASc reviewed, anticoagulation appropriate"
    },
    {
        id: "patient-20",
        initials: "M.G.",
        fullName: "Michael Green",
        nhsNumber: "768 319 5247",
        age: 44,
        gender: "Male",
        summary: "IBD flare assessment",
        conditions: ["Crohn's Disease"],
        currentMeds: ["Azathioprine 150mg OD", "Mesalazine 2.4g OD"],
        status: "ok",
        scanResult: "Inflammatory markers stable"
    },
    {
        id: "patient-21",
        initials: "R.S.",
        fullName: "Rebecca Stevens",
        nhsNumber: "429 875 3168",
        age: 38,
        gender: "Female",
        summary: "ADHD medication review",
        conditions: ["ADHD - Adult onset"],
        currentMeds: ["Lisdexamfetamine 50mg OD"],
        status: "ok",
        scanResult: "Titration complete, stable on current dose"
    },
    {
        id: "patient-22",
        initials: "A.H.",
        fullName: "Andrew Hughes",
        nhsNumber: "183 546 7920",
        age: 66,
        gender: "Male",
        summary: "Prostate cancer hormone therapy",
        conditions: ["Prostate Cancer", "Osteopenia"],
        currentMeds: ["Leuprorelin 3-monthly injection", "Denosumab 6-monthly", "Colecalciferol 800IU OD"],
        status: "ok",
        scanResult: "PSA stable, bone protection in place"
    },
    {
        id: "patient-23",
        initials: "S.P.",
        fullName: "Samantha Price",
        nhsNumber: "647 218 9534",
        age: 31,
        gender: "Female",
        summary: "Pre-conception medication review",
        conditions: ["Bipolar Disorder Type II"],
        currentMeds: ["Lamotrigine 200mg OD"],
        status: "ok",
        scanResult: "Lamotrigine suitable, folic acid 5mg advised"
    },
    {
        id: "patient-24",
        initials: "V.N.",
        fullName: "Victor Nguyen",
        nhsNumber: "912 374 6851",
        age: 57,
        gender: "Male",
        summary: "Hepatitis B monitoring",
        conditions: ["Chronic Hepatitis B"],
        currentMeds: ["Entecavir 0.5mg OD"],
        status: "ok",
        scanResult: "Viral load undetectable, LFTs normal"
    },
    {
        id: "patient-25",
        initials: "I.C.",
        fullName: "Irene Campbell",
        nhsNumber: "358 791 4263",
        age: 82,
        gender: "Female",
        summary: "Heart failure optimisation",
        conditions: ["Heart Failure (HFrEF)", "Chronic Kidney Disease Stage 3b"],
        currentMeds: ["Bisoprolol 10mg OD", "Ramipril 2.5mg OD", "Furosemide 40mg OD", "Spironolactone 25mg OD"],
        status: "ok",
        scanResult: "Stable, SGLT2i considered but eGFR borderline"
    }
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
        { id: "p1", role: "assistant", text: "Hello. I'm the NHS National Health Foundation Model contacting you regarding some routine screening. Can I confirm I'm speaking with James Sullivan, date of birth 15th March 1957?", delayMs: 800 },
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
            { text: "Regular NSAID use: Ibuprofen 400mg TDS x 2 weeks", source: "patient chat" },
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
            patientMessageDraft: "We have arranged a follow-up blood test in 2 weeks to check your kidney function. You will receive an appointment notification.",
            // Modified version after clinician review
            modifiedTitle: "Schedule renal function recheck in 1 week",
            modifiedPatientMessageDraft: "We have arranged a follow-up blood test in 1 week to check your kidney function. You will receive an appointment notification."
        }
    ],

    auditEvents: [
        { trigger: "scan", actor: "NHFM", text: "Medication safety alert generated: NSAID use in CKD patient", time: "06 Jan, 09:15" },
        { trigger: "patientStart", actor: "NHFM", text: "Patient engagement initiated via NHS App", time: "06 Jan, 09:15" },
        { trigger: "patientEnd", actor: "NHFM", text: "Patient confirmed OTC ibuprofen use (400mg TDS x 2 weeks)", time: "06 Jan, 10:52" },
        { trigger: "clinicianStart", actor: "NHFM", text: "Case escalated to clinician for review", time: "06 Jan, 10:52" },
        { trigger: "issueAgreed", actor: "Clinician", text: "Clinician agreed with flagged issue assessment", time: "06 Jan, 14:32" },
        { trigger: "action1Approved", actor: "Clinician", text: "Approved: Advise patient to discontinue NSAID", time: "06 Jan, 14:33" },
        { trigger: "action2Modified", actor: "Clinician", text: "Modified: Schedule renal function recheck (2 weeks → 1 week)", time: "06 Jan, 14:34" },
        { trigger: "execute1", actor: "NHFM", text: "Patient notification sent via NHS App", time: "06 Jan, 14:34" },
        { trigger: "patientConfirmStop", actor: "Patient", text: "Patient confirmed: Will stop taking ibuprofen", time: "07 Jan, 10:36" },
        { trigger: "execute2", actor: "NHFM", text: "Pathology order placed for 1-week follow-up", time: "07 Jan, 10:36" },
        { trigger: "patientBookedAppt", actor: "Patient", text: "Patient booked blood test: 13 Jan, 09:15 at Parkside Medical Centre", time: "07 Jan, 10:38" },
        { trigger: "complete", actor: "NHFM", text: "Workflow complete. Case closed.", time: "07 Jan, 10:40" }
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
