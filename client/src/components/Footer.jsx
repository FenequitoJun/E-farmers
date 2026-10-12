import React from 'react';

export const Footer = ({ setPage }) => {
  return (
    <footer>
      <div className="foot-inner">
        <div>
          <div className="logo" style={{ color: '#fff' }}>
            🌿 E-<b style={{ color: 'var(--lime)' }}>FARMERS</b>
          </div>
          <p style={{ opacity: 0.85, fontSize: '14px', marginTop: '10px', lineHeight: 1.6 }}>
            Connecting farmers directly with buyers — transparent pricing, early pre-orders, and fresher food for everyone. Built with the full MERN Stack (MongoDB, Express, React, Node.js).
          </p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <a onClick={() => setPage('home')}>Home</a>
          <a onClick={() => setPage('market')}>Marketplace</a>
          <a onClick={() => setPage('requests')}>Buyer Requests</a>
          <a onClick={() => setPage('orders')}>Orders & Pre-orders</a>
        </div>

        <div>
          <h4>Platform</h4>
          <a onClick={() => setPage('home')}>How It Works</a>
          <a onClick={() => setPage('market')}>Browse Produce</a>
          <a onClick={() => setPage('auth-register')}>Register as Farmer or Buyer</a>
        </div>
      </div>

      <div className="foot-bottom">
        E-Farmers MERN Application · Powered by MongoDB, Express, React &amp; Node.js · {new Date().getFullYear()}
      </div>
    </footer>
  );
};

export default Footer;
