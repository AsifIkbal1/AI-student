import React, { useState } from "react";
import { Sparkles, Loader2, Upload, FileText, Youtube, Image as ImageIcon, Type, Copy, CheckCircle2 } from "lucide-react";
import { generateSmartStudyPackage, logUsage, handleAIError } from "../lib/ai";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { useAuth } from "./AuthContext";
import { cn } from "../lib/utils";
import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

// Set worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export const SmartStudyMode: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const [input, setInput] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>("notes");

  const modes = [
    { id: "pdf", label: "PDF Analysis", icon: FileText, color: "bg-blue-50", iconColor: "text-blue-600", bgIcon: "bg-blue-100", description: "Upload a PDF to generate a study package." },
    { id: "youtube", label: "YT Summary", icon: Youtube, color: "bg-red-50", iconColor: "text-red-600", bgIcon: "bg-red-100", description: "Paste a YouTube URL to summarize and learn." },
    { id: "ocr", label: "OCR Support", icon: ImageIcon, color: "bg-emerald-50", iconColor: "text-emerald-600", bgIcon: "bg-emerald-100", description: "Upload an image of text/notes for analysis." },
    { id: "notes", label: "Smart Notes", icon: Type, color: "bg-purple-50", iconColor: "text-purple-600", bgIcon: "bg-purple-100", description: "Paste any text to turn it into a study system." },
  ];

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      return fullText;
    } catch (error) {
      console.error("PDF Extraction Error:", error);
      return "";
    }
  };

  const handleGenerate = async () => {
    if (!input.trim() && !file && !ytUrl.trim()) return;

    if (profile && profile.role !== "admin" && profile.credits < 5) {
      setResult("Error: You need at least 5 credits to use Smart Study Mode. Please upgrade your plan.");
      return;
    }

    setLoading(true);
    try {
      let fileData;
      let extractedText = "";

      if (file) {
        if (file.type === "application/pdf") {
          extractedText = await extractTextFromPDF(file);
        }

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
        });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;
        fileData = { data: base64, mimeType: file.type };
      }

      // Refine prompt based on mode
      let finalInput = input;
      if (extractedText) {
        finalInput = `${input}\n\n[Extracted from PDF]:\n${extractedText}`;
      }

      if (selectedMode === "youtube") {
        finalInput = `YouTube Video URL: ${ytUrl}\nContext: ${finalInput}\nPlease analyze this video and create a study package.`;
      } else if (selectedMode === "pdf") {
        finalInput = `PDF Analysis Request.\nContext: ${finalInput}\nPlease analyze the uploaded PDF and create a study package.`;
      } else if (selectedMode === "ocr") {
        finalInput = `Image/OCR Analysis Request.\nContext: ${finalInput}\nPlease analyze the text in the uploaded image and create a study package.`;
      }

      const { text, usage } = await generateSmartStudyPackage(
        finalInput, 
        (fileData && fileData.mimeType.startsWith("image/")) ? fileData : undefined
      );
      setResult(text || "");
      if (profile) {
        await deductCredits(5);
        await logUsage(profile.uid, `SmartStudyMode-${selectedMode}`, usage);
      }
    } catch (error) {
      setResult(handleAIError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Sparkles className="text-blue-600" />
          Smart Study Mode
        </h1>
        <p className="text-gray-500">Turn any input into a complete study system instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={cn(
                  "p-4 rounded-2xl flex items-center gap-3 transition-all border-2 text-left",
                  selectedMode === m.id 
                    ? `border-blue-500 ${m.color} ring-2 ring-blue-100` 
                    : "border-transparent bg-white hover:bg-gray-50 border-gray-100"
                )}
              >
                <div className={cn("p-2 rounded-lg", m.bgIcon)}>
                  <m.icon className={m.iconColor} size={20} />
                </div>
                <span className={cn("text-xs font-bold uppercase tracking-wider", selectedMode === m.id ? "text-blue-800" : "text-gray-600")}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {modes.find(m => m.id === selectedMode)?.label}
              </h3>
              <p className="text-sm text-gray-500">
                {modes.find(m => m.id === selectedMode)?.description}
              </p>
            </div>

            <div className="space-y-6">
              {selectedMode === "youtube" && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    YouTube Video URL
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                      <Youtube size={20} />
                    </div>
                    <input
                      type="text"
                      value={ytUrl}
                      onChange={(e) => setYtUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {(selectedMode === "pdf" || selectedMode === "ocr") && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Upload {selectedMode === "pdf" ? "PDF File" : "Image File"}
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept={selectedMode === "pdf" ? ".pdf" : "image/*"}
                    />
                    <div className={cn(
                      "border-2 border-dashed rounded-2xl p-8 text-center transition-all",
                      file ? "border-blue-400 bg-blue-50" : "border-gray-200 group-hover:border-blue-400"
                    )}>
                      <Upload className={cn("mx-auto mb-2", file ? "text-blue-500" : "text-gray-400 group-hover:text-blue-500")} size={32} />
                      <p className={cn("text-sm", file ? "text-blue-700 font-medium" : "text-gray-500")}>
                        {file ? file.name : `Click or drag to upload ${selectedMode === "pdf" ? "PDF" : "Image"}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  {selectedMode === "notes" ? "Input Content" : "Additional Context (Optional)"}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedMode === "notes" ? "Paste text or additional context here..." : "Add any specific instructions or context..."}
                  className="w-full h-40 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || (!input.trim() && !file && !ytUrl.trim())}
              className="w-full mt-8 bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
              Generate Study Package
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">Complete Study Package</span>
            {result && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
            )}
          </div>
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                <div className="bg-gray-50 p-6 rounded-full">
                  <Sparkles size={48} />
                </div>
                <p className="max-w-xs italic">Provide input and click generate to receive your summary, notes, flashcards, and quiz.</p>
              </div>
            )}
            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-blue-600 font-semibold">Analyzing and generating your package...</p>
              </div>
            )}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-blue max-w-none"
              >
                <ReactMarkdown>{result}</ReactMarkdown>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
