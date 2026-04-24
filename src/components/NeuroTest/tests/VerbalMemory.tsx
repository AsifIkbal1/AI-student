import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Type, RotateCcw, Trophy, Play, Heart, Check, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useTheme } from "../../ThemeContext";
import { useAuth } from "../../AuthContext";

const WORD_BANK = [
  "APPLE", "BANANA", "CHERRY", "DRAGON", "EAGLE", "FOREST", "GALAXY", "HARBOR", "ISLAND", "JUNGLE",
  "KINETIC", "LANTERN", "MOUNTAIN", "NEBULA", "OCEAN", "PHOENIX", "QUARTZ", "RIVER", "SILVER", "THUNDER",
  "UTOPIA", "VALLEY", "WIZARD", "XENON", "YACHT", "ZEPHYR", "AURORA", "BEACON", "CRYSTAL", "DESERT"
];

interface VerbalMemoryProps {
  onComplete: () => void;
}

export const VerbalMemory: React.FC<VerbalMemoryProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<"idle" | "playing" | "results">("idle");
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
  const [currentWord, setCurrentWord] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const startTest = () => {
    setSeenWords(new Set());
    setScore(0);
    setLives(3);
    setGameState("playing");
    pickNewWord(new Set());
  };

  const pickNewWord = (currentSeen: Set<string>) => {
    const shouldShowSeen = currentSeen.size > 0 && Math.random() > 0.5;
    if (shouldShowSeen) {
      const seenArray = Array.from(currentSeen);
      setCurrentWord(seenArray[Math.floor(Math.random() * seenArray.length)]);
    } else {
      const remainingWords = WORD_BANK.filter(w => !currentSeen.has(w));
      if (remainingWords.length === 0) {
        setGameState("results");
        saveResult(score);
        return;
      }
      setCurrentWord(remainingWords[Math.floor(Math.random() * remainingWords.length)]);
    }
  };

  const handleDecision = (seen: boolean) => {
    const isActuallySeen = seenWords.has(currentWord);
    if (seen === isActuallySeen) {
      setScore(score + 1);
      const newSeen = new Set(seenWords);
      newSeen.add(currentWord);
      setSeenWords(newSeen);
      pickNewWord(newSeen);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setGameState("results");
        saveResult(score);
      } else {
        const newSeen = new Set(seenWords);
        newSeen.add(currentWord);
        setSeenWords(newSeen);
        pickNewWord(newSeen);
      }
    }
  };

  const saveResult = async (finalScore: number) => {
    try {
      await fetch("/api/neurotest/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "verbal-memory",
          score: finalScore,
          unit: "words",
          userId: user?.uid
        })
      });
    } catch (error) {
      console.error("Failed to save result:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8">
      <AnimatePresence mode="wait">
        {gameState === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Type className="text-indigo-500 mx-auto" size={64} />
            <h3 className="text-3xl font-black">Verbal Memory</h3>
            <p className="max-w-xs mx-auto text-gray-500">You will be shown words. Click 'Seen' if you've seen it before in this session, otherwise click 'New'.</p>
            <button onClick={startTest} className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-bold">Start Test</button>
          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div key="playing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 w-full max-w-sm">
            <div className="flex justify-between items-center px-4">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart key={i} size={24} className={cn("transition-colors", i < lives ? "text-rose-500 fill-rose-500" : "text-gray-200")} />
                ))}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Score</p>
                <p className="text-3xl font-black text-indigo-500">{score}</p>
              </div>
            </div>

            <h4 className={cn("text-5xl md:text-6xl font-black tracking-tight", theme === 'dark' ? "text-white" : "text-gray-900")}>
              {currentWord}
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleDecision(true)}
                className="flex items-center justify-center gap-2 py-6 rounded-3xl bg-indigo-600 text-white font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
              >
                <Check size={24} strokeWidth={3} /> Seen
              </button>
              <button
                onClick={() => handleDecision(false)}
                className={cn(
                  "flex items-center justify-center gap-2 py-6 rounded-3xl font-black text-xl hover:scale-105 active:scale-95 transition-all",
                  theme === 'dark' ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
                )}
              >
                <X size={24} strokeWidth={3} /> New
              </button>
            </div>
          </motion.div>
        )}

        {gameState === "results" && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <Trophy className="text-amber-500 mx-auto" size={64} />
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Words Remembered</h3>
              <h4 className="text-7xl font-black text-indigo-500">{score}</h4>
            </div>
            <div className="flex gap-4">
              <button onClick={startTest} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-800 text-white font-bold"><RotateCcw size={20} /> Retry</button>
              <button onClick={onComplete} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold">Finish</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
