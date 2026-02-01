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