import React from 'react';
import TriviaTopicPage from './TriviaTopicPage';
import { triviaTopics } from '../../data/triviaContent';

const CuisineTriviaPage: React.FC = () => {
  const cuisineTopic = triviaTopics.find(topic => topic.title === 'Japanese Cuisine');
  
  if (!cuisineTopic) {
    return null;
  }

  return <TriviaTopicPage title={cuisineTopic.title} content={cuisineTopic.content} />;
};

export default CuisineTriviaPage; 