import type { UnitFile } from '../types';

// 利用可能なユニットファイルのリスト
export const UNIT_FILES: UnitFile[] = [
  { unitNumber: 1, filepath: '/flash-phrase/unit1.csv' },
  { unitNumber: 2, filepath: '/flash-phrase/unit2.csv' },
  { unitNumber: 3, filepath: '/flash-phrase/unit3.csv' },
  { unitNumber: 4, filepath: '/flash-phrase/unit4.csv' },
  { unitNumber: 5, filepath: '/flash-phrase/unit5.csv' },
  { unitNumber: 6, filepath: '/flash-phrase/unit6.csv' },
  { unitNumber: 7, filepath: '/flash-phrase/unit7.csv' },
  { unitNumber: 8, filepath: '/flash-phrase/unit8.csv' },
  { unitNumber: 9, filepath: '/flash-phrase/unit9.csv' },
  { unitNumber: 10, filepath: '/flash-phrase/unit10.csv' },
];

// 音声合成の設定
export type Language = 'en' | 'ja';

export const SPEECH_CONFIG: Record<Language, { language: string; preferredVoices: RegExp }> = {
  en: {
    language: 'en-US',
    preferredVoices: /Google|Microsoft|Apple|Samantha|Daniel|Karen|Moira|Fiona/i,
  },
  ja: {
    language: 'ja-JP',
    preferredVoices: /Google|Microsoft|Apple|Kyoko|Otoya/i,
  },
} as const;

// 自動再生モードの設定
export const AUTO_PLAY_CONFIG = {
  // 最初の読み上げ完了後、答えを表示するまでの待機時間（ミリ秒）
  DELAY_BEFORE_ANSWER: 5000,
  // 答えの読み上げ完了後、次のフレーズに移動するまでの待機時間（ミリ秒）
  DELAY_BEFORE_NEXT: 3000,
} as const;