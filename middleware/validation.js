// middleware/validation.js

export const validateCampaign = (req, res, next) => { 
  const { businessName, inputType, language, prompt } = req.body;

  // Validation checks
  if (!businessName || businessName.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Business name is required'
    });
  }

  if (!inputType || !['text', 'voice'].includes(inputType)) {
    return res.status(400).json({
      success: false,
      message: 'Input type must be either "text" or "voice"'
    });
  }

  if (!language || !['hi', 'en', 'mr'].includes(language)) {
    return res.status(400).json({
      success: false,
      message: 'Language must be "hi", "en", or "mr"'
    });
  }

  if (inputType === 'text' && (!prompt || prompt.trim() === '')) {
    return res.status(400).json({
      success: false,
      message: 'Prompt is required for text input'
    });
  }

  if (inputType === 'voice' && !req.file) {
    return res.status(400).json({
      success: false,
      message: 'Voice file is required for voice input'
    });
  }

  next();
};
