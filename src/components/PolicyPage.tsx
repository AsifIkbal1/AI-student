import React from "react";
import { Shield, FileText, RefreshCw, Mail, ArrowLeft, GraduationCap } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const policyContent = {
  privacy: {
    title: "Privacy Policy",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    content: (
      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h3>
          <p className="text-gray-600 leading-relaxed">
            We collect personal information that you voluntarily provide to us when you register on the platform. This includes your name, email address, and profile picture provided via Google or Email authentication. We also track usage data, including the number of API tokens consumed and the specific AI tools utilized, to improve our service delivery.
          </p>
        </section>
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Data</h3>
          <p className="text-gray-600 leading-relaxed">
            Your information is used to personalize your learning experience, manage your subscription status, and calculate referral rewards. We utilize your AI prompts to generate responses via Google Gemini and OpenAI. Please note that while we log usage for administrative purposes, we do not sell your personal data to third-party advertisers.
          </p>
        </section>
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">3. Data Security & Sovereignty</h3>
          <p className="text-gray-600 leading-relaxed">
            We prioritize the security of your data. While authentication is handled securely by Firebase, your detailed usage logs and platform activity are stored in our private local database to ensure data sovereignty. We implement industry-standard encryption to protect your information from unauthorized access.
          </p>
        </section>
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">4. Third-Party Services</h3>
          <p className="text-gray-600 leading-relaxed">
            Our platform interacts with third-party AI providers (Google and OpenAI) to process your academic requests. These providers receive only the data necessary to generate a response and are subject to their own privacy protocols.
          </p>
        </section>
      </div>
    )
  },
  terms: {
    title: "Terms of Service",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    content: (
      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h3>
          <p className="text-gray-600 leading-relaxed">
            By creating an account on AI Students, you agree to abide by these Terms of Service. If you do not agree with any part of these terms, you are prohibited from using the service.
          </p>
        </section>
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">2. Subscription & No-Refund Policy</h3>
          <p className="text-gray-600 leading-relaxed">
            Access to premium features requires a paid subscription. Since our service provides immediate digital value and AI processing costs are incurred instantly, <strong>all payments are final and non-refundable</strong>. For manual payments (bKash/Nagad), access will be granted only after successful verification by our administration team.
          </p>
        </section>
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">3. Acceptable Use of AI</h3>
          <p className="text-gray-600 leading-relaxed">
            The AI-generated content provided by our tools (AITutor, NeuroTest, etc.) is intended for educational assistance and supplementary learning. Users are responsible for verifying the accuracy of AI outputs for their academic requirements. Abuse of the system through automated bots or scripts may lead to immediate account suspension.
          </p>
        </section>
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-3">4. Account Termination</h3>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to suspend or terminate any account that violates our terms, engages in fraudulent activities, or attempts to circumvent our payment or security systems. In the event of a ban, no refunds for remaining subscription time will be provided.
          </p>
        </section>
      </div>
    )
  },
  contact: {
    title: "Contact Us",
    icon: Mail,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border-blue-100">
            <h4 className="font-bold text-gray-900 mb-2">Email Support</h4>
            <p className="text-gray-600">support@aistudents.com</p>
            <p className="text-xs text-gray-400 mt-1">Response time: &lt; 24 hours</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border-purple-100">
            <h4 className="font-bold text-gray-900 mb-2">Technical Issues</h4>
            <p className="text-gray-600">tech@aistudents.com</p>
            <p className="text-xs text-gray-400 mt-1">Available 24/7</p>
          </div>
        </div>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Your Name" className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="email" placeholder="Your Email" className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <textarea placeholder="How can we help?" rows={4} className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all">
            Send Message
          </button>
        </form>
      </div>
    )
  }
};

export const PolicyPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const policy = policyContent[type as keyof typeof policyContent];

  if (!policy) {
    return <div className="min-h-screen flex items-center justify-center">Policy not found</div>;
  }

  const Icon = policy.icon;

  return (
    <div className="min-h-screen bg-gradient-mesh py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 font-semibold transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="glass-panel rounded-[2rem] p-8 md:p-12 shadow-2xl border-white/40">
          <div className="flex items-center gap-6 mb-12">
            <div className={cn("p-5 rounded-2xl shadow-lg", policy.bgColor)}>
              <Icon className={policy.color} size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{policy.title}</h1>
              <p className="text-gray-500 font-medium mt-1">Last updated: April 2026</p>
            </div>
          </div>

          <div className="prose prose-blue max-w-none">
            {policy.content}
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="text-white" size={20} />
              </div>
              <span className="font-bold text-gray-900">AI Students</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              © 2026 AI Students. Empowering the next generation of learners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
