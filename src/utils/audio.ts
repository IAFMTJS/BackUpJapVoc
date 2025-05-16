// Audio player utility
let audioPlayer: HTMLAudioElement | null = null;

// Helper to create a SHA-1 hash from a string (safe for filenames)
function hashJapanese(text: string): string {
  // Use SubtleCrypto if available (browser), else fallback to a simple hash (for Node/testing)
  if (window.crypto && window.crypto.subtle) {
    // This is async, but for simplicity, use a sync fallback for now
    // In production, you may want to use async hashing
    // Here, we'll use a simple hash for compatibility
    let hash = 0, i, chr;
    for (i = 0; i < text.length; i++) {
      chr = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash.toString(16);
  } else {
    // Fallback: simple hash
    let hash = 0, i, chr;
    for (i = 0; i < text.length; i++) {
      chr = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash.toString(16);
  }
}

export const playAudio = (japanese: string, type: 'word' | 'example' = 'word', exampleIndex?: number) => {
  // Stop any currently playing audio
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer = null;
  }

  // Construct the audio file path using the hash
  const hash = hashJapanese(japanese);
  let filename = `${hash}.mp3`;
  if (type === 'example' && exampleIndex !== undefined) {
    filename = `${hash}_example_${exampleIndex + 1}.mp3`;
  }

  // Create and play the audio
  audioPlayer = new Audio(`/audio/${filename}`);
  audioPlayer.play().catch(error => {
    console.error('Error playing audio:', error);
    // Fallback to Web Speech API if audio file is not found
    const utterance = new SpeechSynthesisUtterance(japanese);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  });

  // Clean up when audio finishes playing
  audioPlayer.onended = () => {
    audioPlayer = null;
  };
};

// Fallback to Web Speech API for dynamic content
export const playDynamicAudio = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  window.speechSynthesis.speak(utterance);
}; 