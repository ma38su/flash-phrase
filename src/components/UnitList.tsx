import React from 'react';
import { IconVolume, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import type { Phrase } from '../types';

interface Props {
  phrases: Phrase[];
  showEN: boolean;
  showJA: boolean;
  onToggleEN: () => void;
  onToggleJA: () => void;
  onSpeak: (text: string) => void;
  onSpeakJapanese: (text: string) => void;
  unit: number;
  units: number[];
  onPrev: () => void;
  onNext: () => void;
  disablePrev: boolean;
  disableNext: boolean;
}

const UnitList: React.FC<Props> = ({ phrases, showEN, showJA, onToggleEN, onToggleJA, onSpeak, onSpeakJapanese, unit, units, onPrev, onNext, disablePrev, disableNext }) => (
  <>
    <div className="flex gap-4 mb-4 justify-center">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={showEN} onChange={onToggleEN} className="w-5 h-5 text-indigo-400 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-indigo-500" />
        <span className="text-indigo-300 font-semibold">英語を表示</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={showJA} onChange={onToggleJA} className="w-5 h-5 text-pink-400 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-pink-500" />
        <span className="text-pink-300 font-semibold">日本語を表示</span>
      </label>
    </div>
    <div className="bg-gray-800 rounded-sm shadow-2xl p-4 sm:p-8">
      <ul className="divide-y divide-gray-700">
        {phrases.map((phrase, idx) => (
          <li key={idx} className="py-3 sm:py-4 flex items-start gap-3 sm:gap-4">
            <span className="text-indigo-300 font-bold min-w-[2em] sm:min-w-[2.5em] text-center pt-1 text-sm sm:text-base">{phrase.No}.</span>
            <div className="flex flex-col flex-1">
              {showEN && (
                <div className="mb-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); onSpeak(phrase.EN); }}
                      className="self-start bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm px-2 py-1 shadow-md text-xs sm:text-base pointer-events-auto"
                      aria-label="英文を再生"
                    >
                      <IconVolume size={16} stroke={2} />
                    </button>
                    <span className="text-indigo-300 text-sm sm:text-base md:text-lg wrap-break-word font-semibold">{phrase.EN}</span>
                  </div>
                </div>
              )}
              {showJA && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); onSpeakJapanese(phrase.JA); }}
                    className="self-start bg-pink-600 hover:bg-pink-700 text-white rounded-sm px-2 py-1 shadow-md text-xs sm:text-base pointer-events-auto"
                    aria-label="日本語を再生"
                  >
                    <IconVolume size={16} stroke={2} />
                  </button>
                  <span className="text-gray-100 text-sm sm:text-base md:text-lg wrap-break-word">{phrase.JA}</span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-between mt-8 gap-4">
        <div className="flex-1">
          {!disablePrev && (
            <button
              onClick={onPrev}
              className="flex items-center gap-1 sm:gap-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-3 sm:px-4 rounded-sm transition duration-200 shadow-md"
            >
              <IconArrowLeft size={20} stroke={2} />
              <span className="hidden sm:inline">Unit {units[units.indexOf(unit) - 1]}へ</span>
              <span className="sm:hidden">Unit {units[units.indexOf(unit) - 1]}</span>
            </button>
          )}
        </div>
        
        <div className="flex-1 flex justify-end">
          {!disableNext && (
            <button
              onClick={onNext}
              className="flex items-center gap-1 sm:gap-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-3 sm:px-4 rounded-sm transition duration-200 shadow-md"
            >
              <span className="hidden sm:inline">Unit {units[units.indexOf(unit) + 1]}へ</span>
              <span className="sm:hidden">Unit {units[units.indexOf(unit) + 1]}</span>
              <IconArrowRight size={20} stroke={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  </>
);

export default UnitList;