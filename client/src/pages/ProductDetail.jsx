import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CAT_EMOJI, money, fmtDate, timeAgo, isPreorder, initials } from '../utils/constants';
import StarRating from '../components/StarRating';

export const ProductDetail = ({
  productId,
  setPage,
  setCheckoutItem,
  setActiveChatUser,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setQty(1);
      })
      .catch((err) => {
        console.error('Error loading product:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
        Loading product details...
      </div>
    );
  }

  if (!product || product.message) {
    return (
      <div className="container">
        <button className="btn ghost sm" onClick={() => setPage('market')}>
          ← Back to marketplace
        </button>
        <div className="empty" style={{ marginTop: '20px' }}>
          Product not found.
        </div>
      </div>
    );
  }

  const isOwn = user && product.farmer && user._id === product.farmer._id;
  const pre = isPreorder(product.harvestDate);
  const soldOut = product.qty <= 0;

  const handleQtyChange = (delta) => {
    setQty((prev) => {
      const next = prev + delta;
      return Math.min(Math.max(1, next), product.qty);
    });
  };

  const handleCheckout = () => {
    if (!user) {
      toast('Please log in as a buyer to place pre-orders.', 'warn');
      setPage('auth-login');
      return;
    }

    if (user.role !== 'buyer') {
      toast('Switch to a buyer account to place pre-orders.', 'warn');
      return;
    }

    if (soldOut) {
      toast('This harvest is sold out.', 'warn');
      return;
    }

    setCheckoutItem({
      product,
      qty,
    });
    setPage('checkout');
    window.scrollTo(0, 0);
  };

  const handleMessageFarmer = () => {
    if (!user) {
      toast('Please log in to message farmers.', 'warn');
      setPage('auth-login');
      return;
    }

    if (product.farmer) {
      setActiveChatUser(product.farmer._id);
      setPage('messages');
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="container">
      <button className="btn ghost sm" onClick={() => setPage('market')}>
        ← Back to marketplace
      </button>

      <div className="pd-grid" style={{ marginTop: '16px' }}>
        {/* Left Column: Product visual, description, reviews */}
        <div>
          <div className="pd-img">{CAT_EMOJI[product.category] || '🌱'}</div>

          <div className="card" style={{ marginTop: '16px' }}>
            <h3 style={{ color: 'var(--deep)' }}>About this product</h3>
            <p style={{ color: 'var(--muted)', marginTop: '6px' }}>
              {product.desc || 'No description provided by the farmer.'}
            </p>
          </div>

          <div className="card" style={{ marginTop: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <h3 style={{ color: 'var(--deep)' }}>
                Reviews ({product.reviews?.length || 0})
              </h3>
              {product.avgRating ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <StarRating rating={Math.round(product.avgRating)} />
                  <b style={{ color: 'var(--deep)' }}>
                    {Number(product.avgRating).toFixed(1)}
                  </b>
                </div>
              ) : null}
            </div>

            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rv) => (
                <div key={rv._id} className="review">
                  <div className="review-head">
                    <b style={{ color: 'var(--deep)' }}>
                      {rv.buyer?.name || 'Verified Buyer'}
                    </b>
                    <span>{timeAgo(rv.createdAt)}</span>
                  </div>
                  <div style={{ margin: '3px 0' }}>
                    <StarRating rating={rv.stars} />
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    {rv.text}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '8px' }}>
                No reviews yet — customer reviews appear here after pre-orders are delivered.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Pre-order Box & Farmer Info */}
        <div>
          <div className="card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <h2 style={{ color: 'var(--deep)' }}>{product.name}</h2>
                <span
                  className={`badge ${soldOut ? 'b-gray' : pre ? 'b-amber' : 'b-green'}`}
                  style={{ marginTop: '4px' }}
                >
                  {soldOut
                    ? 'Sold out'
                    : pre
                    ? `🗓 Pre-order — harvest ${fmtDate(product.harvestDate)}`
                    : '✅ Available now'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="price" style={{ fontSize: '24px' }}>
                  {money(product.price)}
                </div>
                <small style={{ color: 'var(--muted)' }}>per {product.unit}</small>
              </div>
            </div>

            <div className="order-meta" style={{ marginTop: '14px' }}>
              <div>
                📦 <b>{product.qty}</b> {product.unit} available
              </div>
              <div>
                🗓 Harvest: <b>{fmtDate(product.harvestDate)}</b>
              </div>
              <div>
                🏷 <b>{product.category}</b>
              </div>
              <div>
                📍 <b>{product.location}</b>
              </div>
            </div>

            {!isOwn && !soldOut ? (
              <div style={{ marginTop: '14px' }}>
                <div className="field">
                  <label>Quantity to pre-order ({product.unit})</label>
                  <div className="qty-row">
                    <button
                      className="qty-btn"
                      type="button"
                      onClick={() => handleQtyChange(-1)}
                    >
                      −
                    </button>
                    <input
                      className="qty-input"
                      type="number"
                      min="1"
                      max={product.qty}
                      value={qty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQty(Math.min(Math.max(1, val), product.qty));
                      }}
                    />
                    <button
                      className="qty-btn"
                      type="button"
                      onClick={() => handleQtyChange(1)}
                    >
                      +
                    </button>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontWeight: 700,
                        color: 'var(--deep)',
                      }}
                    >
                      Total: {money(qty * product.price)}
                    </span>
                  </div>
                </div>

                <button
                  className="btn amber block"
                  onClick={handleCheckout}
                >
                  🛒 Place pre-order
                </button>
              </div>
            ) : isOwn ? (
              <div className="demo-note" style={{ marginTop: '14px' }}>
                This is your listing. Manage or edit it anytime from your{' '}
                <a
                  onClick={() => setPage('dashboard')}
                  style={{ textDecoration: 'underline', fontWeight: 600 }}
                >
                  Farmer Dashboard
                </a>
                .
              </div>
            ) : (
              <button className="btn block" disabled style={{ marginTop: '14px' }}>
                Sold out
              </button>
            )}

            {!user && (
              <p
                style={{
                  fontSize: '12.5px',
                  color: 'var(--muted)',
                  marginTop: '10px',
                  textAlign: 'center',
                }}
              >
                You will be prompted to log in as a buyer to complete pre-orders.
              </p>
            )}
          </div>

          {/* Farmer Card */}
          <div className="farmer-box" style={{ marginTop: '16px' }}>
            <span className="avatar farmer" style={{ width: '44px', height: '44px', fontSize: '16px' }}>
              {initials(product.farmer?.name)}
            </span>
            <div style={{ flex: 1 }}>
              <b style={{ color: 'var(--deep)' }}>
                {product.farmer?.name || 'Local Farmer'}
              </b>
              <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                📍 {product.location} · ⭐{' '}
                {product.farmerAvgRating
                  ? `${Number(product.farmerAvgRating).toFixed(1)} farmer rating`
                  : 'New farmer'}
              </div>
            </div>

            {!isOwn && (
              <button className="btn sm outline" onClick={handleMessageFarmer}>
                💬 Message
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
