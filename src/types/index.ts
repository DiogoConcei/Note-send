export interface Topic {
  id: number;
  label: string;
  color: string;
  userId: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  userId: number;
  topicId: number | null;
  topic?: Topic;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  googleId?: string | null;
}
