import type { SpeechSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';

const COOKIE_NAME = 'flash-phrase-settings';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1年

// 設定をcookieに保存
export const saveSettingsToCookie = (settings: SpeechSettings): void => {
  const value = encodeURIComponent(JSON.stringify(settings));
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
};

// cookieから設定を読み込み
export const loadSettingsFromCookie = (): SpeechSettings => {
  const cookies = document.cookie.split(';');
  const settingsCookie = cookies.find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
  
  if (settingsCookie) {
    try {
      const value = settingsCookie.split('=')[1];
      const parsed = JSON.parse(decodeURIComponent(value));
      // デフォルト値とマージして、欠けているプロパティを補完
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      console.error('Failed to parse settings cookie:', e);
    }
  }
  
  return DEFAULT_SETTINGS;
};

// cookieから設定を削除
export const clearSettingsCookie = (): void => {
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`;
};
