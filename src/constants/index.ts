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
export const SPEECH_CONFIG = {
  LANGUAGE: 'en-US',
  PREFERRED_VOICES: /Google|Microsoft|Apple|Samantha|Daniel|Karen|Moira|Fiona/i,
} as const;