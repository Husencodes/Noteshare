import { Link } from "react-router-dom";
import { User } from "../types";
import { Sun, Moon, LogOut, Upload, User as UserIcon, BookOpen, Brain } from "lucide-react";

interface NavbarProps {
  user: User | null;
  logout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Navbar({ user, logout, isDarkMode, toggleDarkMode }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-emerald-500 p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">NoteShare</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <Link
            to="/quiz"
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Quiz"
          >
            <Brain className="w-5 h-5" />
          </Link>

          {user ? (
            <>
              <Link
                to="/upload"
                className="hidden sm:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full transition-colors font-medium"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </Link>
              <Link
                to="/profile"
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Profile"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full transition-colors font-medium"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
