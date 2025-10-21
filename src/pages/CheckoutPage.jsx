import React, { useState } from "react";
import PayPalButtons from "@/components/payments/PayPalButtons";
import PayPalRedirect from "@/components/payments/PayPalRedirect";

export default function CheckoutPage() {
  const [amount, setAmount] = useState("9.99");
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");

  return (
    <section className="container">
      <h1>Checkout</h1>

      <div className="card" style={{ display:"grid", gap:12, maxWidth:360 }}>
        <label>Amount</label>
        <input className="btn" style={{ padding:10 }} value={amount} onChange={(e)=>setAmount(e.target.value)} />

        {/* JS SDK buttons (create/capture via backend) */}
        <PayPalButtons
          amount={amount}
          onSuccess={(data)=>{ setRes(data); setErr(""); }}
          onError={(e)=> setErr(e?.message || "Payment error")}
          onCancel={()=> setErr("Payment cancelled")}
        />

        {/* Optional: approval-URL flow (GET paypal page) */}
        {/* <PayPalRedirect /> */}
      </div>

      {err && <pre className="card" style={{ marginTop:12, color:"#fca5a5" }}>{err}</pre>}
      {res && (
        <div className="card" style={{ marginTop:12 }}>
          <h3>Capture Result</h3>
          <pre style={{ overflow:"auto", margin:0 }}>{JSON.stringify(res, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
