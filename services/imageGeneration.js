import fetch from "node-fetch";

// Clean prompt function
export const cleanPromptForImage = (prompt = "") => {
  return prompt
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
};

// MAIN FUNCTION — Generate real image
export const generateImage = async (prompt) => {
  try {
    const cleanedPrompt = cleanPromptForImage(prompt);

    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      cleanedPrompt
    )}?width=1024&height=1024&model=black-forest-labs/FLUX.1-dev`;

    const response = await fetch(pollinationsUrl);

    if (!response.ok) throw new Error("Pollinations failed");

    return pollinationsUrl; // direct image output
  } catch (error) {
    console.log("⚠ Pollinations failed → using fallback...");
    return generateImageFallback(prompt);
  }
};

// FALLBACK (SAFE, NO RENDER DNS ISSUE)
export const generateImageFallback = async () => {
  try {
    // SAFE BASE64 (always works)
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAQAAAB0e0puAAAAA0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    // If you want URL fallback instead:
    // return "https://placehold.co/1024x1024/png?text=AI+Image+Unavailable";
  } catch (err) {
    console.log("Fallback error:", err);
    return null;
  }
};
