const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Define the base path for kana audio files
const KANA_AUDIO_BASE_PATH = path.join(process.cwd(), 'public', 'audio', 'kana');

// Ensure the output directory exists
if (!fs.existsSync(KANA_AUDIO_BASE_PATH)) {
  fs.mkdirSync(KANA_AUDIO_BASE_PATH, { recursive: true });
}

// Define the mapping of romaji to kana for text-to-speech
const romajiToKana = {
  // Basic vowels
  'a': 'あ',
  'i': 'い',
  'u': 'う',
  'e': 'え',
  'o': 'お',
  
  // K series
  'ka': 'か',
  'ki': 'き',
  'ku': 'く',
  'ke': 'け',
  'ko': 'こ',
  
  // S series
  'sa': 'さ',
  'shi': 'し',
  'su': 'す',
  'se': 'せ',
  'so': 'そ',
  
  // T series
  'ta': 'た',
  'chi': 'ち',
  'tsu': 'つ',
  'te': 'て',
  'to': 'と',
  
  // N series
  'na': 'な',
  'ni': 'に',
  'nu': 'ぬ',
  'ne': 'ね',
  'no': 'の',
  
  // H series
  'ha': 'は',
  'hi': 'ひ',
  'fu': 'ふ',
  'he': 'へ',
  'ho': 'ほ',
  
  // M series
  'ma': 'ま',
  'mi': 'み',
  'mu': 'む',
  'me': 'め',
  'mo': 'も',
  
  // Y series
  'ya': 'や',
  'yu': 'ゆ',
  'yo': 'よ',
  
  // R series
  'ra': 'ら',
  'ri': 'り',
  'ru': 'る',
  're': 'れ',
  'ro': 'ろ',
  
  // W series
  'wa': 'わ',
  'wo': 'を',
  
  // N
  'n': 'ん',
  
  // Dakuon
  'ga': 'が',
  'gi': 'ぎ',
  'gu': 'ぐ',
  'ge': 'げ',
  'go': 'ご',
  'za': 'ざ',
  'ji': 'じ',
  'zu': 'ず',
  'ze': 'ぜ',
  'zo': 'ぞ',
  'da': 'だ',
  'de': 'で',
  'do': 'ど',
  'ba': 'ば',
  'bi': 'び',
  'bu': 'ぶ',
  'be': 'べ',
  'bo': 'ぼ',
  
  // Handakuon
  'pa': 'ぱ',
  'pi': 'ぴ',
  'pu': 'ぷ',
  'pe': 'ぺ',
  'po': 'ぽ',
  
  // Yōon
  'kya': 'きゃ',
  'kyu': 'きゅ',
  'kyo': 'きょ',
  'sha': 'しゃ',
  'shu': 'しゅ',
  'sho': 'しょ',
  'cha': 'ちゃ',
  'chu': 'ちゅ',
  'cho': 'ちょ',
  'nya': 'にゃ',
  'nyu': 'にゅ',
  'nyo': 'にょ',
  'hya': 'ひゃ',
  'hyu': 'ひゅ',
  'hyo': 'ひょ',
  'mya': 'みゃ',
  'myu': 'みゅ',
  'myo': 'みょ',
  'rya': 'りゃ',
  'ryu': 'りゅ',
  'ryo': 'りょ',
  'gya': 'ぎゃ',
  'gyu': 'ぎゅ',
  'gyo': 'ぎょ',
  'ja': 'じゃ',
  'ju': 'じゅ',
  'jo': 'じょ',
  'bya': 'びゃ',
  'byu': 'びゅ',
  'byo': 'びょ',
  'pya': 'ぴゃ',
  'pyu': 'ぴゅ',
  'pyo': 'ぴょ',
};

// Function to generate audio using say command (macOS) or PowerShell (Windows)
async function generateAudio(text, outputPath) {
  const platform = process.platform;
  
  try {
    if (platform === 'darwin') {
      // macOS
      await execAsync(`say -v Kyoko -o "${outputPath}" "${text}"`);
    } else if (platform === 'win32') {
      // Windows
      const psCommand = `
        Add-Type -AssemblyName System.Speech;
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $speak.SelectVoice('Microsoft Haruka Desktop');
        $speak.SetOutputToWaveFile('${outputPath}');
        $speak.Speak('${text}');
        $speak.Dispose();
      `;
      await execAsync(`powershell -Command "${psCommand}"`);
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    console.log(`Generated audio for ${text} at ${outputPath}`);
  } catch (error) {
    console.error(`Error generating audio for ${text}:`, error);
    throw error;
  }
}

// Main function to generate all kana audio files
async function generateAllKanaAudio() {
  console.log('Starting kana audio generation...');
  
  // Get unique audio file names from the mapping
  const uniqueAudioFiles = new Set(Object.values(romajiToKana));
  
  // Generate audio for each unique sound
  for (const [romaji, kana] of Object.entries(romajiToKana)) {
    const outputPath = path.join(KANA_AUDIO_BASE_PATH, `${romaji}.mp3`);
    
    // Skip if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`Audio file already exists for ${kana} (${romaji})`);
      continue;
    }
    
    try {
      await generateAudio(kana, outputPath);
      // Add a small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to generate audio for ${kana} (${romaji}):`, error);
    }
  }
  
  console.log('Kana audio generation completed!');
}

// Run the generation script
generateAllKanaAudio().catch(error => {
  console.error('Error generating kana audio files:', error);
  process.exit(1);
}); 