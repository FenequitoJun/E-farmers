import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CAT_EMOJI, money } from '../utils/constants';

export const Checkout = ({ checkoutItem, setPage }) => {
  const { user, authFetch } = useAuth();
  const { toast } = useToast();

  const product = checkoutItem?.product;
  const qty = checkoutItem?.qty || 1;

  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.contact || '');
  const [address, setAddress] = useState(user?.location || '');
  const [preferredDate, setPreferredDate] = useState(
    product?.harvestDate ? new Date(product.harvestDate).toISOString().slice(0, 10) : ''
  );
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!product) {
    return (
      <div className="container">
        <div className="empty">
          <h3>Nothing to checkout</h3>
          <p>Please select a product from the marketplace first.</p>
          <button
            className="btn"
            style={{ marginTop: '14px' }}
            onClick={() => setPage('market')}
          >
            Go to marketplace
          </button>
        </div>
      </div>
    );
  }

  const subtotal = product.price * qty;
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientName || !phone || !address) {
      toast('Please fill in all delivery details.', 'warn');
      return;
    }

    setSubmitting(true);
    try {
      const order = await authFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          productId: product._id,
          qty,
          recipientName,
          phone,
          deliveryAddress: address,
          preferredDate,
          notes,
          paymentMethod,
        }),
      });

      setPlacedOrder(order);
      toast(`🎉 Pre-order #${order.orderNumber} successfully placed!`);
    } catch (err) {
      toast(err.message || 'Failed to place order', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="container">
        <div className="card form-card" style={{ textAlign: 'center', padding: '44px 28px' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'var(--green)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: '44px',
              margin: '0 auto 18px',
            }}
          >
            ✓
          </div>
          <h2 style={{ color: 'var(--deep)' }}>Order Placed!</h2>
          <p style={{ color: 'var(--muted)', margin: '8px 0 4px' }}>
            Order <b style={{ color: 'var(--deep)' }}>#{placedOrder.orderNumber}</b> —{' '}
            {placedOrder.qty} {placedOrder.unit} of {placedOrder.productName}.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginBottom: '22px' }}>
            The farmer has been notified and will prepare your harvest. You can monitor the progress anytime from your Orders page.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => setPage('orders')}>
              📦 Track my order
            </button>
            <button className="btn outline" onClick={() => setPage('market')}>
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <button className="btn ghost sm" onClick={() => setPage('product-detail')}>
        ← Back to product
      </button>

      <h2 style={{ color: 'var(--deep)', margin: '14px 0 4px' }}>
        Checkout — create pre-order
      </h2>
      <p style={{ color: 'var(--muted)', marginBottom: '18px' }}>
        Enter delivery and payment details to reserve this harvest directly with the farmer.
      </p>

      <div className="dash-cols">
        {/* Delivery Form */}
        <form className="card" onSubmit={handleSubmit}>
          <div className="panel-title">🚚 Delivery details</div>

          <div className="field">
            <label>Recipient name *</label>
            <input
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Contact number *</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Complete delivery address *</label>
            <textarea
              required
              placeholder="Street, barangay, city, province"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Preferred delivery date</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Notes (optional)</label>
              <input
                placeholder="e.g. deliver in the morning"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="panel-title" style={{ marginTop: '12px' }}>
            💳 Payment method
          </div>
          <div className="role-cards cols3">
            {[
              { val: 'Cash on Delivery', icon: '💵', label: 'Cash on Delivery', sub: 'Pay upon delivery' },
              { val: 'Bank Transfer', icon: '🏦', label: 'Bank Transfer', sub: 'Direct bank payment' },
              { val: 'E-Wallet', icon: '📱', label: 'E-Wallet', sub: 'GCash / Maya' },
            ].map((p) => (
              <label
                key={p.val}
                className={`role-card ${paymentMethod === p.val ? 'sel' : ''}`}
              >
                <input
                  type="radio"
                  name="pay"
                  value={p.val}
                  checked={paymentMethod === p.val}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="rc-txt">
                  <b>{p.icon} {p.label}</b>
                  <small>{p.sub}</small>
                </span>
              </label>
            ))}
          </div>

          <button
            className="btn amber block"
            style={{ marginTop: '20px' }}
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Placing order...' : `✅ Place pre-order — ${money(total)}`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="panel-title">🧾 Order summary</div>
          <div className="row-item" style={{ marginBottom: '14px' }}>
            <div className="order-emoji">{CAT_EMOJI[product.category] || '🌱'}</div>
            <div className="grow">
              <h4>{product.name}</h4>
              <small>
                Farmer: {product.farmer?.name || 'Farmer'} · 📍 {product.location}
              </small>
            </div>
          </div>

          <div style={{ fontSize: '14px', color: 'var(--muted)', display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {money(product.price)} × {qty} {product.unit}
              </span>
              <b style={{ color: 'var(--ink)' }}>{money(subtotal)}</b>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery fee</span>
              <b style={{ color: 'var(--ink)' }}>{money(deliveryFee)}</b>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '2px solid var(--light)',
                paddingTop: '10px',
                fontSize: '16px',
              }}
            >
              <span style={{ color: 'var(--deep)', fontWeight: 700 }}>Total</span>
              <b style={{ color: 'var(--deep)' }}>{money(total)}</b>
            </div>
          </div>

          <div className="demo-note" style={{ marginTop: '16px' }}>
            🔒 <b>Direct &amp; Protected</b>: Your pre-order is guaranteed. Funds are only confirmed upon delivery.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
