import React, { useEffect, useRef, useState } from "react";
import usePayPalSdk from "@/components/payments/usePayPalSdk";

export default function PaypalPage() {
  const clientId = (import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb").trim();
  const currency = (import.meta.env.VITE_PAYPAL_CURRENCY || "USD").trim();
  const intent   = (import.meta.env.VITE_PAYPAL_INTENT || "capture").trim();

  const paypal = usePayPalSdk({ clientId, currency, intent });
  const mountRef = useRef(null);

  const [amount, setAmount] = useState("100.00");
  const [result, setResult] = useState({ msg: "", ok: null });

  // get token (support both keys)
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token") || "";

  // Where to capture on your server (via /proxy)
  const capturePath = (import.meta.env.VITE_PAYPAL_CAPTURE_PATH || "/api/paypal/capture-order").trim();
  const API_BASE = (import.meta.env.VITE_API_BASE || "/proxy").trim();
  const captureUrl = `${API_BASE}${capturePath.startsWith("/") ? capturePath : `/${capturePath}`}`;

  useEffect(() => {
    if (!paypal || !mountRef.current) return;

    // Clear previous render
    mountRef.current.innerHTML = "";

    paypal.Buttons({
      style: { layout: "vertical", color: "gold" },

      // CLIENT ONLY create (like your working HTML)
      createOrder: (data, actions) => {
        setResult({ msg: "", ok: null });
        return actions.order.create({
          purchase_units: [
            {
              amount: { currency_code: currency, value: String(amount || "0.01") },
              custom_id: "coins-100"
            }
          ],
        });
      },

      onApprove: async (data, actions) => {
        try {
          // Call your backend to CAPTURE (just like the working HTML)
          const res = await fetch(captureUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ orderID: data.orderID }),
          });
          const payload = await res.json().catch(() => ({}));
          if (!res.ok) {
            const msg = payload?.message || payload?.detail || `HTTP ${res.status}: Capture failed.`;
            throw new Error(msg);
          }
          const msg = payload?.username && payload?.amount
            ? `✅ Payment captured. ${payload.username} credited with $${payload.amount}.`
            : "✅ Payment captured.";
          setResult({ msg, ok: true });

          // Optional: if coins/balance changed, refresh your balance pill immediately
          window.dispatchEvent(new Event("wallet:changed"));
        } catch (e) {
          setResult({ msg: `❌ ${e?.message || "Something went wrong during capture."}`, ok: false });
          // console.error(e);
        }
      },

      onError: (err) => {
        setResult({ msg: "❌ PayPal initialization error. Please try again.", ok: false });
        // console.error(err);
      },

      onCancel: () => {
        setResult({ msg: "Payment cancelled.", ok: false });
      }
    }).render(mountRef.current);

  }, [paypal, amount, currency, captureUrl, token]);

  // If not logged in—redirect or show sign-in message as you prefer
  const authed = Boolean(token);

  return (
    <section className="container">
      <h1>Buy 100 Coins — ${amount}</h1>

      {!authed && (
        <div className="card" style={{ marginBottom: 12, color: "#fca5a5" }}>
          You must be logged in to purchase. Please log in first.
        </div>
      )}

      <div className="card" style={{ display:"grid", gap:12, maxWidth: 420 }}>
        <label>Amount</label>
        <input
          className="btn"
          style={{ padding: 10 }}
          value={amount}
          onChange={(e)=>setAmount(e.target.value)}
        />

        <div ref={mountRef} />
        {result.msg && (
          <div className="card" style={{
            marginTop: 8,
            borderColor: result.ok ? "#c6f6d5" : "#fed7d7",
            background:  result.ok ? "#f0fff4" : "#fff5f5",
          }}>
            {result.msg}
          </div>
        )}
      </div>
    </section>
  );
}
