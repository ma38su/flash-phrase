// 共通型定義

export interface Phrase {
  Unit: number;
  No: string;
  EN: string;
  JA: string;
}

export interface UnitFile {
  unitNumber: number;
  filepath: string;
}

// ユニット選択可能な値の型
export type SelectedUnit = number | 'all' | null;

// 学習モード
export type StudyMode = 'ja-en' | 'en-ja';

// URL状態管理用の型
export interface URLParams {
  index?: string;
  show?: string;
  random?: string;
  showEN?: string;
  showJA?: string;
}