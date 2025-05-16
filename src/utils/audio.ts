// Audio player utility
let audioPlayer: HTMLAudioElement | null = null;

export const playAudio = (id: string, type: 'word' | 'example' = 'word', exampleIndex?: number) => {
  // Stop any currently playing audio
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer = null;
  }

  // Construct the audio file path
  let filename = `${id}.mp3`;
  if (type === 'example' && exampleIndex !== undefined) {
    filename = `${id}_example_${exampleIndex + 1}.mp3`;
  }

  // Create and play the audio
  audioPlayer = new Audio(`/audio/${filename}`);
  audioPlayer.play().catch(error => {
    console.error('Error playing audio:', error);
    // Fallback to Web Speech API if audio file is not found
    const utterance = new SpeechSynthesisUtterance(id);
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