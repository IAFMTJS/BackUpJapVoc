import React from 'react';
import TriviaTopicPage from './TriviaTopicPage';
import { triviaTopics } from '../../data/triviaContent';

const MythologyTriviaPage: React.FC = () => {
  const mythologyTopic = triviaTopics.find(topic => topic.title === 'Japanese Mythology');
  
  if (!mythologyTopic) {
    return null;
  }

  return <TriviaTopicPage title={mythologyTopic.title} content={mythologyTopic.content} />;
};

export default MythologyTriviaPage; 