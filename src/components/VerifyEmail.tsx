import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { Mail, RefreshCw, LogOut, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export const VerifyEmail: React.FC = () => {
  const { user, logout } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    if (!user) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, email: user.email })
      });
      if (!res.ok) throw new Error("Failed to send activation email");
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to send verification email.");
    } finally {
      setSending(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-md w-full p-10 rounded-[2.5rem] shadow-2xl border-white/40"
      >
        <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/20">
          <Mail className="text-white" size={40} />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Verify Your Email</h1>
        <p className="text-gray-600 mb-8 font-medium leading-relaxed">
          We've sent an activation link to <br/>
          <span className="text-blue-600 font-bold">{user?.email}</span>. <br/>
          Please check your inbox and click the link to activate your account.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleReload}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            I've Verified My Email
            <ArrowRight size={20} />
          </button>

          <button
            onClick={handleResend}
            disabled={sending}
            className={cn(
              "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
              sent ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            )}
          >
            {sending ? <RefreshCw className="animate-spin" size={20} /> : sent ? <CheckCircle size={20} /> : <RefreshCw size={20} />}
            {sent ? "Email Sent!" : "Resend Activation Link"}
          </button>

          {error && <p className="text-red-500 text-xs font-bold mt-2">{error}</p>}

          <div className="pt-6 border-t border-gray-100 mt-6">
            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-500 text-sm font-bold flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <LogOut size={18} />
              Sign out and try another email
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
