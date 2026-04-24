import React, { useState, useRef } from "react";
import { FileText, Image as ImageIcon, Loader2, Sparkles, Copy, RefreshCw, Type, Key, Scissors, MessageSquareQuote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Tesseract from "tesseract.js";
import { digitalNotesProcess, handleAIError, logUsage } from "../lib/ai";
import { useTheme } from "./ThemeContext";
import { cn } from "../lib/utils";
import ReactMarkdown from "react-markdown";
import { useAuth } from "./AuthContext";

export const DigitalNotes: React.FC = () => {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summarize' | 'paraphrase' | 'keywords' | 'raw'>('summarize');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setResult("");
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      setContent(text);
      setResult("Text extracted from image successfully. You can now summarize, paraphrase, or extract keywords from the input area.");
      setActiveTab('raw');
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Failed to extract text from image.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleProcess = async (mode: 'summarize' | 'paraphrase' | 'keywords') => {
    if (!content.trim() || loading) return;

    setLoading(true);
    setActiveTab(mode);
    try {
      const { text, usage } = await digitalNotesProcess(content, mode);
      setResult(text || "");
      if (profile) {
        await logUsage(profile.uid, `DigitalNotes_${mode}`, usage);
      }
    } catch (error) {
      setResult(handleAIError(error));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result || content);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-bold text-xs mb-4 dark:bg-blue-900/30 dark:text-blue-400"
        >
          <Sparkles size={14} />
          <span>FREE AI TOOL</span>
        </motion.div>
        <h1 className={cn("text-4xl font-black mb-4", theme === 'dark' ? "text-white" : "text-gray-900")}>Digital Notes AI</h1>
        <p className={cn("text-lg font-medium max-w-2xl mx-auto", theme === 'dark' ? "text-gray-400" : "text-gray-600")}>
          Extract text from images and use AI to summarize, paraphrase, or find keywords instantly—all for free.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className={cn(
            "rounded-3xl p-6 border transition-all min-h-[500px] flex flex-col",
            theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-xl shadow-blue-500/5"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={cn("font-bold flex items-center gap-2", theme === 'dark' ? "text-white" : "text-gray-900")}>
                <Type size={20} className="text-blue-500" />
                Input Content
              </h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={ocrLoading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  theme === 'dark' ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                )}
              >
                {ocrLoading ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                {ocrLoading ? "Extracting..." : "Scan Image"}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your text here or upload an image to extract text..."
              className={cn(
                "flex-1 w-full p-4 rounded-2xl resize-none focus:outline-none font-medium leading-relaxed transition-colors min-h-[250px]",
                theme === 'dark' ? "bg-gray-900/50 text-white placeholder-gray-600 focus:bg-gray-900" : "bg-gray-50/50 text-gray-800 placeholder-gray-400 focus:bg-white border-transparent focus:border-blue-200"
              )}
            />

            <div className="grid grid-cols-3 gap-3 mt-6">
              <button
                onClick={() => handleProcess('summarize')}
                disabled={loading || !content.trim()}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <Scissors size={20} />
                <span className="text-xs uppercase tracking-wider">Summarize</span>
              </button>
              <button
                onClick={() => handleProcess('paraphrase')}
                disabled={loading || !content.trim()}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                <RefreshCw size={20} />
                <span className="text-xs uppercase tracking-wider">Paraphrase</span>
              </button>
              <button
                onClick={() => handleProcess('keywords')}
                disabled={loading || !content.trim()}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                <Key size={20} />
                <span className="text-xs uppercase tracking-wider">Keywords</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <div className={cn(
            "rounded-3xl border transition-all min-h-[500px] flex flex-col overflow-hidden",
            theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-xl shadow-blue-500/5"
          )}>
            <div className="p-4 border-b border-gray-100/10 flex items-center justify-between bg-gray-500/5">
              <div className="flex gap-4">
                {(['summarize', 'paraphrase', 'keywords', 'raw'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "text-xs font-black uppercase tracking-widest transition-all pb-1 border-b-2",
                      activeTab === tab 
                        ? "text-blue-500 border-blue-500" 
                        : "text-gray-400 border-transparent hover:text-gray-300"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                onClick={copyToClipboard}
                disabled={!result && !content}
                className="p-2 rounded-lg hover:bg-gray-500/10 text-gray-400 transition-all"
              >
                <Copy size={18} />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center space-y-4"
                  >
                    <Loader2 className="animate-spin text-blue-500" size={48} />
                    <p className="text-blue-500 font-bold animate-pulse">AI is thinking...</p>
                  </motion.div>
                ) : (result || (activeTab === 'raw' && content)) ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("prose max-w-none", theme === 'dark' ? "prose-invert" : "prose-blue")}
                  >
                    <ReactMarkdown>{activeTab === 'raw' ? content : result}</ReactMarkdown>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                    <div className="p-6 rounded-full bg-gray-500/10">
                      <MessageSquareQuote size={48} className={theme === 'dark' ? "text-white" : "text-gray-900"} />
                    </div>
                    <p className={cn("font-medium max-w-[200px]", theme === 'dark' ? "text-white" : "text-gray-900")}>
                      Select a mode and generate your digital notes.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
