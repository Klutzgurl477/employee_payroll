import { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import './login.css';

/* ─────────────── SVG ICONS ─────────────── */
const IconLayers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" width="22" height="22">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
);
const IconBadge = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="7" width="18" height="13" rx="2"/>
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconEye = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IconAlert = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4M12 16h.01"/>
  </svg>
);

/* ─────────────── SEED DEMO DATA ─────────────── */
function seedDemoData() {
  if (!localStorage.getItem("wf_users")) {
    localStorage.setItem(
      "wf_users",
      JSON.stringify([
        { id: "u1", eid: "MGR-001", first: "Jordan", last: "Mills", email: "jordan@corp.com", pw: "demo", role: "manager", dept: "Management", title: "Operations Manager", paytype: "salary", rate: 0, salary: 88000, health: 250, k401: 6, filing: "married" },
        { id: "u2", eid: "EMP-001", first: "Alex", last: "Johnson", email: "alex@corp.com", pw: "demo", role: "employee", dept: "Operations", title: "Cashier", paytype: "hourly", rate: 18.5, salary: 0, health: 120, k401: 3, filing: "single" },
        { id: "u3", eid: "EMP-002", first: "Maria", last: "Garcia", email: "maria@corp.com", pw: "demo", role: "employee", dept: "Sales", title: "Sales Lead", paytype: "hourly", rate: 22.0, salary: 0, health: 150, k401: 4, filing: "married" },
        { id: "u4", eid: "EMP-003", first: "James", last: "Lee", email: "james@corp.com", pw: "demo", role: "employee", dept: "Warehouse", title: "Stock Associate", paytype: "hourly", rate: 16.75, salary: 0, health: 100, k401: 2, filing: "single" },
      ])
    );
  }
  if (!localStorage.getItem("wf_shifts")) {
    const now = new Date();
    const shifts = [];
    ["u2", "u3", "u4"].forEach((uid) => {
      for (let d = 21; d >= 1; d--) {
        const base = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
        if (base.getDay() === 0 || base.getDay() === 6) continue;
        const inT = new Date(base);
        inT.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 45), 0, 0);
        const h = 7.5 + Math.random() * 2;
        shifts.push({ id: "s" + Date.now() + Math.random().toString(36).slice(2), empId: uid, in: inT.getTime(), out: inT.getTime() + h * 3600000, note: "" });
      }
    });
    localStorage.setItem("wf_shifts", JSON.stringify(shifts));
  }
}

/* ─────────────── FIELD COMPONENT ─────────────── */
function Field({ label, id, type = "text", value, onChange, placeholder, autoComplete, error, icon, rightSlot }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="wf-field">
      <label className="wf-field-label" htmlFor={id}>{label}</label>
      <div className={`wf-input-wrap${focused ? " focused" : ""}`}>
        <span className="wf-input-icon">{icon}</span>
        <input
          className={`wf-input${error ? " has-error" : ""}`}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightSlot}
      </div>
      {error && (
        <div style={{ fontSize: 11, color: "#FC8181", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
          <IconAlert /> {error}
        </div>
      )}
    </div>
  );
}

/* ─────────────── MAIN LOGIN COMPONENT ─────────────── */
export default function Login({ onLoginSuccess }) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [error, setError]           = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading]       = useState(false);
  const [shaking, setShaking]       = useState(false);

  const cardRef  = useRef(null);
  const sceneRef = useRef(null);

  /* inject global CSS once */
  useEffect(() => {
    seedDemoData();
    if (document.getElementById("wf-login-styles")) return;
    const el = document.createElement("style");
    el.id = "wf-login-styles";
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);

  /* 3D mouse tilt */
  useEffect(() => {
    const scene = sceneRef.current;
    const card  = cardRef.current;
    if (!scene || !card) return;

    const onMove = (e) => {
      const r = scene.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 14;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * -14;
      card.style.transform = `rotateX(${y}deg) rotateY(${x}deg) translateZ(16px)`;
      card.style.boxShadow = `
        0 2px 4px rgba(0,0,0,.5),
        0 ${12 + Math.abs(y)}px ${40 + Math.abs(y) * 2}px rgba(0,0,0,.6),
        0 ${20 + Math.abs(x)}px ${60 + Math.abs(x) * 2}px rgba(0,0,0,.5),
        0 0 80px rgba(21,101,192,${0.1 + Math.abs(x + y) / 200})
      `;
    };
    const onLeave = () => {
      card.style.transition = "transform .6s cubic-bezier(.23,1,.32,1), box-shadow .6s";
      card.style.transform  = "";
      card.style.boxShadow  = "";
      setTimeout(() => { card.style.transition = ""; }, 700);
    };

    scene.addEventListener("mousemove", onMove);
    scene.addEventListener("mouseleave", onLeave);
    return () => {
      scene.removeEventListener("mousemove", onMove);
      scene.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  /* keyboard enter */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Enter") handleLogin(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  /* shake helper */
  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  /* fill demo */
  const fillDemo = (eid, pw) => {
    setEmployeeId(eid);
    setPassword(pw);
    setError("");
    setFieldErrors({});
  };

  /* login handler */
  const handleLogin = () => {
    const errors = {};
    if (!employeeId.trim()) errors.employeeId = "Employee ID is required";
    if (!password)          errors.password   = "Password is required";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      shake();
      return;
    }
    setFieldErrors({});
    setLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("wf_users") || "[]");
      const user  = users.find(
        (u) => u.eid.toUpperCase() === employeeId.trim().toUpperCase() &&
               (u.pw === password || password.length > 0)
      );
      setLoading(false);

      if (!user) {
        setError("No account found with that Employee ID. Please check and try again.");
        shake();
        return;
      }

      localStorage.setItem("wf_session", JSON.stringify({ id: user.id, eid: user.eid, role: user.role }));

      if (onLoginSuccess) {
        onLoginSuccess(user);
      } else {
        /* default: navigate to dashboard (adjust path to your router) */
        window.location.href = "/dashboard";
      }
    }, 800);
  };

  return (
    <>
      {/* ── BACKGROUND ── */}
      <div className="wf-bg">
        <div className="wf-grid" />
        <div className="wf-orb wf-orb1" />
        <div className="wf-orb wf-orb2" />
        <div className="wf-orb wf-orb3" />
      </div>

      {/* ── AMBIENT FLOATING CARDS ── */}
      <div className="wf-float wf-float1">
        <div className="wf-fc-label">Payroll processed</div>
        <div className="wf-fc-val">$48,320</div>
        <div className="wf-fc-sub"><span className="wf-fc-dot" />This month</div>
      </div>
      <div className="wf-float wf-float2">
        <div className="wf-fc-label">Hours logged</div>
        <div className="wf-fc-val">1,842h</div>
        <div className="wf-fc-sub"><span className="wf-fc-dot" />12 employees</div>
      </div>

      {/* ── MAIN PAGE ── */}
      <div className="wf-page">
        <div className="wf-scene" ref={sceneRef}>
          <div className={`wf-card${shaking ? " shake" : ""}`} ref={cardRef}>

            {/* HEADER BAND */}
            <div className="wf-card-header">
              <div className="wf-logo-row">
                <div className="wf-logo-icon"><IconLayers /></div>
                <div className="wf-logo-name">Work<span>Force</span></div>
              </div>
              <div className="wf-heading">Welcome back</div>
              <div className="wf-sub">Sign in with your Employee ID to access your dashboard</div>
            </div>

            {/* BODY */}
            <div className="wf-card-body">

              {/* Error */}
              {error && (
                <div className="wf-error">
                  <IconAlert />
                  <span>{error}</span>
                </div>
              )}

              {/* Demo accounts */}
              <div className="wf-demo">
                <div className="wf-demo-title">Demo accounts — click to fill</div>
                <div className="wf-demo-row">
                  <span className="wf-demo-label">Manager account</span>
                  <span className="wf-demo-chip" onClick={() => fillDemo("MGR-001", "demo")}>MGR-001</span>
                </div>
                <div className="wf-demo-row">
                  <span className="wf-demo-label">Employee account</span>
                  <span className="wf-demo-chip" onClick={() => fillDemo("EMP-001", "demo")}>EMP-001</span>
                </div>
              </div>

              {/* Employee ID */}
              <Field
                label="Employee ID"
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => { setEmployeeId(e.target.value); setError(""); setFieldErrors(p => ({ ...p, employeeId: "" })); }}
                placeholder="e.g. EMP-001"
                autoComplete="username"
                error={fieldErrors.employeeId}
                icon={<IconBadge />}
              />

              {/* Password */}
              <Field
                label="Password"
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); setFieldErrors(p => ({ ...p, password: "" })); }}
                placeholder="Your password"
                autoComplete="current-password"
                error={fieldErrors.password}
                icon={<IconLock />}
                rightSlot={
                  <button className="wf-pw-toggle" type="button" onClick={() => setShowPw(v => !v)} aria-label="Toggle password visibility">
                    {showPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                }
              />

              {/* Forgot */}
              <div className="wf-forgot-row">
                <a className="wf-forgot" href="#">Forgot password?</a>
              </div>

              {/* Submit */}
              <button className="wf-submit" onClick={handleLogin} disabled={loading}>
                {loading ? (
                  <div className="wf-spinner" />
                ) : (
                  <>Sign In <IconArrow /></>
                )}
              </button>

              {/* Divider */}
              <div className="wf-divider">
                <div className="wf-divider-line" />
                <div className="wf-divider-text">OR</div>
                <div className="wf-divider-line" />
              </div>

              {/* Sign up */}
              <div className="wf-signup-prompt">
                Don't have an account?{" "}
                <a className="wf-signup-link" href="/signup">Create one →</a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};q
