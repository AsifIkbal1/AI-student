import React from "react";
import { useAuth } from "./AuthContext";
import { GraduationCap, ArrowRight, Sparkles, Brain, Clock, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export const LandingPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-gray-900">AI Students</span>
        </div>
        <button 
          onClick={login}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold mb-6 uppercase tracking-wider">
            The Future of Learning is Here
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
            Your Personal <span className="text-blue-600">AI-Powered</span> <br /> Academic Companion
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            From solving complex math problems to generating structured study notes, 
            AI Students is designed to help you excel in your academic journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={login}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200"
            >
              Get Started for Free <ArrowRight size={20} />
            </button>
            <button className="bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all">
              View All Features
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
            <p className="text-gray-500 max-w-xl mx-auto">A comprehensive suite of AI tools tailored for students from school to university level.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Sparkles, title: "AI Tutor", desc: "24/7 academic support for any subject." },
              { icon: Brain, title: "Smart Notes", desc: "Convert any content into structured study notes." },
              { icon: Clock, title: "Study Planner", desc: "Personalized schedules with Pomodoro integration." },
              { icon: ShieldCheck, title: "Doubt Solver", desc: "Instant step-by-step solutions for complex problems." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
              >
                <div className="bg-blue-50 p-4 rounded-2xl w-fit mb-6">
                  <feature.icon className="text-blue-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 text-center text-gray-400 text-sm">
        <p>© 2026 AI Students. All rights reserved.</p>
      </footer>
    </div>
  );
};
