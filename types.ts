import { ReactNode } from 'react';

export interface RouteItem {
  path: string;
  label: string;
  icon: ReactNode;
  component: ReactNode;
}

export enum NewsCategory {
  POLITICS = 'Politics',
  SPORTS = 'Sports',
  BUSINESS = 'Business',
  ENTERTAINMENT = 'Entertainment',
  TECHNOLOGY = 'Technology',
  SCIENCE = 'Science',
  WORLD = 'World',
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: number;
  likes: number;
  replies: CommentReply[];
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: number;
  likes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  interests: NewsCategory[];
  theme: 'light' | 'dark';
}