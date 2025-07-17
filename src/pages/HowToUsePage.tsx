import React from 'react';
import { useNavigate } from 'react-router-dom';

const HowToUsePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 bg-dark-lighter rounded-nav shadow-card dark:shadow-dark-card mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center">How to Use This Site</h1>
      <p className="mb-4 text-lg">
        Welcome! This site is designed to help you learn Japanese in a fun, interactive, and effective way. Here's how you can make the most of all the features:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-base">
        <li><b>Romaji Section:</b> Start here if you're new! Practice words, sentences, and stories with Romaji, Kanji, and English. Listen to native audio and type what you hear or see.</li>
        <li><b>Vocabulary:</b> Build your Japanese vocabulary by level and topic. Mark words as mastered as you learn them.</li>
        <li><b>Anime Section:</b> Learn real phrases from anime! Listen, read, and practice with context and examples.</li>
        <li><b>Reading Practice:</b> Read short stories and passages. Use the audio and translation to improve your reading and listening skills.</li>
        <li><b>Games:</b> Reinforce your knowledge with fun games and quizzes. Try matching, memory, and timed challenges!</li>
        <li><b>Progress & SRS:</b> Track your progress, review mastered words, and use Spaced Repetition to retain what you've learned.</li>
        <li><b>Settings:</b> Customize your experience: show/hide Romaji, Kanji, or English, and adjust difficulty.</li>
        <li><b>Virtual Teacher:</b> Your daily quest and encouragement! Complete daily goals for streaks and rewards.</li>
      </ul>
      <h2 className="text-xl font-semibold mb-2 text-blue-600">Tips for Effective Learning</h2>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-base">
        <li>Practice a little every day for the best results.</li>
        <li>Use the audio features to improve your listening and pronunciation.</li>
        <li>Don't be afraid to make mistakes—learning is a journey!</li>
        <li>Try all the sections: reading, listening, games, and quizzes.</li>
        <li>Track your progress and celebrate your achievements!</li>
      </ul>
      <div className="flex justify-center mt-8">
        <button
          className="px-6 py-2 bg-japanese-red text-text-primary dark:text-text-dark-primary rounded-nav shadow hover:bg-japanese-red text-lg font-semibold"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default HowToUsePage; 