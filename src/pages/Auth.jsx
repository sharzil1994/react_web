// src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// If '@' alias doesn't work in your project, use:  import { login, createUser, doGlobalLogout, tokenStorage } from "../api/client";
import { login, createUser, doGlobalLogout, tokenStorage } from "@/api/client";

// —— Endpoints/fields can be overridden via .env; these are just defaults the client uses internally
const LOGIN_USER_KEY        = (import.meta.env.VITE_LOGIN_USER_KEY?.trim()) || "username"; // or "email"
const LOGIN_PASS_KEY        = (import.meta.env.VITE_LOGIN_PASS_KEY?.trim()) || "password";
const SIGNUP_USERNAME_KEY   = (import.meta.env.VITE_SIGNUP_USERNAME_KEY?.trim()) || "username";
const SIGNUP_EMAIL_KEY      = (import.meta.env.VITE_SIGNUP_EMAIL_KEY?.trim()) || "email";
const SIGNUP_PASSWORD_KEY   = (import.meta.env.VITE_SIGNUP_PASSWORD_KEY?.trim()) || "password";
const SIGNUP_FULLNAME_KEY   = (import.meta.env.VITE_SIGNUP_FULLNAME_KEY?.trim()) || "full_name";
const TOKEN_KEY_IN_RESPONSE = (import.meta.env.VITE_TOKEN_KEY?.trim()) || "access_token";

export default function Login() {
  const navigate = useNavigate();

  // auth/UI
  const [tab, setTab]         = useState("login"); // "login" | "signup"
  const [isAuthed, setIsAuthed] = useState(!!tokenStorage.get());
  const [infoMsg, setInfoMsg] = useState("");

  // login state
  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError,   setLoginError]   = useState("");
  const [loginResult,  setLoginResult]  = useState(null);

  // signup state
  const [username, setUsername]   = useState("");
  const [email,    setEmail]      = useState("");
  const [signupPw, setSignupPw]   = useState("");
  const [fullName, setFullName]   = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError,   setSignupError]   = useState("");
  const [signupResult,  setSignupResult]  = useState(null);

  // helper: broadcast to navbar / other listeners
  function notifyAuthChange(isOn) {
    window.dispatchEvent(new CustomEvent("auth:changed", { detail: { isAuthed: isOn } }));
  }

  // helper: reset entire UI back to initial state
  function resetAuthUI() {
    setTab("login");
    setIdentifier(""); setPassword(""); setShowPw(false);
    setLoginLoading(false); setLoginError(""); setLoginResult(null);
    setUsername(""); setEmail(""); setSignupPw(""); setFullName("");
    setSignupLoading(false); setSignupError(""); setSignupResult(null);
    setInfoMsg("");
    setIsAuthed(false);
  }

  // listen for global reset (e.g., triggered from Settings logout)
  useEffect(() => {
    const onReset = () => resetAuthUI();
    window.addEventListener("auth:reset", onReset);
    return () => window.removeEventListener("auth:reset", onReset);
  }, []);

  function buildLoginPayload() {
    return { [LOGIN_USER_KEY]: identifier, [LOGIN_PASS_KEY]: password };
  }
  function buildSignupPayload() {
    return {
      [SIGNUP_USERNAME_KEY]: username,
      [SIGNUP_EMAIL_KEY]:    email,
      [SIGNUP_PASSWORD_KEY]: signupPw,
      [SIGNUP_FULLNAME_KEY]: fullName,
    };
  }

  async function submitLogin(e) {
    e.preventDefault();
    setLoginError(""); setLoginResult(null); setInfoMsg("");
    if (!identifier || !password) {
      setLoginError("Please enter credentials.");
      return;
    }
    try {
      setLoginLoading(true);
      // login() in client.js sends x-www-form-urlencoded (per your 422 earlier)
      const data = await login(buildLoginPayload());
      setLoginResult(data);

      const token =
        data?.[TOKEN_KEY_IN_RESPONSE] ||
        data?.token ||
        data?.jwt ||
        data?.access_token ||
        data?.accessToken;

      if (token) {
        tokenStorage.set(token);
        setIsAuthed(true);
        notifyAuthChange(true);
        // Redirect after login
        navigate("/mypage", { replace: true });
      } else {
        setInfoMsg("Logged in, but no token returned.");
      }
    } catch (err) {
      const details = err?.data
        ? (typeof err.data === "string" ? err.data : JSON.stringify(err.data, null, 2))
        : "";
      setLoginError(`${err.message}${details ? `\n${details}` : ""}`);
    } finally {
      setLoginLoading(false);
    }
  }

  async function submitSignup(e) {
    e.preventDefault();
    setSignupError(""); setSignupResult(null); setInfoMsg("");
    if (!username || !email || !signupPw) {
      setSignupError("Please fill username, email, and password.");
      return;
    }
    try {
      setSignupLoading(true);
      const data = await createUser(buildSignupPayload()); // JSON in client.js
      setSignupResult(data);
      // You can auto-switch to login here if you want:
      // setTab("login");
      setUsername(""); setEmail(""); setSignupPw(""); setFullName("");
    } catch (err) {
      const details = err?.data
        ? (typeof err.data === "string" ? err.data : JSON.stringify(err.data, null, 2))
        : "";
      setSignupError(`${err.message}${details ? `\n${details}` : ""}`);
    } finally {
      setSignupLoading(false);
    }
  }

  async function handleLogout() {
    await doGlobalLogout();          // server logout (if configured) + clear token + auth events
    resetAuthUI();                   // reset page UI immediately
    setInfoMsg("Logged out (token cleared).");
    navigate("/login", { replace: true });
  }

  return (
    <section className="container">
      <div className="hero" style={{ paddingBottom: 16 }}>
        <div className="kicker">auth</div>
        <h1>{isAuthed ? "Welcome" : (tab === "login" ? "Log in" : "Create account")}</h1>
        <p className="subtitle">
          This page sends POST requests to your API. Endpoints/fields are configured in <code>.env</code>.
        </p>

        <div className="cta-row">
          {!isAuthed && (
            <>
              <button
                className={"btn" + (tab === "login" ? " primary" : "")}
                onClick={() => setTab("login")}
              >
                Login
              </button>
              <button
                className={"btn" + (tab === "signup" ? " primary" : "")}
                onClick={() => setTab("signup")}
              >
                Sign up
              </button>
            </>
          )}
          {isAuthed && (
            <button className="btn" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </div>

      {infoMsg && <div className="card" style={{ marginTop: 12 }}>{infoMsg}</div>}

      {/* Hide forms once logged in */}
      {!isAuthed && (
        <>
          {tab === "login" && (
            <>
              <form className="card" onSubmit={submitLogin} style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label>Username or Email</label>
                  <input
                    className="btn"
                    style={{ padding: 10 }}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <label>Password</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="btn"
                      style={{ padding: 10, flex: 1 }}
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setShowPw((s) => !s)}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn primary" type="submit" disabled={loginLoading}>
                    {loginLoading ? "Signing in…" : "Log in"}
                  </button>
                  {/* no reset button by request */}
                </div>
              </form>

              {loginError && (
                <pre className="card" style={{ whiteSpace: "pre-wrap", marginTop: 12, color: "#fca5a5" }}>
                  {loginError}
                </pre>
              )}
              {loginResult && (
                <div className="card" style={{ marginTop: 12 }}>
                  <h3>Response</h3>
                  <pre style={{ overflow: "auto", margin: 0 }}>
                    {JSON.stringify(loginResult, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}

          {tab === "signup" && (
            <>
              <form className="card" onSubmit={submitSignup} style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label>Username</label>
                  <input
                    className="btn"
                    style={{ padding: 10 }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                  />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <label>Email</label>
                  <input
                    className="btn"
                    style={{ padding: 10 }}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <label>Password</label>
                  <input
                    className="btn"
                    style={{ padding: 10 }}
                    type="password"
                    value={signupPw}
                    onChange={(e) => setSignupPw(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <label>Full name (optional)</label>
                  <input
                    className="btn"
                    style={{ padding: 10 }}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Name"
                  />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn primary" type="submit" disabled={signupLoading}>
                    {signupLoading ? "Creating…" : "Create user"}
                  </button>
                  {/* no reset button by request */}
                </div>
              </form>

              {signupError && (
                <pre className="card" style={{ whiteSpace: "pre-wrap", marginTop: 12, color: "#fca5a5" }}>
                  {signupError}
                </pre>
              )}
              {signupResult && (
                <div className="card" style={{ marginTop: 12 }}>
                  <h3>Response</h3>
                  <pre style={{ overflow: "auto", margin: 0 }}>
                    {JSON.stringify(signupResult, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* When logged in, simple message (forms hidden) */}
      {isAuthed && (
        <div className="card" style={{ marginTop: 12 }}>
          <strong>You are logged in.</strong>
          <div style={{ marginTop: 6, color: "var(--muted)" }}>
            Use the Settings → Logout in the header to log out at any time.
          </div>
        </div>
      )}
    </section>
  );
}
