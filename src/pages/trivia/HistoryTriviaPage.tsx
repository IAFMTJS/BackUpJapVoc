import React from 'react';
import TriviaTopicPage from './TriviaTopicPage';
import { triviaTopics } from '../../data/triviaContent';

const HistoryTriviaPage: React.FC = () => {
  const historyTopic = triviaTopics.find(topic => topic.title === 'Japanese History');
  
  if (!historyTopic) {
    return null;
  }

  return <TriviaTopicPage title={historyTopic.title} content={historyTopic.content} />;
};

export default HistoryTriviaPage; 