import React, { useState, useEffect } from "react";
import { 
  Library, 
  Youtube, 
  BookOpen, 
  FileText, 
  ExternalLink, 
  Loader2, 
  RefreshCcw, 
  History,
  Sparkles,
  Search,
  ArrowRight
} from "lucide-react";
import { recommendResources, logUsage, handleAIError } from "../lib/ai";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { useTheme } from "./ThemeContext";
import { cn } from "../lib/utils";

export const SmartResources: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const { currentTopic, t } = useLanguage();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");

  // Automatic fetch disabled as per user request. 
  // Resources will now only be fetched when the user clicks 'Auto-Sync' or performs a manual search.

  const handleFetchResources = async (topic: string) => {
    const targetTopic = topic || customTopic;
    if (!targetTopic.trim() || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 3) {
      setError("Insufficient credits. 3 credits required for discovery.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, usage } = await recommendResources(targetTopic);
      setResources(data);
      if (profile) {
        await deductCredits(3);
        await logUsage(profile.uid, "SmartResources", usage);
      }
    } catch (err) {
      setError(handleAIError(err));
    } finally {
      setLoading(false);
    }
  };

  const ResourceCard = ({ icon: Icon, title, items, colorClass }: any) => (
    <div className={cn(
      "rounded-3xl border shadow-sm overflow-hidden flex flex-col h-full transition-all hover:shadow-md",
      theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
    )}>
      <div className={cn("p-4 border-b flex items-center gap-2", colorClass)}>
        <Icon size={20} className="text-white" />
        <h3 className="font-bold text-white uppercase tracking-wider text-xs">{title}</h3>
      </div>
      <div className="p-4 space-y-4 flex-1">
        {items?.map((item: any, idx: number) => (
          <div key={idx} className={cn(
            "group border-b last:border-0 pb-4 last:pb-0",
            theme === 'dark' ? "border-gray-800" : "border-gray-50"
          )}>
            <h4 className={cn(
                "font-bold text-sm mb-1 group-hover:text-blue-500 transition-colors line-clamp-2",
                theme === 'dark' ? "text-gray-200" : "text-gray-800"
            )}>{item.title}</h4>
            {item.author && <p className="text-[10px] text-blue-500 mb-1 font-bold uppercase tracking-tight">{item.author}</p>}
            <p className={cn(
                "text-xs line-clamp-2 leading-relaxed mb-2",
                theme === 'dark' ? "text-gray-400" : "text-gray-500"
            )}>{item.reason}</p>
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-600 hover:underline"
            >
              Explore Source <ExternalLink size={10} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
             <div className="bg-emerald-600 p-1.5 rounded-lg shadow-lg shadow-emerald-200 dark:shadow-none">
                <Library size={18} className="text-white" />
             </div>
             <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Discovery Lab</span>
          </div>
          <h1 className={cn("text-2xl font-black mb-2", theme === 'dark' ? "text-white" : "text-gray-900")}>
             Smart Recommendations
          </h1>
          <p className={cn("max-w-xl text-sm leading-relaxed", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>
             Our AI analyzes your recent study activities to bring you the best research papers, books, and videos from across the web.
          </p>
        </div>

        <div className="w-full md:w-80 space-y-2">
            <div className="relative">
                <input 
                    type="text" 
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFetchResources(customTopic)}
                    placeholder="Search any study topic..."
                    className={cn(
                        "w-full rounded-2xl px-11 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm border",
                        theme === 'dark' ? "bg-gray-900 border-gray-800 text-white placeholder-gray-600" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                    )}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <button 
                  onClick={() => handleFetchResources(customTopic)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-all shadow-md"
                >
                  <ArrowRight size={18} />
                </button>
            </div>
            {currentTopic && (
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                    <History size={12} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Studying:</span>
                    <span className="text-[10px] font-black text-blue-500 truncate max-w-[150px] uppercase">{currentTopic}</span>
                </div>
                <button 
                  onClick={() => handleFetchResources(currentTopic)}
                  className="text-[10px] font-black text-emerald-600 uppercase hover:underline flex items-center gap-1 group"
                >
                  <RefreshCcw size={10} className="group-hover:rotate-180 transition-transform duration-500" /> Auto-Sync
                </button>
              </div>
            )}
        </div>
      </header>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!resources && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "flex flex-col items-center justify-center py-24 text-center rounded-[3rem] border-2 border-dashed",
                theme === 'dark' ? "bg-gray-900/50 border-gray-800" : "bg-gray-50 border-gray-100"
            )}
          >
            <div className={cn(
                "p-10 rounded-full mb-8 shadow-inner border-4 border-white",
                theme === 'dark' ? "bg-gray-800 border-gray-700" : "bg-white border-gray-50"
            )}>
               <Sparkles size={64} className="text-emerald-400 animate-pulse" />
            </div>
            <h2 className={cn("text-2xl font-bold mb-3", theme === 'dark' ? "text-white" : "text-gray-800")}>Ready to Discover?</h2>
            <p className={cn("max-w-xs text-sm mb-8", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>Start studying in the AI Tutor or Note Maker, and we'll automatically find resources for you here!</p>
            <button 
                onClick={() => handleFetchResources("Modern Web Development")}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95"
            >
                Try an Example
            </button>
          </motion.div>
        )}

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 space-y-6"
          >
             <div className="relative">
                <Loader2 className="animate-spin text-emerald-600" size={80} />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" />
                </div>
             </div>
             <div className="text-center">
                <p className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-1">Discovery Lab</p>
                <p className={cn("text-sm font-medium", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>Scanning the Academic Web for "{currentTopic || customTopic}"...</p>
             </div>
          </motion.div>
        )}

        {resources && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
             <ResourceCard 
                icon={Youtube} 
                title="Watch & Learn" 
                items={resources.videos} 
                colorClass="bg-red-500 shadow-lg shadow-red-200/50 dark:shadow-none"
             />
             <ResourceCard 
                icon={BookOpen} 
                title="Deep Reading" 
                items={resources.books} 
                colorClass="bg-blue-600 shadow-lg shadow-blue-200/50 dark:shadow-none"
             />
             <ResourceCard 
                icon={FileText} 
                title="Research Papers" 
                items={resources.papers} 
                colorClass="bg-violet-600 shadow-lg shadow-violet-200/50 dark:shadow-none"
             />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-center justify-center gap-3 font-bold shadow-sm"
        >
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          {error}
        </motion.div>
      )}
    </div>
  );
};
