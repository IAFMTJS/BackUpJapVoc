import React from 'react';
import TriviaTopicPage from './TriviaTopicPage';
import { triviaTopics } from '../../data/triviaContent';

const ShintoTriviaPage: React.FC = () => {
  const shintoTopic = triviaTopics.find(topic => topic.title === 'Shintoism');
  
  if (!shintoTopic) {
    return null;
  }

  return <TriviaTopicPage title={shintoTopic.title} content={shintoTopic.content} />;
};

export default ShintoTriviaPage; 