/**
 * MedGuard Demo - Scenario Data
 *
 * HOW TO ADD NEW SCENARIOS:
 * 1. Copy the scenario template below
 * 2. Give it a unique id (e.g., "duplicate-therapy-002")
 * 3. Fill in patient details, chat scripts, actions, and audit events
 * 4. Add it to the SCENARIOS array at the bottom
 * 5. The scenario will appear in the dropdown automatically
 */

// Patient list for AI scanning phase (Phase 1)
// These patients are shown during the "AI Review" phase
// The flaggedPatientId indicates which one gets flagged
const PATIENT_LIST = [
    {
        id: "patient-1",
        initials: "M.T.",
        age: 45,
        summary: "Routine diabetes review",
        status: "ok",
        scanResult: "No concerns identified"
    },
    {
        id: "patient-2",
        initials: "R.K.",
        age: 72,
        summary: "Blood pressure monitoring",
        status: "ok",
        scanResult: "Stable, within parameters"
    },
    {
        id: "patient-3",
        initials: "J.S.",
        age: 67,
        summary: "Recent renal function tests",
        status: "flagged",
        scanResult: "ALERT: Declining eGFR + NSAID use detected"
    },
    {
        id: "patient-4",
        initials: "A.P.",
        age: 58,
        summary: "Cholesterol check results",
        status: "ok",
        scanResult: "Lipid profile acceptable"
    },
    {
        id: "patient-5",
        initials: "S.W.",
        age: 34,
        summary: "Contraception review",
        status: "ok",
        scanResult: "No medication concerns"
    }
];

// Scenario: NSAID Use with Declining Renal Function
const NSAID_CKD_SCENARIO = {
    id: "nsaid-ckd-001",
    name: "NSAID Use with Declining Renal Function",

    // Which patient from the list is the focus of this scenario
    flaggedPatientId: "patient-3",

    // Patient demographics and clinical summary
    patient: {
        initials: "J.S.",
        age: 67,
        gender: "Male",
        nhsNumber: "943 476 5919",
        conditions: [
            "Type 2 Diabetes (diagnosed 2018)",
            "Hypertension (diagnosed 2015)",
            "CKD Stage 3a (diagnosed 2023)",
            "Osteoarthritis - bilateral knees"
        ],
        meds: [
            { name: "Metformin", dose: "500mg", frequency: "BD", type: "prescribed" },
            { name: "Lisinopril", dose: "10mg", frequency: "OD", type: "prescribed" },
            { name: "Amlodipine", dose: "5mg", frequency: "OD", type: "prescribed" },
            { name: "Ibuprofen", dose: "400mg", frequency: "TDS", type: "OTC", flagged: true }
        ],
        allergies: ["Penicillin (rash)"],
        labs: [
            { name: "eGFR", value: "48", unit: "mL/min/1.73m²", date: "02-Jan-2024", flag: "low", trend: "declining" },
            { name: "eGFR", value: "54", unit: "mL/min/1.73m²", date: "15-Oct-2023", flag: "low", trend: null },
            { name: "eGFR", value: "58", unit: "mL/min/1.73m²", date: "20-Jul-2023", flag: "borderline", trend: null },
            { name: "Creatinine", value: "118", unit: "μmol/L", date: "02-Jan-2024", flag: "high", trend: null },
            { name: "HbA1c", value: "52", unit: "mmol/mol", date: "02-Jan-2024", flag: "normal", trend: null },
            { name: "BP", value: "142/88", unit: "mmHg", date: "02-Jan-2024", flag: "elevated", trend: null }
        ]
    },

    // Patient chat script - each message appears in order when "Next" is clicked
    patientChat: [
        {
            id: "p1",
            role: "assistant",
            text: "Hello. I'm the NHS Medication Safety Assistant. I'm contacting you on behalf of your GP surgery about some recent test results. Before we continue, can I confirm I'm speaking with J.S., date of birth 15th March 1957?",
            delayMs: 1000
        },
        {
            id: "p2",
            role: "patient",
            text: "Yes, that's me. Is everything okay?",
            delayMs: 0
        },
        {
            id: "p3",
            role: "assistant",
            text: "Thank you for confirming. Your recent blood test from 2nd January showed some changes in your kidney function that your clinical team would like to look into further. I have a few questions to help them understand more. Is now a good time?",
            delayMs: 1100
        },
        {
            id: "p4",
            role: "patient",
            text: "Yes, go ahead. What's wrong with my kidneys?",
            delayMs: 0
        },
        {
            id: "p5",
            role: "assistant",
            text: "Your kidneys are still working, but the tests show they may be under a bit more strain than before. Some medications can affect kidney function, so I'd like to ask about any pain relief you might be taking. Are you currently using any painkillers - either prescribed or bought over the counter?",
            delayMs: 1200
        },
        {
            id: "p6",
            role: "patient",
            text: "I've been taking ibuprofen for my knee pain. I get it from the chemist.",
            delayMs: 0
        },
        {
            id: "p7",
            role: "assistant",
            text: "Thank you for letting me know. Can you tell me how often you take the ibuprofen, and for how long you've been using it regularly?",
            delayMs: 900
        },
        {
            id: "p8",
            role: "patient",
            text: "I take 2 tablets, three times a day. Been doing that for about 2 weeks now because my knees have been really bad.",
            delayMs: 0
        },
        {
            id: "p9",
            role: "assistant",
            text: "I understand - knee pain can be very difficult to manage. Thank you for that information. I also want to check: have you noticed any other symptoms recently, such as swelling in your ankles or feet, changes in how often you pass urine, or any nausea?",
            delayMs: 1100
        },
        {
            id: "p10",
            role: "patient",
            text: "Now you mention it, my ankles have been a bit puffy the last few days. I thought it was just the cold weather.",
            delayMs: 0
        },
        {
            id: "p11",
            role: "assistant",
            text: "That's helpful to know. I've noted the ankle swelling and will include this in the summary for your clinical team. A clinician will review all of this information and may be in touch with further advice. They may want to discuss alternative options for managing your knee pain that are gentler on your kidneys.",
            delayMs: 1200
        },
        {
            id: "p12",
            role: "patient",
            text: "Should I stop taking the ibuprofen now?",
            delayMs: 0
        },
        {
            id: "p13",
            role: "assistant",
            text: "I'm not able to advise you to stop or change any medication - that decision needs to come from a clinician who can review your full medical picture. However, I've flagged this as a priority for review. Someone from the practice should be in contact within the next 24 hours. If your symptoms get worse, or you feel unwell, please contact your GP or call 111.",
            delayMs: 1000
        },
        {
            id: "p14",
            role: "patient",
            text: "Okay, thank you for explaining. I'll wait to hear from them.",
            delayMs: 0
        },
        {
            id: "p15",
            role: "assistant",
            text: "You're welcome. To summarise: I've recorded that you've been taking ibuprofen 400mg three times daily for two weeks, and that you've noticed some ankle swelling. This information will be reviewed by a clinician today. Is there anything else you'd like me to note before I send this through?",
            delayMs: 1100
        },
        {
            id: "p16",
            role: "patient",
            text: "No, I think that covers it. Thanks for checking in.",
            delayMs: 0
        },
        {
            id: "p17",
            role: "assistant",
            text: "Thank you, J.S. Take care, and you'll hear from the practice soon.",
            delayMs: 800
        }
    ],

    // Clinician chat script
    clinicianChat: [
        {
            id: "c1",
            role: "system",
            text: "PRIORITY REVIEW: Patient J.S. (67M) flagged for potential NSAID-induced nephrotoxicity. eGFR declined from 58 to 48 over 6 months. Patient confirms regular ibuprofen use (400mg TDS x 2 weeks) and reports new ankle oedema.",
            delayMs: 0
        },
        {
            id: "c2",
            role: "clinician",
            text: "Why was this case flagged as priority?",
            delayMs: 0
        },
        {
            id: "c3",
            role: "assistant",
            text: "This case meets multiple alert criteria:\n\n1. **eGFR decline >10 points in 6 months** (58 → 48 mL/min)\n2. **Active NSAID use in CKD Stage 3** - ibuprofen is contraindicated\n3. **New symptom** - ankle oedema may indicate fluid retention\n4. **Concurrent ACE inhibitor** - Lisinopril + NSAID increases nephrotoxicity risk\n\nConfidence: High that NSAID is contributing factor. However, other causes of AKI should be considered.",
            delayMs: 1200
        },
        {
            id: "c4",
            role: "clinician",
            text: "Show me the eGFR trend.",
            delayMs: 0
        },
        {
            id: "c5",
            role: "assistant",
            text: "**eGFR Trend (last 12 months):**\n\n| Date | eGFR | Stage |\n|------|------|-------|\n| Jul 2023 | 58 | 3a |\n| Oct 2023 | 54 | 3a |\n| Jan 2024 | 48 | 3a |\n\n**Trajectory:** Declining at ~5 points per quarter. If this continues, patient would reach Stage 3b (eGFR <45) within 2-3 months. NSAID cessation typically stabilises or improves function within 1-2 weeks if drug-induced.",
            delayMs: 1000
        },
        {
            id: "c6",
            role: "clinician",
            text: "What are the alternative pain management options for this patient?",
            delayMs: 0
        },
        {
            id: "c7",
            role: "assistant",
            text: "**Alternatives for OA knee pain in CKD Stage 3:**\n\n*Preferred options:*\n- **Paracetamol** 1g QDS (renal-safe first line)\n- **Topical NSAIDs** - e.g., ibuprofen gel (minimal systemic absorption)\n- **Topical capsaicin** for localised pain\n\n*Second-line (with caution):*\n- **Low-dose codeine** - avoid if eGFR <30\n- **Physiotherapy referral** for knee strengthening\n\n*Not recommended:*\n- Oral NSAIDs (current)\n- High-dose opioids\n\nNote: Final prescribing decision rests with you. I have not made any recommendations to the patient.",
            delayMs: 1100
        },
        {
            id: "c8",
            role: "clinician",
            text: "Has the patient been advised to stop the ibuprofen?",
            delayMs: 0
        },
        {
            id: "c9",
            role: "assistant",
            text: "**No.** The patient asked if they should stop the ibuprofen, and I explicitly informed them that I cannot advise stopping or changing medication - that decision must come from a clinician.\n\nI told them:\n- A clinician would review and be in touch within 24 hours\n- To contact the GP or 111 if symptoms worsen\n\nThe patient is awaiting your guidance.",
            delayMs: 900
        }
    ],

    // Proposed actions for clinician approval
    actions: [
        {
            id: "action-1",
            title: "Advise patient to discontinue NSAID",
            impact: "HIGH",
            rationale: "Ibuprofen is likely contributing to declining renal function and fluid retention. Cessation is first-line intervention for suspected NSAID-induced nephrotoxicity.",
            evidence: [
                "eGFR declined 10 points (58→48) over 6 months",
                "NICE CKD guidelines: avoid NSAIDs in Stage 3+",
                "New ankle oedema consistent with fluid retention",
                "Concurrent ACE inhibitor increases risk"
            ],
            patientMessageDraft: "Following review of your recent blood tests and our conversation, your GP has advised that you should stop taking ibuprofen. This type of painkiller can affect kidney function. Your GP suggests trying paracetamol instead (up to 2 tablets, 4 times daily) and will be in touch to discuss other options for your knee pain. If your pain is not controlled, or you have any concerns, please contact the surgery.",
            status: "pending",
            feedbackText: "Please also include advice about topical ibuprofen gel as an alternative."
        },
        {
            id: "action-2",
            title: "Schedule renal function recheck",
            impact: "MEDIUM",
            rationale: "Repeat eGFR in 2 weeks to confirm stabilisation or improvement after NSAID cessation. Earlier review if symptoms worsen.",
            evidence: [
                "Expected eGFR recovery within 1-2 weeks if NSAID-induced",
                "Monitoring needed to exclude other causes of AKI",
                "Patient has new symptoms (oedema) requiring follow-up"
            ],
            patientMessageDraft: "We have booked a follow-up blood test for you in 2 weeks to check your kidney function. You will receive a separate appointment notification. Please attend even if you are feeling well.",
            status: "pending",
            feedbackText: "Consider adding a BP check to the follow-up appointment."
        }
    ],

    // Audit trail template - events are triggered at specific points
    auditTemplate: [
        {
            id: "audit-1",
            trigger: "onLoad",
            actor: "System",
            text: "Medication safety alert generated: NSAID use detected in patient with CKD Stage 3a and declining eGFR",
            details: "Trigger: Automated lab result review. eGFR 48 mL/min (previous 54). Active prescription query returned ibuprofen 400mg from patient medication record."
        },
        {
            id: "audit-2",
            trigger: "onPatientChatStart",
            actor: "Assistant",
            text: "Patient engagement initiated via NHS App messaging",
            details: "Identity verified using DOB confirmation. Patient consented to conversation."
        },
        {
            id: "audit-3",
            trigger: "onPatientChatStep",
            stepIndex: 5,
            actor: "Assistant",
            text: "OTC medication use identified: Ibuprofen 400mg TDS",
            details: "Patient disclosed regular ibuprofen use not recorded in GP system. Duration: 2 weeks."
        },
        {
            id: "audit-4",
            trigger: "onPatientChatStep",
            stepIndex: 9,
            actor: "Assistant",
            text: "New symptom reported: bilateral ankle oedema",
            details: "Patient reports ankle swelling for several days. Consistent with fluid retention."
        },
        {
            id: "audit-5",
            trigger: "onPatientChatComplete",
            actor: "Assistant",
            text: "Patient information gathering complete. Summary prepared for clinical review.",
            details: "Data collected: OTC medication history, symptom assessment. No clinical advice given to patient."
        },
        {
            id: "audit-6",
            trigger: "onClinicianReviewStart",
            actor: "System",
            text: "Case escalated to clinician queue for review",
            details: "Priority: High. Assigned to duty GP for same-day review."
        },
        {
            id: "audit-7",
            trigger: "onActionApprove",
            actionId: "action-1",
            actor: "Clinician",
            text: "Action approved: Advise patient to discontinue NSAID",
            details: "Clinician reviewed evidence and approved patient communication."
        },
        {
            id: "audit-8",
            trigger: "onActionApprove",
            actionId: "action-2",
            actor: "Clinician",
            text: "Action approved: Schedule renal function recheck in 2 weeks",
            details: "Follow-up blood test ordered."
        },
        {
            id: "audit-9",
            trigger: "onExecute",
            actionId: "action-1",
            actor: "System",
            text: "Patient notification sent via NHS App",
            details: "Message delivered advising NSAID discontinuation and paracetamol alternative."
        },
        {
            id: "audit-10",
            trigger: "onExecute",
            actionId: "action-2",
            actor: "System",
            text: "Pathology order placed: U&E + eGFR",
            details: "Appointment request sent to phlebotomy service for 2-week follow-up."
        },
        {
            id: "audit-11",
            trigger: "onComplete",
            actor: "System",
            text: "Workflow complete. Case closed.",
            details: "All approved actions executed. Audit trail preserved."
        }
    ],

    // Guardrails - what the system explicitly did NOT do
    guardrails: [
        "No medication changes made without clinician approval",
        "No clinical advice given directly to patient",
        "No prescriptions issued or modified",
        "Patient explicitly informed that clinician review required",
        "All actions required human approval before execution"
    ],

    // Data accessed during this workflow
    dataAccessed: [
        { item: "Patient demographics", code: "NHS-PDS", date: "06-Jan-2024" },
        { item: "GP medication record", code: "GP-MED-01", date: "06-Jan-2024" },
        { item: "Laboratory results (eGFR, Creatinine)", code: "PATH-RENAL", date: "02-Jan-2024" },
        { item: "Problem list / conditions", code: "GP-PROB-01", date: "06-Jan-2024" },
        { item: "Allergy record", code: "GP-ALLERGY", date: "06-Jan-2024" }
    ]
};

// Export all scenarios as an array
const SCENARIOS = [
    NSAID_CKD_SCENARIO
    // Add more scenarios here:
    // DUPLICATE_THERAPY_SCENARIO,
    // DRUG_INTERACTION_SCENARIO,
];

/**
 * SCENARIO TEMPLATE - Copy this to create a new scenario
 *
const NEW_SCENARIO = {
    id: "unique-id-here",
    name: "Scenario Display Name",
    patient: {
        initials: "A.B.",
        age: 0,
        gender: "Male/Female",
        nhsNumber: "000 000 0000",
        conditions: [],
        meds: [],
        allergies: [],
        labs: []
    },
    patientChat: [
        { id: "p1", role: "assistant", text: "...", delayMs: 1000 },
        { id: "p2", role: "patient", text: "...", delayMs: 0 }
    ],
    clinicianChat: [
        { id: "c1", role: "system", text: "...", delayMs: 0 },
        { id: "c2", role: "clinician", text: "...", delayMs: 0 },
        { id: "c3", role: "assistant", text: "...", delayMs: 1000 }
    ],
    actions: [
        {
            id: "action-1",
            title: "Action title",
            impact: "HIGH/MEDIUM/LOW",
            rationale: "Why this action",
            evidence: ["Point 1", "Point 2"],
            patientMessageDraft: "Message to send...",
            status: "pending",
            feedbackText: "Pre-scripted feedback for 'Needs Changes'"
        }
    ],
    auditTemplate: [
        { id: "audit-1", trigger: "onLoad", actor: "System", text: "...", details: "..." }
    ],
    guardrails: [],
    dataAccessed: []
};
*/
