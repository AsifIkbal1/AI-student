import React, { useState } from "react";
import { HelpCircle, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { generateQuiz, logUsage, handleAIError } from "../lib/ai";
import { motion } from "motion/react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizData {
  topic: string;
  questions: Question[];
}

export const AIQuiz: React.FC = () => {
  const { profile, deductCredits } = useAuth();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;

    if (profile && profile.role !== "admin" && profile.credits < 3) {
      setError("Error: You need at least 3 credits to generate a quiz. Please upgrade your plan.");
      return;
    }

    setLoading(true);
    setQuiz(null);
    setUserAnswers([]);
    setShowResults(false);
    setError(null);
    try {
      const { data, usage } = await generateQuiz(topic, difficulty);
      
      if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("The AI returned an invalid quiz structure. Please try again.");
      }

      setQuiz(data);
      setUserAnswers(new Array(data.questions.length).fill(""));
      if (profile) {
        await deductCredits(3);
        await logUsage(profile.uid, "AIQuiz", usage);
      }
    } catch (error) {
      setError(handleAIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (qIdx: number, answer: string) => {
    if (showResults) return;
    const newAnswers = [...userAnswers];
    newAnswers[qIdx] = answer;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setShowResults(true);
    // Optionally save to Firestore
    if (profile && quiz && Array.isArray(quiz.questions)) {
      addDoc(collection(db, "quizzes"), {
        uid: profile.uid,
        topic: quiz.topic,
        questions: quiz.questions,
        userAnswers,
        score: userAnswers.filter((ans, i) => quiz.questions[i] && ans.trim().toLowerCase() === quiz.questions[i].correctAnswer.trim().toLowerCase()).length,
        createdAt: new Date().toISOString()
      });
    }
  };

  const score = userAnswers.filter((ans, i) => quiz && Array.isArray(quiz.questions) && quiz.questions[i] && ans.trim().toLowerCase() === quiz.questions[i].correctAnswer.trim().toLowerCase()).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Quiz & Test</h1>
        <p className="text-gray-500">Test your knowledge with AI-generated quizzes</p>
      </div>

      {!quiz ? (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Quiz Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, Quantum Physics, World War II"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty Level</label>
              <div className="flex gap-4">
                {["Easy", "Medium", "Hard"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl as any)}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-semibold border transition-all",
                      difficulty === lvl 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <HelpCircle size={24} />}
              Generate Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{quiz.topic}</h2>
              <p className="text-sm text-gray-500">{quiz.questions.length} Questions • {difficulty} Difficulty</p>
            </div>
            <button
              onClick={() => setQuiz(null)}
              className="text-blue-600 font-semibold flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all"
            >
              <RefreshCw size={18} /> New Quiz
            </button>
          </div>

          <div className="space-y-6">
            {quiz.questions.map((q, qIdx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIdx * 0.1 }}
                key={qIdx}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  {qIdx + 1}. {q.question}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = userAnswers[qIdx] === opt;
                    const isCorrect = opt === q.correctAnswer;
                    const isWrong = isSelected && !isCorrect;

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswerSelect(qIdx, opt)}
                        disabled={showResults}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                          !showResults && isSelected && "bg-blue-50 border-blue-600 text-blue-700",
                          !showResults && !isSelected && "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
                          showResults && opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() && "bg-emerald-50 border-emerald-600 text-emerald-700",
                          showResults && isSelected && opt.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase() && "bg-red-50 border-red-600 text-red-700",
                          showResults && opt.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase() && !isSelected && "bg-white border-gray-200 text-gray-400"
                        )}
                      >
                        <span className="font-medium">{opt}</span>
                        {showResults && opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() && <CheckCircle2 size={20} />}
                        {showResults && isSelected && opt.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase() && <XCircle size={20} />}
                      </button>
                    );
                  })}
                </div>
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-800"
                  >
                    {userAnswers[qIdx].trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase() && (
                      <p className="font-bold text-red-600 mb-2">
                        Correct Answer: {q.correctAnswer}
                      </p>
                    )}
                    <p className="font-bold mb-1">Explanation:</p>
                    <p>{q.explanation}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {!showResults ? (
            <button
              onClick={handleSubmit}
              disabled={userAnswers.some(ans => !ans)}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              Submit Quiz
            </button>
          ) : (
            <div className="bg-blue-600 text-white p-8 rounded-3xl text-center">
              <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
              <p className="text-4xl font-black mb-4">{score} / {quiz.questions.length}</p>
              <p className="text-blue-100">
                {score === quiz.questions.length ? "Perfect Score! You're a genius! 🌟" : "Great effort! Keep learning! 📚"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import { cn } from "../lib/utils";
