import React, { useState } from "react";
import { Brain, Plus, Loader2, ChevronLeft, ChevronRight, RotateCcw, Trash2 } from "lucide-react";
import { generateFlashcards, logUsage, handleAIError } from "../lib/ai";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useAuth } from "./AuthContext";

interface Flashcard {
  front: string;
  back: string;
}

export const AIFlashcards: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 2) {
      setError("Error: You need at least 2 credits to generate flashcards.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, usage } = await generateFlashcards(topic);
      setCards(data);
      setCurrentIndex(0);
      setIsFlipped(false);
      if (profile) {
        await deductCredits(2);
        await logUsage(profile.uid, "AIFlashcards", usage);
      }
    } catch (error) {
      setError(handleAIError(error));
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Flashcards</h1>
        <p className="text-gray-500">Master any topic with AI-generated spaced repetition cards</p>
      </div>

      {!cards.length ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Topic for Flashcards</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Organic Chemistry, Spanish Vocabulary, Capital Cities"
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
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Brain size={24} />}
              Generate Flashcards
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-500">Card {currentIndex + 1} of {cards.length}</span>
            <button 
              onClick={() => setCards([])}
              className="text-red-600 font-semibold flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
            >
              <Trash2 size={18} /> Reset
            </button>
          </div>

          <div 
            className="perspective-1000 h-96 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              className="relative w-full h-full preserve-3d"
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white border-2 border-blue-100 rounded-3xl shadow-xl flex items-center justify-center p-12 text-center">
                <h3 className="text-2xl font-bold text-gray-900">{cards[currentIndex].front}</h3>
                <p className="absolute bottom-6 text-xs font-bold text-blue-400 uppercase tracking-widest">Click to flip</p>
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 backface-hidden bg-blue-600 border-2 border-blue-700 rounded-3xl shadow-xl flex items-center justify-center p-12 text-center"
                style={{ transform: "rotateY(180deg)" }}
              >
                <h3 className="text-2xl font-bold text-white">{cards[currentIndex].back}</h3>
                <p className="absolute bottom-6 text-xs font-bold text-blue-200 uppercase tracking-widest">Click to flip back</p>
              </div>
            </motion.div>
          </div>

          <div className="flex justify-center items-center gap-8">
            <button 
              onClick={prevCard}
              className="bg-white border border-gray-200 p-4 rounded-full hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={() => setIsFlipped(!isFlipped)}
              className="bg-blue-50 text-blue-600 px-8 py-3 rounded-2xl font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
            >
              <RotateCcw size={20} /> Flip Card
            </button>
            <button 
              onClick={nextCard}
              className="bg-white border border-gray-200 p-4 rounded-full hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
