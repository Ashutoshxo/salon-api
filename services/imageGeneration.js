import fetch from "node-fetch";

// Clean prompt function
export const cleanPromptForImage = (prompt = "") => {
  return prompt
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
};

// MAIN FUNCTION → Generate image using Pollinations
export const generateAIImage = async (prompt) => {
  try {
    const cleanedPrompt = cleanPromptForImage(prompt);

    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      cleanedPrompt
    )}`;

    const response = await fetch(pollinationsUrl);

    if (!response.ok) throw new Error("Pollinations failed");

    return pollinationsUrl; // direct image URL
  } catch (error) {
    console.log("⚠ Pollinations failed → using fallback...");
    return generateImageFallback(prompt);
  }
};

// FIXED FALLBACK — Render safe ✔
export const generateImageFallback = async () => {
  try {
    // OPTION 1 (BEST): fast, safe, no external domain
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAQAAAB0e0puAAAAA0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    // OPTION 2 (If you want URL fallback)
    // return "https://placehold.co/1024x1024/png?text=AI+Image+Unavailable";

  } catch (err) {
    console.log("Fallback error:", err);
    return null;
  }
};
