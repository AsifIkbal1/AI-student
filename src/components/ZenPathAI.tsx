import React, { useState } from "react";
import { Leaf, Loader2, Target, Brain, ArrowRight, CheckCircle2, Copy, Sparkles, Compass } from "lucide-react";
import { analyzeSkillGap, logUsage, handleAIError } from "../lib/ai";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export const ZenPathAI: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const [career, setCareer] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!career.trim() || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 3) {
      setAnalysis("Error: You need at least 3 credits to analyze your skill gap. Please upgrade your plan.");
      return;
    }

    setLoading(true);
    try {
      const { text, usage } = await analyzeSkillGap(career, currentSkills);
      setAnalysis(text || "");
      if (profile) {
        await deductCredits(3);
        await logUsage(profile.uid, "ZenPathAI-SkillGap", usage);
      }
    } catch (error) {
      setAnalysis(handleAIError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold mb-4"
        >
          <Leaf size={16} />
          ZenPath AI: Simple, Focused, Smart
        </motion.div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Path to Career Mastery</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          A minimalist, career-oriented workspace for university students. Identify gaps, build roadmaps, and study smarter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <Link to="/career-roadmap" className="group">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col items-center text-center">
            <div className="bg-indigo-50 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <Compass className="text-indigo-600" size={32} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Roadmap Generator</h3>
            <p className="text-sm text-gray-500">Subject to career path mapping with step-by-step guidance.</p>
          </div>
        </Link>
        <Link to="/smart-study" className="group">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col items-center text-center">
            <div className="bg-blue-50 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="text-blue-600" size={32} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Study Automation</h3>
            <p className="text-sm text-gray-500">Turn any input into a complete study system instantly.</p>
          </div>
        </Link>
        <div className="bg-emerald-600 p-6 rounded-3xl shadow-lg shadow-emerald-100 flex flex-col items-center text-center text-white">
          <div className="bg-white/20 p-4 rounded-2xl mb-4">
            <Target className="text-white" size={32} />
          </div>
          <h3 className="font-bold mb-2">Skill Gap Analyzer</h3>
          <p className="text-sm text-emerald-50 opacity-90">Identify exactly what you're missing for your dream job.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Brain className="text-emerald-600" />
              Analyze Your Skill Gap
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Career</label>
                <input
                  type="text"
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  placeholder="e.g., Full Stack Developer, Data Analyst..."
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Skills (Optional)</label>
                <textarea
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  placeholder="List your current skills, tools, or certifications..."
                  className="w-full h-32 px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 resize-none transition-all"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || !career.trim()}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-100"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Target size={24} />}
                Analyze Skills
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4">Why ZenPath?</h4>
            <ul className="space-y-3">
              {[
                "Focused on University Students",
                "Simple, distraction-free UX",
                "Career-oriented learning paths",
                "Smart automation for study efficiency"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="bg-emerald-100 p-1 rounded-full">
                    <CheckCircle2 className="text-emerald-600" size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-700">Gap Analysis Report</span>
            {analysis && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(analysis);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-gray-400 hover:text-emerald-600 transition-colors"
              >
                {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
            )}
          </div>
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar prose prose-emerald max-w-none">
            {!analysis && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                <div className="bg-gray-50 p-6 rounded-full">
                  <Target size={48} />
                </div>
                <p className="max-w-xs italic">Enter your target career to see what skills you need to bridge the gap.</p>
              </div>
            )}
            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
                <p className="text-emerald-600 font-semibold">Identifying skill gaps...</p>
              </div>
            )}
            {analysis && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
