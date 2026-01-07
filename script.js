// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.querySelector('.new-chat-btn');
const suggestionCards = document.querySelectorAll('.suggestion-card');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

// Get logo image path from the existing logo in the page (ensures correct path)
const logoImageSrc = document.querySelector('.logo-icon img')?.src || './image.png';

// State
let isTyping = false;

// Initialize
function init() {
    setupEventListeners();
    autoResizeTextarea();
}

// Event Listeners
function setupEventListeners() {
    // Send message on button click
    sendBtn.addEventListener('click', handleSendMessage);
    
    // Send message on Enter (without Shift)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Enable/disable send button based on input
    messageInput.addEventListener('input', () => {
        const hasContent = messageInput.value.trim().length > 0;
        sendBtn.disabled = !hasContent;
        autoResizeTextarea();
    });
    
    // Suggestion cards
    suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.dataset.prompt;
            messageInput.value = prompt;
            messageInput.dispatchEvent(new Event('input'));
            handleSendMessage();
        });
    });
    
    // New chat button
    newChatBtn.addEventListener('click', startNewChat);
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', toggleSidebar);
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
                removeOverlay();
            }
        }
    });
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
}

// Handle sending message
function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message || isTyping) return;
    
    // Hide welcome screen and show messages
    welcomeScreen.style.display = 'none';
    messagesContainer.classList.add('active');
    
    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    sendBtn.disabled = true;
    
    // Simulate AI response
    simulateResponse(message);
}

// Add message to chat
function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const time = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    
    if (type === 'user') {
        messageDiv.innerHTML = `
            <div class="message-avatar">You</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">You</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">
                    <p>${escapeHtml(content)}</p>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="${logoImageSrc}" alt="Epsilon AI">
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">Epsilon AI</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">
                    ${content}
                </div>
                <div class="message-actions">
                    <button class="action-btn" title="Copy">
                        <span class="icon-copy"></span>
                    </button>
                    <button class="action-btn" title="Regenerate">
                        <span class="icon-refresh"></span>
                    </button>
                    <button class="action-btn" title="Like">
                        <span class="icon-thumbup"></span>
                    </button>
                    <button class="action-btn" title="Dislike">
                        <span class="icon-thumbdown"></span>
                    </button>
                </div>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
    
    // Add copy functionality
    if (type === 'assistant') {
        const copyBtn = messageDiv.querySelector('.action-btn[title="Copy"]');
        copyBtn.addEventListener('click', () => {
            const textContent = messageDiv.querySelector('.message-text').innerText;
            navigator.clipboard.writeText(textContent);
            showToast('Copied to clipboard');
        });
    }
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant typing';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <img src="${logoImageSrc}" alt="Epsilon">
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">Epsilon AI</span>
            </div>
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
    return typingDiv;
}

// Simulate AI response
function simulateResponse(userMessage) {
    isTyping = true;
    const typingIndicator = showTypingIndicator();
    
    // Simulate API delay
    const delay = 1500 + Math.random() * 1500;
    
    setTimeout(() => {
        // Remove typing indicator
        typingIndicator.remove();
        isTyping = false;
        
        // Generate response based on user message
        const response = generateResponse(userMessage);
        addMessage(response, 'assistant');
    }, delay);
}

// Generate mock response
function generateResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Mock responses based on keywords
    if (lowerMessage.includes('email')) {
        return `<p>I'd be happy to help you write a professional email. Here's a template you can customize:</p>
        <pre><code>Subject: Project Update - [Project Name]

Dear Team,

I hope this message finds you well. I wanted to provide you with a brief update on our current progress.

Key Highlights:
• [Achievement 1]
• [Achievement 2]
• [Upcoming milestone]

Next Steps:
We'll be focusing on [next phase] over the coming week.

Please let me know if you have any questions or concerns.

Best regards,
[Your Name]</code></pre>
        <p>Feel free to share more details about your specific situation, and I can help you customize this further.</p>`;
    }
    
    if (lowerMessage.includes('code') || lowerMessage.includes('review')) {
        return `<p>I'd be glad to help you review and optimize your code! To provide the most helpful feedback, please share:</p>
        <p><strong>1. The code snippet</strong> you'd like me to review</p>
        <p><strong>2. The programming language</strong> you're using</p>
        <p><strong>3. Any specific concerns</strong> (performance, readability, security, etc.)</p>
        <p>I can help with:</p>
        <ul style="margin: 12px 0; padding-left: 24px; color: var(--text-secondary);">
            <li>Identifying potential bugs and edge cases</li>
            <li>Suggesting performance optimizations</li>
            <li>Improving code readability and structure</li>
            <li>Following best practices and design patterns</li>
        </ul>
        <p>Just paste your code and I'll analyze it for you!</p>`;
    }
    
    if (lowerMessage.includes('brainstorm') || lowerMessage.includes('idea')) {
        return `<p>Great! I love brainstorming sessions. Let me help you generate some creative ideas. 🚀</p>
        <p>To give you the most relevant suggestions, could you tell me:</p>
        <p><strong>1. What industry or domain</strong> are you focusing on?</p>
        <p><strong>2. What problem</strong> are you trying to solve?</p>
        <p><strong>3. Who is your target audience?</strong></p>
        <p>In the meantime, here are some innovative trends to consider:</p>
        <ul style="margin: 12px 0; padding-left: 24px; color: var(--text-secondary);">
            <li>AI-powered personalization</li>
            <li>Sustainable and eco-friendly solutions</li>
            <li>Community-driven platforms</li>
            <li>Micro-services and modular architecture</li>
        </ul>`;
    }
    
    if (lowerMessage.includes('quantum')) {
        return `<p>Quantum computing is a fascinating field! Let me break it down in simple terms:</p>
        <p><strong>Classical computers</strong> use bits that are either 0 or 1. Think of it like a light switch - it's either ON or OFF.</p>
        <p><strong>Quantum computers</strong> use quantum bits (qubits) that can be 0, 1, or <em>both at the same time</em> - this is called superposition. Imagine a coin spinning in the air - it's neither heads nor tails until it lands.</p>
        <p><strong>Why does this matter?</strong></p>
        <p>This allows quantum computers to process many possibilities simultaneously, making them incredibly powerful for specific tasks like:</p>
        <ul style="margin: 12px 0; padding-left: 24px; color: var(--text-secondary);">
            <li>Breaking encryption codes</li>
            <li>Simulating molecules for drug discovery</li>
            <li>Optimizing complex logistics</li>
            <li>Machine learning acceleration</li>
        </ul>
        <p>Would you like me to dive deeper into any of these aspects?</p>`;
    }
    
    // Default response
    const responses = [
        `<p>That's an interesting question! Let me help you with that.</p>
        <p>Based on what you've shared, here are my thoughts:</p>
        <p>To provide you with the most accurate and helpful response, could you give me a bit more context about what you're looking to achieve? This will help me tailor my suggestions specifically to your needs.</p>
        <p>I'm here to assist with a wide range of topics including:</p>
        <ul style="margin: 12px 0; padding-left: 24px; color: var(--text-secondary);">
            <li>Writing and content creation</li>
            <li>Code review and development</li>
            <li>Analysis and research</li>
            <li>Problem-solving and brainstorming</li>
        </ul>`,
        
        `<p>Thank you for your message! I'm here to help.</p>
        <p>I'd be happy to assist you with this. To ensure I provide the most relevant and useful response, could you elaborate a bit more on your specific requirements or goals?</p>
        <p>The more details you share, the better I can tailor my assistance to your needs.</p>`,
        
        `<p>Great question! Let me break this down for you.</p>
        <p>I want to make sure I understand your needs correctly. Could you provide some additional context or specify what aspect you'd like me to focus on?</p>
        <p>I'm designed to help with complex problems, creative tasks, technical challenges, and much more. Just let me know how I can best assist you!</p>`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Start new chat
function startNewChat() {
    messagesContainer.innerHTML = '';
    messagesContainer.classList.remove('active');
    welcomeScreen.style.display = 'flex';
    messageInput.value = '';
    sendBtn.disabled = true;
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        removeOverlay();
    }
}

// Toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('open');
    
    if (sidebar.classList.contains('open')) {
        createOverlay();
    } else {
        removeOverlay();
    }
}

// Create overlay for mobile
function createOverlay() {
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
    setTimeout(() => overlay.classList.add('active'), 10);
    
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        removeOverlay();
    });
}

// Remove overlay
function removeOverlay() {
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show toast notification
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-tertiary);
        color: var(--text-primary);
        padding: 12px 24px;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: toastIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes toastIn {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toastOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
`;
document.head.appendChild(style);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
