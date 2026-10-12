import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';
import { CAT_EMOJI, money, fmtDate, timeAgo, initials, isPreorder } from '../utils/constants';

export const Dashboard = ({
  setPage,
  setEditingProduct,
  setSelectedProductId,
  setActiveChatUser,
}) => {
  const { user, authFetch } = useAuth();
  const { notifications, markRead } = useNotifications();
  const { toast } = useToast();

  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    Promise.all([
      authFetch('/api/stats/dashboard'),
      user.role === 'farmer' ? authFetch(`/api/products?farmerId=${user._id}`) : Promise.resolve([]),
      authFetch('/api/orders'),
      authFetch('/api/requests'),
    ])
      .then(([statsData, listingsData, ordersData, requestsData]) => {
        setStats(statsData);
        setListings(Array.isArray(listingsData) ? listingsData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setRequests(Array.isArray(requestsData) ? requestsData : []);
      })
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    try {
      await authFetch(`/api/products/${id}`, { method: 'DELETE' });
      setListings((prev) => prev.filter((p) => p._id !== id));
      toast('Listing removed successfully.');
    } catch (err) {
      toast(err.message || 'Failed to remove listing', 'err');
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="empty">
          <h3>Please log in</h3>
          <p>You must be signed in to view your dashboard.</p>
          <button className="btn" onClick={() => setPage('auth-login')} style={{ marginTop: '14px' }}>
            Log in
          </button>
        </div>
      </div>
    );
  }

  const isFarmer = user.role === 'farmer';

  return (
    <div className="container">
      {/* Top Profile Header */}
      <div className="dash-head">
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span
            className={`avatar ${user.role}`}
            style={{ width: '52px', height: '52px', fontSize: '20px' }}
          >
            {initials(user.name)}
          </span>
          <div>
            <h2>Hello, {user.name.split(' ')[0]}! 🌱</h2>
            <span className={`badge ${isFarmer ? 'b-green' : 'b-amber'}`}>
              {isFarmer ? '🧑‍🌾 Farmer Account' : '🛒 Buyer Account'}
            </span>
            <small style={{ color: 'var(--muted)', marginLeft: '8px' }}>
              📍 {user.location}
            </small>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {isFarmer ? (
            <>
              <button
                className="btn"
                onClick={() => {
                  setEditingProduct(null);
                  setPage('listing-form');
                }}
              >
                ➕ Add product listing
              </button>
              <button className="btn outline" onClick={() => setPage('requests')}>
                Buyer requests
              </button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setPage('market')}>
                🛒 Browse marketplace
              </button>
              <button className="btn amber" onClick={() => setPage('requests')}>
                📢 Post a request
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {isFarmer ? (
          <>
            <div className="stat">
              <div className="si">🌾</div>
              <div>
                <b>{stats?.listings || 0}</b>
                <span>Active listings</span>
              </div>
            </div>
            <div className="stat">
              <div className="si">📦</div>
              <div>
                <b>{stats?.openOrders || 0}</b>
                <span>Open pre-orders</span>
              </div>
            </div>
            <div className="stat">
              <div className="si">🚚</div>
              <div>
                <b>{stats?.totalOrders || 0}</b>
                <span>Total orders</span>
              </div>
            </div>
            <div className="stat">
              <div className="si">⭐</div>
              <div>
                <b>{stats?.avgRating ? stats.avgRating : '—'}</b>
                <span>Avg rating</span>
              </div>
            </div>
            <div className="stat">
              <div className="si">💬</div>
              <div>
                <b>{stats?.unreadMessages || 0}</b>
                <span>Unread msgs</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat">
              <div className="si">📦</div>
              <div>
                <b>{stats?.activeOrders || 0}</b>
                <span>Active pre-orders</span>
              </div>
            </div>
            <div className="stat">
              <div className="si">🧾</div>
              <div>
                <b>{stats?.totalOrders || 0}</b>
                <span>Total orders</span>
              </div>
            </div>
            <div className="stat">
              <div className="si">📢</div>
              <div>
                <b>{stats?.requests || 0}</b>
                <span>Requests posted</span>
              </div>
            </div>
            <div className="stat">
              <div className="si">💬</div>
              <div>
                <b>{stats?.unreadMessages || 0}</b>
                <span>Unread msgs</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Dashboard Columns */}
      <div className="dash-cols">
        {isFarmer ? (
          <div>
            {/* Farmer's Listings */}
            <div className="panel-title">
              🌾 My product listings
              <button
                className="btn sm outline"
                style={{ marginLeft: 'auto' }}
                onClick={() => {
                  setEditingProduct(null);
                  setPage('listing-form');
                }}
              >
                ➕ Add
              </button>
            </div>

            {listings.length > 0 ? (
              listings.slice(0, 5).map((p) => {
                const pre = isPreorder(p.harvestDate);
                const soldOut = p.qty <= 0;
                return (
                  <div key={p._id} className="row-item">
                    <div className="order-emoji">{CAT_EMOJI[p.category] || '🌱'}</div>
                    <div className="grow">
                      <h4>{p.name}</h4>
                      <small>
                        {money(p.price)} / {p.unit} · {p.qty} {p.unit} left · Harvest{' '}
                        {fmtDate(p.harvestDate)}
                      </small>
                    </div>
                    <span
                      className={`badge ${soldOut ? 'b-gray' : pre ? 'b-amber' : 'b-green'}`}
                    >
                      {soldOut ? 'Sold out' : pre ? 'Pre-order' : 'Available'}
                    </span>
                    <button
                      className="btn sm outline"
                      onClick={() => {
                        setEditingProduct(p);
                        setPage('listing-form');
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn sm danger"
                      onClick={() => handleDeleteListing(p._id)}
                    >
                      🗑
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
                No listings yet. Click <b>Add</b> to publish your first produce! 🌱
              </div>
            )}

            {/* Recent Orders Received */}
            <div className="panel-title" style={{ marginTop: '24px' }}>
              📦 Recent pre-orders received
              <button
                className="btn sm ghost"
                style={{ marginLeft: 'auto' }}
                onClick={() => setPage('orders')}
              >
                View all
              </button>
            </div>

            {orders.length > 0 ? (
              orders.slice(0, 4).map((o) => (
                <div key={o._id} className="row-item">
                  <div className="order-emoji">{CAT_EMOJI[o.category] || '📦'}</div>
                  <div className="grow">
                    <h4>
                      {o.productName}{' '}
                      <small style={{ color: 'var(--muted)' }}>#{o.orderNumber}</small>
                    </h4>
                    <small>
                      {o.qty} {o.unit} · {money(o.total)} · Buyer: {o.buyer?.name || '—'}
                    </small>
                  </div>
                  <span
                    className={`badge ${
                      o.status === 'processing'
                        ? 'b-amber'
                        : o.status === 'shipped'
                        ? 'b-green'
                        : 'b-deep'
                    }`}
                  >
                    {o.status.toUpperCase()}
                  </span>
                  <button className="btn sm ghost" onClick={() => setPage('orders')}>
                    View
                  </button>
                </div>
              ))
            ) : (
              <div className="card" style={{ color: 'var(--muted)' }}>
                No pre-orders received yet.
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Buyer's Orders */}
            <div className="panel-title">
              📦 My pre-orders
              <button
                className="btn sm ghost"
                style={{ marginLeft: 'auto' }}
                onClick={() => setPage('orders')}
              >
                Track orders
              </button>
            </div>

            {orders.length > 0 ? (
              orders.slice(0, 4).map((o) => (
                <div key={o._id} className="row-item">
                  <div className="order-emoji">{CAT_EMOJI[o.category] || '📦'}</div>
                  <div className="grow">
                    <h4>
                      {o.productName}{' '}
                      <small style={{ color: 'var(--muted)' }}>#{o.orderNumber}</small>
                    </h4>
                    <small>
                      {o.qty} {o.unit} · {money(o.total)} · Farmer: {o.farmer?.name || '—'}
                    </small>
                  </div>
                  <span
                    className={`badge ${
                      o.status === 'processing'
                        ? 'b-amber'
                        : o.status === 'shipped'
                        ? 'b-green'
                        : 'b-deep'
                    }`}
                  >
                    {o.status.toUpperCase()}
                  </span>
                  <button className="btn sm ghost" onClick={() => setPage('orders')}>
                    Track
                  </button>
                </div>
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
                No orders placed yet.{' '}
                <a
                  style={{ color: 'var(--green)', fontWeight: 600 }}
                  onClick={() => setPage('market')}
                >
                  Browse the marketplace →
                </a>
              </div>
            )}

            {/* Buyer's Requests */}
            <div className="panel-title" style={{ marginTop: '24px' }}>
              📢 My requests
              <button
                className="btn sm ghost"
                style={{ marginLeft: 'auto' }}
                onClick={() => setPage('requests')}
              >
                Manage
              </button>
            </div>

            {requests.filter((r) => r.buyer?._id === user._id).length > 0 ? (
              requests
                .filter((r) => r.buyer?._id === user._id)
                .slice(0, 4)
                .map((r) => (
                  <div key={r._id} className="row-item">
                    <div className="order-emoji">📢</div>
                    <div className="grow">
                      <h4>
                        {r.product} — {r.qty} {r.unit}
                      </h4>
                      <small>
                        {r.byDate ? `Needed by ${fmtDate(r.byDate)} · ` : ''}
                        Posted {timeAgo(r.createdAt)}
                      </small>
                    </div>
                    <button className="btn sm outline" onClick={() => setPage('requests')}>
                      Open
                    </button>
                  </div>
                ))
            ) : (
              <div className="card" style={{ color: 'var(--muted)' }}>
                No requests posted yet.
              </div>
            )}
          </div>
        )}

        {/* Right column: Notifications / Activity */}
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="notif-head" style={{ padding: '14px' }}>
              <span>🔔 Recent Notifications</span>
            </div>
            {notifications.length > 0 ? (
              notifications.slice(0, 6).map((n) => (
                <div
                  key={n._id}
                  className={`notif-item ${n.read ? '' : 'unread'}`}
                  onClick={() => {
                    markRead(n._id);
                    if ((n.link === 'messages' || n.type === 'message') && n.linkId && setActiveChatUser) {
                      setActiveChatUser(n.linkId);
                      setPage('messages');
                    } else if ((n.link === 'market' || n.link === 'product' || n.type === 'product') && n.linkId && setSelectedProductId) {
                      setSelectedProductId(n.linkId);
                      setPage('product-detail');
                    } else if (n.link) {
                      setPage(n.link);
                    }
                  }}
                >
                  <div className="n-ico">{n.type === 'order' ? '📦' : n.type === 'message' ? '💬' : '🔔'}</div>
                  <div>
                    <div className="nt">{n.text}</div>
                    <div className="ntime">{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
