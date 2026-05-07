import React from "react";
import { useAuth } from "./AuthContext";
import { GraduationCap, ArrowRight, Sparkles, Brain, Clock, ShieldCheck, Shield, FileText, RefreshCw, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import { cn } from "../lib/utils";

export const LandingPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-mesh bg-grid-pattern overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="glow-spot top-[-10%] left-[-10%] opacity-60 animate-pulse" />
      <div className="glow-spot bottom-[10%] right-[-10%] opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="glow-spot top-[40%] right-[20%] opacity-30 animate-float" />

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform duration-300">
            <GraduationCap className="text-white" size={28} />
          </div>
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-400 tracking-tighter">AI Students</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600 dark:text-gray-300">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
        </div>
        <button 
          onClick={login}
          className="glass-panel text-blue-700 dark:text-blue-400 px-8 py-3 rounded-2xl font-bold hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all shadow-sm border border-white/40"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 glass-panel px-6 py-2.5 rounded-full text-xs font-black mb-10 uppercase tracking-widest text-blue-700 dark:text-blue-400 border border-blue-200/50 shadow-xl shadow-blue-500/5"
          >
            <Sparkles size={14} className="text-blue-600 animate-pulse" />
            Empowering the Next Generation of Scholars
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white mb-10 leading-[1.1] tracking-tight text-glow">
            Master Your Studies <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-2xl">With Precision AI</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
            The all-in-one academic command center. Solve problems, generate notes, 
            and accelerate your learning with state-of-the-art artificial intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
            <button 
              onClick={login}
              className="group shimmer-effect bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-12 py-6 rounded-3xl font-bold text-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95"
            >
              Start Learning Free 
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="glass-panel text-gray-900 dark:text-white px-12 py-6 rounded-3xl font-bold text-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all transform hover:-translate-y-1 active:scale-95 border border-white/20"
            >
              Explore Tools
            </button>
          </div>

          {/* Trusted By Section */}
          <div className="pt-10 border-t border-gray-200/30 max-w-5xl mx-auto">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em] mb-10">Trusted by students worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="text-2xl font-black text-gray-800 dark:text-white">HARVARD</div>
               <div className="text-2xl font-black text-gray-800 dark:text-white">OXFORD</div>
               <div className="text-2xl font-black text-gray-800 dark:text-white">STANFORD</div>
               <div className="text-2xl font-black text-gray-800 dark:text-white">MIT</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-40 relative z-10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Intelligence for every task</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">Professional-grade AI tools designed specifically for the rigorous demands of modern academia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { icon: Sparkles, title: "AI Tutor", desc: "Expert academic support for math, science, and humanities.", color: "from-blue-600 to-indigo-600" },
              { icon: Brain, title: "Smart Notes", desc: "Instantly transform complex lectures into structured study guides.", color: "from-purple-600 to-fuchsia-600" },
              { icon: FileText, title: "PDF Analyst", desc: "Deep-dive into research papers and textbooks with pinpoint accuracy.", color: "from-orange-600 to-amber-600" },
              { icon: ShieldCheck, title: "Pro Solutions", desc: "Step-by-step logic and reasoning for your toughest assignments.", color: "from-emerald-600 to-teal-600" }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -20 }}
                className="glass-panel p-10 rounded-[2.5rem] cursor-pointer group shadow-xl shadow-blue-500/5 hover:shadow-blue-500/10 border border-white/40 dark:border-white/10 shimmer-effect"
              >
                <div className={cn(
                  "p-5 rounded-2xl w-fit mb-8 bg-gradient-to-br text-white shadow-2xl transform group-hover:rotate-6 transition-transform",
                  feature.color
                )}>
                  <feature.icon size={36} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-5 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 relative z-10 glass-panel border-x-0 border-b-0 rounded-none bg-white/40 dark:bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 pb-12 border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <GraduationCap className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white">AI Students</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-10 text-sm font-black text-gray-500 uppercase tracking-widest">
              <Link to="/policy/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
              <Link to="/policy/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
              <Link to="/policy/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            </div>

            <div className="flex gap-6">
               <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"><Mail size={18}/></div>
            </div>
          </div>
          
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-500 font-bold">© 2026 AI Students. Designed for elite academic performance.</p>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-emerald-500" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">Secure & Verified Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
