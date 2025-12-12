// Route Configuration for News Club
export const ROUTES = {
  HOME: '/',
  TOP_STORIES: '/top-stories',
  LATEST: '/latest',
  REEL: '/reel',
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: (id: string) => `/category/${id}`,
  SEARCH: '/search',
  NEWS_DETAIL: (id: string) => `/news/${id}`,
  MAP: '/map',
  AI_CHAT: '/ai-chat',
  NEWSPAPER: '/newspaper',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  BOOKMARKS: '/bookmarks',
  ADMIN: '/admin',
  ONBOARDING: '/onboarding',
};

export const NAV_ITEMS = [
  { path: ROUTES.HOME, label: 'Home' },
  { path: ROUTES.CATEGORIES, label: 'Categories' },
  { path: ROUTES.REEL, label: 'Reel' },
  { path: ROUTES.AI_CHAT, label: 'AI Chat' },
  { path: ROUTES.PROFILE, label: 'Profile' },
];
