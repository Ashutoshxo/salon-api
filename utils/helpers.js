// utils/helpers.js

export function cleanPrompt(text) {
  if (!text) return '';
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Remove common filler words (Hindi + English)
  const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'toh', 'matlab'];
  fillerWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    text = text.replace(regex, '');
  });

  // Remove extra whitespace again
  return text.replace(/\s+/g, ' ').trim();
}

export function formatDate(date) {
  return new Date(date).toISOString();
}
