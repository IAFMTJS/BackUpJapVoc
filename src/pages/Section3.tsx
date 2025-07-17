import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SettingsPanel from '../components/Settings';
import { kuroshiroInstance } from '../utils/kuroshiro';

const Section3 = () => {
  const { settings, updateProgress } = useApp();
  const [selectedExercise, setSelectedExercise] = useState<string>('sentence');
  const [prompt, setPrompt] = useState<string>('');
  const [romajiPrompt, setRomajiPrompt] = useState<string>('');
  const [showRomaji, setShowRomaji] = useState<boolean>(settings.showRomaji);
  const [userInput, setUserInput] = useState<string>('');
  const [completedExercises, setCompletedExercises] = useState<number>(0);
  const [totalExercises, setTotalExercises] = useState<number>(0);

  // Only hiragana/katakana prompts
  const prompts = {
    sentence: 'まいにち がっこう いきます', // "Every day I go to school" (hiragana)
    paragraph: 'わたしの すきな きせつは はる です。はるに なると、こうえんで さんぽ します。',
    diary: 'きょうは たのしい いちにち でした。ともだちと あそびました。',
    email: 'ともだちへ パーティーに きてください。ひは きんようび、じかんは ごご しちじ です。',
    story: 'あるひ、ふしぎな できごとが おこりました。わたしは そとで きれいな ねこを みつけました。'
  };

  const exercises = [
    { id: 'sentence', name: 'Sentence Construction' },
    { id: 'paragraph', name: 'Paragraph Writing' },
    { id: 'diary', name: 'Diary Entry' },
    { id: 'email', name: 'Email Writing' },
    { id: 'story', name: 'Story Writing' }
  ];

  const getPrompt = (type: string) => {
    return prompts[type as keyof typeof prompts] || '';
  };

  const handleExerciseChange = (exerciseId: string) => {
    setSelectedExercise(exerciseId);
    setPrompt(getPrompt(exerciseId));
    setUserInput('');
  };

  const handleSave = () => {
    if (userInput.trim().length > 0) {
      setCompletedExercises(prev => prev + 1);
      setUserInput('');
      setPrompt(getPrompt(selectedExercise));
    }
  };

  useEffect(() => {
    setTotalExercises(exercises.length);
  }, []);

  useEffect(() => {
    updateProgress('section3', completedExercises, totalExercises);
  }, [completedExercises, totalExercises, updateProgress]);

  // Romaji conversion
  useEffect(() => {
    let isMounted = true;
    const convertRomaji = async () => {
      if (showRomaji && prompt) {
        try {
          const romaji = await kuroshiroInstance.convert(prompt);
          if (isMounted) setRomajiPrompt(romaji);
        } catch {
          if (isMounted) setRomajiPrompt('');
        }
      } else {
        setRomajiPrompt('');
      }
    };
    convertRomaji();
    return () => { isMounted = false; };
  }, [prompt, showRomaji]);

  // Set initial prompt
  useEffect(() => {
    setPrompt(getPrompt(selectedExercise));
  }, [selectedExercise]);

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary">Writing Practice</h1>
        </div>
        <div className="text-sm text-text-muted dark:text-text-dark-muted">
          Progress: {completedExercises}/{totalExercises} exercises completed
        </div>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showRomaji}
            onChange={() => setShowRomaji(r => !r)}
            className="form-checkbox"
          />
          <span className="text-sm">Show Romaji</span>
        </label>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-dark-elevated rounded-nav shadow-card dark:shadow-dark-card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Choose an Exercise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleExerciseChange(exercise.id)}
                  className={`p-4 rounded-nav border ${
                    selectedExercise === exercise.id
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-white dark:bg-dark-elevated border-border-medium dark:border-border-dark dark:border-border-dark-dark-medium hover:bg-light dark:bg-dark'
                  }`}
                >
                  {exercise.name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-light dark:bg-dark p-4 rounded-nav">
              <h3 className="font-medium mb-2">Prompt:</h3>
              <p className="text-text-secondary dark:text-text-dark-secondary text-lg mb-1">{prompt}</p>
              {showRomaji && romajiPrompt && (
                <p className="text-text-muted dark:text-text-dark-muted italic text-base">{romajiPrompt}</p>
              )}
            </div>
            <div>
              <h3 className="font-medium mb-2">Your Writing:</h3>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full h-48 p-4 border rounded-nav focus:ring-2 focus:ring-japanese-red focus:border-blue-500"
                placeholder="Write your response here..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setUserInput('')}
                className="px-4 py-2 text-text-muted dark:text-text-dark-muted hover:text-gray-800"
              >
                Clear
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-japanese-red text-text-primary dark:text-text-dark-primary rounded-nav hover:bg-japanese-redLight"
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <div>
          <SettingsPanel />
        </div>
      </div>
    </div>
  );
};

export default Section3; 