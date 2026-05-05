import React from "react";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";
import { AlertOctagon, LogOut, Mail } from "lucide-react";
import { cn } from "../lib/utils";
import { Navigate } from "react-router-dom";

export const SuspendedPage: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();

  if (!user) {
    return <Navigate to="/" />;
  }

  // If unbanned while on this page, redirect to dashboard
  if (profile && !profile.isBlocked) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4",
      theme === 'dark' ? "bg-gray-900" : "bg-gray-50"
    )}>
      <div className={cn(
        "max-w-md w-full p-8 rounded-3xl shadow-2xl border text-center",
        theme === 'dark' ? "bg-gray-800 border-red-900/30" : "bg-white border-red-100"
      )}>
        <div className="flex justify-center mb-6">
          <div className={cn(
            "p-4 rounded-full",
            theme === 'dark' ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"
          )}>
            <AlertOctagon size={64} strokeWidth={1.5} />
          </div>
        </div>

        <h1 className={cn(
          "text-3xl font-bold mb-4",
          theme === 'dark' ? "text-white" : "text-gray-900"
        )}>
          Account Suspended
        </h1>
        
        <p className={cn(
          "text-lg mb-8",
          theme === 'dark' ? "text-gray-400" : "text-gray-600"
        )}>
          Your account has been suspended by the administrator due to a violation of our terms of service or suspicious activity.
        </p>

        <div className="space-y-4">
          <div className={cn(
            "p-6 rounded-2xl border flex items-center gap-4 text-left",
            theme === 'dark' ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"
          )}>
            <Mail className="text-blue-500" size={24} />
            <div>
              <p className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>Contact Support</p>
              <p className="text-xs text-gray-500">mdasifikbal2050@gmail.com</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-500 italic">
          If you believe this is a mistake, please reach out to our support team.
        </p>
      </div>
    </div>
  );
};
