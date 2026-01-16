class ChatManager {
    constructor(mapManager, uiManager) {
        this.mapManager = mapManager;
        this.uiManager = uiManager;
        this.isOpen = false;

        // Define some basic knowledge/commands
        this.commands = [
            {
                keywords: ['hello', 'hi', 'hey'],
                response: "Hello! I'm your News Assistant. You can ask me to find news in specific locations or filter the map."
            },
            {
                keywords: ['help', 'what can you do'],
                response: "I can help you navigate the news map. Try saying:\n- 'Go to London'\n- 'Show me fires'\n- 'Reset the view'"
            },
            {
                keywords: ['reset', 'home'],
                action: () => {
                    this.mapManager.resetView();
                    return "I've reset the map view for you.";
                }
            },
            {
                keywords: ['3d', 'three d', 'terrain'],
                action: () => {
                    this.mapManager.toggle3D();
                    return "Toggling 3D mode.";
                }
            }
        ];

        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();

        // Initial greeting after a small delay
        setTimeout(() => {
            if (this.messagesContainer.children.length === 0) {
                this.addMessage("Welcome to NewsMap! 🌍 How can I help you discover news today?", 'bot');
            }
        }, 1500);
    }

    cacheDOM() {
        this.fab = document.getElementById('chat-fab');
        this.chatWindow = document.getElementById('chat-window');
        this.closeBtn = document.getElementById('close-chat');
        this.sendBtn = document.getElementById('send-message');
        this.input = document.getElementById('chat-input');
        this.messagesContainer = document.getElementById('chat-messages');
        this.typingIndicator = document.getElementById('typing-indicator');
    }

    bindEvents() {
        this.fab.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat());

        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.remove('hidden');
            this.input.focus();
        } else {
            this.chatWindow.classList.add('hidden');
        }
    }

    sendMessage() {
        const text = this.input.value.trim();
        if (!text) return;

        // User message
        this.addMessage(text, 'user');
        this.input.value = '';

        // Bot typing simulation
        this.showTyping();

        // Process response
        setTimeout(() => {
            this.processUserMessage(text);
        }, 600 + Math.random() * 800); // Random delay for realism
    }

    addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);

        // Handle newlines
        msgDiv.innerText = text;

        this.messagesContainer.appendChild(msgDiv);
        this.scrollToBottom();
    }

    showTyping() {
        this.typingIndicator.classList.add('active');
        this.typingIndicator.parentElement.appendChild(this.typingIndicator); // Move to bottom
        this.scrollToBottom();
    }

    hideTyping() {
        this.typingIndicator.classList.remove('active');
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    processUserMessage(text) {
        this.hideTyping();
        const lowerText = text.toLowerCase();

        // 1. Check predefined commands
        for (const cmd of this.commands) {
            if (cmd.keywords.some(k => lowerText.includes(k))) {
                if (cmd.action) {
                    const result = cmd.action();
                    this.addMessage(result || "Done!", 'bot');
                } else {
                    this.addMessage(cmd.response, 'bot');
                }
                return;
            }
        }

        // 2. Filter commands (Show breaking/trending etc)
        const filterMatch = lowerText.match(/show (me )?(breaking|trending|normal|all) news/);
        if (filterMatch) {
            const type = filterMatch[2];
            this.handleFilter(type);
            return;
        }

        // 3. Check for "Go to [Location]" pattern
        const gotoMatch = lowerText.match(/go to (.+)/) || lowerText.match(/show me (.+)/) || lowerText.match(/where is (.+)/);
        if (gotoMatch) {
            const query = gotoMatch[1].replace('?', '').trim();
            const foundItems = this.searchNews(query);

            if (foundItems.length > 0) {
                const item = foundItems[0];
                // Use the exposed flyTo method from MapManager (expecting center array)
                this.mapManager.flyTo([item.location.lng, item.location.lat], 10);
                this.uiManager.showNewsDetail(item);
                this.addMessage(`I found news about "${item.title}". Taking you there!`, 'bot');
            } else {
                this.addMessage(`I couldn't find specific news about "${query}". Try searching for categories like 'breaking news' or exact keywords in titles.`, 'bot');
            }
            return;
        }

        // 4. Default fallback logic (Basic AI-like personality)
        const responses = [
            "That's interesting! Tell me more.",
            "I'm focusing on global news events. Try asking about specific regions.",
            "I can help you navigate the map. Just say 'Go to [City]'.",
            "Could you rephrase that? I'm a simple news bot."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.addMessage(randomResponse, 'bot');
    }

    handleFilter(type) {
        if (typeof MOCK_NEWS === 'undefined') return;

        let filtered;
        let msg;

        if (type === 'all') {
            filtered = MOCK_NEWS;
            msg = "Showing all news events.";
        } else {
            filtered = MOCK_NEWS.filter(item => item.type === type);
            msg = `Showing ${type} news only. Found ${filtered.length} events.`;
        }

        this.mapManager.addMarkers(filtered);
        this.addMessage(msg, 'bot');

        if (filtered.length > 0) {
            const first = filtered[0];
            this.mapManager.flyTo([first.location.lng, first.location.lat], 4);
        }
    }

    searchNews(query) {
        // Access global news data if available
        if (typeof MOCK_NEWS !== 'undefined') {
            return MOCK_NEWS.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.summary.toLowerCase().includes(query)
            );
        }
        return [];
    }

    explainNews(item) {
        if (!this.isOpen) this.toggleChat();

        this.addMessage(`Explain the news story: "${item.title}"`, 'user');
        this.showTyping();

        setTimeout(() => {
            this.hideTyping();
            const explanations = [
                `This event is significant because it impacts the ${item.type} sector directly. Sources from ${item.source} indicate potential long-term effects on the region around ${this.formatLocationName(item)}.`,
                `Here's a breakdown: The "${item.title}" highlights a key development in global affairs. Experts suggest monitoring this closely over the next few days.`,
                `Analysis: This is a positively trending story. The discovery/event at ${item.location.lat.toFixed(2)}, ${item.location.lng.toFixed(2)} could shift local dynamics.`
            ];
            const randomExpl = explanations[Math.floor(Math.random() * explanations.length)];

            this.addMessage(randomExpl, 'bot');
        }, 1500);
    }
}
