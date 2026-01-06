/**
 * MedGuard Demo - Application Logic
 *
 * This file manages the demo state and UI rendering.
 * The demo progresses through 4 phases in a linear timeline:
 *   Phase 1: AI Scanning - Shows AI reviewing patient list
 *   Phase 2: Patient Chat - Information gathering (retrieval only)
 *   Phase 3: Clinician Review - Review, Q&A, and action approval
 *   Phase 4: Execution - Audit trail and action execution
 */

// ============================================================
// STATE MANAGEMENT
// ============================================================

// Application state - tracks current position in the demo
const state = {
    // Current scenario from scenarios.js
    activeScenarioId: null,
    scenario: null,

    // Current phase (1-4)
    currentPhase: 1,

    // Phase 1: AI Scanning state
    scanIndex: 0,           // Which patient is being scanned (-1 = not started)
    scanComplete: false,

    // Phase 2: Patient chat state
    patientChatIndex: 0,    // How many messages have been shown

    // Phase 3: Clinician review state
    clinicianChatIndex: 0,  // How many clinician messages shown
    actionsStatus: {},       // actionId -> 'pending' | 'approved' | 'changes' | 'rejected'
    actionsFeedback: {},     // actionId -> feedback text (for 'changes')

    // Phase 4: Execution state
    auditEvents: [],         // Array of audit events
    executionStarted: false,
    executionComplete: false,

    // UI state
    isTyping: false,         // Is the typing indicator showing?
    speedMode: false,        // Fast mode for presenters

    // Expandable sections
    auditDetailsExpanded: false
};

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize the application
 */
function init() {
    // Load the first scenario
    if (SCENARIOS.length > 0) {
        loadScenario(SCENARIOS[0].id);
    }

    // Set up event listeners
    setupEventListeners();

    // Initial render
    render();
}

/**
 * Load a scenario by ID
 */
function loadScenario(scenarioId) {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    state.activeScenarioId = scenarioId;
    state.scenario = scenario;

    // Initialize action statuses
    state.actionsStatus = {};
    state.actionsFeedback = {};
    scenario.actions.forEach(action => {
        state.actionsStatus[action.id] = 'pending';
        state.actionsFeedback[action.id] = action.feedbackText || '';
    });

    resetDemo();
}

/**
 * Reset the demo to the beginning
 */
function resetDemo() {
    state.currentPhase = 1;
    state.scanIndex = -1;
    state.scanComplete = false;
    state.patientChatIndex = 0;
    state.clinicianChatIndex = 0;
    state.auditEvents = [];
    state.executionStarted = false;
    state.executionComplete = false;
    state.isTyping = false;
    state.auditDetailsExpanded = false;

    // Reset action statuses
    if (state.scenario) {
        state.scenario.actions.forEach(action => {
            state.actionsStatus[action.id] = 'pending';
        });
    }

    render();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Scenario selector
    const selector = document.getElementById('scenario-select');
    if (selector) {
        selector.addEventListener('change', (e) => {
            loadScenario(e.target.value);
        });
    }

    // Reset button
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetDemo);
    }

    // Speed mode toggle
    const speedToggle = document.getElementById('speed-toggle');
    if (speedToggle) {
        speedToggle.addEventListener('change', (e) => {
            state.speedMode = e.target.checked;
        });
    }

    // Next button (main control)
    const nextBtn = document.getElementById('btn-next');
    if (nextBtn) {
        nextBtn.addEventListener('click', handleNext);
    }

    // Execute button
    const executeBtn = document.getElementById('btn-execute');
    if (executeBtn) {
        executeBtn.addEventListener('click', handleExecute);
    }
}

// ============================================================
// MAIN CONTROL FLOW
// ============================================================

/**
 * Handle the main "Next" button click
 * Advances the demo based on current phase
 */
async function handleNext() {
    if (state.isTyping) return;

    switch (state.currentPhase) {
        case 1:
            await advanceScan();
            break;
        case 2:
            await advancePatientChat();
            break;
        case 3:
            await advanceClinicianChat();
            break;
        case 4:
            // Phase 4 uses the Execute button instead
            break;
    }

    render();
}

/**
 * Transition to the next phase
 */
function goToNextPhase() {
    if (state.currentPhase < 4) {
        state.currentPhase++;

        // Add audit events for phase transitions
        if (state.currentPhase === 2) {
            addAuditEvent('onPatientChatStart');
        } else if (state.currentPhase === 3) {
            addAuditEvent('onPatientChatComplete');
            addAuditEvent('onClinicianReviewStart');
        }

        render();
    }
}

// ============================================================
// PHASE 1: AI SCANNING
// ============================================================

/**
 * Advance the AI scanning animation
 */
async function advanceScan() {
    const patients = PATIENT_LIST;

    if (state.scanIndex < patients.length - 1) {
        state.scanIndex++;
        render();

        // Check if this patient is flagged
        const currentPatient = patients[state.scanIndex];
        if (currentPatient.status === 'flagged') {
            // Add the initial audit event
            addAuditEvent('onLoad');

            // Wait a moment to show the flag
            await delay(state.speedMode ? 300 : 800);
            state.scanComplete = true;
            render();
        }
    } else if (state.scanComplete) {
        // Move to phase 2
        goToNextPhase();
    }
}

// ============================================================
// PHASE 2: PATIENT CHAT
// ============================================================

/**
 * Advance the patient chat by one message
 */
async function advancePatientChat() {
    const messages = state.scenario.patientChat;

    if (state.patientChatIndex >= messages.length) {
        // Chat complete, move to phase 3
        goToNextPhase();
        return;
    }

    const nextMessage = messages[state.patientChatIndex];

    // If it's an assistant message, show typing indicator
    if (nextMessage.role === 'assistant') {
        state.isTyping = true;
        render();

        const typingDelay = state.speedMode ? 200 : (nextMessage.delayMs || getRandomDelay());
        await delay(typingDelay);

        state.isTyping = false;
    }

    // Add the message
    state.patientChatIndex++;

    // Check for audit events triggered at this step
    checkPatientChatAuditEvents(state.patientChatIndex);

    render();
    scrollChatToBottom('patient-chat-container');
}

/**
 * Check if any audit events should trigger at this chat step
 */
function checkPatientChatAuditEvents(stepIndex) {
    const events = state.scenario.auditTemplate.filter(
        e => e.trigger === 'onPatientChatStep' && e.stepIndex === stepIndex
    );
    events.forEach(e => {
        state.auditEvents.push({
            ...e,
            timestamp: new Date()
        });
    });
}

// ============================================================
// PHASE 3: CLINICIAN REVIEW
// ============================================================

/**
 * Advance the clinician chat by one message
 */
async function advanceClinicianChat() {
    const messages = state.scenario.clinicianChat;

    if (state.clinicianChatIndex >= messages.length) {
        return; // All messages shown
    }

    const nextMessage = messages[state.clinicianChatIndex];

    // If it's an assistant message, show typing indicator
    if (nextMessage.role === 'assistant') {
        state.isTyping = true;
        render();

        const typingDelay = state.speedMode ? 200 : (nextMessage.delayMs || getRandomDelay());
        await delay(typingDelay);

        state.isTyping = false;
    }

    state.clinicianChatIndex++;
    render();
    scrollChatToBottom('clinician-chat-container');
}

/**
 * Handle action button clicks (Approve/Changes/Reject)
 */
function handleActionButton(actionId, status) {
    state.actionsStatus[actionId] = status;

    // Add audit event
    if (status === 'approved') {
        const auditEvent = state.scenario.auditTemplate.find(
            e => e.trigger === 'onActionApprove' && e.actionId === actionId
        );
        if (auditEvent) {
            state.auditEvents.push({
                ...auditEvent,
                timestamp: new Date()
            });
        }
    }

    // Check if we should move to phase 4
    const allActionsDecided = state.scenario.actions.every(
        a => state.actionsStatus[a.id] !== 'pending'
    );
    const hasApprovedActions = state.scenario.actions.some(
        a => state.actionsStatus[a.id] === 'approved'
    );

    if (allActionsDecided && hasApprovedActions) {
        state.currentPhase = 4;
    }

    render();
}

// ============================================================
// PHASE 4: EXECUTION
// ============================================================

/**
 * Handle the Execute button
 */
async function handleExecute() {
    if (state.executionStarted) return;

    state.executionStarted = true;
    render();

    // Execute each approved action
    const approvedActions = state.scenario.actions.filter(
        a => state.actionsStatus[a.id] === 'approved'
    );

    for (const action of approvedActions) {
        await delay(state.speedMode ? 300 : 800);

        // Add execution audit event
        const auditEvent = state.scenario.auditTemplate.find(
            e => e.trigger === 'onExecute' && e.actionId === action.id
        );
        if (auditEvent) {
            state.auditEvents.push({
                ...auditEvent,
                timestamp: new Date()
            });
        }
        render();
    }

    // Add completion event
    await delay(state.speedMode ? 300 : 600);
    const completeEvent = state.scenario.auditTemplate.find(e => e.trigger === 'onComplete');
    if (completeEvent) {
        state.auditEvents.push({
            ...completeEvent,
            timestamp: new Date()
        });
    }

    state.executionComplete = true;
    render();
}

/**
 * Toggle audit details expansion
 */
function toggleAuditDetails() {
    state.auditDetailsExpanded = !state.auditDetailsExpanded;
    render();
}

// ============================================================
// AUDIT EVENT HELPERS
// ============================================================

/**
 * Add an audit event by trigger name
 */
function addAuditEvent(trigger) {
    const event = state.scenario.auditTemplate.find(e => e.trigger === trigger);
    if (event) {
        state.auditEvents.push({
            ...event,
            timestamp: new Date()
        });
    }
}

// ============================================================
// RENDERING
// ============================================================

/**
 * Main render function - updates all UI based on state
 */
function render() {
    renderPhaseProgress();
    renderPhase1();
    renderPhase2();
    renderPhase3();
    renderPhase4();
    renderControls();
}

/**
 * Render the phase progress sidebar
 */
function renderPhaseProgress() {
    const phases = [
        { num: 1, title: 'AI Review', desc: 'Automated patient screening' },
        { num: 2, title: 'Patient Engagement', desc: 'Information gathering' },
        { num: 3, title: 'Clinician Review', desc: 'Review and approval' },
        { num: 4, title: 'Execution', desc: 'Action and audit' }
    ];

    const container = document.getElementById('phase-progress');
    if (!container) return;

    container.innerHTML = phases.map(phase => {
        let className = 'phase-item';
        if (phase.num === state.currentPhase) className += ' active';
        if (phase.num < state.currentPhase) className += ' completed';

        const icon = phase.num < state.currentPhase ? '✓' : phase.num;

        return `
            <li class="${className}">
                <div class="phase-indicator">${icon}</div>
                <div class="phase-content">
                    <h3>${phase.title}</h3>
                    <p>${phase.desc}</p>
                </div>
            </li>
        `;
    }).join('');
}

/**
 * Render Phase 1: AI Scanning
 */
function renderPhase1() {
    const container = document.getElementById('phase-1');
    if (!container) return;

    container.classList.toggle('active', state.currentPhase === 1);

    const listContainer = document.getElementById('patient-list');
    if (!listContainer) return;

    listContainer.innerHTML = PATIENT_LIST.map((patient, index) => {
        let rowClass = 'patient-row';
        let statusClass = 'pending';
        let statusText = 'Pending';
        let scanResult = '';

        if (index < state.scanIndex) {
            // Already scanned
            rowClass += patient.status === 'flagged' ? ' flagged' : ' scanned';
            statusClass = patient.status === 'flagged' ? 'flagged' : 'ok';
            statusText = patient.status === 'flagged' ? 'Flagged' : 'OK';
            scanResult = patient.scanResult;
        } else if (index === state.scanIndex) {
            // Currently scanning
            rowClass += ' scanning';
            statusClass = 'scanning';
            statusText = 'Scanning...';
        }

        const resultClass = patient.status === 'flagged' ? 'alert' : '';

        return `
            <div class="${rowClass}">
                <div class="patient-avatar">${patient.initials}</div>
                <div class="patient-info">
                    <h4>${patient.initials} (${patient.age})</h4>
                    <p>${patient.summary}</p>
                    ${scanResult ? `<div class="scan-result ${resultClass}">${scanResult}</div>` : ''}
                </div>
                <span class="patient-status ${statusClass}">${statusText}</span>
            </div>
        `;
    }).join('');
}

/**
 * Render Phase 2: Patient Chat
 */
function renderPhase2() {
    const container = document.getElementById('phase-2');
    if (!container) return;

    container.classList.toggle('active', state.currentPhase === 2);

    const chatContainer = document.getElementById('patient-chat-container');
    if (!chatContainer || !state.scenario) return;

    const messages = state.scenario.patientChat.slice(0, state.patientChatIndex);

    let html = messages.map(msg => {
        const avatarText = msg.role === 'assistant' ? 'NHS' : 'PT';
        return `
            <div class="chat-message ${msg.role}">
                <div class="chat-avatar">${avatarText}</div>
                <div class="chat-bubble">${formatChatText(msg.text)}</div>
            </div>
        `;
    }).join('');

    // Add typing indicator if needed
    if (state.isTyping && state.currentPhase === 2) {
        html += `
            <div class="chat-message assistant">
                <div class="chat-avatar">NHS</div>
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
    }

    chatContainer.innerHTML = html;
}

/**
 * Render Phase 3: Clinician Review
 */
function renderPhase3() {
    const container = document.getElementById('phase-3');
    if (!container) return;

    container.classList.toggle('active', state.currentPhase === 3);

    if (!state.scenario) return;

    // Render patient summary
    renderPatientSummary();

    // Render action cards
    renderActionCards();

    // Render clinician chat
    renderClinicianChat();
}

/**
 * Render the patient summary card
 */
function renderPatientSummary() {
    const container = document.getElementById('patient-summary');
    if (!container || !state.scenario) return;

    const patient = state.scenario.patient;

    const medsHtml = patient.meds.map(m => {
        const flaggedClass = m.flagged ? 'flagged' : '';
        return `<li class="${flaggedClass}">${m.name} ${m.dose} ${m.frequency}</li>`;
    }).join('');

    const conditionsHtml = patient.conditions.map(c => `<li>${c}</li>`).join('');

    const allergiesHtml = patient.allergies.map(a => `<li>${a}</li>`).join('');

    // Recent labs (first 4)
    const recentLabs = patient.labs.slice(0, 4);
    const labsHtml = recentLabs.map(lab => {
        const flagClass = lab.flag === 'normal' ? 'flag-normal' : (lab.flag ? 'flag-' + lab.flag : '');
        return `
            <tr>
                <td>${lab.name}</td>
                <td class="${flagClass}">${lab.value} ${lab.unit}</td>
                <td>${lab.date}</td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <h3>Patient Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <label>Patient</label>
                <span>${patient.initials} (${patient.age}${patient.gender ? patient.gender[0] : ''})</span>
            </div>
            <div class="summary-item">
                <label>NHS Number</label>
                <span>${patient.nhsNumber}</span>
            </div>
            <div class="summary-item full-width">
                <label>Conditions</label>
                <ul class="summary-list">${conditionsHtml}</ul>
            </div>
            <div class="summary-item full-width">
                <label>Current Medications</label>
                <ul class="summary-list">${medsHtml}</ul>
            </div>
            <div class="summary-item">
                <label>Allergies</label>
                <ul class="summary-list">${allergiesHtml}</ul>
            </div>
            <div class="summary-item full-width">
                <label>Recent Labs</label>
                <table class="labs-table">
                    <thead><tr><th>Test</th><th>Value</th><th>Date</th></tr></thead>
                    <tbody>${labsHtml}</tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Render action cards
 */
function renderActionCards() {
    const container = document.getElementById('action-cards');
    if (!container || !state.scenario) return;

    container.innerHTML = state.scenario.actions.map(action => {
        const status = state.actionsStatus[action.id];
        const cardClass = status !== 'pending' ? status : '';

        const evidenceHtml = action.evidence.map(e => `<li>${e}</li>`).join('');

        let buttonsHtml = '';
        if (status === 'pending') {
            buttonsHtml = `
                <div class="action-buttons">
                    <button class="btn-approve" onclick="handleActionButton('${action.id}', 'approved')">Approve</button>
                    <button class="btn-changes" onclick="handleActionButton('${action.id}', 'changes')">Needs Changes</button>
                    <button class="btn-reject" onclick="handleActionButton('${action.id}', 'rejected')">Reject</button>
                </div>
            `;
        } else {
            buttonsHtml = `<div class="action-status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</div>`;
        }

        // Show feedback for 'changes' status
        let feedbackHtml = '';
        if (status === 'changes') {
            feedbackHtml = `
                <div class="feedback-container">
                    <label>Clinician Feedback:</label>
                    <textarea readonly rows="2">${state.actionsFeedback[action.id]}</textarea>
                </div>
            `;
        }

        return `
            <div class="action-card ${cardClass}">
                <div class="action-header">
                    <h4>${action.title}</h4>
                    <span class="impact-badge ${action.impact.toLowerCase()}">${action.impact}</span>
                </div>
                <p class="action-rationale">${action.rationale}</p>
                <ul class="evidence-list">${evidenceHtml}</ul>
                ${buttonsHtml}
                ${feedbackHtml}
            </div>
        `;
    }).join('');
}

/**
 * Render clinician chat
 */
function renderClinicianChat() {
    const chatContainer = document.getElementById('clinician-chat-container');
    if (!chatContainer || !state.scenario) return;

    const messages = state.scenario.clinicianChat.slice(0, state.clinicianChatIndex);

    let html = messages.map(msg => {
        let avatarText = 'SYS';
        if (msg.role === 'assistant') avatarText = 'AI';
        if (msg.role === 'clinician') avatarText = 'DR';

        return `
            <div class="chat-message ${msg.role}">
                <div class="chat-avatar">${avatarText}</div>
                <div class="chat-bubble">${formatChatText(msg.text)}</div>
            </div>
        `;
    }).join('');

    // Add typing indicator if needed
    if (state.isTyping && state.currentPhase === 3) {
        html += `
            <div class="chat-message assistant">
                <div class="chat-avatar">AI</div>
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
    }

    chatContainer.innerHTML = html;
}

/**
 * Render Phase 4: Execution and Audit
 */
function renderPhase4() {
    const container = document.getElementById('phase-4');
    if (!container) return;

    container.classList.toggle('active', state.currentPhase === 4);

    if (!state.scenario) return;

    // Render audit timeline
    renderAuditTimeline();

    // Render audit details section
    renderAuditDetails();

    // Render notification preview
    renderNotificationPreview();
}

/**
 * Render the audit timeline
 */
function renderAuditTimeline() {
    const container = document.getElementById('audit-timeline');
    if (!container) return;

    container.innerHTML = state.auditEvents.map(event => {
        const timeStr = formatTime(event.timestamp);
        const actorClass = event.actor.toLowerCase();

        return `
            <div class="audit-event ${actorClass}">
                <div class="audit-timestamp">${timeStr}</div>
                <span class="audit-actor ${actorClass}">${event.actor}</span>
                <div class="audit-text">${event.text}</div>
                ${event.details ? `<div class="audit-details">${event.details}</div>` : ''}
            </div>
        `;
    }).join('');
}

/**
 * Render the audit details section (expandable)
 */
function renderAuditDetails() {
    const container = document.getElementById('audit-details-section');
    if (!container || !state.scenario) return;

    const dataHtml = state.scenario.dataAccessed.map(d =>
        `<li><strong>${d.item}</strong> (${d.code}) - ${d.date}</li>`
    ).join('');

    const guardrailsHtml = state.scenario.guardrails.map(g =>
        `<li>${g}</li>`
    ).join('');

    const expandedClass = state.auditDetailsExpanded ? 'expanded' : '';
    const chevron = state.auditDetailsExpanded ? '▼' : '▶';

    container.innerHTML = `
        <div class="audit-details-header" onclick="toggleAuditDetails()">
            <span>Audit Details</span>
            <span>${chevron}</span>
        </div>
        <div class="audit-details-content ${expandedClass}">
            <h5>Data Accessed</h5>
            <ul class="data-accessed-list">${dataHtml}</ul>
            <h5>Guardrails (What Was NOT Done)</h5>
            <ul class="guardrails-list">${guardrailsHtml}</ul>
        </div>
    `;
}

/**
 * Render the patient notification preview
 */
function renderNotificationPreview() {
    const container = document.getElementById('notification-preview');
    if (!container || !state.scenario) return;

    const approvedActions = state.scenario.actions.filter(
        a => state.actionsStatus[a.id] === 'approved'
    );

    if (approvedActions.length === 0 || !state.executionComplete) {
        container.innerHTML = `
            <div class="notification-preview" style="opacity: 0.5;">
                <div class="notification-header">NHS App Notification</div>
                <div class="notification-body" style="color: #768692; font-style: italic;">
                    Patient notification will appear here after execution...
                </div>
            </div>
        `;
        return;
    }

    // Show the first approved action's message
    const message = approvedActions[0].patientMessageDraft;

    container.innerHTML = `
        <div class="notification-preview">
            <div class="notification-header">NHS App - Message Sent to Patient</div>
            <div class="notification-body">${message}</div>
        </div>
    `;
}

/**
 * Render the control bar
 */
function renderControls() {
    const nextBtn = document.getElementById('btn-next');
    const executeBtn = document.getElementById('btn-execute');
    const progressText = document.getElementById('progress-text');

    if (!nextBtn || !executeBtn || !progressText) return;

    // Determine button states and text
    let nextDisabled = false;
    let nextText = 'Next';
    let showExecute = false;
    let executeDisabled = true;
    let progressStr = '';

    switch (state.currentPhase) {
        case 1:
            if (state.scanComplete) {
                nextText = 'Continue to Patient Chat';
            } else {
                nextText = state.scanIndex < 0 ? 'Start Scan' : 'Scan Next';
            }
            progressStr = `Scanning: ${Math.max(0, state.scanIndex + 1)}/${PATIENT_LIST.length}`;
            break;

        case 2:
            const totalPatientMsgs = state.scenario ? state.scenario.patientChat.length : 0;
            if (state.patientChatIndex >= totalPatientMsgs) {
                nextText = 'Continue to Clinician Review';
            }
            progressStr = `Patient Chat: ${state.patientChatIndex}/${totalPatientMsgs}`;
            nextDisabled = state.isTyping;
            break;

        case 3:
            const totalClinicianMsgs = state.scenario ? state.scenario.clinicianChat.length : 0;
            const allDecided = state.scenario && state.scenario.actions.every(
                a => state.actionsStatus[a.id] !== 'pending'
            );
            const hasApproved = state.scenario && state.scenario.actions.some(
                a => state.actionsStatus[a.id] === 'approved'
            );

            if (allDecided && hasApproved) {
                nextText = 'Continue to Execution';
            } else if (state.clinicianChatIndex >= totalClinicianMsgs) {
                nextText = 'Review actions above';
                nextDisabled = true;
            }
            progressStr = `Clinician Q&A: ${state.clinicianChatIndex}/${totalClinicianMsgs}`;
            nextDisabled = state.isTyping || (state.clinicianChatIndex >= totalClinicianMsgs && !hasApproved);
            break;

        case 4:
            showExecute = true;
            nextBtn.style.display = 'none';

            const approvedCount = state.scenario ? state.scenario.actions.filter(
                a => state.actionsStatus[a.id] === 'approved'
            ).length : 0;

            executeDisabled = state.executionStarted || approvedCount === 0;
            progressStr = state.executionComplete ?
                'Workflow Complete' :
                `${approvedCount} action(s) ready to execute`;
            break;
    }

    // Update UI
    if (state.currentPhase !== 4) {
        nextBtn.style.display = 'block';
        nextBtn.disabled = nextDisabled;
        nextBtn.textContent = nextText;
    }

    executeBtn.style.display = showExecute ? 'block' : 'none';
    executeBtn.disabled = executeDisabled;

    progressText.textContent = progressStr;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get a random typing delay (600-1200ms)
 */
function getRandomDelay() {
    return 600 + Math.random() * 600;
}

/**
 * Promise-based delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Scroll a chat container to the bottom
 */
function scrollChatToBottom(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 50);
    }
}

/**
 * Format a timestamp for display
 */
function formatTime(date) {
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Format chat text (simple markdown-like formatting)
 */
function formatChatText(text) {
    // Bold: **text** or __text__
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic: *text* or _text_
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.+?)_/g, '<em>$1</em>');

    // Line breaks
    text = text.replace(/\n/g, '<br>');

    // Simple bullet lists
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // Tables (simple markdown tables)
    if (text.includes('|')) {
        const lines = text.split('<br>');
        let inTable = false;
        let tableHtml = '';
        let newLines = [];

        for (const line of lines) {
            if (line.includes('|') && !line.match(/^\|[-:]+\|/)) {
                if (!inTable) {
                    inTable = true;
                    tableHtml = '<table>';
                }
                const cells = line.split('|').filter(c => c.trim());
                const isHeader = tableHtml === '<table>';
                const cellTag = isHeader ? 'th' : 'td';
                tableHtml += '<tr>' + cells.map(c => `<${cellTag}>${c.trim()}</${cellTag}>`).join('') + '</tr>';
            } else if (line.match(/^\|[-:]+\|/)) {
                // Skip separator line
                continue;
            } else {
                if (inTable) {
                    inTable = false;
                    tableHtml += '</table>';
                    newLines.push(tableHtml);
                    tableHtml = '';
                }
                newLines.push(line);
            }
        }
        if (inTable) {
            tableHtml += '</table>';
            newLines.push(tableHtml);
        }
        text = newLines.join('<br>');
    }

    return text;
}

// ============================================================
// INITIALIZATION
// ============================================================

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', init);
