import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthState, User } from "./types";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import NoteDetail from "./pages/NoteDetail";
import Profile from "./pages/Profile";
import Quiz from "./pages/Quiz";

export default function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem("noteshare_auth");
    return saved ? JSON.parse(saved) : { user: null, token: null };
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("noteshare_theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("noteshare_auth", JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("noteshare_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("noteshare_theme", "light");
    }
  }, [isDarkMode]);

  const login = (user: User, token: string) => {
    setAuth({ user, token });
  };

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("noteshare_auth");
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-300">
        <Navbar 
          user={auth.user} 
          logout={logout} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home token={auth.token} user={auth.user} />} />
            <Route path="/login" element={!auth.user ? <Login onLogin={login} /> : <Navigate to="/" />} />
            <Route path="/register" element={!auth.user ? <Register onLogin={login} /> : <Navigate to="/" />} />
            <Route path="/upload" element={auth.user ? <Upload token={auth.token} /> : <Navigate to="/login" />} />
            <Route path="/notes/:id" element={<NoteDetail token={auth.token} user={auth.user} />} />
            <Route path="/quiz" element={<Quiz token={auth.token} />} />
            <Route path="/profile" element={auth.user ? <Profile token={auth.token} logout={logout} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
