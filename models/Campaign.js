// import mongoose from 'mongoose';

// const campaignSchema = new mongoose.Schema({
//   businessName: { type: String, required: [true, 'Business name is required'], trim: true },
//   inputType: { type: String, enum: ['text', 'voice'], required: true },
//   language: { type: String, enum: ['hi', 'en', 'mr'], required: true },
//   originalPrompt: { type: String, required: [true, 'Prompt is required'] },
//   translatedPrompt: { type: String },
//   caption: { type: String },
//   hashtags: [{ type: String }],
//   imageUrl: { type: String },
// }, { timestamps: true });

// // Index for faster queries
// campaignSchema.index({ businessName: 1, createdAt: -1 });

// const Campaign = mongoose.model('Campaign', campaignSchema);
import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  originalPrompt: {
    type: String,
    default: ""
  },
  translatedPrompt: {
    type: String,
    default: ""
  },
  caption: {
    type: String,
    default: ""
  },
  hashtags: {
    type: [String],
    default: []
  },
  imageUrl: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'mr'],
    default: 'en'
  },
  inputType: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text'
  }
}, {
  timestamps: true
});

campaignSchema.index({ userId: 1, createdAt: -1 });
campaignSchema.index({ language: 1 });

export default mongoose.model('Campaign', campaignSchema);
