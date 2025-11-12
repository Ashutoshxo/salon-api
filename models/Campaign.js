import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  businessName: { type: String, required: [true, 'Business name is required'], trim: true },
  inputType: { type: String, enum: ['text', 'voice'], required: true },
  language: { type: String, enum: ['hi', 'en', 'mr'], required: true },
  originalPrompt: { type: String, required: [true, 'Prompt is required'] },
  translatedPrompt: { type: String },
  caption: { type: String },
  hashtags: [{ type: String }],
  imageUrl: { type: String },
}, { timestamps: true });

// Index for faster queries
campaignSchema.index({ businessName: 1, createdAt: -1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign; 
