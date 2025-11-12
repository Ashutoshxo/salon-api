import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const HUGGINGFACE_API = 'https://router.huggingface.co/hf-inference/models';

export async function convertSpeechToText(audioPath) {
  try {
    const model = process.env.MODEL_SPEECH_TO_TEXT;

    // Read audio file
    const audioData = fs.readFileSync(audioPath);

    const response = await axios.post(
      `${HUGGINGFACE_API}/${model}`,
      audioData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'audio/wav'
        },
        timeout: 60000 // 60 seconds
      }
    );

    return response.data.text || response.data;

  } catch (error) {
    console.error('Speech-to-Text Error:', error.response?.data || error.message);
    throw new Error('Failed to convert speech to text');
  }
}
