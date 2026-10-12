import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { initials, timeAgo } from '../utils/constants';

export const Messages = ({ activeChatUser, setActiveChatUser, chatDraft, setChatDraft }) => {
  const { user, authFetch } = useAuth();
  const { toast } = useToast();

  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentContact, setCurrentContact] = useState(null);
  const [inputText, setInputText] = useState(chatDraft || '');
  const [loadingChat, setLoadingChat] = useState(false);

  const messagesEndRef = useRef(null);

  // Load contacts
  const fetchContacts = async () => {
    try {
      const data = await authFetch('/api/messages/contacts');
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch contacts error:', err);
    }
  };

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

  // Load active chat user profile if not in contacts list yet
  useEffect(() => {
    if (!activeChatUser) return;

    authFetch(`/api/auth/users/${activeChatUser}`)
      .then((contactData) => {
        setCurrentContact(contactData);
      })
      .catch((err) => console.error('Fetch user error:', err));
  }, [activeChatUser]);

  // Load chat messages
  const fetchMessages = async () => {
    if (!activeChatUser) return;
    try {
      const data = await authFetch(`/api/messages/${activeChatUser}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  useEffect(() => {
    if (activeChatUser) {
      setLoadingChat(true);
      fetchMessages().finally(() => setLoadingChat(false));

      // Poll messages every 4 seconds
      const interval = setInterval(fetchMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [activeChatUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto populate draft
  useEffect(() => {
    if (chatDraft) {
      setInputText(chatDraft);
      setChatDraft('');
    }
  }, [chatDraft]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatUser) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const newMsg = await authFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          to: activeChatUser,
          text: textToSend,
        }),
      });

      setMessages((prev) => [...prev, newMsg]);
      fetchContacts();
    } catch (err) {
      toast(err.message || 'Failed to send message', 'err');
    }
  };

  const handleSelectContact = (c) => {
    setActiveChatUser(c._id);
    setCurrentContact(c);
  };

  if (!user) {
    return (
      <div className="container">
        <div className="empty">
          <h3>Please sign in</h3>
          <p>You need an active account to use secure messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="msg-wrap">
        {/* Left: Contacts List */}
        <aside className="convo-list">
          <div
            style={{
              padding: '14px',
              borderBottom: '2px solid var(--border)',
              fontWeight: 700,
              color: 'var(--deep)',
            }}
          >
            💬 Direct Messages
          </div>

          {(() => {
            const displayContacts = [...contacts];
            if (currentContact && !displayContacts.some((c) => String(c._id) === String(currentContact._id))) {
              displayContacts.unshift(currentContact);
            }

            return displayContacts.length > 0 ? (
              displayContacts.map((c) => {
                const active = String(activeChatUser) === String(c._id);

                return (
                  <div
                    key={c._id}
                    className={`convo ${active ? 'active' : ''}`}
                    onClick={() => handleSelectContact(c)}
                  >
                    <span className={`avatar ${c.role}`}>{initials(c.name)}</span>
                    <div style={{ flex: 1 }}>
                      <div className="cn">{c.name}</div>
                      <div className="cp">
                        {c.role === 'farmer' ? '🧑‍🌾 Farmer' : '🛒 Buyer'}
                      </div>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="cbadge">{c.unreadCount}</span>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: '24px 14px',
                  textAlign: 'center',
                  color: 'var(--muted)',
                  fontSize: '13.5px',
                }}
              >
                No conversations yet.
                <br />
                <br />
                💬 Start a chat from any product page or buyer request!
              </div>
            );
          })()}
        </aside>

        {/* Right: Active Chat View */}
        <div className="chat">
          {currentContact ? (
            <>
              <div className="chat-head">
                <span className={`avatar ${currentContact.role}`}>
                  {initials(currentContact.name)}
                </span>
                <div>
                  <b style={{ color: 'var(--deep)' }}>{currentContact.name}</b>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {currentContact.role === 'farmer' ? '🧑‍🌾 Farmer' : '🛒 Buyer'} · 🔒 Secure direct message
                  </div>
                </div>
              </div>

              <div className="chat-body">
                {loadingChat ? (
                  <div style={{ margin: 'auto', color: 'var(--muted)' }}>
                    Loading conversation...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((m) => {
                    const isMe = String(m.from?._id || m.from) === String(user._id);

                    return (
                      <div
                        key={m._id}
                        className={`bubble ${isMe ? 'me' : 'them'}`}
                      >
                        {m.text}
                        <span className="bt">{timeAgo(m.createdAt)}</span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ margin: 'auto', color: 'var(--muted)', fontSize: '13.5px' }}>
                    Say hello to {currentContact.name.split(' ')[0]}! 👋
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-form" onSubmit={handleSendMessage}>
                <input
                  placeholder="Type a message..."
                  autoComplete="off"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button className="btn" type="submit" disabled={!inputText.trim()}>
                  Send ➤
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>
              <div style={{ fontSize: '44px' }}>💬</div>
              <p style={{ marginTop: '8px' }}>Select a conversation from the left to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
