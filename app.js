/**
 * MedGuard Demo - Auto-Play with Simulated Mouse
 */

// Timeline steps definition (21 total)
const TIMELINE_STEPS = [
    // Phase 1: AI Scanning (5 steps)
    { id: 'scan-start', phase: 1, label: 'Scan Start' },
    { id: 'scan-p1', phase: 1, label: 'Patient 1' },
    { id: 'scan-p2', phase: 1, label: 'Patient 2' },
    { id: 'scan-flagged', phase: 1, label: 'Flagged' },
    { id: 'info-required', phase: 1, label: 'Info Required' },
    // Phase 2: Patient Chat (6 steps)
    { id: 'chat-start', phase: 2, label: 'Chat Start' },
    { id: 'chat-m1', phase: 2, label: 'Greeting' },
    { id: 'chat-m2', phase: 2, label: 'Confirm ID' },
    { id: 'chat-m3', phase: 2, label: 'Ask Meds' },
    { id: 'chat-m4', phase: 2, label: 'Ibuprofen' },
    { id: 'chat-m5', phase: 2, label: 'Noted' },
    // Phase 3: Clinician Review (4 steps)
    { id: 'review-start', phase: 3, label: 'Review' },
    { id: 'issue-agreed', phase: 3, label: 'Agreed' },
    { id: 'action1-approved', phase: 3, label: 'Action 1' },
    { id: 'action2-approved', phase: 3, label: 'Action 2' },
    // Phase 4: Execution (6 steps)
    { id: 'exec-start', phase: 4, label: 'Execute' },
    { id: 'notify-1', phase: 4, label: 'Notify 1' },
    { id: 'outcome-1', phase: 4, label: 'Msg 1' },
    { id: 'notify-2', phase: 4, label: 'Notify 2' },
    { id: 'outcome-2', phase: 4, label: 'Msg 2' },
    { id: 'complete', phase: 4, label: 'Complete' }
];

const state = {
    phase: 1,
    stepIndex: 0,
    scanIndex: -1,
    chatIndex: 0,
    outcomeIndex: 0,
    issueDecided: false,
    actionsStatus: {},
    auditEvents: [],
    isPlaying: false,
    isPaused: false,
    pauseResolve: null,
    scenario: null,
    // Patient response buttons state
    patientResponses: {
        understood: false,
        appointmentBooked: false
    }
};

// Simulated cursor element
let cursor = null;

function init() {
    state.scenario = SCENARIOS[0];
    state.scenario.actions.forEach(a => state.actionsStatus[a.id] = 'pending');

    // Create simulated cursor
    cursor = document.createElement('div');
    cursor.className = 'sim-cursor';
    document.body.appendChild(cursor);

    // Initialize commentary system
    CommentarySystem.init();

    document.getElementById('btn-play').addEventListener('click', handlePlayClick);
    document.getElementById('btn-reset').addEventListener('click', resetDemo);

    // Timeline marker click handlers
    document.querySelectorAll('.timeline-marker').forEach(marker => {
        marker.addEventListener('click', () => {
            const step = parseInt(marker.dataset.step);
            jumpToStep(step);
        });
    });

    render();
}

function resetDemo() {
    state.phase = 1;
    state.stepIndex = 0;
    state.scanIndex = -1;
    state.chatIndex = 0;
    state.outcomeIndex = 0;
    state.issueDecided = false;
    state.actionsStatus = {};
    state.scenario.actions.forEach(a => state.actionsStatus[a.id] = 'pending');
    state.auditEvents = [];
    state.isPlaying = false;
    state.isPaused = false;
    state.pauseResolve = null;
    state.patientResponses = { understood: false, appointmentBooked: false };
    cursor.classList.remove('visible');
    // Hide iPhone overlay
    const overlay = document.getElementById('iphone-overlay');
    const iphone = document.getElementById('iphone-mockup');
    if (overlay) overlay.classList.remove('visible');
    if (iphone) iphone.classList.remove('visible');
    // Hide commentary and cancel any pending wait
    CommentarySystem.cancelWait();
    CommentarySystem.hide();
    updatePlayPauseButton();
    render();
}

// Helper to wait for commentary Next button if commentary is shown
async function waitForCommentary() {
    // Small delay to let commentary appear
    await new Promise(resolve => setTimeout(resolve, 150));
    if (CommentarySystem.enabled && CommentarySystem.bubbleElement.classList.contains('visible')) {
        await CommentarySystem.waitForNext();
    }
}

function handlePlayClick() {
    if (state.isPlaying) {
        togglePause();
    } else {
        startDemo();
    }
}

async function startDemo() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    state.isPaused = false;
    updatePlayPauseButton();

    try {
        const overlay = document.getElementById('iphone-overlay');
        const iphone = document.getElementById('iphone-mockup');
        const startPhase = state.phase;

        // Phase 1: AI Scanning (no cursor) - skip if already past
        if (startPhase <= 1) {
            await runPhase1();
        }

        // Phase 2: Patient Chat - skip if already past
        if (startPhase <= 2) {
            state.phase = 2;
            renderPhaseProgress();
            updateStatus();

            // Show iPhone (always needed for Phase 2)
            if (overlay) overlay.classList.add('visible');
            if (startPhase < 2) await delay(300); // 200 * 1.5
            if (iphone) iphone.classList.add('visible');
            if (startPhase < 2) await delay(900); // 600 * 1.5

            await runPhase2();

            if (iphone) iphone.classList.remove('visible');
            await delay(600); // 400 * 1.5
            if (overlay) overlay.classList.remove('visible');
            await delay(600); // 400 * 1.5
        }

        // Phase 3: Clinician Review (with cursor) - skip if already past
        if (startPhase <= 3) {
            state.phase = 3;
            render();
            await delay(900); // 600 * 1.5
            cursor.classList.add('visible');
            await runPhase3();
            cursor.classList.remove('visible');
        }

        // Phase 4: Execution (no cursor)
        if (startPhase <= 4) {
            state.phase = 4;
            render();
            await delay(750); // 500 * 1.5
            await runPhase4();
        }

        state.isPlaying = false;
        state.isPaused = false;
        updatePlayPauseButton();
    } catch (e) {
        // Demo was stopped (e.g., by jumpToStep) - silently exit
        if (e.message !== 'Demo stopped') throw e;
    }
}

// ========== PHASE 1: AI SCANNING ==========
async function runPhase1() {
    const startStep = state.stepIndex;

    // Only init if starting fresh
    if (startStep <= 0) {
        state.stepIndex = 0;
        addAudit('scan');
        render();
        await waitForCommentary();
    }

    // Start from current position (or 0 if before this phase)
    const startPatient = Math.max(0, startStep - 1);

    for (let i = startPatient; i < PATIENT_LIST.length; i++) {
        state.scanIndex = i;
        state.stepIndex = i + 1;
        render();

        // Keep scanning speed normal for OK patients
        await delay(1000);

        if (PATIENT_LIST[i].status === 'flagged') {
            await waitForCommentary(); // Step 3: flagged
            await delay(2250); // 1500 * 1.5
            // Show "info required" step
            state.stepIndex = 4; // info-required
            render();
            await waitForCommentary(); // Step 4: info-required
            await delay(2250); // 1500 * 1.5
            break;
        }
    }

    await delay(750); // 500 * 1.5
}

// ========== PHASE 2: PATIENT CHAT ==========
async function runPhase2() {
    const startStep = state.stepIndex;

    // Only init if starting fresh in this phase
    if (startStep <= 5) {
        state.stepIndex = 5;
        addAudit('patientStart');
        render();
    }

    const messages = state.scenario.patientChat;
    // Start from current message (steps 6-10 map to messages 0-4)
    const startMsg = startStep <= 5 ? 0 : Math.min(startStep - 6, messages.length - 1);

    for (let i = startMsg; i < messages.length; i++) {
        const msg = messages[i];

        if (msg.role === 'assistant') {
            showTyping(true);
            await delay((msg.delayMs || 1200) * 1.5);
            showTyping(false);
        }

        state.chatIndex = i + 1;
        state.stepIndex = 6 + i;
        render();
        scrollToBottom('chat-container');

        // Check for commentary at step 8 (critical information about ibuprofen)
        if (state.stepIndex === 8) {
            await waitForCommentary();
        }

        await delay(1800); // 1200 * 1.5
    }

    addAudit('patientEnd');
    await delay(2700); // 1800 * 1.5
}

// ========== PHASE 3: CLINICIAN REVIEW ==========
async function runPhase3() {
    const startStep = state.stepIndex;

    // Step 11: review-start (commentary: Human-in-the-Loop at step 10, shown when entering phase 3)
    if (startStep <= 11) {
        state.stepIndex = 11;
        addAudit('clinicianStart');
        render();
        await waitForCommentary(); // Step 10/11: Human-in-the-Loop
        await delay(1500); // 1000 * 1.5
    }

    // Step 12: issue-agreed
    if (startStep <= 12) {
        const issueAgreeBtn = document.getElementById('issue-agree-btn');
        if (issueAgreeBtn) {
            await moveCursorTo(issueAgreeBtn);
            await simulateClick(issueAgreeBtn);
        }
        state.issueDecided = true;
        state.stepIndex = 12;
        addAudit('issueAgreed');
        render();
        await waitForCommentary(); // Step 11/12: Clinician Validation
        await delay(1800); // 1200 * 1.5
    }

    // Step 13: action1-approved
    if (startStep <= 13) {
        const action1Btn = document.getElementById('action-1-approve');
        if (action1Btn) {
            await moveCursorTo(action1Btn);
            await simulateClick(action1Btn);
        }
        state.actionsStatus['action-1'] = 'approved';
        state.stepIndex = 13;
        addAudit('action1Approved');
        render();
        await waitForCommentary(); // Step 12: Approval Required
        await delay(1800); // 1200 * 1.5
    }

    // Step 14: action2-approved
    if (startStep <= 14) {
        const action2Btn = document.getElementById('action-2-approve');
        if (action2Btn) {
            await moveCursorTo(action2Btn);
            await simulateClick(action2Btn);
        }
        state.actionsStatus['action-2'] = 'approved';
        state.stepIndex = 14;
        addAudit('action2Approved');
        render();
        await waitForCommentary(); // Step 14: Execution & Audit Trail
        await delay(1500); // 1000 * 1.5
    }
}

// ========== PHASE 4: EXECUTION ==========
async function runPhase4() {
    const overlay = document.getElementById('iphone-overlay');
    const iphone = document.getElementById('iphone-mockup');
    const startStep = state.stepIndex;

    // Step 15: exec-start
    if (startStep <= 15) {
        state.stepIndex = 15;
        render();
        await delay(1200); // 800 * 1.5
    }

    // Step 16: notify-1
    if (startStep <= 16) {
        state.stepIndex = 16;
        addAudit('execute1');
        render();
        await delay(900); // 600 * 1.5
        if (overlay) overlay.classList.add('visible');
        await delay(300); // 200 * 1.5
        if (iphone) iphone.classList.add('visible');
        await delay(900); // 600 * 1.5
    }

    // Step 17: outcome-1
    if (startStep <= 17) {
        showTyping(true);
        await delay(1500); // 1000 * 1.5
        showTyping(false);
        state.outcomeIndex = 1;
        state.stepIndex = 17;
        render();
        scrollToBottom('chat-container');
        await delay(1800); // 1200 * 1.5

        // Patient clicks "I will stop taking ibuprofen" button
        const understoodBtn = document.getElementById('btn-understood');
        if (understoodBtn) {
            await delay(900); // 600 * 1.5
            understoodBtn.classList.add('clicked');
            await delay(600); // 400 * 1.5
            state.patientResponses.understood = true;
            addAudit('patientConfirmStop');
            render();
            scrollToBottom('chat-container');
            await delay(1200); // 800 * 1.5
        }
    }

    // Step 18: notify-2
    if (startStep <= 18) {
        state.stepIndex = 18;
        addAudit('execute2');
        render();
    }

    // Step 19: outcome-2
    if (startStep <= 19) {
        showTyping(true);
        await delay(1500); // 1000 * 1.5
        showTyping(false);
        state.outcomeIndex = 2;
        state.stepIndex = 19;
        render();
        scrollToBottom('chat-container');
        await delay(1800); // 1200 * 1.5

        // Patient clicks "Book blood test" button
        const bookBtn = document.getElementById('btn-book-appointment');
        if (bookBtn) {
            await delay(900); // 600 * 1.5
            bookBtn.classList.add('clicked');
            await delay(600); // 400 * 1.5
            state.patientResponses.appointmentBooked = true;
            addAudit('patientBookedAppt');
            render();
            scrollToBottom('chat-container');
            await delay(1200); // 800 * 1.5
        }
    }

    // Hide iPhone and complete
    if (iphone) iphone.classList.remove('visible');
    await delay(600); // 400 * 1.5
    if (overlay) overlay.classList.remove('visible');

    await delay(1200); // 800 * 1.5
    state.stepIndex = 20;
    addAudit('complete');
    render();
    await waitForCommentary(); // Step 20: Workflow Complete

    await delay(1500); // 1000 * 1.5
}

// ========== CURSOR SIMULATION ==========
async function moveCursorTo(element) {
    // Scroll element into view smoothly
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await delay(600); // 400 * 1.5

    // Now get position and move cursor
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';

    await delay(900); // 600 * 1.5
}

async function simulateClick(element) {
    cursor.classList.add('clicking');
    await delay(300); // 200 * 1.5
    cursor.classList.remove('clicking');
    await delay(225); // 150 * 1.5
}

// ========== TIMELINE NAVIGATION ==========
function jumpToStep(targetStep) {
    // Stop any running demo
    if (state.isPlaying) {
        state.isPlaying = false;
        state.isPaused = false;
        if (state.pauseResolve) {
            state.pauseResolve();
            state.pauseResolve = null;
        }
    }
    cursor.classList.remove('visible');
    // Cancel any pending commentary wait
    CommentarySystem.cancelWait();

    // Get overlay elements
    const overlay = document.getElementById('iphone-overlay');
    const iphone = document.getElementById('iphone-mockup');
    if (overlay) overlay.classList.remove('visible');
    if (iphone) iphone.classList.remove('visible');

    // Set step and phase
    state.stepIndex = targetStep;
    state.phase = TIMELINE_STEPS[targetStep].phase;

    // Reset base state
    state.auditEvents = [];
    state.actionsStatus = {};
    state.scenario.actions.forEach(a => state.actionsStatus[a.id] = 'pending');
    state.patientResponses = { understood: false, appointmentBooked: false };

    // Configure state based on step
    // Phase 1 steps (0-4): scan-start, scan-p1, scan-p2, scan-flagged, info-required
    if (targetStep <= 4) {
        state.scanIndex = targetStep === 0 ? -1 : Math.min(targetStep - 1, 2);
        state.chatIndex = 0;
        state.outcomeIndex = 0;
        state.issueDecided = false;
        addAudit('scan');
    }
    // Phase 2 steps (5-10): chat-start, chat-m1 through chat-m5
    else if (targetStep <= 10) {
        state.scanIndex = 2; // flagged patient
        state.chatIndex = targetStep === 5 ? 0 : targetStep - 5;
        state.outcomeIndex = 0;
        state.issueDecided = false;
        addAudit('scan');
        addAudit('patientStart');
        if (targetStep === 10) addAudit('patientEnd');
        // Show iPhone for chat
        if (overlay) overlay.classList.add('visible');
        if (iphone) iphone.classList.add('visible');
    }
    // Phase 3 steps (11-14): review-start, issue-agreed, action1-approved, action2-approved
    else if (targetStep <= 14) {
        state.scanIndex = 2;
        state.chatIndex = 5;
        state.outcomeIndex = 0;
        addAudit('scan');
        addAudit('patientStart');
        addAudit('patientEnd');
        addAudit('clinicianStart');

        if (targetStep >= 12) {
            state.issueDecided = true;
            addAudit('issueAgreed');
        } else {
            state.issueDecided = false;
        }
        if (targetStep >= 13) {
            state.actionsStatus['action-1'] = 'approved';
            addAudit('action1Approved');
        }
        if (targetStep >= 14) {
            state.actionsStatus['action-2'] = 'approved';
            addAudit('action2Approved');
        }
    }
    // Phase 4 steps (15-20): exec-start through complete
    else {
        state.scanIndex = 2;
        state.chatIndex = 5;
        state.issueDecided = true;
        state.actionsStatus['action-1'] = 'approved';
        state.actionsStatus['action-2'] = 'approved';
        addAudit('scan');
        addAudit('patientStart');
        addAudit('patientEnd');
        addAudit('clinicianStart');
        addAudit('issueAgreed');
        addAudit('action1Approved');
        addAudit('action2Approved');

        // Outcome index based on step
        if (targetStep >= 19) {
            state.outcomeIndex = 2;
        } else if (targetStep >= 17) {
            state.outcomeIndex = 1;
        } else {
            state.outcomeIndex = 0;
        }

        // Patient responses based on step (responses happen after messages)
        state.patientResponses = {
            understood: targetStep >= 18,
            appointmentBooked: targetStep >= 20
        };

        // Audit events for execution
        if (targetStep >= 16) addAudit('execute1');
        if (targetStep >= 18) addAudit('patientConfirmStop');
        if (targetStep >= 18) addAudit('execute2');
        if (targetStep >= 20) addAudit('patientBookedAppt');
        if (targetStep >= 20) addAudit('complete');

        // Show iPhone for outcome messages (steps 16-19)
        if (targetStep >= 16 && targetStep <= 19) {
            if (overlay) overlay.classList.add('visible');
            if (iphone) iphone.classList.add('visible');
        }
    }

    updatePlayPauseButton();
    render();
}

function renderTimeline() {
    const progressEl = document.getElementById('timeline-progress');
    const markers = document.querySelectorAll('.timeline-marker');

    // Calculate progress percentage (21 steps, 0-20)
    const progress = (state.stepIndex / 20) * 100;
    progressEl.style.width = `${progress}%`;

    // Update marker states
    markers.forEach(marker => {
        const step = parseInt(marker.dataset.step);
        marker.classList.remove('active', 'completed');
        if (step === state.stepIndex) {
            marker.classList.add('active');
        } else if (step < state.stepIndex) {
            marker.classList.add('completed');
        }
    });
}

// ========== RENDERING ==========
function render() {
    renderPhaseProgress();
    renderPhase1Content();
    renderPhase2Content();
    renderPhase3Content();
    renderPhase4Content();
    renderTimeline();
    updateStatus();

    // Show active phase
    // Phase 2 uses phase-1 container (iPhone overlay shows on top)
    document.querySelectorAll('.phase-container').forEach(el => {
        const phaseNum = parseInt(el.id.split('-')[1]);
        const activePhase = state.phase === 2 ? 1 : state.phase;
        el.classList.toggle('active', phaseNum === activePhase);
    });

    // Update commentary for current step
    CommentarySystem.showForStep(state.stepIndex);
}

function renderPhaseProgress() {
    const phases = [
        { title: 'AI Review', desc: 'Patient screening' },
        { title: 'Patient Chat', desc: 'Information gathering' },
        { title: 'Clinician Review', desc: 'Review & approval' },
        { title: 'Execution', desc: 'Action & audit' }
    ];

    const container = document.getElementById('phase-progress');
    container.innerHTML = phases.map((p, i) => {
        const num = i + 1;
        let cls = 'phase-item';
        if (num === state.phase) cls += ' active';
        if (num < state.phase) cls += ' completed';

        return `
            <li class="${cls}">
                <div class="phase-indicator">${num < state.phase ? '✓' : num}</div>
                <div class="phase-content">
                    <h3>${p.title}</h3>
                    <p>${p.desc}</p>
                </div>
            </li>
        `;
    }).join('');
}

function renderPhase1Content() {
    const container = document.getElementById('patient-list');

    // Create patient rows HTML
    let patientsHtml = PATIENT_LIST.map((p, i) => {
        let rowClass = 'patient-row';
        let statusClass = 'pending';
        let statusText = 'Pending';
        let scanResult = '';

        if (i < state.scanIndex) {
            rowClass += p.status === 'flagged' ? ' flagged' : ' scanned';
            statusClass = p.status === 'flagged' ? 'flagged' : 'ok';
            statusText = p.status === 'flagged' ? 'Flagged' : 'OK';
            scanResult = p.scanResult;
        } else if (i === state.scanIndex) {
            // Show flagged state if past Phase 1 OR at info-required step (step 4)
            const showFlagged = p.status === 'flagged' && (state.phase > 1 || state.stepIndex >= 4);
            if (showFlagged) {
                rowClass += ' flagged';
                statusClass = 'flagged';
                statusText = 'Flagged';
                scanResult = p.scanResult;
            } else {
                rowClass += ' scanning';
                statusClass = 'scanning';
                statusText = 'Scanning...';
            }
        }

        const showAction = p.actionRequired && scanResult && p.status === 'flagged';

        return `
            <div class="${rowClass}" data-patient="${i}">
                <div class="patient-avatar">${p.initials}</div>
                <div class="patient-info">
                    <div class="patient-header">
                        <h4>${p.fullName || p.initials}</h4>
                        <span class="patient-meta">${p.age}${p.gender ? p.gender[0] : ''} · NHS: ${p.nhsNumber || 'N/A'}</span>
                    </div>
                    ${scanResult ? `<div class="scan-result ${p.status === 'flagged' ? 'alert' : ''}">${scanResult}</div>` : ''}
                    ${showAction ? `<div class="action-required">${p.actionRequired}</div>` : ''}
                </div>
                <span class="patient-status ${statusClass}">${statusText}</span>
            </div>
        `;
    }).join('');

    // Add "ghost" patients at the end to create infinite scroll illusion
    const ghostPatients = [
        { initials: "O.W.", fullName: "Oliver Watson", nhsNumber: "624 853 1947", age: 49, gender: "Male" },
        { initials: "E.R.", fullName: "Emma Roberts", nhsNumber: "781 432 6589", age: 56, gender: "Female" },
        { initials: "J.B.", fullName: "John Bradley", nhsNumber: "935 167 4823", age: 73, gender: "Male" },
        { initials: "M.K.", fullName: "Maria Khan", nhsNumber: "412 698 3571", age: 62, gender: "Female" },
        { initials: "D.S.", fullName: "Daniel Smith", nhsNumber: "567 284 9136", age: 44, gender: "Male" },
        { initials: "S.L.", fullName: "Sarah Lawrence", nhsNumber: "893 541 2678", age: 38, gender: "Female" },
        { initials: "R.T.", fullName: "Richard Turner", nhsNumber: "246 879 5314", age: 67, gender: "Male" },
        { initials: "L.H.", fullName: "Lucy Harris", nhsNumber: "718 395 6842", age: 51, gender: "Female" }
    ];

    patientsHtml += ghostPatients.map((p, i) => `
        <div class="patient-row ghost-patient" data-ghost="${i}">
            <div class="patient-avatar">${p.initials}</div>
            <div class="patient-info">
                <div class="patient-header">
                    <h4>${p.fullName}</h4>
                    <span class="patient-meta">${p.age}${p.gender[0]} · NHS: ${p.nhsNumber}</span>
                </div>
            </div>
            <span class="patient-status pending">Pending</span>
        </div>
    `).join('');

    container.innerHTML = patientsHtml;
}

function renderPhase2Content() {
    const chatArea = document.getElementById('chat-container');
    const container = chatArea.querySelector('.chat-container');
    if (!container) return;

    const messages = state.scenario.patientChat.slice(0, state.chatIndex);

    let html = messages.map(m => `
        <div class="chat-message ${m.role}">
            <div class="chat-avatar">${m.role === 'assistant' ? 'NHS' : 'PT'}</div>
            <div class="chat-bubble">${m.text}</div>
        </div>
    `).join('');

    // Add outcome messages in Phase 4
    if (state.phase === 4 && state.outcomeIndex > 0) {
        const actions = state.scenario.actions;
        for (let i = 0; i < state.outcomeIndex && i < actions.length; i++) {
            html += `
                <div class="chat-message assistant outcome">
                    <div class="chat-avatar">NHS</div>
                    <div class="chat-bubble">${actions[i].patientMessageDraft}</div>
                </div>
            `;

            // Add response button after first message (medication advice)
            if (i === 0) {
                const understoodSelected = state.patientResponses.understood;
                html += `
                    <div class="chat-response-buttons">
                        <button id="btn-understood" class="chat-action-btn primary${understoodSelected ? ' selected' : ''}">I will stop taking ibuprofen</button>
                        <button class="chat-action-btn secondary${understoodSelected ? ' disabled' : ''}">I have questions</button>
                    </div>
                `;
                if (understoodSelected) {
                    html += `
                        <div class="chat-message patient response">
                            <div class="chat-avatar">PT</div>
                            <div class="chat-bubble">I will stop taking ibuprofen and switch to paracetamol. Thank you for letting me know.</div>
                        </div>
                    `;
                }
            }

            // Add response button after second message (blood test appointment)
            if (i === 1) {
                const appointmentSelected = state.patientResponses.appointmentBooked;
                html += `
                    <div class="chat-response-buttons">
                        <button id="btn-book-appointment" class="chat-action-btn primary${appointmentSelected ? ' selected' : ''}">Book blood test</button>
                        <button class="chat-action-btn secondary${appointmentSelected ? ' disabled' : ''}">View available times</button>
                    </div>
                `;
                if (appointmentSelected) {
                    html += `
                        <div class="chat-message patient response">
                            <div class="chat-avatar">PT</div>
                            <div class="chat-bubble">Appointment confirmed for Monday 20th January at 9:15am at Parkside Medical Centre.</div>
                        </div>
                    `;
                }
            }
        }
    }

    container.innerHTML = html;
}

function renderPhase3Content() {
    const s = state.scenario;
    const p = s.patient;

    // Patient summary
    const summaryEl = document.getElementById('patient-summary');
    const medsHtml = p.meds.map(m =>
        `<li class="${m.flagged ? 'flagged' : ''}">${m.name} ${m.dose} ${m.frequency}</li>`
    ).join('');
    const labsHtml = p.labs.map(l =>
        `<tr><td>${l.name}</td><td class="flag-${l.flag}">${l.value} ${l.unit}</td><td>${l.date}</td></tr>`
    ).join('');

    summaryEl.innerHTML = `
        <h3>Patient Summary</h3>
        <div class="summary-grid">
            <div class="summary-item"><label>Patient</label><span>${p.initials} (${p.age}${p.gender[0]})</span></div>
            <div class="summary-item"><label>NHS Number</label><span>${p.nhsNumber}</span></div>
            <div class="summary-item full-width"><label>Conditions</label><ul class="summary-list">${p.conditions.map(c => `<li>${c}</li>`).join('')}</ul></div>
            <div class="summary-item full-width"><label>Medications</label><ul class="summary-list">${medsHtml}</ul></div>
            <div class="summary-item full-width"><label>Recent Labs</label><table class="labs-table"><thead><tr><th>Test</th><th>Value</th><th>Date</th></tr></thead><tbody>${labsHtml}</tbody></table></div>
        </div>
    `;

    // Issue card
    const issueEl = document.getElementById('issue-card');
    const issue = s.issue;
    const evidenceHtml = issue.evidence.map(e => {
        if (typeof e === 'string') {
            return `<li>${e}</li>`;
        } else {
            return `<li>${e.text} <span class="evidence-source">via ${e.source}</span></li>`;
        }
    }).join('');

    issueEl.innerHTML = `
        <h3>${issue.title}</h3>
        <p class="issue-description">${issue.description}</p>
        <ul class="evidence-list">${evidenceHtml}</ul>
        ${state.issueDecided
            ? '<span class="decision-status agreed">Agreed</span>'
            : `<div class="decision-buttons">
                <button id="issue-agree-btn" class="btn-agree">Agree</button>
                <button class="btn-reject-decision">Reject</button>
                <button class="btn-modify">Modify</button>
            </div>`
        }
    `;

    // Action cards
    const actionsEl = document.getElementById('action-cards');
    actionsEl.innerHTML = s.actions.map(a => {
        const status = state.actionsStatus[a.id];
        const cardClass = status !== 'pending' ? status : '';

        return `
            <div class="action-card ${cardClass}">
                <div class="action-header">
                    <h4>${a.title}</h4>
                    <span class="impact-badge ${a.impact.toLowerCase()}">${a.impact}</span>
                </div>
                <p class="action-rationale">${a.rationale}</p>
                <div class="message-preview">
                    <div class="message-preview-label">Patient message draft:</div>
                    ${a.patientMessageDraft}
                </div>
                ${status === 'pending'
                    ? `<div class="decision-buttons">
                        <button id="${a.id}-approve" class="btn-agree">Approve</button>
                        <button class="btn-reject-decision">Reject</button>
                        <button class="btn-modify">Modify</button>
                    </div>`
                    : `<span class="decision-status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`
                }
            </div>
        `;
    }).join('');
}

function renderPhase4Content() {
    if (state.phase !== 4) return;

    const timelineEl = document.getElementById('audit-timeline');
    timelineEl.innerHTML = state.auditEvents.map((e, i) => `
        <div class="audit-event ${e.actor.toLowerCase()}" data-event="${i}">
            <span class="audit-actor ${e.actor.toLowerCase()}">${e.actor}</span>
            <div class="audit-text">${e.text}</div>
            <div class="audit-timestamp">${e.time}</div>
        </div>
    `).join('');

    // Scroll to latest event
    if (state.auditEvents.length > 0) {
        const lastEvent = timelineEl.querySelector(`[data-event="${state.auditEvents.length - 1}"]`);
        if (lastEvent) {
            lastEvent.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function updateStatus() {
    const statusEl = document.getElementById('status-text');
    const phases = ['AI Review', 'Patient Chat', 'Clinician Review', 'Execution'];
    statusEl.innerHTML = `<span class="phase-indicator-text">Phase ${state.phase}: ${phases[state.phase - 1]}</span>`;
}

// ========== HELPERS ==========
function showTyping(show) {
    const chatArea = document.getElementById('chat-container');
    const container = chatArea.querySelector('.chat-container');
    if (!container) return;

    const existing = container.querySelector('.typing-indicator');
    if (existing) existing.parentElement.remove();

    if (show) {
        container.innerHTML += `
            <div class="chat-message assistant">
                <div class="chat-avatar">NHS</div>
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
        `;
        scrollToBottom('chat-container');
    }
}

function scrollToBottom(id) {
    const el = document.getElementById(id);
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
}

function addAudit(trigger) {
    const event = state.scenario.auditEvents.find(e => e.trigger === trigger);
    if (event) {
        state.auditEvents.push({ ...event });
    }
}

async function delay(ms) {
    // If paused, wait until resumed
    if (state.isPaused) {
        await new Promise(resolve => {
            state.pauseResolve = resolve;
        });
    }
    // If demo was stopped (e.g., by jumpToStep), abort
    if (!state.isPlaying) {
        throw new Error('Demo stopped');
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}

function togglePause() {
    if (!state.isPlaying) return;

    state.isPaused = !state.isPaused;
    updatePlayPauseButton();

    if (!state.isPaused && state.pauseResolve) {
        state.pauseResolve();
        state.pauseResolve = null;
    }
}

function updatePlayPauseButton() {
    const btn = document.getElementById('btn-play');
    if (state.isPlaying && !state.isPaused) {
        btn.innerHTML = '<span class="pause-icon"></span>Pause';
        btn.classList.add('playing');
        btn.classList.remove('paused');
        btn.disabled = false;
    } else if (state.isPlaying && state.isPaused) {
        btn.innerHTML = '<span class="play-icon"></span>Resume';
        btn.classList.remove('playing');
        btn.classList.add('paused');
        btn.disabled = false;
    } else {
        btn.innerHTML = '<span class="play-icon"></span>Play Demo';
        btn.classList.remove('playing', 'paused');
    }
}

document.addEventListener('DOMContentLoaded', init);
