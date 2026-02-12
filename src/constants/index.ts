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
  { unitNumber: 11, filepath: '/flash-phrase/unit11.csv' },
  { unitNumber: 12, filepath: '/flash-phrase/unit12.csv' },
  { unitNumber: 13, filepath: '/flash-phrase/unit13.csv' },
  { unitNumber: 14, filepath: '/flash-phrase/unit14.csv' },
  { unitNumber: 15, filepath: '/flash-phrase/unit15.csv' },
  { unitNumber: 16, filepath: '/flash-phrase/unit16.csv' },
  { unitNumber: 17, filepath: '/flash-phrase/unit17.csv' },
  { unitNumber: 18, filepath: '/flash-phrase/unit18.csv' },
  { unitNumber: 19, filepath: '/flash-phrase/unit19.csv' },
  { unitNumber: 20, filepath: '/flash-phrase/unit20.csv' },
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