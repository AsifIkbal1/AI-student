import React from "react";
import { useAuth } from "./AuthContext";
import { GraduationCap, ArrowRight, Sparkles, Brain, Clock, ShieldCheck, Shield, FileText, RefreshCw, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import { cn } from "../lib/utils";

export const LandingPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-mesh overflow-hidden">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
            <GraduationCap className="text-white" size={26} />
          </div>
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">AI Students</span>
        </div>
        <button 
          onClick={login}
          className="glass-panel text-blue-700 px-8 py-2.5 rounded-full font-bold hover:bg-white/60 transition-all shadow-sm"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 glass-panel px-5 py-2 rounded-full text-sm font-bold mb-8 uppercase tracking-wider text-blue-700 border border-blue-200/50 shadow-sm"
          >
            <Sparkles size={16} className="text-blue-600" />
            The Future of Learning is Here
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
            Your Personal <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-sm">AI-Powered</span> <br /> 
            Academic Companion
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            From solving complex math problems to generating structured study notes, 
            AI Students is designed to help you excel in your academic journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <button 
              onClick={login}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
            >
              Get Started for Free 
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => {
                const featuresSection = document.getElementById('features');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="glass-panel text-gray-900 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/50 transition-all transform hover:-translate-y-1 cursor-pointer"
            >
              View All Features
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
            {[
              { value: "10k+", label: "Active Students" },
              { value: "15+", label: "AI Study Tools" },
              { value: "99%", label: "Satisfaction Rate" },
              { value: "24/7", label: "Instant Support" }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center shadow-sm"
              >
                <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Everything you need to succeed</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">A comprehensive suite of AI tools tailored for students from school to university level.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Sparkles, title: "AI Tutor", desc: "24/7 personalized academic support for any subject.", color: "from-blue-500 to-cyan-500" },
              { icon: Brain, title: "Smart Notes", desc: "Convert any content into structured, easy-to-read study notes.", color: "from-purple-500 to-pink-500" },
              { icon: Clock, title: "Study Planner", desc: "Personalized schedules with integrated Pomodoro timers.", color: "from-orange-500 to-red-500" },
              { icon: ShieldCheck, title: "Doubt Solver", desc: "Instant step-by-step solutions for your most complex problems.", color: "from-emerald-500 to-teal-500" }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -15, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-panel p-8 rounded-3xl cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className={cn(
                  "p-4 rounded-2xl w-fit mb-6 bg-gradient-to-br text-white shadow-lg",
                  feature.color
                )}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Policies & Contact Section */}
      <section className="py-24 relative z-10 bg-white/30 backdrop-blur-md border-y border-white/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Privacy Policy", link: "/policy/privacy", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: FileText, title: "Terms & Conditions", link: "/policy/terms", color: "text-purple-600", bg: "bg-purple-50" },
              { icon: RefreshCw, title: "Refund Policy", link: "/policy/refund", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Mail, title: "Contact Us", link: "/policy/contact", color: "text-pink-600", bg: "bg-pink-50" }
            ].map((item, idx) => (
              <Link 
                key={idx} 
                to={item.link}
                className="group p-6 rounded-3xl transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 flex flex-col items-center text-center"
              >
                <div className={cn("p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110", item.bg)}>
                  <item.icon className={item.color} size={28} />
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Read Details →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 relative z-10 glass-panel border-x-0 border-b-0 rounded-none bg-white/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">AI Students</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-600">
            <Link to="/policy/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
            <Link to="/policy/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
            <Link to="/policy/refund" className="hover:text-blue-600 transition-colors">Refund</Link>
            <Link to="/policy/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>

          <p className="text-sm text-gray-500 font-medium">© 2026 AI Students. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};
