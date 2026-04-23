import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, 
  Trophy, 
  History, 
  BarChart3, 
  Zap, 
  Target, 
  Keyboard, 
  Layers, 
  Hash, 
  Type, 
  Eye,
  BrainCircuit
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import { cn } from "../../lib/utils";
import { TestCard } from "./TestCard";
import { TestModal } from "./TestModal";
import { Analytics } from "./Analytics";

const tests = [
  {
    id: "reaction-time",
    title: "Reaction Time",
    description: "Measure your visual reflexes in milliseconds.",
    icon: <Zap size={32} />,
    color: "rose"
  },
  {
    id: "sequence-memory",
    title: "Sequence Memory",
    description: "Remember and repeat an increasing pattern.",
    icon: <Layers size={32} />,
    color: "blue"
  },
  {
    id: "number-memory",
    title: "Number Memory",
    description: "How many digits can you remember in a row?",
    icon: <Hash size={32} />,
    color: "emerald"
  },
  {
    id: "verbal-memory",
    title: "Verbal Memory",
    description: "Keep track of seen and new words.",
    icon: <Type size={32} />,
    color: "indigo"
  },
  {
    id: "visual-memory",
    title: "Visual Memory",
    description: "Remember the squares on a grid.",
    icon: <Eye size={32} />,
    color: "purple"
  },
  {
    id: "typing-speed",
    title: "Typing Speed",
    description: "Test your WPM and accuracy.",
    icon: <Keyboard size={32} />,
    color: "sky"
  }
];

export const NeuroTest: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <section className="relative overflow-hidden p-12 rounded-[3.5rem] bg-gradient-to-br from-blue-600/90 to-purple-700/90 text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-24 -translate-y-1/2 translate-x-1/2 bg-white/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-bold"
            >
              <BrainCircuit size={16} />
              Cognitive Performance
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">NeuroTest AI</h1>
            <p className="text-xl font-medium opacity-90 max-w-xl">
              Measure and improve your cognitive abilities with professional-grade tests and AI insights.
            </p>
          </div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={cn(
                "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl",
                showAnalytics 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : theme === 'dark' ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-gray-900 hover:bg-gray-50"
              )}
            >
              {showAnalytics ? <Trophy size={20} /> : <BarChart3 size={20} />}
              {showAnalytics ? "View Tests" : "My Insights"}
            </button>
          </motion.div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {!showAnalytics ? (
          <motion.div
            key="tests-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {tests.map((test, index) => (
              <TestCard 
                key={test.id} 
                test={test} 
                index={index} 
                onClick={() => setActiveTest(test.id)} 
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Analytics />
          </motion.div>
        )}
      </AnimatePresence>

      <TestModal 
        isOpen={!!activeTest} 
        testId={activeTest} 
        onClose={() => setActiveTest(null)} 
      />
    </div>
  );
};
