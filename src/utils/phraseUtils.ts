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

/**
 * ユニット配列から次/前のユニットのインデックスを取得する
 */
export const getAdjacentUnitIndex = (units: number[], currentUnit: number, direction: 'next' | 'prev'): number => {
  const currentIndex = units.indexOf(currentUnit);
  if (direction === 'next') {
    return Math.min(currentIndex + 1, units.length - 1);
  } else {
    return Math.max(currentIndex - 1, 0);
  }
};

/**
 * ユニット配列で最初/最後かどうかを判定する
 */
export const isUnitAtBoundary = (units: number[], currentUnit: number, boundary: 'first' | 'last'): boolean => {
  const currentIndex = units.indexOf(currentUnit);
  return boundary === 'first' ? currentIndex <= 0 : currentIndex >= units.length - 1;
};