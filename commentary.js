/**
 * MedGuard Demo - Commentary System
 * Shows NHS-styled callout bubbles at key workflow moments
 */

const COMMENTARY_CONFIG = {
    entries: [
        {
            step: 0,
            targetSelector: '#patient-list',
            position: 'right',
            title: 'AI-Powered Monitoring',
            text: 'MedGuard continuously monitors patient records, cross-referencing medications with lab results to identify potential safety issues.'
        },
        {
            step: 3,
            targetSelector: '.patient-row.flagged',
            position: 'right',
            title: 'Safety Alert Detected',
            text: 'The AI has detected that this patient is taking NSAIDs while showing declining kidney function - a known safety concern per NICE guidelines.'
        },
        {
            step: 4,
            targetSelector: '#iphone-mockup',
            position: 'left',
            title: 'Patient Engagement',
            text: 'Rather than alerting the patient directly about a clinical concern, MedGuard gathers information through natural conversation to confirm the situation.'
        },
        {
            step: 8,
            targetSelector: '#iphone-mockup',
            position: 'left',
            title: 'Critical Information',
            text: 'The patient reveals over-the-counter ibuprofen use - information not in their medical record but crucial for clinical decision-making.'
        },
        {
            step: 10,
            targetSelector: '#issue-card',
            position: 'right',
            title: 'Human-in-the-Loop',
            text: 'All clinical decisions require explicit clinician approval. The AI presents evidence but never acts autonomously on patient care.'
        },
        {
            step: 11,
            targetSelector: '.decision-status.agreed',
            position: 'right',
            title: 'Clinician Validation',
            text: 'The clinician reviews the AI assessment and confirms agreement. This creates an auditable record of human oversight.'
        },
        {
            step: 12,
            targetSelector: '#action-1-approve',
            position: 'right',
            title: 'Approval Required',
            text: 'The AI agent wants to contact the patient to advise them to stop taking ibuprofen. Before any message is sent, the clinician must review and approve the action.'
        },
        {
            step: 14,
            targetSelector: '#audit-timeline',
            position: 'top',
            title: 'Execution & Audit Trail',
            text: 'Approved actions are executed automatically, with every step recorded for full traceability and clinical governance.'
        },
        {
            step: 19,
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
            </div>
        `;
        document.body.appendChild(this.bubbleElement);

        // Add toggle button to header
        this.createToggleButton();

        // Reposition on window resize
        window.addEventListener('resize', () => {
            if (this.bubbleElement.classList.contains('visible')) {
                const currentStep = this.getCurrentStep();
                if (currentStep !== null) {
                    this.showForStep(currentStep);
                }
            }
        });
    },

    getCurrentStep() {
        const entry = COMMENTARY_CONFIG.entries.find(e =>
            this.bubbleElement.dataset.step === String(e.step)
        );
        return entry ? entry.step : null;
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

        // Reset classes and set position
        this.bubbleElement.className = `commentary-bubble position-${entry.position}`;

        // Position the bubble relative to target element (with slight delay for DOM updates)
        setTimeout(() => {
            this.positionBubble(entry.targetSelector, entry.position);

            // Show bubble
            requestAnimationFrame(() => {
                this.bubbleElement.classList.add('visible');
            });
        }, 100);
    },

    positionBubble(targetSelector, position) {
        const target = document.querySelector(targetSelector);

        if (!target || !target.offsetParent) {
            // Fallback: position in content area
            this.bubbleElement.style.left = '50%';
            this.bubbleElement.style.top = '200px';
            this.bubbleElement.style.transform = 'translateX(-50%)';
            return;
        }

        const targetRect = target.getBoundingClientRect();
        const bubbleWidth = 300;
        const bubbleHeight = this.bubbleElement.offsetHeight || 150;
        const offset = 20; // Gap between target and bubble

        let left, top;

        switch (position) {
            case 'right':
                left = targetRect.right + offset;
                top = targetRect.top + Math.min(30, targetRect.height / 4);
                break;
            case 'left':
                left = targetRect.left - bubbleWidth - offset;
                top = targetRect.top + Math.min(30, targetRect.height / 4);
                break;
            case 'top':
                left = targetRect.left + (targetRect.width / 2) - (bubbleWidth / 2);
                top = targetRect.top - bubbleHeight - offset;
                break;
            case 'bottom':
                left = targetRect.left + (targetRect.width / 2) - (bubbleWidth / 2);
                top = targetRect.bottom + offset;
                break;
            default:
                left = targetRect.right + offset;
                top = targetRect.top;
        }

        // Clamp to viewport
        const maxLeft = window.innerWidth - bubbleWidth - 20;
        const maxTop = window.innerHeight - bubbleHeight - 20;
        left = Math.max(20, Math.min(left, maxLeft));
        top = Math.max(80, Math.min(top, maxTop)); // 80 to stay below header

        this.bubbleElement.style.left = `${left}px`;
        this.bubbleElement.style.top = `${top}px`;
        this.bubbleElement.style.transform = 'none';
    },

    hide() {
        this.bubbleElement.classList.remove('visible');
        delete this.bubbleElement.dataset.step;
    }
};
