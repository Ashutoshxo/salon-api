import Campaign from "../models/campaign.model.js";
import { generateImage } from "../services/imageGeneration.js";

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

    let prompt = "";

    if (inputType === "text") {
      if (!textInput) {
        return res.status(400).json({
          success: false,
          message: "Text input is required"
        });
      }

      prompt = `Professional ${businessName} marketing poster: ${textInput}`;
    } else {
      prompt = `Professional ${businessName} marketing poster`;
    }

    // Generate AI Image
    console.log("🤖 Generating caption and image...");
    const imageUrl = await generateImage(prompt);

    console.log("🌄 Generated Image URL:", imageUrl);

    // Save to database
    const campaign = await Campaign.create({
      businessName,
      inputType,
      textInput,
      language,
      imageUrl,
    });

    console.log("✅ Campaign created successfully:", campaign._id);

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      campaign,
    });

  } catch (error) {
    console.error("❌ Error creating campaign:", error.message);

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


// RETRY CAMPAIGN (regenerate image)
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
      `Professional ${campaign.businessName} marketing poster: ${campaign.textInput || ""}`
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
