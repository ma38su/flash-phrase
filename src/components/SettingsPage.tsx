import React from 'react';
import { IconArrowLeft, IconVolume, IconRefresh } from '@tabler/icons-react';
import type { SpeechSettings } from '../types/settings';
import type { VoiceInfo } from '../hooks/useVoices';
import PageContainer from './PageContainer';

interface Props {
  settings: SpeechSettings;
  onUpdateSettings: (newSettings: Partial<SpeechSettings>) => void;
  onResetSettings: () => void;
  onBack: () => void;
  onTestSpeech: (language: 'en' | 'ja') => void;
  englishVoices: VoiceInfo[];
  japaneseVoices: VoiceInfo[];
}

const SettingsPage: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  onBack,
  onTestSpeech,
  englishVoices,
  japaneseVoices,
}) => {
  return (
    <PageContainer maxWidth="2xl" showTitle={false}>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-4 rounded-sm transition duration-200 shadow-md flex items-center gap-2"
        >
          <IconArrowLeft size={18} stroke={2} />
          <span>戻る</span>
        </button>
      </div>

      <div className="bg-gray-800 rounded-sm shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-100 text-center">音声設定</h2>

        {/* 音声の種類選択 */}
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">
            音声の種類
          </h3>

          {/* 英語の音声選択 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-indigo-300 font-medium">英語</label>
              <button
                onClick={() => onTestSpeech('en')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm px-2 py-1 shadow-md"
                aria-label="英語をテスト再生"
              >
                <IconVolume size={16} stroke={2} />
              </button>
            </div>
            <select
              value={settings.enVoice}
              onChange={(e) => onUpdateSettings({ enVoice: e.target.value })}
              className="w-full bg-gray-700 text-gray-100 rounded-sm px-3 py-2 border border-gray-600 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">自動選択</option>
              {englishVoices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* 日本語の音声選択 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-pink-300 font-medium">日本語</label>
              <button
                onClick={() => onTestSpeech('ja')}
                className="bg-pink-600 hover:bg-pink-700 text-white rounded-sm px-2 py-1 shadow-md"
                aria-label="日本語をテスト再生"
              >
                <IconVolume size={16} stroke={2} />
              </button>
            </div>
            <select
              value={settings.jaVoice}
              onChange={(e) => onUpdateSettings({ jaVoice: e.target.value })}
              className="w-full bg-gray-700 text-gray-100 rounded-sm px-3 py-2 border border-gray-600 focus:border-pink-500 focus:outline-none"
            >
              <option value="">自動選択</option>
              {japaneseVoices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 読み上げ速度設定 */}
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">
            読み上げ速度
          </h3>

          {/* 英語速度 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-indigo-300 font-medium">英語</label>
              <span className="text-gray-400 text-sm w-14 text-right">{settings.enRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.enRate}
              onChange={(e) => onUpdateSettings({ enRate: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>1.5x</span>
            </div>
          </div>

          {/* 日本語速度 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-pink-300 font-medium">日本語</label>
              <span className="text-gray-400 text-sm w-14 text-right">{settings.jaRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.jaRate}
              onChange={(e) => onUpdateSettings({ jaRate: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>1.5x</span>
            </div>
          </div>
        </div>

        {/* 自動再生設定 */}
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">
            自動再生のインターバル
          </h3>

          {/* 答え表示前の待機時間 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-300 font-medium">答え表示前</label>
              <span className="text-gray-400 text-sm">{(settings.delayBeforeAnswer / 1000).toFixed(1)}秒</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={settings.delayBeforeAnswer}
              onChange={(e) => onUpdateSettings({ delayBeforeAnswer: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0秒</span>
              <span>5秒</span>
              <span>10秒</span>
            </div>
          </div>

          {/* 次のフレーズ前の待機時間 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-300 font-medium">次のフレーズ前</label>
              <span className="text-gray-400 text-sm">{(settings.delayBeforeNext / 1000).toFixed(1)}秒</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={settings.delayBeforeNext}
              onChange={(e) => onUpdateSettings({ delayBeforeNext: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0秒</span>
              <span>5秒</span>
              <span>10秒</span>
            </div>
          </div>
        </div>

        {/* リセットボタン */}
        <div className="flex justify-center">
          <button
            onClick={onResetSettings}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-gray-200 font-semibold py-2 px-4 rounded-sm transition duration-200 shadow-md"
          >
            <IconRefresh size={18} stroke={2} />
            <span>デフォルトに戻す</span>
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
