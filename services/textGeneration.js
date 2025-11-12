// services/textGeneration.js
import Groq from "groq-sdk";

const groq = new Groq();
const GROQ_MODEL = process.env.MODEL_TEXT_GEN; // should be groq/salon-marketing-gen

/**
 * Generate a caption and hashtags for a salon/spa campaign prompt
 * @param {string} prompt - The campaign idea or prompt
 * @param {string} businessName - Optional business name to include in caption
 * @returns {Object} { caption: string, hashtags: Array<string> }
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

    // Call Groq Chat Completion API
    const completion = await groq.chat.completions.create({
      messages,
      model: GROQ_MODEL, // <-- make sure env variable is used
      temperature: 0.7,
      max_completion_tokens: 150,
      top_p: 0.9
    });

    const text = completion.choices[0]?.message?.content || "";

    // Parse caption and hashtags
    const parsed = parseCaptionAndHashtags(text);
    return parsed;

  } catch (error) {
    console.error("Groq Text Generation failed:", error.response?.data || error.message);

    // Fallback in case of error
    return {
      caption: `Exciting new offer at ${businessName}! Book your appointment today!`,
      hashtags: ["#SalonOffer", "#BeautyDeals", "#GlowUp"]
    };
  }
}

/**
 * Parses Groq response text into caption + hashtags
 * @param {string} text
 * @returns {Object} { caption: string, hashtags: Array<string> }
 */
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

export default {
  generateCaption
};
