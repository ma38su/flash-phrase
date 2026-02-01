import type { Phrase } from '../types';

/**
 * フレーズ配列をシャッフルする
 */
export const shufflePhrases = (phrases: Phrase[]): Phrase[] => {
  return [...phrases].sort(() => Math.random() - 0.5);
};

/**
 * ユニットに基づいてフレーズをフィルタリングする
 */
export const filterPhrasesByUnit = (phrases: Phrase[], unit: number | 'all'): Phrase[] => {
  return unit === 'all' ? phrases : phrases.filter(p => p.Unit === unit);
};

/**
 * ユニットラベルを生成する
 */
export const getUnitLabel = (unit: number | 'all' | null): string => {
  if (unit === 'all') return '全ユニット';
  if (unit === null) return '';
  return `Unit ${unit}`;
};