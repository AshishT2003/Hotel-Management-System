import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginPage({ onNavigateToGuestBooking, onNavigateToGuestDashboard, isSplashActive = false }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [note, setNote] = useState('');
  const [shake, setShake] = useState(false);

  const fieldsRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const USERS = {
    admin: { pass: 'admin', role: 'Front Desk' },
    kitchen: { pass: 'kitchen', role: 'Kitchen Staff' },
    manager: { pass: 'manager', role: 'General Manager' },
    guest: { pass: 'guest', role: 'Hotel Guest' },
  };

  const clearError = () => {
    setError('');
  };

  const triggerError = (msg, focusTarget) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    if (focusTarget === 'user') usernameRef.current?.focus();
    if (focusTarget === 'pass') passwordRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setNote('');

    const u = username.trim().toLowerCase();
    const p = password;

    if (!u) {
      triggerError('Enter your username.', 'user');
      return;
    }
    if (!p) {
      triggerError('Enter your password.', 'pass');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await login(u, p);
      if (!user) {
        setIsSubmitting(false);
        triggerError('Username or password is incorrect. Check them and try again.');
        return;
      }

      setIsSuccess(true);
      const roleLabel = USERS[u]?.role || (u === 'kitchen' ? 'Kitchen Staff' : 'Front Desk');
      setNote(`Signing into ${roleLabel} portal...`);
    } catch (err) {
      setIsSubmitting(false);
      triggerError(err?.message || 'Username or password is incorrect. Check them and try again.');
    }
  };

  return (
    <div className="login-page-root">
      <style>{`
        .login-page-root {
          min-height: 100vh;
          width: 100vw;
          display: grid;
          place-items: center;
          padding: 24px;
          font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
          color: #ffffff;
          background-color: #060a12;
          background-image: linear-gradient(135deg, #050912 0%, #070c18 55%, #0b1424 100%);
          overflow-x: hidden;
          position: relative;
          box-sizing: border-box;
        }

        /* ambient drifting glows */
        .login-glow { position: fixed; border-radius: 50%; filter: blur(70px); pointer-events: none; z-index: 0; }
        .login-glow.g1 { width: 520px; height: 520px; top: 8%; left: 10%; background: radial-gradient(circle, rgba(16,185,129,.16), transparent 70%); animation: drift1 16s ease-in-out infinite alternate; }
        .login-glow.g2 { width: 460px; height: 460px; bottom: 4%; right: 8%; background: radial-gradient(circle, rgba(56,189,248,.09), transparent 70%); animation: drift2 20s ease-in-out infinite alternate; }
        @keyframes drift1 { to { transform: translate(70px, 50px) scale(1.12); } }
        @keyframes drift2 { to { transform: translate(-60px, -40px) scale(1.1); } }

        /* ---------- Card ---------- */
        .login-card {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: min(1000px, 100%);
          background: #0d1527;
          border: 1px solid #1e293b;
          border-radius: 26px;
          overflow: hidden;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.02);
          opacity: 0;
          transform: translateY(28px) scale(.985);
          animation: cardIn .9s cubic-bezier(.16,1,.3,1) forwards;
          transition: transform 0.6s cubic-bezier(.16,1,.3,1), opacity 0.6s ease;
        }
        .login-card.splash-waiting {
          opacity: 0 !important;
          transform: translateY(32px) scale(.98) !important;
          animation: none !important;
        }
        .login-card.splash-waiting * {
          animation-play-state: paused !important;
        }
        @keyframes cardIn { to { opacity: 1; transform: none; } }

        /* staggered entrance helper */
        .rise { opacity: 0; transform: translateY(14px); animation: rise .7s cubic-bezier(.16,1,.3,1) var(--d, 0s) forwards; }
        @keyframes rise { to { opacity: 1; transform: none; } }

        /* ---------- Brand side ---------- */
        .brand-section {
          position: relative;
          padding: 60px;
          display: flex; flex-direction: column; justify-content: space-between;
          background:
            radial-gradient(90% 70% at 0% 0%, rgba(16,185,129,.20), transparent 60%),
            linear-gradient(145deg, #0a1322 0%, #0b1424 55%, #060a14 100%);
          border-right: 1px solid #1e293b;
          overflow: hidden;
        }
        .brand-section::after {
          content: ""; position: absolute; top: -20%; bottom: -20%; width: 40%; left: -60%;
          background: linear-gradient(100deg, transparent, rgba(16,185,129,.07), transparent);
          transform: skewX(-12deg);
          animation: sweep 7s ease-in-out 1.6s infinite;
          pointer-events: none;
        }
        @keyframes sweep { 0% { left: -60%; } 55%, 100% { left: 130%; } }

        .icon-container {
          width: 70px; height: 70px; border-radius: 18px;
          display: grid; place-items: center;
          color: #052e22;
          background: linear-gradient(135deg, #22dcaa 0%, #10b981 100%);
          box-shadow: 0 10px 30px rgba(16,185,129,.35);
          margin-bottom: 26px;
          opacity: 0; transform: scale(.6) rotate(-8deg);
          animation: iconPop .8s cubic-bezier(.34,1.56,.64,1) .25s forwards, breathe 4s ease-in-out 1.3s infinite;
        }
        @keyframes iconPop { to { opacity: 1; transform: none; } }
        @keyframes breathe {
          0%, 100% { box-shadow: 0 10px 30px rgba(16,185,129,.30); }
          50% { box-shadow: 0 10px 42px rgba(16,185,129,.55); }
        }
        .icon-container svg { width: 34px; height: 34px; }
        .icon-container .wd { fill: currentColor; stroke: none; animation: twinkle 3.6s ease-in-out infinite; animation-delay: calc(var(--i) * .45s + 1.2s); }
        @keyframes twinkle { 0%, 100% { opacity: 1; } 45% { opacity: .2; } 60% { opacity: 1; } }

        .tagline {
          display: inline-block;
          padding: 6px 13px;
          font-size: 12px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase;
          color: #19d3a2;
          background: rgba(16,185,129,.10);
          border: 1px solid rgba(16,185,129,.35);
          border-radius: 999px;
          margin-bottom: 18px;
        }
        .main-title { font-size: clamp(30px, 3.6vw, 42px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.08; margin-bottom: 16px; color: #fff; }
        .main-desc { color: #cbd5e1; font-size: 16.5px; line-height: 1.65; max-width: 440px; }

        .features-wrap { position: relative; }
        .feature-divider {
          height: 1px; margin-bottom: 26px;
          background: linear-gradient(90deg, rgba(148,163,184,.25), rgba(148,163,184,.05));
          transform: scaleX(0); transform-origin: left;
          animation: grow 1s cubic-bezier(.16,1,.3,1) .75s forwards;
        }
        @keyframes grow { to { transform: scaleX(1); } }
        .features-container { list-style: none; display: flex; flex-direction: column; gap: 16px; }
        .feature-item {
          display: flex; align-items: center; gap: 13px;
          color: #cbd5e1; font-size: 14.5px;
          opacity: 0; transform: translateX(-14px);
          animation: slideIn .6s cubic-bezier(.16,1,.3,1) var(--d) forwards;
        }
        @keyframes slideIn { to { opacity: 1; transform: none; } }
        .check { width: 22px; height: 22px; flex-shrink: 0; color: #10b981; }
        .check circle { opacity: 0; animation: fadeIn .4s ease var(--d) forwards; }
        .check path { stroke-dasharray: 16; stroke-dashoffset: 16; animation: draw .5s ease calc(var(--d) + .25s) forwards; }
        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes draw { to { stroke-dashoffset: 0; } }

        /* ---------- Auth side ---------- */
        .auth-section { padding: 64px 54px; display: flex; flex-direction: column; justify-content: center; background: #0d1527; }
        .auth-header h2 { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; color: #ffffff; }
        .auth-header p { color: #64748b; font-size: 14.5px; margin-bottom: 32px; line-height: 1.5; }

        .input-wrapper { margin-bottom: 20px; }
        .input-wrapper label {
          display: block; margin-bottom: 9px;
          color: #cbd5e1; font-size: 13.5px; font-weight: 600; letter-spacing: .6px; text-transform: uppercase;
        }
        .input-wrapper label span { color: #f43f5e; }
        .input-field {
          width: 100%; height: 50px; padding: 0 16px;
          background: #0a1120; color: #ffffff;
          border: 1px solid #263349; border-radius: 11px;
          font: inherit; font-size: 15.5px; outline: none;
          transition: border-color .2s ease, box-shadow .25s ease, background-color .2s ease;
          box-sizing: border-box;
        }
        .input-field:hover { border-color: #33445f; }
        .input-field:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 2px #10b981, 0 0 22px rgba(16, 185, 129, 0.35);
          background: #0b1424;
        }
        .input-field.invalid { border-color: #f43f5e; }
        .input-field:focus-visible { outline: none; }

        .form-error { color: #fb7185; font-size: 13.5px; line-height: 1.4; margin: -4px 0 14px; }
        .shake { animation: shake .45s cubic-bezier(.36,.07,.19,.97); }
        @keyframes shake { 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }

        .sign-in-btn {
          position: relative; overflow: hidden;
          width: 100%; height: 56px; margin-top: 6px;
          background: linear-gradient(180deg, #0ba676 0%, #059669 100%);
          color: #ffffff; border: 0; border-radius: 11px;
          font: inherit; font-size: 17.5px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 6px 18px rgba(5,150,105,.25);
          transition: transform .2s ease, box-shadow .25s ease, filter .2s ease, background .3s ease;
        }
        .sign-in-btn::before {
          content: ""; position: absolute; top: 0; bottom: 0; left: -70%; width: 45%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.28), transparent);
          transform: skewX(-20deg);
        }
        .sign-in-btn:hover:not(:disabled)::before { animation: shine .8s ease; }
        @keyframes shine { to { left: 130%; } }
        .sign-in-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(5,150,105,.4); filter: brightness(1.05); }
        .sign-in-btn:active:not(:disabled) { transform: translateY(1px); }
        .sign-in-btn:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
        .sign-in-btn:disabled { cursor: default; }
        .sign-in-btn .ico { width: 20px; height: 20px; transition: transform .25s ease; }
        .sign-in-btn:hover:not(:disabled) .ico { transform: translateX(4px); }
        .sign-in-btn.done { background: linear-gradient(180deg, #19d3a2 0%, #10b981 100%); color: #032b1f; }
        .spinner { width: 20px; height: 20px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,.3); border-top-color: #fff; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .preview-note { color: #64748b; font-size: 13.5px; min-height: 1.3em; margin-top: 16px; text-align: center; }

        .guest-entry-section { margin-top: 22px; }
        .guest-entry-divider {
          position: relative; text-align: center; margin-bottom: 14px;
        }
        .guest-entry-divider::before {
          content: ""; position: absolute; top: 50%; left: 0; right: 0;
          height: 1px; background: #1e293b; z-index: 0;
        }
        .guest-entry-divider span {
          position: relative; z-index: 1; background: #0d1527;
          padding: 0 12px; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.8px; color: #64748b;
        }
        .guest-entry-actions { display: flex; flex-direction: column; gap: 8px; }
        .guest-direct-btn {
          width: 100%; padding: 12px 16px; border-radius: 11px;
          font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s ease;
        }
        .guest-direct-btn.primary {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.35);
        }
        .guest-direct-btn.primary:hover {
          background: rgba(16, 185, 129, 0.22);
          border-color: #10b981;
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.2);
        }
        .guest-direct-btn.secondary {
          background: transparent;
          color: #94a3b8;
          border: 1px solid #1e293b;
        }
        .guest-direct-btn.secondary:hover {
          background: rgba(30, 41, 59, 0.4);
          color: #ffffff;
          border-color: #33445f;
        }
        .guest-direct-btn .btn-ico { width: 16px; height: 16px; }

        @media (max-width: 860px) {
          .login-page-root { padding: 12px; align-items: start; }
          .login-card { grid-template-columns: 1fr; border-radius: 20px; }
          .brand-section, .auth-section { padding: 34px 24px; }
          .features-wrap { margin-top: 28px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .login-page-root *, .login-page-root *::before, .login-page-root *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            animation-delay: 0s !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      {/* Ambient drifting glow backgrounds */}
      <div className="login-glow g1" aria-hidden="true" />
      <div className="login-glow g2" aria-hidden="true" />

      {/* Main Login Card */}
      <div className={`login-card ${isSplashActive ? 'splash-waiting' : 'active-reveal'}`}>
        {/* Brand Side */}
        <div className="brand-section">
          <div className="brand-header">
            <div className="icon-container" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="2.5" width="14" height="19" rx="2.2" />
                <circle className="wd" style={{ ['--i']: 0 }} cx="9" cy="7" r="1" />
                <circle className="wd" style={{ ['--i']: 1 }} cx="12" cy="7" r="1" />
                <circle className="wd" style={{ ['--i']: 2 }} cx="15" cy="7" r="1" />
                <circle className="wd" style={{ ['--i']: 3 }} cx="9" cy="10.5" r="1" />
                <circle className="wd" style={{ ['--i']: 4 }} cx="12" cy="10.5" r="1" />
                <circle className="wd" style={{ ['--i']: 5 }} cx="15" cy="10.5" r="1" />
                <path d="M10 21.5v-3.5a2 2 0 0 1 4 0v3.5" />
              </svg>
            </div>
            <div className="rise" style={{ ['--d']: '.4s' }}>
              <span className="tagline">Hospitality Platform 2.0</span>
            </div>
            <h1 className="main-title rise" style={{ ['--d']: '.5s' }}>
              <span className="maharaja-brand-animated">MAHARAJA Hotel</span>
            </h1>
            <p className="main-desc rise" style={{ ['--d']: '.6s' }}>
              Enterprise hotel reservation, live room occupancy matrix, guest billing, and kitchen order management.
            </p>
          </div>

          <div className="features-wrap">
            <div className="feature-divider" />
            <ul className="features-container">
              <li className="feature-item" style={{ ['--d']: '.95s' }}>
                <svg
                  className="check"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M7.8 12.4l2.9 2.9 5.5-5.8" />
                </svg>
                <span>Full reservation lifecycle &amp; check-in management</span>
              </li>
              <li className="feature-item" style={{ ['--d']: '1.1s' }}>
                <svg
                  className="check"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M7.8 12.4l2.9 2.9 5.5-5.8" />
                </svg>
                <span>Interactive 5-floor room availability matrix (50 rooms)</span>
              </li>
              <li className="feature-item" style={{ ['--d']: '1.25s' }}>
                <svg
                  className="check"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9.5" />
                  <path d="M7.8 12.4l2.9 2.9 5.5-5.8" />
                </svg>
                <span>Live kitchen dining queue &amp; service fulfillment</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Auth Side */}
        <div className="auth-section">
          <div className="auth-header">
            <h2 className="rise" style={{ ['--d']: '.45s' }}>
              Portal Authentication
            </h2>
            <p className="rise" style={{ ['--d']: '.55s' }}>
              Enter staff or guest credentials, or use direct guest booking below.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div ref={fieldsRef} className={`fields ${shake ? 'shake' : ''}`}>
              <div className="input-wrapper rise" style={{ ['--d']: '.65s' }}>
                <label htmlFor="username">
                  Username or Guest Email <span>*</span>
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  id="username"
                  className={`input-field ${error ? 'invalid' : ''}`}
                  value={username}
                  onChange={(e) => {
                    clearError();
                    setUsername(e.target.value);
                  }}
                  required
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck="false"
                />
              </div>

              <div className="input-wrapper rise" style={{ ['--d']: '.75s' }}>
                <label htmlFor="password">
                  Password <span>*</span>
                </label>
                <input
                  ref={passwordRef}
                  type="password"
                  id="password"
                  className={`input-field ${error ? 'invalid' : ''}`}
                  value={password}
                  onChange={(e) => {
                    clearError();
                    setPassword(e.target.value);
                  }}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className={`sign-in-btn rise ${isSuccess ? 'done' : ''}`}
              disabled={isSubmitting || isSuccess}
              style={{ ['--d']: '.85s' }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  <span>Signing in...</span>
                </>
              ) : isSuccess ? (
                <>
                  <svg
                    className="ico"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  <span>
                    Welcome to MAHARAJA Hotel
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="ico"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                  <span>Sign In to Portal</span>
                </>
              )}
            </button>

            {note && (
              <p className="preview-note" aria-live="polite">
                {note}
              </p>
            )}
          </form>

          {/* Guest Direct Self-Service Booking (No Login Required) */}
          <div className="guest-entry-section rise" style={{ ['--d']: '1s' }}>
            <div className="guest-entry-divider">
              <span>Or Guest Direct Access</span>
            </div>
            <div className="guest-entry-actions">
              <button
                type="button"
                onClick={onNavigateToGuestBooking}
                className="guest-direct-btn primary"
              >
                <svg
                  className="btn-ico"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Book a Room as Guest (No Login Required)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
