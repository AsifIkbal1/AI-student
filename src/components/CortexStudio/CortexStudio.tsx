import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Plus, 
  MessageSquare, 
  Calendar, 
  Settings, 
  Trash2, 
  Play, 
  Brain,
  Wand2,
  ChevronRight,
  Bot,
  Activity,
  History,
  Clock,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";
import { cn } from "../../lib/utils";
import { AgentBuilder } from "./AgentBuilder";
import { AgentChat } from "./AgentChat";
import { TaskScheduler } from "./TaskScheduler";
import { CortexSettings } from "./CortexSettings";

type Tab = "dashboard" | "studio" | "chat" | "automation" | "settings" | "use-cases";

export const CortexStudio: React.FC = () => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [agents, setAgents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;
    try {
      const [agentsRes, tasksRes] = await Promise.all([
        fetch(`/api/cortex/agents?userId=${profile.uid}`),
        fetch(`/api/cortex/tasks?userId=${profile.uid}`)
      ]);
      const agentsData = await agentsRes.json();
      const tasksData = await tasksRes.json();
      setAgents(agentsData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching Cortex data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;
    try {
      await fetch(`/api/cortex/agents/${id}`, { method: "DELETE" });
      setAgents(agents.filter(a => a.id !== id));
      if (selectedAgent?.id === id) setSelectedAgent(null);
    } catch (error) {
      console.error("Error deleting agent:", error);
    }
  };

  const navItems = [
    { id: "dashboard", icon: Cpu, label: "Dashboard" },
    { id: "use-cases", icon: Sparkles, label: "Use Cases" },
    { id: "studio", icon: Wand2, label: "Agent Studio" },
    { id: "chat", icon: MessageSquare, label: "Agent Chat" },
    { id: "automation", icon: Calendar, label: "Automation" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const useCases = [
    {
      title: "Productivity",
      description: "Research, summarize, and analyze data in minutes.",
      icon: Brain,
      color: "bg-blue-500",
      examples: [
        "Summarize the most important AI news from this week",
        "Research competitor pricing for B2B project management tools",
        "Analyze this CSV and tell me the top 3 insights"
      ]
    },
    {
      title: "Content Creation",
      description: "Draft blogs, social posts, and professional emails on demand.",
      icon: Wand2,
      color: "bg-purple-500",
      examples: [
        "Write a persuasive LinkedIn post about deep work",
        "Create a 4-week Twitter/X calendar for a B2B SaaS",
        "Plan a 3-email launch sequence for our new feature"
      ]
    },
    {
      title: "Automation",
      description: "Automate repeatable routines without writing code.",
      icon: Clock,
      color: "bg-emerald-500",
      examples: [
        "Every Monday at 9am, send me a summary of my week ahead",
        "Daily at 8am, give me a motivational quote and weather",
        "On the 1st of each month, generate a goals review"
      ]
    },
    {
      title: "Monitoring",
      description: "Define what to watch and get real-time alerts.",
      icon: Activity,
      color: "bg-orange-500",
      examples: [
        "Alert me when any Hacker News post about AI hits 200 points",
        "Watch for any mentions of our brand name on social media",
        "Notify me if Bitcoin drops below $60,000"
      ]
    },
    {
      title: "Communication",
      description: "Manage your inbox and prepare for meetings.",
      icon: MessageSquare,
      color: "bg-indigo-500",
      examples: [
        "Summarize my unread emails and flag anything urgent",
        "Prepare a 5-point agenda for tomorrow's investor call",
        "Draft a reply to the partnership inquiry from Acme Corp"
      ]
    },
    {
      title: "Engineering",
      description: "A senior engineer in your pocket for bugs and tests.",
      icon: Cpu,
      color: "bg-cyan-500",
      examples: [
        "This Python function always returns None — find the bug",
        "Write unit tests for my user authentication module",
        "Refactor this function to use async/await"
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Cpu size={24} />
            </div>
            <h1 className={cn("text-3xl font-black tracking-tight", theme === 'dark' ? "text-white" : "text-gray-900")}>
              Cortex Studio
            </h1>
          </div>
          <p className={cn("text-sm font-medium", theme === 'dark' ? "text-gray-400" : "text-gray-600")}>
            Build and automate your personal AI agents with memory and tools.
          </p>
        </div>

        <div className={cn(
          "flex p-1 rounded-2xl border backdrop-blur-sm overflow-x-auto no-scrollbar",
          theme === 'dark' ? "bg-gray-800/50 border-gray-700" : "bg-white/80 border-gray-100 shadow-sm"
        )}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeTab === item.id 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                  : theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Active Agents", value: agents.length, icon: Bot, color: "text-blue-500" },
                  { label: "Tasks Running", value: tasks.filter(t => t.status === "active").length, icon: Activity, color: "text-emerald-500" },
                  { label: "Memory Points", value: "248", icon: Brain, color: "text-purple-500" },
                ].map((stat, i) => (
                  <div key={i} className={cn(
                    "p-6 rounded-3xl border transition-all",
                    theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-sm"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-2 rounded-xl bg-gray-500/10", stat.color)}>
                        <stat.icon size={20} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">Stats</span>
                    </div>
                    <p className={cn("text-sm font-bold mb-1", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>{stat.label}</p>
                    <p className={cn("text-3xl font-black", theme === 'dark' ? "text-white" : "text-gray-900")}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Agents Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={cn(
                  "p-8 rounded-3xl border",
                  theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-sm"
                )}>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>Your AI Fleet</h2>
                    <button 
                      onClick={() => setActiveTab("studio")}
                      className="text-indigo-600 text-sm font-bold hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {agents.length === 0 ? (
                      <div className="py-12 text-center text-gray-500 italic">No agents created yet.</div>
                    ) : (
                      agents.slice(0, 4).map((agent) => (
                        <div 
                          key={agent.id}
                          className={cn(
                            "group flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer",
                            theme === 'dark' ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800" : "bg-white border-gray-100 hover:shadow-md"
                          )}
                          onClick={() => {
                            setSelectedAgent(agent);
                            setActiveTab("chat");
                          }}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                            {agent.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={cn("font-bold truncate", theme === 'dark' ? "text-white" : "text-gray-900")}>{agent.name}</h3>
                            <p className="text-xs text-gray-500 font-medium">{agent.role}</p>
                          </div>
                          <ChevronRight size={18} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className={cn(
                  "p-8 rounded-3xl border",
                  theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-sm"
                )}>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>Automation Status</h2>
                    <button 
                      onClick={() => setActiveTab("automation")}
                      className="text-indigo-600 text-sm font-bold hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {tasks.length === 0 ? (
                      <div className="py-12 text-center text-gray-500 italic">No active automations.</div>
                    ) : (
                      tasks.slice(0, 4).map((task) => (
                        <div 
                          key={task.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border",
                            theme === 'dark' ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-100"
                          )}
                        >
                          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                            <Clock size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={cn("font-bold text-sm truncate", theme === 'dark' ? "text-white" : "text-gray-900")}>{task.title}</h3>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{task.schedule}</p>
                          </div>
                          <div className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            task.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500"
                          )}>
                            {task.status}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "use-cases" && (
            <motion.div
              key="use-cases"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className={cn("text-3xl font-black mb-4", theme === 'dark' ? "text-white" : "text-gray-900")}>
                  What can your AI agents do?
                </h2>
                <p className={cn("text-lg font-medium", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>
                  From one-off research requests to fully automated recurring workflows — explore the full range of tasks Cortex handles out of the box.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {useCases.map((useCase, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "p-8 rounded-[2rem] border transition-all hover:border-indigo-500/50 group",
                      theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3",
                      useCase.color
                    )}>
                      <useCase.icon size={28} />
                    </div>
                    <h3 className={cn("text-xl font-black mb-3", theme === 'dark' ? "text-white" : "text-gray-900")}>
                      {useCase.title}
                    </h3>
                    <p className={cn("text-sm font-medium mb-6", theme === 'dark' ? "text-gray-400" : "text-gray-600")}>
                      {useCase.description}
                    </p>
                    <div className="space-y-3">
                      {useCase.examples.map((example, j) => (
                        <div key={j} className="flex gap-3 text-xs font-bold items-start group/ex">
                          <span className="text-indigo-500 mt-1">→</span>
                          <span className={cn("transition-colors", theme === 'dark' ? "text-gray-500 group-hover/ex:text-gray-300" : "text-gray-500 group-hover/ex:text-gray-800")}>
                            "{example}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className={cn(
                "mt-12 p-10 rounded-[3rem] text-center border overflow-hidden relative",
                theme === 'dark' ? "bg-indigo-600/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-100"
              )}>
                <div className="relative z-10">
                  <h3 className={cn("text-2xl font-black mb-4", theme === 'dark' ? "text-white" : "text-gray-900")}>
                    Ready to build your first agent?
                  </h3>
                  <p className={cn("mb-8 font-medium", theme === 'dark' ? "text-gray-400" : "text-gray-600")}>
                    Stop manually doing what AI can do for you. Create a custom agent in seconds.
                  </p>
                  <button 
                    onClick={() => setActiveTab("studio")}
                    className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
                  >
                    Go to Agent Studio
                  </button>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full" />
              </div>
            </motion.div>
          )}

          {activeTab === "studio" && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AgentBuilder 
                agents={agents} 
                onAgentCreated={(newAgent) => {
                  setAgents([...agents, newAgent]);
                  setActiveTab("dashboard");
                }}
                onDelete={handleDeleteAgent}
              />
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AgentChat 
                agents={agents} 
                selectedAgent={selectedAgent} 
                onSelectAgent={setSelectedAgent} 
              />
            </motion.div>
          )}

          {activeTab === "automation" && (
            <motion.div
              key="automation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TaskScheduler 
                agents={agents} 
                tasks={tasks} 
                onTaskCreated={(newTask) => setTasks([...tasks, newTask])}
                onDelete={(id) => setTasks(tasks.filter(t => t.id !== id))}
              />
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CortexSettings />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
