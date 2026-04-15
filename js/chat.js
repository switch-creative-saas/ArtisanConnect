/**
 * ArtisanConnect - Chat/Messaging JavaScript
 */

// ============================================
// MOCK CHAT DATA
// ============================================

const conversationsData = [
  {
    id: 1,
    artisanId: 1,
    name: 'Mike Johnson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    service: 'Plumber',
    status: 'online',
    lastMessage: 'I\'ll be there in 15 minutes',
    lastMessageTime: '10:30 AM',
    unreadCount: 2,
    messages: [
      {
        id: 1,
        sender: 'me',
        text: 'Hi Mike, are you available for a plumbing job tomorrow?',
        time: 'Yesterday, 4:30 PM',
        status: 'read'
      },
      {
        id: 2,
        sender: 'them',
        text: 'Hello! Yes, I should be available. What time works for you?',
        time: 'Yesterday, 4:45 PM',
        status: 'read'
      },
      {
        id: 3,
        sender: 'me',
        text: 'Would 2 PM work? I have a leaky faucet that needs fixing.',
        time: 'Yesterday, 5:00 PM',
        status: 'read'
      },
      {
        id: 4,
        sender: 'them',
        text: '2 PM works perfectly. I\'ll be there in 15 minutes',
        time: '10:30 AM',
        status: 'unread'
      }
    ]
  },
  {
    id: 2,
    artisanId: 2,
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    service: 'Electrician',
    status: 'online',
    lastMessage: 'The repair is complete!',
    lastMessageTime: '9:15 AM',
    unreadCount: 1,
    messages: [
      {
        id: 1,
        sender: 'me',
        text: 'Hi David, I need help with some electrical work',
        time: 'Jan 14, 2:00 PM',
        status: 'read'
      },
      {
        id: 2,
        sender: 'them',
        text: 'Hi! I\'d be happy to help. What kind of electrical work do you need?',
        time: 'Jan 14, 2:15 PM',
        status: 'read'
      },
      {
        id: 3,
        sender: 'me',
        text: 'I need to install some new outlets in my kitchen',
        time: 'Jan 14, 2:30 PM',
        status: 'read'
      },
      {
        id: 4,
        sender: 'them',
        text: 'The repair is complete!',
        time: '9:15 AM',
        status: 'unread'
      }
    ]
  },
  {
    id: 3,
    artisanId: 3,
    name: 'Robert Williams',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    service: 'Carpenter',
    status: 'offline',
    lastMessage: 'Thank you for the opportunity!',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 1,
        sender: 'me',
        text: 'Hi Robert, I saw your profile and I\'m impressed with your work',
        time: 'Jan 10, 10:00 AM',
        status: 'read'
      },
      {
        id: 2,
        sender: 'them',
        text: 'Thank you! I\'d love to help with your project.',
        time: 'Jan 10, 10:30 AM',
        status: 'read'
      },
      {
        id: 3,
        sender: 'me',
        text: 'Great! I\'ll send you the details soon.',
        time: 'Jan 10, 11:00 AM',
        status: 'read'
      },
      {
        id: 4,
        sender: 'them',
        text: 'Thank you for the opportunity!',
        time: 'Yesterday',
        status: 'read'
      }
    ]
  },
  {
    id: 4,
    artisanId: 4,
    name: 'Lisa Anderson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    service: 'Cleaner',
    status: 'away',
    lastMessage: 'I\'ll bring all the supplies needed',
    lastMessageTime: 'Jan 12',
    unreadCount: 0,
    messages: [
      {
        id: 1,
        sender: 'me',
        text: 'Hi Lisa, are you available for a deep clean this weekend?',
        time: 'Jan 12, 9:00 AM',
        status: 'read'
      },
      {
        id: 2,
        sender: 'them',
        text: 'Yes, Saturday morning works for me!',
        time: 'Jan 12, 9:30 AM',
        status: 'read'
      },
      {
        id: 3,
        sender: 'me',
        text: 'Perfect! See you at 10 AM.',
        time: 'Jan 12, 10:00 AM',
        status: 'read'
      },
      {
        id: 4,
        sender: 'them',
        text: 'I\'ll bring all the supplies needed',
        time: 'Jan 12, 10:15 AM',
        status: 'read'
      }
    ]
  }
];

let activeConversationId = null;
let isTyping = false;

// ============================================
// INITIALIZE CHAT PAGE
// ============================================

function initChatPage() {
  renderChatList();
  
  // Check for URL param to open specific chat
  const urlParams = new URLSearchParams(window.location.search);
  const chatId = urlParams.get('chat');
  if (chatId) {
    openConversation(parseInt(chatId));
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
    <div class="chat-item ${chat.unreadCount > 0 ? 'unread' : ''} ${chat.id === activeConversationId ? 'active' : ''}" 
         onclick="openConversation(${chat.id})"
         data-name="${chat.name.toLowerCase()}">
      <div class="chat-item-avatar">
        <img src="${chat.avatar}" alt="${chat.name}">
        <span class="chat-item-status ${chat.status}"></span>
      </div>
      <div class="chat-item-content">
        <div class="chat-item-header">
          <span class="chat-item-name">${chat.name}</span>
          <span class="chat-item-time">${chat.lastMessageTime}</span>
        </div>
        <div class="chat-item-preview">
          <span class="chat-item-message ${chat.unreadCount > 0 ? 'unread' : ''}">${chat.lastMessage}</span>
          ${chat.unreadCount > 0 ? `<span class="chat-item-badge">${chat.unreadCount}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// ============================================
// OPEN CONVERSATION
// ============================================

function openConversation(chatId) {
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
  document.getElementById('activeChatName').textContent = conversation.name;
  document.getElementById('activeChatStatus').className = `chat-header-status ${conversation.status}`;
  document.getElementById('activeChatStatusText').textContent = conversation.status === 'online' ? 'Online' : 
                                                               conversation.status === 'away' ? 'Away' : 'Offline';
  
  // Update typing indicator avatar
  document.getElementById('typingAvatar').src = conversation.avatar;
  
  // Render messages
  renderMessages(conversation);
  
  // Mark as read
  conversation.unreadCount = 0;
  renderChatList();
  
  // Scroll to bottom
  scrollToBottom();
  
  // On mobile, hide sidebar
  if (window.innerWidth <= 768) {
    document.getElementById('chatSidebar').classList.remove('active');
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

function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  
  if (!text || !activeConversationId) return;
  
  const conversation = conversationsData.find(c => c.id === activeConversationId);
  if (!conversation) return;
  
  // Add message
  const newMessage = {
    id: Date.now(),
    sender: 'me',
    text: text,
    time: 'Just now',
    status: 'sent'
  };
  
  conversation.messages.push(newMessage);
  conversation.lastMessage = text;
  conversation.lastMessageTime = 'Just now';
  
  // Clear input
  input.value = '';
  input.style.height = 'auto';
  
  // Re-render
  renderMessages(conversation);
  renderChatList();
  scrollToBottom();
  
  // Simulate reply after delay
  simulateReply(conversation);
}

// ============================================
// SIMULATE REPLY
// ============================================

function simulateReply(conversation) {
  // Show typing indicator
  setTimeout(() => {
    showTypingIndicator();
    
    // Send reply after typing
    setTimeout(() => {
      hideTypingIndicator();
      
      const replies = [
        'That sounds great!',
        'I understand. Let me check my schedule.',
        'Perfect! I\'ll make a note of that.',
        'Thanks for letting me know!',
        'I\'ll get back to you on that soon.'
      ];
      
      const reply = {
        id: Date.now(),
        sender: 'them',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: 'Just now',
        status: 'read'
      };
      
      conversation.messages.push(reply);
      conversation.lastMessage = reply.text;
      conversation.lastMessageTime = 'Just now';
      conversation.unreadCount = 1;
      
      renderMessages(conversation);
      renderChatList();
      scrollToBottom();
      
      // Play notification sound (optional)
      showToast(`New message from ${conversation.name}`, 'info');
    }, 2000);
  }, 1000);
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
  document.getElementById('chatSidebar').classList.add('active');
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
