export const practiceTests = [
  {
    id: 'quiz-ml-01',
    title: 'Neural Networks Midterm Drill',
    course: 'Machine Learning Foundations',
    questions: 20,
    difficulty: 'Intermediate',
    score: 92,
    duration: '25 min',
    status: 'Completed',
  },
  {
    id: 'quiz-ui-02',
    title: 'Design Tokens Challenge',
    course: 'UI Systems for Product Teams',
    questions: 12,
    difficulty: 'Beginner',
    score: 84,
    duration: '15 min',
    status: 'Ready',
  },
  {
    id: 'quiz-bio-03',
    title: 'Cell Transport Quick Check',
    course: 'General Biology',
    questions: 10,
    difficulty: 'Beginner',
    score: null,
    duration: '10 min',
    status: 'Draft',
  },
];

export const quizQuestions = [
  {
    id: 1,
    question: 'Which statement best describes gradient descent?',
    options: [
      'A method for increasing model complexity.',
      'A process for reducing error by updating weights step by step.',
      'A way to store training data efficiently.',
      'A metric used to rank model outputs.'
    ],
    answer: 1,
  },
  {
    id: 2,
    question: 'What is the main goal of an activation function?',
    options: [
      'To normalize every dataset.',
      'To add non-linearity so a network can learn complex patterns.',
      'To compress large files before training.',
      'To remove bias terms automatically.'
    ],
    answer: 1,
  },
];

export const quizResult = {
  score: 92,
  correct: 18,
  wrong: 2,
  timeSpent: '21 min',
  percentile: 'Top 9%',
  strengths: ['Loss functions', 'Activation choices', 'Model evaluation'],
  focusAreas: ['Learning rate tuning', 'Regularization tradeoffs'],
};
