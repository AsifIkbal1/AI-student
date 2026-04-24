import React, { useState } from "react";
import { 
  Plus, 
  Bot, 
  Wand2, 
  Trash2, 
  Save, 
  X, 
  Brain, 
  Tool, 
  Settings2,
  Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { cn } from "../../lib/utils";

interface AgentBuilderProps {
  agents: any[];
  onAgentCreated: (agent: any) => void;
  onDelete: (id: string) => void;
}

export const AgentBuilder: React.FC<AgentBuilderProps> = ({ agents, onAgentCreated, onDelete }) => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    instructions: "",
    memoryEnabled: true,
    tools: [] as string[]
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cortex/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: profile.uid })
      });
      const data = await res.json();
      onAgentCreated({ ...formData, id: data.id });
      setShowCreate(false);
      setFormData({ name: "", role: "", instructions: "", memoryEnabled: true, tools: [] });
    } catch (error) {
      console.error("Error creating agent:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableTools = [
    { id: "web_search", name: "Web Search", icon: Sparkles },
    { id: "calculator", name: "Calculator", icon: Settings2 },
    { id: "summarizer", name: "Summarizer", icon: Info },
    { id: "email", name: "Email (SMTP)", icon: Save },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>Agent Studio</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} />
          Create New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "p-6 rounded-3xl border flex flex-col group relative",
                theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-sm"
              )}
            >
              <button 
                onClick={() => onDelete(agent.id)}
                className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-xl shadow-indigo-500/20">
                {agent.name[0]}
              </div>
              <h3 className={cn("text-xl font-bold mb-1", theme === 'dark' ? "text-white" : "text-gray-900")}>{agent.name}</h3>
              <p className={cn("text-sm font-medium mb-4", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>{agent.role}</p>
              
              <div className="space-y-4 mt-auto">
                <div className="flex flex-wrap gap-2">
                  {agent.memoryEnabled && (
                    <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Brain size={12} /> Memory
                    </span>
                  )}
                  {agent.tools?.map((toolId: string) => (
                    <span key={toolId} className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Sparkles size={12} /> {toolId.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                
                <button className={cn(
                  "w-full py-3 rounded-2xl text-sm font-bold border transition-all",
                  theme === 'dark' ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-100 text-gray-600 hover:bg-gray-50"
                )}>
                  Edit Configuration
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl",
                theme === 'dark' ? "bg-gray-900 border border-gray-800" : "bg-white"
              )}
            >
              <div className="p-8 border-b border-gray-100/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white">
                    <Wand2 size={20} />
                  </div>
                  <h3 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>Build AI Agent</h3>
                </div>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Agent Name</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Research Assistant"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl outline-none border transition-all",
                        theme === 'dark' ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-100 focus:border-indigo-500"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Primary Role</label>
                    <input 
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Academic Researcher"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl outline-none border transition-all",
                        theme === 'dark' ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-100 focus:border-indigo-500"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Personality & Goal Instructions</label>
                  <textarea 
                    required
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={4}
                    placeholder="Provide specific instructions on how the agent should behave and what it should accomplish..."
                    className={cn(
                      "w-full px-4 py-3 rounded-xl outline-none border transition-all resize-none",
                      theme === 'dark' ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-100 focus:border-indigo-500"
                    )}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Agent Tools</label>
                    <div className="flex flex-wrap gap-2">
                      {availableTools.map((tool) => (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => {
                            if (formData.tools.includes(tool.id)) {
                              setFormData({ ...formData, tools: formData.tools.filter(t => t !== tool.id) });
                            } else {
                              setFormData({ ...formData, tools: [...formData.tools, tool.id] });
                            }
                          }}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
                            formData.tools.includes(tool.id)
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : theme === 'dark' ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-gray-50 border-gray-100 text-gray-500"
                          )}
                        >
                          <tool.icon size={14} />
                          {tool.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Context Memory</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, memoryEnabled: !formData.memoryEnabled })}
                      className={cn(
                        "w-full px-6 py-3 rounded-2xl flex items-center justify-between gap-4 border transition-all",
                        formData.memoryEnabled
                          ? "bg-purple-600/10 border-purple-600/30 text-purple-500"
                          : "bg-gray-800 border-gray-700 text-gray-500"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Brain size={20} />
                        <span className="font-bold">Enable Memory</span>
                      </div>
                      <div className={cn(
                        "w-10 h-5 rounded-full relative transition-colors",
                        formData.memoryEnabled ? "bg-purple-600" : "bg-gray-700"
                      )}>
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                          formData.memoryEnabled ? "right-1" : "left-1"
                        )} />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                    Finalize Agent Build
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    className={cn("animate-spin", className)} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
