const GatewayConfig = {
    mainHeader: "ALMOST DONE!",
    instructionText: "To claim your <span class='highlight-yellow'>99 nights reward you selected</span>, simply complete <span class='highlight-yellow'>one quick offer</span> from the list below 👇",
    subInstructionText: "This step verifies that you are a real user and prevents bots from abusing the rewards.",
    pillNote: "Everything is <span class='highlight-yellow'>safe and secure</span> and follows official Roblox promotional partner systems.",
    
    // [BEGINNER] Paste your smartlinks or offer links here
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
    
    // [INTERMEDIATE] Set your target destination here
    autoRedirectOnUnlock: true,
    fallbackRedirectUrl: "https://your-final-destination-reward.com",
    
    // [PROFESSIONAL] Add your custom server postback validation API here if needed
    onUnlockSuccess: function() {
        console.log("Gateway unlocked. Token generated successfully.");
    }
};

(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        .v-gateway-blur-bg {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(5px);
            display: flex; align-items: center; justify-content: center;
            z-index: 999999; opacity: 0; pointer-events: none;
            transition: opacity 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            padding: 15px; box-sizing: border-box;
        }
        .v-gateway-blur-bg.active { opacity: 1; pointer-events: auto; }
        .v-gateway-card {
            background: linear-gradient(rgba(10, 15, 30, 0.88), rgba(10, 15, 30, 0.95)), url('../../images/bg2.png') center/cover no-repeat;
            width: 100%; max-width: 540px;
            border-radius: 24px; overflow: hidden;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(255,255,255,0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex; flex-direction: column; align-items: center;
            position: relative; animation: slideUp 0.5s ease;
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .v-gateway-header {
            color: #facc15; font-family: 'Luckiest Guy', 'Bungee', sans-serif;
            font-size: 36px; font-weight: 900; margin: 30px 0 10px 0;
            text-shadow: 0 4px 0px #000, 0 0 15px rgba(250, 204, 21, 0.4);
            letter-spacing: 1px; text-align: center; width: 100%;
        }
        .v-gateway-instruction-box {
            background: rgba(14, 26, 61, 0.9);
            border-radius: 16px; padding: 22px; width: 90%;
            margin: 10px auto 20px auto; box-sizing: border-box;
            border: 2px solid #2563eb;
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
            text-align: center;
        }
        .v-gateway-main-text {
            color: #ffffff; font-size: 16px; font-weight: bold;
            line-height: 1.6; margin-bottom: 12px; font-family: sans-serif;
        }
        .v-gateway-sub-text {
            color: #cbd5e1; font-size: 14px; line-height: 1.5;
            margin-bottom: 15px; font-family: sans-serif;
        }
        .highlight-yellow { color: #facc15; font-weight: bold; }
        .v-gateway-pill-note {
            background: rgba(7, 13, 31, 0.9); border-radius: 10px;
            padding: 10px 15px; font-size: 12px; color: #94a3b8;
            line-height: 1.4; font-family: sans-serif; display: inline-block;
        }
        .v-gateway-list {
            width: 90%; display: flex; flex-direction: column;
            gap: 12px; margin-bottom: 15px; box-sizing: border-box;
        }
        .v-gateway-btn {
            background: linear-gradient(180deg, #facc15 0%, #ca8a04 100%);
            color: #0b0f19; font-size: 16px; font-weight: 800;
            padding: 14px 20px; border-radius: 14px; text-decoration: none;
            text-align: center; display: block; font-family: sans-serif;
            border-bottom: 4px solid #854d0e; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: all 0.15s ease; box-sizing: border-box;
        }
        .v-gateway-btn:hover {
            transform: translateY(-1px); filter: brightness(1.1);
            box-shadow: 0 6px 14px rgba(250, 204, 21, 0.2);
        }
        .v-gateway-btn:active {
            transform: translateY(3px); border-bottom-width: 1px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }
        .v-action-verify-btn {
            background: linear-gradient(180deg, #22c55e 0%, #15803d 100%) !important;
            border-bottom-color: #166534 !important;
            color: #ffffff !important;
            display: none; width: 90%; margin-bottom: 15px;
        }
        .v-gateway-status-area {
            display: flex; align-items: center; justify-content: center;
            gap: 10px; color: #4ade80; font-size: 13px; font-weight: 600;
            margin: 5px 0 25px 0; font-family: sans-serif;
        }
        .v-gateway-spinner {
            width: 14px; height: 14px; border: 2px solid rgba(74, 222, 128, 0.2);
            border-top-color: #4ade80; border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .v-gateway-footer-bar {
            background: #090d16; width: 100%; text-align: center;
            padding: 12px 10px; box-sizing: border-box;
            border-top: 1px solid rgba(255,255,255,0.05);
            color: #94a3b8; font-size: 12px; font-family: sans-serif;
        }
        @media(max-width: 480deg) {
            .v-gateway-header { font-size: 28px; margin: 20px 0 10px 0; }
            .v-gateway-instruction-box { padding: 15px; width: 92%; }
            .v-gateway-main-text { font-size: 14px; }
            .v-gateway-sub-text, .v-gateway-pill-note { font-size: 11px; }
            .v-gateway-btn { font-size: 14px; padding: 12px 15px; }
            .v-gateway-list { width: 92%; }
        }
    `;
    document.head.appendChild(style);

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

function executeUnlockAction() {
    GatewayConfig.onUnlockSuccess();
    
    if (GatewayConfig.autoRedirectOnUnlock && GatewayConfig.fallbackRedirectUrl) {
        window.location.href = GatewayConfig.fallbackRedirectUrl;
    } else {
        closeVerificationGateway();
    }
}

function openVerificationGateway() {
    const gateway = document.getElementById('verificationGatewayOverlay');
    if (gateway) gateway.classList.add('active');
}

function closeVerificationGateway() {
    const gateway = document.getElementById('verificationGatewayOverlay');
    if (gateway) gateway.classList.remove('active');
}

window.call_locker_onclick = function() {
    openVerificationGateway();
};

document.addEventListener("DOMContentLoaded", function() {
    const triggerBtn = document.getElementById('cta-accept-inline') || document.querySelector('.btn-accept');
    if (triggerBtn) {
        triggerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openVerificationGateway();
        });
    }
});