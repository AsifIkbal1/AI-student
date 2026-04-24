import React, { useState } from "react";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Play, 
  Clock, 
  Bot, 
  Zap, 
  MoreVertical,
  Activity,
  CheckCircle2,
  X,
  Loader2,
  Save,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { cn } from "../../lib/utils";

interface TaskSchedulerProps {
  agents: any[];
  tasks: any[];
  onTaskCreated: (task: any) => void;
  onDelete: (id: string) => void;
}

export const TaskScheduler: React.FC<TaskSchedulerProps> = ({ agents, tasks, onTaskCreated, onDelete }) => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    agentId: "",
    schedule: "0 0 * * *", // Daily at midnight
    action: ""
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !formData.agentId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cortex/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: profile.uid })
      });
      const data = await res.json();
      onTaskCreated({ ...formData, id: data.id, status: "active" });
      setShowCreate(false);
      setFormData({ title: "", agentId: "", schedule: "0 0 * * *", action: "" });
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setLoading(false);
    }
  };

  const scheduleOptions = [
    { label: "Every Hour", value: "0 * * * *" },
    { label: "Daily at Midnight", value: "0 0 * * *" },
    { label: "Every Monday", value: "0 0 * * 1" },
    { label: "Every Month", value: "0 0 1 * *" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>Automation Scheduler</h2>
          <p className="text-xs text-gray-500 font-medium">Schedule repetitive AI workflows and background tasks.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} />
          Create Automation
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <div className="py-20 text-center space-y-4 border-2 border-dashed border-gray-500/10 rounded-3xl">
              <Calendar size={48} className="mx-auto text-gray-500 opacity-20" />
              <p className="text-gray-500 font-medium">No automations scheduled. Start by creating one!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-6 rounded-3xl border flex items-center gap-6 group transition-all",
                  theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-sm"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  task.status === "active" ? "bg-indigo-600/10 text-indigo-500" : "bg-gray-500/10 text-gray-500"
                )}>
                  <Clock size={24} />
                </div>

                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className={cn("font-bold text-lg truncate", theme === 'dark' ? "text-white" : "text-gray-900")}>{task.title}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Bot size={12} />
                      <span className="font-bold">{agents.find(a => a.id === task.agentId)?.name || "Unknown Agent"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Schedule</p>
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-yellow-500" />
                      <span className={cn("text-xs font-bold", theme === 'dark' ? "text-gray-300" : "text-gray-700")}>{task.schedule}</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Last Run</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-gray-500">{task.lastRun || "Never"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-3 rounded-xl bg-gray-500/10 text-gray-400 hover:text-indigo-500 transition-all">
                    <Play size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(task.id)}
                    className="p-3 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button className="p-3 rounded-xl text-gray-400">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
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
                "relative w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl",
                theme === 'dark' ? "bg-gray-900 border border-gray-800" : "bg-white"
              )}
            >
              <div className="p-8 border-b border-gray-100/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white">
                    <Zap size={20} />
                  </div>
                  <h3 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>New Automation</h3>
                </div>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Task Title</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Generate Weekly Study Report"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl outline-none border transition-all",
                      theme === 'dark' ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-100 focus:border-indigo-500"
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Select Agent</label>
                    <select
                      required
                      value={formData.agentId}
                      onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl outline-none border transition-all appearance-none",
                        theme === 'dark' ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-100 focus:border-indigo-500"
                      )}
                    >
                      <option value="">Select an agent...</option>
                      {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Frequency</label>
                    <select
                      required
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl outline-none border transition-all appearance-none",
                        theme === 'dark' ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-100 focus:border-indigo-500"
                      )}
                    >
                      {scheduleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Task Action (Prompt)</label>
                  <textarea 
                    required
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                    rows={3}
                    placeholder="Describe exactly what the agent should do when triggered..."
                    className={cn(
                      "w-full px-4 py-3 rounded-xl outline-none border transition-all resize-none",
                      theme === 'dark' ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-100 focus:border-indigo-500"
                    )}
                  />
                </div>

                <div className="pt-4">
                  <button
                    disabled={loading || !formData.agentId}
                    className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                    Schedule Automation
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
