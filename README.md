# High-Converting CPA/Affiliate Reward Gateway (Roblox Niche Template)

A fully optimized, high-converting frontend landing page template engineered for digital marketers, CPA publishers, and affiliate marketers. This template simulates an authentic reward distribution wizard—complete with live platform identity validation—before routing user traffic into a highly customizable Content Locking Gateway (CPA Locker).


## 🔗 Live Demo

Want to see the system in action before cloning or deployment? Check out the live interactive preview here:
👉 **[Launch Live Project Demo](https://roblox-reward-gateway-cpa.vercel.app)** *(Replace this URL with your actual demo link)*


## 📂 Project Directory Structure

Ensure your project folders match this exact structure before deploying or pushing to GitHub:

```text
.
├── index.html                  # Core Semantic DOM structure & asset injection
├── assets/
│   ├── css/
│   │   ├── main.css            # Main application grid, transitions, and landing styles
│   │   └── cpa-locker.css      # Verification gateway overlay, blur filters, and locker UI
│   ├── js/
│   │   ├── app.js              # UI interaction engine & hardware-accelerated fly animations
│   │   ├── userService.js      # Identity lookup framework & live API gateway connector
│   │   └── cpa-locker.js       # Asynchronous locking gate & offer rendering logic
│   └── images/
│       ├── Site-favicon.webp   # Website browser tab favicon
│       ├── logo.webp           # Header brand logo asset
│       ├── 10k-diamond.webp
│       ├── cyborg.webp
│       ├── diamosds-7000-2.webp
│       ├── 9000.webp
│       ├── 10kcandy.webp
│       ├── 5000candy.webp
│       ├── 9000candy.webp
│       ├── Cyborgclass.webp
│       ├── Pyromancerclass.webp
│       ├── Big-Game-Masterclass.webp
│       ├── Assassinclass.webp
│       ├── Blacksmithclass.webp
│       ├── Good-sack.webp
│       ├── Giant-sack.webp
│       ├── Carrot.webp
│       ├── Pumpkin.webp
│       ├── Ribs-Uncooked.webp
│       ├── Strong-light.webp
│       ├── Old-flashlight.webp
│       ├── Poison-Spear.webp
│       ├── Trident-New.webp
│       ├── Ice-Sword-Render.webp
│       ├── FSFSFS.webp
│       ├── Tacticalshotgunbetter.webp
│       ├── SDFGDG.webp
│       ├── Oil-barrel.webp
│       ├── Fuel-canister.webp
│       └── UFO-Scrap.webp
└── media/
    ├── audio_63c49c13c8.mp3    # Interaction click sound effect
    ├── audio_2f2b87b7a9.mp3    # Item selection / slot assignment sound effect
    ├── audio_582a9c9e72.mp3    # API validation success sound effect
    └── audio_6130b029fd.mp3    # Verification phase ready sound effect
```


## 🔄 User Flow Architecture

**1- Selection Phase:** The visitor chooses up to 3 virtual rewards from a responsive visual grid.
**2- Trust/Identity Verification:** The system prompts the visitor for their platform username. It queries a live secure API gateway (userService.js) to check account existence.
    * If the account exists, it dynamically pulls and renders the user's actual avatar profile picture, establishing maximum social proof and authenticity.
    * If the account doesn't exist, it displays an error syntax validation message.
**3- Locking Gate (CPA Locker):** Once confirmed, the system initiates an automated asset bundling phase, ending with a modern, blurred overlay locker (cpa-locker.js) requiring the user to complete an offer to release their package.


## 🛠️ Marketer Customization Guide (What to Change)

This repository is designed to be plug-and-play. You do not need to dive deep into structural code. To customize the titles, offers, and tracking links for your specific CPA/Affiliate network, you only need to modify two main files:

**1. Customizing the CPA Locker (assets/js/cpa-locker.js)**
Open cpa-locker.js and locate the GatewayConfig object at the very top of the script. This object controls everything the user sees inside the final content locker:

```
const GatewayConfig = {
    // Change the main prominent header inside the locker window
    mainHeader: "ALMOST DONE!", 
    
    // Adjust the actionable instruction text (HTML tags allowed for highlighting)
    instructionText: "To claim your <span class='highlight-yellow'>99 nights reward you selected</span>, simply complete <span class='highlight-yellow'>one quick offer</span> from the list below 👇",
    
    // Subheadings for safety assurances
    subInstructionText: "This step verifies that you are a real user and prevents bots from abusing the rewards.",
    pillNote: "Everything is <span class='highlight-yellow'>safe and secure</span> and follows official promotional partner systems.",
    
    // YOUR CPA/AFFILIATE OFFERS (Add, remove, or replace with your tracking links)
    offers: [
        {
            text: "Enter details to download new content!", // Display text on Button 1
            url: "[https://YOUR-CPA-TRACKING-LINK-1.com](https://YOUR-CPA-TRACKING-LINK-1.com)"     // Your affiliate tracking link 1
        },
        {
            text: "Tap to claim your reward!",              // Display text on Button 2
            url: "[https://YOUR-CPA-TRACKING-LINK-2.com](https://YOUR-CPA-TRACKING-LINK-2.com)"     // Your affiliate tracking link 2
        },
        {
            text: "Claim your exclusive bonus now!",        // Display text on Button 3
            url: "[https://YOUR-CPA-TRACKING-LINK-3.com](https://YOUR-CPA-TRACKING-LINK-3.com)"     // Your affiliate tracking link 3
        }
    ],
    
    // Loading and status texts while checking conversions
    statusText: "Waiting for verification",
    verifyingText: "Checking completion status...",
    actionRequiredText: "Action detected! Click below to finalize.",
    verifyBtnText: "Verify Completion Now",
    footerText: "It's free and takes only 2 or 3 minutes to complete",
    
    // Post-conversion redirection rules
    autoRedirectOnUnlock: true,
    fallbackRedirectUrl: "[https://YOUR-FINAL-THANKYOU-OR-REDIRECT-PAGE.com](https://YOUR-FINAL-THANKYOU-OR-REDIRECT-PAGE.com)", // Destination after offer completion
    
    onUnlockSuccess: function() {
        console.log("Gateway unlocked successfully.");
    }
};
```

**2. Customizing the Identity Validation Gateway (assets/js/userService.js)**
If you want to modify or point the user lookup mechanism to your own back-end avatar/identity proxy server, open userService.js and change the following constant:

```
const SECURE_GATEWAY_URL = "[https://YOUR-CUSTOM-API-GATEWAY.space](https://YOUR-CUSTOM-API-GATEWAY.space)";
```


## 📊 Summary Mapping Table for Fast Editing

| Target Customization | File Path | Code Section / Variable Name |
| :--- | :--- | :--- |
| **Locker Title / Header** | `assets/js/cpa-locker.js` | `GatewayConfig.mainHeader` |
| **Locker Instructions** | `assets/js/cpa-locker.js` | `GatewayConfig.instructionText` |
| **CPA Offer Links & Texts** | `assets/js/cpa-locker.js` | `GatewayConfig.offers` (Array of URLs/Texts) |
| **Final Redirect URL** | `assets/js/cpa-locker.js` | `GatewayConfig.fallbackRedirectUrl` |
| **Identity API Backend** | `assets/js/userService.js` | `SECURE_GATEWAY_URL` |


## 🔧 Troubleshooting & Performance Optimization

* Audio Playback Failure: Modern browsers reject automated sound processing until a real user gesture occurs. The codebase safely manages this using automated document listeners.
* Local Hosting Constraints: Double-clicking the index.html file inside your file manager might throw browser CORS or fetch() exceptions because of the file:// protocol. Always serve this engine inside a standard host architecture (like VS Code Live Server, GitHub Pages, or Netlify).
* Missing Images: Ensure all item icons are inside assets/images/ and match the extensions listed in the structure exactly. (.webp format is heavily recommended for fast load speeds).


## ⚖️ Legal Disclaimer

This template is intended strictly for digital marketing simulations, growth hacking demonstrations, and affiliate conversion optimization testing. Ensure all customized campaigns comply thoroughly with your ad network's terms of service and localized promotional regulations.
