import React, { useState } from "react";
import { Presentation, Loader2, Copy, CheckCircle2, Sparkles, Layout } from "lucide-react";
import { generateSlides, logUsage, handleAIError } from "../lib/ai";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "./AuthContext";

export const AISlideGenerator: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 5) {
      setError("Error: You need at least 5 credits to generate slides. Please upgrade your plan.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { text, usage } = await generateSlides(topic, slideCount);
      if (text) {
        // Split slides by [Slide X] pattern
        const slideParts = text.split(/\[Slide \d+\]/i).filter(s => s.trim().length > 0);
        setSlides(slideParts);
        setCurrentSlide(0);
        if (profile) {
          await deductCredits(5);
          await logUsage(profile.uid, "AISlideGenerator", usage);
        }
      }
    } catch (error) {
      setError(handleAIError(error));
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Slide Generator</h1>
        <p className="text-gray-500">Create structured slide presentations for any topic instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Presentation Topic</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. The Impact of Artificial Intelligence on Education"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-32 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Number of Slides</label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={slideCount}
                  onChange={(e) => setSlideCount(parseInt(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Presentation size={24} />}
                Generate Slide Content
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {slides.length > 0 ? (
            <div className="space-y-6">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm min-h-[400px] flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600 font-bold text-sm">
                      Slide {currentSlide + 1}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(slides[currentSlide]);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {copied ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Copy size={24} />}
                  </button>
                </div>
                <div className="prose prose-lg prose-blue max-w-none flex-1">
                  <ReactMarkdown
                    components={{
                      li: ({ children }) => (
                        <li className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-3 list-none flex items-start gap-3">
                          <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          <div className="text-blue-900 font-medium">{children}</div>
                        </li>
                      ),
                      ul: ({ children }) => <ul className="p-0 m-0 space-y-2">{children}</ul>,
                      p: ({ children }) => (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-800 leading-relaxed mb-4 shadow-sm">
                          {children}
                        </div>
                      ),
                      h1: ({ children }) => <h1 className="text-3xl font-black text-gray-900 mb-6 border-b-4 border-blue-600 pb-2 inline-block">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-800 mb-4">{children}</h2>,
                    }}
                  >
                    {slides[currentSlide]}
                  </ReactMarkdown>
                </div>
              </motion.div>

              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <button 
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-30"
                >
                  <ChevronLeft size={20} /> Previous
                </button>
                <div className="flex gap-1">
                  {slides.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        idx === currentSlide ? "bg-blue-600 w-6" : "bg-gray-200"
                      )}
                    />
                  ))}
                </div>
                <button 
                  onClick={nextSlide}
                  disabled={currentSlide === slides.length - 1}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-30 font-bold"
                >
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="bg-gray-50 p-8 rounded-full mb-6">
                <Presentation size={64} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to present?</h3>
              <p className="max-w-xs">Enter a topic and we'll generate the perfect structure for your slides.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-blue-600 font-semibold">AI is outlining your presentation...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
