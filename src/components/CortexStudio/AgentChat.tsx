import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  History, 
  Trash2, 
  MoreVertical,
  Paperclip,
  Smile,
  MessageSquare,
  Sparkles,
  Zap,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { cn } from "../../lib/utils";
import ReactMarkdown from "react-markdown";

interface AgentChatProps {
  agents: any[];
  selectedAgent: any;
  onSelectAgent: (agent: any) => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({ agents, selectedAgent, onSelectAgent }) => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedAgent || loading || !profile) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/cortex/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.uid,
          agentId: selectedAgent.id,
          prompt: input,
          history: messages.slice(-10) // Send last 10 messages for context
        })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: "assistant", content: "" };
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "");
            if (dataStr === "[DONE]") break;
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                assistantMessage.content += data.content;
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  return [...prev.slice(0, -1), { ...last, content: assistantMessage.content }];
                });
              }
            } catch (e) {
              console.error("Error parsing stream chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Error: Failed to connect to agent." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[700px] gap-6">
      {/* Sidebar - Agent List */}
      <div className={cn(
        "w-72 rounded-3xl border flex flex-col overflow-hidden",
        theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-sm"
      )}>
        <div className="p-6 border-b border-gray-100/10 flex items-center justify-between">
          <h3 className={cn("font-bold text-sm", theme === 'dark' ? "text-white" : "text-gray-900")}>Conversations</h3>
          <History size={16} className="text-gray-400" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {agents.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 italic">No agents available.</div>
          ) : (
            agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => onSelectAgent(agent)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                  selectedAgent?.id === agent.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : theme === 'dark' ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                  selectedAgent?.id === agent.id ? "bg-white/20" : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                )}>
                  {agent.name[0]}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-bold text-xs truncate">{agent.name}</p>
                  <p className={cn(
                    "text-[10px] truncate opacity-70",
                    selectedAgent?.id === agent.id ? "text-indigo-100" : "text-gray-500"
                  )}>{agent.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className={cn(
        "flex-1 rounded-3xl border flex flex-col overflow-hidden relative",
        theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-sm"
      )}>
        {!selectedAgent ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center">
              <MessageSquare size={48} />
            </div>
            <div className="space-y-2">
              <h3 className={cn("text-2xl font-black", theme === 'dark' ? "text-white" : "text-gray-900")}>Ready to Chat?</h3>
              <p className={cn("text-sm max-w-xs mx-auto font-medium", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>
                Select an agent from the sidebar to start a conversation or build a new one in the Agent Studio.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-100/10 flex items-center justify-between bg-gray-500/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold">
                  {selectedAgent.name[0]}
                </div>
                <div>
                  <h3 className={cn("font-bold text-sm", theme === 'dark' ? "text-white" : "text-gray-900")}>{selectedAgent.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setMessages([])}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-500/10 hover:text-indigo-500 transition-all" 
                  title="Reset Chat"
                >
                  <RotateCcw size={18} />
                </button>
                <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-500/10 transition-all">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                  <Bot size={48} className={theme === 'dark' ? "text-white" : "text-gray-900"} />
                  <p className={cn("font-bold italic max-w-xs", theme === 'dark' ? "text-white" : "text-gray-900")}>
                    "I am {selectedAgent.name}, your {selectedAgent.role}. How can I assist you today?"
                  </p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex gap-4 max-w-[85%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white" 
                      : "bg-gray-800 border border-gray-700 text-indigo-400"
                  )}>
                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : theme === 'dark' ? "bg-gray-800 text-gray-200" : "bg-gray-50 text-gray-800"
                  )}>
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {loading && messages[messages.length-1]?.role === "user" && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-indigo-400 flex items-center justify-center shadow-sm">
                    <Bot size={16} />
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl flex items-center gap-2",
                    theme === 'dark' ? "bg-gray-800" : "bg-gray-50"
                  )}>
                    <div className="flex gap-1">
                      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-100/10 bg-gray-500/5">
              <form 
                onSubmit={handleSend}
                className={cn(
                  "relative flex items-center p-2 rounded-2xl border transition-all",
                  theme === 'dark' ? "bg-gray-900 border-gray-800 focus-within:border-indigo-500" : "bg-white border-gray-100 focus-within:shadow-lg"
                )}
              >
                <button type="button" className="p-3 text-gray-400 hover:text-indigo-500 transition-colors">
                  <Paperclip size={20} />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Send a message to ${selectedAgent.name}...`}
                  className={cn(
                    "flex-1 bg-transparent px-2 py-3 text-sm outline-none",
                    theme === 'dark' ? "text-white placeholder-gray-600" : "text-gray-900 placeholder-gray-400"
                  )}
                />
                <button type="button" className="p-3 text-gray-400 hover:text-indigo-500 transition-colors">
                  <Smile size={20} />
                </button>
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </form>
              <div className="mt-3 flex items-center justify-center gap-6">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <Zap size={10} className="text-yellow-500" />
                  Streaming Active
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <Sparkles size={10} className="text-indigo-500" />
                  GPT-4o Mini
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
