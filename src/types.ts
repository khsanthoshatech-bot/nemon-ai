export interface Attachment {
  name: string;
  type: string;
  size?: string;
  content?: string; // base64 or raw text content
}

export interface MessageReaction {
  thumbsUp?: boolean;
  thumbsDown?: boolean;
  loved?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  reactions?: MessageReaction;
  error?: boolean;
  model?: string;
  attachments?: Attachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: string;
  model: string;
  systemInstruction?: string;
  favorite?: boolean;
}

export type ThemeType = 'neon-purple' | 'neon-orange' | 'neon-dual';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  plan: 'Free Tier' | 'Pro Member' | 'Enterprise AI';
  joined: string;
}
