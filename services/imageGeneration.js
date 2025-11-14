import fetch from "node-fetch";

const MODEL = "black-forest-labs/FLUX.1-dev";

// MAIN IMAGE GENERATOR (Pollinations + Flux) — returns Base64
export const generateImage = async (prompt, businessName) => {
  try {
    const finalPrompt = `Professional ${businessName} marketing poster: ${prompt}`;

    // Encode prompt to avoid Pollinations error 1033
    const encodedPrompt = encodeURIComponent(finalPrompt);

    // Pollinations FLUX image URL
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=${MODEL}`;
    console.log("🌄 Generated Pollinations Image URL:", url);

    // Fetch image and convert to Base64
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Image fetch failed with status ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    return `data:image/png;base64,${base64Image}`;

  } catch (error) {
    console.error("❌ Error in generateImage:", error.message);
    throw error;
  }
};

// FALLBACK (Base64 image)
export const generateImageFallback = async () => {
  // Simple placeholder PNG
  const placeholderUrl = "https://via.placeholder.com/1024x1024.png?text=AI+Image+Unavailable";
  const response = await fetch(placeholderUrl);
  const arrayBuffer = await response.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");
  return `data:image/png;base64,${base64Image}`;
};
