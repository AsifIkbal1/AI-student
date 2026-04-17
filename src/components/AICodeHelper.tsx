import React, { useState } from "react";
import { Code, Loader2, Play, Terminal, Copy, CheckCircle2, HelpCircle, Brain, ShieldCheck, Compass } from "lucide-react";
import { helpWithCode, logUsage, handleAIError } from "../lib/ai";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "motion/react";
import { useAuth } from "./AuthContext";
import { cn } from "../lib/utils";
import Mermaid from "./Mermaid";

export const AICodeHelper: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [mode, setMode] = useState("explain");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExplain = async () => {
    if (!code.trim() || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 2) {
      setExplanation("Error: You need at least 2 credits to use the AI Code Helper. Please upgrade your plan.");
      return;
    }

    setLoading(true);
    try {
      const { text, usage } = await helpWithCode(code, language, mode);
      setExplanation(text || "");
      if (profile) {
        await deductCredits(2);
        await logUsage(profile.uid, `AICodeHelper-${mode}`, usage);
      }
    } catch (error) {
      setExplanation(handleAIError(error));
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { id: "explain", label: "Explain Code", icon: HelpCircle },
    { id: "debug", label: "Debug Code", icon: ShieldCheck },
    { id: "algorithm", label: "Explain Algorithm", icon: Brain },
    { id: "logic", label: "Logic & Flowchart", icon: Compass },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Code Helper</h1>
        <p className="text-gray-500">Generate, debug, explain, and optimize your code with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-semibold",
              mode === m.id 
                ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                : "bg-white border-gray-100 text-gray-600 hover:border-blue-200"
            )}
          >
            <m.icon size={18} />
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-22rem)]">
        <div className="flex flex-col bg-gray-900 rounded-3xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste your code here..."
            className="flex-1 p-6 bg-gray-900 text-emerald-400 font-mono text-sm resize-none focus:outline-none leading-relaxed"
          />
          <div className="p-6 border-t border-gray-800 bg-gray-900/50">
            <button
              onClick={handleExplain}
              disabled={loading || !code.trim()}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Terminal size={24} />}
              Analyze & Explain Code
            </button>
          </div>
        </div>

        <div className="flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-700">AI Analysis</span>
            {explanation && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(explanation);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
            )}
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            {!explanation && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                <div className="bg-gray-50 p-6 rounded-full">
                  <Code size={48} />
                </div>
                <p className="max-w-xs italic">Paste your code and click "Analyze" to get a detailed explanation.</p>
              </div>
            )}
            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-blue-600 font-semibold">Debugging and analyzing...</p>
              </div>
            )}
            {explanation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-blue max-w-none"
              >
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      const isMermaid = match && match[1] === "mermaid";

                      if (!inline && isMermaid) {
                        return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                      }

                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={atomDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {explanation}
                </ReactMarkdown>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
