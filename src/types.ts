export interface User {
  id: number;
  email: string;
  name: string;
  college?: string;
  created_at: string;
}

export interface Note {
  id: number;
  user_id: number;
  course: string;
  title: string;
  subject: string;
  semester: number;
  description: string;
  file_path: string;
  file_type: string;
  downloads: number;
  created_at: string;
  author_name: string;
  avg_rating: number | null;
  rating_count: number;
  like_count: number;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  user_id: number;
  note_id: number;
  content: string;
  created_at: string;
  user_name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
