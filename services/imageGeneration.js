import axios from 'axios';

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

export const generateImage = async (prompt) => {
  try {
    // ✅ Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      console.error('❌ Invalid prompt received:', prompt);
      throw new Error('Valid prompt is required');
    }

    console.log('🎨 Generating image with prompt:', prompt.substring(0, 100) + '...');

    const response = await axios.post(
  `https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell`,
  { 
    inputs: prompt,
    parameters: {
      guidance_scale: 3.5,
      num_inference_steps: 4
    }
  },
  {
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    responseType: 'arraybuffer',
    timeout: 30000
  }
);

    // ✅ Convert buffer to base64
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    console.log('✅ Image generated successfully');
    return imageUrl;

  } catch (error) {
    console.error('❌ Image generation error:', error.response?.data || error.message);
    
    // ✅ Return a placeholder image
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBDb3VsZG4ndCBHZW5lcmF0ZTwvdGV4dD48L3N2Zz4=';
  }
};