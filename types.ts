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

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  interests: NewsCategory[];
  theme: 'light' | 'dark';
}