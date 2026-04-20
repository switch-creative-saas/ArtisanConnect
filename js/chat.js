/**
 * ArtisanConnect - Chat/Messaging JavaScript
 */

// ============================================
// CONVERSATIONS (API-DRIVEN)
// ============================================

let conversationsData = [];

let activeConversationId = null;
let isTyping = false;
let pollingInterval = null;
let lastMessageTimestamp = {};
const WELCOME_CHAT_ID = -1;

function getWelcomeConversation() {
  return {
    id: WELCOME_CHAT_ID,
    name: 'System / Support',
    avatar: '../assets/app-logo.png',
    status: 'online',
    isSystem: true,
    isPinned: true,
    icon: '🛟',
    unreadCount: 0,
    lastMessage: 'Welcome to ArtisanConnect',
    lastMessageTime: 'Now',
    messages: [
      {
        id: `welcome-${Date.now()}`,
        sender: 'them',
        text: 'Welcome to ArtisanConnect! You can message artisans here after you start a hire request.',
        time: 'Today, Now'
      }
    ]
  };
}

function ensureWelcomeConversation() {
  const existing = conversationsData.find(c => Number(c.id) === WELCOME_CHAT_ID);
  if (existing) return;
  conversationsData = [getWelcomeConversation(), ...conversationsData];
}

function isSystemConversation(chat) {
  return Number(chat?.id) === WELCOME_CHAT_ID || !!chat?.isSystem;
}

// ============================================
// INITIALIZE CHAT PAGE
// ============================================

async function initChatPage() {
  // Load conversations from backend.
  try {
    const apiBase = typeof getApiBaseUrl === 'function'
      ? getApiBaseUrl()
      : `${typeof getSiteRootPrefix === 'function' ? getSiteRootPrefix() : ''}backend/api`;
    const res = await fetch(`${apiBase}/conversations/index.php`, {
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.ok && Array.isArray(data?.conversations)) {
        conversationsData = data.conversations;
      }
    }
  } catch (e) {
    // If the backend isn't running, keep mock/fallback `conversationsData`.
  }

  ensureWelcomeConversation();
  renderChatList();
  
  // Check for URL param to open specific chat
  const urlParams = new URLSearchParams(window.location.search);
  const chatIdRaw = urlParams.get('chat');
  const chatId = chatIdRaw ? Number(chatIdRaw) : null;
  if (chatId && conversationsData.some(c => Number(c.id) === chatId)) {
    openConversation(chatId);
  } else {
    // Open default welcome chat.
    openConversation(WELCOME_CHAT_ID);
  }

  // Consume pending order notification (sent from hire checkout)
  try {
    const raw = sessionStorage.getItem('pendingChatNotification');
    if (raw) {
      const payload = JSON.parse(raw);
      sessionStorage.removeItem('pendingChatNotification');
      if (payload?.chatId && payload?.text) {
        const conv = conversationsData.find(c => c.id === Number(payload.chatId));
        if (conv) {
          const msg = {
            id: Date.now(),
            sender: 'me',
            text: payload.text,
            time: 'Just now',
            status: 'sent'
          };
          conv.messages.push(msg);
          conv.lastMessage = payload.text;
          conv.lastMessageTime = 'Just now';
          conv.unreadCount = 0;
          renderChatList();
          // If we are already in that chat, re-render
          if (activeConversationId === conv.id) {
            renderMessages(conv);
            scrollToBottom();
          }
        }
      }
    }
  } catch (e) {}
}

// ============================================
// RENDER CHAT LIST
// ============================================

function renderChatList() {
  const chatList = document.getElementById('chatList');
  if (!chatList) return;
  
  chatList.innerHTML = conversationsData.map(chat => `
    <div class="chat-item ${chat.unreadCount > 0 ? 'unread' : ''} ${chat.id === activeConversationId ? 'active' : ''} ${isSystemConversation(chat) ? 'chat-item-system' : ''}" 
         onclick="openConversation(${chat.id})"
         data-name="${chat.name.toLowerCase()}">
      <div class="chat-item-avatar">
        <img src="${chat.avatar}" alt="${chat.name}">
        <span class="chat-item-status ${chat.status}"></span>
        ${isSystemConversation(chat) ? `<span class="chat-system-icon">${chat.icon || '🛟'}</span>` : ''}
      </div>
      <div class="chat-item-content">
        <div class="chat-item-header">
          <span class="chat-item-name">${chat.name}</span>
          <span class="chat-item-time">${chat.lastMessageTime}</span>
        </div>
        <div class="chat-item-preview">
          <span class="chat-item-message ${chat.unreadCount > 0 ? 'unread' : ''}">${chat.lastMessage}</span>
          ${chat.isPinned ? `<span class="chat-pin-badge" title="Pinned">Pinned</span>` : ''}
          ${chat.unreadCount > 0 ? `<span class="chat-item-badge">${chat.unreadCount}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// ============================================
// OPEN CONVERSATION
// ============================================

async function openConversation(chatId) {
  // Stop polling previous conversation
  stopPolling();
  
  // Hide welcome message if it exists
  const welcomeMessage = document.querySelector('.welcome-message');
  if (welcomeMessage) {
    welcomeMessage.remove();
  }
  
  activeConversationId = chatId;
  const conversation = conversationsData.find(c => c.id === chatId);
  if (!conversation) return;
  
  // Update UI
  document.getElementById('chatEmpty').style.display = 'none';
  document.getElementById('chatHeader').style.display = 'flex';
  document.getElementById('chatMessages').style.display = 'flex';
  document.getElementById('chatInput').style.display = 'block';
  
  // Update header
  document.getElementById('activeChatAvatar').src = conversation.avatar;
  document.getElementById('activeChatAvatar').alt = conversation.name;
  document.getElementById('activeChatName').innerHTML = isSystemConversation(conversation)
    ? `${escapeHtml(conversation.name)} <span class="chat-pin-badge header">Pinned</span>`
    : escapeHtml(conversation.name);
  document.getElementById('activeChatStatus').className = `chat-header-status ${conversation.status}`;
  document.getElementById('activeChatStatusText').textContent = isSystemConversation(conversation)
    ? 'System channel • Support updates'
    : (conversation.status === 'online' ? 'Online' : conversation.status === 'away' ? 'Away' : 'Offline');
  
  // Update typing indicator avatar
  document.getElementById('typingAvatar').src = conversation.avatar;
  
  // Load messages from backend before rendering.
  if (chatId !== WELCOME_CHAT_ID) {
    try {
      const apiBase = typeof getApiBaseUrl === 'function'
        ? getApiBaseUrl()
        : `${typeof getSiteRootPrefix === 'function' ? getSiteRootPrefix() : ''}backend/api`;
      const res = await fetch(`${apiBase}/conversations/messages.php?id=${encodeURIComponent(chatId)}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && Array.isArray(data?.messages)) {
          conversation.messages = data.messages;
          // Store timestamp of last message for polling
          if (data.messages.length > 0) {
            const lastMessage = data.messages[data.messages.length - 1];
            lastMessageTimestamp[chatId] = lastMessage.id || Date.now();
          }
        }
      }
    } catch (e) {
      // Ignore and render whatever messages we already have.
    }
  }

  // Render messages
  renderMessages(conversation);
  
  // Start real-time polling for real conversations only.
  if (chatId !== WELCOME_CHAT_ID) {
    startPolling(chatId);
  } else {
    document.getElementById('chatInput').style.display = 'none';
  }
  
  // Mark as read
  conversation.unreadCount = 0;
  renderChatList();
  
  // Scroll to bottom
  scrollToBottom();
  
  // On mobile, hide sidebar
  if (window.innerWidth <= 768) {
    document.getElementById('chatContainer')?.classList.add('mobile-chat-open');
  }
}

// ============================================
// RENDER MESSAGES
// ============================================

function renderMessages(conversation) {
  const messagesContainer = document.getElementById('chatMessages');
  if (!messagesContainer) return;
  
  let lastDate = null;
  
  messagesContainer.innerHTML = conversation.messages.map((message, index) => {
    let dateDivider = '';
    const messageDate = message.time.includes('Today') || message.time.includes('Yesterday') ? 
                       message.time.split(',')[0] : message.time.split(',')[0];
    
    if (messageDate !== lastDate && index > 0) {
      dateDivider = `<div class="chat-date-divider"><span>${messageDate}</span></div>`;
    }
    lastDate = messageDate;
    
    return `
      ${dateDivider}
      <div class="message ${message.sender === 'me' ? 'sent' : 'received'}">
        ${message.sender === 'them' ? `<div class="message-avatar"><img src="${conversation.avatar}" alt="${conversation.name}"></div>` : ''}
        <div class="message-content">
          <div class="message-bubble">${escapeHtml(message.text)}</div>
          <div class="message-time">
            ${message.time}
            ${message.sender === 'me' ? `
              <span class="message-status ${message.status}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// SEND MESSAGE
// ============================================

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  
  if (!text || !activeConversationId) return;
  if (activeConversationId === WELCOME_CHAT_ID) {
    showToast('Start a conversation with an artisan to send messages.', 'info');
    return;
  }
  
  const conversation = conversationsData.find(c => c.id === activeConversationId);
  if (!conversation) return;

  try {
    const apiBase = typeof getApiBaseUrl === 'function'
      ? getApiBaseUrl()
      : `${typeof getSiteRootPrefix === 'function' ? getSiteRootPrefix() : ''}backend/api`;
    const res = await fetch(`${apiBase}/conversations/messages.php?id=${encodeURIComponent(activeConversationId)}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text })
    });

    if (!res.ok) {
      let err = null;
      try { err = await res.json(); } catch (e) {}
      showToast(err?.error || 'Could not send message.', 'error');
      return;
    }

    const data = await res.json();
    const newMessage = data?.message;
    if (newMessage && Array.isArray(conversation.messages)) {
      conversation.messages.push(newMessage);
      conversation.lastMessage = newMessage.text;
      conversation.lastMessageTime = newMessage.time || 'Just now';
    }
    if (data?.autoReply && Array.isArray(conversation.messages)) {
      conversation.messages.push(data.autoReply);
      conversation.lastMessage = data.autoReply.text || conversation.lastMessage;
      conversation.lastMessageTime = data.autoReply.time || 'Just now';
    }

    // Clear input
    input.value = '';
    input.style.height = 'auto';

    // Re-render
    renderMessages(conversation);
    renderChatList();
    scrollToBottom();
    window.dispatchEvent(new Event('conversations:changed'));
  } catch (e) {
    showToast('Network error. Please try again.', 'error');
  }
}

// ============================================
// TYPING INDICATOR
// ============================================

function showTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.style.display = 'flex';
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.style.display = 'none';
}

// ============================================
// AUTO RESIZE TEXTAREA
// ============================================

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
}

// ============================================
// HANDLE KEY DOWN
// ============================================

function handleKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// ============================================
// SCROLL TO BOTTOM
// ============================================

function scrollToBottom() {
  const messagesContainer = document.getElementById('chatMessages');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// ============================================
// SEARCH CONVERSATIONS
// ============================================

function searchConversations() {
  const searchTerm = document.getElementById('chatSearch').value.toLowerCase();
  const chatItems = document.querySelectorAll('.chat-item');
  
  chatItems.forEach(item => {
    const name = item.dataset.name;
    if (name.includes(searchTerm)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// ============================================
// SHOW CHAT LIST (MOBILE)
// ============================================

function showChatList() {
  document.getElementById('chatContainer')?.classList.remove('mobile-chat-open');
}

function startNewConversation() {
  showChatList();
  const search = document.getElementById('chatSearch');
  if (search) {
    search.focus();
    showToast('Search for an artisan to start a new conversation', 'info');
  }
}

// ============================================
// REAL-TIME POLLING
// ============================================

function startPolling(conversationId) {
  // Clear any existing polling
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  
  // Poll every 3 seconds for new messages
  pollingInterval = setInterval(async () => {
    await pollForNewMessages(conversationId);
  }, 3000);
}

async function pollForNewMessages(conversationId) {
  try {
    const apiBase = typeof getApiBaseUrl === 'function'
      ? getApiBaseUrl()
      : `${typeof getSiteRootPrefix === 'function' ? getSiteRootPrefix() : ''}backend/api`;
    
    const res = await fetch(`${apiBase}/conversations/messages.php?id=${encodeURIComponent(conversationId)}`, {
      credentials: 'include'
    });
    
    if (!res.ok) return;
    
    const data = await res.json();
    if (!data?.ok || !Array.isArray(data?.messages)) return;
    
    const conversation = conversationsData.find(c => c.id === conversationId);
    if (!conversation) return;
    
    // Check if we have new messages
    const currentLastId = lastMessageTimestamp[conversationId] || 0;
    const newMessages = data.messages.filter(msg => (msg.id || Date.now()) > currentLastId);
    
    if (newMessages.length > 0) {
      conversation.messages = data.messages;
      const lastMessage = data.messages[data.messages.length - 1];
      lastMessageTimestamp[conversationId] = lastMessage.id || Date.now();
      
      // Only re-render if this is the active conversation
      if (activeConversationId === conversationId) {
        renderMessages(conversation);
        scrollToBottom();
      } else {
        // Update conversation list with new message
        conversation.lastMessage = lastMessage.text;
        conversation.lastMessageTime = lastMessage.time;
        conversation.unreadCount = (conversation.unreadCount || 0) + newMessages.filter(m => m.sender === 'them').length;
        renderChatList();
      }
    }
  } catch (error) {
    // Silently handle polling errors
    console.error('Polling error:', error);
  }
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

// ============================================
// WELCOME MESSAGE
// ============================================

function showWelcomeMessage() {
  openConversation(WELCOME_CHAT_ID);
  return;

  // Hide chat elements and show welcome
  document.getElementById('chatEmpty').style.display = 'none';
  document.getElementById('chatHeader').style.display = 'none';
  document.getElementById('chatMessages').style.display = 'none';
  document.getElementById('chatInput').style.display = 'none';
  
  // Create welcome message container
  const chatMain = document.querySelector('.chat-main');
  if (chatMain) {
    const existingWelcome = chatMain.querySelector('.welcome-message');
    if (existingWelcome) {
      existingWelcome.remove();
    }
    
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <div style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;">💬</div>
        <h2 style="color: var(--text); margin-bottom: 16px;">Welcome to Messages</h2>
        <p style="font-size: 1.1rem; line-height: 1.6; max-width: 400px; margin: 0 auto;">
          Start a conversation with an artisan by browsing artisans and clicking "Message", or complete a hire request to begin chatting about your project.
        </p>
        <div style="margin-top: 30px;">
          <a href="search.html" class="btn btn-primary" style="text-decoration: none;">Find Artisans</a>
        </div>
      </div>
    `;
    chatMain.appendChild(welcomeDiv);
  }
}

// ============================================
// ESCAPE HTML
// ============================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initChatPage();
});
