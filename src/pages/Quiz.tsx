import React, { useState, useEffect } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { User, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ALL_SUBJECTS } from "../constants";
import { Loader2, CheckCircle2, XCircle, Brain, Trophy as TrophyIcon, ArrowRight, RotateCcw } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LeaderboardEntry {
  id: number;
  user_name: string;
  subject: string;
  score: number;
  total: number;
  created_at: string;
}

interface QuizProps {
  token: string | null;
}

export default function Quiz({ token }: QuizProps) {
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const fetchLeaderboard = async (subj?: string) => {
    try {
      const url = subj ? `/api/leaderboard?subject=${encodeURIComponent(subj)}` : "/api/leaderboard";
      const res = await fetch(url);
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const generateQuestions = async () => {
    if (!subject) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 10 multiple choice questions for the subject: ${subject}. Each question should have 4 options and one correct answer. Provide an explanation for the correct answer.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
                explanation: { type: Type.STRING },
              },
              required: ["question", "options", "correctAnswer", "explanation"],
            },
          },
        },
      });

      const data = JSON.parse(response.text);
      setQuestions(data);
      setQuizStarted(true);
      setCurrentQuestion(0);
      setScore(0);
      setQuizFinished(false);
    } catch (error) {
      console.error("Failed to generate questions", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (index === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    if (token) {
      try {
        await fetch("/api/leaderboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject,
            score,
            total: questions.length,
          }),
        });
        fetchLeaderboard(subject);
      } catch (error) {
        console.error("Failed to save score", error);
      }
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setSubject("");
    setQuestions([]);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 gap-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
          <Brain className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center">
          <p className="text-2xl font-black tracking-tight mb-2">Generating Your Quiz...</p>
          <p className="opacity-60">Gemini is crafting 10 challenging questions for {subject}.</p>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass p-12 rounded-[3rem] border border-white/10 text-center shadow-2xl"
        >
          <div className="bg-emerald-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <TrophyIcon className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tight">Quiz Completed!</h2>
          <p className="text-xl opacity-60 mb-10">
            You scored <span className="text-emerald-500 font-black">{score}</span> out of <span className="font-bold">{questions.length}</span> in {subject}.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="glass p-6 rounded-2xl border border-white/5">
              <p className="text-3xl font-black text-emerald-500">{Math.round((score / questions.length) * 100)}%</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-40">Accuracy</p>
            </div>
            <div className="glass p-6 rounded-2xl border border-white/5">
              <p className="text-3xl font-black text-blue-500">{score}</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-40">Points Earned</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={generateQuestions}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Quiz
            </button>
            <button
              onClick={resetQuiz}
              className="glass border border-white/10 hover:bg-white/5 font-black px-8 py-4 rounded-2xl transition-all"
            >
              Try Another Subject
            </button>
          </div>
        </motion.div>

        <div className="mt-16 space-y-8">
          <h3 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-emerald-500" />
            {subject} Leaderboard
          </h3>
          <div className="glass rounded-[2rem] border border-white/10 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest opacity-40">Rank</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest opacity-40">Student</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest opacity-40 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5 font-black text-emerald-500">#{idx + 1}</td>
                    <td className="px-8 py-5 font-bold">{entry.user_name}</td>
                    <td className="px-8 py-5 text-right font-black">
                      {entry.score}/{entry.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (quizStarted) {
    const q = questions[currentQuestion];
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="flex justify-between items-center mb-12">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500">{subject} Quiz</p>
            <h2 className="text-2xl font-black tracking-tight">Question {currentQuestion + 1} of {questions.length}</h2>
          </div>
          <div className="glass px-6 py-3 rounded-2xl border border-white/10 font-black text-emerald-500">
            Score: {score}
          </div>
        </div>

        <div className="w-full bg-white/5 h-2 rounded-full mb-12 overflow-hidden">
          <motion.div
            className="bg-emerald-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        <motion.div
          key={currentQuestion}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass p-10 rounded-[2.5rem] border border-white/10 shadow-2xl mb-8"
        >
          <h3 className="text-2xl font-bold mb-10 leading-snug">{q.question}</h3>
          <div className="grid grid-cols-1 gap-4">
            {q.options.map((opt, idx) => {
              const isCorrect = idx === q.correctAnswer;
              const isSelected = idx === selectedOption;
              let bgColor = "bg-white/5 hover:bg-white/10";
              let borderColor = "border-white/5";
              
              if (selectedOption !== null) {
                if (isCorrect) {
                  bgColor = "bg-emerald-500/20";
                  borderColor = "border-emerald-500/50";
                } else if (isSelected) {
                  bgColor = "bg-red-500/20";
                  borderColor = "border-red-500/50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-6 rounded-2xl border ${borderColor} ${bgColor} transition-all flex items-center justify-between group`}
                >
                  <span className="font-semibold text-lg">{opt}</span>
                  {selectedOption !== null && isCorrect && <CheckCircle2 className="text-emerald-500 w-6 h-6" />}
                  {selectedOption !== null && isSelected && !isCorrect && <XCircle className="text-red-500 w-6 h-6" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="glass p-8 rounded-[2rem] border border-white/10 mb-8 bg-emerald-500/5"
            >
              <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-3">Explanation</p>
              <p className="opacity-80 leading-relaxed">{q.explanation}</p>
              <button
                onClick={nextQuestion}
                className="mt-8 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
              >
                {currentQuestion + 1 === questions.length ? "Finish Quiz" : "Next Question"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full text-sm font-semibold">
            <Brain className="w-4 h-4" />
            <span>AI-Powered Learning</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Test Your <br />
            <span className="text-emerald-500">Knowledge.</span>
          </h1>
          <p className="text-xl opacity-60 leading-relaxed max-w-lg">
            Challenge yourself with AI-generated quizzes across all subjects. Compete with fellow students and climb the leaderboard.
          </p>
          
          <div className="space-y-4">
            <label className="text-sm font-black uppercase tracking-widest opacity-40 ml-1">Select Subject</label>
            <select
              className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                fetchLeaderboard(e.target.value);
              }}
            >
              <option value="">Choose a subject...</option>
              {ALL_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={generateQuestions}
              disabled={!subject || loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/30 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Brain className="w-6 h-6" />}
              <span className="text-xl">Start Quiz</span>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <TrophyIcon className="w-6 h-6 text-yellow-500" />
            Global Leaderboard
          </h3>
          <div className="glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-black/80 backdrop-blur-xl z-10">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Rank</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Student</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Subject</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.map((entry, idx) => (
                    <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-5 font-black text-emerald-500">#{idx + 1}</td>
                      <td className="px-8 py-5 font-bold text-sm">{entry.user_name}</td>
                      <td className="px-8 py-5 text-xs opacity-60 font-medium">{entry.subject}</td>
                      <td className="px-8 py-5 text-right font-black text-sm">
                        {entry.score}/{entry.total}
                      </td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center opacity-40 italic">
                        No scores recorded yet. Be the first to top the charts!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
