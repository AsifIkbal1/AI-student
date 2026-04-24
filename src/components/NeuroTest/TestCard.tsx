import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTheme } from "../ThemeContext";

interface TestCardProps {
  test: any;
  index: number;
  onClick: () => void;
}

export const TestCard: React.FC<TestCardProps> = ({ test, index, onClick }) => {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={cn(
        "group relative p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl overflow-hidden",
        theme === 'dark' 
          ? "bg-gray-800/40 border-gray-700 hover:border-gray-600" 
          : "bg-white border-gray-100 hover:border-blue-200"
      )}
    >
      <div className={cn(
        "absolute top-0 right-0 p-12 -translate-y-1/2 translate-x-1/2 opacity-10 rounded-full",
        `bg-${test.color}-500`
      )} />

      <div className="relative z-10 space-y-4">
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
          theme === 'dark' ? "bg-gray-900" : "bg-gray-50",
          `text-${test.color}-500`
        )}>
          {test.icon}
        </div>
        
        <div>
          <h3 className={cn("text-2xl font-black mb-2", theme === 'dark' ? "text-white" : "text-gray-900")}>{test.title}</h3>
          <p className={cn("font-medium text-sm leading-relaxed", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>
            {test.description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-500 group-hover:gap-4 transition-all">
          Start Test
          <ArrowRight size={16} />
        </div>
      </div>
    </motion.div>
  );
};
