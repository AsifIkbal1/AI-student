import React, { useState, useEffect, useRef } from "react";
import { 
  Network, 
  FileText, 
  Upload, 
  Database, 
  Download, 
  Loader2, 
  Zap, 
  Maximize2, 
  Layers, 
  Palette, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { generateDiagramCode, logUsage, handleAIError } from "../lib/ai";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { cn } from "../lib/utils";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import mermaid from "mermaid";
import * as pdfjsLib from "pdfjs-dist";

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif'
});

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// --- Mermaid Preview Component ---
const MermaidPreview: React.FC<{ chart: string; id: string; theme: string }> = ({ chart, id, theme }) => {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart) return;
      try {
        setError(null);
        // Clean up previous renders
        const container = document.getElementById(`mermaid-temp-${id}`);
        if (container) container.innerHTML = "";
        
        const { svg: renderedSvg } = await mermaid.render(`mermaid-svg-${id}`, chart);
        setSvg(renderedSvg);
      } catch (e: any) {
        console.error("Mermaid Render Error:", e);
        setError("AI generated an invalid diagram structure. Try regenerating or simplified complexity.");
      }
    };
    renderChart();
  }, [chart, id, theme]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center">
        <AlertTriangle size={32} className="mb-2" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full flex items-center justify-center overflow-auto p-4"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

export const AIDiagramGenerator: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<"text" | "pdf" | "notes">("text");
  const [inputText, setInputText] = useState("");
  const [diagramType, setDiagramType] = useState<"mindmap" | "flowchart" | "diagram">("mindmap");
  const [complexity, setComplexity] = useState<"simple" | "detailed">("detailed");
  const [diagramTheme, setDiagramTheme] = useState("default");
  
  const [loading, setLoading] = useState(false);
  const [diagramCode, setDiagramCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // PDF states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  
  // Notes states
  const [userNotes, setUserNotes] = useState<any[]>([]);
  const [fetchingNotes, setFetchingNotes] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Fetch user notes when on notes tab
  useEffect(() => {
    if (activeTab === "notes" && userNotes.length === 0) {
      fetchUserNotes();
    }
  }, [activeTab]);

  const fetchUserNotes = async () => {
    if (!profile) return;
    setFetchingNotes(true);
    try {
      const q = query(collection(db, "notes"), where("uid", "==", profile.uid));
      const snap = await getDocs(q);
      setUserNotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Fetch notes error:", err);
    } finally {
      setFetchingNotes(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported for diagram generation.");
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let fullText = "";
          
          // Extract text from first 5 pages max to avoid hitting token limits
          const maxPages = Math.min(pdf.numPages, 5);
          for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
          }
          
          setInputText(fullText);
          setLoading(false);
        } catch (err) {
          setError("Failed to parse PDF content. It might be an image-only PDF.");
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError("Failed to read file.");
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim() || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 5) {
      setError("Insufficient credits. 5 credits required for diagram generation.");
      return;
    }

    setLoading(true);
    setError(null);
    setDiagramCode("");

    try {
      const { text, usage } = await generateDiagramCode(inputText, diagramType, complexity);
      setDiagramCode(text);
      
      if (profile) {
        await deductCredits(5);
        await logUsage(profile.uid, "AIDiagramGenerator", usage);
      }
    } catch (err) {
      setError(handleAIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleExportPNG = () => {
    const svgElement = document.querySelector(".mermaid-container svg") as SVGSVGElement;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width * 2; // High DPI
      canvas.height = img.height * 2;
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `diagram-${Date.now()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={cn("text-3xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>AI Mind Map & Diagrams</h1>
          <p className={cn("mt-1", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>Transform study materials into intuitive visual learning tools</p>
        </div>
        
        {diagramCode && (
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportPNG}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all"
            >
              <Download size={16} /> PNG
            </button>
            <button 
              onClick={handleExportPDF}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all"
            >
              <Layers size={16} /> PDF
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- Left Column: Inputs & Config --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className={cn(
            "rounded-3xl border shadow-sm p-6 overflow-hidden",
            theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
          )}>
            {/* Tabs */}
            <div className={cn(
              "flex p-1 rounded-2xl mb-6",
              theme === 'dark' ? "bg-gray-800" : "bg-gray-100"
            )}>
              {(["text", "pdf", "notes"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all capitalize",
                    activeTab === tab 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {tab === "pdf" ? "PDF Upload" : tab === "notes" ? "AI Notes" : "Paste Text"}
                </button>
              ))}
            </div>

            {/* Input Content */}
            <AnimatePresence mode="wait">
              {activeTab === "text" && (
                <motion.div 
                  key="text"
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter process steps, concepts or lecture notes..."
                    className={cn(
                      "w-full h-40 p-4 rounded-2xl border resize-none focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed",
                      theme === 'dark' ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"
                    )}
                  />
                </motion.div>
              )}

              {activeTab === "pdf" && (
                <motion.div 
                  key="pdf"
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "group border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-40",
                      theme === 'dark' ? "border-gray-700 hover:border-blue-500 bg-gray-800" : "border-gray-200 hover:border-blue-500 bg-gray-50"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".pdf" 
                      onChange={handleFileUpload} 
                    />
                    <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-700">{fileName || "Click to upload PDF"}</p>
                    <p className="text-xs text-gray-500 mt-1">AI will extract key concepts automatically</p>
                  </div>
                </motion.div>
              )}

              {activeTab === "notes" && (
                <motion.div 
                  key="notes"
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <button 
                    onClick={() => setShowNotesModal(true)}
                    className={cn(
                      "w-full h-40 border rounded-3xl flex flex-col items-center justify-center gap-3 transition-colors",
                      theme === 'dark' ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "bg-gray-50 border-gray-200 hover:bg-white"
                    )}
                  >
                    <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                      <Database size={24} />
                    </div>
                    <span className="font-bold text-sm text-gray-700">Select from Saved Notes</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <hr className={cn("my-6", theme === 'dark' ? "border-gray-800" : "border-gray-100")} />

            {/* Options */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2 block">Diagram Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "mindmap", label: "Mind Map" },
                    { val: "flowchart", label: "Flowchart" },
                    { val: "diagram", label: "Hierarchy" }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setDiagramType(opt.val as any)}
                      className={cn(
                        "py-2 rounded-xl text-[10px] font-bold border transition-all",
                        diagramType === opt.val 
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200" 
                          : theme === 'dark' ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-white"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2 block">Complexity</label>
                  <select
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value as any)}
                    className={cn(
                      "w-full p-2 rounded-xl text-xs font-bold border outline-none",
                      theme === 'dark' ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-gray-50 border-gray-200"
                    )}
                  >
                    <option value="simple">Simple (Core Focus)</option>
                    <option value="detailed">Detailed (Deep Hierarchy)</option>
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2 block">Cost</label>
                  <div className="bg-amber-50 border border-amber-100 text-amber-600 py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1.5">
                    <Zap size={14} /> 5 Cr
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !inputText.trim()}
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:shadow-xl hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />}
              Generate Visual
            </button>
          </div>
        </div>

        {/* --- Right Column: Preview --- */}
        <div className="lg:col-span-8">
          <div className={cn(
            "rounded-3xl border shadow-sm h-full min-h-[500px] flex flex-col overflow-hidden",
            theme === 'dark' ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
          )}>
            <div className={cn(
              "px-6 py-4 border-b flex items-center justify-between",
              theme === 'dark' ? "border-gray-800 bg-gray-900/50" : "border-gray-100 bg-gray-50/50"
            )}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Interactive Preview</span>
              </div>
              
              {diagramCode && (
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                      <Maximize2 size={12} /> Scroll to Zoom
                    </div>
                 </div>
              )}
            </div>

            <div className="flex-1 relative mermaid-container">
              {!diagramCode && !loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-gray-400">
                  <div className="bg-gray-50 p-8 rounded-full mb-6 border-2 border-dashed border-gray-100">
                    <Network size={64} className="opacity-20 translate-y-2 translate-x-1" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Generate a Visual Map</h3>
                  <p className="max-w-xs text-sm">Enter study content on the left and our AI will translate it into a structured Mermaid diagram.</p>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                  <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                  <p className="text-blue-600 font-black uppercase tracking-widest text-xs">AI Visualizing Concepts...</p>
                </div>
              )}

              {diagramCode && <MermaidPreview chart={diagramCode} id="main-preview" theme={theme} />}
            </div>
          </div>
        </div>
      </div>

      {/* --- Notes Selection Modal --- */}
      <AnimatePresence>
        {showNotesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowNotesModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col",
                theme === 'dark' ? "bg-gray-900" : "bg-white"
              )}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold">Import from AI Notes</h3>
                <button onClick={() => setShowNotesModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {fetchingNotes ? (
                  <div className="flex flex-col items-center py-20 grayscale opacity-50">
                    <Loader2 className="animate-spin mb-4" />
                    <p>Loading your notes...</p>
                  </div>
                ) : userNotes.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 italic">
                    You haven't saved any notes yet.
                  </div>
                ) : (
                  userNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => {
                        setInputText(note.content);
                        setShowNotesModal(false);
                      }}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border flex items-center justify-between group transition-all",
                        theme === 'dark' ? "bg-gray-800 border-gray-700 hover:border-blue-500" : "bg-gray-50 border-gray-200 hover:border-blue-500"
                      )}
                    >
                      <div>
                        <h4 className="font-bold text-sm mb-1 line-clamp-1">{note.title}</h4>
                        <p className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleDateString()}</p>
                      </div>
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
