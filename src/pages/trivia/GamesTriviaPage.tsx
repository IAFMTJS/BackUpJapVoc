import React from 'react';
import TriviaTopicPage from './TriviaTopicPage';
import { triviaTopics } from '../../data/triviaContent';

const GamesTriviaPage: React.FC = () => {
  const gamesTopic = triviaTopics.find(topic => topic.title === 'Japanese Games');
  
  if (!gamesTopic) {
    return null;
  }

  return <TriviaTopicPage title={gamesTopic.title} content={gamesTopic.content} />;
};

export default GamesTriviaPage; 