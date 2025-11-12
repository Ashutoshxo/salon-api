🎨 Salon Campaign API

AI-powered marketing campaign creator for salon and spa businesses.

🚀 Features

Voice & Text Input: Accept campaign ideas via voice or text

Multi-language Support: Hindi, Marathi, English

AI Caption Generation: Creative marketing copy with hashtags

AI Image Generation: Professional campaign posters

Campaign History: Track all created campaigns

Retry Feature: Regenerate captions or images

🛠️ Tech Stack

Backend: Node.js + Express

Database: MongoDB Atlas

AI Models: Hugging Face (Whisper, Llama 2, Stable Diffusion)

📦 Installation
1. Clone & Install
cd salon-campaign-api
npm install

2. Environment Setup

Create .env file with your credentials:

MONGODB_URI=your_mongodb_connection_string
HUGGINGFACE_API_KEY=your_huggingface_token

3. Create uploads folder
mkdir uploads

4. Run Server
# Development
npm run dev

# Production
npm start


Server will run on: http://localhost:3000

📡 API Endpoints
1. Create Campaign

POST /api/create-campaign

For Text Input:

{
  "businessName": "Glow Studio",
  "inputType": "text",
  "language": "hi",
  "prompt": "Diwali ke liye ek festive offer poster banao jisme 20% discount ho"
}


For Voice Input:

Use multipart/form-data

Field: voiceFile (audio file)

Fields: businessName, inputType (voice), language

Response:

{
  "success": true,
  "data": {
    "businessName": "Glow Studio",
    "originalPrompt": "Diwali ke liye...",
    "translatedPrompt": "Create a festive Diwali poster...",
    "caption": "✨ Celebrate Diwali with a glowing new look!...",
    "hashtags": ["#DiwaliGlow", "#SalonOffer"],
    "imageUrl": "data:image/png;base64,...",
    "createdAt": "2025-11-03T10:00:00Z"
  }
}

2. Get History

GET /api/history?page=1&limit=10&language=hi

Query Parameters:

page (optional): Page number

limit (optional): Items per page

language (optional): Filter by language

startDate (optional): Filter by date

endDate (optional): Filter by date

3. Retry Campaign

POST /api/retry/:id

{
  "regenerate": "caption" | "image" | "both"
}

🧪 Testing with Postman
Text Input Example:
POST http://localhost:3000/api/create-campaign
Content-Type: application/json

{
  "businessName": "Salon",
  "inputType": "text",
  "language": "en",
  "prompt": "Create a Christmas special offer with 30% discount"
}

Voice Input Example:
POST http://localhost:3000/api/create-campaign
Content-Type: multipart/form-data

voiceFile: [select audio file]
businessName: Salon
inputType: voice
language: hi

🔑 Getting API Keys
MongoDB Atlas:

Go to MongoDB Atlas

Create FREE account

Create cluster (M0 FREE tier)

Get connection string

Hugging Face:

Go to Hugging Face

Sign up

Settings → Access Tokens

Create Read token

📁 Project Structure
salon-campaign-api/
├── config/           # Database configuration
├── models/           # MongoDB schemas
├── routes/           # API routes
├── controllers/      # Business logic
├── services/         # AI service integrations
├── middleware/       # Error handling & validation
├── utils/            # Helper functions
└── uploads/          # Temporary voice files

🐛 Troubleshooting

MongoDB Connection Error:

Check MONGODB_URI in .env

Verify network access (0.0.0.0/0)

Check username/password

Hugging Face API Error:

Verify API token

Check model names in .env

Wait if model is loading (first request takes time)

Image Generation Slow:

Stable Diffusion takes 30-60 seconds

This is normal for first request

Subsequent requests are faster

📝 Notes

Voice files are automatically deleted after processing

Images are returned as base64 data URLs

Free tier has reasonable rate limits

Models may take time to load on first request

🎯 Assignment Submission Checklist

✅ All 3 API endpoints working

✅ MongoDB integration complete

✅ Voice input processing

✅ Multi-language translation

✅ AI caption generation

✅ AI image generation

✅ Error handling implemented

✅ Input validation

✅ Campaign history with pagination

✅ Retry feature working

✅ Clean, commented code

✅ README documentation

✅ .env.example provided
✅ SETUP COMPLETE!
Next Steps:

Copy all files to your project folder

Run: npm install

Create uploads folder: mkdir uploads

Start server: npm start

Test with Postman

API will be ready at: http://localhost:3000 🚀