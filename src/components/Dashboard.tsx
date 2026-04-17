import React from "react";
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
  Library
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const FeatureCard = ({ icon: Icon, title, description, path, color, theme }: { icon: any, title: string, description: string, path: string, color: string, theme: string }) => (
  <Link to={path}>
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all h-full flex flex-col",
        theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
      )}
    >
      <div className={`p-3 rounded-xl w-fit mb-4 ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      <h3 className={cn("text-lg font-bold mb-2", theme === 'dark' ? "text-white" : "text-gray-900")}>{title}</h3>
      <p className={cn("text-sm mb-4 flex-1", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>{description}</p>
      <div className="flex items-center text-blue-600 text-sm font-semibold">
        {path === "/dashboard" ? "View" : "Get Started"} →
      </div>
    </motion.div>
  </Link>
);

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

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [usageData, setUsageData] = React.useState<any[]>([]);

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

      const formattedData = Object.keys(counts).map(tool => ({
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

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const upcomingTasks = tasks.filter(t => !t.completed).slice(0, 3);

  const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#a855f7', '#f97316', '#ec4899', '#ef4444', '#06b6d4'];

  const features = [
    {
      icon: MessageSquare,
      title: t("tutor"),
      description: t("desc_tutor"),
      path: "/tutor",
      color: "bg-blue-500"
    },
    {
      icon: FileText,
      title: t("notes"),
      description: t("desc_notes"),
      path: "/notes",
      color: "bg-indigo-500"
    },
    {
      icon: HelpCircle,
      title: t("quiz"),
      description: t("desc_quiz"),
      path: "/quiz",
      color: "bg-emerald-500"
    },
    {
      icon: PenTool,
      title: t("essay"),
      description: t("desc_essay"),
      path: "/essay",
      color: "bg-purple-500"
    },
    {
      icon: Brain,
      title: t("flashcards"),
      description: t("desc_flashcards"),
      path: "/flashcards",
      color: "bg-orange-500"
    },
    {
      icon: Calendar,
      title: t("planner"),
      description: t("desc_planner"),
      path: "/planner",
      color: "bg-pink-500"
    },
    {
      icon: ShieldCheck,
      title: t("doubt_solver"),
      description: t("desc_doubt"),
      path: "/doubt-solver",
      color: "bg-red-500"
    },
    {
      icon: Video,
      title: t("video_summarizer"),
      description: t("desc_video"),
      path: "/video-summarizer",
      color: "bg-rose-500"
    },
    {
      icon: Code,
      title: t("code_helper"),
      description: t("desc_code"),
      path: "/code-helper",
      color: "bg-cyan-500"
    },
    {
      icon: Presentation,
      title: t("slides"),
      description: t("desc_slides"),
      path: "/slides",
      color: "bg-amber-600"
    },
    {
      icon: FileSearch,
      title: t("chat_pdf"),
      description: t("desc_pdf"),
      path: "/chat-pdf",
      color: "bg-red-600"
    },
    {
      icon: Sparkles,
      title: t("smart_study"),
      description: t("desc_smart"),
      path: "/smart-study",
      color: "bg-blue-600"
    },
    {
      icon: Leaf,
      title: t("zenpath"),
      description: t("desc_zen"),
      path: "/zenpath",
      color: "bg-emerald-600"
    },
    {
      icon: Compass,
      title: t("career_roadmap"),
      description: t("desc_roadmap"),
      path: "/career-roadmap",
      color: "bg-indigo-600"
    },
    {
      icon: CheckSquare,
      title: t("tracker"),
      description: t("desc_tracker"),
      path: "/tracker",
      color: "bg-teal-500"
    },
    {
      icon: Network,
      title: t("diagrams"),
      description: t("desc_diagrams"),
      path: "/diagrams",
      color: "bg-violet-600"
    },
    {
      icon: Library,
      title: t("smart_resources"),
      description: t("desc_smart_resources"),
      path: "/smart-resources",
      color: "bg-emerald-700"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className={cn("text-3xl font-bold mb-2", theme === 'dark' ? "text-white" : "text-gray-900")}>
          {t("welcome_back")}, {profile?.displayName?.split(' ')[0]}! 👋
        </h1>
        <p className={cn(theme === 'dark' ? "text-gray-400" : "text-gray-500")}>
          {t("study_goal_prompt")}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} theme={theme} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-blue-600 rounded-3xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">{t("study_progress")}</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{t("weekly_goal")}</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-blue-400/30 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-blue-100 text-sm">
              {t("progress_completed", { 
                count: completedCount, 
                status: progress === 100 ? t("amazing_job") : t("keep_going") 
              })}
            </p>
          </div>
        </div>

        <div className={cn(
          "rounded-3xl p-8 border shadow-sm",
          theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
        )}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>{t("upcoming_tasks")}</h2>
            <Link to="/tracker" className="text-blue-600 text-sm font-semibold">{t("view_all")}</Link>
          </div>
          <div className="space-y-4">
            {upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <p className="italic">{t("no_upcoming")}</p>
              </div>
            ) : (
              upcomingTasks.map((task, idx) => (
                <div key={idx} className={cn(
                  "flex items-center gap-3 p-3 rounded-xl",
                  theme === 'dark' ? "bg-gray-800" : "bg-gray-50"
                )}>
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className={cn("text-sm font-medium truncate flex-1", theme === 'dark' ? "text-gray-200" : "text-gray-700")}>{task.title}</span>
                  <span className="text-xs text-gray-400">{task.deadline}</span>
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
          "mt-8 rounded-3xl p-8 border shadow-sm",
          theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
        )}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className={cn("p-2 rounded-lg", theme === 'dark' ? "bg-blue-900/20" : "bg-blue-50")}>
            <Sparkles className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>{t("usage_analysis")}</h2>
            <p className={cn("text-sm", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>{t("usage_subtitle")}</p>
          </div>
        </div>

        <div className="h-[300px] w-full">
          {usageData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? "#1f2937" : "#f3f4f6"} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 500, fill: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
                  width={120}
                />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? '#111827' : '#f9fafb' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#000000'
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                  {usageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <div className={cn("p-4 rounded-full", theme === 'dark' ? "bg-gray-800" : "bg-gray-50")}>
                <Compass size={32} />
              </div>
              <p className="italic">{t("no_usage_data")}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
