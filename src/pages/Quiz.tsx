import React from 'react';
import SimpleQuizWrapper from '../components/SimpleQuizWrapper';
import { motion } from 'framer-motion';

const Quiz: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-center mb-8">Japanese Vocabulary Quiz</h1>
      <SimpleQuizWrapper />
    </motion.div>
  );
};

export default Quiz; 