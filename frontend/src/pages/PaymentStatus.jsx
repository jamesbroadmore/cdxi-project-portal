import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";

export default function PaymentStatus() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    let attempts = 0;
    const poll = async () => {
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        setStatus(data);
        if (data.payment_status === "paid" || attempts >= 10) {
          setLoading(false);
          return;
        }
        attempts++;
        setTimeout(poll, 2000);
      } catch {
        setLoading(false);
      }
    };
    poll();
  }, [sessionId]);

  if (!sessionId) return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
      <div className="text-center">
        <XCircle size={40} className="text-red-400 mx-auto mb-4" />
        <div className="text-sm text-zinc-400">No session ID provided.</div>
        <Link to="/" className="mt-4 block text-xs text-indigo-400 hover:text-indigo-300">Go to dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
      <div className="w-full max-w-sm">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
            <div className="text-sm text-zinc-400">Confirming payment…</div>
          </div>
        ) : status?.payment_status === "paid" ? (
          <div className="rounded-xl border border-emerald-500/20 bg-zinc-900 p-8 text-center">
            <CheckCircle size={40} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Payment Successful</h2>
            <p className="text-sm text-zinc-400">Your payment has been confirmed.</p>
            <Link to="/" className="mt-6 block rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <Clock size={40} className="text-zinc-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Payment Pending</h2>
            <p className="text-sm text-zinc-400">Status: {status?.payment_status || "unknown"}</p>
            <Link to="/" className="mt-6 inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300">
              <ArrowLeft size={13} /> Return to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
