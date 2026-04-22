import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";

export const AccessPage: React.FC = () => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  // If the user already has access, redirect them to the dashboard
  const hasAccess = profile?.role === "admin" || profile?.isApproved || (profile?.subscription?.plan !== "free" && profile?.subscription?.active);
  if (hasAccess) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4", theme === 'dark' ? "bg-gray-900" : "bg-gray-50")}>
      <div className={cn(
        "max-w-md w-full p-8 rounded-3xl shadow-xl",
        theme === 'dark' ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"
      )}>
        <div className="flex justify-center mb-6">
          <div className={cn(
            "p-4 rounded-full",
            theme === 'dark' ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-600"
          )}>
            <Clock size={48} className="animate-pulse" />
          </div>
        </div>
        
        <h1 className={cn("text-2xl font-bold text-center mb-2", theme === 'dark' ? "text-white" : "text-gray-900")}>
          Account Pending Approval
        </h1>
        <p className={cn("text-center mb-8", theme === 'dark' ? "text-gray-400" : "text-gray-600")}>
          Your account is currently pending approval from the administrator. Once approved, you will have full access to all AI tools.
        </p>

        <div className="space-y-6">
          <div className={cn(
            "p-6 rounded-2xl border transition-all text-center",
            theme === 'dark' ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"
          )}>
            <ShieldCheck size={32} className="mx-auto mb-3 text-emerald-500" />
            <p className={cn("text-sm font-medium", theme === 'dark' ? "text-gray-300" : "text-gray-700")}>
              Please contact the administrator to expedite your request.
            </p>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          {/* Subscription Option */}
          <div className={cn(
            "p-5 rounded-2xl border-2 transition-all",
            theme === 'dark' ? "border-blue-900/50 bg-blue-900/10 hover:border-blue-700" : "border-blue-100 bg-blue-50/50 hover:border-blue-200"
          )}>
            <h3 className={cn("font-bold mb-1", theme === 'dark' ? "text-white" : "text-gray-900")}>Skip Approval</h3>
            <p className={cn("text-sm mb-4", theme === 'dark' ? "text-gray-400" : "text-gray-600")}>Get instant access by choosing a premium plan.</p>
            <Link to="/subscription" className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
              Subscribe Now <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


