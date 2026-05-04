import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Upload, FileText, X } from "lucide-react";
import { chatWithPDF, logUsage, handleAIError } from "../lib/ai";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { useAuth } from "./AuthContext";
import { cn } from "../lib/utils";
import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

// Set worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface Message {
  role: "user" | "model";
  text: string;
}

export const ChatWithPDF: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<{ data: string, name: string, mimeType: string, extractedText?: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const extractTextFromPDF = async (data: string): Promise<string> => {
    try {
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const loadingTask = pdfjs.getDocument({ data: bytes });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      let extractedText = "";
      
      if (selectedFile.type === "application/pdf") {
        extractedText = await extractTextFromPDF(base64);
      }

      setFile({
        data: base64,
        name: selectedFile.name,
        mimeType: selectedFile.type,
        extractedText
      });
      setMessages([{ role: "model", text: `I've loaded **${selectedFile.name}**. How can I help you with this document?` }]);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSend = async () => {
    if (!input.trim() || !file || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 1) {
      setMessages((prev) => [...prev, { role: "model", text: "Error: You have run out of credits. Please upgrade your plan to continue." }]);
      return;
    }

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m, i) => !(i === 0 && m.role === "model")) // Skip initial bot greeting
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));
      
      const isFirstUserMessage = messages.filter(m => m.role === "user").length === 0;
      const promptWithContext = (file.extractedText && isFirstUserMessage)
        ? `Context from PDF:\n${file.extractedText}\n\nQuestion: ${input}`
        : input;

      const { text, usage } = await chatWithPDF(
        promptWithContext, 
        { data: file.mimeType.startsWith("image/") ? file.data : "", mimeType: file.mimeType }, 
        history
      );
      setMessages((prev) => [...prev, { role: "model", text: text || "I'm sorry, I couldn't process that." }]);
      
      if (profile) {
        await deductCredits(1);
        await logUsage(profile.uid, "ChatWithPDF", usage);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "model", text: handleAIError(error) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Chat with PDF</h2>
            <p className="text-xs text-gray-500">Ask questions based on your document</p>
          </div>
        </div>
        {!file && (
          <label className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold cursor-pointer hover:bg-red-100 transition-all flex items-center gap-2">
            <Upload size={18} /> Upload PDF
            <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
          </label>
        )}
        {file && (
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <span className="text-sm font-bold text-gray-700 truncate max-w-[150px]">{file.name}</span>
            <button onClick={() => { setFile(null); setMessages([]); }} className="text-gray-400 hover:text-red-500">
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {!file && (
          <label className="h-full flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="bg-red-50 p-8 rounded-full">
              <Upload className="text-red-600" size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Upload a PDF to start</h3>
            <p className="text-gray-500 max-w-xs">Once uploaded, you can ask any question about the content of the PDF.</p>
            <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
          </label>
        )}

        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx}
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "p-2 rounded-full h-fit",
              msg.role === "user" ? "bg-red-100" : "bg-white border border-gray-100 shadow-sm"
            )}>
              {msg.role === "user" ? <User size={20} className="text-red-600" /> : <Bot size={20} className="text-gray-600" />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === "user" ? "bg-red-600 text-white shadow-lg shadow-red-100" : "bg-white text-gray-800 border border-gray-100 shadow-sm"
            )}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="bg-white p-2 rounded-full h-fit border border-gray-100 shadow-sm">
              <Bot size={20} className="text-gray-600" />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <Loader2 className="animate-spin text-red-600" size={20} />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={file ? "Ask about the document..." : "Please upload a PDF first"}
            disabled={!file || loading}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim() || !file}
            className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-100"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
