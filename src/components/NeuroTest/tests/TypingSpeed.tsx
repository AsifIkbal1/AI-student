import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Keyboard, RotateCcw, Trophy, Play, Timer, Sparkles, Target } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useTheme } from "../../ThemeContext";
import { useAuth } from "../../AuthContext";

const PASSAGES = [
  "The quick brown fox jumps over the lazy dog. This classic sentence contains every letter of the alphabet and is often used for typing practice.",
  "In the world of software development, clean code is not just a preference; it is a necessity for long-term project success and maintainability.",
  "Artificial intelligence is transforming the way we learn and work, providing personalized experiences that were once thought to be impossible.",
  "Programming is the art of telling a computer what to do. It requires patience, logic, and a willingness to constantly learn new things.",
  "The beauty of nature is often found in the smallest details, from the pattern on a butterfly's wing to the way sunlight filters through the trees."
];

interface TypingSpeedProps {
  onComplete: () => void;
}

export const TypingSpeed: React.FC<TypingSpeedProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<"idle" | "playing" | "results">("idle");
  const [passage, setPassage] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const startTest = () => {
    const randomPassage = PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
    setPassage(randomPassage);
    setUserInput("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setGameState("playing");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const renderedPassage = useMemo(() => {
    return passage.split('').map((char, i) => {
      let colorClass = "";
      if (i < userInput.length) {
        colorClass = userInput[i] === char ? "text-emerald-500" : "text-rose-500 bg-rose-500/10 rounded";
      } else if (i === userInput.length) {
        colorClass = "border-b-2 border-blue-500 animate-pulse";
      }
      return <span key={i} className={cn("transition-colors duration-75", colorClass)}>{char}</span>;
    });
  }, [passage, userInput]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const now = Date.now();
    if (!startTime) setStartTime(now);
    setUserInput(value);

    if (value.length > 0) {
      let errors = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== passage[i]) errors++;
      }
      setAccuracy(Math.round(((value.length - errors) / value.length) * 100));
      const timeElapsed = (now - (startTime || now)) / 60000;
      setWpm(Math.round((value.length / 5) / (timeElapsed || 0.0001)));
    }

    if (value.length === passage.length) {
      setGameState("results");
      saveResult(wpm, accuracy);
    }
  };

  const saveResult = async (finalWpm: number, finalAccuracy: number) => {
    try {
      await fetch("/api/neurotest/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType: "typing-speed", score: finalWpm, unit: "wpm", accuracy: finalAccuracy, userId: user?.uid })
      });
    } catch (error) { console.error("Error:", error); }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] text-center space-y-8">
      <AnimatePresence mode="wait">
        {gameState === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="w-24 h-24 rounded-[2rem] bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500 border-2 border-amber-500/20"><Keyboard size={48} /></div>
            <h3 className="text-3xl font-black">Typing Speed</h3>
            <button onClick={startTest} className="px-10 py-5 rounded-2xl bg-amber-600 text-white font-bold">Start Practice</button>
          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div key="playing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 w-full max-w-3xl">
            <div className="flex items-center justify-center gap-12">
              <div className="text-center"><p className="text-[10px] font-black uppercase text-gray-500">Speed</p><p className="text-4xl font-black text-amber-500">{wpm} WPM</p></div>
              <div className="text-center"><p className="text-[10px] font-black uppercase text-gray-500">Accuracy</p><p className="text-4xl font-black text-blue-500">{accuracy}%</p></div>
            </div>
            <div className={cn("p-10 rounded-[3rem] text-left text-2xl md:text-3xl font-bold leading-relaxed relative border-2", theme === 'dark' ? "bg-gray-900/60 border-gray-800" : "bg-gray-50 border-gray-100")}>
              <div className="relative z-10 select-none">{renderedPassage}</div>
              <textarea ref={inputRef} value={userInput} onChange={handleInput} className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none z-0" spellCheck={false} autoFocus />
            </div>
          </motion.div>
        )}

        {gameState === "results" && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("w-full max-w-lg p-12 rounded-[3rem] border shadow-2xl relative overflow-hidden", theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100")}>
            <Trophy size={56} className="text-amber-500 mx-auto mb-8" />
            <h3 className="text-3xl font-black mb-10">Performance Results</h3>
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="p-8 rounded-[2.5rem] bg-amber-50 dark:bg-amber-900/10 text-center"><p className="text-5xl font-black">{wpm}</p><p className="text-xs font-bold opacity-50">WPM</p></div>
              <div className="p-8 rounded-[2.5rem] bg-blue-50 dark:bg-blue-900/10 text-center"><p className="text-5xl font-black">{accuracy}%</p><p className="text-xs font-bold opacity-50">Accuracy</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={startTest} className="px-6 py-5 rounded-2xl font-bold bg-gray-100 dark:bg-gray-800">Retry</button>
              <button onClick={onComplete} className="px-6 py-5 rounded-2xl bg-amber-600 text-white font-bold">Finish</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
