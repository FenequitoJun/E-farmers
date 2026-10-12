import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Auth = ({ initialTab = 'login', setPage }) => {
  const { login, register } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErr, setLoginErr] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regRole, setRegRole] = useState('farmer');
  const [regLocation, setRegLocation] = useState('');
  const [regPrefs, setRegPrefs] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPass2, setRegPass2] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regErr, setRegErr] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    setLoginLoading(true);

    try {
      await login(loginEmail, loginPassword);
      setPage('dashboard');
    } catch (err) {
      setLoginErr(err.message || 'Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegErr('');

    if (regName.trim().length < 2) {
      setRegErr('Please enter your full name.');
      return;
    }

    if (regPass.length < 6) {
      setRegErr('Password must be at least 6 characters.');
      return;
    }

    if (regPass !== regPass2) {
      setRegErr('Passwords do not match.');
      return;
    }

    if (!regLocation.trim()) {
      setRegErr('Please enter your location.');
      return;
    }

    setRegLoading(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPass,
        role: regRole,
        contact: regContact,
        location: regLocation,
        prefs: regPrefs,
      });
      setPage('dashboard');
    } catch (err) {
      setRegErr(err.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  const fillDemo = (email, pass) => {
    setLoginEmail(email);
    setLoginPassword(pass);
  };

  return (
    <div className="container">
      <div className="card form-card">
        {/* Auth Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Log in
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Create account
          </button>
        </div>

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <h3 style={{ color: 'var(--deep)', marginBottom: '4px' }}>Welcome back 👋</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginBottom: '16px' }}>
              Secure log in to access your farm dashboard and pre-orders.
            </p>

            {loginErr && <div className="form-err">{loginErr}</div>}

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <button
              className="btn deep block"
              type="submit"
              disabled={loginLoading}
              style={{ marginTop: '8px' }}
            >
              {loginLoading ? 'Securing session...' : '🔒 Secure log in'}
            </button>

            <div className="demo-note">
              Demo accounts (click to fill):
              <br />
              • Farmer (Nueva Ecija): <b style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => fillDemo('juan@farm.com', '123456')}>juan@farm.com</b>
              <br />
              • Buyer (Quezon City): <b style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => fillDemo('maria@market.com', '123456')}>maria@market.com</b>
              <br />
              • Farmer (Benguet): <b style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => fillDemo('pedro@farm.com', '123456')}>pedro@farm.com</b>
              <br />
              Password: <b>123456</b>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister}>
            <h3 style={{ color: 'var(--deep)', marginBottom: '4px' }}>Join E-Farmers 🌱</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginBottom: '16px' }}>
              Connect directly with farmers or buyers with full transparency.
            </p>

            {regErr && <div className="form-err">{regErr}</div>}

            <div className="field">
              <label>Full name *</label>
              <input
                required
                placeholder="Juan Dela Cruz"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Contact number *</label>
                <input
                  required
                  placeholder="0917 000 0000"
                  value={regContact}
                  onChange={(e) => setRegContact(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>I am registering as a</label>
              <div className="role-cards">
                <label className={`role-card ${regRole === 'farmer' ? 'sel' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="farmer"
                    checked={regRole === 'farmer'}
                    onChange={() => setRegRole('farmer')}
                  />
                  <span className="rc-txt">
                    <b>🧑‍🌾 Farmer</b>
                    <small>I produce &amp; sell harvests</small>
                  </span>
                </label>

                <label className={`role-card ${regRole === 'buyer' ? 'sel' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={regRole === 'buyer'}
                    onChange={() => setRegRole('buyer')}
                  />
                  <span className="rc-txt">
                    <b>🛒 Buyer</b>
                    <small>I pre-order produce</small>
                  </span>
                </label>
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>{regRole === 'farmer' ? 'Farm location *' : 'Your location *'}</label>
                <input
                  required
                  placeholder={regRole === 'farmer' ? 'e.g. Nueva Ecija' : 'e.g. Quezon City'}
                  value={regLocation}
                  onChange={(e) => setRegLocation(e.target.value)}
                />
              </div>

              <div className="field">
                <label>
                  {regRole === 'farmer' ? 'Products you grow' : 'Products you usually need'}
                </label>
                <input
                  placeholder={
                    regRole === 'farmer'
                      ? 'e.g. Rice, corn, vegetables'
                      : 'e.g. Tomatoes, leafy greens'
                  }
                  value={regPrefs}
                  onChange={(e) => setRegPrefs(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Password (min 6 chars) *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Confirm password *</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat password"
                  value={regPass2}
                  onChange={(e) => setRegPass2(e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn deep block"
              type="submit"
              disabled={regLoading}
              style={{ marginTop: '10px' }}
            >
              {regLoading ? 'Creating account...' : '✓ Validate & create account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
