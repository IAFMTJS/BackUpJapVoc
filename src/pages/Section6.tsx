import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useWordLevel } from '../context/WordLevelContext';
import { kuroshiroInstance } from '../utils/kuroshiro';
import { playAudio } from '../utils/audio';

interface ReadingMaterial {
  title: string;
  content: string;
  translation: string;
  vocabulary: string[];
  level: number;
}

const Section6 = () => {
  const { settings } = useApp();
  const { updateReadingProgress } = useWordLevel();
  const [selectedType, setSelectedType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate'>('beginner');
  const [completedMaterials, setCompletedMaterials] = useState<Set<string>>(new Set());
  const [romajiMap, setRomajiMap] = useState<Record<string, string>>({});

  // Get current materials based on selected type and level
  const currentMaterials = useMemo(() => {
    const readingMaterials = {
      hiragana: {
        beginner: [
          {
            title: 'はじめまして',
            content: 'わたしは たなか です。にほんじん です。よろしく おねがいします。',
            translation: 'Nice to meet you. I am Tanaka. I am Japanese. Please be kind to me.',
            vocabulary: ['はじめまして', 'わたし', 'たなか', 'にほんじん', 'よろしく おねがいします'],
            level: 1
          },
          {
            title: 'わたしの いえ',
            content: 'わたしの いえは ちいさい です。でも、きれい です。にわに はな が あります。',
            translation: 'My house is small. But it is beautiful. There are flowers in the garden.',
            vocabulary: ['いえ', 'ちいさい', 'きれい', 'にわ', 'はな'],
            level: 1
          }
        ],
        intermediate: [
          {
            title: 'まいにちの せいかつ',
            content: 'まいあさ 6じに おきます。7じに あさごはんを たべます。8じに がっこうに いきます。',
            translation: 'I wake up at 6 every morning. I eat breakfast at 7. I go to school at 8.',
            vocabulary: ['まいあさ', 'おきます', 'あさごはん', 'たべます', 'がっこう'],
            level: 2
          }
        ]
      },
      katakana: {
        beginner: [
          {
            title: 'レストランで',
            content: 'ハンバーガーと コーラを ください。サラダも おねがいします。',
            translation: 'Please give me a hamburger and cola. I would also like a salad.',
            vocabulary: ['レストラン', 'ハンバーガー', 'コーラ', 'サラダ'],
            level: 1
          },
          {
            title: 'ショッピング',
            content: 'デパートで シャツと ズボンを かいました。とても たかい です。',
            translation: 'I bought a shirt and pants at the department store. They are very expensive.',
            vocabulary: ['ショッピング', 'デパート', 'シャツ', 'ズボン', 'たかい'],
            level: 1
          }
        ],
        intermediate: [
          {
            title: 'インターネット',
            content: 'インターネットで ニュースを よみます。メールも おくります。',
            translation: 'I read news on the internet. I also send emails.',
            vocabulary: ['インターネット', 'ニュース', 'メール', 'おくります'],
            level: 2
          }
        ]
      }
    };

    return readingMaterials[selectedType as keyof typeof readingMaterials][selectedLevel as keyof typeof readingMaterials.hiragana];
  }, [selectedType, selectedLevel]);

  // Romaji conversion with batch processing
  useEffect(() => {
    if (settings.showRomajiReading) {
      const updateRomaji = async () => {
        // Collect all texts that need romaji conversion
        const textsToConvert = currentMaterials.flatMap(material => [
          material.content.trim(),
          ...material.vocabulary.map(word => word.trim())
        ]).filter(text => !romajiMap[text]);
        console.log('Batching for romaji:', textsToConvert);
        if (textsToConvert.length > 0) {
          const newRomajiMap = await kuroshiroInstance.convertBatch(textsToConvert);
          console.log('Batch result:', newRomajiMap);
          setRomajiMap(prev => ({ ...prev, ...newRomajiMap }));
        }
      };
      updateRomaji();
    }
  }, [settings.showRomajiReading, selectedType, selectedLevel, currentMaterials]);

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

  const handleCompleteMaterial = (material: ReadingMaterial) => {
    const materialKey = `${material.level}-${material.title}`;
    if (!completedMaterials.has(materialKey)) {
      updateReadingProgress(material.level, true);
      setCompletedMaterials(prev => new Set([...prev, materialKey]));
    }
  };

  const renderReadingMaterial = (material: ReadingMaterial) => (
    <div className="bg-dark-lighter rounded-nav shadow-card dark:shadow-dark-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{material.title}</h3>
        {!completedMaterials.has(`${material.level}-${material.title}`) && (
          <button
            onClick={() => handleCompleteMaterial(material)}
            className="px-4 py-2 bg-status-success text-text-primary dark:text-text-dark-primary rounded-nav hover:bg-green-600 transition-colors"
          >
            Mark as Completed
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium mb-2">Reading:</h4>
        <div className="flex items-center gap-2">
          <p className="text-lg leading-relaxed">{material.content}</p>
          <button
            onClick={() => playAudio(material.content)}
            className="ml-2 p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-200"
            title="Play Reading Audio"
          >
            🔊
          </button>
        </div>
        {settings.showRomajiReading && (
          <p className="text-text-muted dark:text-text-dark-muted italic mt-2">
            {romajiMap[material.content.trim()] || 'Loading...'}
          </p>
        )}
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Translation:</h4>
        <p className="text-text-secondary dark:text-text-dark-secondary">{material.translation}</p>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Vocabulary:</h4>
        <div className="flex flex-wrap gap-2">
          {material.vocabulary.map((word, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {word}
                </span>
                <button
                  onClick={() => playAudio(word)}
                  className="p-1 rounded-full hover:bg-gray-200"
                  title="Play Word Audio"
                >
                  🔊
                </button>
              </div>
              {settings.showRomajiReading && (
                <span className="text-xs text-text-muted dark:text-text-dark-muted mt-1">
                  {romajiMap[word.trim()] || 'Loading...'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-8">
      <div className="flex items-center mb-8">
        <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary">Reading Practice</h1>
      </div>
      
      <div className="bg-white dark:bg-dark-elevated rounded-nav shadow-card dark:shadow-dark-card p-6">
        <div className="mb-6">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setSelectedType('hiragana')}
              className={`px-4 py-2 rounded-nav border ${
                selectedType === 'hiragana'
                  ? 'bg-dark-lighter border-dark-border'
                  : 'bg-dark-lighter border-dark-border hover:bg-dark-lightest'
              }`}
            >
              Hiragana
            </button>
            <button
              onClick={() => setSelectedType('katakana')}
              className={`px-4 py-2 rounded-nav border ${
                selectedType === 'katakana'
                  ? 'bg-dark-lighter border-dark-border'
                  : 'bg-dark-lighter border-dark-border hover:bg-dark-lightest'
              }`}
            >
              Katakana
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedLevel('beginner')}
              className={`px-4 py-2 rounded-nav border ${
                selectedLevel === 'beginner'
                  ? 'bg-dark-lighter border-dark-border'
                  : 'bg-dark-lighter border-dark-border hover:bg-dark-lightest'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setSelectedLevel('intermediate')}
              className={`px-4 py-2 rounded-nav border ${
                selectedLevel === 'intermediate'
                  ? 'bg-dark-lighter border-dark-border'
                  : 'bg-dark-lighter border-dark-border hover:bg-dark-lightest'
              }`}
            >
              Intermediate
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {currentMaterials.map((material, index) => (
            <React.Fragment key={index}>
              {renderReadingMaterial(material)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section6; 