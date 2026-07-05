/**
 * APPLICATION FRONTEND ENGINE
 * Production-ready enterprise implementation handling UI transitions, 
 * synchronized audio contexts, hardware-accelerated animations, and external services.
 *
 * @category  Front-end Core
 * @package   ApplicationFrontendEngine
 * @author    Amarire Dev <contact@amarire.dev>
 * @homepage  https://amarire.dev
 * @license   MIT
 */


/**
 * APPLICATION FRONTEND ENGINE
 * Production-ready enterprise implementation handling UI transitions, 
 * synchronized audio contexts, hardware-accelerated animations, and external services.
 * Optimized for open-source deployment on GitHub.
 */
(() => {
    'use strict';

    const silent = p => p?.catch(() => {});

    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = AC ? new AC() : null;
    const audioBuffers = {};
    let unlocked = false;

    const GESTURE_EVENTS = ['touchstart', 'pointerdown', 'mousedown', 'keydown'];

    function unlock() {
        if (unlocked || !ctx) return;
        ctx.resume().then(() => {
            unlocked = true;
            GESTURE_EVENTS.forEach(ev => document.removeEventListener(ev, unlock));
        }).catch(() => {});
    }
    GESTURE_EVENTS.forEach(ev => document.addEventListener(ev, unlock, { once: true, passive: true }));

    const initAudioEngine = () => {
        if (!ctx) return;
        const elements = {
            click: document.getElementById('clickSound'),
            ding: document.getElementById('dingSound'),
            success: document.getElementById('successSound'),
            verify: document.getElementById('verifySound')
        };
        Object.entries(elements).forEach(([key, el]) => {
            if (!el) return;
            const src = el.currentSrc || el.src;
            if (!src) return;
            fetch(src)
                .then(r => r.arrayBuffer())
                .then(buf => ctx.decodeAudioData(buf))
                .then(decoded => { audioBuffers[key] = decoded; })
                .catch(() => {});
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudioEngine);
    } else {
        initAudioEngine();
    }

    function playBuffer(key, vol = 1) {
        if (!ctx || !audioBuffers[key]) return;
        if (ctx.state === 'suspended') silent(ctx.resume());
        try {
            const source = ctx.createBufferSource();
            source.buffer = audioBuffers[key];
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            source.connect(gain).connect(ctx.destination);
            source.start(0);
        } catch (e) {}
    }

    window.GAG_SFX = {
        click:   () => playBuffer('click', 1),
        ding:    () => playBuffer('ding', 1),
        success: () => playBuffer('success', 1),
        verify:  () => playBuffer('verify', 1),
        decline: () => {
            if (!ctx) return;
            if (ctx.state === 'suspended') silent(ctx.resume());
            const now = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain();
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(420, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);
            gain.gain.setValueAtTime(0.001, now); gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now + 0.32);
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    const UI_TIMEOUT = {
        DESELECT: 250, SHAKE: 350, POP: 400,
        LOADER_MIN: 1500, LOADER_REMOVE: 400, FLY_FALLBACK: 900,
        VERIFY: 5000, SEARCH: 4000 
    };

    const UI = {
        loader: document.getElementById('page-loader'),
        slotsContainer: document.getElementById('slots'),
        continueBtn: document.getElementById('continue-btn'),
        galleryContainer: document.getElementById('gallery'),
        imgContainers: document.querySelectorAll('#gallery .img-container'),
        popup: document.getElementById('purchase-popup'),
        popupTitle: document.getElementById('popup-title'),
        popupCancel: document.getElementById('popup-cancel'),
        popupSearch: document.getElementById('popup-search'),
        popupThumbs: document.getElementById('popup-thumbs'),
        usernameInput: document.getElementById('popup-username'),
        usernameLabel: document.getElementById('popup-username-label'),
        userError: document.getElementById('popup-user-error'),
        avatar: document.getElementById('popup-avatar'),
        stepInput: document.getElementById('popup-step-input'),
        stepSearch: document.getElementById('popup-step-search'),
        searchingText: document.getElementById('searching-text'),
        stepSuccess: document.getElementById('popup-step-success'),
        stepVerify: document.getElementById('popup-step-verify'),
        editBtn: document.getElementById('edit-btn'),
        lockerBtn: document.getElementById('locker-btn'),
        spinner: document.getElementById('verify-spinner'),
        verifyText: document.getElementById('verify-text'),
        ctaInline: document.getElementById('post-cta-inline')
    };

    if (UI.loader) {
        const minTimePromise = new Promise(res => setTimeout(res, UI_TIMEOUT.LOADER_MIN));
        const pageLoadPromise = document.readyState === 'complete' ? Promise.resolve() : new Promise(res => window.addEventListener('load', res));
        Promise.all([minTimePromise, pageLoadPromise]).then(() => {
            UI.loader.classList.add('hide');
            document.documentElement.classList.remove('pl-lock');
            document.body.classList.remove('pl-lock');
            setTimeout(() => UI.loader.remove(), UI_TIMEOUT.LOADER_REMOVE);
        });
    }

    const MAX_SECTIONS = 3;
    let selectedItems = [];
    let animatingCount = 0;
    let isProcessing = false;

    function currentCount() { return selectedItems.length + animatingCount; }

    function updateGalleryState() {
        if (currentCount() >= MAX_SECTIONS) {
            UI.galleryContainer.classList.add('max-reached');
            document.body.classList.add('cap-reached');
        } else {
            UI.galleryContainer.classList.remove('max-reached');
            document.body.classList.remove('cap-reached');
        }
    }

    UI.imgContainers.forEach((card, index) => {
        card.setAttribute('data-index', index);
        const originalImg = card.querySelector('.pet');
        const originalCaption = card.querySelector('.img-caption');
        const petSrc = originalImg ? originalImg.src : '';

        const slotCard = document.createElement('div');
        slotCard.className = 'slot-card';
        slotCard.innerHTML = `<img class="pet" decoding="async" width="120" height="120" src="${petSrc}"><div class="img-caption">${originalCaption ? originalCaption.innerHTML : ''}</div>`;
        card.cachedSlotCard = slotCard;

        const flyingElem = document.createElement('div');
        flyingElem.className = 'flying-element';
        flyingElem.innerHTML = `<div class="fly-inner"><img class="pet fly-pet" decoding="async" src="${petSrc}"></div>`;
        card.cachedFlyingElem = flyingElem;

        const popupCardItem = document.createElement('div');
        popupCardItem.className = 'popup-card-item';
        popupCardItem.innerHTML = `<img class="pet" decoding="async" src="${petSrc}"><div class="img-caption">${originalCaption ? originalCaption.innerHTML : ''}</div>`;
        card.cachedPopupCard = popupCardItem;

        const claimBtn = document.createElement('button');
        claimBtn.type = 'button';
        claimBtn.className = 'claim-btn';
        claimBtn.innerHTML = '<span class="label">Claim</span>';
        card.appendChild(claimBtn);

        card.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isProcessing) return;

            if (card.classList.contains('selected')) {
                isProcessing = true;
                deselectCard(card);
                window.GAG_SFX?.click?.();
                setTimeout(() => { isProcessing = false; }, UI_TIMEOUT.DESELECT);
            } else {
                if (currentCount() >= MAX_SECTIONS) {
                    window.GAG_SFX?.decline?.();
                    UI.slotsContainer.classList.add('shake');
                    setTimeout(() => UI.slotsContainer.classList.remove('shake'), UI_TIMEOUT.SHAKE);
                    return;
                }
                const nextSlotIndex = currentCount();
                const targetSlot = document.getElementById(`slot${nextSlotIndex + 1}`);

                if (targetSlot && originalImg) {
                    isProcessing = true;
                    window.GAG_SFX?.ding?.();
                    animatingCount++;
                    card.classList.add('selected');
                    updateGalleryState();
                    
                    requestAnimationFrame(() => {
                        animateFlyEffect(card, targetSlot, nextSlotIndex + 1, () => {
                            animatingCount--;
                            selectCard(card);
                            isProcessing = false;
                        });
                    });
                }
            }
        });
    });

    function animateFlyEffect(sourceCard, targetSlot, targetSlotNum, onComplete) {
        const frame = sourceCard.querySelector('.frame');
        const sourceElement = frame || sourceCard;
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetSlot.getBoundingClientRect();
        const flyingElem = sourceCard.cachedFlyingElem;

        if (!flyingElem) { onComplete(); return; }
        if (frame) frame.setAttribute('data-used', 'true');

        const sourceCenterX = sourceRect.left + sourceRect.width / 2;
        const sourceCenterY = sourceRect.top + sourceRect.height / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        flyingElem.style.transition = 'none';
        flyingElem.style.display = 'block';
        flyingElem.style.opacity = '1';
        flyingElem.style.width = `${sourceRect.width}px`;
        flyingElem.style.height = `${sourceRect.height}px`;
        flyingElem.style.left = `${sourceCenterX - sourceRect.width / 2}px`;
        flyingElem.style.top = `${sourceCenterY - sourceRect.height / 2}px`;
        flyingElem.style.transform = 'translate3d(0,0,0) scale(1)';

        document.body.appendChild(flyingElem);
        void flyingElem.offsetWidth;

        requestAnimationFrame(() => {
            flyingElem.style.transition = 'transform var(--fly-duration,.55s) cubic-bezier(.22,.61,.36,1), opacity .25s linear';
            flyingElem.style.transform = `translate3d(${targetCenterX - sourceCenterX}px,${targetCenterY - sourceCenterY}px,0) scale(${Math.min(targetRect.width / sourceRect.width, targetRect.height / sourceRect.height)})`;
        });

        let finished = false;
        const cleanup = () => {
            if (finished) return; finished = true;
            flyingElem.remove(); onComplete();
            const slot = document.getElementById(`slot${targetSlotNum}`);
            if (slot) {
                slot.classList.add('pop-effect');
                setTimeout(() => slot.classList.remove('pop-effect'), UI_TIMEOUT.POP);
            }
        };
        const fallback = setTimeout(cleanup, UI_TIMEOUT.FLY_FALLBACK);
        flyingElem.addEventListener('transitionend', () => { clearTimeout(fallback); cleanup(); }, { once: true });
    }

    function selectCard(card) {
        if (selectedItems.includes(card) || selectedItems.length >= MAX_SECTIONS) return;
        selectedItems.push(card);
        renderSlots();
    }

    function deselectCard(card) {
        card.classList.remove('selected');
        const frame = card.querySelector('.frame');
        if (frame) frame.setAttribute('data-used', 'false');
        selectedItems = selectedItems.filter(item => item !== card);
        renderSlots();
    }

    function renderSlots() {
        for (let i = 1; i <= 3; i++) {
            const slot = document.getElementById(`slot${i}`);
            if (!slot) continue;
            const card = selectedItems[i - 1];
            if (card) {
                if (slot.firstElementChild !== card.cachedSlotCard) {
                    card.cachedSlotCard.onclick = (e) => {
                        e.stopPropagation();
                        if (isProcessing) return;
                        isProcessing = true;
                        deselectCard(card);
                        window.GAG_SFX?.click?.();
                        setTimeout(() => { isProcessing = false; }, UI_TIMEOUT.DESELECT);
                    };
                    slot.replaceChildren(card.cachedSlotCard);
                }
            } else {
                slot.replaceChildren();
            }
        }
        const hasItems = selectedItems.length >= 1;
        UI.continueBtn.style.display = hasItems ? 'block' : 'none';
        updateGalleryState();
    }

    if (UI.usernameInput) {
        UI.usernameInput.addEventListener('input', (e) => {
            let val = e.target.value;
            let hasAt = val.startsWith('@');
            let core = hasAt ? val.slice(1) : val;
            
            core = core.replace(/[^a-zA-Z0-9_]/g, '');
            if (core.length > 20) core = core.slice(0, 20);
            
            e.target.value = hasAt ? '@' + core : core;
        });
    }

    UI.continueBtn.addEventListener('click', () => {
        window.GAG_SFX?.click?.();
        UI.popup.style.display = 'flex';
        UI.popupTitle.textContent = 'REWARDS SELECTED';
        document.documentElement.classList.add('pl-lock');
        document.body.classList.add('pl-lock');
        
        UI.popupThumbs.replaceChildren();
        selectedItems.forEach(card => {
            if (card.cachedPopupCard) UI.popupThumbs.appendChild(card.cachedPopupCard.cloneNode(true));
        });

        UI.stepInput.style.display = 'block';
        UI.stepSearch.style.display = 'none';
        UI.stepSuccess.style.display = 'none';
        UI.stepVerify.style.display = 'none';
        UI.userError.style.display = 'none';
    });

    UI.popupCancel.addEventListener('click', () => {
        window.GAG_SFX?.click?.();
        UI.popup.style.display = 'none';
        document.documentElement.classList.remove('pl-lock');
        document.body.classList.remove('pl-lock');
    });

    UI.popupSearch.addEventListener('click', async () => {
        const rawValue = UI.usernameInput.value.trim();
        const coreUsername = rawValue.startsWith('@') ? rawValue.slice(1) : rawValue;

        if (!window.RobloxService) {
            console.error("Critical: userService.js core module is missing.");
            return;
        }

        const isSyntaxValid = window.RobloxService.validateSyntax(coreUsername);

        if (!isSyntaxValid) {
            window.GAG_SFX?.decline?.();
            UI.userError.textContent = "Username not found";
            UI.userError.style.display = 'block';
            return;
        }

        UI.userError.style.display = 'none';
        UI.popupTitle.textContent = 'CHECKING USERNAME';

        const lookupPhrases = [
            'CONNECTING TO SECURE API...',
            'FETCHING PLATFORM RECORDS...',
            'VERIFYING USER DATA...',
            'SYNCING SELECTED REWARDS...'
        ];
        
        let phraseIdx = 0;
        UI.searchingText.textContent = lookupPhrases[0];
        UI.stepInput.style.display = 'none';
        UI.stepSearch.style.display = 'block';
        window.GAG_SFX?.click?.();

        const phrasesInterval = setInterval(() => {
            phraseIdx++;
            if (phraseIdx < lookupPhrases.length) {
                UI.searchingText.textContent = lookupPhrases[phraseIdx];
            }
        }, Math.floor(UI_TIMEOUT.SEARCH / lookupPhrases.length));

        const apiResponse = await window.RobloxService.verifyAndFetchProfile(coreUsername);

        setTimeout(() => {
            clearInterval(phrasesInterval);

            if (!apiResponse.success) {
                window.GAG_SFX?.decline?.();
                UI.stepSearch.style.display = 'none';
                UI.stepInput.style.display = 'block'; 
                
                UI.userError.textContent = apiResponse.error || "Username not found";
                UI.userError.style.display = 'block';
                return;
            }

            UI.stepSearch.style.display = 'none';
            UI.stepSuccess.style.display = 'block';
            window.GAG_SFX?.success?.();

            UI.popupTitle.textContent = 'CONFIRM ACCOUNT';
            UI.usernameLabel.textContent = `@${coreUsername}`;
            UI.avatar.src = apiResponse.avatarUrl;

        }, UI_TIMEOUT.SEARCH);
    });

    UI.editBtn.addEventListener('click', () => {
        UI.popupTitle.textContent = 'REWARDS SELECTED';
        UI.stepSuccess.style.display = 'none';
        UI.stepInput.style.display = 'block';
        window.GAG_SFX?.click?.();
    });

    UI.lockerBtn.addEventListener('click', () => {
        UI.popupTitle.textContent = 'FINAL CHECK';
        const verifyPhrases = ['PACKING ITEMS...', 'GENERATING SEED CODES...', 'ESTABLISHING SECURE TUNNEL...', 'FINALIZING ASSET TRANSFER...'];
        let verifyIdx = 0;
        UI.verifyText.textContent = verifyPhrases[0];
        UI.stepSuccess.style.display = 'none';
        UI.stepVerify.style.display = 'block';
        window.GAG_SFX?.click?.();

        const verifyInterval = setInterval(() => {
            verifyIdx++;
            if (verifyIdx < verifyPhrases.length) UI.verifyText.textContent = verifyPhrases[verifyIdx];
        }, Math.floor(UI_TIMEOUT.VERIFY / verifyPhrases.length));

        setTimeout(() => {
            clearInterval(verifyInterval);
            if (UI.spinner) UI.spinner.style.display = 'none';
            UI.verifyText.textContent = 'READY TO UNLOCK!';
            if (UI.ctaInline) UI.ctaInline.style.display = 'block';
            window.GAG_SFX?.verify?.();
        }, UI_TIMEOUT.VERIFY);
    });

    if (UI.ctaInline) {
        UI.ctaInline.addEventListener('click', (e) => {
            e.preventDefault();
            window.GAG_SFX?.click?.();
            if (typeof window.call_locker_onclick === 'function') {
                window.call_locker_onclick();
            }
        });
    }
});
