import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer
} from "recharts";
import { Brain, Sparkles, TrendingUp, History, Loader2 } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import { cn } from "../../lib/utils";
import ReactMarkdown from "react-markdown";

export const Analytics: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [user]);

  const fetchResults = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/neurotest/get-results?userId=${user.uid}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAIAnalysis = async () => {
    if (results.length === 0) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/neurotest/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: results.slice(0, 10) })
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Failed to get AI analysis:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const testTypes = [
    { key: "reaction-time", label: "Speed" },
    { key: "sequence-memory", label: "Memory" },
    { key: "aim-trainer", label: "Precision" },
    { key: "number-memory", label: "Logic" },
    { key: "verbal-memory", label: "Verbal" },
    { key: "visual-memory", label: "Visual" },
    { key: "typing-speed", label: "Motor" }
  ];

  const radarData = testTypes.map(type => {
    const scores = results.filter(r => r.testType === type.key).map(r => r.score);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    let normalized = avg;
    if (type.key === "reaction-time") normalized = Math.max(0, 100 - (avg / 10));
    else if (type.key === "aim-trainer") normalized = Math.max(0, 100 - (avg / 10));
    else normalized = Math.min(100, avg * 10);
    return { subject: type.label, A: normalized, fullMark: 100 };
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="animate-spin text-blue-500" size={48} />
      <p className="font-bold text-gray-500 uppercase tracking-widest">Loading NeuroData...</p>
    </div>
  );

  if (results.length === 0) return (
    <div className={cn("flex flex-col items-center justify-center min-h-[400px] p-12 rounded-[3rem] border-2 border-dashed", theme === 'dark' ? "border-gray-800 bg-gray-900/40" : "border-gray-200 bg-gray-50/50")}>
      <Brain className="text-gray-300 mb-6" size={80} />
      <h3 className="text-2xl font-black mb-2">No Data Yet</h3>
      <p className="text-center max-w-sm font-medium mb-8">Complete a few tests to see your performance analytics.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cn("p-8 rounded-[2.5rem] border shadow-xl", theme === 'dark' ? "bg-gray-800/40 border-gray-700" : "bg-white border-white")}>
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp size={24} className="text-blue-500" />
            <h3 className="text-xl font-black">Cognitive Profile</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke={theme === 'dark' ? "#374151" : "#e5e7eb"} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? "#9ca3af" : "#4b5563", fontSize: 12, fontWeight: 700 }} />
                <Radar name="Ability" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn("p-8 rounded-[2.5rem] border shadow-xl relative overflow-hidden", theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-blue-600 text-white border-blue-600")}>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <Sparkles size={24} />
              <h3 className="text-xl font-black">AI Insights</h3>
            </div>
            {!analysis && !analyzing && <button onClick={getAIAnalysis} className={cn("px-4 py-2 rounded-xl text-sm font-bold", theme === 'dark' ? "bg-blue-600 text-white" : "bg-white text-blue-600")}>Generate</button>}
          </div>
          <div className="relative z-10 max-h-[300px] overflow-y-auto">
            {analyzing ? <Loader2 className="animate-spin mx-auto mt-20" size={40} /> : analysis ? <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">{analysis}</ReactMarkdown> : <p className="text-center opacity-70 italic mt-20">Click to get AI analysis.</p>}
          </div>
        </div>
      </div>

      <div className={cn("p-8 rounded-[2.5rem] border shadow-xl", theme === 'dark' ? "bg-gray-800/40 border-gray-700" : "bg-white border-white")}>
        <div className="flex items-center gap-3 mb-8">
          <History size={24} className="text-purple-500" />
          <h3 className="text-xl font-black">Test History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                <th className="pb-4 px-4">Test</th>
                <th className="pb-4 px-4">Score</th>
                <th className="pb-4 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {results.slice(0, 10).map((res) => (
                <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-4 px-4 capitalize font-bold">{res.testType.replace('-', ' ')}</td>
                  <td className="py-4 px-4"><span className="font-black text-blue-500">{res.score}</span> <span className="text-[10px] opacity-50 uppercase">{res.unit}</span></td>
                  <td className="py-4 px-4 text-xs font-bold text-gray-400">{new Date(res.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
