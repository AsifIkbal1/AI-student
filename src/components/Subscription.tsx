import React from "react";
import { Check, Zap, Star, Crown } from "lucide-react";
import { useAuth } from "./AuthContext";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { PLANS } from "../lib/payments/config";

export const Subscription: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = React.useState<"month" | "year">("month");

  const plans = [
    {
      title: "Free",
      id: "free",
      prices: { month: "0", year: "0" },
      icon: Zap,
      color: "bg-gray-400",
      features: [
        "Refer & Earn Program",
        "NeuroTest AI Access",
        "Basic AI Support"
      ],
      current: profile?.subscription?.plan === "free" || !profile?.subscription?.plan
    },
    {
      title: "Pro",
      id: "pro",
      prices: { month: PLANS.pro.monthly_bdt, year: PLANS.pro.yearly_bdt },
      usdPrices: { month: PLANS.pro.monthly_usd, year: PLANS.pro.yearly_usd },
      icon: Star,
      color: "bg-blue-600",
      features: [
        "Everything in Free",
        "AI Tutor (Unlimited)",
        "Smart Notes & Flashcards",
        "AI Quiz Generator",
        "Standard Academic Tools",
        "5,000 Credits/Month"
      ],
      current: profile?.subscription?.plan === "pro"
    },
    {
      title: "Premium",
      id: "premium",
      prices: { month: PLANS.premium.monthly_bdt, year: PLANS.premium.yearly_bdt },
      usdPrices: { month: PLANS.premium.monthly_usd, year: PLANS.premium.yearly_usd },
      icon: Crown,
      color: "bg-purple-600",
      popular: true,
      features: [
        "Everything in Pro",
        "Cortex Studio AI Agent Builder",
        "AI Slide Generator",
        "AI Diagram Generator",
        "Doubt Solver (Vision AI)",
        "15,000 Credits/Month",
        "24/7 Priority Support"
      ],
      current: profile?.subscription?.plan === "premium"
    }
  ];

  const handleUpgrade = (plan: any) => {
    navigate(`/checkout/${plan.id}/${billingInterval}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Simple, transparent pricing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 font-medium">Choose the perfect plan to supercharge your academic journey with AI.</p>
        
        <div className="flex items-center justify-center gap-4 bg-gray-100 p-1.5 rounded-2xl w-fit mx-auto border border-gray-200">
          <button
            onClick={() => setBillingInterval("month")}
            className={cn(
              "px-8 py-2.5 rounded-xl text-sm font-bold transition-all",
              billingInterval === "month" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("year")}
            className={cn(
              "px-8 py-2.5 rounded-xl text-sm font-bold transition-all",
              billingInterval === "year" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Yearly <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full ml-1">Save 15%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PlanCard 
            key={plan.title} 
            {...plan} 
            price={plan.prices[billingInterval]} 
            usdPrice={plan.usdPrices?.[billingInterval]}
            interval={billingInterval}
            onUpgrade={() => handleUpgrade(plan)}
          />
        ))}
      </div>
    </div>
  );
};

const PlanCard = ({ title, price, usdPrice, interval, features, icon: Icon, color, current, popular, onUpgrade }: any) => (
  <div className={cn(
    "bg-white p-8 rounded-[2.5rem] border transition-all flex flex-col relative",
    current ? "border-blue-600 ring-8 ring-blue-50 shadow-2xl" : "border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200",
    popular && !current && "border-purple-200"
  )}>
    {popular && !current && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
        Most Popular
      </div>
    )}
    
    <div className={`p-4 rounded-2xl w-fit mb-8 ${color} shadow-lg`}>
      <Icon className="text-white" size={28} />
    </div>
    
    <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
    
    <div className="mb-8">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black text-gray-900">৳{price}</span>
        <span className="text-gray-500 font-bold text-sm">/{interval === 'month' ? 'mo' : 'yr'}</span>
      </div>
      {usdPrice && (
        <p className="text-gray-400 text-sm font-bold mt-1">Approx. ${usdPrice} USD</p>
      )}
    </div>

    <ul className="space-y-4 mb-10 flex-1">
      {features.map((feature: string, idx: number) => (
        <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
          <div className="bg-emerald-50 p-1 rounded-full mt-0.5">
            <Check className="text-emerald-600" size={14} />
          </div>
          {feature}
        </li>
      ))}
    </ul>

    <button 
      onClick={onUpgrade}
      disabled={current}
      className={cn(
        "w-full py-4 rounded-2xl font-black text-lg transition-all transform hover:-translate-y-1 active:translate-y-0",
        current 
          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
          : title === "Premium"
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-200"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200"
      )}
    >
      {current ? "Active Plan" : title === "Free" ? "Get Started" : "Upgrade Now"}
    </button>
  </div>
);
