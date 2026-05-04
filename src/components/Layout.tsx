import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  HelpCircle, 
  PenTool, 
  CreditCard, 
  Settings, 
  LogOut, 
  GraduationCap,
  Brain,
  Library,
  Gift,
  Calendar,
  Code,
  Video,
  Presentation,
  CheckSquare,
  ShieldCheck,
  Sparkles,
  FileSearch,
  Compass,
  Leaf,
  Sun,
  Moon,
  Network,
  Languages,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Cpu
} from "lucide-react";

import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";
import { CortexNotificationListener } from "./CortexStudio/CortexNotificationListener";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const SidebarItem = ({ icon: Icon, label, path, active, theme, isCollapsed }: { icon: any, label: string, path: string, active: boolean, theme: string, isCollapsed?: boolean }) => (
  <Link
    to={path}
    title={isCollapsed ? label : ""}
    className={cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium",
      active 
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20" 
        : theme === 'dark' 
          ? "text-gray-400 hover:bg-gray-800/50 hover:text-white" 
          : "text-gray-600 hover:bg-white/60",
      isCollapsed ? "justify-center px-2" : ""
    )}
  >
    <Icon size={20} className="shrink-0" />
    {!isCollapsed && <span className="font-medium truncate">{label}</span>}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(isCollapsed));
  }, [isCollapsed]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };


  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: t("dashboard"), path: "/dashboard" },
    { icon: MessageSquare, label: t("tutor"), path: "/tutor" },
    { icon: FileText, label: t("notes"), path: "/notes" },
    { icon: HelpCircle, label: t("quiz"), path: "/quiz" },
    { icon: PenTool, label: t("essay"), path: "/essay" },
    { icon: Brain, label: t("flashcards"), path: "/flashcards" },
    { icon: Calendar, label: t("planner"), path: "/planner" },
    { icon: ShieldCheck, label: t("doubt_solver"), path: "/doubt-solver" },
    { icon: Code, label: t("code_helper"), path: "/code-helper" },
    { icon: Presentation, label: t("slides"), path: "/slides" },
    { icon: FileSearch, label: t("chat_pdf"), path: "/chat-pdf" },
    { icon: Sparkles, label: t("smart_study"), path: "/smart-study" },
    { icon: Leaf, label: t("zenpath"), path: "/zenpath" },
    { icon: Compass, label: t("career_roadmap"), path: "/career-roadmap" },
    { icon: CheckSquare, label: t("tracker"), path: "/tracker" },
    { icon: Network, label: t("diagrams"), path: "/diagrams" },
    { icon: Library, label: t("smart_resources"), path: "/smart-resources" },
    { icon: Cpu, label: t("cortex_studio"), path: "/cortex-studio" },
    { icon: FileText, label: t("digital_notes"), path: "/digital-notes" },
    { icon: CreditCard, label: t("subscription"), path: "/subscription" },
    { icon: HelpCircle, label: "Help & Support", path: "/support" },
  ];

  const specializedItems = [
    { icon: Gift, label: "Refer & Earn", path: "/referrals" },
    { icon: Brain, label: t("neurotest_ai"), path: "/neurotest-ai" },
  ];

  const adminItems = [
    { icon: Settings, label: t("admin_dashboard"), path: "/admin" },
  ];

  if (profile?.isBlocked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-2xl">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-red-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("access_denied")}</h1>
          <p className="text-gray-500 mb-8">{t("account_suspended")}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            {t("sign_out")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen", theme === 'dark' ? "bg-gray-900" : "bg-gradient-mesh")}>
      {/* Mobile Header */}
      <div className={cn(
        "md:hidden fixed top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-4 z-40 transition-colors shadow-sm",
        theme === 'dark' ? "glass-panel border-gray-800 text-white" : "glass-panel border-white/60 text-gray-900"
      )}>
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <GraduationCap className="text-white" size={20} />
          </div>
          <span className="font-bold">AI Students</span>
        </Link>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 md:relative flex flex-col transition-all duration-300 ease-in-out border-r",
        theme === 'dark' ? "glass-panel border-gray-800/50" : "glass-panel border-white/60",
        isCollapsed ? "w-20" : "w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className={cn(
          "p-4 border-b transition-all duration-300",
          isCollapsed ? "flex flex-col items-center gap-4 min-h-[80px]" : "flex flex-col gap-4"
        )}>
          {/* Top Row: Logo & Close (Mobile) */}
          <div className="flex items-center justify-between w-full">
            {!isCollapsed ? (
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity overflow-hidden">
                <div className="bg-blue-600 p-2 rounded-lg shrink-0">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <h1 className={cn("text-lg font-bold underline decoration-blue-500/30 underline-offset-4 truncate", theme === 'dark' ? "text-white" : "text-gray-900")}>AI Students</h1>
              </Link>
            ) : (
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="text-white" size={24} />
              </div>
            )}

            {/* mobile close button */}
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={24} />
            </button>
          </div>

          {/* Bottom Row: Toggles */}
          <div className={cn(
            "flex items-center w-full",
            isCollapsed ? "flex-col gap-3" : "justify-between gap-2"
          )}>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <button
                onClick={toggleLanguage}
                title={isCollapsed ? `Switch to ${language === 'en' ? 'Bangla' : 'English'}` : ""}
                className={cn(
                  "p-2 rounded-lg transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-blue-500 outline-none",
                  theme === 'dark' ? "bg-gray-800 text-blue-400 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <Languages size={18} />
                {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-tighter">{language}</span>}
              </button>
              <button
                onClick={toggleTheme}
                title={isCollapsed ? `Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode` : ""}
                className={cn(
                  "p-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 outline-none",
                  theme === 'dark' ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "hidden md:flex p-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 outline-none",
                theme === 'dark' ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 pt-4 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={location.pathname === item.path}
              theme={theme}
              isCollapsed={isCollapsed}
            />
          ))}

          {!isCollapsed && specializedItems.length > 0 && (
            <div className="pt-4 pb-2">
              <div className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 opacity-50">
                Performance AI
              </div>
            </div>
          )}
          
          {specializedItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={location.pathname === item.path}
              theme={theme}
              isCollapsed={isCollapsed}
            />
          ))}

          {profile?.role === "admin" && (
            <>
              <div className={cn(
                "mt-8 mb-2 px-4 text-[10px] font-black uppercase tracking-widest",
                theme === 'dark' ? "text-gray-600" : "text-gray-400",
                isCollapsed ? "text-center px-0" : ""
              )}>
                {isCollapsed ? "ADM" : t("admin_only")}
              </div>
              {adminItems.map((item) => (
                <SidebarItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  active={location.pathname === item.path}
                  theme={theme}
                  isCollapsed={isCollapsed}
                />
              ))}
            </>
          )}
        </nav>

        <div className={cn(
          "p-4 border-t transition-colors",
          theme === 'dark' ? "border-gray-800" : "border-gray-200"
        )}>
          <div className={cn(
            "flex items-center gap-3 mb-4",
            isCollapsed ? "justify-center px-0" : "px-2"
          )}>
            <img 
              src={profile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.displayName || "User")}&background=2563eb&color=fff`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold truncate", theme === 'dark' ? "text-white" : "text-gray-900")}>{profile?.displayName}</p>
                <p className={cn("text-xs truncate", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>{profile?.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title={isCollapsed ? t("sign_out") : ""}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors font-medium",
              theme === 'dark' ? "text-red-400 hover:bg-red-900/20" : "text-red-600 hover:bg-red-50",
              isCollapsed ? "justify-center px-2" : ""
            )}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>{t("sign_out")}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-y-auto transition-colors pt-16 md:pt-0 bg-transparent flex flex-col"
      )}>

        <div className="w-full p-4 md:p-8">
          {children}
        </div>

        {/* Global Footer for Logged-in Users */}
        <footer className={cn(
          "mt-auto py-8 border-t px-8",
          theme === 'dark' ? "border-gray-800 text-gray-400" : "border-gray-200 text-gray-500"
        )}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-70">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <GraduationCap className="text-white" size={16} />
              </div>
              <span className="font-bold text-sm">AI Students</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-wider">
              <Link to="/policy/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
              <Link to="/policy/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
              <Link to="/policy/refund" className="hover:text-blue-600 transition-colors">Refund</Link>
              <Link to="/policy/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link>
            </div>

            <p className="text-xs font-medium">© 2026 AI Students</p>
          </div>
        </footer>
      </main>
      <CortexNotificationListener />
    </div>
  );
};
