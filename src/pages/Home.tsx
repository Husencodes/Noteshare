import React, { useState, useEffect, useMemo } from "react";
import { Note, User } from "../types";
import NoteCard from "../components/NoteCard";
import { Search, Filter, SlidersHorizontal, Loader2, BookOpen, Sparkles, GraduationCap, Quote, Brain, ArrowRight, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { COURSES, COURSE_NAMES, SEMESTERS } from "../constants";
import { Link } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";

interface HomeProps {
  token: string | null;
  user: User | null;
}

export default function Home({ token, user }: HomeProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [motivation, setMotivation] = useState("");
  const [loadingMotivation, setLoadingMotivation] = useState(true);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const fetchMotivation = async () => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Give me a short, powerful, and unique motivational quote for a college student aiming to be a topper. Keep it under 20 words.",
      });
      setMotivation(response.text || "Believe in yourself and your potential.");
    } catch (error) {
      setMotivation("Success is not final, failure is not fatal: it is the courage to continue that counts.");
    } finally {
      setLoadingMotivation(false);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, sort, course, subject, semester });
      const res = await fetch(`/api/notes?${params}`);
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotivation();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sort, course, subject, semester]);

  const availableSubjects = useMemo(() => {
    if (course) {
      return COURSES.find((c) => c.name === course)?.subjects || [];
    }
    return Array.from(new Set(COURSES.flatMap((c) => c.subjects))).sort();
  }, [course]);

  return (
    <div className="max-w-7xl mx-auto space-y-24 pb-24">
      {/* Hero Section */}
      <section className="text-center py-12 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Collaborative Academic Ecosystem</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Welcome {user ? user.name.split(' ')[0] : ""}, <br />
            <span className="text-emerald-500">Next Topper</span>
          </h1>
          
          {/* Motivation Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto mb-10 glass p-6 rounded-2xl border border-white/10 italic text-lg opacity-80 flex items-center gap-4 justify-center"
          >
            <Quote className="w-6 h-6 text-emerald-500 shrink-0" />
            {loadingMotivation ? (
              <div className="h-4 w-48 bg-white/10 animate-pulse rounded" />
            ) : (
              <p>"{motivation}"</p>
            )}
          </motion.div>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6" />
            <input
              type="text"
              placeholder="Search by course, subject, or keywords..."
              className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>
        
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Quiz Promo Section */}
      <section className="glass p-12 rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
              <Brain className="w-4 h-4" />
              New Feature
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Ready to Test Your <br />
              <span className="text-emerald-500">Skills?</span>
            </h2>
            <p className="text-lg opacity-60 leading-relaxed max-w-md">
              Take our AI-powered quizzes across all subjects. Compete with fellow students, earn points, and top the global leaderboard.
            </p>
            <Link
              to="/quiz"
              className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 group"
            >
              Start Quiz Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-8 rounded-3xl border border-white/5 text-center space-y-2">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto" />
              <p className="text-2xl font-black">Top 1%</p>
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Leaderboard</p>
            </div>
            <div className="glass p-8 rounded-3xl border border-white/5 text-center space-y-2">
              <Brain className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-2xl font-black">100+ MCQs</p>
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Per Subject</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
      </section>

      {/* Filters & Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 glass p-6 rounded-2xl border border-white/10">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium opacity-60">
            <Filter className="w-4 h-4" />
            <span>Filter by:</span>
          </div>
          <select
            className="bg-black/5 dark:bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              setSubject("");
            }}
          >
            <option value="">All Courses</option>
            {COURSE_NAMES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="bg-black/5 dark:bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {availableSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="bg-black/5 dark:bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium opacity-60">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Sort by:</span>
          </div>
          <select
            className="bg-black/5 dark:bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="rating">Highest Rated</option>
            <option value="downloads">Most Downloaded</option>
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <p className="text-lg font-medium opacity-60">Loading notes...</p>
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-24 glass rounded-3xl border border-white/10">
          <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No notes found</h3>
          <p className="opacity-60 max-w-md mx-auto">
            We couldn't find any notes matching your criteria. Be the first to upload one!
          </p>
        </div>
      )}
    </div>
  );
}
