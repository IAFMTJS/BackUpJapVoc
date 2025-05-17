import React from 'react';
import { Link } from 'react-router-dom';
import VocabularyQuiz from '../components/VocabularyQuiz';

const VocabularySection = () => {
  return (
    <div className="py-8">
      <div className="flex items-center mb-8">
        <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Vocabulary Quiz</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-8">
          Test your knowledge of Japanese vocabulary words. 
          Choose a difficulty level, category, and number of questions to start the quiz.
        </p>
        <VocabularyQuiz />
      </div>
    </div>
  );
};

export default VocabularySection; 