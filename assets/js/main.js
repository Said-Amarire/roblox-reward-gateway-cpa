(() => {
    'use strict';

    // Safe promise error suppression
    const silent = p => p?.catch(() => {});

    // Web Audio API context initialization
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = AC ? new AC() : null;
    
    const audioBuffers = {};
    let unlocked = false;

    // User interaction events to unlock AudioContext across platforms
    const GESTURE_EVENTS = ['touchstart', 'pointerdown', 'mousedown', 'keydown'];

    function unlock() {
        if (unlocked || !ctx) return;
        
        if (ctx.state === 'suspended') {
            ctx.resume().then(() => {
                unlocked = true;
                cleanGestureListeners();
            }).catch(() => {});
        } else {
            unlocked = true;
            cleanGestureListeners();
        }
    }

    function cleanGestureListeners() {
        GESTURE_EVENTS.forEach(ev => document.removeEventListener(ev, unlock));
    }

    GESTURE_EVENTS.forEach(ev => {
        document.addEventListener(ev, unlock, { once: true, passive: true });
    });

    // Pre-fetch and decode audio assets into RAM
    const initAudioEngine = () => {
        if (!ctx) return;

        const audioElements = {
            click: document.getElementById('clickSound'),
            ding: document.getElementById('dingSound'),
            success: document.getElementById('successSound'),
            verify: document.getElementById('verifySound')
        };

        Object.entries(audioElements).forEach(([key, el]) => {
            if (!el) return;
            const srcUrl = el.currentSrc || el.src;
            if (!srcUrl) return;

            fetch(srcUrl)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
                .then(decodedBuffer => {
                    audioBuffers[key] = decodedBuffer;
                })
                .catch(err => console.debug(`[Audio Engine] Failed to pre-decode: ${key}`, err));
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudioEngine);
    } else {
        initAudioEngine();
    }

    // Low-latency buffer playback node manager
    function playBuffer(key, vol = 1) {
        if (!ctx) return;
        
        if (ctx.state === 'suspended') silent(ctx.resume());

        const buffer = audioBuffers[key];
        if (!buffer) return;

        try {
            const source = ctx.createBufferSource();
            source.buffer = buffer;

            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(vol, ctx.currentTime);

            source.connect(gainNode).connect(ctx.destination);
            source.start(0);
        } catch (e) {}
    }

    // Global SFX Controller Interface
    window.GAG_SFX = {
        click:   () => playBuffer('click', 1),
        ding:    () => playBuffer('ding', 1),
        success: () => playBuffer('success', 1),
        verify:  () => playBuffer('verify', 1),
        decline: () => {
            if (!ctx) return;
            if (ctx.state === 'suspended') silent(ctx.resume());
            
            const now = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain();
            osc.type = 'sawtooth'; 
            osc.frequency.setValueAtTime(420, now); 
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);
            gain.gain.setValueAtTime(0.001, now); 
            gain.gain.linearRampToValueAtTime(0.08, now + 0.02); 
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.connect(gain).connect(ctx.destination); 
            osc.start(now); 
            osc.stop(now + 0.32);
        }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    // UI Process Sync Timeouts
    const UI_TIMEOUT = {
        DESELECT: 250,
        SHAKE: 350,
        POP: 400,
        LOADER_MIN: 1500, 
        LOADER_REMOVE: 400,
        FLY_FALLBACK: 900,
        VERIFY: 5000, 
        SEARCH: 5000 
    };

    // UI DOM Elements Cache Map
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

    // Smart Page Loader Handler (Ensures minimal display time + window asset load complete)
    if (UI.loader) {
        const minTimePromise = new Promise(resolve => setTimeout(resolve, UI_TIMEOUT.LOADER_MIN));
        const pageLoadPromise = document.readyState === 'complete' 
            ? Promise.resolve() 
            : new Promise(resolve => window.addEventListener('load', resolve));

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

    function currentCount() {
        return selectedItems.length + animatingCount;
    }

    function updateGalleryState() {
        if (currentCount() >= MAX_SECTIONS) {
            UI.galleryContainer.classList.add('max-reached');
            document.body.classList.add('cap-reached');
        } else {
            UI.galleryContainer.classList.remove('max-reached');
            document.body.classList.remove('cap-reached');
        }
    }

    // Element Pre-pooling & Structural Lazy Caching
    UI.imgContainers.forEach((card, index) => {
        card.setAttribute('data-index', index);
        
        const originalImg = card.querySelector('.pet');
        const originalCaption = card.querySelector('.img-caption');
        const petSrc = originalImg ? originalImg.src : '';

        const slotCard = document.createElement('div');
        slotCard.className = 'slot-card';
        
        const sImg = document.createElement('img');
        sImg.className = 'pet';
        sImg.setAttribute('decoding', 'async');
        sImg.setAttribute('width', '120');
        sImg.setAttribute('height', '120');
        sImg.src = petSrc; 
        
        const sCaption = document.createElement('div');
        sCaption.className = 'img-caption';
        sCaption.innerHTML = originalCaption ? originalCaption.innerHTML : '';
        
        slotCard.appendChild(sImg);
        slotCard.appendChild(sCaption);
        card.cachedSlotCard = slotCard; 

        const flyingElem = document.createElement('div');
        flyingElem.className = 'flying-element';
        
        const innerContainer = document.createElement('div');
        innerContainer.className = "fly-inner";
        
        const flyPetImg = document.createElement('img');
        flyPetImg.className = 'pet fly-pet';
        flyPetImg.setAttribute('decoding', 'async');
        flyPetImg.src = petSrc;
        
        innerContainer.appendChild(flyPetImg);
        flyingElem.appendChild(innerContainer);
        card.cachedFlyingElem = flyingElem; 

        const popupCardItem = document.createElement('div');
        popupCardItem.className = 'popup-card-item';
        
        const pImg = document.createElement('img');
        pImg.className = 'pet';
        pImg.setAttribute('decoding', 'async');
        pImg.src = petSrc;
        
        const pCaption = document.createElement('div');
        pCaption.className = 'img-caption';
        pCaption.innerHTML = originalCaption ? originalCaption.innerHTML : '';
        
        popupCardItem.appendChild(pImg);
        popupCardItem.appendChild(pCaption);
        card.cachedPopupCard = popupCardItem; 

        const claimBtn = document.createElement('button');
        claimBtn.type = 'button';
        claimBtn.className = 'claim-btn';
        claimBtn.setAttribute('aria-label', 'Claim reward');
        claimBtn.innerHTML = '<span class="label">Claim</span>';
        card.appendChild(claimBtn);

        card.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isProcessing) return; 

            if (card.classList.contains('selected')) {
                isProcessing = true; 
                deselectCard(card);
                window.GAG_SFX?.click?.();
                
                card.addEventListener('transitionend', () => { isProcessing = false; }, { once: true });
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
                } else {
                    isProcessing = true;
                    window.GAG_SFX?.ding?.();
                    card.classList.add('selected');
                    selectCard(card);
                    card.addEventListener('transitionend', () => { isProcessing = false; }, { once: true });
                    setTimeout(() => { isProcessing = false; }, UI_TIMEOUT.DESELECT);
                }
            }
        });
    });

    // GPU-accelerated transition vector interpolation for flying nodes
    function animateFlyEffect(sourceCard, targetSlot, targetSlotNum, onComplete) {
        const frame = sourceCard.querySelector('.frame');
        const sourceElement = frame || sourceCard;
        const targetElement = targetSlot;

        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        const flyingElem = sourceCard.cachedFlyingElem;

        if (!flyingElem) {
            onComplete();
            return;
        }

        if (frame) {
            frame.setAttribute('data-used', 'true');
        }

        const sourceCenterX = sourceRect.left + sourceRect.width / 2;
        const sourceCenterY = sourceRect.top + sourceRect.height / 2;

        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        const deltaX = targetCenterX - sourceCenterX;
        const deltaY = targetCenterY - sourceCenterY;

        const scale = Math.min(
            targetRect.width / sourceRect.width,
            targetRect.height / sourceRect.height
        );

        flyingElem.style.transition = 'none';
        flyingElem.style.display = 'block';
        flyingElem.style.opacity = '1';

        flyingElem.style.width = `${sourceRect.width}px`;
        flyingElem.style.height = `${sourceRect.height}px`;

        flyingElem.style.left = `${sourceCenterX - sourceRect.width / 2}px`;
        flyingElem.style.top = `${sourceCenterY - sourceRect.height / 2}px`;

        flyingElem.style.transform = 'translate3d(0px,0px,0px) scale(1)';

        document.body.appendChild(flyingElem);

        void flyingElem.offsetWidth;

        requestAnimationFrame(() => {
            flyingElem.style.transition =
                'transform var(--fly-duration,.55s) var(--fly-ease,cubic-bezier(.22,.61,.36,1)), opacity .25s linear';

            flyingElem.style.transform =
                `translate3d(${deltaX}px,${deltaY}px,0) scale(${scale})`;
        });

        let finished = false;

        const cleanup = () => {
            if (finished) return;
            finished = true;

            flyingElem.remove();
            onComplete();

            const slot = document.getElementById(`slot${targetSlotNum}`);
            if (slot) {
                slot.classList.add('pop-effect');
                setTimeout(() => {
                    slot.classList.remove('pop-effect');
                }, UI_TIMEOUT.POP);
            }
        };

        const fallback = setTimeout(cleanup, UI_TIMEOUT.FLY_FALLBACK);

        flyingElem.addEventListener('transitionend', () => {
            clearTimeout(fallback);
            cleanup();
        }, { once: true });
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
                        
                        card.addEventListener('transitionend', () => { isProcessing = false; }, { once: true });
                        setTimeout(() => { isProcessing = false; }, UI_TIMEOUT.DESELECT);
                    };
                    
                    slot.replaceChildren(card.cachedSlotCard); 
                }
            } else {
                slot.replaceChildren();
            }
        }

        const hasItems = selectedItems.length >= 1;
        UI.continueBtn.hidden = !hasItems;
        UI.continueBtn.style.display = hasItems ? 'block' : 'none';

        updateGalleryState();
    }
    
    // Instant input character normalization (Strict alphanumeric & Max length 10)
    if (UI.usernameInput) {
        UI.usernameInput.addEventListener('input', (e) => {
            let val = e.target.value;
            let hasAt = val.startsWith('@');
            let core = hasAt ? val.slice(1) : val;
            
            core = core.replace(/[^a-zA-Z0-9]/g, '');
            
            if (core.length > 10) {
                core = core.slice(0, 10);
            }
            
            e.target.value = hasAt ? '@' + core : core;
        });
    }

    // Modal view initialization & Background viewport scroll lock
    UI.continueBtn.addEventListener('click', () => {
        window.GAG_SFX?.click?.();
        UI.popup.style.display = 'flex';
        UI.popup.setAttribute('aria-hidden', 'false');

        if (UI.popupTitle) {
            UI.popupTitle.textContent = 'REWARDS SELECTED';
        }

        document.documentElement.classList.add('pl-lock');
        document.body.classList.add('pl-lock');
        
        UI.popupThumbs.replaceChildren();
        selectedItems.forEach(card => {
            if (card.cachedPopupCard) {
                UI.popupThumbs.appendChild(card.cachedPopupCard.cloneNode(true)); 
            }
        });

        UI.stepInput.hidden = false;       UI.stepInput.style.display = 'block';
        UI.stepSearch.hidden = true;      UI.stepSearch.style.display = 'none';
        UI.stepSuccess.hidden = true;     UI.stepSuccess.style.display = 'none';
        UI.stepVerify.hidden = true;      UI.stepVerify.style.display = 'none';
        UI.userError.hidden = true;       UI.userError.style.display = 'none';
    });

    // Modal destruction & Viewport scroll release
    UI.popupCancel.addEventListener('click', () => {
        window.GAG_SFX?.click?.();
        UI.popup.style.display = 'none';
        UI.popup.setAttribute('aria-hidden', 'true');

        document.documentElement.classList.remove('pl-lock');
        document.body.classList.remove('pl-lock');
    });

    // Verification sequence workflow handler
    UI.popupSearch.addEventListener('click', () => {
        const userVal = UI.usernameInput.value.trim();
        const hasAt = userVal.startsWith('@');
        const coreUsername = hasAt ? userVal.slice(1) : userVal;

        if (!coreUsername) {
            window.GAG_SFX?.decline?.();
            UI.userError.hidden = false;
            UI.userError.style.display = 'block';
            return;
        }
        UI.userError.hidden = true;
        UI.userError.style.display = 'none';

        if (UI.popupTitle) {
            UI.popupTitle.textContent = 'CHECKING USERNAME';
        }

        const backendSearchSteps = [
            'CONNECTING TO SECURE SERVER...',
            'FETCHING PROFILE...',
            'VERIFYING USER DATA...',
            'SYNCING SELECTED REWARDS...',
            'FINALIZING DATABASE HANDSHAKE...'
        ];
        
        let currentSearchStep = 0;
        if (UI.searchingText) {
            UI.searchingText.textContent = backendSearchSteps[0];
        }

        UI.stepInput.hidden = true;        UI.stepInput.style.display = 'none';
        UI.stepSearch.hidden = false;      UI.stepSearch.style.display = 'block'; 
        window.GAG_SFX?.click?.();

        const searchInterval = setInterval(() => {
            currentSearchStep++;
            if (currentSearchStep < backendSearchSteps.length) {
                if (UI.searchingText) {
                    UI.searchingText.textContent = backendSearchSteps[currentSearchStep];
                }
            }
        }, Math.floor(UI_TIMEOUT.SEARCH / backendSearchSteps.length));

        setTimeout(() => {
            clearInterval(searchInterval);

            UI.stepSearch.hidden = true;   UI.stepSearch.style.display = 'none';
            UI.stepSuccess.hidden = false; UI.stepSuccess.style.display = 'block';
            window.GAG_SFX?.success?.(); 
            
            if (UI.popupTitle) {
                UI.popupTitle.textContent = 'CONFIRM ACCOUNT';
            }
            
            UI.usernameLabel.textContent = `@${coreUsername}`;
            UI.avatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(coreUsername)}`;
        }, UI_TIMEOUT.SEARCH);
    });

    UI.editBtn.addEventListener('click', () => {
        if (UI.popupTitle) {
            UI.popupTitle.textContent = 'REWARDS SELECTED';
        }
        UI.stepSuccess.hidden = true;     UI.stepSuccess.style.display = 'none';
        UI.stepInput.hidden = false;      UI.stepInput.style.display = 'block';
        window.GAG_SFX?.click?.();
    });

    // Asset injection simulation sequence handler
    UI.lockerBtn.addEventListener('click', () => {
        if (UI.popupTitle) {
            UI.popupTitle.textContent = 'FINAL CHECK';
        }

        const backendVerifySteps = [
            'PACKING SELECTED REWARDS...',
            'GENERATING SECURE DEPLOYMENT CODES...',
            'ESTABLISHING ENCRYPTED GATEWAY...',
            'INJECTING REWARDS INTO USER DATA...',
            'FINALIZING ASSETS TRANSFER...'
        ];

        let currentVerifyStep = 0;
        if (UI.verifyText) {
            UI.verifyText.textContent = backendVerifySteps[0];
        }

        UI.stepSuccess.hidden = true;     UI.stepSuccess.style.display = 'none';
        UI.stepVerify.hidden = false;     UI.stepVerify.style.display = 'block';
        window.GAG_SFX?.click?.();

        const verifyInterval = setInterval(() => {
            currentVerifyStep++;
            if (currentVerifyStep < backendVerifySteps.length) {
                if (UI.verifyText) {
                    UI.verifyText.textContent = backendVerifySteps[currentVerifyStep];
                }
            }
        }, Math.floor(UI_TIMEOUT.VERIFY / backendVerifySteps.length));

        setTimeout(() => {
            clearInterval(verifyInterval);

            if (UI.spinner) {
                UI.spinner.hidden = true;
                UI.spinner.style.display = 'none';
            }
            if (UI.verifyText) {
                UI.verifyText.textContent = 'READY TO UNLOCK!';
            }
            
            if (UI.ctaInline) {
                UI.ctaInline.hidden = false;
                UI.ctaInline.style.display = 'block';
            }
            window.GAG_SFX?.verify?.(); 
        }, UI_TIMEOUT.VERIFY);
    });
});

// PWA background worker caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.debug('SW registration skipped', err));
    });
}
