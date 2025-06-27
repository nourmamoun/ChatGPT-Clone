import { OPENAI_API_KEY } from './constants.js';

class ChatGPTClone {
    constructor() {
        this.apiKey = OPENAI_API_KEY;
        this.currentChatId = null;
        this.chats = JSON.parse(localStorage.getItem('chat_history')) || [];
        this.isTyping = false;

        this.initializeElements();
        this.bindEvents();
        this.loadChatHistory();
        this.autoResizeTextarea();
        this.checkProxyServer();
    }

    async checkProxyServer() {
        try {
            const response = await fetch('/api/health');
            if (response.ok) {
                console.log('Proxy server is running');
            }
        } catch (error) {
            console.warn('Proxy server not detected. Make sure to run: npm start');
            if (window.location.protocol === 'file:') {
                this.showServerWarning();
            }
        }
    }

    showServerWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'server-warning';
        warningDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fef3c7;
            color: #92400e;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #fbbf24;
            z-index: 1000;
            max-width: 300px;
            font-size: 14px;
        `;
        warningDiv.innerHTML = `
            <strong>⚠️ Server Required</strong><br>
            Run <code>npm start</code> and open <code>http://localhost:3000</code>
        `;
        document.body.appendChild(warningDiv);
        
        setTimeout(() => warningDiv.remove(), 10000);
    }

    initializeElements() {
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.chatHistory = document.getElementById('chatHistory');
    }

    bindEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
        this.newChatBtn.addEventListener('click', () => this.createNewChat());
    }

    updateSendButtonState() {
        const hasMessage = this.messageInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasMessage || this.isTyping;
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        this.updateSendButtonState();
    }

    createNewChat() {
        this.currentChatId = Date.now().toString();
        const newChat = {
            id: this.currentChatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        this.chats.unshift(newChat);
        this.saveChatHistory();
        this.loadChatHistory();
        this.displayChat(newChat);
    }

    loadChatHistory() {
        this.chatHistory.innerHTML = '';
        
        if (this.chats.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <p style="color: #64748b; text-align: center; padding: 20px; font-size: 14px;">
                    No chat history yet.<br>Start a new conversation!
                </p>
            `;
            this.chatHistory.appendChild(emptyState);
            return;
        }

        this.chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            if (chat.id === this.currentChatId) {
                chatItem.classList.add('active');
            }
            
            const title = chat.title === 'New Chat' && chat.messages.length > 0 
                ? this.generateChatTitle(chat.messages[0].content)
                : chat.title;
            
            chatItem.innerHTML = `
                <div class="chat-item-title">${title}</div>
                <div class="chat-item-time">${this.formatDate(chat.createdAt)}</div>
            `;
            
            chatItem.addEventListener('click', () => {
                this.loadChat(chat.id);
            });
            
            this.chatHistory.appendChild(chatItem);
        });
    }

    generateChatTitle(firstMessage) {
        return firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return 'Today';
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    loadChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            this.currentChatId = chatId;
            this.displayChat(chat);
            this.loadChatHistory(); // Refresh to update active state
        }
    }

    displayChat(chat) {
        this.chatMessages.innerHTML = '';
        
        if (chat.messages.length === 0) {
            this.showWelcomeMessage();
        } else {
            chat.messages.forEach(message => {
                this.displayMessage(message.content, message.role, message.timestamp);
            });
        }
        
        this.scrollToBottom();
    }

    showWelcomeMessage() {
        this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h2>Welcome to ChatGPT Clone</h2>
                <p>Powered by GPT-4o-mini - Start a conversation below!</p>
            </div>
        `;
    }

    async sendMessage() {
        if (this.apiKey === 'YOUR_API_KEY_HERE') {
            alert('Please replace YOUR_API_KEY_HERE with your actual OpenAI API key in the script.js file');
            return;
        }

        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        // Create new chat if none exists
        if (!this.currentChatId) {
            this.createNewChat();
        }

        // Clear input and show user message
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.displayMessage(message, 'user');

        // Add message to current chat
        const currentChat = this.chats.find(c => c.id === this.currentChatId);
        if (currentChat) {
            currentChat.messages.push({
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });
            
            // Update chat title if it's the first message
            if (currentChat.title === 'New Chat' && currentChat.messages.length === 1) {
                currentChat.title = this.generateChatTitle(message);
            }
        }

        // Show typing indicator
        this.showTypingIndicator();
        this.isTyping = true;
        this.updateSendButtonState();

        try {
            const response = await this.callOpenAI(currentChat.messages);
            this.hideTypingIndicator();
            
            if (response) {
                this.displayMessage(response, 'assistant');
                currentChat.messages.push({
                    role: 'assistant',
                    content: response,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            this.hideTypingIndicator();
            console.error('OpenAI API error:', error);
            
            // More detailed error messages
            let errorMessage = 'Sorry, I encountered an error: ';
            if (error.message.includes('CORS')) {
                errorMessage = 'CORS Error: Direct browser calls to OpenAI API are blocked. You need to use a proxy server or backend.';
            } else if (error.message.includes('401')) {
                errorMessage = 'Authentication Error: Please check your API key.';
            } else if (error.message.includes('429')) {
                errorMessage = 'Rate Limit Error: Too many requests. Please wait a moment.';
            } else if (error.message.includes('insufficient_quota')) {
                errorMessage = 'Quota Exceeded: Your OpenAI account has insufficient credits. Please add billing or wait for quota reset.';
            } else if (error.message.includes('quota')) {
                errorMessage = 'Billing Issue: Please check your OpenAI account billing and usage at platform.openai.com/usage';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network Error: Cannot reach OpenAI API. This is likely due to CORS restrictions in the browser.';
            } else {
                errorMessage += error.message;
            }
            
            this.displayMessage(errorMessage, 'assistant');
            
            // Show specific help for quota errors
            if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
                setTimeout(() => {
                    this.displayMessage(`
                        <strong>💳 How to fix this:</strong><br>
                        1. Visit <a href="https://platform.openai.com/usage" target="_blank">platform.openai.com/usage</a> to check your usage<br>
                        2. Go to <a href="https://platform.openai.com/account/billing" target="_blank">platform.openai.com/account/billing</a><br>
                        3. Add a payment method and purchase credits<br>
                        4. Free tier credits may have expired - you'll need to add billing
                    `, 'assistant');
                }, 1000);
            }
            
            // Show CORS solution if it's a fetch error
            if (error.message.includes('Failed to fetch')) {
                setTimeout(() => {
                    this.displayMessage(`
                        <strong>Solution:</strong><br>
                        1. Use a browser extension like "CORS Unblock" (not recommended for production)<br>
                        2. Create a simple backend proxy server<br>
                        3. Use browser flags: <code>--disable-web-security --user-data-dir="c:/temp"</code><br>
                        4. Deploy to a server instead of opening as local file
                    `, 'assistant');
                }, 1000);
            }
        }

        this.isTyping = false;
        this.updateSendButtonState();
        this.saveChatHistory();
        this.loadChatHistory(); // Refresh chat history to update title
    }

    async callOpenAI(messages) {
        const apiMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        console.log('Making API call with messages:', apiMessages);

        try {
            // Use proxy server instead of direct OpenAI API call
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: apiMessages,
                    apiKey: this.apiKey
                })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            // Check if response has content
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = responseText ? JSON.parse(responseText) : { error: { message: 'Empty error response' } };
                } catch (e) {
                    errorData = { error: { message: `Server error: ${responseText || 'Unknown error'}` } };
                }
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
            }

            if (!responseText) {
                throw new Error('Empty response from server');
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                throw new Error('Invalid JSON response from server');
            }

            console.log('API Success Response:', data);
            return data.choices?.[0]?.message?.content || 'No response received';
        } catch (fetchError) {
            console.error('Fetch Error:', fetchError);
            
            // More specific error handling
            if (fetchError.message.includes('Failed to fetch') || fetchError.name === 'TypeError') {
                throw new Error('Cannot connect to proxy server. Make sure the server is running at http://localhost:3000');
            }
            
            if (fetchError.message.includes('Unexpected end of JSON input')) {
                throw new Error('Server returned empty response. Check if the proxy server is working correctly.');
            }
            
            throw fetchError;
        }
    }

    displayMessage(content, role, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const time = timestamp ? new Date(timestamp) : new Date();
        const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const avatar = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-bubble">${this.formatMessage(content)}</div>
                <div class="message-time">${timeString}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // Remove welcome message if it exists
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
    }

    formatMessage(content) {
        // Basic markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    saveChatHistory() {
        localStorage.setItem('chat_history', JSON.stringify(this.chats));
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatGPTClone();
});
