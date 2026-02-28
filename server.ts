import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import multer from "multer";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "noteshare-secret-key";
const PORT = 3000;

// Initialize Database
const db = new Database("noteshare.db");
db.pragma("journal_mode = WAL");

// Setup Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    college TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course TEXT NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    semester INTEGER,
    description TEXT,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    downloads INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    note_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    UNIQUE(user_id, note_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (note_id) REFERENCES notes(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    note_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (note_id) REFERENCES notes(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    note_id INTEGER NOT NULL,
    UNIQUE(user_id, note_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (note_id) REFERENCES notes(id)
  );
`);

const app = express();
app.use(express.json());

// File Upload Config
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Auth
app.post("/api/register", async (req, res) => {
  const { email, password, name, college } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (email, password, name, college) VALUES (?, ?, ?, ?)");
    const info = stmt.run(email, hashedPassword, name, college);
    const token = jwt.sign({ id: info.lastInsertRowid, email, name }, JWT_SECRET);
    res.json({ token, user: { id: info.lastInsertRowid, email, name, college } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, college: user.college } });
});

// Notes
app.get("/api/notes", (req, res) => {
  const { search, sort, subject, semester, course } = req.query;
  let query = `
    SELECT n.*, u.name as author_name,
    (SELECT AVG(rating) FROM ratings WHERE note_id = n.id) as avg_rating,
    (SELECT COUNT(*) FROM ratings WHERE note_id = n.id) as rating_count,
    (SELECT COUNT(*) FROM likes WHERE note_id = n.id) as like_count
    FROM notes n
    JOIN users u ON n.user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    query += " AND (n.title LIKE ? OR n.description LIKE ? OR n.subject LIKE ? OR n.course LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (course) {
    query += " AND n.course = ?";
    params.push(course);
  }
  if (subject) {
    query += " AND n.subject = ?";
    params.push(subject);
  }
  if (semester) {
    query += " AND n.semester = ?";
    params.push(semester);
  }

  if (sort === "rating") {
    query += " ORDER BY avg_rating DESC";
  } else if (sort === "downloads") {
    query += " ORDER BY downloads DESC";
  } else {
    query += " ORDER BY n.created_at DESC";
  }

  const notes = db.prepare(query).all(...params);
  res.json(notes);
});

app.post("/api/notes", authenticateToken, upload.single("file"), (req: any, res) => {
  const { title, subject, semester, description, course } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: "File required" });

  const stmt = db.prepare("INSERT INTO notes (user_id, course, title, subject, semester, description, file_path, file_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const info = stmt.run(req.user.id, course, title, subject, semester, description, file.filename, file.mimetype);
  res.json({ id: info.lastInsertRowid });
});

app.get("/api/notes/:id", (req, res) => {
  const note = db.prepare(`
    SELECT n.*, u.name as author_name,
    (SELECT AVG(rating) FROM ratings WHERE note_id = n.id) as avg_rating,
    (SELECT COUNT(*) FROM ratings WHERE note_id = n.id) as rating_count,
    (SELECT COUNT(*) FROM likes WHERE note_id = n.id) as like_count
    FROM notes n
    JOIN users u ON n.user_id = u.id
    WHERE n.id = ?
  `).get(req.params.id);
  
  if (!note) return res.status(404).json({ error: "Note not found" });
  
  const comments = db.prepare(`
    SELECT c.*, u.name as user_name
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.note_id = ?
    ORDER BY c.created_at DESC
  `).all(req.params.id);

  res.json({ ...note, comments });
});

app.post("/api/notes/:id/rate", authenticateToken, (req: any, res) => {
  const { rating } = req.body;
  const stmt = db.prepare("INSERT OR REPLACE INTO ratings (user_id, note_id, rating) VALUES (?, ?, ?)");
  stmt.run(req.user.id, req.params.id, rating);
  res.json({ success: true });
});

app.post("/api/notes/:id/like", authenticateToken, (req: any, res) => {
  try {
    const stmt = db.prepare("INSERT INTO likes (user_id, note_id) VALUES (?, ?)");
    stmt.run(req.user.id, req.params.id);
    res.json({ liked: true });
  } catch (e) {
    const stmt = db.prepare("DELETE FROM likes WHERE user_id = ? AND note_id = ?");
    stmt.run(req.user.id, req.params.id);
    res.json({ liked: false });
  }
});

app.post("/api/notes/:id/comment", authenticateToken, (req: any, res) => {
  const { content } = req.body;
  const stmt = db.prepare("INSERT INTO comments (user_id, note_id, content) VALUES (?, ?, ?)");
  const info = stmt.run(req.user.id, req.params.id, content);
  res.json({ id: info.lastInsertRowid });
});

app.get("/api/notes/:id/download", (req, res) => {
  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.params.id) as any;
  if (!note) return res.status(404).json({ error: "Note not found" });
  
  db.prepare("UPDATE notes SET downloads = downloads + 1 WHERE id = ?").run(req.params.id);
  res.download(path.join(uploadDir, note.file_path), note.title + path.extname(note.file_path));
});

// User Profile
app.get("/api/profile", authenticateToken, (req: any, res) => {
  const user = db.prepare("SELECT id, email, name, college, created_at FROM users WHERE id = ?").get(req.user.id);
  const notes = db.prepare("SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  res.json({ user, notes });
});

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Leaderboard
app.get("/api/leaderboard", (req, res) => {
  const { subject } = req.query;
  let query = `
    SELECT l.*, u.name as user_name
    FROM leaderboard l
    JOIN users u ON l.user_id = u.id
  `;
  const params: any[] = [];
  if (subject) {
    query += " WHERE l.subject = ?";
    params.push(subject);
  }
  query += " ORDER BY l.score DESC, l.created_at ASC LIMIT 50";
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

app.post("/api/leaderboard", authenticateToken, (req: any, res) => {
  const { subject, score, total } = req.body;
  const stmt = db.prepare("INSERT INTO leaderboard (user_id, subject, score, total) VALUES (?, ?, ?, ?)");
  stmt.run(req.user.id, subject, score, total);
  res.json({ success: true });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
