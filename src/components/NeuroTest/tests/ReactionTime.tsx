import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Timer, Trophy, RotateCcw } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useTheme } from "../../ThemeContext";
import { useAuth } from "../../AuthContext";

interface ReactionTimeProps {
  onComplete: () => void;
}

export const ReactionTime: React.FC<ReactionTimeProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [state, setState] = useState<"waiting" | "ready" | "clicked" | "early">("waiting");
  const [startTime, setStartTime] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    let timeout: any;
    if (state === "waiting") {
      timeout = setTimeout(() => {
        setState("ready");
        setStartTime(Date.now());
      }, Math.random() * 3000 + 2000);
    }
    return () => clearTimeout(timeout);
  }, [state]);

  const handleClick = () => {
    if (state === "waiting") {
      setState("early");
    } else if (state === "ready") {
      const reactionTime = Date.now() - startTime;
      setResult(reactionTime);
      setState("clicked");
      saveResult(reactionTime);
    }
  };

  const saveResult = async (score: number) => {
    try {
      await fetch("/api/neurotest/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: "reaction-time",
          score,
          unit: "ms",
          userId: user?.uid
        })
      });
    } catch (error) {
      console.error("Failed to save result:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <AnimatePresence mode="wait">
        {state === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClick}
            className="w-full h-64 rounded-[2.5rem] bg-blue-500/10 border-4 border-dashed border-blue-500/30 flex flex-col items-center justify-center cursor-pointer"
          >
            <Timer className="text-blue-500 mb-4 animate-pulse" size={64} />
            <h3 className="text-2xl font-black text-blue-500">Wait for Green...</h3>
          </motion.div>
        )}

        {state === "ready" && (
          <motion.div
            key="ready"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleClick}
            className="w-full h-64 rounded-[2.5rem] bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)] flex items-center justify-center cursor-pointer"
          >
            <Zap className="text-white animate-bounce" size={80} />
            <h3 className="text-4xl font-black text-white ml-4">CLICK NOW!</h3>
          </motion.div>
        )}

        {state === "early" && (
          <motion.div
            key="early"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
              <Timer size={48} />
            </div>
            <h3 className="text-3xl font-black text-red-600">Too Early!</h3>
            <button
              onClick={() => setState("waiting")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-800 text-white font-bold mx-auto"
            >
              <RotateCcw size={20} /> Try Again
            </button>
          </motion.div>
        )}

        {state === "clicked" && (
          <motion.div
            key="clicked"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="flex flex-col items-center">
              <Trophy className="text-amber-500 mb-4" size={64} />
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Your Reaction Time</h3>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-7xl font-black", theme === 'dark' ? "text-white" : "text-gray-900")}>{result}</span>
                <span className="text-2xl font-black text-blue-500">ms</span>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setState("waiting")}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-800 text-white font-bold"
              >
                <RotateCcw size={20} /> Retry
              </button>
              <button
                onClick={onComplete}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold"
              >
                Finish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
