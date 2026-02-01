import { useCallback, useRef } from 'react';
import Papa from 'papaparse';
import type { Phrase } from '../types';
import { UNIT_FILES } from '../constants';

export const useCSVLoader = () => {
  const loadedUnitsRef = useRef<Map<number, Phrase[]>>(new Map());
  const loadingUnitsRef = useRef<Set<number>>(new Set());

  // 利用可能なユニット番号のリスト（定数から取得）
  const units = UNIT_FILES.map(file => file.unitNumber).sort((a, b) => a - b);

  const loadUnit = useCallback(async (unitNumber: number): Promise<Phrase[]> => {
    // すでに読み込み済みの場合はキャッシュから返す
    if (loadedUnitsRef.current.has(unitNumber)) {
      return loadedUnitsRef.current.get(unitNumber)!;
    }

    // すでに読み込み中の場合は待機
    if (loadingUnitsRef.current.has(unitNumber)) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (loadedUnitsRef.current.has(unitNumber)) {
            resolve(loadedUnitsRef.current.get(unitNumber)!);
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

    loadingUnitsRef.current.add(unitNumber);

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

      loadedUnitsRef.current.set(unitNumber, phrases);
      loadingUnitsRef.current.delete(unitNumber);

      return phrases;
    } catch (error) {
      console.error(`Failed to load unit ${unitNumber}:`, error);
      loadingUnitsRef.current.delete(unitNumber);
      throw error;
    }
  }, []);

  const isUnitLoading = useCallback((unitNumber: number) => {
    return loadingUnitsRef.current.has(unitNumber);
  }, []);

  const getLoadedUnit = useCallback((unitNumber: number) => {
    return loadedUnitsRef.current.get(unitNumber) || [];
  }, []);

  return { units, loadUnit, isUnitLoading, getLoadedUnit };
};