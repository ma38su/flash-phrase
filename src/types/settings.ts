// 音声設定の型定義
export interface SpeechSettings {
  enRate: number;  // 英語の読み上げ速度
  jaRate: number;  // 日本語の読み上げ速度
  enVoice: string; // 英語の音声名（voiceURI）
  jaVoice: string; // 日本語の音声名（voiceURI）
  autoSpeak: boolean;  // 自動読み上げのON/OFF
}

// デフォルト設定（音声は空文字=自動選択）
export const DEFAULT_SETTINGS: SpeechSettings = {
  enRate: 1.0,
  jaRate: 1.0,
  enVoice: '', // 空の場合は自動選択
  jaVoice: '', // 空の場合は自動選択
  autoSpeak: true,  // デフォルトでON
};
