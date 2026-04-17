import React, { useState } from "react";
import { Video, Loader2, Youtube, Sparkles, Play, Copy, CheckCircle2 } from "lucide-react";
import { summarizeVideo, logUsage, handleAIError } from "../lib/ai";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { useAuth } from "./AuthContext";

export const AIVideoSummarizer: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!url.trim() || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 3) {
      setSummary("Error: You need at least 3 credits to summarize a video. Please upgrade your plan.");
      return;
    }

    setLoading(true);
    try {
      const { text, usage } = await summarizeVideo(url);
      setSummary(text || "");
      if (profile) {
        await deductCredits(3);
        await logUsage(profile.uid, "AIVideoSummarizer", usage);
      }
    } catch (error) {
      setSummary(handleAIError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Video Summarizer</h1>
        <p className="text-gray-500">Get key insights from YouTube videos in seconds</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600" size={24} />
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube video URL here..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
            />
          </div>
          <button 
            onClick={handleSummarize}
            disabled={loading || !url.trim()}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
            Summarize
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Watching video...</h3>
          <p className="text-gray-500">AI is extracting key insights for you.</p>
        </div>
      ) : summary ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="bg-red-50 p-2 rounded-lg">
              <Play className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Video Insights</h3>
            <div className="flex-1" />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(summary);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="Copy Summary"
            >
              {copied ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Copy size={24} />}
            </button>
          </div>
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </motion.div>
      ) : (
        <div className="bg-gray-50 p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center text-gray-400">
          <Video size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Enter a video URL to see the summary</p>
        </div>
      )}
    </div>
  );
};
