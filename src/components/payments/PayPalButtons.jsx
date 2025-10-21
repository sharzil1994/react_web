import React, { useEffect, useRef, useState } from "react";
import { createPaypalOrder, capturePaypalOrder } from "@/api/client";

function loadSdk({ clientId, currency, intent }) {
  return new Promise((resolve, reject) => {
    if (window.paypal) return resolve(window.paypal);
    const qs = new URLSearchParams({ "client-id": clientId, currency, intent });
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?${qs.toString()}`;
    s.onload = () => resolve(window.paypal);
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function PayPalButtons({ amount, onSuccess, onError, onCancel, meta = {} }) {
  const mountRef = useRef(null);
  const [err, setErr] = useState("");

  const clientId = (import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb").trim();
  const currency = (import.meta.env.VITE_PAYPAL_CURRENCY || "USD").trim();
  const intent   = (import.meta.env.VITE_PAYPAL_INTENT || "capture").trim();

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const paypal = await loadSdk({ clientId, currency, intent });
        if (dead) return;

        paypal.Buttons({
          style: { layout: "vertical", color: "gold" },

          createOrder: async () => {
            setErr("");
            // Ask your backend to create the order
            const order = await createPaypalOrder({
              amount: String(amount || "0.01"), currency, intent, meta
            });

            // Accept common shapes: {id}, {orderID}, {order:{id}}, {result:{id}}, {data:{id}}
            const orderId =
              order?.id || order?.orderID || order?.orderId ||
              order?.order?.id || order?.data?.id || order?.result?.id;

            if (!orderId) {
              console.warn("create-order response:", order);
              throw new Error("No order id returned from server");
            }
            return String(orderId);
          },

          onApprove: async (data, actions) => {
            try {
              const captured = await capturePaypalOrder(data.orderID);
              onSuccess?.(captured);
            } catch (e) {
              setErr(e?.message || "Capture failed");
              onError?.(e);
            }
          },

          onCancel: (_d) => onCancel?.(),
          onError:  (e)   => { setErr(e?.message || "PayPal render error"); onError?.(e); },
        }).render(mountRef.current);
      } catch (e) {
        setErr(e?.message || "Failed to load PayPal");
      }
    })();
    return () => { dead = true; };
  }, [amount, clientId, currency, intent]);

  return (
    <>
      <div ref={mountRef} />
      {err && <div className="card" style={{ marginTop:8, color:"#fca5a5" }}>{err}</div>}
    </>
  );
}
