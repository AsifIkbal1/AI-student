import React, { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ChevronLeft, CheckCircle2, Loader2, Globe, Copy, X } from "lucide-react";
import { db } from "../firebase";
import { cn } from "../lib/utils";
import { PLANS, getStripe } from "../lib/payments/config";
import { useAuth } from "./AuthContext";
import nagadLogo from "../assets/nagad.png";
import bkashLogo from "../assets/bkash.png";

const MFS_OPTIONS = [
  {
    id: "bkash",
    name: "bKash",
    color: "bg-[#E2136E]",
    logo: () => (
      <img 
        src={bkashLogo} 
        alt="bKash" 
        className="w-12 h-12 object-contain rounded-xl bg-white"
      />
    )
  },
  {
    id: "nagad",
    name: "Nagad",
    color: "bg-[#F7931E]",
    logo: () => (
      <img 
        src={nagadLogo} 
        alt="Nagad" 
        className="w-12 h-12 object-contain rounded-xl bg-white"
      />
    )
  },
  {
    id: "rocket",
    name: "Rocket",
    color: "bg-[#8C1595]",
    logo: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#8C1595" />
        <g transform="translate(10, 10) scale(0.8)">
          <path d="M10,40 L90,10 L60,90 L45,55 Z" fill="white" />
          <path d="M90,10 L45,55 L35,80 Z" fill="#E8E8E8" />
        </g>
      </svg>
    )
  },
  {
    id: "upay",
    name: "Upay",
    color: "bg-[#00529B]",
    logo: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="white" />
        <g transform="translate(15, 15) scale(0.7)">
          <circle cx="25" cy="10" r="12" fill="#FFC900" />
          <circle cx="75" cy="10" r="12" fill="#00529B" />
          <path d="M25 45 V 55 A 25 25 0 0 0 50 80" stroke="#FFC900" strokeWidth="24" strokeLinecap="butt" />
          <circle cx="25" cy="45" r="12" fill="#FFC900" />
          <path d="M75 45 V 55 A 25 25 0 0 1 50 80" stroke="#00529B" strokeWidth="24" strokeLinecap="butt" />
          <circle cx="75" cy="45" r="12" fill="#00529B" />
        </g>
      </svg>
    )
  }
];

export const CheckoutPage: React.FC = () => {
  const { planId, interval } = useParams<{ planId: string; interval: "month" | "year" }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  if (!planId || !interval || !PLANS[planId as keyof typeof PLANS]) {
    return <Navigate to="/subscription" />;
  }

  const planConfig = PLANS[planId as keyof typeof PLANS];
  const price = interval === "month" ? planConfig.monthly_usd : planConfig.yearly_usd;
  const bdtPrice = interval === "month" ? planConfig.monthly_bdt : planConfig.yearly_bdt;
  const planTitle = planId.charAt(0).toUpperCase() + planId.slice(1);
  const userId = profile?.uid || "guest";

  const handlePayment = async () => {
    if (!selectedMethod) return;
    
    if (selectedMethod !== "stripe") {
      setShowManualPayment(true);
      return;
    }

    setLoading(true);
    try {
      if (selectedMethod === "stripe") {
        const response = await fetch("/api/payment/stripe/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            planId, 
            interval,
            userId
          })
        });
        
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to initialize Stripe session");
        }

        const { sessionId } = data;
        const stripe = await getStripe();
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId });
        }
      }
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      const message = error.message || "Failed to connect to the server.";
      alert(`Payment Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualPaymentSubmit = async () => {
    if (!transactionId.trim() || !selectedMethod) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/payment/manual/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: userId,
          email: profile?.email || "guest",
          displayName: profile?.displayName || "Guest",
          method: selectedMethod,
          planId,
          interval,
          amount: bdtPrice,
          transactionId: transactionId.trim()
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setPaymentSubmitted(true);
    } catch (error) {
      console.error("Failed to submit manual payment:", error);
      alert("There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate("/subscription")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium"
        >
          <ChevronLeft size={20} />
          Back to Plans
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete your upgrade</h1>
            <p className="text-gray-500">You are upgrading to the <strong className="text-gray-900">{planTitle}</strong> plan ({interval}ly).</p>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Select Payment Method</h3>
            
            {/* Mobile Banking Options */}
            <div className="mb-8">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Mobile Banking (Bangladesh)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MFS_OPTIONS.map((mfs) => {
                  const Logo = mfs.logo;
                  const isSelected = selectedMethod === mfs.id;
                  const isOtherSelected = selectedMethod && selectedMethod !== mfs.id;
                  
                  return (
                    <button
                      key={mfs.id}
                      onClick={() => setSelectedMethod(mfs.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300",
                        isSelected ? "border-blue-600 bg-blue-50/50 shadow-md transform scale-105" : "border-gray-100 hover:border-gray-200",
                        isOtherSelected && !isSelected ? "opacity-40 grayscale" : "opacity-100"
                      )}
                    >
                      <Logo />
                      <span className={cn(
                        "mt-4 font-bold",
                        isSelected ? "text-blue-700" : "text-gray-700"
                      )}>{mfs.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* International Payment Option */}
            <div className="mb-8">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">International Cards</p>
              <button
                onClick={() => setSelectedMethod("stripe")}
                className={cn(
                  "w-full flex items-center p-6 rounded-2xl border-2 transition-all duration-300",
                  selectedMethod === "stripe" ? "border-blue-600 bg-blue-50/50 shadow-md" : "border-gray-100 hover:border-gray-200",
                  selectedMethod && selectedMethod !== "stripe" ? "opacity-40 grayscale" : "opacity-100"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl mr-4",
                  selectedMethod === "stripe" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                )}>
                  <Globe size={32} />
                </div>
                <div className="text-left flex-1">
                  <p className={cn(
                    "font-bold text-lg",
                    selectedMethod === "stripe" ? "text-blue-700" : "text-gray-700"
                  )}>Credit / Debit Card</p>
                  <p className="text-sm text-gray-500">Stripe: Visa, MasterCard, Apple Pay</p>
                </div>
              </button>
            </div>

            {/* Summary & Checkout */}
            <div className="bg-gray-50 p-6 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-sm text-gray-500 font-bold block mb-1">Total Amount Due</span>
                <span className="text-3xl font-black text-gray-900">
                  {selectedMethod === "stripe" ? `$${price}` : `৳${bdtPrice}`}
                </span>
                <span className="text-xs text-gray-500 ml-2 uppercase font-bold">{interval}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl">
                <CheckCircle2 size={16} />
                <span>Instant Activation</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !selectedMethod}
              className={cn(
                "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-lg",
                loading || !selectedMethod
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 hover:-translate-y-1"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Processing...
                </>
              ) : (
                <>Proceed to Pay {selectedMethod === "stripe" ? `$${price}` : `৳${bdtPrice}`}</>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-6 uppercase font-bold tracking-widest flex items-center justify-center gap-2">
              <CheckCircle2 size={12} /> Secure 256-bit SSL Encrypted Payment
            </p>
          </div>
        </div>
      </div>

      {/* Manual Payment Modal */}
      {showManualPayment && selectedMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const mfs = MFS_OPTIONS.find(m => m.id === selectedMethod);
                  const Logo = mfs?.logo;
                  return Logo ? <div className="scale-75 origin-left"><Logo /></div> : null;
                })()}
                <h3 className="text-xl font-bold text-gray-900 capitalize">{selectedMethod} Payment</h3>
              </div>
              <button 
                onClick={() => setShowManualPayment(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 text-center">
              <div className="mb-6 space-y-2">
                <p className="text-gray-700 font-medium">To get the subscription, please send money to this number:</p>
                <p className="text-gray-600 text-sm">সাবস্ক্রিপশন পেতে এই নম্বরে সেন্ড মানি করুন:</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 mb-8">
                <span className="text-3xl font-black text-blue-900 tracking-wider">+8801786961727</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText("+8801786961727");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100 transition-all"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy Number"}
                </button>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 text-left">
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">Amount to Send</p>
                  <p className="text-xs text-gray-400">Total amount for {interval}ly plan</p>
                </div>
                <div className="text-2xl font-black text-gray-900">৳{bdtPrice}</div>
              </div>

              {paymentSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-6 rounded-xl flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-lg">Request Submitted!</h4>
                  <p className="text-sm text-emerald-700">
                    Your transaction ID has been sent to the admin. Your subscription will be activated shortly upon verification.
                  </p>
                  <button
                    onClick={() => navigate("/subscription")}
                    className="mt-4 px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    Return to Plans
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8 text-left">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Transaction ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 9B6A2C1P0Z"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    />
                    <p className="text-xs text-gray-400 mt-2">Enter the transaction ID you received after sending the money.</p>
                  </div>

                  <button
                    onClick={handleManualPaymentSubmit}
                    disabled={isSubmitting || !transactionId.trim()}
                    className={cn(
                      "w-full font-bold flex items-center justify-center gap-2 py-4 rounded-xl transition-all shadow-lg",
                      isSubmitting || !transactionId.trim()
                        ? "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:-translate-y-0.5"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Sending...
                      </>
                    ) : (
                      "Send Request"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
