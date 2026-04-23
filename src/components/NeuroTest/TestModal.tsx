import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTheme } from "../ThemeContext";

// Test Components
import { ReactionTime } from "./tests/ReactionTime";
import { SequenceMemory } from "./tests/SequenceMemory";
import { NumberMemory } from "./tests/NumberMemory";
import { VerbalMemory } from "./tests/VerbalMemory";
import { VisualMemory } from "./tests/VisualMemory";
import { TypingSpeed } from "./tests/TypingSpeed";

interface TestModalProps {
  isOpen: boolean;
  testId: string | null;
  onClose: () => void;
}

export const TestModal: React.FC<TestModalProps> = ({ isOpen, testId, onClose }) => {
  const { theme } = useTheme();

  const renderTest = () => {
    switch (testId) {
      case "reaction-time": return <ReactionTime onComplete={onClose} />;
      case "sequence-memory": return <SequenceMemory onComplete={onClose} />;
      case "number-memory": return <NumberMemory onComplete={onClose} />;
      case "verbal-memory": return <VerbalMemory onComplete={onClose} />;
      case "visual-memory": return <VisualMemory onComplete={onClose} />;
      case "typing-speed": return <TypingSpeed onComplete={onClose} />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl border-2",
              theme === 'dark' ? "bg-gray-900/90 border-gray-700" : "bg-white/95 border-gray-100"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-20 flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-800 bg-inherit rounded-t-[3rem]">
              <h2 className={cn("text-2xl font-black capitalize", theme === 'dark' ? "text-white" : "text-gray-900")}>
                {testId?.replace('-', ' ')}
              </h2>
              <button
                onClick={onClose}
                className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 md:p-12">
              {renderTest()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
