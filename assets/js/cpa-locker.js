/**
 * CONTENT VERIFICATION GATEWAY ENGINE
 * Production-ready asynchronous locking system with customizable offer configurations,
 * optimized UI overlays, performance animations, and dynamic state validation rules.
 *
 * @category  Front-end Security
 * @package   ContentVerificationGateway
 * @author    Amarire Dev <contact@amarire.dev>
 * @homepage  https://amarire.dev
 * @license   MIT
 */

/**
 * @typedef {Object} Offer
 * @property {string} text - Display text for the offer button item.
 * @property {string} url - Target CPA network destination URL.
 */

/**
 * Gateway core configuration and localized UI string matrix.
 * @type {Object}
 */
const GatewayConfig = {
    mainHeader: "ALMOST DONE!",
    instructionText: "To claim your <span class='highlight-yellow'>99 nights reward you selected</span>, simply complete <span class='highlight-yellow'>one quick offer</span> from the list below 👇",
    subInstructionText: "This step verifies that you are a real user and prevents bots from abusing the rewards.",
    pillNote: "Everything is <span class='highlight-yellow'>safe and secure</span> and follows official Roblox promotional partner systems.",
    
    /** @type {Offer[]} */
    offers: [
        {
            text: "Enter details to download new content!",
            url: "https://example-link1.com/offer1"
        },
        {
            text: "Tap to claim your reward!",
            url: "https://example-link2.com/offer2"
        },
        {
            text: "Claim your exclusive bonus now!",
            url: "https://example-link3.com/offer3"
        }
    ],
    
    statusText: "Waiting for verification",
    verifyingText: "Checking completion status...",
    actionRequiredText: "Action detected! Click below to finalize.",
    verifyBtnText: "Verify Completion Now",
    footerText: "It's free and takes only 2 or 3 minutes to complete",
    
    autoRedirectOnUnlock: true,
    fallbackRedirectUrl: "https://your-final-destination-reward.com",
    
    /**
     * Internal callback triggered upon successful validation.
     */
    onUnlockSuccess: function() {
        console.log("Gateway unlocked. Token generated successfully.");
    }
};

(function() {
    'use strict';

    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = 'cpa-locker.css'; 
    document.head.appendChild(styleLink);

    const overlay = document.createElement('div');
    overlay.className = 'v-gateway-blur-bg';
    overlay.id = 'verificationGatewayOverlay';

    let itemsHTML = '';
    GatewayConfig.offers.forEach(offer => {
        itemsHTML += `<a href="${offer.url}" target="_blank" class="v-gateway-btn v-offer-link-item">${offer.text}</a>`;
    });

    overlay.innerHTML = `
        <div class="v-gateway-card">
            <div class="v-gateway-header">${GatewayConfig.mainHeader}</div>
            <div class="v-gateway-instruction-box">
                <div class="v-gateway-main-text">${GatewayConfig.instructionText}</div>
                <div class="v-gateway-sub-text">${GatewayConfig.subInstructionText}</div>
                <div class="v-gateway-pill-note">${GatewayConfig.pillNote}</div>
            </div>
            <div class="v-gateway-list">${itemsHTML}</div>
            <button id="vManualVerifyBtn" class="v-gateway-btn v-action-verify-btn">${GatewayConfig.verifyBtnText}</button>
            <div class="v-gateway-status-area">
                <div class="v-gateway-spinner"></div>
                <span id="vGatewayStatusText">${GatewayConfig.statusText}</span>
            </div>
            <div class="v-gateway-footer-bar">${GatewayConfig.footerText}</div>
        </div>
    `;
    document.body.appendChild(overlay);

    setupGatewayEvents();
})();

/**
 * Binds user interaction event listeners to offer elements and manual validation triggers.
 * @returns {void}
 */
function setupGatewayEvents() {
    const offerButtons = document.querySelectorAll('.v-offer-link-item');
    const statusText = document.getElementById('vGatewayStatusText');
    const verifyBtn = document.getElementById('vManualVerifyBtn');

    offerButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            statusText.innerText = GatewayConfig.actionRequiredText;
            statusText.style.color = "#facc15";
            verifyBtn.style.display = "block";
        });
    });

    verifyBtn.addEventListener('click', function() {
        verifyBtn.disabled = true;
        verifyBtn.style.opacity = "0.7";
        statusText.innerText = GatewayConfig.verifyingText;
        statusText.style.color = "#60a5fa";

        setTimeout(function() {
            executeUnlockAction();
        }, 2500);
    });
}

/**
 * Dispatches the unlock success sequence and handles post-verification routing.
 * @returns {void}
 */
function executeUnlockAction() {
    GatewayConfig.onUnlockSuccess();
    
    if (GatewayConfig.autoRedirectOnUnlock && GatewayConfig.fallbackRedirectUrl) {
        window.location.href = GatewayConfig.fallbackRedirectUrl;
    } else {
        closeVerificationGateway();
    }
}

/**
 * Mounts the locker interface overlay onto the current view state.
 * @returns {void}
 */
function openVerificationGateway() {
    const gateway = document.getElementById('verificationGatewayOverlay');
    if (gateway) gateway.classList.add('active');
}

/**
 * Unmounts the locker interface overlay and restores screen interaction.
 * @returns {void}
 */
function closeVerificationGateway() {
    const gateway = document.getElementById('verificationGatewayOverlay');
    if (gateway) gateway.classList.remove('active');
}

/**
 * Global API hook mapping for inline element execution.
 */
window.call_locker_onclick = function() {
    openVerificationGateway();
};

/**
 * Document lifecycle listener initializing event routing for primary CTA anchors.
 */
document.addEventListener("DOMContentLoaded", function() {
    const triggerBtn = document.getElementById('cta-accept-inline') || document.querySelector('.btn-accept');
    if (triggerBtn) {
        triggerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openVerificationGateway();
        });
    }
});