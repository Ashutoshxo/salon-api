import Campaign from "../models/Campaign.js";
import { generateImage } from "../services/imageGeneration.js";

// Simple caption generator
function generateCaption(businessName, text) {
  return `${businessName}: ${text}`;
}

// Simple hashtag generator
function generateHashtags() {
  return ["#salon", "#beauty", "#offer"];
}

// CREATE CAMPAIGN
export const createCampaign = async (req, res) => {
  try {
    const {
      businessName,
      inputType,
      textInput,
      language = "en",
    } = req.body;

    console.log("📝 Creating campaign:", {
      businessName,
      inputType,
      language,
    });

    if (!businessName) {
      return res.status(400).json({
        success: false,
        message: "Business name is required"
      });
    }

    if (inputType === "text" && !textInput) {
      return res.status(400).json({
        success: false,
        message: "Text input is required"
      });
    }

    // Build prompts
    const originalPrompt = textInput || "";
    const translatedPrompt = originalPrompt; // no translation used now

    // Generate image prompt
    const prompt = `Professional ${businessName} marketing poster: ${originalPrompt}`;

    // Generate AI image
    console.log("🤖 Generating image...");
    const imageUrl = await generateImage(prompt);

    // Generate caption + hashtags
    const caption = generateCaption(businessName, originalPrompt);
    const hashtags = generateHashtags();

    // Save to DB
    const campaign = await Campaign.create({
      businessName,
      inputType,
      textInput,
      language,
      originalPrompt,
      translatedPrompt,
      caption,
      hashtags,
      imageUrl
    });

    console.log("✅ Campaign created:", campaign._id);

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      campaign,
    });

  } catch (error) {
    console.error("❌ Error creating campaign:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create campaign",
      error: error.message,
    });
  }
};


// GET CAMPAIGN HISTORY
export const getHistory = async (req, res) => {
  try {
    const history = await Campaign.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch history",
    });
  }
};


// RETRY CAMPAIGN
export const retryCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    console.log("🔄 Retrying campaign:", campaign._id);

    const newImageUrl = await generateImage(
      `Professional ${campaign.businessName} marketing poster: ${campaign.originalPrompt}`
    );

    campaign.imageUrl = newImageUrl;
    await campaign.save();

    return res.status(200).json({
      success: true,
      campaign,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retry campaign",
    });
  }
};
