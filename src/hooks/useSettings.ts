import { useState, useEffect, useCallback } from 'react';
import type { SpeechSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { loadSettingsFromCookie, saveSettingsToCookie } from '../utils/cookieUtils';

export const useSettings = () => {
  const [settings, setSettings] = useState<SpeechSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回読み込み時にcookieから設定を復元
  useEffect(() => {
    const loadedSettings = loadSettingsFromCookie();
    setSettings(loadedSettings);
    setIsLoaded(true);
  }, []);

  // 設定を更新してcookieに保存
  const updateSettings = useCallback((newSettings: Partial<SpeechSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettingsToCookie(updated);
      return updated;
    });
  }, []);

  // 設定をデフォルトにリセット
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettingsToCookie(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings, isLoaded };
};
