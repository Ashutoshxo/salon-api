// controllers/campaign.controller.js
import Campaign from '../models/Campaign.js';
import * as speechToTextService from '../services/speechToText.js';
import * as translationService from '../services/translation.js';
import * as textGenerationService from '../services/textGeneration.js';
import * as imageGenerationService from '../services/imageGeneration.js';
import { cleanPrompt } from '../utils/helpers.js';
import fs from 'fs';

// Create Campaign
export const createCampaign = async (req, res, next) => {
  try {
    const { businessName, inputType, language, prompt } = req.body;

    // ✅ Validation: Check if prompt exists
    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required for text input'
      });
    }

    let originalPrompt = prompt;

    // Step 1: Handle Voice Input
    if (inputType === 'voice' && req.file) {
      console.log('🎤 Processing voice input...');
      originalPrompt = await speechToTextService.convertSpeechToText(req.file.path);

      // Delete uploaded file after processing
      fs.unlinkSync(req.file.path);
    }

    // Step 2: Translate if not English
    let translatedPrompt = originalPrompt;
    if (language !== 'en') {
      try {
        console.log('🌐 Translating prompt...');
        translatedPrompt = await translationService.translate(originalPrompt, language);
      } catch (err) {
        console.error('Translation failed, using original prompt', err.message);
        translatedPrompt = originalPrompt; // fallback
      }
    }

    // Step 3: Generate Caption and Hashtags
    let textResult;
    try {
      console.log('✍️ Generating caption...');
      textResult = await textGenerationService.generateCaption(translatedPrompt, businessName);
    } catch (err) {
      console.error('Text Generation failed, using default', err.message);
      textResult = {
        caption: `Exciting new offer at ${businessName}! Book your appointment today!`,
        hashtags: ['#SalonOffer', '#GlowUp', '#BeautyDeals']
      };
    }

    // Step 4: Generate Image (FIXED)
    let imageUrl;
    try {
      console.log('🎨 Generating image...');
      const imagePrompt = `Professional salon marketing poster: ${translatedPrompt}. High quality, vibrant colors, elegant design for ${businessName}`;
      console.log('🎨 Image prompt:', imagePrompt);
      imageUrl = await imageGenerationService.generateImage(imagePrompt);
    } catch (err) {
      console.error('Image generation failed, using placeholder', err.message);
      imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBHZW5lcmF0aW9uIEZhaWxlZDwvdGV4dD48L3N2Zz4=';
    }

    // Step 5: Save to Database
    const campaign = await Campaign.create({
      businessName,
      inputType,
      language,
      originalPrompt,
      translatedPrompt,
      caption: textResult.caption,
      hashtags: textResult.hashtags,
      imageUrl
    });

    console.log('✅ Campaign saved successfully:', campaign._id);

    // Response
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
    console.error('❌ Error:', error);
    next(error);
  }
};

// Get History
export const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, language, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (language) filter.language = language;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const count = await Campaign.countDocuments(filter);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

// Retry Campaign
export const retryCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { regenerate } = req.body; // 'caption', 'image', or 'both'

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Regenerate based on request
    if (regenerate === 'caption' || regenerate === 'both') {
      console.log('✍️ Regenerating caption...');
      const textResult = await textGenerationService.generateCaption(campaign.translatedPrompt, campaign.businessName);
      campaign.caption = textResult.caption;
      campaign.hashtags = textResult.hashtags;
    }

    if (regenerate === 'image' || regenerate === 'both') {
      console.log('🎨 Regenerating image...');
      const imagePrompt = `Professional salon marketing poster: ${campaign.translatedPrompt}. High quality, vibrant colors, elegant design`;
      campaign.imageUrl = await imageGenerationService.generateImage(imagePrompt);
    }

    await campaign.save();

    res.json({
      success: true,
      data: campaign
    });

  } catch (error) {
    next(error);
  }
};