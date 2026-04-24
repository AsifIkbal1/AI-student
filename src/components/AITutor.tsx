import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { generateTutorResponse, logUsage, handleAIError } from "../lib/ai";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";

interface Message {
  role: "user" | "model";
  text: string;
}

export const AITutor: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const { setCurrentTopic } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "model", text: "Hello! I am your AI Students Assistant. How can I help you today?" }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 1) {
      setMessages((prev) => [...prev, { role: "model", text: "Error: You have run out of credits. Please upgrade your plan to continue." }]);
      return;
    }

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("api key") || lowerInput.includes("backend") || lowerInput.includes("system logic") || lowerInput.includes("admin controls")) {
      setMessages((prev) => [...prev, { role: "model", text: "This information is managed by the system administrator." }]);
      setLoading(false);
      setInput("");
      return;
    }

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      setCurrentTopic(input); // Automation: Set topic for Smart Resources

      const { text, usage } = await generateTutorResponse(input, history);
      setMessages((prev) => [...prev, { role: "model", text: text || "I'm sorry, I couldn't generate a response." }]);
      
      if (profile) {
        await deductCredits(1);
        await logUsage(profile.uid, "AITutor", usage);
      }
    } catch (error) {
      const errorMessage = handleAIError(error);
      setMessages((prev) => [...prev, { role: "model", text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Bot className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Tutor</h2>
          <p className="text-xs text-gray-500">Always here to help you learn</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="bg-blue-50 p-6 rounded-full">
              <MessageSquare className="text-blue-600" size={48} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Start a conversation</h3>
            <p className="text-gray-500 max-w-xs">Ask me anything about Math, Science, History, or any other subject!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx}
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "p-2 rounded-full h-fit",
              msg.role === "user" ? "bg-blue-100" : "bg-gray-100"
            )}>
              {msg.role === "user" ? <User size={20} className="text-blue-600" /> : <Bot size={20} className="text-gray-600" />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-800 border border-gray-100"
            )}>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="bg-gray-100 p-2 rounded-full h-fit">
              <Bot size={20} className="text-gray-600" />
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <Loader2 className="animate-spin text-blue-600" size={20} />
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-gray-100 bg-gray-50/50">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question..."
            className="flex-1 bg-white border border-gray-200 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 flex items-center justify-center min-w-[64px]"
          >
            {loading ? <Loader2 className="animate-spin" size={28} /> : <Send size={28} />}
          </button>
        </div>
      </div>
    </div>
  );
};

import { MessageSquare } from "lucide-react";
import { cn } from "../lib/utils";
