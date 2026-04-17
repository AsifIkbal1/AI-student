import React, { useState } from "react";
import { Compass, Loader2, Search, Copy, CheckCircle2, Download, Map } from "lucide-react";
import { generateCareerRoadmap, logUsage, handleAIError } from "../lib/ai";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { useAuth } from "./AuthContext";

export const CareerRoadmapGenerator: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const [subject, setSubject] = useState("");
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!subject.trim() || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 5) {
      setRoadmap("Error: You need at least 5 credits to generate a career roadmap. Please upgrade your plan.");
      return;
    }

    setLoading(true);
    try {
      const { text, usage } = await generateCareerRoadmap(subject);
      setRoadmap(text || "");
      if (profile) {
        await deductCredits(5);
        await logUsage(profile.uid, "CareerRoadmapGenerator", usage);
      }
    } catch (error) {
      setRoadmap(handleAIError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Compass className="text-indigo-600" />
          Career Roadmap Generator
        </h1>
        <p className="text-gray-500">Discover your path and plan your future with AI-powered career roadmaps</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-4">Field of Study / Interest</label>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Computer Science, Biology..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !subject.trim()}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-200"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Map size={24} />}
              Generate Roadmap
            </button>
          </div>

          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
            <h3 className="text-indigo-900 font-bold mb-2">Pro Tip 💡</h3>
            <p className="text-indigo-700 text-sm leading-relaxed">
              Be specific about your interests! Instead of just "Art", try "Digital Illustration" or "UI/UX Design" for more tailored results.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">Your Personalized Roadmap</span>
            <div className="flex gap-2">
              {roadmap && (
                <>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(roadmap);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors bg-white rounded-lg border border-gray-200"
                    title="Copy to clipboard"
                  >
                    {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                  <button 
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors bg-white rounded-lg border border-gray-200"
                    title="Download as PDF"
                    onClick={() => window.print()}
                  >
                    <Download size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar prose prose-indigo max-w-none">
            {!roadmap && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                <div className="bg-gray-50 p-6 rounded-full">
                  <Compass size={48} />
                </div>
                <p className="max-w-xs italic">Enter your field of study and click generate to see your career path.</p>
              </div>
            )}
            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <p className="text-indigo-600 font-semibold text-lg">Charting your future...</p>
                <p className="text-gray-400 text-sm italic">Analyzing market trends and required skills...</p>
              </div>
            )}
            {roadmap && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ReactMarkdown>{roadmap}</ReactMarkdown>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
