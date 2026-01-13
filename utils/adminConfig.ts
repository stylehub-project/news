
// Admin Configuration Manager
// Handles persistence of "God Mode" settings

export interface AdminConfig {
  aiPersona: {
    tone: 'neutral' | 'explanatory' | 'concise' | 'witty';
    creativity: number; // 0.0 to 1.0 (Temperature)
    strictness: 'low' | 'medium' | 'high'; // Safety settings
    systemPromptOverride: string;
  };
  features: {
    reels: 'live' | 'beta' | 'maintenance' | 'hidden';
    map: 'live' | 'beta' | 'maintenance' | 'hidden';
    audio: 'live' | 'beta' | 'maintenance' | 'hidden';
    comments: 'live' | 'beta' | 'maintenance' | 'hidden';
  };
  content: {
    blockedSources: string[];
    priorityTopics: string[];
    factCheckEnabled: boolean;
  };
}

const DEFAULT_CONFIG: AdminConfig = {
  aiPersona: {
    tone: 'neutral',
    creativity: 0.7,
    strictness: 'medium',
    systemPromptOverride: '',
  },
  features: {
    reels: 'live',
    map: 'live',
    audio: 'live',
    comments: 'hidden',
  },
  content: {
    blockedSources: ['TabloidDaily', 'RumorMill'],
    priorityTopics: ['AI', 'Climate', 'Space'],
    factCheckEnabled: true,
  }
};

const STORAGE_KEY = 'nc_admin_config_v1';

export const getAdminConfig = (): AdminConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  } catch (e) {
    return DEFAULT_CONFIG;
  }
};

export const saveAdminConfig = (config: AdminConfig) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  // Dispatch event for real-time updates across app
  window.dispatchEvent(new Event('admin-config-updated'));
};

export const resetAdminConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('admin-config-updated'));
};
