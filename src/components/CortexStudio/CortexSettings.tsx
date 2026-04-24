import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Mail, 
  Shield, 
  Server, 
  User, 
  Key, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { cn } from "../../lib/utils";

export const CortexSettings: React.FC = () => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: ""
  });

  useEffect(() => {
    fetchSettings();
  }, [profile]);

  const fetchSettings = async () => {
    if (!profile) return;
    try {
      const res = await fetch(`/api/cortex/settings?userId=${profile.uid}`);
      const data = await res.json();
      if (data.smtpHost) setFormData(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cortex/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: profile.uid })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: "SMTP Settings saved successfully!" });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-8 rounded-3xl border",
          theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-sm"
        )}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <Mail size={24} />
          </div>
          <div>
            <h2 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>Email (SMTP) Configuration</h2>
            <p className="text-xs text-gray-500 font-medium">Configure your own email server to allow agents to send emails.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Server size={14} /> SMTP Host
              </label>
              <input 
                required
                value={formData.smtpHost}
                onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                placeholder="smtp.gmail.com"
                className={cn(
                  "w-full px-4 py-3 rounded-xl outline-none border transition-all",
                  theme === 'dark' ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-100 focus:border-indigo-500"
                )}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Settings size={14} /> SMTP Port
              </label>
              <input 
                required
                value={formData.smtpPort}
                onChange={(e) => setFormData({ ...formData, smtpPort: e.target.value })}
                placeholder="587 or 465"
                className={cn(
                  "w-full px-4 py-3 rounded-xl outline-none border transition-all",
                  theme === 'dark' ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-100 focus:border-indigo-500"
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <User size={14} /> SMTP User / Email
            </label>
            <input 
              required
              type="email"
              value={formData.smtpUser}
              onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
              placeholder="your-email@gmail.com"
              className={cn(
                "w-full px-4 py-3 rounded-xl outline-none border transition-all",
                theme === 'dark' ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-100 focus:border-indigo-500"
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Key size={14} /> SMTP Password / App Password
            </label>
            <input 
              required
              type="password"
              value={formData.smtpPass}
              onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })}
              placeholder="••••••••••••••••"
              className={cn(
                "w-full px-4 py-3 rounded-xl outline-none border transition-all",
                theme === 'dark' ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-100 focus:border-indigo-500"
              )}
            />
            <p className="text-[10px] text-gray-500 font-medium">
              * For Gmail, use an "App Password" from your Google Account settings.
            </p>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-4 rounded-2xl flex items-center gap-3 text-sm font-bold",
                message.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
              )}
            >
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </motion.div>
          )}

          <div className="pt-4">
            <button
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              Save Email Credentials
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
