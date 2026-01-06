/**
 * MedGuard Demo - Auto-Play with Simulated Mouse
 */

const state = {
    phase: 1,
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

    render();
}

function resetDemo() {
    state.phase = 1;
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
    addAudit('scan');

    for (let i = 0; i < PATIENT_LIST.length; i++) {
        state.scanIndex = i;
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
    addAudit('patientStart');

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
        render();
        scrollToBottom('chat-container');

        await delay(1200);
    }

    addAudit('patientEnd');
    await delay(1800);
}

// ========== PHASE 3: CLINICIAN REVIEW ==========
async function runPhase3() {
    addAudit('clinicianStart');
    await delay(1000);

    // Move to issue card and click Agree
    const issueAgreeBtn = document.getElementById('issue-agree-btn');
    if (issueAgreeBtn) {
        await moveCursorTo(issueAgreeBtn);
        await simulateClick(issueAgreeBtn);
    }
    state.issueDecided = true;
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
    addAudit('action2Approved');
    render();
    await delay(1000);
}

// ========== PHASE 4: EXECUTION ==========
async function runPhase4() {
    const overlay = document.getElementById('iphone-overlay');
    const iphone = document.getElementById('iphone-mockup');

    // Add first execution event
    await delay(800);
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
    render();
    scrollToBottom('chat-container');
    await delay(1200);

    // Add second execution event and show second outcome message
    addAudit('execute2');
    render();

    showTyping(true);
    await delay(1000);
    showTyping(false);
    state.outcomeIndex = 2;
    render();
    scrollToBottom('chat-container');
    await delay(1500);

    // Hide iPhone
    if (iphone) iphone.classList.remove('visible');
    await delay(400);
    if (overlay) overlay.classList.remove('visible');

    await delay(800);
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

// ========== RENDERING ==========
function render() {
    renderPhaseProgress();
    renderPhase1Content();
    renderPhase2Content();
    renderPhase3Content();
    renderPhase4Content();
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
