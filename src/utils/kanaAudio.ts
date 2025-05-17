import { playAudio, queueAudio } from './audio';

// Define the base path for kana audio files
const KANA_AUDIO_BASE_PATH = '/audio/kana/';

// Define the mapping of romaji to kana
const romajiToKana: { [key: string]: string } = {
  // Basic vowels
  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
  
  // K series
  'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
  
  // S series
  'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
  
  // T series
  'ta': 'た', 'chi': 'ち', 'tsu': 'つ', 'te': 'て', 'to': 'と',
  
  // N series
  'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
  
  // H series
  'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'he': 'へ', 'ho': 'ほ',
  
  // M series
  'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
  
  // Y series
  'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
  
  // R series
  'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
  
  // W series
  'wa': 'わ', 'wo': 'を', 'n': 'ん',
  
  // Dakuon
  'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
  'za': 'ざ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
  'da': 'だ', 'de': 'で', 'do': 'ど',
  'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
  
  // Handakuon
  'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
  
  // Yōon
  'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
  'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ',
  'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ',
  'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
  'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
  'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
  'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
  'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
  'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ',
  'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
  'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ'
};

// Cache for audio elements
const audioCache: Record<string, HTMLAudioElement> = {};

/**
 * Play the audio for a kana character
 * @param kana The kana character to play audio for
 * @returns Promise that resolves when the audio finishes playing
 */
export const playKanaAudio = async (romaji: string): Promise<void> => {
  // Get the kana character from the romaji mapping
  const kana = romajiToKana[romaji];
  if (!kana) {
    console.warn(`No kana found for romaji: ${romaji}`);
    return;
  }

  // Use the kana-specific path
  const audioPath = `${KANA_AUDIO_BASE_PATH}${romaji}.mp3`;
  
  try {
    // Try to play from cache first
    const cache = await caches.open('japvoc-audio-v1.0.0');
    const cachedResponse = await cache.match(audioPath);
    
    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      const url = URL.createObjectURL(blob);
      
      // Stop any currently playing audio
      if (audioCache[romaji]) {
        audioCache[romaji].pause();
        URL.revokeObjectURL(audioCache[romaji].src);
      }
      
      // Create and play new audio
      const audio = new Audio(url);
      audioCache[romaji] = audio;
      
      // Clean up when done
      audio.onended = () => {
        URL.revokeObjectURL(url);
        delete audioCache[romaji];
      };
      
      await audio.play();
      return;
    }
    
    // If not in cache, try to fetch and cache
    const response = await fetch(audioPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }
    
    // Cache the response
    await cache.put(audioPath, response.clone());
    
    // Play the audio
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    // Stop any currently playing audio
    if (audioCache[romaji]) {
      audioCache[romaji].pause();
      URL.revokeObjectURL(audioCache[romaji].src);
    }
    
    // Create and play new audio
    const audio = new Audio(url);
    audioCache[romaji] = audio;
    
    // Clean up when done
    audio.onended = () => {
      URL.revokeObjectURL(url);
      delete audioCache[romaji];
    };
    
    await audio.play();
  } catch (error) {
    console.error(`Failed to play kana audio for ${romaji}:`, error);
    // Fallback to Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(kana);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      // Try to find a Japanese voice
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }
};

/**
 * Preload all kana audio files
 * @returns Promise that resolves when all audio files are preloaded
 */
export const preloadKanaAudio = async (): Promise<void> => {
  const kanaList = getAvailableKanaAudio();
  const cache = await caches.open('japvoc-audio-v1.0.0');
  const preloadPromises = kanaList.map(async (kana) => {
    const romaji = Object.keys(romajiToKana).find(key => romajiToKana[key] === kana);
    if (!romaji) return;
    const audioPath = `${KANA_AUDIO_BASE_PATH}${romaji}.mp3`;
    // Try to fetch and cache, but do not play
    try {
      // Check if already cached
      const cachedResponse = await cache.match(audioPath);
      if (!cachedResponse) {
        const response = await fetch(audioPath);
        if (response.ok) {
          await cache.put(audioPath, response.clone());
        }
      }
    } catch (error) {
      console.error(`Error preloading audio for ${kana}:`, error);
    }
  });

  try {
    await Promise.all(preloadPromises);
    console.log('All kana audio files preloaded successfully');
  } catch (error) {
    console.error('Error preloading kana audio files:', error);
  }
};

/**
 * Check if audio is available for a kana character
 * @param kana The kana character to check
 * @returns boolean indicating if audio is available
 */
export const hasKanaAudio = (kana: string): boolean => {
  return true; // Audio is always available through the main audio system
};

/**
 * Get all available kana audio keys
 * @returns Array of kana characters that have audio available
 */
export const getAvailableKanaAudio = (): string[] => {
  return [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'を', 'ん',
    // Dakuon
    'が', 'ぎ', 'ぐ', 'げ', 'ご',
    'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
    'だ', 'ぢ', 'づ', 'で', 'ど',
    'ば', 'び', 'ぶ', 'べ', 'ぼ',
    'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
    // Yōon
    'きゃ', 'きゅ', 'きょ',
    'しゃ', 'しゅ', 'しょ',
    'ちゃ', 'ちゅ', 'ちょ',
    'にゃ', 'にゅ', 'にょ',
    'ひゃ', 'ひゅ', 'ひょ',
    'みゃ', 'みゅ', 'みょ',
    'りゃ', 'りゅ', 'りょ',
    'ぎゃ', 'ぎゅ', 'ぎょ',
    'じゃ', 'じゅ', 'じょ',
    'びゃ', 'びゅ', 'びょ',
    'ぴゃ', 'ぴゅ', 'ぴょ'
  ];
};

export default {
  playKanaAudio,
  preloadKanaAudio,
  hasKanaAudio,
  getAvailableKanaAudio,
}; 