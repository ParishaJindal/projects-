/**
 * Journey Sphere - Premium Gemini AI Chatbot
 * Self-contained dynamic injector. Reference this file in your HTML:
 * <script src="chatbot.js" defer></script>
 */

(function () {
    // ----------------------------------------------------
    // 1. API Configuration & Fallbacks
    // ----------------------------------------------------
    const DEFAULT_API_KEY = "ADD GOOGLE FLASH API";
    
    function getApiKey() {
        const storedKey = localStorage.getItem("JOURNEY_SPHERE_GEMINI_KEY");
        if (storedKey && storedKey.trim() !== "") {
            return storedKey;
        }
        return DEFAULT_API_KEY;
    }

    function setApiKey(key) {
        if (key && key.trim() !== "") {
            localStorage.setItem("JOURNEY_SPHERE_GEMINI_KEY", key.trim());
            return true;
        }
        return false;
    }

    function resetApiKey() {
        localStorage.removeItem("JOURNEY_SPHERE_GEMINI_KEY");
    }

    // ----------------------------------------------------
    // 2. Chatbot Context / Knowledge Base
    // ----------------------------------------------------
    const SYSTEM_INSTRUCTIONS = `
You are the official AI Travel Concierge for "Journey Sphere" (journeysphere pvt.ltd), a premium, state-of-the-art travel portal.
Your goal is to guide visitors, answer all inquiries, and highlight the outstanding services offered on the Journey Sphere website.
Be warm, enthusiastic, engaging, and professional. Use emojis related to travel, flights, and hotels.

About Journey Sphere:
- Tagline: "Explore the amazing places".
- Core Services: Flights, Hotels, Tours & Attractions, Holiday Destinations, Cruises, Cabs, Buses, Trains, and Visa assistance.
- Dynamic Offers & Discounts:
  * First Booking Offer: Use promo code **WELCOMEMMT** to receive a FLAT 12% OFF on your first domestic flight booking!
  * EMI Options: Travel now, pay later! Flexible EMI starts at only ₹1,880/month.
- Flight Offerings (Special rates & connectivity):
  * Major flight routes connect Delhi, Mumbai, Bangalore, Chennai, Pune, Jaipur, Hyderabad, Goa, Kolkata.
  * Hyderabad to Langkawi (one stop via Bengaluru) starts at ₹11,282 per adult.
  * New Delhi to Canada (one stop via London) starts at ₹22,999 per adult.
  * Chennai to Kuala Lumpur (direct flight) starts at ₹17,235 per adult.
  * Flights options are listed on "2nd page journey.html" (FLIGHTS).
- Hotels (4TH PAGE JOURNEY( HOTEL).HTML):
  * Handpicked premium resorts, luxury villas, budget hotels, and corporate stays.
- Holiday Destinations (3RD page journey.html):
  * Curated weekend getaways in & around Delhi, Mumbai, and Bangalore.
  * Stunning beach destinations.
  * Discover hidden gems: Shimla's Best Kept Secret, Tamil Nadu's Charming Hill Town, and the picturesque gateway to the Himalayas.
- Other Premium Services:
  * Cruise (5th page): Luxury ocean and river cruises to destinations like Singapore, Maldives, and Europe.
  * Cabs (8th page): Airport transfers, local rentals, outstation cabs.
  * Buses (9th page): Luxury AC sleepers, intercity coaches.
  * Trains (7th page): Official bookings with instant PNR updates and seamless refunds.
  * Visa (6th page): Guided assistance for tourist, business, and transit visas globally.
  * Tours (10th page): Local sightseeing, heritage walks, adventure passes.
- User Accounts:
  * Users can Sign Up (signup.html) or Sign In (signin.html) to list properties, manage "My Trips", save their "Wishlist", or access "myBiz" for corporate travel management.
- Contact Details:
  * Visitors can fill out the contact form on the "contact us.html" page to message support with their name and email.

Guidelines for Answers:
1. Always maintain a helpful, welcoming concierge persona. 
2. If asked about booking, direct them to the appropriate page:
   - Flights: 2nd page journey.html
   - Tours: 10th page journey(TOURS AND ATTRACTION).HTML
   - Holiday Destinations: 3RD page journey.html
   - Hotels: 4TH PAGE JOURNEY( HOTEL).HTML
   - Cruise: 5TH page (CRUISE).HTML
   - Cabs: 8th page journey(CABS).HTML
   - Buses: 9th page journey(BUSES).HTML
   - Trains: 7th page(TRAINS).HTML
   - Visa: 6th page (VISA).HTML
   - Sign up/Login: signup.html / signin.html
   - Support/Contact Form: contact us.html
3. Format your answers clearly using clean Markdown (bullet points, bold texts, emoji highlights). Keep answers concise and readable.
4. If a query is unrelated to travel or Journey Sphere, answer politely but guide them back to planning their next dream vacation with Journey Sphere!
`;

    // In-memory chat history
    let chatHistory = [];

    // ----------------------------------------------------
    // 3. Dynamic FontAwesome & Styles Injection
    // ----------------------------------------------------
    function injectAssets() {
        // FontAwesome Injection (just in case it's not present on some pages)
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const faLink = document.createElement("link");
            faLink.rel = "stylesheet";
            faLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
            document.head.appendChild(faLink);
        }

        // CSS Injection (Stunning modern glassmorphism aesthetic)
        const style = document.createElement("style");
        style.id = "js-chatbot-styles";
        style.textContent = `
            :root {
                --js-primary-grad: linear-gradient(135deg, #7b1fa2, #0071ff);
                --js-bg-dark-glass: rgba(18, 18, 26, 0.88);
                --js-border-glass: rgba(255, 255, 255, 0.08);
                --js-text-light: #f5f6f8;
                --js-text-muted: #a0aec0;
                --js-user-msg-grad: linear-gradient(135deg, #0071ff, #0052cc);
                --js-bot-msg-bg: rgba(255, 255, 255, 0.06);
            }

            /* Floating Chat Button container */
            .js-chat-wrapper {
                position: fixed;
                bottom: 25px;
                right: 25px;
                z-index: 999999;
                font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            /* Floating Trigger Button */
            .js-chat-trigger {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: var(--js-primary-grad);
                box-shadow: 0 8px 30px rgba(123, 31, 162, 0.4);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                border: 1px solid rgba(255, 255, 255, 0.15);
            }

            .js-chat-trigger:hover {
                transform: scale(1.1) rotate(5deg);
                box-shadow: 0 12px 35px rgba(0, 113, 255, 0.6);
            }

            .js-chat-trigger i {
                color: white;
                font-size: 24px;
                transition: transform 0.4s ease;
            }

            .js-chat-trigger.active i {
                transform: rotate(90deg);
            }

            /* Pulse Ripple Animation */
            .js-chat-trigger::after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: var(--js-primary-grad);
                opacity: 0.4;
                z-index: -1;
                animation: js-pulse-ripple 2.5s infinite;
            }

            @keyframes js-pulse-ripple {
                0% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.4); opacity: 0; }
                100% { transform: scale(1); opacity: 0; }
            }

            /* Chat Window Panel */
            .js-chat-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 380px;
                height: 560px;
                border-radius: 24px;
                background: var(--js-bg-dark-glass);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid var(--js-border-glass);
                box-shadow: 0 15px 45px rgba(0, 0, 0, 0.4);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: translateY(30px) scale(0.92);
                opacity: 0;
                pointer-events: none;
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                color: var(--js-text-light);
            }

            .js-chat-window.open {
                transform: translateY(0) scale(1);
                opacity: 1;
                pointer-events: auto;
            }

            /* Chat Header */
            .js-chat-header {
                padding: 16px 20px;
                background: linear-gradient(135deg, rgba(123, 31, 162, 0.25), rgba(0, 113, 255, 0.15));
                border-bottom: 1px solid var(--js-border-glass);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .js-chat-header-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .js-chat-avatar {
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: var(--js-primary-grad);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(123, 31, 162, 0.3);
            }

            .js-chat-avatar i {
                color: white;
                font-size: 18px;
            }

            .js-chat-title h3 {
                margin: 0;
                font-size: 15px;
                font-weight: 700;
                letter-spacing: 0.5px;
                color: white;
            }

            .js-chat-title span {
                font-size: 11px;
                color: #00ff66;
                display: flex;
                align-items: center;
                gap: 4px;
                font-weight: 500;
            }

            .js-chat-title span::before {
                content: '';
                width: 6px;
                height: 6px;
                background-color: #00ff66;
                border-radius: 50%;
                display: inline-block;
                animation: js-blink 1.5s infinite;
            }

            @keyframes js-blink {
                0% { opacity: 0.3; }
                50% { opacity: 1; }
                100% { opacity: 0.3; }
            }

            .js-chat-header-actions {
                display: flex;
                gap: 12px;
            }

            .js-chat-action-btn {
                background: transparent;
                border: none;
                color: var(--js-text-muted);
                cursor: pointer;
                font-size: 16px;
                padding: 4px;
                transition: color 0.3s;
            }

            .js-chat-action-btn:hover {
                color: white;
            }

            /* Main Chat Body */
            .js-chat-body {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 15px;
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
            }

            .js-chat-body::-webkit-scrollbar {
                width: 5px;
            }

            .js-chat-body::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.15);
                border-radius: 10px;
            }

            /* Message Bubbles */
            .js-message {
                max-width: 82%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 13.5px;
                line-height: 1.5;
                animation: js-slide-in-msg 0.35s ease;
                word-wrap: break-word;
            }

            @keyframes js-slide-in-msg {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .js-message.bot {
                align-self: flex-start;
                background: var(--js-bot-msg-bg);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-top-left-radius: 4px;
                color: #e2e8f0;
            }

            .js-message.user {
                align-self: flex-end;
                background: var(--js-user-msg-grad);
                border-top-right-radius: 4px;
                color: white;
                box-shadow: 0 4px 15px rgba(0, 113, 255, 0.2);
            }

            /* Formatting inside Bot Messages */
            .js-message.bot p {
                margin: 0 0 8px 0;
            }

            .js-message.bot p:last-child {
                margin-bottom: 0;
            }

            .js-message.bot ul, .js-message.bot ol {
                margin: 6px 0;
                padding-left: 20px;
            }

            .js-message.bot li {
                margin-bottom: 4px;
            }

            .js-message.bot a {
                color: #0088ff;
                text-decoration: underline;
                font-weight: 500;
            }

            .js-message.bot a:hover {
                color: #33a3ff;
            }

            /* Quick replies */
            .js-quick-replies {
                display: flex;
                gap: 8px;
                padding: 0 20px 12px 20px;
                overflow-x: auto;
                white-space: nowrap;
                scrollbar-width: none;
            }

            .js-quick-replies::-webkit-scrollbar {
                display: none;
            }

            .js-quick-chip {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: var(--js-text-light);
                padding: 7px 14px;
                border-radius: 20px;
                font-size: 11.5px;
                cursor: pointer;
                transition: all 0.3s;
                font-weight: 500;
            }

            .js-quick-chip:hover {
                background: var(--js-primary-grad);
                border-color: transparent;
                transform: translateY(-2px);
                box-shadow: 0 4px 10px rgba(123, 31, 162, 0.3);
            }

            /* Typing Indicator */
            .js-typing-indicator {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 12px 18px;
                background: var(--js-bot-msg-bg);
                border-radius: 18px;
                border-top-left-radius: 4px;
                align-self: flex-start;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .js-typing-dot {
                width: 6px;
                height: 6px;
                background-color: var(--js-text-muted);
                border-radius: 50%;
                animation: js-bounce-dot 1.4s infinite ease-in-out both;
            }

            .js-typing-dot:nth-child(1) { animation-delay: -0.32s; }
            .js-typing-dot:nth-child(2) { animation-delay: -0.16s; }

            @keyframes js-bounce-dot {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }

            /* Bottom Input Area */
            .js-chat-footer {
                padding: 15px 20px;
                background: rgba(10, 10, 15, 0.5);
                border-top: 1px solid var(--js-border-glass);
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .js-chat-input-wrapper {
                flex: 1;
                position: relative;
            }

            .js-chat-input {
                width: 100%;
                padding: 12px 16px;
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 30px;
                color: white;
                font-size: 13px;
                outline: none;
                transition: all 0.3s;
            }

            .js-chat-input:focus {
                border-color: #0071ff;
                background: rgba(255, 255, 255, 0.08);
                box-shadow: 0 0 10px rgba(0, 113, 255, 0.2);
            }

            .js-chat-send-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--js-primary-grad);
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                box-shadow: 0 4px 10px rgba(123, 31, 162, 0.3);
            }

            .js-chat-send-btn:hover {
                transform: scale(1.08);
                box-shadow: 0 6px 15px rgba(0, 113, 255, 0.5);
            }

            .js-chat-send-btn i {
                color: white;
                font-size: 15px;
            }

            /* API Settings Panel (Sliding Overlay) */
            .js-chat-settings-panel {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(18, 18, 26, 0.95);
                backdrop-filter: blur(25px);
                z-index: 100;
                display: flex;
                flex-direction: column;
                padding: 24px;
                transform: translateX(100%);
                transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .js-chat-settings-panel.open {
                transform: translateX(0);
            }

            .js-settings-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 12px;
            }

            .js-settings-header h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 700;
                color: white;
            }

            .js-settings-body {
                display: flex;
                flex-direction: column;
                gap: 15px;
                font-size: 12.5px;
                line-height: 1.5;
            }

            .js-settings-info {
                color: var(--js-text-muted);
            }

            .js-key-input-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .js-key-input-group label {
                font-weight: 600;
                color: var(--js-text-light);
            }

            .js-key-input {
                padding: 10px 14px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 8px;
                color: white;
                font-size: 12px;
                outline: none;
            }

            .js-key-input:focus {
                border-color: #0071ff;
            }

            .js-settings-actions {
                margin-top: 15px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .js-btn-save {
                background: var(--js-primary-grad);
                color: white;
                border: none;
                padding: 10px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
            }

            .js-btn-save:hover {
                transform: translateY(-1px);
            }

            .js-btn-reset {
                background: rgba(255, 255, 255, 0.08);
                color: var(--js-text-light);
                border: 1px solid rgba(255, 255, 255, 0.15);
                padding: 10px;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.3s;
            }

            .js-btn-reset:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            /* Responsive tweaks */
            @media(max-width: 420px) {
                .js-chat-window {
                    width: calc(100vw - 40px);
                    right: -10px;
                    height: 80vh;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ----------------------------------------------------
    // 4. HTML Elements Creation & Injection
    // ----------------------------------------------------
    function injectElements() {
        const wrapper = document.createElement("div");
        wrapper.className = "js-chat-wrapper";

        wrapper.innerHTML = `
            <!-- Floating Trigger Icon -->
            <div class="js-chat-trigger" id="jsChatTrigger">
                <i class="fas fa-comment-dots"></i>
            </div>

            <!-- Chat Window Panel -->
            <div class="js-chat-window" id="jsChatWindow">
                <!-- Header -->
                <div class="js-chat-header">
                    <div class="js-chat-header-info">
                        <div class="js-chat-avatar">
                            <i class="fas fa-compass"></i>
                        </div>
                        <div class="js-chat-title">
                            <h3>Journey Sphere Concierge</h3>
                            <span>Online</span>
                        </div>
                    </div>
                    <div class="js-chat-header-actions">
                        <button class="js-chat-action-btn" id="jsSettingsBtn" title="API Key Setup">
                            <i class="fas fa-cog"></i>
                        </button>
                        <button class="js-chat-action-btn" id="jsCloseBtn" title="Close Chat">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- API Settings Panel Overlay -->
                <div class="js-chat-settings-panel" id="jsSettingsPanel">
                    <div class="js-settings-header">
                        <h4>Gemini API Configuration</h4>
                        <button class="js-chat-action-btn" id="jsCloseSettingsBtn">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                    </div>
                    <div class="js-settings-body">
                        <div class="js-settings-info">
                            Configure your custom Google Gemini API Key. Key is saved locally in your browser's secure cache (localStorage).
                        </div>
                        <div class="js-key-input-group">
                            <label for="jsApiKeyVal">Gemini API Key</label>
                            <input type="password" id="jsApiKeyVal" class="js-key-input" placeholder="Paste your API key here (AIzaSy...)">
                        </div>
                        <div class="js-settings-actions">
                            <button class="js-btn-save" id="jsSaveKeyBtn">Save API Key</button>
                            <button class="js-btn-reset" id="jsResetKeyBtn">Reset to Default</button>
                        </div>
                        <div style="font-size: 11px; color: var(--js-text-muted); margin-top: 10px;">
                            Don't have a key? Acquire one for free at <a href="https://aistudio.google.com/" target="_blank" style="color: #0071ff; text-decoration: underline;">Google AI Studio</a>.
                        </div>
                    </div>
                </div>

                <!-- Chat Messages Area -->
                <div class="js-chat-body" id="jsChatBody">
                    <!-- Default Greeting -->
                </div>

                <!-- Quick Reply Chips -->
                <div class="js-quick-replies" id="jsQuickReplies">
                    <div class="js-quick-chip" data-msg="Hi! Tell me more about Journey Sphere! ✈️">Welcome 👋</div>
                    <div class="js-quick-chip" data-msg="Are there any flights deals? ✈️">Flights Deals ✈️</div>
                    <div class="js-quick-chip" data-msg="How can I get the 12% discount? 🎁">12% Discount 🎁</div>
                    <div class="js-quick-chip" data-msg="What are the details of Visa assistance? 📄">Visa Help 📄</div>
                    <div class="js-quick-chip" data-msg="How can I contact customer support? 📞">Contact Support 📞</div>
                </div>

                <!-- Message input area -->
                <div class="js-chat-footer">
                    <div class="js-chat-input-wrapper">
                        <input type="text" class="js-chat-input" id="jsChatInput" placeholder="Ask about flights, visa, hotels...">
                    </div>
                    <button class="js-chat-send-btn" id="jsSendBtn" title="Send Message">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(wrapper);
    }

    // ----------------------------------------------------
    // 5. Utility / Presentation Functions
    // ----------------------------------------------------
    function appendMessage(text, role) {
        const chatBody = document.getElementById("jsChatBody");
        const msgDiv = document.createElement("div");
        msgDiv.className = `js-message ${role}`;

        if (role === 'bot') {
            msgDiv.innerHTML = formatMarkdown(text);
        } else {
            msgDiv.textContent = text;
        }

        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function showTypingIndicator() {
        const chatBody = document.getElementById("jsChatBody");
        const indDiv = document.createElement("div");
        indDiv.className = "js-typing-indicator";
        indDiv.id = "jsTypingIndicator";
        indDiv.innerHTML = `
            <div class="js-typing-dot"></div>
            <div class="js-typing-dot"></div>
            <div class="js-typing-dot"></div>
        `;
        chatBody.appendChild(indDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function removeTypingIndicator() {
        const ind = document.getElementById("jsTypingIndicator");
        if (ind) ind.remove();
    }

    // Simple markdown formatting helper
    function formatMarkdown(text) {
        let html = text;
        
        // Escape HTML tags to prevent XSS issues but allow safe markdown
        html = html
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Bold (**text** or __text__)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

        // Italic (*text* or _text_)
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');

        // Lists (unordered)
        html = html.replace(/^\s*[\-\*]\s+(.*)$/gm, '<li>$1</li>');
        // Wrap <li> elements with <ul> but only when contiguous. Simplification:
        html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
        // Fix duplicate nested <ul> tags from single list items:
        html = html.replace(/<\/ul>\s*<ul>/g, '');

        // Paragraphs: double newline to paragraph
        html = html.replace(/\n\n/g, '</p><p>');
        // Single newline to br
        html = html.replace(/\n/g, '<br>');

        // Wrap the whole string in paragraph tag if needed
        html = `<p>${html}</p>`;
        
        // Post process to clean empty paragraphs
        html = html.replace(/<p><\/p>/g, '');

        // Re-inject safe links for pages
        const pagesMapping = {
            "2nd page journey.html": "2nd page journey.html",
            "10th page journey(TOURS AND ATTRACTION).HTML": "10th page journey(TOURS AND ATTRACTION).HTML",
            "3RD page journey.html": "3RD page journey.html",
            "4TH PAGE JOURNEY( HOTEL).HTML": "4TH PAGE JOURNEY( HOTEL).HTML",
            "5TH page (CRUISE).HTML": "5TH page (CRUISE).HTML",
            "6th page (VISA).HTML": "6th page (VISA).HTML",
            "7th page(TRAINS).HTML": "7th page(TRAINS).HTML",
            "8th page journey(CABS).HTML": "8th page journey(CABS).HTML",
            "9th page journey(BUSES).HTML": "9th page journey(BUSES).HTML",
            "signup.html": "signup.html",
            "signin.html": "signin.html",
            "contact us.html": "contact us.html"
        };

        // Convert page name strings or anchors back to actual working links
        for (const [basename, fileUrl] of Object.entries(pagesMapping)) {
            // Find occurrences of the file name and replace with clean absolute/relative HTML links
            const pattern = new RegExp(basename.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
            html = html.replace(pattern, `<a href="${fileUrl}">${basename}</a>`);
        }

        return html;
    }

    // ----------------------------------------------------
    // 6. Gemini API Integration
    // ----------------------------------------------------
    async function getGeminiResponse(userMessage) {
        const key = getApiKey();
        
        if (key === "ADD GOOGLE FLASH API") {
            return `⚠️ **API Key is not configured yet!**\n\nTo make this chatbot fully functional using Google Gemini 2.5 Flash, you need to add your API key.\n\nI have automatically opened the **API Settings** panel on the left. Please enter a valid Gemini API Key to enable instant AI responses!`;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
        
        // Prepare chat history to feed Gemini (keeps it context-aware!)
        // Max history items to prevent heavy payloads
        const maxHistory = 10;
        const recentHistory = chatHistory.slice(-maxHistory);

        const contents = [];
        recentHistory.forEach(item => {
            contents.push({
                role: item.role === 'bot' ? 'model' : 'user',
                parts: [{ text: item.text }]
            });
        });

        // Add the current user query to contents
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const requestBody = {
            contents: contents,
            systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTIONS }]
            },
            generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 600,
                topP: 0.8
            }
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Gemini API Error details:", errorData);
                
                if (response.status === 400 && errorData.error?.message?.includes("API key")) {
                    return `🔑 **Invalid API Key.** The configured API key is rejected by Google Generative AI services. Please verify it or insert a new one in the **API Settings** menu (click the cog icon in the header).`;
                }
                
                return `🤖 **Network Connection Error (${response.status})**.\n\nFailed to receive response from Gemini servers. Please check your internet connection or update the API Key in the settings.`;
            }

            const data = await response.json();
            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (replyText) {
                return replyText;
            } else {
                return `🤔 Sorry, I couldn't generate a proper response. Please try rephrasing your question!`;
            }

        } catch (error) {
            console.error("Gemini Fetch Exception:", error);
            return `🔌 **Connection Timed Out.** Please check your local network connection or try again.`;
        }
    }

    // ----------------------------------------------------
    // 7. Core Application Logic & Event Handlers
    // ----------------------------------------------------
    function init() {
        injectAssets();
        injectElements();

        // DOM elements cache
        const triggerBtn = document.getElementById("jsChatTrigger");
        const chatWindow = document.getElementById("jsChatWindow");
        const closeBtn = document.getElementById("jsCloseBtn");
        const inputField = document.getElementById("jsChatInput");
        const sendBtn = document.getElementById("jsSendBtn");
        
        // Settings Panel caching
        const settingsBtn = document.getElementById("jsSettingsBtn");
        const settingsPanel = document.getElementById("jsSettingsPanel");
        const closeSettingsBtn = document.getElementById("jsCloseSettingsBtn");
        const apiKeyField = document.getElementById("jsApiKeyVal");
        const saveKeyBtn = document.getElementById("jsSaveKeyBtn");
        const resetKeyBtn = document.getElementById("jsResetKeyBtn");
        
        const quickChips = document.querySelectorAll(".js-quick-chip");

        // Set initial state of API Key in the input field
        const currentKey = localStorage.getItem("JOURNEY_SPHERE_GEMINI_KEY") || "";
        apiKeyField.value = currentKey;

        // Toggle Chat Window
        triggerBtn.addEventListener("click", () => {
            const isOpen = chatWindow.classList.toggle("open");
            triggerBtn.classList.toggle("active", isOpen);
            
            if (isOpen) {
                // If chatbot body is empty, inject first message
                const chatBody = document.getElementById("jsChatBody");
                if (chatBody.children.length === 0) {
                    appendMessage("Hello traveler! ✈️ Welcome to **Journey Sphere**. I am your dedicated AI Concierge. How can I help you plan your dream holiday, book flights, check active deals, or navigate our services today?", "bot");
                }
                
                // Focus on input field
                setTimeout(() => inputField.focus(), 150);
            }
        });

        // Close Chat Window
        closeBtn.addEventListener("click", () => {
            chatWindow.classList.remove("open");
            triggerBtn.classList.remove("active");
        });

        // Toggle Settings Panel
        settingsBtn.addEventListener("click", () => {
            apiKeyField.value = localStorage.getItem("JOURNEY_SPHERE_GEMINI_KEY") || "";
            settingsPanel.classList.add("open");
        });

        closeSettingsBtn.addEventListener("click", () => {
            settingsPanel.classList.remove("open");
        });

        // API Key Save Event
        saveKeyBtn.addEventListener("click", () => {
            const keyVal = apiKeyField.value.trim();
            if (keyVal === "") {
                alert("Please paste a valid key or click 'Reset to Default'.");
                return;
            }
            setApiKey(keyVal);
            alert("Success! Your custom Google Gemini API Key has been updated and securely stored in your browser session.");
            settingsPanel.classList.remove("open");
        });

        // API Key Reset Event
        resetKeyBtn.addEventListener("click", () => {
            resetApiKey();
            apiKeyField.value = "";
            alert("API key has been reset to default codebase settings.");
            settingsPanel.classList.remove("open");
        });

        // Send Message logic
        async function sendMessage(text) {
            const cleanText = text.trim();
            if (cleanText === "") return;

            // Clear input field
            inputField.value = "";

            // Display user message in chat
            appendMessage(cleanText, "user");
            
            // Track history
            chatHistory.push({ role: 'user', text: cleanText });

            // Display bouncing typing dots
            showTypingIndicator();

            // Fetch AI Response
            const aiResponse = await getGeminiResponse(cleanText);

            // Remove bouncing typing dots
            removeTypingIndicator();

            // Display bot message in chat
            appendMessage(aiResponse, "bot");

            // If API key configuration failed/placeholder, open the settings automatically
            if (aiResponse.includes("API Key is not configured yet!")) {
                setTimeout(() => {
                    settingsPanel.classList.add("open");
                }, 1000);
            }

            // Track history
            chatHistory.push({ role: 'bot', text: aiResponse });
        }

        // Trigger send button click
        sendBtn.addEventListener("click", () => {
            sendMessage(inputField.value);
        });

        // Trigger send on enter press
        inputField.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                sendMessage(inputField.value);
            }
        });

        // Handle Quick Chips
        quickChips.forEach(chip => {
            chip.addEventListener("click", () => {
                const msg = chip.getAttribute("data-msg");
                sendMessage(msg);
            });
        });
    }

    // Initialize after document is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
