import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { kuroshiroInstance } from '../utils/kuroshiro';
import { playDynamicAudio } from '../utils/audio';

interface JLPTContent {
  grammar: {
    pattern: string;
    meaning: string;
    examples: string[];
    romaji?: string[];
  }[];
  vocabulary: {
    word: string;
    reading: string;
    meaning: string;
    romaji?: string;
  }[];
  reading: {
    passage: string;
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
    }[];
    romaji?: string;
  }[];
}

const Section7 = () => {
  const { settings } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<string>('n5');
  const [romajiMap, setRomajiMap] = useState<{ [key: string]: string }>({});

  const jlptContent = {
    n5: {
      grammar: [
        {
          pattern: '～は～です',
          meaning: 'I am a student',
          examples: ['わたしは がくせい です'],
          romaji: ['watashihaku sei desu']
        },
        {
          pattern: '～に～があります',
          meaning: 'There is a book on the desk',
          examples: ['つくえの うえに ほんが あります'],
          romaji: ['tsukue no ue ni hon ga arimasu']
        }
      ],
      vocabulary: [
        {
          word: '食べる',
          reading: 'たべる',
          meaning: 'to eat',
          romaji: 'taberu'
        },
        {
          word: '飲む',
          reading: 'のむ',
          meaning: 'to drink',
          romaji: 'nomu'
        }
      ],
      reading: [
        {
          passage: 'はじめまして。わたしは たなか です。にほんじん です。よろしく おねがいします。',
          questions: [
            {
              question: 'たなかさんは にほんじん ですか。',
              options: ['はい、そうです', 'いいえ、ちがいます'],
              correctAnswer: 0
            }
          ],
          romaji: 'hajimemashite. watashihaku sei desu. nihonjin desu. yoroshiku onegaishimasu.'
        }
      ]
    },
    n4: {
      grammar: [
        {
          pattern: '～てください',
          meaning: 'Please sit here',
          examples: ['ここに すわって ください'],
          romaji: ['koko ni suwotte kudasai']
        },
        {
          pattern: '～てもいいです',
          meaning: 'You may smoke here',
          examples: ['ここで たばこを すっても いいです'],
          romaji: ['koko de tabako o sutte mo ii desu']
        }
      ],
      vocabulary: [
        {
          word: '準備する',
          reading: 'じゅんびする',
          meaning: 'to prepare',
          romaji: 'junbi suru'
        },
        {
          word: '説明する',
          reading: 'せつめいする',
          meaning: 'to explain',
          romaji: 'setsumei suru'
        }
      ],
      reading: [
        {
          passage: '来週、友達と 京都へ 旅行に 行きます。新幹線で 行きます。ホテルは もう 予約しました。',
          questions: [
            {
              question: 'いつ 京都へ 行きますか。',
              options: ['今週', '来週', '先週'],
              correctAnswer: 1
            }
          ],
          romaji: 'raishuu, yotama to kyoto e ryokou ni ikimasu. shinkansen de ikimasu. hoteru wa mou yoyaku shimashita.'
        }
      ]
    }
  };

  const availableLevels = Object.keys(jlptContent);

  // Add function to get romaji
  const getRomaji = async (text: string) => {
    if (romajiMap[text]) return romajiMap[text];
    try {
      const romaji = await kuroshiroInstance.convert(text);
      setRomajiMap(prev => ({ ...prev, [text]: romaji }));
      return romaji;
    } catch (error) {
      console.error('Error converting to romaji:', error);
      return '';
    }
  };

  // Update romaji when settings change
  useEffect(() => {
    if (settings.showRomajiJLPT) {
      const updateRomaji = async () => {
        const content = jlptContent[selectedLevel as keyof typeof jlptContent];
        // Collect all texts that need romaji conversion
        const textsToConvert = [
          ...content.grammar.flatMap(grammar => grammar.examples),
          ...content.vocabulary.map(vocab => vocab.word),
          ...content.reading.map(reading => reading.passage)
        ].map(text => text.trim()).filter(text => !romajiMap[text]);
        console.log('Batching for romaji:', textsToConvert);
        if (textsToConvert.length > 0) {
          const newRomajiMap = await kuroshiroInstance.convertBatch(textsToConvert);
          console.log('Batch result:', newRomajiMap);
          setRomajiMap(prev => ({ ...prev, ...newRomajiMap }));
        }
      };
      updateRomaji();
    }
  }, [settings.showRomajiJLPT, selectedLevel]);

  // Update the content display
  const renderContent = (content: JLPTContent) => (
    <div className="space-y-8">
      {/* Grammar Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Grammar</h3>
        <div className="space-y-6">
          {content.grammar.map((grammar, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium mb-2">{grammar.pattern}</h4>
              <p className="text-gray-700 mb-4">{grammar.meaning}</p>
              <div className="space-y-2">
                {grammar.examples.map((example, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <p className="text-lg">{example}</p>
                    <button
                      onClick={() => playDynamicAudio(example)}
                      className="p-1 rounded-full hover:bg-gray-200"
                      title="Play Example Audio"
                    >
                      🔊
                    </button>
                    {settings.showRomajiJLPT && (
                      <p className="text-gray-500 italic">
                        {romajiMap[example.trim()] || 'Loading...'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vocabulary Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Vocabulary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.vocabulary.map((vocab, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="font-medium">{vocab.word}</div>
                <button
                  onClick={() => playDynamicAudio(vocab.word)}
                  className="p-1 rounded-full hover:bg-gray-200"
                  title="Play Word Audio"
                >
                  🔊
                </button>
              </div>
              <div className="text-gray-600">{vocab.reading}</div>
              <div className="text-gray-700 mt-1">{vocab.meaning}</div>
              {settings.showRomajiJLPT && (
                <div className="text-gray-500 italic mt-1">
                  {romajiMap[vocab.word.trim()] || 'Loading...'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reading Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Reading Practice</h3>
        <div className="space-y-8">
          {content.reading.map((reading, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="mb-6">
                <h4 className="font-medium mb-2">Passage:</h4>
                <div className="flex items-center gap-2">
                  <p className="text-lg leading-relaxed">{reading.passage}</p>
                  <button
                    onClick={() => playDynamicAudio(reading.passage)}
                    className="ml-2 p-2 rounded-full hover:bg-gray-200"
                    title="Play Passage Audio"
                  >
                    🔊
                  </button>
                </div>
                {settings.showRomajiJLPT && (
                  <p className="text-gray-500 italic mt-2">
                    {romajiMap[reading.passage.trim()] || 'Loading...'}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                {reading.questions.map((question, qIndex) => (
                  <div key={qIndex} className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{question.question}</p>
                      <button
                        onClick={() => playDynamicAudio(question.question)}
                        className="p-1 rounded-full hover:bg-gray-200"
                        title="Play Question Audio"
                      >
                        🔊
                      </button>
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div
                          key={oIndex}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            name={`question-${index}-${qIndex}`}
                            id={`option-${index}-${qIndex}-${oIndex}`}
                            className="form-radio"
                          />
                          <label
                            htmlFor={`option-${index}-${qIndex}-${oIndex}`}
                            className="text-gray-700"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const content = jlptContent[selectedLevel as keyof typeof jlptContent];

  return (
    <div className="py-8">
      <div className="flex items-center mb-8">
        <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">JLPT Preparation</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex space-x-4 mb-4">
            {availableLevels.map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 rounded-lg border ${
                  selectedLevel === level
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                {level.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {content ? (
            renderContent(content)
          ) : (
            <div className="text-red-600 font-semibold">This JLPT level is not available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Section7; 