import React, { useState } from "react";
import { FileText, Loader2, Save, Sparkles } from "lucide-react";
import { generateNotes, logUsage, handleAIError } from "../lib/ai";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";

export const AINoteMaker: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const { setCurrentTopic } = useLanguage();
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!content.trim() || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 2) {
      setNotes("Error: You have run out of credits. Please upgrade your plan to continue.");
      return;
    }
    
    setLoading(true);
    try {
      const { text, usage } = await generateNotes(content);
      setNotes(text || "");
      
      // Automation: Set topic for Smart Resources (take first line or title)
      const topic = text?.split('\n')[0].replace('#', '').trim() || content.slice(0, 50);
      setCurrentTopic(topic);

      if (profile) {
        await deductCredits(2);
        await logUsage(profile.uid, "AINoteMaker", usage);
      }
    } catch (error) {
      setNotes(handleAIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!notes || saving || !profile) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "notes"), {
        uid: profile.uid,
        title: notes.split('\n')[0].replace('#', '').trim() || "Untitled Note",
        content: notes,
        sourceType: "text",
        createdAt: new Date().toISOString()
      });
      alert("Note saved successfully!");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[98%] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Note Maker</h1>
          <p className="text-gray-500">Convert long text into structured notes</p>
        </div>
        {notes && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Save Note
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-16rem)]">
        {/* Input Area */}
        <div className="lg:col-span-4 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-700">Source Content</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your long text, lecture transcript, or article here..."
            className="flex-1 p-6 resize-none focus:outline-none text-gray-800 leading-relaxed"
          />
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={handleGenerate}
              disabled={loading || !content.trim()}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <FileText size={24} />}
              Generate Structured Notes
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-bold text-gray-700">AI Generated Notes</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            {!notes && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                <div className="bg-gray-50 p-6 rounded-full">
                  <Sparkles size={48} />
                </div>
                <p className="max-w-xs italic">Your structured notes will appear here after generation.</p>
              </div>
            )}
            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-blue-600 font-semibold">Summarizing content...</p>
              </div>
            )}
            {notes && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-blue max-w-none"
              >
                <ReactMarkdown>{notes}</ReactMarkdown>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
