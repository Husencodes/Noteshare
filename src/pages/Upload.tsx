import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileText, Book, Hash, AlignLeft, Loader2, CheckCircle2, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import { COURSES, COURSE_NAMES, SEMESTERS } from "../constants";

interface UploadProps {
  token: string | null;
}

export default function Upload({ token }: UploadProps) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState(COURSE_NAMES[0]);
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("1");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const currentCourseSubjects = useMemo(() => {
    return COURSES.find((c) => c.name === course)?.subjects || [];
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("course", course);
    formData.append("subject", subject);
    formData.append("semester", semester);
    formData.append("description", description);
    formData.append("file", file);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass p-12 rounded-3xl border border-white/10"
        >
          <div className="bg-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="text-white w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Upload Successful!</h2>
          <p className="opacity-60">Your notes are now live for everyone to learn from. Redirecting to home...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10 shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
            <UploadIcon className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upload Notes</h1>
            <p className="opacity-60 text-sm">Share your academic resources with the community</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm mb-6 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold opacity-70 ml-1">Note Title</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
              <input
                type="text"
                required
                className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="e.g. Calculus II Midterm Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold opacity-70 ml-1">Course</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                <select
                  className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                  value={course}
                  onChange={(e) => {
                    setCourse(e.target.value);
                    setSubject(""); // Reset subject when course changes
                  }}
                >
                  {COURSE_NAMES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold opacity-70 ml-1">Subject</label>
              <div className="relative">
                <Book className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                <input
                  type="text"
                  required
                  list="subjects-list"
                  className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="e.g. Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <datalist id="subjects-list">
                  {currentCourseSubjects.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold opacity-70 ml-1">Semester</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
              <select
                className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold opacity-70 ml-1">Description (Optional)</label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-5 w-5 h-5 opacity-40" />
              <textarea
                className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all min-h-[120px]"
                placeholder="Briefly describe what's in these notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold opacity-70 ml-1">Select File (PDF, Image, DOC)</label>
            <div className="relative group">
              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full border-2 border-dashed border-white/10 rounded-2xl py-12 flex flex-col items-center justify-center gap-4 group-hover:border-emerald-500/50 transition-all bg-black/5 dark:bg-white/5">
                <div className="bg-emerald-500/10 p-4 rounded-full">
                  <UploadIcon className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="font-bold">{file ? file.name : "Click or drag to upload"}</p>
                  <p className="text-xs opacity-50 mt-1">Max file size: 10MB</p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 disabled:opacity-50 mt-8"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadIcon className="w-6 h-6" />}
            <span className="text-lg">Publish Notes</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
