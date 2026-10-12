import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, UNITS, fmtDate, timeAgo } from '../utils/constants';

export const BuyerRequests = ({ setPage, setActiveChatUser, setChatDraft }) => {
  const { user, authFetch } = useAuth();
  const { toast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [product, setProduct] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('kg');
  const [byDate, setByDate] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handlePostRequest = async (e) => {
    e.preventDefault();
    if (!product || !qty || Number(qty) < 1) {
      toast('Please enter the produce name and quantity needed.', 'warn');
      return;
    }

    setSubmitting(true);
    try {
      await authFetch('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          product,
          category,
          qty: Number(qty),
          unit,
          byDate,
          details,
        }),
      });

      toast('📢 Request published! Farmers have been notified.');
      setProduct('');
      setQty('');
      setDetails('');
      setByDate('');
      fetchRequests();
    } catch (err) {
      toast(err.message || 'Failed to post request', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Remove this request?')) return;
    try {
      await authFetch(`/api/requests/${id}`, { method: 'DELETE' });
      toast('Request removed.');
      fetchRequests();
    } catch (err) {
      toast(err.message || 'Failed to remove request', 'err');
    }
  };

  const handleOfferToSupply = (r) => {
    if (!user) {
      toast('Please log in as a farmer to supply produce.', 'warn');
      setPage('auth-login');
      return;
    }

    setActiveChatUser(r.buyer?._id);
    setChatDraft(
      `Hi! About your request for ${r.qty} ${r.unit} of ${r.product} — I can supply that. Shall we discuss the details?`
    );
    setPage('messages');
  };

  return (
    <div className="container">
      <div className="dash-head">
        <div>
          <h2>📢 Buyer requests</h2>
          <small style={{ color: 'var(--muted)' }}>
            Buyers post exactly what produce they need — farmers can respond directly with supply offers.
          </small>
        </div>
      </div>

      {/* Post a request (for Buyer) */}
      {user && user.role === 'buyer' ? (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="panel-title">✍️ Post a new produce request</div>
          <form onSubmit={handlePostRequest}>
            <div className="grid-2">
              <div className="field">
                <label>Produce needed *</label>
                <input
                  required
                  placeholder="e.g. Tomatoes, Yellow Corn, Watermelon"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="field">
                <label>Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="50"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Unit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Needed by date</label>
                <input
                  type="date"
                  value={byDate}
                  onChange={(e) => setByDate(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Details (quality specs, delivery preferences, regularity)</label>
              <textarea
                placeholder="Describe your quality standards, restaurant delivery schedule, or packaging preferences..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            <button className="btn amber" type="submit" disabled={submitting}>
              {submitting ? 'Publishing...' : '📢 Publish request'}
            </button>
          </form>
        </div>
      ) : !user ? (
        <div className="card" style={{ marginBottom: '24px', background: 'var(--light)' }}>
          <b style={{ color: 'var(--deep)' }}>Want to post your own produce request?</b>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            Create a buyer account to post produce requirements — verified farmers will be alerted instantly.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button className="btn sm" onClick={() => setPage('auth-register')}>
              Create account
            </button>
            <button className="btn sm outline" onClick={() => setPage('auth-login')}>
              Log in
            </button>
          </div>
        </div>
      ) : null}

      {/* Requests Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
          Loading requests...
        </div>
      ) : requests.length > 0 ? (
        <div className="mgrid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {requests.map((r) => {
            const isOwn = user && r.buyer?._id === user._id;

            return (
              <div key={r._id} className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <h3 style={{ color: 'var(--deep)' }}>{r.product}</h3>
                  <span className={`badge ${isOwn ? 'b-amber' : 'b-green'}`}>
                    {isOwn ? 'My request' : 'Open'}
                  </span>
                </div>

                <div style={{ fontSize: '13.5px', color: 'var(--muted)', margin: '6px 0 10px' }}>
                  <b style={{ color: 'var(--ink)' }}>
                    {r.qty} {r.unit}
                  </b>{' '}
                  · {r.category}
                  <br />
                  🛒 {r.buyer?.name || 'Verified Buyer'} · 📍 {r.buyer?.location || '—'}
                  <br />
                  {r.byDate ? `🗓 Needed by ${fmtDate(r.byDate)} · ` : ''}
                  Posted {timeAgo(r.createdAt)}
                </div>

                {r.details && (
                  <p
                    style={{
                      fontSize: '13.5px',
                      background: 'var(--light)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      color: 'var(--muted)',
                    }}
                  >
                    {r.details}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  {user && user.role === 'farmer' && (
                    <button className="btn sm" onClick={() => handleOfferToSupply(r)}>
                      🤝 I can supply
                    </button>
                  )}

                  {isOwn && (
                    <button
                      className="btn sm danger"
                      onClick={() => handleDeleteRequest(r._id)}
                    >
                      🗑 Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <div className="big">📭</div>
          <h3>No requests yet</h3>
          <p>Buyer requests for harvests will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default BuyerRequests;
