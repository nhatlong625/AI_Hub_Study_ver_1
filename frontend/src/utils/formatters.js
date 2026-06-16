export const formatPercentage = (value) => value + '%';

export const titleCase = (value = '') =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
