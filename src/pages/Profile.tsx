import React, { useState, useEffect } from "react";
import { User, Note } from "../types";
import NoteCard from "../components/NoteCard";
import { User as UserIcon, GraduationCap, Calendar, BookOpen, Loader2, LogOut, Settings, Mail, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

interface ProfileProps {
  token: string | null;
  logout: () => void;
}

export default function Profile({ token, logout }: ProfileProps) {
  const [profile, setProfile] = useState<{ user: User; notes: Note[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 gap-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-lg font-medium opacity-60">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl sticky top-32"
          >
            <div className="flex flex-col items-center mb-10">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                <UserIcon className="w-12 h-12 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-center">{profile.user.name}</h1>
              <div className="flex items-center gap-2 mt-2 opacity-60">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Verified Student</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <Mail className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Email</p>
                  <p className="text-sm font-semibold truncate max-w-[150px]">{profile.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <GraduationCap className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">College</p>
                  <p className="text-sm font-semibold">{profile.user.college || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Joined</p>
                  <p className="text-sm font-semibold">{format(new Date(profile.user.created_at), "MMM yyyy")}</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
              <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all font-bold text-sm">
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-sm shadow-lg shadow-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-12">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass p-8 rounded-3xl border border-white/10 text-center">
              <p className="text-4xl font-black text-emerald-500 mb-2">{profile.notes.length}</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-50">Notes Published</p>
            </div>
            <div className="glass p-8 rounded-3xl border border-white/10 text-center">
              <p className="text-4xl font-black text-emerald-500 mb-2">
                {profile.notes.reduce((acc, n) => acc + n.downloads, 0)}
              </p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-50">Total Downloads</p>
            </div>
            <div className="glass p-8 rounded-3xl border border-white/10 text-center">
              <p className="text-4xl font-black text-emerald-500 mb-2">
                {profile.notes.reduce((acc, n) => acc + n.like_count, 0)}
              </p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-50">Total Likes</p>
            </div>
          </div>

          {/* User's Notes */}
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-emerald-500" />
                Your Publications
              </h2>
            </div>

            {profile.notes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                  {profile.notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-24 glass rounded-[2.5rem] border border-white/10">
                <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">You haven't shared any notes yet</h3>
                <p className="opacity-60 max-w-md mx-auto mb-8">
                  Start contributing to the community by uploading your first academic resource.
                </p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl transition-all font-black shadow-xl shadow-emerald-500/20"
                >
                  Upload Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
