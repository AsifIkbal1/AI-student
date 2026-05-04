import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, Users, Coins, Share2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { cn } from '../lib/utils';

export const ReferralPage: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<{ referralCode: string, earnings: number, totalReferred: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      fetchReferralStats();
    }
  }, [profile?.uid]);

  const fetchReferralStats = async () => {
    try {
      const res = await fetch(`/api/referrals/stats?uid=${profile?.uid}`);
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch referral stats:", err);
    }
  };

  const referralLink = stats ? `${window.location.origin}/?ref=${stats.referralCode}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join AI Students',
        text: 'Sign up for AI Students using my link and supercharge your studies!',
        url: referralLink,
      }).catch(console.error);
    } else {
      handleCopy();
    }
  };

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-xl">
            <Gift className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Refer & Earn</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Invite your friends and earn Free Premium Days when they upgrade.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl">
            <Users className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Referred Friends</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalReferred}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl">
            <Coins className="text-emerald-600 dark:text-emerald-400" size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Bonus Premium Days</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.earnings * 7} Days</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <Gift size={48} className="mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Share Your Unique Link</h2>
          <p className="text-blue-100 mb-8">
            When a friend signs up using your link and purchases a premium plan, you both get a reward! 
            You will automatically earn 7 extra days of Premium subscription for free.
          </p>

          <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 flex flex-col md:flex-row items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={referralLink}
              className="w-full bg-transparent text-white font-mono text-sm px-4 py-3 outline-none"
            />
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={handleCopy}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center justify-center bg-blue-800 text-white p-3 rounded-xl hover:bg-blue-900 transition-colors"
                title="Share"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
