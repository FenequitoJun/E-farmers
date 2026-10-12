import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { initials, timeAgo } from '../utils/constants';

export const Navbar = ({
  page,
  setPage,
  unreadMessagesCount = 0,
  setSelectedProductId,
  setActiveChatUser,
}) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigate = (targetPage) => {
    setPage(targetPage);
    setMobileMenuOpen(false);
    setNotifOpen(false);
    window.scrollTo(0, 0);
  };

  const handleNotifClick = (n) => {
    markRead(n._id);
    setNotifOpen(false);
    if ((n.link === 'messages' || n.type === 'message') && n.linkId && setActiveChatUser) {
      setActiveChatUser(n.linkId);
      navigate('messages');
    } else if ((n.link === 'market' || n.link === 'product' || n.type === 'product') && n.linkId && setSelectedProductId) {
      setSelectedProductId(n.linkId);
      navigate('product-detail');
    } else if (n.link) {
      navigate(n.link);
    }
  };


  const notifIcon = (t) => {
    switch (t) {
      case 'order':
        return '📦';
      case 'message':
        return '💬';
      case 'product':
        return '🌱';
      case 'review':
        return '⭐';
      case 'request':
        return '📢';
      default:
        return '🔔';
    }
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="logo" onClick={() => navigate('home')}>
          🌿 E-<b>FARMERS</b>
        </a>

        <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <a
            className={`nav-link ${page === 'home' ? 'active' : ''}`}
            onClick={() => navigate('home')}
          >
            Home
          </a>
          <a
            className={`nav-link ${page === 'market' ? 'active' : ''}`}
            onClick={() => navigate('market')}
          >
            Marketplace
          </a>
          <a
            className={`nav-link ${page === 'requests' ? 'active' : ''}`}
            onClick={() => navigate('requests')}
          >
            Requests
          </a>

          {user && (
            <>
              <a
                className={`nav-link ${page === 'dashboard' ? 'active' : ''}`}
                onClick={() => navigate('dashboard')}
              >
                Dashboard
              </a>
              <a
                className={`nav-link ${page === 'orders' ? 'active' : ''}`}
                onClick={() => navigate('orders')}
              >
                Orders
              </a>
              <a
                className={`nav-link ${page === 'messages' ? 'active' : ''}`}
                onClick={() => navigate('messages')}
              >
                Messages
                {unreadMessagesCount > 0 && (
                  <span className="mini-badge">{unreadMessagesCount}</span>
                )}
              </a>
            </>
          )}
        </nav>

        <div className="nav-right">
          {user ? (
            <>
              <div className="bell-wrap" ref={notifRef}>
                <button
                  className="bell"
                  aria-label="Notifications"
                  onClick={() => setNotifOpen(!notifOpen)}
                >
                  🔔
                  {unreadCount > 0 && <span className="dot">{unreadCount}</span>}
                </button>

                {notifOpen && (
                  <div className="notif-panel">
                    <div className="notif-head">
                      <span>🔔 Notifications</span>
                      <button onClick={markAllRead}>Mark all read</button>
                    </div>
                    {notifications.length > 0 ? (
                      notifications.slice(0, 15).map((n) => (
                        <div
                          key={n._id}
                          className={`notif-item ${n.read ? '' : 'unread'}`}
                          onClick={() => handleNotifClick(n)}
                        >
                          <div className="n-ico">{notifIcon(n.type)}</div>
                          <div>
                            <div className="nt">{n.text}</div>
                            <div className="ntime">{timeAgo(n.createdAt)}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: '24px',
                          textAlign: 'center',
                          color: 'var(--muted)',
                          fontSize: '13.5px',
                        }}
                      >
                        No notifications yet.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="user-chip" onClick={() => navigate('dashboard')}>
                <span className={`avatar ${user.role}`}>{initials(user.name)}</span>
                <span className="uname">{user.name.split(' ')[0]}</span>
              </div>

              <button className="btn ghost sm" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="btn outline sm"
                onClick={() => navigate('auth-login')}
              >
                Log in
              </button>
              <button
                className="btn sm"
                onClick={() => navigate('auth-register')}
              >
                Join now
              </button>
            </>
          )}

          <button
            className="burger"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
