import React from 'react';
import { IconArrowLeft, IconArrowRight, IconVolume, IconArrowsShuffle, IconHome, IconVolumeOff } from '@tabler/icons-react';
import type { Phrase } from '../types';

interface Props {
  phrase: Phrase;
  showEnglish: boolean;
  reverseMode: boolean;
  onClick: () => void;
  onSpeak: (text: string) => void;
  onSpeakJapanese: (text: string) => void;
  onPrev: () => void;
  total: number;
  index: number;
  unitLabel: string;
  onBack: () => void;
  onShuffle: () => void;
  isRandom: boolean;
  isAutoSpeak: boolean;
  onToggleAutoSpeak: () => void;
}

const PhraseCard: React.FC<Props> = ({ phrase, showEnglish, reverseMode, onClick, onSpeak, onSpeakJapanese, onPrev, total, index, unitLabel, onBack, onShuffle, isRandom, isAutoSpeak, onToggleAutoSpeak }) => {
  return (
    <div>
      <div className="flex items-center mb-6 gap-2">
      <button
        onClick={onBack}
        className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-2 sm:px-4 rounded-sm transition duration-200 shadow-md flex items-center gap-1 sm:gap-2"
      >
        <IconHome size={18} stroke={2} />
        <span className="hidden sm:inline">ユニット選択に戻る</span>
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <h2 className="text-2xl font-bold text-gray-100">{unitLabel}</h2>
        <div className="text-sm sm:text-base text-gray-300 font-medium bg-gray-700 px-2 py-1 rounded-sm">
          {index + 1} / {total}
        </div>
      </div>
      <div className="ml-auto flex gap-2">
        <button
          onClick={onShuffle}
          className={`flex items-center gap-1 font-semibold py-1 sm:py-2 px-2 sm:px-3 rounded-sm transition duration-200 shadow-md text-sm ${
            isRandom 
              ? 'bg-pink-600 hover:bg-pink-700 text-white' 
              : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
          }`}
        >
          <IconArrowsShuffle size={16} stroke={2} />
          <span className="hidden sm:inline">シャッフル{isRandom ? ' ON' : ' OFF'}</span>
        </button>
      <button
        onClick={onToggleAutoSpeak}
        className={`flex items-center gap-1 font-semibold py-1 sm:py-2 px-2 sm:px-3 rounded-sm transition duration-200 shadow-md text-sm ${
          isAutoSpeak 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
        }`}
      >
        {isAutoSpeak ? <IconVolume size={16} stroke={2} /> : <IconVolumeOff size={16} stroke={2} />}
        <span className="hidden sm:inline">自動読み上げ{isAutoSpeak ? ' ON' : ' OFF'}</span>
      </button>
      </div>
    </div>
    <div className="bg-gray-800 rounded-sm shadow-2xl p-8 cursor-pointer hover:shadow-3xl transition duration-200 min-h-100 flex flex-col justify-center items-center select-none relative overflow-hidden">
      <div
        className="absolute top-0 left-0 h-full flex items-center justify-start bg-linear-to-r from-indigo-900/20 to-transparent"
        style={{ width: '20%', zIndex: 10 }}
        onClick={e => {
          e.stopPropagation();
          onPrev();
        }}
      >
        <div className="h-full flex items-center pl-4 text-indigo-300 opacity-80">
          <IconArrowLeft size={32} stroke={2.5} />
        </div>
      </div>
      <div
        className="absolute top-0 right-0 h-full flex items-center justify-end bg-linear-to-l from-pink-900/15 to-transparent"
        style={{ width: '80%', zIndex: 5 }}
        onClick={e => {
          e.stopPropagation();
          // 音声ボタンがクリックされた場合は進まない
          if ((e.target as Element).closest('button[aria-label="英文を再生"]')) {
            return;
          }
          onClick();
        }}
      >
        <div className="h-full flex items-center pr-4 text-pink-300 opacity-80">
          <IconArrowRight size={32} stroke={2.5} />
        </div>
      </div>
      <div className="w-full h-full flex flex-col justify-start items-center pointer-events-none">
        {!reverseMode ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6 sm:mb-8 justify-center">
              <button
                type="button"
                onClick={e => { 
                  e.stopPropagation(); 
                  e.preventDefault();
                  onSpeakJapanese(phrase.JA); 
                }}
                className="self-center bg-pink-600 hover:bg-pink-700 text-white rounded-sm px-2 sm:px-3 py-1 shadow-md text-sm sm:text-base pointer-events-auto relative z-20"
                aria-label="日本語を再生"
              >
                <IconVolume size={18} stroke={2} />
              </button>
              <p className="text-2xl sm:text-3xl text-gray-100 font-medium tracking-wide text-center">
                {phrase.JA}
              </p>
            </div>
            <div className={`mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col items-center ${showEnglish ? '' : 'invisible'}`}>
              <div className="w-32 sm:w-48 border-t-2 border-indigo-700 mb-4 sm:mb-6"></div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <button
                  type="button"
                  onClick={e => { 
                    e.stopPropagation(); 
                    e.preventDefault();
                    onSpeak(phrase.EN); 
                  }}
                  className="self-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm px-2 sm:px-3 py-1 shadow-md text-sm sm:text-base pointer-events-auto relative z-20"
                  aria-label="英文を再生"
                >
                  <IconVolume size={18} stroke={2} />
                </button>
                <p className="text-xl sm:text-2xl text-indigo-300 font-semibold text-center">
                  {phrase.EN}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6 sm:mb-8 justify-center">
              <button
                type="button"
                onClick={e => { 
                  e.stopPropagation(); 
                  e.preventDefault();
                  onSpeak(phrase.EN); 
                }}
                className="self-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm px-2 sm:px-3 py-1 shadow-md text-sm sm:text-base pointer-events-auto relative z-20"
                aria-label="英文を再生"
              >
                <IconVolume size={18} stroke={2} />
              </button>
              <p className="text-2xl sm:text-3xl text-indigo-300 font-semibold tracking-wide text-center">
                {phrase.EN}
              </p>
            </div>
            <div className={`mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col items-center ${showEnglish ? '' : 'invisible'}`}>
              <div className="w-32 sm:w-48 border-t-2 border-pink-700 mb-4 sm:mb-6"></div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <button
                  type="button"
                  onClick={e => { 
                    e.stopPropagation(); 
                    e.preventDefault();
                    onSpeakJapanese(phrase.JA); 
                  }}
                  className="self-center bg-pink-600 hover:bg-pink-700 text-white rounded-sm px-2 sm:px-3 py-1 shadow-md text-sm sm:text-base pointer-events-auto relative z-20"
                  aria-label="日本語を再生"
                >
                  <IconVolume size={18} stroke={2} />
                </button>
                <p className="text-xl sm:text-2xl text-gray-100 font-medium text-center">
                  {phrase.JA}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="mt-8 sm:mt-12 text-gray-400 text-xs sm:text-sm text-center px-2">
        {!showEnglish ? (reverseMode ? 'クリックして日本語訳を表示' : 'クリックして英訳を表示') : 
         index < total - 1 ? 'クリックして次へ' : 'クリックして終了'}
      </div>
    </div>
  </div>
  );
};

export default PhraseCard;