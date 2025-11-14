// services/textGeneration.js
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // ADD THIS
const GROQ_MODEL = process.env.MODEL_TEXT_GEN || "llama-3.3-70b-versatile";


/**
 * Generate a caption and hashtags for a salon/spa campaign prompt
 */
export async function generateCaption(prompt, businessName = "") {
  try {
    const messages = [
      {
        role: "system",
        content: "You are a creative marketing copywriter for salons and spas. " +
                 "Create a short, catchy caption (2-3 sentences) and 3-5 relevant hashtags. " +
                 "Format as: CAPTION: ... HASHTAGS: #tag1 #tag2"
      },
      {
        role: "user",
        content: `${prompt} ${businessName ? `for ${businessName}` : ""}`
      }
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: GROQ_MODEL,
      temperature: 0.7,
      max_completion_tokens: 150,
      top_p: 0.9
    });

    const text = completion.choices[0]?.message?.content || "";
    const parsed = parseCaptionAndHashtags(text);
    return parsed;

  } catch (error) {
    console.error("❌ Groq Text Generation failed:", error.response?.data || error.message);

    return {
      caption: `Exciting new offer at ${businessName}! Book your appointment today!`,
      hashtags: ["#SalonOffer", "#BeautyDeals", "#GlowUp"]
    };
  }
}

function parseCaptionAndHashtags(text) {
  const captionMatch = text.match(/CAPTION:\s*(.+?)(?=HASHTAGS:|$)/s);
  const hashtagsMatch = text.match(/HASHTAGS:\s*(.+)$/s);

  const caption = captionMatch ? captionMatch[1].trim() : text.substring(0, 200);
  const hashtagsText = hashtagsMatch ? hashtagsMatch[1].trim() : "";

  let hashtags = hashtagsText
    .split(/\s+/)
    .filter(tag => tag.startsWith("#"))
    .slice(0, 5);

  if (hashtags.length === 0) {
    hashtags = ["#SalonOffer", "#BeautyDeals", "#GlowUp"];
  }

  return { caption, hashtags };
}

// IMPORTANT: Export for campaign controller
export const generateCaptionAndHashtags = generateCaption;

export default {
  generateCaption
};