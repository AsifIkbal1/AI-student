import React, { useState } from "react";
import { Calendar, Loader2, Clock, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { generateStudyPlan, logUsage, handleAIError } from "../lib/ai";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { useAuth } from "./AuthContext";

export const AIStudyPlanner: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("1 week");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 3) {
      setError("Error: You need at least 3 credits to generate a study plan. Please upgrade your plan.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { text, usage } = await generateStudyPlan(topic, duration);
      setPlan(text || "");
      if (profile) {
        await deductCredits(3);
        await logUsage(profile.uid, "AIStudyPlanner", usage);
      }
    } catch (error) {
      setError(handleAIError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Study Planner</h1>
        <p className="text-gray-500">Generate a personalized study schedule in seconds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">What are you studying?</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Organic Chemistry for Finals"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-32 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option>3 days</option>
                  <option>1 week</option>
                  <option>2 weeks</option>
                  <option>1 month</option>
                </select>
              </div>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Calendar size={24} />}
                Generate Study Plan
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {plan ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
            >
              <div className="prose prose-blue max-w-none">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="bg-gray-50 p-8 rounded-full mb-6">
                <Clock size={64} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Plan your success</h3>
              <p className="max-w-xs">Tell us what you're studying and we'll create a custom roadmap for you.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-blue-600 font-semibold">Creating your personalized plan...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
