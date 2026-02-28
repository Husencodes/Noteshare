import React from "react";
import { Link } from "react-router-dom";
import { Note } from "../types";
import { Star, Download, Heart, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl overflow-hidden border border-white/10 flex flex-col h-full"
    >
      <Link to={`/notes/${note.id}`} className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
              {note.course}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
              {note.subject}
            </span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">
              {note.avg_rating ? note.avg_rating.toFixed(1) : "N/A"}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight">
          {note.title}
        </h3>
        
        <p className="text-sm opacity-60 line-clamp-3 mb-4 leading-relaxed">
          {note.description || "No description provided."}
        </p>

        <div className="flex items-center gap-2 text-xs opacity-50 mb-4">
          <User className="w-3 h-3" />
          <span>{note.author_name}</span>
          <span>•</span>
          <Clock className="w-3 h-3" />
          <span>{formatDistanceToNow(new Date(note.created_at))} ago</span>
        </div>
      </Link>

      <div className="px-5 py-4 border-t border-white/5 bg-black/5 dark:bg-white/5 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-1 text-xs opacity-60">
            <Heart className="w-4 h-4" />
            <span>{note.like_count}</span>
          </div>
          <div className="flex items-center gap-1 text-xs opacity-60">
            <Download className="w-4 h-4" />
            <span>{note.downloads}</span>
          </div>
        </div>
        <Link
          to={`/notes/${note.id}`}
          className="text-xs font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default NoteCard;
