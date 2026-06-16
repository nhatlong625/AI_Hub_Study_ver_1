export const tutorModes = [
  { id: 'guided', title: 'Guided Tutor', description: 'Step-by-step explanations with checkpoints.' },
  { id: 'quiz', title: 'Quiz Coach', description: 'Fast drills with instant feedback.' },
  { id: 'summary', title: 'Summary Maker', description: 'Turn documents into revision notes.' },
];

export const chatThreads = [
  { id: 'thread-01', title: 'Linear Algebra Help', topic: 'Vectors and matrices', updatedAt: '10 min ago' },
  { id: 'thread-02', title: 'Biology Quiz Review', topic: 'Cell transport', updatedAt: '1 hour ago' },
  { id: 'thread-03', title: 'Essay Outline Draft', topic: 'Economic policy', updatedAt: 'Yesterday' },
];

export const chatMessages = [
  {
    id: 1,
    sender: 'ai',
    text: 'Hi Lena, I reviewed your uploaded notes. Would you like a summary, a quiz, or a concept walkthrough?',
    time: '09:15',
  },
  {
    id: 2,
    sender: 'user',
    text: 'Can you explain backpropagation in a simpler way and then give me 3 questions?',
    time: '09:16',
  },
  {
    id: 3,
    sender: 'ai',
    text: 'Absolutely. Think of backpropagation as a way for the model to trace each mistake backward, figure out which weights contributed, and adjust them gradually.',
    time: '09:16',
  },
  {
    id: 4,
    sender: 'ai',
    text: 'After the walkthrough, I can generate short practice questions with increasing difficulty.',
    time: '09:17',
  },
];
