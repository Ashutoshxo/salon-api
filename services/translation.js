// services/translation.js
import axios from 'axios';

export async function translate(text, targetLang = 'en') {
  try {
    // Skip translation if already in target language
    if (targetLang === 'en') {
      return text;
    }

    // Select model based on language
    let model = process.env.MODEL_TRANSLATION_HI; // Default Hindi
    if (targetLang === 'mr') {
      model = process.env.MODEL_TRANSLATION_MR;
    }

    const API_URL = `https://router.huggingface.co/hf-inference/models/${model}`;

    const response = await axios.post(
      API_URL,
      { inputs: text },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    if (response.data && response.data[0] && response.data[0].translation_text) {
      return response.data[0].translation_text;
    }

    return text; // Fallback to original text
  } catch (error) {
    console.error('Translation Error:', error.response?.data || error.message);
    return text; // Return original text on error
  }
}
