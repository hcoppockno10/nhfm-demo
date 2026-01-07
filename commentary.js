/**
 * NHFM Demo - Commentary System
 * Shows NHS-styled callout bubbles at key workflow moments
 */

const COMMENTARY_CONFIG = {
    entries: [
        {
            step: 0,
            targetSelector: '#patient-list',
            position: 'right',
            title: 'AI-Powered Monitoring',
            text: 'NHFM autonomously monitors patient records to identify potential medication safety issues.'
        },
        {
            step: 3,
            targetSelector: '.patient-row.flagged',
            position: 'right',
            title: 'Safety Alert Detected',
            text: 'NHFM has detected declining kidney function. There is no record of NSAID use (known safety concern per NICE guidelines) in the records but NHFM flags for further investigation.'
        },
        {
            step: 4,
            targetSelector: '#iphone-mockup',
            position: 'left',
            title: 'Patient Engagement',
            text: 'NHFM can interact with patients through the NHS app in a heavily guardrailed chat interface. It can gather information but never provide medical advice without clinician oversight.'
        },
        {
            step: 9,
            targetSelector: '#iphone-mockup',
            position: 'left',
            title: 'Critical Information',
            text: 'The patient reveals over-the-counter ibuprofen use - information not in their medical record but crucial for clinical decision-making.'
        },
        {
            step: 11,
            targetSelector: '#issue-card',
            position: 'right',
            title: 'Human-in-the-Loop',
            text: 'All clinical decisions and actions require explicit clinician approval..'
        },
        {
            step: 12,
            targetSelector: '.decision-status.agreed',
            position: 'right',
            title: 'Clinician Validation',
            text: 'The clinician reviews the AI assessment and confirms agreement. This creates an auditable record of human oversight.'
        },
        {
            step: 13,
            targetSelector: '#action-1-approve',
            position: 'right',
            title: 'Approval Required',
            text: 'The AI agent wants to contact the patient to advise them to stop taking ibuprofen. Before any message is sent, the clinician must review and approve the action.'
        },
        {
            step: 15,
            targetSelector: '#audit-timeline',
            position: 'top',
            title: 'Execution & Audit Trail',
            text: 'Approved actions are executed automatically, with every step recorded for full traceability and clinical governance.'
        },
        {
            step: 20,
            targetSelector: '#audit-timeline',
            position: 'top',
            title: 'Workflow Complete',
            text: 'The safety intervention is complete. The audit trail provides full accountability from detection through resolution.'
        }
    ]
};

const CommentarySystem = {
    bubbleElement: null,
    enabled: true,
    waitingForNext: false,
    nextResolve: null,

    init() {
        // Create the commentary bubble element
        this.bubbleElement = document.createElement('div');
        this.bubbleElement.className = 'commentary-bubble';
        this.bubbleElement.innerHTML = `
            <div class="commentary-bubble-header">
                <span class="commentary-bubble-title"></span>
            </div>
            <div class="commentary-bubble-body">
                <p class="commentary-bubble-text"></p>
                <button class="commentary-next-btn">Next</button>
            </div>
        `;
        document.body.appendChild(this.bubbleElement);

        // Add click handler for Next button
        this.bubbleElement.querySelector('.commentary-next-btn').addEventListener('click', () => {
            this.onNextClick();
        });

        // Add toggle button to header
        this.createToggleButton();
    },

    createToggleButton() {
        const headerControls = document.querySelector('.header-controls');
        if (!headerControls) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'commentary-toggle';
        toggleBtn.className = 'commentary-toggle active';
        toggleBtn.innerHTML = `
            <span class="commentary-toggle-icon"></span>
            <span>Commentary</span>
        `;
        toggleBtn.addEventListener('click', () => this.toggle());

        // Insert at the beginning of header controls
        headerControls.insertBefore(toggleBtn, headerControls.firstChild);
    },

    toggle() {
        this.enabled = !this.enabled;
        const toggleBtn = document.getElementById('commentary-toggle');
        if (toggleBtn) {
            toggleBtn.classList.toggle('active', this.enabled);
        }

        if (!this.enabled) {
            // Cancel any pending wait so demo continues playing
            this.cancelWait();
            this.hide();
        } else {
            // Re-show for current step if applicable
            if (typeof state !== 'undefined') {
                this.showForStep(state.stepIndex);
            }
        }
    },

    showForStep(stepIndex) {
        if (!this.enabled) return;

        const entry = COMMENTARY_CONFIG.entries.find(e => e.step === stepIndex);

        if (!entry) {
            this.hide();
            return;
        }

        // Store current step
        this.bubbleElement.dataset.step = String(stepIndex);

        // Update content
        this.bubbleElement.querySelector('.commentary-bubble-title').textContent = entry.title;
        this.bubbleElement.querySelector('.commentary-bubble-text').textContent = entry.text;

        // Fixed position on right side - no dynamic positioning needed
        this.bubbleElement.className = 'commentary-bubble fixed-right';

        // Show bubble
        requestAnimationFrame(() => {
            this.bubbleElement.classList.add('visible');
        });
    },

    hide() {
        this.bubbleElement.classList.remove('visible');
        delete this.bubbleElement.dataset.step;
    },

    // Called when user clicks the Next button
    onNextClick() {
        if (this.nextResolve) {
            this.waitingForNext = false;
            this.nextResolve();
            this.nextResolve = null;
        }
        this.hide();

        // If demo isn't playing, start it
        if (typeof state !== 'undefined' && !state.isPlaying) {
            startDemo();
        }
    },

    // Returns a promise that resolves when user clicks Next
    // Call this after showing commentary to pause the demo
    waitForNext() {
        if (!this.enabled || !this.bubbleElement.classList.contains('visible')) {
            return Promise.resolve();
        }
        this.waitingForNext = true;
        return new Promise(resolve => {
            this.nextResolve = resolve;
        });
    },

    // Check if we're currently waiting for user to click Next
    isWaiting() {
        return this.waitingForNext;
    },

    // Cancel waiting (e.g., when demo is reset)
    cancelWait() {
        if (this.nextResolve) {
            this.waitingForNext = false;
            this.nextResolve();
            this.nextResolve = null;
        }
    }
};
