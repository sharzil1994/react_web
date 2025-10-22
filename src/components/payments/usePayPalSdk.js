import { useEffect, useState } from "react";

export default function usePayPalSdk({ clientId, currency = "USD", intent = "capture" }) {
  const [paypal, setPaypal] = useState(() => window.paypal || null);
  useEffect(() => {
    if (window.paypal) { setPaypal(window.paypal); return; }
    const qs = new URLSearchParams({ "client-id": clientId || "sb", currency, intent });
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?${qs.toString()}`;
    s.async = true;
    s.onload = () => setPaypal(window.paypal || null);
    s.onerror = () => setPaypal(null);
    document.body.appendChild(s);
    return () => { /* no cleanup needed */ };
  }, [clientId, currency, intent]);
  return paypal;
}
