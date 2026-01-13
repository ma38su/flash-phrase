import { useCallback, useState } from 'react';
import Papa from 'papaparse';
import type { Phrase } from '../types';
import { UNIT_FILES } from '../constants';

export const useCSVLoader = () => {
  const [loadedUnits, setLoadedUnits] = useState<Map<number, Phrase[]>>(new Map());
  const [loadingUnits, setLoadingUnits] = useState<Set<number>>(new Set());

  // 利用可能なユニット番号のリスト（定数から取得）
  const units = UNIT_FILES.map(file => file.unitNumber).sort((a, b) => a - b);

  const loadUnit = useCallback(async (unitNumber: number): Promise<Phrase[]> => {
    // すでに読み込み済みの場合はキャッシュから返す
    if (loadedUnits.has(unitNumber)) {
      return loadedUnits.get(unitNumber)!;
    }

    // すでに読み込み中の場合は待機
    if (loadingUnits.has(unitNumber)) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (loadedUnits.has(unitNumber)) {
            resolve(loadedUnits.get(unitNumber)!);
          } else {
            setTimeout(checkLoaded, 50);
          }
        };
        checkLoaded();
      });
    }

    const unitFile = UNIT_FILES.find(file => file.unitNumber === unitNumber);
    if (!unitFile) {
      throw new Error(`Unit ${unitNumber} not found`);
    }

    setLoadingUnits(prev => new Set(prev).add(unitNumber));

    try {
      const response = await fetch(unitFile.filepath);
      const csvText = await response.text();
      
      const phrases = await new Promise<Phrase[]>((resolve) => {
        Papa.parse<{ No: string; EN: string; JA: string }>(csvText, {
          header: true,
          complete: (results) => {
            const unitPhrases = results.data
              .filter(row => row.EN && row.JA)
              .map(row => ({
                Unit: unitFile.unitNumber,
                No: row.No,
                EN: row.EN,
                JA: row.JA
              }));
            resolve(unitPhrases);
          }
        });
      });

      setLoadedUnits(prev => new Map(prev).set(unitNumber, phrases));
      setLoadingUnits(prev => {
        const newSet = new Set(prev);
        newSet.delete(unitNumber);
        return newSet;
      });

      return phrases;
    } catch (error) {
      console.error(`Failed to load unit ${unitNumber}:`, error);
      setLoadingUnits(prev => {
        const newSet = new Set(prev);
        newSet.delete(unitNumber);
        return newSet;
      });
      throw error;
    }
  }, [loadedUnits, loadingUnits]);

  const isUnitLoading = useCallback((unitNumber: number) => {
    return loadingUnits.has(unitNumber);
  }, [loadingUnits]);

  const getLoadedUnit = useCallback((unitNumber: number) => {
    return loadedUnits.get(unitNumber) || [];
  }, [loadedUnits]);

  return { units, loadUnit, isUnitLoading, getLoadedUnit };
};