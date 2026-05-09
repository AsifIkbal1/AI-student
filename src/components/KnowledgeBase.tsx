import React, { useState, useRef } from "react";
import { 
  Database, 
  Upload, 
  MessageSquare, 
  FileText, 
  X, 
  Plus, 
  Loader2, 
  Sparkles,
  Search,
  BookOpen,
  Trash2,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { cn } from "../lib/utils";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface KnowledgeFile {
  id: string;
  name: string;
  content: string;
  size: string;
  pages: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const KnowledgeBase: React.FC = () => {
  const { profile } = useAuth();
  const { theme } = useTheme();
  
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'chat'>('files');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    
    for (const file of uploadedFiles) {
      if (file.type !== "application/pdf") continue;
      
      try {
        const reader = new FileReader();
        const contentPromise = new Promise<string>((resolve, reject) => {
          reader.onload = async () => {
            try {
              const typedArray = new Uint8Array(reader.result as ArrayBuffer);
              const pdf = await pdfjsLib.getDocument(typedArray).promise;
              let fullText = "";
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
              }
              resolve(fullText);
            } catch (err) { reject(err); }
          };
          reader.onerror = reject;
        });
        
        reader.readAsArrayBuffer(file);
        const text = await contentPromise;
        const pdfMeta = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;

        const newFile: KnowledgeFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content: text,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          pages: pdfMeta.numPages
        };
        
        setFiles(prev => [...prev, newFile]);
      } catch (err) {
        console.error("PDF extraction error:", err);
      }
    }
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || files.length === 0 || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);
    setActiveTab('chat');

    try {
      const response = await fetch("/api/knowledge-base/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage,
          files: files.map(f => ({ name: f.name, content: f.content })),
          history: messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          })),
          uid: profile?.uid
        })
      });

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error while processing your request." }]);
    } finally {
      setIsTyping(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-2xl bg-indigo-600 text-white">
              <Database size={24} />
            </div>
            <h1 className={cn("text-3xl font-black", theme === 'dark' ? "text-white" : "text-gray-900")}>
              Multi-PDF Knowledge Base
            </h1>
          </div>
          <p className={cn("text-sm font-medium", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>
            Upload multiple documents and chat with their collective intelligence.
          </p>
        </div>

        <div className={cn(
          "flex p-1 rounded-2xl border backdrop-blur-sm",
          theme === 'dark' ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-100 shadow-sm"
        )}>
          <button
            onClick={() => setActiveTab('files')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === 'files' 
                ? "bg-indigo-600 text-white shadow-md" 
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <BookOpen size={18} />
            Documents ({files.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === 'chat' 
                ? "bg-indigo-600 text-white shadow-md" 
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <MessageSquare size={18} />
            Chat Studio
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
        {/* Left Column: Management */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
          {/* Upload Area */}
          <div className={cn(
            "p-8 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer group",
            theme === 'dark' 
              ? "border-gray-800 bg-gray-900/50 hover:border-indigo-500 hover:bg-indigo-500/5" 
              : "border-gray-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/50"
          )}
          onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              accept=".pdf" 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
            </div>
            <h3 className={cn("text-lg font-black mb-1", theme === 'dark' ? "text-white" : "text-gray-900")}>
              {isUploading ? "Processing PDFs..." : "Upload Resources"}
            </h3>
            <p className="text-xs font-bold text-gray-500">Supports up to 10 PDFs at once</p>
          </div>

          {/* Files List */}
          <div className={cn(
            "flex-1 rounded-[2.5rem] border flex flex-col overflow-hidden",
            theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-sm"
          )}>
            <div className="p-6 border-b border-gray-100/10 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Knowledge Stack</h3>
              {files.length > 0 && (
                <button onClick={() => setFiles([])} className="text-xs font-bold text-red-500 hover:underline">Clear All</button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center grayscale opacity-30">
                  <FileText size={48} className="mb-4" />
                  <p className="text-xs font-bold">No documents added yet</p>
                </div>
              ) : (
                files.map(file => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={file.id}
                    className={cn(
                      "group flex items-center gap-3 p-4 rounded-2xl border transition-all",
                      theme === 'dark' ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-100"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate">{file.name}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {file.pages} Pages • {file.size}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Interface */}
        <div className="lg:col-span-8 flex flex-col overflow-hidden">
          <div className={cn(
            "flex-1 rounded-[3rem] border flex flex-col overflow-hidden",
            theme === 'dark' ? "glass-panel border-gray-800" : "glass-panel border-white shadow-xl"
          )}>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
                    <Sparkles size={40} />
                  </div>
                  <h2 className={cn("text-2xl font-black mb-4", theme === 'dark' ? "text-white" : "text-gray-900")}>
                    Your AI Librarian
                  </h2>
                  <p className={cn("text-sm font-medium mb-8 leading-relaxed", theme === 'dark' ? "text-gray-400" : "text-gray-500")}>
                    Upload your lecture notes, research papers, or textbooks, and ask questions like "Summarize the key differences between X and Y across all documents".
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {[
                      "Summarize all files",
                      "Find specific definitions",
                      "Extract core themes",
                      "Create a cross-file quiz"
                    ].map(suggest => (
                      <button
                        key={suggest}
                        onClick={() => setInput(suggest)}
                        className={cn(
                          "px-4 py-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between group",
                          theme === 'dark' ? "border-gray-800 hover:border-indigo-500 bg-gray-900/50" : "border-gray-100 hover:border-indigo-500 bg-gray-50"
                        )}
                      >
                        {suggest}
                        <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i}
                    className={cn(
                      "flex gap-4 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1",
                      msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                    )}>
                      {msg.role === 'user' ? <div className="text-xs font-black">U</div> : <Sparkles size={16} />}
                    </div>
                    <div className={cn(
                      "p-5 rounded-3xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-lg" 
                        : theme === 'dark' ? "bg-gray-800/80 text-gray-200 rounded-tl-none border border-gray-700" : "bg-gray-100 text-gray-800 rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))
              )}
              {isTyping && (
                <div className="flex gap-4 max-w-[85%] animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Loader2 className="animate-spin text-gray-400" size={16} />
                  </div>
                  <div className={cn(
                    "p-5 rounded-3xl text-sm flex gap-2 items-center",
                    theme === 'dark' ? "bg-gray-800/80 text-gray-400" : "bg-gray-100 text-gray-500"
                  )}>
                    AI is reviewing your documents...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-6 border-t border-gray-100/10">
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={files.length > 0 ? "Ask anything about your documents..." : "Upload documents first to start chatting"}
                    disabled={files.length === 0}
                    className={cn(
                      "w-full h-14 pl-6 pr-12 rounded-2xl border outline-none transition-all text-sm font-medium",
                      theme === 'dark' 
                        ? "bg-gray-900 border-gray-800 focus:border-indigo-500 text-white" 
                        : "bg-white border-gray-100 focus:border-indigo-500 shadow-inner"
                    )}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={18} />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || files.length === 0 || isTyping}
                  className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <ChevronRight size={24} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
