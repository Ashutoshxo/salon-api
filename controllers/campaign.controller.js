// // controllers/campaign.controller.js
// import Campaign from '../models/Campaign.js';
// import * as speechToTextService from '../services/speechToText.js';
// import * as translationService from '../services/translation.js';
// import * as textGenerationService from '../services/textGeneration.js';
// import * as imageGenerationService from '../services/imageGeneration.js';
// import { cleanPrompt } from '../utils/helpers.js';
// import fs from 'fs';

// // Create Campaign
// export const createCampaign = async (req, res, next) => {
//   try {
//     const { businessName, inputType, language, prompt } = req.body;

//     // ✅ Validation: Check if prompt exists
//     if (!prompt || prompt.trim() === '') {
//       return res.status(400).json({
//         success: false,
//         message: 'Prompt is required for text input'
//       });
//     }

//     let originalPrompt = prompt;

//     // Step 1: Handle Voice Input
//     if (inputType === 'voice' && req.file) {
//       console.log('🎤 Processing voice input...');
//       originalPrompt = await speechToTextService.convertSpeechToText(req.file.path);

//       // Delete uploaded file after processing
//       fs.unlinkSync(req.file.path);
//     }

//     // Step 2: Translate if not English
//     let translatedPrompt = originalPrompt;
//     if (language !== 'en') {
//       try {
//         console.log('🌐 Translating prompt...');
//         translatedPrompt = await translationService.translate(originalPrompt, language);
//       } catch (err) {
//         console.error('Translation failed, using original prompt', err.message);
//         translatedPrompt = originalPrompt; // fallback
//       }
//     }

//     // Step 3: Generate Caption and Hashtags
//     let textResult;
//     try {
//       console.log('✍️ Generating caption...');
//       textResult = await textGenerationService.generateCaption(translatedPrompt, businessName);
//     } catch (err) {
//       console.error('Text Generation failed, using default', err.message);
//       textResult = {
//         caption: `Exciting new offer at ${businessName}! Book your appointment today!`,
//         hashtags: ['#SalonOffer', '#GlowUp', '#BeautyDeals']
//       };
//     }

//     // Step 4: Generate Image (FIXED)
//     let imageUrl;
//     try {
//       console.log('🎨 Generating image...');
//       const imagePrompt = `Professional salon marketing poster: ${translatedPrompt}. High quality, vibrant colors, elegant design for ${businessName}`;
//       console.log('🎨 Image prompt:', imagePrompt);
//       imageUrl = await imageGenerationService.generateImage(imagePrompt);
//     } catch (err) {
//       console.error('Image generation failed, using placeholder', err.message);
//       imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBHZW5lcmF0aW9uIEZhaWxlZDwvdGV4dD48L3N2Zz4=';
//     }

//     // Step 5: Save to Database
//     const campaign = await Campaign.create({
//       businessName,
//       inputType,
//       language,
//       originalPrompt,
//       translatedPrompt,
//       caption: textResult.caption,
//       hashtags: textResult.hashtags,
//       imageUrl
//     });

//     console.log('✅ Campaign saved successfully:', campaign._id);

//     // Response
//     res.status(201).json({
//       success: true,
//       data: {
//         id: campaign._id,
//         businessName: campaign.businessName,
//         originalPrompt: campaign.originalPrompt,
//         translatedPrompt: campaign.translatedPrompt,
//         caption: campaign.caption,
//         hashtags: campaign.hashtags,
//         imageUrl: campaign.imageUrl,
//         createdAt: campaign.createdAt
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error:', error);
//     next(error);
//   }
// };

// // Get History
// export const getHistory = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, language, startDate, endDate } = req.query;

//     // Build filter
//     const filter = {};
//     if (language) filter.language = language;
//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) filter.createdAt.$gte = new Date(startDate);
//       if (endDate) filter.createdAt.$lte = new Date(endDate);
//     }

//     // Pagination
//     const campaigns = await Campaign.find(filter)
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .select('-__v');

//     const count = await Campaign.countDocuments(filter);

//     res.json({
//       success: true,
//       data: campaigns,
//       pagination: {
//         total: count,
//         page: parseInt(page),
//         pages: Math.ceil(count / limit)
//       }
//     });

//   } catch (error) {
//     next(error);
//   }
// };

// // Retry Campaign
// export const retryCampaign = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { regenerate } = req.body; // 'caption', 'image', or 'both'

//     const campaign = await Campaign.findById(id);
//     if (!campaign) {
//       return res.status(404).json({
//         success: false,
//         message: 'Campaign not found'
//       });
//     }

//     // Regenerate based on request
//     if (regenerate === 'caption' || regenerate === 'both') {
//       console.log('✍️ Regenerating caption...');
//       const textResult = await textGenerationService.generateCaption(campaign.translatedPrompt, campaign.businessName);
//       campaign.caption = textResult.caption;
//       campaign.hashtags = textResult.hashtags;
//     }

//     if (regenerate === 'image' || regenerate === 'both') {
//       console.log('🎨 Regenerating image...');
//       const imagePrompt = `Professional salon marketing poster: ${campaign.translatedPrompt}. High quality, vibrant colors, elegant design`;
//       campaign.imageUrl = await imageGenerationService.generateImage(imagePrompt);
//     }

//     await campaign.save();

//     res.json({
//       success: true,
//       data: campaign
//     });

//   } catch (error) {
//     next(error);
//   }
// };
import Campaign from '../models/Campaign.js';
import { convertSpeechToText } from '../services/speechToText.js';
import { translateToEnglish } from '../services/translation.js';
import { generateCaption as generateCaptionAndHashtags } from '../services/textGeneration.js';
import { generateImage, generateImageFallback } from '../services/imageGeneration.js';
import { addLogoOverlay } from '../services/imageProcessor.js';

// Helper function to clean prompt
const cleanPrompt = (prompt) => {
  let cleaned = prompt.trim().replace(/\s+/g, ' ');

  const fillerWords = [
    'um', 'uh', 'like', 'you know', 'basically', 'actually',
    'matlab', 'yaar', 'hai na', 'toh', 'bas'
  ];
  const regex = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi');
  cleaned = cleaned.replace(regex, '');

  cleaned = cleaned.replace(/([!?.]){2,}/g, '$1');

  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 197) + '...';
  }

  return cleaned.replace(/\s+/g, ' ').trim();
};

// Create Campaign
export const createCampaign = async (req, res, next) => {
  try {
    const { businessName, inputType, language, prompt } = req.body;

    console.log('📝 Creating campaign:', { businessName, inputType, language });

    const audioFile = req.files?.audioFile?.[0];
    const logoFile = req.files?.logoFile?.[0];

    if (!businessName || !inputType || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: businessName, inputType, language'
      });
    }

    let processedPrompt = prompt;

    // Step 1: Voice to Text
    if (inputType === 'voice') {
      if (!audioFile) {
        return res.status(400).json({
          success: false,
          error: 'Audio file required for voice input'
        });
      }
      console.log('🎤 Processing voice input...');
      processedPrompt = await convertSpeechToText(audioFile, language);
    }

    if (!processedPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const originalPrompt = processedPrompt;

    // Step 2: Translation
    let translatedPrompt = processedPrompt;
    if (language !== 'en') {
      console.log(`🌍 Translating from ${language} to English...`);
      translatedPrompt = await translateToEnglish(processedPrompt, language);
    }

    // Step 3: Clean prompt
    console.log('🧹 Cleaning prompt...');
    const cleanedPrompt = cleanPrompt(translatedPrompt);

    // Step 4 + 5: Generate caption + image
    console.log('🤖 Generating caption and image...');

    let textResult, imageUrl;

    try {
      [textResult, imageUrl] = await Promise.all([
        generateCaptionAndHashtags(cleanedPrompt, businessName),
        generateImage(cleanedPrompt, businessName)
      ]);
    } catch (error) {
      console.log('⚠️  Parallel generation failed, trying sequentially...');

      if (!textResult) {
        textResult = await generateCaptionAndHashtags(cleanedPrompt, businessName);
      }

      try {
        imageUrl = await generateImage(cleanedPrompt, businessName);
      } catch (imageError) {
        console.log('⚠️ Primary image generation failed, using fallback...');
        imageUrl = await generateImageFallback(cleanedPrompt, businessName);
      }
    }

    // ---- FINAL CAPTION FALLBACK FIX ----
    if (!textResult || !textResult.caption || textResult.caption.trim() === "") {
      console.log("⚠️ Caption empty — using fallback caption");
      textResult = {
        caption: `Amazing offer at ${businessName}! Book your appointment today.`,
        hashtags: ["#SalonOffer", "#BeautyDeals", "#GlowUp"]
      };
    }

    let finalImageUrl = imageUrl;

    // Step 6: Add logo overlay if available
    if (logoFile && imageUrl) {
      console.log('🎨 Adding logo overlay...');
      try {
        finalImageUrl = await addLogoOverlay(imageUrl, logoFile.path);
      } catch (error) {
        console.error('❌ Logo overlay failed:', error.message);
      }
    }

    // Step 7: Save to DB
    const campaign = new Campaign({
      userId: req.user ? req.user._id : null,
      businessName,
      originalPrompt,
      translatedPrompt: cleanedPrompt,
      caption: textResult.caption,
      hashtags: textResult.hashtags,
      imageUrl: finalImageUrl,
      language,
      inputType
    });

    await campaign.save();

    console.log(`✅ Campaign created successfully: ${campaign._id}`);

    res.status(201).json({
      success: true,
      data: {
        id: campaign._id,
        businessName: campaign.businessName,
        originalPrompt: campaign.originalPrompt,
        translatedPrompt: campaign.translatedPrompt,
        caption: campaign.caption,
        hashtags: campaign.hashtags,
        imageUrl: campaign.imageUrl,
        createdAt: campaign.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Campaign creation error:', error);
    next(error);
  }
};

// Get Campaign History
export const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, language, startDate, endDate } = req.query;

    console.log('📚 Fetching campaign history...');

    const query = {};

    if (req.user) {
      query.userId = req.user._id;
    }

    if (language) {
      query.language = language;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-__v');

    const total = await Campaign.countDocuments(query);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ History fetch error:', error);
    next(error);
  }
};

// Retry Campaign Generation
export const retryCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { retryType } = req.body;

    console.log(`🔄 Retrying campaign ${id} - Type: ${retryType}`);

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    if (req.user && campaign.userId && campaign.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      });
    }

    let updates = {};

    if (retryType === 'caption' || retryType === 'both') {
      const textResult = await generateCaptionAndHashtags(
        campaign.translatedPrompt,
        campaign.businessName
      );
      updates.caption = textResult.caption;
      updates.hashtags = textResult.hashtags;
    }

    if (retryType === 'image' || retryType === 'both') {
      let imageUrl;
      try {
        imageUrl = await generateImage(campaign.translatedPrompt, campaign.businessName);
      } catch {
        imageUrl = await generateImageFallback(campaign.translatedPrompt, campaign.businessName);
      }
      updates.imageUrl = imageUrl;
    }

    Object.assign(campaign, updates);
    await campaign.save();

    res.json({
      success: true,
      data: {
        id: campaign._id,
        businessName: campaign.businessName,
        caption: campaign.caption,
        hashtags: campaign.hashtags,
        imageUrl: campaign.imageUrl,
        updatedAt: campaign.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Retry campaign error:', error);
    next(error);
  }
};
