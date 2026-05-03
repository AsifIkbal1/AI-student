import React from "react";
import { Check, Zap, Star, Crown } from "lucide-react";
import { useAuth } from "./AuthContext";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

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
        "Basic AI Tutor access",
        "Standard Note Maker",
        "Community Support"
      ],
      current: profile?.subscription.plan === "free"
    },
    {
      title: "Pro",
      id: "pro",
      prices: { month: "9.99", year: "99.99" },
      icon: Star,
      color: "bg-blue-600",
      features: [
        "Priority AI Tutor access",
        "Advanced Note Maker",
        "Quiz & Test Generator",
        "Essay Writer (Drafts)",
        "Email Support"
      ],
      current: profile?.subscription.plan === "pro"
    },
    {
      title: "Premium",
      id: "premium",
      prices: { month: "19.99", year: "199.99" },
      icon: Crown,
      color: "bg-purple-600",
      features: [
        "All AI Tools included",
        "Doubt Solver (Image Input)",
        "Video Summarizer",
        "Career & College Guide",
        "24/7 Priority Support"
      ],
      current: profile?.subscription.plan === "premium"
    }
  ];

  const handleUpgrade = (plan: any) => {
    navigate(`/checkout/${plan.id}/${billingInterval}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose your learning path</h1>
        <p className="text-gray-500 max-w-xl mx-auto mb-8">Upgrade to unlock more powerful AI features and accelerate your academic success.</p>
        
        {/* Interval Toggle */}
        <div className="flex items-center justify-center gap-4 bg-gray-100 p-1.5 rounded-2xl w-fit mx-auto">
          <button
            onClick={() => setBillingInterval("month")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              billingInterval === "month" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("year")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              billingInterval === "year" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Yearly <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full ml-1">Save 15%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PlanCard 
            key={plan.title} 
            {...plan} 
            price={plan.prices[billingInterval]} 
            interval={billingInterval}
            onUpgrade={() => handleUpgrade(plan)}
          />
        ))}
      </div>

      <div className="mt-16 bg-blue-50 p-8 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">Need a custom plan for your school?</h3>
          <p className="text-blue-700">We offer special pricing for educational institutions and large groups.</p>
        </div>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all whitespace-nowrap">
          Contact Sales
        </button>
      </div>
    </div>
  );
};

const PlanCard = ({ title, price, interval, features, icon: Icon, color, current, onUpgrade }: any) => (
  <div className={cn(
    "bg-white p-8 rounded-3xl border transition-all flex flex-col",
    current ? "border-blue-600 ring-4 ring-blue-50 shadow-xl" : "border-gray-100 shadow-sm hover:shadow-md"
  )}>
    <div className={`p-3 rounded-xl w-fit mb-6 ${color}`}>
      <Icon className="text-white" size={24} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
    <div className="flex items-baseline gap-1 mb-6">
      <span className="text-3xl font-black text-gray-900">${price}</span>
      <span className="text-gray-500 text-sm">/{interval === 'month' ? 'month' : 'year'}</span>
    </div>
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feature: string, idx: number) => (
        <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
          <div className="bg-emerald-50 p-1 rounded-full">
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
        "w-full py-3 rounded-xl font-bold transition-all",
        current 
          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
      )}
    >
      {current ? "Current Plan" : "Upgrade Now"}
    </button>
  </div>
);


