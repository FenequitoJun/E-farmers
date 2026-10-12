import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CAT_EMOJI, money, fmtDate, timeAgo } from '../utils/constants';
import Timeline from '../components/Timeline';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';

export const Orders = ({ setPage, setActiveChatUser }) => {
  const { user, authFetch } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await authFetch('/api/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const handleAdvanceStatus = async (orderId, newStatus) => {
    try {
      await authFetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      toast(`Order marked as ${newStatus}!`);
      fetchOrders();
    } catch (err) {
      toast(err.message || 'Failed to update order status', 'err');
    }
  };

  const handleOpenReview = (order) => {
    setReviewOrder(order);
    setReviewStars(5);
    setReviewText('');
  };

  const handleSubmitReview = async () => {
    if (!reviewOrder) return;
    setSubmittingReview(true);
    try {
      await authFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          orderId: reviewOrder._id,
          stars: reviewStars,
          text: reviewText,
        }),
      });
      toast('🎉 Review posted — thank you for supporting our farmers!');
      setReviewOrder(null);
      fetchOrders();
    } catch (err) {
      toast(err.message || 'Failed to submit review', 'err');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleChat = (counterpartId) => {
    setActiveChatUser(counterpartId);
    setPage('messages');
  };

  if (!user) {
    return (
      <div className="container">
        <div className="empty">
          <h3>Please sign in</h3>
          <p>Log in to view and track your orders.</p>
          <button className="btn" style={{ marginTop: '14px' }} onClick={() => setPage('auth-login')}>
            Log in
          </button>
        </div>
      </div>
    );
  }

  const isFarmer = user.role === 'farmer';

  return (
    <div className="container">
      <div className="dash-head">
        <div>
          <h2>📦 {isFarmer ? 'Orders received' : 'My pre-orders'}</h2>
          <small style={{ color: 'var(--muted)' }}>
            {isFarmer
              ? 'Advance each order from processing → shipped → delivered as harvests are fulfilled.'
              : 'Track your pre-orders in real-time from placement to delivery.'}
          </small>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--muted)' }}>
          Loading orders...
        </div>
      ) : orders.length > 0 ? (
        orders.map((o) => {
          const counterpart = isFarmer ? o.buyer : o.farmer;

          return (
            <div key={o._id} className="order-card">
              <div className="order-top">
                <div className="order-title">
                  <div className="order-emoji">{CAT_EMOJI[o.category] || '📦'}</div>
                  <div>
                    <div>
                      {o.productName}{' '}
                      <small style={{ color: 'var(--muted)' }}>#{o.orderNumber}</small>
                    </div>
                    <small style={{ color: 'var(--muted)', fontWeight: 500 }}>
                      {isFarmer ? 'Buyer' : 'Farmer'}: {counterpart?.name || '—'} ·{' '}
                      {timeAgo(o.createdAt)}
                    </small>
                  </div>
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
              </div>

              {/* 4-Step Progress Stepper */}
              <Timeline status={o.status} />

              {/* Order Metadata */}
              <div className="order-meta">
                <div>
                  Quantity: <b>{o.qty} {o.unit}</b>
                </div>
                <div>
                  Unit price: <b>{money(o.price)}</b>
                </div>
                <div>
                  Delivery fee: <b>{money(o.deliveryFee || 50)}</b>
                </div>
                <div>
                  Total: <b>{money(o.total)}</b>
                </div>
                <div>
                  Payment: <b>{o.paymentMethod}</b>
                </div>
                <div>
                  Deliver to: <b>{o.recipientName}</b> ({o.phone})
                </div>
                <div>
                  Address: <b>{o.deliveryAddress}</b>
                </div>
                <div>
                  Preferred date: <b>{fmtDate(o.preferredDate)}</b>
                </div>
                {o.notes && (
                  <div>
                    Notes: <b>{o.notes}</b>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="order-actions">
                {isFarmer && o.status === 'processing' && (
                  <button
                    className="btn sm"
                    onClick={() => handleAdvanceStatus(o._id, 'shipped')}
                  >
                    🚚 Mark as shipped
                  </button>
                )}

                {isFarmer && o.status === 'shipped' && (
                  <button
                    className="btn deep sm"
                    onClick={() => handleAdvanceStatus(o._id, 'delivered')}
                  >
                    ✅ Mark as delivered
                  </button>
                )}

                {!isFarmer && o.status === 'delivered' && !o.reviewed && (
                  <button
                    className="btn amber sm"
                    onClick={() => handleOpenReview(o)}
                  >
                    ⭐ Rate &amp; review harvest
                  </button>
                )}

                {o.reviewed && (
                  <span className="badge b-lime">⭐ Reviewed</span>
                )}

                {counterpart && (
                  <button
                    className="btn sm ghost"
                    onClick={() => handleChat(counterpart._id)}
                  >
                    💬 Message {isFarmer ? 'Buyer' : 'Farmer'}
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="empty">
          <div className="big">🗂</div>
          <h3>No orders yet</h3>
          <p>
            {isFarmer
              ? 'Pre-orders for your harvests will appear here.'
              : 'Browse our marketplace and place a pre-order to connect directly with farmers.'}
          </p>
          <button
            className="btn"
            style={{ marginTop: '14px' }}
            onClick={() => setPage(isFarmer ? 'dashboard' : 'market')}
          >
            {isFarmer ? 'Go to dashboard' : 'Browse marketplace'}
          </button>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={Boolean(reviewOrder)}
        title="Rate your harvest experience"
        onClose={() => setReviewOrder(null)}
      >
        {reviewOrder && (
          <div>
            <p>
              {reviewOrder.productName} · Order #{reviewOrder.orderNumber}
            </p>

            <div style={{ textAlign: 'center', margin: '14px 0' }}>
              <StarRating
                rating={reviewStars}
                interactive={true}
                onSelect={(val) => setReviewStars(val)}
              />
            </div>

            <div className="field">
              <label>Your feedback</label>
              <textarea
                placeholder="How was the freshness, taste, and the farmer's delivery service?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn ghost"
                onClick={() => setReviewOrder(null)}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? 'Posting...' : 'Post review'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
