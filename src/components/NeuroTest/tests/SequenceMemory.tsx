import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Layers, RotateCcw, Trophy, Play } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useTheme } from "../../ThemeContext";
import { useAuth } from "../../AuthContext";

interface SequenceMemoryProps {
  onComplete: () => void;
}

export const SequenceMemory: React.FC<SequenceMemoryProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [gameState, setGameState] = useState<"idle" | "showing" | "input" | "gameover">("idle");
  const [activeSquare, setActiveSquare] = useState<number | null>(null);

  const startNextLevel = (prevSequence: number[] = []) => {
    const nextSquare = Math.floor(Math.random() * 9);
    const newSequence = [...prevSequence, nextSquare];
    setSequence(newSequence);
    setUserSequence([]);
    setGameState("showing");
    playSequence(newSequence);
  };

  const playSequence = async (seq: number[]) => {
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setActiveSquare(seq[i]);
      await new Promise(r => setTimeout(r, 600));
      setActiveSquare(null);
    }
    setGameState("input");
  };

  const handleSquareClick = (index: number) => {
    if (gameState !== "input") return;

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);

    if (index !== sequence[userSequence.length]) {
      setGameState("gameover");
      saveResult(sequence.length - 1);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      setTimeout(() => startNextLevel(sequence), 500);
    }
  };

  const saveResult = async (score: number) => {
    try {
      await fetch("/api/neurotest/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "sequence-memory",
          score,
          unit: "level",
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
            <Layers className="text-blue-500 mx-auto" size={64} />
            <h3 className="text-3xl font-black">Sequence Memory</h3>
            <p className="max-w-xs mx-auto text-gray-500">Repeat the pattern by clicking the squares in the correct order.</p>
            <button onClick={() => startNextLevel([])} className="px-10 py-4 rounded-2xl bg-blue-600 text-white font-bold">Start Test</button>
          </motion.div>
        )}

        {(gameState === "showing" || gameState === "input") && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center px-4">
              <span className="text-sm font-black uppercase tracking-widest text-gray-500">Level</span>
              <span className="text-4xl font-black text-blue-500">{sequence.length}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  whileTap={gameState === "input" ? { scale: 0.95, backgroundColor: "#3b82f6" } : {}}
                  onClick={() => handleSquareClick(i)}
                  className={cn(
                    "w-20 h-20 md:w-24 md:h-24 rounded-2xl transition-all duration-200 cursor-pointer border-2",
                    activeSquare === i 
                      ? "bg-sky-400 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.8)] scale-105" 
                      : theme === 'dark' ? "bg-gray-800/50 border-gray-700" : "bg-gray-100 border-gray-200",
                    gameState === "input" && userSequence.includes(i) && activeSquare !== i && "bg-blue-600 border-blue-500"
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}

        {gameState === "gameover" && (
          <motion.div key="gameover" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <Trophy className="text-amber-500 mx-auto" size={64} />
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Final Score</h3>
              <h4 className="text-7xl font-black text-blue-500">Lvl {sequence.length - 1}</h4>
            </div>
            <div className="flex gap-4">
              <button onClick={() => startNextLevel([])} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-800 text-white font-bold"><RotateCcw size={20} /> Retry</button>
              <button onClick={onComplete} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold">Finish</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
