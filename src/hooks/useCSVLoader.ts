import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import type { Phrase } from '../types';
import { UNIT_FILES } from '../constants';

export const useCSVLoader = () => {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [units, setUnits] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllUnits = async () => {
      const allPhrases: Phrase[] = [];
      
      for (const unitFile of UNIT_FILES) {
        try {
          const response = await fetch(unitFile.filepath);
          const csvText = await response.text();
          
          await new Promise<void>((resolve) => {
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
                allPhrases.push(...unitPhrases);
                resolve();
              }
            });
          });
        } catch (error) {
          console.error(`Failed to load ${unitFile.filepath}:`, error);
        }
      }
      
      setPhrases(allPhrases);
      
      // ユニット一覧を抽出（数値としてソート）
      const uniqueUnits = Array.from(new Set(allPhrases.map(p => p.Unit))).sort((a, b) => a - b);
      setUnits(uniqueUnits);
      setLoading(false);
    };
    
    loadAllUnits();
  }, []);

  return { phrases, units, loading };
};