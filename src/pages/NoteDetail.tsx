import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Note, User, Comment } from "../types";
import { Star, Download, Heart, MessageSquare, User as UserIcon, Clock, Loader2, Send, AlertTriangle, FileText, ChevronLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

interface NoteDetailProps {
  token: string | null;
  user: User | null;
}

export default function NoteDetail({ token, user }: NoteDetailProps) {
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchNote = async () => {
    try {
      const res = await fetch(`/api/notes/${id}`);
      const data = await res.json();
      setNote(data);
    } catch (error) {
      console.error("Failed to fetch note", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [id]);

  const handleLike = async () => {
    if (!token) return alert("Please login to like");
    try {
      const res = await fetch(`/api/notes/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setNote(prev => prev ? { ...prev, like_count: data.liked ? prev.like_count + 1 : prev.like_count - 1 } : null);
      }
    } catch (error) {
      console.error("Failed to like", error);
    }
  };

  const handleRate = async (val: number) => {
    if (!token) return alert("Please login to rate");
    setRating(val);
    try {
      await fetch(`/api/notes/${id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: val }),
      });
      fetchNote();
    } catch (error) {
      console.error("Failed to rate", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("Please login to comment");
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/notes/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: comment }),
      });
      if (res.ok) {
        setComment("");
        fetchNote();
      }
    } catch (error) {
      console.error("Failed to comment", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    window.open(`/api/notes/${id}/download`, "_blank");
    setTimeout(() => fetchNote(), 1000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 gap-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-lg font-medium opacity-60">Loading note details...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-24 glass rounded-3xl border border-white/10 max-w-2xl mx-auto">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Note not found</h2>
        <Link to="/" className="text-emerald-500 font-bold hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-500 hover:text-emerald-400 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Feed</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-10 rounded-[2.5rem] border border-white/10 shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-full">
                    {note.course}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                    {note.subject}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-500 bg-purple-500/10 px-3 py-1.5 rounded-full">
                    Semester {note.semester}
                  </span>
                </div>
                <h1 className="text-4xl font-black tracking-tight leading-tight">{note.title}</h1>
                <div className="flex items-center gap-4 text-sm opacity-60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="font-semibold">{note.author_name}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(note.created_at))} ago</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 bg-yellow-500/10 p-4 rounded-3xl border border-yellow-500/20 min-w-[100px]">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-6 h-6 fill-current" />
                  <span className="text-2xl font-black">{note.avg_rating ? note.avg_rating.toFixed(1) : "N/A"}</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">{note.rating_count} Ratings</span>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Description
              </h3>
              <p className="text-lg opacity-70 leading-relaxed whitespace-pre-wrap">
                {note.description || "No description provided for these notes."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-8 border-t border-white/5">
              <button
                onClick={handleDownload}
                className="flex-grow sm:flex-grow-0 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
              >
                <Download className="w-6 h-6" />
                <span className="text-lg">Download Notes</span>
              </button>
              <button
                onClick={handleLike}
                className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all font-bold"
              >
                <Heart className="w-6 h-6" />
                <span className="text-lg">{note.like_count}</span>
              </button>
            </div>
          </motion.div>

          {/* Comments Section */}
          <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-emerald-500" />
              Comments
            </h2>

            <form onSubmit={handleComment} className="glass p-6 rounded-3xl border border-white/10">
              <textarea
                className="w-full bg-black/5 dark:bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all min-h-[100px] mb-4 text-lg"
                placeholder={token ? "Share your thoughts or ask a question..." : "Please login to comment"}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!token || submitting}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!token || submitting || !comment.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  <span>Post Comment</span>
                </button>
              </div>
            </form>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {note.comments?.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-6 rounded-2xl border border-white/5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-bold">{c.user_name}</p>
                          <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">
                            {formatDistanceToNow(new Date(c.created_at))} ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="opacity-80 leading-relaxed">{c.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {(!note.comments || note.comments.length === 0) && (
                <div className="text-center py-12 opacity-40 italic">
                  No comments yet. Be the first to start the conversation!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="glass p-8 rounded-[2rem] border border-white/10 sticky top-32">
            <h3 className="text-xl font-black mb-6 tracking-tight">Rate this Content</h3>
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className={`p-2 transition-all transform hover:scale-125 ${
                    star <= rating ? "text-yellow-500" : "text-white/10 hover:text-yellow-500/50"
                  }`}
                >
                  <Star className={`w-10 h-10 ${star <= rating ? "fill-current" : ""}`} />
                </button>
              ))}
            </div>
            <p className="text-center text-sm opacity-50 font-medium">
              Your rating helps other students find high-quality notes.
            </p>

            <div className="mt-12 pt-8 border-t border-white/5">
              <h4 className="text-sm font-black uppercase tracking-widest opacity-40 mb-6">Note Stats</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold opacity-60">Downloads</span>
                  <span className="text-lg font-black">{note.downloads}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold opacity-60">Likes</span>
                  <span className="text-lg font-black">{note.like_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold opacity-60">File Type</span>
                  <span className="text-sm font-black uppercase">{note.file_type.split("/")[1]}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert("Content reported. Our moderators will review it shortly.")}
              className="w-full mt-12 text-xs font-bold uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-3 h-3" />
              Report Inappropriate Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
