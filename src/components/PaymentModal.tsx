import React, { useState } from "react";
import { X, CreditCard, Globe, CreditCard as LocalCard, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { PLANS, getStripe } from "../lib/payments/config";

interface PaymentModalProps {
  plan: any;
  interval: "month" | "year";
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, interval, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<"stripe" | "sslcommerz">("stripe");

  const price = plan.prices[interval];
  const bdtPrice = interval === "month" ? PLANS[plan.id as keyof typeof PLANS]?.monthly_bdt : PLANS[plan.id as keyof typeof PLANS]?.yearly_bdt;

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (method === "stripe") {
        const response = await fetch("/api/payment/stripe/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            planId: plan.id, 
            interval,
            userId: plan.userId
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
      } else {
        const response = await fetch("/api/payment/sslcommerz/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            planId: plan.id, 
            interval,
            userId: plan.userId
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to initialize SSLCommerz payment");
        }

        const { GatewayPageURL } = data;
        window.location.href = GatewayPageURL;
      }


    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      const message = error.message || "Failed to connect to the server.";
      alert(`Payment Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to {plan.title}</h2>
          <p className="text-gray-500 mb-8 font-medium">Choose your preferred payment method</p>

          <div className="space-y-4 mb-8">
            {/* Stripe Option */}
            <button
              onClick={() => setMethod("stripe")}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left",
                method === "stripe" ? "border-blue-600 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  method === "stripe" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                )}>
                  <Globe size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">International Payment</p>
                  <p className="text-xs text-gray-500">Stripe: Visa, MasterCard, Apple Pay</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">${price}</p>
                <p className="text-[10px] text-gray-400 uppercase font-black">{interval}</p>
              </div>
            </button>

            {/* SSLCommerz Option */}
            <button
              onClick={() => setMethod("sslcommerz")}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left",
                method === "sslcommerz" ? "border-blue-600 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  method === "sslcommerz" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                )}>
                  <LocalCard size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Bangladesh Local Payment</p>
                  <p className="text-xs text-gray-500">bKash, Nagad, Rocket, Local Cards</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">৳{bdtPrice}</p>
                <p className="text-[10px] text-gray-400 uppercase font-black">{interval}</p>
              </div>
            </button>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 font-bold">Total Amount</span>
              <span className="text-xl font-black text-gray-900">
                {method === "stripe" ? `$${price}` : `৳${bdtPrice}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
              <CheckCircle2 size={14} />
              <span>Instant activation after payment</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className={cn(
              "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
              loading 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>Proceed to Payment</>
            )}
          </button>
          
          <p className="text-center text-[10px] text-gray-400 mt-6 uppercase font-bold tracking-widest">
            Secure 256-bit SSL Encrypted Payment
          </p>
        </div>
      </div>
    </div>
  );
};
