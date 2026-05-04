import React, { useState } from "react";
import { 
  MessageSquare, 
  FileText, 
  HelpCircle, 
  PenTool, 
  Brain, 
  Calendar, 
  ShieldCheck, 
  Video, 
  Code, 
  Presentation, 
  CheckSquare,
  Sparkles,
  FileSearch,
  Compass,
  Leaf,
  Network,
  Library,
  Search,
  Cpu
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

type Category = "All" | "Study" | "Creation" | "Tools" | "Career";

const FeatureCard = ({ icon: Icon, title, description, path, color, theme, badge }: { icon: any, title: string, description: string, path: string, color: string, theme: string, badge?: "Popular" | "New" }) => (
  <Link to={path}>
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "p-6 rounded-3xl transition-all h-full flex flex-col relative overflow-hidden group cursor-pointer",
        theme === 'dark' ? "glass-panel" : "glass-panel hover:shadow-xl hover:shadow-blue-500/10"
      )}
    >
      {badge && (
        <span className={cn(
          "absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-bold shadow-sm",
          badge === "Popular" ? "bg-orange-100 text-orange-600 border border-orange-200" : "bg-emerald-100 text-emerald-600 border border-emerald-200",
          theme === 'dark' && badge === "Popular" && "bg-orange-900/50 text-orange-400 border-orange-800/50",
          theme === 'dark' && badge === "New" && "bg-emerald-900/50 text-emerald-400 border-emerald-800/50"
        )}>
          {badge}
        </span>
      )}
      <div className={cn(`p-3.5 rounded-2xl w-fit mb-5 text-white shadow-lg bg-gradient-to-br`, color)}>
        <Icon size={26} />
      </div>
      <h3 className={cn("text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors", theme === 'dark' ? "text-white group-hover:text-blue-400" : "text-gray-900")}>{title}</h3>
      <p className={cn("text-sm mb-6 flex-1 font-medium leading-relaxed", theme === 'dark' ? "text-gray-300" : "text-gray-600")}>{description}</p>
      <div className="flex items-center text-blue-600 text-sm font-bold mt-auto group-hover:translate-x-2 transition-transform">
        {path === "/dashboard" ? "View" : "Get Started"} →
      </div>
    </motion.div>
  </Link>
);

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [usageData, setUsageData] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  React.useEffect(() => {
    if (!profile) return;
    
    // Fetch tasks
    const qTasks = query(collection(db, "tasks"), where("uid", "==", profile.uid));
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      setTasks(snap.docs.map(doc => doc.data()));
    }, (error) => console.error("Dashboard tasks error:", error));

    // Fetch usage logs
    const qUsage = query(collection(db, "usageLogs"), where("uid", "==", profile.uid));
    const unsubUsage = onSnapshot(qUsage, (snap) => {
      const logs = snap.docs.map(doc => doc.data());
      const counts: { [key: string]: number } = {};
      
      logs.forEach(log => {
        const tool = log.tool || "Unknown";
        counts[tool] = (counts[tool] || 0) + 1;
      });

      const formattedData = Object.keys(counts)
        .filter(tool => !["ChatWithPDF"].includes(tool)) // Filter out deprecated tools
        .map(tool => ({
          name: tool.replace(/([A-Z])/g, ' $1').trim(), // Add spaces for readability
          count: counts[tool]
        })).sort((a, b) => b.count - a.count);

      setUsageData(formattedData);
    }, (error) => console.error("Dashboard usage logs error:", error));

    return () => {
      unsubTasks();
      unsubUsage();
    };
  }, [profile]);

  const completedCount = (Array.isArray(tasks) ? tasks : []).filter(t => t.completed).length;
  const progress = (Array.isArray(tasks) && tasks.length > 0) ? (completedCount / tasks.length) * 100 : 0;
  const upcomingTasks = (Array.isArray(tasks) ? tasks : []).filter(t => !t.completed).slice(0, 3);

  const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#a855f7', '#f97316', '#ec4899', '#ef4444', '#06b6d4'];

  const allFeatures = [
    {
      icon: MessageSquare,
      title: t("tutor"),
      description: t("desc_tutor"),
      path: "/tutor",
      color: "from-blue-500 to-blue-600",
      category: "Study",
      badge: "Popular" as const
    },
    {
      icon: FileText,
      title: t("notes"),
      description: t("desc_notes"),
      path: "/notes",
      color: "from-indigo-500 to-indigo-600",
      category: "Study"
    },
    {
      icon: HelpCircle,
      title: t("quiz"),
      description: t("desc_quiz"),
      path: "/quiz",
      color: "from-emerald-500 to-emerald-600",
      category: "Study"
    },
    {
      icon: PenTool,
      title: t("essay"),
      description: t("desc_essay"),
      path: "/essay",
      color: "from-purple-500 to-purple-600",
      category: "Creation"
    },
    {
      icon: Brain,
      title: t("flashcards"),
      description: t("desc_flashcards"),
      path: "/flashcards",
      color: "from-orange-500 to-orange-600",
      category: "Study"
    },
    {
      icon: Calendar,
      title: t("planner"),
      description: t("desc_planner"),
      path: "/planner",
      color: "from-pink-500 to-pink-600",
      category: "Study"
    },
    {
      icon: ShieldCheck,
      title: t("doubt_solver"),
      description: t("desc_doubt"),
      path: "/doubt-solver",
      color: "from-red-500 to-red-600",
      category: "Tools",
      badge: "Popular" as const
    },
    {
      icon: Code,
      title: t("code_helper"),
      description: t("desc_code"),
      path: "/code-helper",
      color: "from-cyan-500 to-cyan-600",
      category: "Creation"
    },
    {
      icon: Presentation,
      title: t("slides"),
      description: t("desc_slides"),
      path: "/slides",
      color: "from-amber-500 to-amber-600",
      category: "Creation",
      badge: "New" as const
    },

    {
      icon: Sparkles,
      title: t("smart_study"),
      description: t("desc_smart"),
      path: "/smart-study",
      color: "from-blue-600 to-blue-700",
      category: "Study",
      badge: "New" as const
    },
    {
      icon: Leaf,
      title: t("zenpath"),
      description: t("desc_zen"),
      path: "/zenpath",
      color: "from-emerald-600 to-emerald-700",
      category: "Career"
    },
    {
      icon: Compass,
      title: t("career_roadmap"),
      description: t("desc_roadmap"),
      path: "/career-roadmap",
      color: "from-indigo-600 to-indigo-700",
      category: "Career"
    },
    {
      icon: CheckSquare,
      title: t("tracker"),
      description: t("desc_tracker"),
      path: "/tracker",
      color: "from-teal-500 to-teal-600",
      category: "Tools"
    },
    {
      icon: Network,
      title: t("diagrams"),
      description: t("desc_diagrams"),
      path: "/diagrams",
      color: "from-violet-500 to-violet-600",
      category: "Creation"
    },
    {
      icon: Library,
      title: t("smart_resources"),
      description: t("desc_smart_resources"),
      path: "/smart-resources",
      color: "from-emerald-700 to-emerald-800",
      category: "Tools"
    },
    {
      icon: Cpu,
      title: t("cortex_studio"),
      description: t("desc_cortex_studio"),
      path: "/cortex-studio",
      color: "from-indigo-600 to-violet-700",
      category: "Tools",
      badge: "New" as const
    },
    {
      icon: FileText,
      title: t("digital_notes"),
      description: t("desc_digital_notes"),
      path: "/digital-notes",
      color: "from-blue-600 to-indigo-600",
      category: "Tools",
      badge: "New" as const
    }
  ];

  const filteredFeatures = allFeatures.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          feature.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || feature.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: Category[] = ["All", "Study", "Creation", "Tools", "Career"];

  return (
    <div className={cn("min-h-screen", theme === 'dark' ? "bg-gray-900" : "bg-gradient-mesh")}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn("text-4xl font-black mb-3 tracking-tight", theme === 'dark' ? "text-white" : "text-gray-900")}
          >
            {t("welcome_back")}, {profile?.displayName?.split(' ')[0]}! 👋
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={cn("text-lg font-medium", theme === 'dark' ? "text-gray-400" : "text-gray-600")}
          >
            {t("study_goal_prompt")}
          </motion.p>
        </header>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search tools, features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none transition-all font-medium",
                theme === 'dark' 
                  ? "bg-gray-800/50 border border-gray-700 text-white focus:border-blue-500 focus:bg-gray-800" 
                  : "glass-panel focus:bg-white/80 focus:border-blue-300 text-gray-900 placeholder-gray-500 shadow-sm"
              )}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all",
                  activeCategory === cat 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                    : theme === 'dark'
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "glass-panel text-gray-600 hover:bg-white/60"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          <AnimatePresence>
            {filteredFeatures.length > 0 ? (
              filteredFeatures.map((feature) => (
                <FeatureCard key={feature.title} {...feature} theme={theme} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-500 text-lg font-medium">No tools found matching your search.</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <h2 className="text-2xl font-bold mb-6 relative z-10">{t("study_progress")}</h2>
            <div className="space-y-8 relative z-10">
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-100">{t("weekly_goal")}</span>
                  <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-md">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-blue-900/30 rounded-full h-3 backdrop-blur-sm">
                  <div 
                    className="bg-white h-3 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="bg-white/20 p-3 rounded-xl">
                  <CheckSquare size={24} className="text-white" />
                </div>
                <p className="text-blue-50 font-medium">
                  {t("progress_completed", { 
                    count: completedCount, 
                    status: progress === 100 ? t("amazing_job") : t("keep_going") 
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className={cn(
            "rounded-3xl p-8 transition-all relative overflow-hidden",
            theme === 'dark' ? "glass-panel" : "glass-panel hover:shadow-lg"
          )}>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>{t("upcoming_tasks")}</h2>
              <Link to="/tracker" className="text-blue-600 text-sm font-bold hover:text-blue-700">{t("view_all")}</Link>
            </div>
            <div className="space-y-4 relative z-10">
              {upcomingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <p className="italic font-medium">{t("no_upcoming")}</p>
                </div>
              ) : (
                upcomingTasks.map((task, idx) => (
                  <div key={idx} className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                    theme === 'dark' ? "bg-gray-800/50 border-gray-700/50" : "bg-white/60 border-gray-100 shadow-sm"
                  )}>
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                    <span className={cn("text-base font-semibold truncate flex-1", theme === 'dark' ? "text-gray-200" : "text-gray-800")}>{task.title}</span>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">{task.deadline}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Analysis Chart Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-8 rounded-3xl p-8 mb-12",
            theme === 'dark' ? "glass-panel" : "glass-panel hover:shadow-lg transition-all"
          )}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className={cn("p-3 rounded-2xl shadow-sm", theme === 'dark' ? "bg-blue-900/30 border border-blue-800/30" : "bg-white border border-blue-100")}>
              <Sparkles className="text-blue-600" size={26} />
            </div>
            <div>
              <h2 className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>{t("usage_analysis")}</h2>
              <p className={cn("text-sm font-medium mt-1", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>{t("usage_subtitle")}</p>
            </div>
          </div>

          <div className="h-[350px] w-full">
            {usageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData} layout="vertical" margin={{ left: 40, right: 40, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? "#374151" : "#e5e7eb"} opacity={0.5} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 13, fontWeight: 600, fill: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
                    width={140}
                  />
                  <Tooltip 
                    cursor={{ fill: theme === 'dark' ? '#1f2937' : '#f8fafc', opacity: 0.4 }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: theme === 'dark' ? '1px solid #374151' : '1px solid #f3f4f6', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                      backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)',
                      color: theme === 'dark' ? '#f3f4f6' : '#111827',
                      fontWeight: 600
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={28}>
                    {usageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <div className={cn("p-6 rounded-full", theme === 'dark' ? "bg-gray-800/50" : "bg-gray-100/50")}>
                  <Compass size={40} className="opacity-50" />
                </div>
                <p className="italic font-medium">{t("no_usage_data")}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
