import React, { useState } from "react";
import { ShieldCheck, Upload, Loader2, Camera, Sparkles } from "lucide-react";
import { solveDoubt, logUsage, handleAIError } from "../lib/ai";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { useAuth } from "./AuthContext";

export const AIDoubtSolver: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!image || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 3) {
      setSolution("Error: You need at least 3 credits to solve a doubt. Please upgrade your plan.");
      return;
    }

    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const { text, usage } = await solveDoubt(base64Data);
      setSolution(text || "");
      if (profile) {
        await deductCredits(3);
        await logUsage(profile.uid, "AIDoubtSolver", usage);
      }
    } catch (error) {
      setSolution(handleAIError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Doubt Solver</h1>
        <p className="text-gray-500">Upload a photo of your question to get instant, step-by-step solutions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div 
              className={cn(
                "border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer relative overflow-hidden h-80 flex flex-col items-center justify-center",
                image ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
              )}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <input 
                id="image-upload"
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
              
              {image ? (
                <img src={image} alt="Uploaded" className="absolute inset-0 w-full h-full object-contain p-4" />
              ) : (
                <>
                  <div className="bg-blue-50 p-4 rounded-2xl mb-4">
                    <Camera className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Question Photo</h3>
                  <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
                </>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setImage(null)}
                className="flex-1 bg-white text-gray-600 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Clear
              </button>
              <button
                onClick={handleSolve}
                disabled={loading || !image}
                className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                Solve Now
              </button>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <h4 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
              <Sparkles size={18} /> Pro Tip
            </h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              Make sure the question is well-lit and clearly visible. For math problems, ensure all symbols and numbers are legible.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
            <div className="bg-emerald-50 p-2 rounded-lg">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Step-by-Step Solution</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!solution && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <ShieldCheck size={48} />
                </div>
                <p className="max-w-xs italic">Upload a question and click "Solve Now" to see the magic happen.</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-4 py-10">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-blue-600 font-semibold">Analyzing problem...</p>
              </div>
            )}

            {solution && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-blue max-w-none"
              >
                <ReactMarkdown>{solution}</ReactMarkdown>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import { CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";
