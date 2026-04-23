import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, RotateCcw, Trophy, Play } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useTheme } from "../../ThemeContext";
import { useAuth } from "../../AuthContext";

interface VisualMemoryProps {
  onComplete: () => void;
}

export const VisualMemory: React.FC<VisualMemoryProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(3);
  const [targetSquares, setTargetSquares] = useState<Set<number>>(new Set());
  const [userSquares, setUserSquares] = useState<Set<number>>(new Set());
  const [gameState, setGameState] = useState<"idle" | "showing" | "input" | "results">("idle");

  const startNextLevel = (currentLevel: number) => {
    const newGridSize = Math.floor(currentLevel / 3) + 3;
    setGridSize(newGridSize);
    const numTargets = currentLevel + 2;
    const newTargets = new Set<number>();
    while (newTargets.size < numTargets) {
      newTargets.add(Math.floor(Math.random() * (newGridSize * newGridSize)));
    }
    setTargetSquares(newTargets);
    setUserSquares(new Set());
    setGameState("showing");
    setTimeout(() => setGameState("input"), 2000);
  };

  const handleSquareClick = (index: number) => {
    if (gameState !== "input") return;
    if (userSquares.has(index)) return;

    const newUserSquares = new Set(userSquares);
    newUserSquares.add(index);
    setUserSquares(newUserSquares);

    if (!targetSquares.has(index)) {
      setGameState("results");
      saveResult(level);
      return;
    }

    if (newUserSquares.size === targetSquares.size) {
      setLevel(level + 1);
      setTimeout(() => startNextLevel(level + 1), 500);
    }
  };

  const saveResult = async (score: number) => {
    try {
      await fetch("/api/neurotest/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "visual-memory",
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
            <Eye className="text-purple-500 mx-auto" size={64} />
            <h3 className="text-3xl font-black">Visual Memory</h3>
            <p className="max-w-xs mx-auto text-gray-500">Memorize the highlighted squares on the grid.</p>
            <button onClick={() => startNextLevel(1)} className="px-10 py-4 rounded-2xl bg-purple-600 text-white font-bold">Start Test</button>
          </motion.div>
        )}

        {(gameState === "showing" || gameState === "input") && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 w-full max-w-sm">
            <div className="flex justify-between items-center px-4">
              <span className="text-sm font-black uppercase tracking-widest text-gray-500">Level</span>
              <span className="text-4xl font-black text-purple-500">{level}</span>
            </div>
            
            <div 
              className="grid gap-2 mx-auto"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                width: "min(100%, 350px)"
              }}
            >
              {[...Array(gridSize * gridSize)].map((_, i) => (
                <motion.div
                  key={i}
                  whileTap={gameState === "input" ? { scale: 0.9, backgroundColor: "#10b981" } : {}}
                  onClick={() => handleSquareClick(i)}
                  className={cn(
                    "aspect-square rounded-xl transition-all duration-300 cursor-pointer border-2",
                    (gameState === "showing" && targetSquares.has(i))
                      ? "bg-sky-400 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.6)]" 
                      : (gameState === "input" && userSquares.has(i) && targetSquares.has(i))
                        ? "bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        : gameState === "input" && userSquares.has(i) && !targetSquares.has(i)
                          ? "bg-red-500 border-red-500"
                          : theme === 'dark' ? "bg-gray-800/50 border-gray-700" : "bg-gray-100 border-gray-200"
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}

        {gameState === "results" && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <Trophy className="text-amber-500 mx-auto" size={64} />
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Final Score</h3>
              <h4 className="text-7xl font-black text-purple-500">Lvl {level}</h4>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setLevel(1); startNextLevel(1); }} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-800 text-white font-bold"><RotateCcw size={20} /> Retry</button>
              <button onClick={onComplete} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-purple-600 text-white font-bold">Finish</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
