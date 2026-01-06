/**
 * MedGuard Demo - Auto-Play with Simulated Mouse
 */

// Timeline steps definition (20 total)
const TIMELINE_STEPS = [
    // Phase 1: AI Scanning (4 steps)
    { id: 'scan-start', phase: 1, label: 'Scan Start' },
    { id: 'scan-p1', phase: 1, label: 'Patient 1' },
    { id: 'scan-p2', phase: 1, label: 'Patient 2' },
    { id: 'scan-flagged', phase: 1, label: 'Flagged' },
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
    scenario: null
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
    cursor.classList.remove('visible');
    // Hide iPhone overlay
    const overlay = document.getElementById('iphone-overlay');
    const iphone = document.getElementById('iphone-mockup');
    if (overlay) overlay.classList.remove('visible');
    if (iphone) iphone.classList.remove('visible');
    updatePlayPauseButton();
    render();
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

    const overlay = document.getElementById('iphone-overlay');
    const iphone = document.getElementById('iphone-mockup');

    // Phase 1: AI Scanning (no cursor)
    await runPhase1();

    // Phase 2: Patient Chat - iPhone pops up OVER patient list
    state.phase = 2;
    renderPhaseProgress(); // Update sidebar to show Phase 2
    updateStatus();
    await delay(500);

    // Show iPhone overlay on top of patient screening
    if (overlay) overlay.classList.add('visible');
    await delay(200);
    if (iphone) iphone.classList.add('visible');
    await delay(600);

    await runPhase2();

    // Hide iPhone
    if (iphone) iphone.classList.remove('visible');
    await delay(400);
    if (overlay) overlay.classList.remove('visible');
    await delay(400);

    // Phase 3: Clinician Review (with cursor)
    state.phase = 3;
    render();
    await delay(600);
    cursor.classList.add('visible');
    await runPhase3();
    cursor.classList.remove('visible');

    // Phase 4: Execution (no cursor)
    state.phase = 4;
    render();
    await delay(500);
    await runPhase4();

    state.isPlaying = false;
    state.isPaused = false;
    updatePlayPauseButton();
}

// ========== PHASE 1: AI SCANNING ==========
async function runPhase1() {
    state.stepIndex = 0; // scan-start
    addAudit('scan');
    render();

    for (let i = 0; i < PATIENT_LIST.length; i++) {
        state.scanIndex = i;
        state.stepIndex = i + 1; // scan-p1 (1), scan-p2 (2), scan-flagged (3)
        render();

        await delay(1000);

        // Check if flagged
        if (PATIENT_LIST[i].status === 'flagged') {
            await delay(1500);
            break;
        }
    }

    await delay(1000);
}

// ========== PHASE 2: PATIENT CHAT ==========
async function runPhase2() {
    state.stepIndex = 4; // chat-start
    addAudit('patientStart');
    render();

    const messages = state.scenario.patientChat;

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];

        if (msg.role === 'assistant') {
            // Show typing indicator
            showTyping(true);
            await delay(msg.delayMs || 1200);
            showTyping(false);
        }

        state.chatIndex = i + 1;
        state.stepIndex = 5 + i; // chat-m1 (5) through chat-m5 (9)
        render();
        scrollToBottom('chat-container');

        await delay(1200);
    }

    addAudit('patientEnd');
    await delay(1800);
}

// ========== PHASE 3: CLINICIAN REVIEW ==========
async function runPhase3() {
    state.stepIndex = 10; // review-start
    addAudit('clinicianStart');
    render();
    await delay(1000);

    // Move to issue card and click Agree
    const issueAgreeBtn = document.getElementById('issue-agree-btn');
    if (issueAgreeBtn) {
        await moveCursorTo(issueAgreeBtn);
        await simulateClick(issueAgreeBtn);
    }
    state.issueDecided = true;
    state.stepIndex = 11; // issue-agreed
    addAudit('issueAgreed');
    render();
    await delay(1200);

    // Approve first action
    const action1Btn = document.getElementById('action-1-approve');
    if (action1Btn) {
        await moveCursorTo(action1Btn);
        await simulateClick(action1Btn);
    }
    state.actionsStatus['action-1'] = 'approved';
    state.stepIndex = 12; // action1-approved
    addAudit('action1Approved');
    render();
    await delay(1200);

    // Approve second action
    const action2Btn = document.getElementById('action-2-approve');
    if (action2Btn) {
        await moveCursorTo(action2Btn);
        await simulateClick(action2Btn);
    }
    state.actionsStatus['action-2'] = 'approved';
    state.stepIndex = 13; // action2-approved
    addAudit('action2Approved');
    render();
    await delay(1000);
}

// ========== PHASE 4: EXECUTION ==========
async function runPhase4() {
    const overlay = document.getElementById('iphone-overlay');
    const iphone = document.getElementById('iphone-mockup');

    state.stepIndex = 14; // exec-start
    render();

    // Add first execution event
    await delay(800);
    state.stepIndex = 15; // notify-1
    addAudit('execute1');
    render();

    // Show iPhone with outcome messages
    await delay(600);
    if (overlay) overlay.classList.add('visible');
    await delay(200);
    if (iphone) iphone.classList.add('visible');
    await delay(600);

    // Show typing then first outcome message
    showTyping(true);
    await delay(1000);
    showTyping(false);
    state.outcomeIndex = 1;
    state.stepIndex = 16; // outcome-1
    render();
    scrollToBottom('chat-container');
    await delay(1200);

    // Add second execution event and show second outcome message
    state.stepIndex = 17; // notify-2
    addAudit('execute2');
    render();

    showTyping(true);
    await delay(1000);
    showTyping(false);
    state.outcomeIndex = 2;
    state.stepIndex = 18; // outcome-2
    render();
    scrollToBottom('chat-container');
    await delay(1500);

    // Hide iPhone
    if (iphone) iphone.classList.remove('visible');
    await delay(400);
    if (overlay) overlay.classList.remove('visible');

    await delay(800);
    state.stepIndex = 19; // complete
    addAudit('complete');
    render();

    await delay(1000);
}

// ========== CURSOR SIMULATION ==========
async function moveCursorTo(element) {
    // Scroll element into view smoothly
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await delay(400);

    // Now get position and move cursor
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';

    await delay(600);
}

async function simulateClick(element) {
    cursor.classList.add('clicking');
    await delay(200);
    cursor.classList.remove('clicking');
    await delay(150);
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

    // Configure state based on step
    // Phase 1 steps (0-3): scan-start, scan-p1, scan-p2, scan-flagged
    if (targetStep <= 3) {
        state.scanIndex = targetStep === 0 ? -1 : targetStep - 1;
        state.chatIndex = 0;
        state.outcomeIndex = 0;
        state.issueDecided = false;
        addAudit('scan');
    }
    // Phase 2 steps (4-9): chat-start, chat-m1 through chat-m5
    else if (targetStep <= 9) {
        state.scanIndex = 2; // flagged patient
        state.chatIndex = targetStep === 4 ? 0 : targetStep - 4;
        state.outcomeIndex = 0;
        state.issueDecided = false;
        addAudit('scan');
        addAudit('patientStart');
        if (targetStep === 9) addAudit('patientEnd');
        // Show iPhone for chat
        if (overlay) overlay.classList.add('visible');
        if (iphone) iphone.classList.add('visible');
    }
    // Phase 3 steps (10-13): review-start, issue-agreed, action1-approved, action2-approved
    else if (targetStep <= 13) {
        state.scanIndex = 2;
        state.chatIndex = 5;
        state.outcomeIndex = 0;
        addAudit('scan');
        addAudit('patientStart');
        addAudit('patientEnd');
        addAudit('clinicianStart');

        if (targetStep >= 11) {
            state.issueDecided = true;
            addAudit('issueAgreed');
        } else {
            state.issueDecided = false;
        }
        if (targetStep >= 12) {
            state.actionsStatus['action-1'] = 'approved';
            addAudit('action1Approved');
        }
        if (targetStep >= 13) {
            state.actionsStatus['action-2'] = 'approved';
            addAudit('action2Approved');
        }
    }
    // Phase 4 steps (14-19): exec-start through complete
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
        if (targetStep >= 18) {
            state.outcomeIndex = 2;
        } else if (targetStep >= 16) {
            state.outcomeIndex = 1;
        } else {
            state.outcomeIndex = 0;
        }

        // Audit events for execution
        if (targetStep >= 15) addAudit('execute1');
        if (targetStep >= 17) addAudit('execute2');
        if (targetStep >= 19) addAudit('complete');

        // Show iPhone for outcome messages (steps 15-18)
        if (targetStep >= 15 && targetStep <= 18) {
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

    // Calculate progress percentage (20 steps, 0-19)
    const progress = (state.stepIndex / 19) * 100;
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
    container.innerHTML = PATIENT_LIST.map((p, i) => {
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
            rowClass += ' scanning';
            statusClass = 'scanning';
            statusText = 'Scanning...';
            if (p.status === 'flagged' && state.phase > 1) {
                rowClass = 'patient-row flagged';
                statusClass = 'flagged';
                statusText = 'Flagged';
                scanResult = p.scanResult;
            }
        }

        return `
            <div class="${rowClass}" data-patient="${i}">
                <div class="patient-avatar">${p.initials}</div>
                <div class="patient-info">
                    <h4>${p.initials} (${p.age})</h4>
                    <p>${p.summary}</p>
                    ${scanResult ? `<div class="scan-result ${p.status === 'flagged' ? 'alert' : ''}">${scanResult}</div>` : ''}
                </div>
                <span class="patient-status ${statusClass}">${statusText}</span>
            </div>
        `;
    }).join('');
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
    const evidenceHtml = issue.evidence.map(e => `<li>${e}</li>`).join('');

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
    const timelineEl = document.getElementById('audit-timeline');
    timelineEl.innerHTML = state.auditEvents.map((e, i) => `
        <div class="audit-event ${e.actor.toLowerCase()}" data-event="${i}">
            <span class="audit-actor ${e.actor.toLowerCase()}">${e.actor}</span>
            <div class="audit-text">${e.text}</div>
            <div class="audit-timestamp">${formatTime(e.timestamp)}</div>
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
        state.auditEvents.push({
            ...event,
            timestamp: new Date()
        });
    }
}

function formatTime(date) {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

async function delay(ms) {
    // If paused, wait until resumed
    if (state.isPaused) {
        await new Promise(resolve => {
            state.pauseResolve = resolve;
        });
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
