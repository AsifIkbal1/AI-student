import React, { useState } from "react";
import {
  PenTool, Loader2, Copy, CheckCircle2, Sparkles,
  ShieldCheck, Bot, RefreshCw, AlertTriangle, ChevronDown, ChevronUp, Zap
} from "lucide-react";
import { generateTutorResponse, analyzeEssay, logUsage, handleAIError } from "../lib/ai";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./AuthContext";

// ── Circular Gauge ──────────────────────────────────────────────────────────
const CircularGauge: React.FC<{
  value: number;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  description: string;
}> = ({ value, label, color, bgColor, icon, description }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`flex flex-col items-center p-5 rounded-2xl ${bgColor} border`}>
      <div className="relative w-24 h-24 mb-3">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <motion.circle
            cx="48" cy="48" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-gray-800">{value}%</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-sm font-bold text-gray-700">{label}</span>
      </div>
      <p className="text-xs text-gray-500 text-center">{description}</p>
    </div>
  );
};

// ── Score Badge ─────────────────────────────────────────────────────────────
const getRiskLevel = (score: number, invert = false) => {
  const s = invert ? 100 - score : score;
  if (s >= 70) return { label: "High Risk", color: "text-red-600", bg: "bg-red-50 border-red-200" };
  if (s >= 40) return { label: "Medium", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
  return { label: "Low Risk", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
};

// ── Main Component ──────────────────────────────────────────────────────────
export const AIEssayWriter: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("Argumentative");
  const [outline, setOutline] = useState("");
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    plagiarismScore: number;
    aiScore: number;
    originalityScore: number;
    plagiarismDetails: string;
    aiDetails: string;
    suggestions: { original: string; rewrite: string; reason: string }[];
  } | null>(null);
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);

  const handleGenerateOutline = async () => {
    if (!topic.trim() || loading) return;
    if (profile && profile.role !== "admin" && profile.credits < 2) {
      setError("Error: You need at least 2 credits to generate an outline.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { text, usage } = await generateTutorResponse(
        `Generate a detailed outline for a ${type} essay on the topic: ${topic}. Include introduction, body paragraphs with key points, and conclusion.`
      );
      setOutline(text || "");
      setAnalysis(null);
      if (profile) {
        await deductCredits(2);
        await logUsage(profile.uid, "AIEssayWriter_Outline", usage);
      }
    } catch (err) {
      setError(handleAIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEssay = async () => {
    if (!topic.trim() || loading) return;
    if (profile && profile.role !== "admin" && profile.credits < 5) {
      setError("Error: You need at least 5 credits to generate a full essay.");
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const { text, usage } = await generateTutorResponse(
        `Write a full ${type} essay on the topic: ${topic}. Use the following outline if provided: ${outline}. Ensure academic tone, proper structure, and clear arguments.`
      );
      setEssay(text || "");
      if (profile) {
        await deductCredits(5);
        await logUsage(profile.uid, "AIEssayWriter_Full", usage);
      }
    } catch (err) {
      setError(handleAIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeEssay = async () => {
    const textToAnalyze = essay || outline;
    if (!textToAnalyze.trim() || analyzing) return;
    if (profile && profile.role !== "admin" && profile.credits < 5) {
      setError("Error: You need at least 5 credits to analyze the essay.");
      return;
    }
    setAnalyzing(true);
    setError(null);
    try {
      const { data, usage } = await analyzeEssay(textToAnalyze);
      setAnalysis(data);
      if (profile) {
        await deductCredits(5);
        await logUsage(profile.uid, "AIEssayWriter_Analysis", usage);
      }
    } catch (err) {
      setError(handleAIError(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Essay Writer</h1>
        <p className="text-gray-500 mt-1">Generate outlines, full drafts, and analyze for plagiarism & AI content</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Panel ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Essay Topic</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your essay topic or prompt..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-32 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Essay Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option>Argumentative</option>
                <option>Persuasive</option>
                <option>Expository</option>
                <option>Narrative</option>
                <option>Descriptive</option>
              </select>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex gap-2 items-start">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleGenerateOutline}
                disabled={loading || !topic.trim()}
                className="w-full bg-white text-blue-600 border-2 border-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <PenTool size={20} />}
                Generate Outline
              </button>
              <button
                onClick={handleGenerateEssay}
                disabled={loading || !topic.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Generate Full Essay
              </button>

              {/* Analyze Button — only show if there's an essay or outline */}
              {(essay || outline) && (
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleAnalyzeEssay}
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-violet-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-violet-200"
                >
                  {analyzing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                  {analyzing ? "Analyzing..." : "Analyze Essay"}
                </motion.button>
              )}
            </div>
          </div>

          {/* Credits info */}
          <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100 rounded-2xl p-4 text-sm text-gray-600 space-y-1">
            <p className="font-bold text-gray-700 mb-2">💳 Credit Cost</p>
            <p>📝 Outline → <strong>2 credits</strong></p>
            <p>✍️ Full Essay → <strong>5 credits</strong></p>
            <p>🔍 Analysis → <strong>5 credits</strong></p>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Loading */}
          {(loading || analyzing) && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-40" />
              </div>
              <p className="text-blue-600 font-semibold">
                {analyzing ? "Analyzing for plagiarism & AI content..." : "AI is crafting your content..."}
              </p>
            </div>
          )}

          {/* Analysis Results */}
          <AnimatePresence>
            {analysis && !analyzing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap size={22} />
                    Essay Analysis Report
                  </h3>
                  <p className="text-violet-200 text-sm mt-1">Plagiarism, AI Detection & Rewrite Suggestions</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Gauges */}
                  <div className="grid grid-cols-3 gap-4">
                    <CircularGauge
                      value={analysis.plagiarismScore}
                      label="Plagiarism"
                      color={analysis.plagiarismScore >= 70 ? "#ef4444" : analysis.plagiarismScore >= 40 ? "#f59e0b" : "#10b981"}
                      bgColor={analysis.plagiarismScore >= 70 ? "bg-red-50 border-red-100" : analysis.plagiarismScore >= 40 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"}
                      icon={<ShieldCheck size={14} className={analysis.plagiarismScore >= 70 ? "text-red-500" : analysis.plagiarismScore >= 40 ? "text-amber-500" : "text-emerald-500"} />}
                      description={analysis.plagiarismDetails}
                    />
                    <CircularGauge
                      value={analysis.aiScore}
                      label="AI-Generated"
                      color={analysis.aiScore >= 70 ? "#8b5cf6" : analysis.aiScore >= 40 ? "#f59e0b" : "#10b981"}
                      bgColor={analysis.aiScore >= 70 ? "bg-violet-50 border-violet-100" : analysis.aiScore >= 40 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"}
                      icon={<Bot size={14} className={analysis.aiScore >= 70 ? "text-violet-500" : analysis.aiScore >= 40 ? "text-amber-500" : "text-emerald-500"} />}
                      description={analysis.aiDetails}
                    />
                    <CircularGauge
                      value={analysis.originalityScore}
                      label="Originality"
                      color={analysis.originalityScore >= 70 ? "#10b981" : analysis.originalityScore >= 40 ? "#f59e0b" : "#ef4444"}
                      bgColor={analysis.originalityScore >= 70 ? "bg-emerald-50 border-emerald-100" : analysis.originalityScore >= 40 ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"}
                      icon={<Sparkles size={14} className={analysis.originalityScore >= 70 ? "text-emerald-500" : analysis.originalityScore >= 40 ? "text-amber-500" : "text-red-500"} />}
                      description="Overall originality of the writing"
                    />
                  </div>

                  {/* Rewrite Suggestions */}
                  {analysis.suggestions && analysis.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <RefreshCw size={16} className="text-violet-600" />
                        Rewrite Suggestions
                        <span className="ml-1 text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-semibold">
                          {analysis.suggestions.length}
                        </span>
                      </h4>
                      <div className="space-y-3">
                        {analysis.suggestions.map((s, i) => (
                          <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                            <button
                              onClick={() => setExpandedSuggestion(expandedSuggestion === i ? null : i)}
                              className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-violet-600 mb-1">Suggestion #{i + 1}</p>
                                <p className="text-sm text-gray-600 line-clamp-2 italic">"{s.original}"</p>
                              </div>
                              {expandedSuggestion === i
                                ? <ChevronUp size={18} className="text-gray-400 shrink-0 mt-0.5" />
                                : <ChevronDown size={18} className="text-gray-400 shrink-0 mt-0.5" />
                              }
                            </button>

                            <AnimatePresence>
                              {expandedSuggestion === i && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                                      <p className="text-xs font-bold text-red-500 mb-1">⚠ Original (suspicious)</p>
                                      <p className="text-sm text-gray-700 italic">"{s.original}"</p>
                                    </div>
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                                      <div className="flex justify-between items-start mb-1">
                                        <p className="text-xs font-bold text-emerald-600">✓ Suggested Rewrite</p>
                                        <button
                                          onClick={() => copyToClipboard(s.rewrite, `rewrite-${i}`)}
                                          className="text-gray-400 hover:text-emerald-600 transition-colors"
                                        >
                                          {copied === `rewrite-${i}` ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        </button>
                                      </div>
                                      <p className="text-sm text-gray-700">"{s.rewrite}"</p>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                      <p className="text-xs font-bold text-blue-500 mb-1">💡 Why?</p>
                                      <p className="text-sm text-gray-600">{s.reason}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Outline */}
          {outline && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Essay Outline</h3>
                <button
                  onClick={() => copyToClipboard(outline, "outline")}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {copied === "outline" ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Copy size={20} />}
                </button>
              </div>
              <div className="prose prose-blue max-w-none">
                <ReactMarkdown>{outline}</ReactMarkdown>
              </div>
            </motion.div>
          )}

          {/* Full Essay */}
          {essay && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Full Draft</h3>
                <button
                  onClick={() => copyToClipboard(essay, "essay")}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {copied === "essay" ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Copy size={20} />}
                </button>
              </div>
              <div className="prose prose-blue max-w-none">
                <ReactMarkdown>{essay}</ReactMarkdown>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!outline && !essay && !loading && !analyzing && (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-20">
              <div className="bg-gray-50 p-8 rounded-full mb-6">
                <PenTool size={64} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to write?</h3>
              <p className="max-w-xs text-gray-500">Enter a topic, generate your essay, then click <strong className="text-violet-600">Analyze Essay</strong> to check for plagiarism & AI content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
