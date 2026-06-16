export const practiceTests = [
  {
    id: 'quiz-ml-01',
    title: 'Neural Networks Midterm Drill',
    course: 'Machine Learning Foundations',
    questions: 6,
    difficulty: 'Intermediate',
    score: 92,
    duration: '25 min',
    status: 'Completed',
    updatedAt: 'Completed 2 days ago',
  },
  {
    id: 'quiz-ui-02',
    title: 'Design Tokens Challenge',
    course: 'UI Systems for Product Teams',
    questions: 6,
    difficulty: 'Beginner',
    score: 84,
    duration: '15 min',
    status: 'Ready',
    updatedAt: 'Generated 4 hours ago',
  },
  {
    id: 'quiz-bio-03',
    title: 'Cell Transport Quick Check',
    course: 'General Biology',
    questions: 6,
    difficulty: 'Beginner',
    score: null,
    duration: '10 min',
    status: 'Draft',
    updatedAt: 'Edited yesterday',
  },
  {
    id: 'quiz-db-04',
    title: 'Relational Database Review',
    course: 'Database Systems',
    questions: 6,
    difficulty: 'Advanced',
    score: null,
    duration: '20 min',
    status: 'Ready',
    updatedAt: 'Generated today',
  },
];

export const quizSources = [
  { id: 'ml', name: 'Machine Learning Foundations', documents: 12 },
  { id: 'ui', name: 'UI Systems for Product Teams', documents: 8 },
  { id: 'bio', name: 'General Biology', documents: 16 },
  { id: 'db', name: 'Database Systems', documents: 10 },
];

export const quizQuestions = [
  {
    id: 1,
    question: 'Which statement best describes gradient descent?',
    options: [
      'A method for increasing model complexity.',
      'A process for reducing error by updating weights step by step.',
      'A way to store training data efficiently.',
      'A metric used to rank model outputs.',
    ],
    answer: 1,
    explanation: 'Gradient descent adjusts model weights in the direction that reduces the loss function.',
  },
  {
    id: 2,
    question: 'What is the main goal of an activation function?',
    options: [
      'To normalize every dataset.',
      'To add non-linearity so a network can learn complex patterns.',
      'To compress large files before training.',
      'To remove bias terms automatically.',
    ],
    answer: 1,
    explanation: 'Activation functions introduce non-linearity, allowing neural networks to model complex relationships.',
  },
  {
    id: 3,
    question: 'Which dataset is used to update a model during training?',
    options: [
      'The training set.',
      'The test set.',
      'The production set.',
      'The archive set.',
    ],
    answer: 0,
    explanation: 'The training set is the data used by the optimization process to update model parameters.',
  },
  {
    id: 4,
    question: 'What does overfitting usually indicate?',
    options: [
      'The model performs equally well on all data.',
      'The model has too few parameters to learn.',
      'The model memorizes training patterns but generalizes poorly.',
      'The learning rate is always zero.',
    ],
    answer: 2,
    explanation: 'An overfit model performs strongly on training data but poorly on unseen data.',
  },
  {
    id: 5,
    question: 'Which technique can help reduce overfitting?',
    options: [
      'Removing the validation set.',
      'Regularization.',
      'Increasing every weight.',
      'Training on fewer examples.',
    ],
    answer: 1,
    explanation: 'Regularization discourages overly complex models and can improve generalization.',
  },
  {
    id: 6,
    question: 'What is the purpose of a validation set?',
    options: [
      'To replace all training data.',
      'To tune choices and estimate performance during development.',
      'To store model weights.',
      'To guarantee a perfect final score.',
    ],
    answer: 1,
    explanation: 'Validation data helps tune hyperparameters and compare models before final testing.',
  },
];

export const quizResult = {
  score: 83,
  correct: 5,
  wrong: 1,
  timeSpent: '12 min',
  percentile: 'Top 18%',
  strengths: ['Model evaluation', 'Activation functions', 'Training workflow'],
  focusAreas: ['Regularization tradeoffs', 'Learning rate tuning'],
};

export function getPracticeTest(quizId) {
  return practiceTests.find((test) => test.id === quizId) || practiceTests[0];
}
