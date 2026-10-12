import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Home = ({ setPage }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    farmers: 0,
    listings: 0,
    requests: 0,
    orders: 0,
  });

  useEffect(() => {
    fetch('/api/stats/home')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="kicker">Farm → Table, Directly</span>
            <h1>
              Fresh harvests, <mark>pre-ordered</mark> straight from farmers.
            </h1>
            <p className="lead">
              E-Farmers connects farmers directly with buyers. Farmers upload their products with harvest dates and prices — buyers get a secure, early pre-order opportunity and can post exactly what they need.
            </p>
            <div className="hero-cta">
              <button className="btn amber" onClick={() => setPage('market')}>
                🛒 Browse Marketplace
              </button>
              {!user ? (
                <>
                  <button className="btn deep" onClick={() => setPage('auth-register')}>
                    🧑‍🌾 Join as Farmer
                  </button>
                  <button className="btn outline" onClick={() => setPage('auth-login')}>
                    Log in
                  </button>
                </>
              ) : (
                <button className="btn deep" onClick={() => setPage('dashboard')}>
                  🌾 Go to Dashboard
                </button>
              )}
            </div>

            <div className="hero-stats">
              <div className="hstat">
                <b>{stats.farmers}</b>
                <span>Farmers</span>
              </div>
              <div className="hstat">
                <b>{stats.listings}</b>
                <span>Live listings</span>
              </div>
              <div className="hstat">
                <b>{stats.requests}</b>
                <span>Buyer requests</span>
              </div>
              <div className="hstat">
                <b>{stats.orders}</b>
                <span>Pre-orders</span>
              </div>
            </div>
          </div>

          <div className="hero-art">
            <div className="ha-card ha-1">
              <span>🧑‍🌾</span>
              <div>
                <b>Farmers</b>
                <small>list harvests early</small>
              </div>
            </div>
            <div className="ha-arrow">⇄</div>
            <div className="ha-card ha-2">
              <span>🛒</span>
              <div>
                <b>Buyers</b>
                <small>pre-order direct</small>
              </div>
            </div>
            <div className="ha-chip c1">🌽</div>
            <div className="ha-chip c2">🍅</div>
            <div className="ha-chip c3">🥬</div>
            <div className="ha-chip c4">🌾</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <div className="container section">
        <div className="section-head">
          <h2>How E-Farmers works</h2>
          <p>Follow the flow — from creating an account to posting a review.</p>
        </div>
        <div className="grid-3">
          <div className="card">
            <div className="step-num">1</div>
            <h3>Create your account</h3>
            <p>
              Register as a farmer or buyer — name, contact, location and crop preferences are saved securely to MongoDB.
            </p>
          </div>
          <div className="card">
            <div className="step-num" style={{ background: 'var(--green)' }}>
              2
            </div>
            <h3>List &amp; discover</h3>
            <p>
              Farmers publish product listings with harvest date, quantity and price. Buyers search, filter, and post specific supply requests.
            </p>
          </div>
          <div className="card">
            <div className="step-num" style={{ background: 'var(--amber)', color: '#4a3200' }}>
              3
            </div>
            <h3>Pre-order &amp; track</h3>
            <p>
              Place pre-orders with delivery details, chat securely, follow your order from processing to delivery, then rate the harvest.
            </p>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="container section" style={{ paddingTop: 0 }}>
        <div className="grid-3">
          <div className="card">
            <h3>🔔 Notification system</h3>
            <p>
              Instant alerts for order updates, new messages, and product availability matched to buyer requests.
            </p>
          </div>
          <div className="card">
            <h3>💬 Secure messaging</h3>
            <p>
              Farmers and buyers coordinate directly through built-in chat — negotiate quantities, timing, and delivery.
            </p>
          </div>
          <div className="card">
            <h3>📦 Order lifecycle</h3>
            <div className="chips" style={{ marginTop: '8px' }}>
              <span className="chip">Processing</span>
              <span className="arrow">→</span>
              <span className="chip">Shipped</span>
              <span className="arrow">→</span>
              <span className="chip">Delivered</span>
              <span className="arrow">→</span>
              <span className="chip amber">Reviewed</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Band */}
      <div className="container">
        <div className="cta-band">
          <h2>Ready to taste farm-fresh?</h2>
          <p>Join E-Farmers today — whether you grow it or you need it.</p>
          <button
            className="btn amber"
            onClick={() => setPage(user ? 'market' : 'auth-register')}
          >
            {user ? 'Browse Produce' : 'Create your free account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
