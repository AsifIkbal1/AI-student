import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Hash, RotateCcw, Trophy, Play, CheckCircle2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useTheme } from "../../ThemeContext";
import { useAuth } from "../../AuthContext";

interface NumberMemoryProps {
  onComplete: () => void;
}

export const NumberMemory: React.FC<NumberMemoryProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<"idle" | "showing" | "input" | "results">("idle");
  const [level, setLevel] = useState(1);
  const [number, setNumber] = useState("");
  const [userInput, setUserInput] = useState("");

  const startNextLevel = () => {
    const nextNumber = Math.floor(Math.pow(10, level - 1) + Math.random() * 9 * Math.pow(10, level - 1)).toString();
    setNumber(nextNumber);
    setUserInput("");
    setGameState("showing");
    setTimeout(() => setGameState("input"), level * 1000 + 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput === number) {
      setLevel(level + 1);
      setGameState("showing"); // Temporary state to trigger next level
      setTimeout(() => startNextLevel(), 500);
    } else {
      setGameState("results");
      saveResult(level);
    }
  };

  const saveResult = async (score: number) => {
    try {
      await fetch("/api/neurotest/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "number-memory",
          score,
          unit: "digits",
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
            <Hash className="text-emerald-500 mx-auto" size={64} />
            <h3 className="text-3xl font-black">Number Memory</h3>
            <p className="max-w-xs mx-auto text-gray-500">Memorize the number shown on the screen.</p>
            <button onClick={startNextLevel} className="px-10 py-4 rounded-2xl bg-emerald-600 text-white font-bold">Start Test</button>
          </motion.div>
        )}

        {gameState === "showing" && (
          <motion.div key="showing" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8">
            <h4 className={cn("text-7xl md:text-9xl font-black tracking-widest", theme === 'dark' ? "text-white" : "text-gray-900")}>
              {number}
            </h4>
            <div className="w-full max-w-md h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: (level * 1000 + 1000) / 1000, ease: "linear" }}
                className="h-full bg-emerald-500"
              />
            </div>
          </motion.div>
        )}

        {gameState === "input" && (
          <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full max-w-sm">
            <h3 className="text-xl font-black">What was the number?</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                autoFocus
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ""))}
                className={cn(
                  "w-full px-8 py-6 rounded-3xl text-4xl font-black text-center focus:outline-none focus:ring-4 focus:ring-emerald-500/20",
                  theme === 'dark' ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
                )}
              />
              <button type="submit" className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-lg">Submit</button>
            </form>
          </motion.div>
        )}

        {gameState === "results" && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <Trophy className="text-amber-500 mx-auto" size={64} />
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Correct Answer</h3>
              <h4 className="text-4xl font-black text-emerald-500 mb-4">{number}</h4>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Your Answer</h3>
              <h4 className="text-4xl font-black text-red-500">{userInput}</h4>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-6xl font-black">Lvl {level}</h4>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setLevel(1); startNextLevel(); }} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-800 text-white font-bold"><RotateCcw size={20} /> Retry</button>
              <button onClick={onComplete} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-bold">Finish</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
