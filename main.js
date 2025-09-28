/* YAMAMOTO CREATE ポートフォリオサイト 共通スクリプト */

// --- Main Page Logic ---
// AOS initialization
AOS.init({ duration: 700, once: true });

// Header scroll effect
const header = document.getElementById('main-header');
if (header) {
    window.addEventListener('scroll', () => {
        // Only apply transparent-to-white effect on the main page (where hero section exists)
        if (document.getElementById('hero')) {
             header.classList.toggle('scrolled', window.scrollY > 50);
        }
    });
}


// Loading animation and Typing animation (only for main page)
const loader = document.getElementById('loader');
const heroTitle = document.getElementById('hero-title');

if (loader && heroTitle) {
    window.addEventListener('load', () => {
        loader.classList.add('hidden');
        setTimeout(startTypingAnimation, 500); 
    });
} else if (loader) {
    // Hide loader immediately on subpages without hero animation
    window.addEventListener('load', () => {
        loader.classList.add('hidden');
    });
}


// Hero section typing animation
function startTypingAnimation() {
    const titleElement = document.getElementById('hero-title');
    // Exit if the hero title element is not on the page
    if (!titleElement) return; 

    const englishText = 'Technology To Embody Ideas';
    const japaneseText = 'アイデアを<br class="md:hidden">カタチにする技術';
    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    
    // Animation Sequence
    type(englishText, 100, () => {
        setTimeout(() => {
            scramble(500, () => {
                type(japaneseText, 150, () => {
                    const cursor = titleElement.querySelector('.typing-cursor');
                    if(cursor) setTimeout(() => cursor.remove(), 1400);
                });
            });
        }, 800);
    });

    function type(text, speed, callback) {
        let i = 0;
        titleElement.innerHTML = '';
        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'typing-cursor';
        titleElement.appendChild(cursorSpan);

        function typeChar() {
            if (i < text.length) {
                // Correctly handle any HTML tag starting with '<'
                if (text.charAt(i) === '<') {
                     const tagEnd = text.indexOf('>', i);
                     const tag = text.substring(i, tagEnd + 1);
                     cursorSpan.insertAdjacentHTML('beforebegin', tag);
                     i = tagEnd + 1;
                } else {
                    const char = text.slice(i, i + 1);
                    cursorSpan.insertAdjacentHTML('beforebegin', char);
                    i++;
                }
                setTimeout(typeChar, speed);
            } else {
                if (callback) callback();
            }
        }
        typeChar();
    }

    function scramble(duration, callback) {
        const originalHTML = titleElement.innerHTML;
        const textContent = titleElement.textContent;
        const textLength = textContent.length;
        let scrambleInterval = setInterval(() => {
            let scrambledText = '';
            for (let j = 0; j < textLength; j++) {
                scrambledText += scrambleChars.charAt(Math.floor(Math.random() * scrambleChars.length));
            }
            // Keep cursor, only change text node
            if(titleElement.firstChild && titleElement.firstChild.nodeType === 3) {
               titleElement.firstChild.textContent = scrambledText;
            }
        }, 50);

        setTimeout(() => {
            clearInterval(scrambleInterval);
            titleElement.innerHTML = originalHTML;
            if (callback) callback();
        }, duration);
    }
}


// --- AI Chatbot Logic (runs on all pages) ---
const chatContainer = document.getElementById('chat-container');
if (chatContainer) {
    const chatBubble = document.getElementById('chat-bubble');
    const chatWidget = document.getElementById('chat-widget');
    const closeWidget = document.getElementById('close-widget');
    const chatHistory = document.getElementById('chat-history');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');

    const toggleWidget = (isOpen) => {
        if (isOpen) {
            chatWidget.classList.remove('scale-95', 'opacity-0', 'pointer-events-none');
            chatBubble.classList.add('scale-0', 'opacity-0');
        } else {
            chatWidget.classList.add('scale-95', 'opacity-0', 'pointer-events-none');
            chatBubble.classList.remove('scale-0', 'opacity-0');
        }
    };

    chatBubble.addEventListener('click', () => toggleWidget(true));
    closeWidget.addEventListener('click', () => toggleWidget(false));

    let conversationHistory = [];
    const initialAiMessage = "こんにちは！ Yamamoto CreateのAIアシスタントです。スキルや実績について、お気軽にご質問ください。";
    conversationHistory.push({ role: "model", parts: [{ text: initialAiMessage }] });

    const appendMessage = (sender, message) => {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('flex', 'items-start', 'gap-3', 'mb-4');
        if (sender === 'ai') {
            messageWrapper.innerHTML = `<div class="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-comment-dots"></i></div><div class="message-bubble-ai p-3 rounded-lg max-w-xs"><p class="text-sm">${message}</p></div>`;
        } else {
            messageWrapper.classList.add('justify-end');
            messageWrapper.innerHTML = `<div class="message-bubble-user p-3 rounded-lg max-w-xs"><p class="text-sm">${message}</p></div><div class="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-user"></i></div>`;
        }
        chatHistory.appendChild(messageWrapper);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    const handleSendMessage = async () => {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;
        appendMessage('user', userMessage);
        chatInput.value = '';
        typingIndicator.classList.remove('hidden');
        typingIndicator.classList.add('flex');
        const aiResponse = await callGeminiApi(userMessage);
        typingIndicator.classList.add('hidden');
        typingIndicator.classList.remove('flex');
        appendMessage('ai', aiResponse);
    };

    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSendMessage(); });

    async function callGeminiApi(userMessage) {
        const systemPrompt = `あなたは "YAMAMOTO CREATE" というWebデベロッパーのポートフォリオサイト専門の、優秀なAIアシスタントです。あなたの目的は、下記の情報を基に、サイト訪問者からの質問に回答することです。フレンドリーかつプロフェッショナルな口調で、簡潔に回答してください。 **ルール:** - 提供された情報にない質問をされた場合は、「申し訳ありませんが、その情報については分かりかねます。Yamamoto Createのスキルや実績に関するご質問でしたらお答えできます。」と丁寧に回答してください。 - 料金や契約に関する具体的な質問には答えず、「ありがとうございます。料金やご契約に関するご相談は、CONTACTページから直接お問い合わせいただけますでしょうか。」と誘導してください。 - 常に日本語で回答してください。 --- **[提供情報]** **1. デベロッパー情報:** - 名前: Yamamoto - 拠点: 福岡 - 役割: Webデベロッパー - 特徴: ReactやFirebaseを用いたモダンなWebアプリ開発、成果に直結するLP制作、Gemini APIを組み込んだAIチャットボット開発など、幅広い技術領域に対応。ミニマルで洗練されたデザインと、直感的なUI/UXを得意とする。 **2. スキル:** - フロントエンド: React, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, レスポンシブデザイン - バックエンド & BaaS: Firebase (Firestore, Authentication), サーバーレスアーキテクチャ - AI連携: Google AI (Gemini API) を活用したAIチャットボット開発 - ライブラリ & ツール: AOS.js, Swiper.js, Google Tag Manager **3. 実績プロジェクト (WORKS):** - **選手＆コーチ向けスキルアップアプリ:** バスケ選手の成長を可視化するWebアプリ。使用技術はReact, Firebase, Tailwind CSS。 - **AIチャット搭載 顧客向けアプリ:** Gemini APIを統合し24時間顧客対応するサロン専用アプリ。使用技術はGemini API, Firebase, JavaScript。 - **ミニバスチーム公式サイト:** JSライブラリで豊かなアニメーションを実現したチームサイト。使用技術はJavaScript, AOS.js, Swiper.js。 - **不動産SNS運用代行LP:** コンバージョンを最大化するマーケティングLP。使用技術はHTML/CSS, JavaScript, GTM。 - **ウォーキングサロンLP:** 洗練されたデザインで体験レッスンへ誘導するLP。使用技術はHTML/CSS, Tailwind CSS, JavaScript。 ---`;
        conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: conversationHistory, systemInstruction: { parts: [{ text: systemPrompt }] } };
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) {
                console.error("API Error:", response.status, await response.text());
                return "申し訳ありません、現在サーバーでエラーが発生しているようです。";
            }
            const result = await response.json();
            const aiMessage = result.candidates?.[0]?.content?.parts?.[0]?.text || "すみません、うまく聞き取れませんでした。";
            conversationHistory.push({ role: "model", parts: [{ text: aiMessage }] });
            return aiMessage.replace(/\n/g, '<br>');
        } catch (error) {
            console.error("Fetch Error:", error);
            return "申し訳ありません、接続に問題が発生しました。";
        }
    }
}

