import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import ListingForm from './pages/ListingForm';
import Orders from './pages/Orders';
import BuyerRequests from './pages/BuyerRequests';
import Messages from './pages/Messages';
import Auth from './pages/Auth';

function MainApp() {
  const { user, authFetch } = useAuth();

  const [page, setPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [chatDraft, setChatDraft] = useState('');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Poll for total unread messages
  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0);
      return;
    }

    const checkUnread = async () => {
      try {
        const contacts = await authFetch('/api/messages/contacts');
        if (Array.isArray(contacts)) {
          const total = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setUnreadMessagesCount(total);
        }
      } catch (err) {
        // silent polling catch
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 8000);
    return () => clearInterval(interval);
  }, [user, authFetch]);

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home setPage={setPage} />;
      case 'market':
        return (
          <Marketplace
            setPage={setPage}
            setSelectedProductId={setSelectedProductId}
          />
        );
      case 'product-detail':
        return (
          <ProductDetail
            productId={selectedProductId}
            setPage={setPage}
            setCheckoutItem={setCheckoutItem}
            setActiveChatUser={setActiveChatUser}
          />
        );
      case 'checkout':
        return <Checkout checkoutItem={checkoutItem} setPage={setPage} />;
      case 'dashboard':
        return (
          <Dashboard
            setPage={setPage}
            setEditingProduct={setEditingProduct}
            setSelectedProductId={setSelectedProductId}
            setActiveChatUser={setActiveChatUser}
          />
        );
      case 'listing-form':
        return (
          <ListingForm
            editingProduct={editingProduct}
            setPage={setPage}
          />
        );
      case 'orders':
        return (
          <Orders
            setPage={setPage}
            setActiveChatUser={setActiveChatUser}
          />
        );
      case 'requests':
        return (
          <BuyerRequests
            setPage={setPage}
            setActiveChatUser={setActiveChatUser}
            setChatDraft={setChatDraft}
          />
        );
      case 'messages':
        return (
          <Messages
            activeChatUser={activeChatUser}
            setActiveChatUser={setActiveChatUser}
            chatDraft={chatDraft}
            setChatDraft={setChatDraft}
          />
        );
      case 'auth-login':
        return <Auth initialTab="login" setPage={setPage} />;
      case 'auth-register':
        return <Auth initialTab="register" setPage={setPage} />;
      default:
        return <Home setPage={setPage} />;
    }
  };

  return (
    <div>
      <Navbar
        page={page}
        setPage={setPage}
        unreadMessagesCount={unreadMessagesCount}
        setSelectedProductId={setSelectedProductId}
        setActiveChatUser={setActiveChatUser}
      />
      <main>{renderPage()}</main>
      <Footer setPage={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <MainApp />
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
