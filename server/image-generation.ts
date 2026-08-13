import { generateImage as generateManusImage } from "./_core/imageGeneration";

export interface GeneratedImageResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

function normalizeError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/** Generate an educational image through Manus' internal ImageService. */
export async function generateImage(prompt: string): Promise<GeneratedImageResult> {
  const normalizedPrompt = prompt.trim();
  if (normalizedPrompt.length < 10) {
    return { success: false, error: "Please provide a more detailed image prompt." };
  }

  try {
    const result = await generateManusImage({
      prompt: `Create a clear, exam-safe educational visual for a student studying Physics, Chemistry, or Mathematics. Avoid copyrighted logos and unrelated text. ${normalizedPrompt}`,
    });

    if (!result.url) {
      return { success: false, error: "The image service returned no image URL." };
    }

    return { success: true, imageUrl: result.url };
  } catch (error) {
    console.error("[Image Generation] Error:", error);
    return {
      success: false,
      error: normalizeError(error, "Failed to generate image"),
    };
  }
}

/** Generate several educational images while preserving per-prompt failures. */
export async function generateImageBatch(
  prompts: string[]
): Promise<GeneratedImageResult[]> {
  return Promise.all(prompts.map((prompt) => generateImage(prompt)));
}

/** Edit an existing image through Manus' image-to-image flow. */
export async function enhanceImage(
  imageUrl: string,
  enhancementPrompt: string
): Promise<GeneratedImageResult> {
  const normalizedPrompt = enhancementPrompt.trim();
  if (normalizedPrompt.length < 10) {
    return { success: false, error: "Please provide a more detailed enhancement prompt." };
  }

  try {
    const result = await generateManusImage({
      prompt: `Improve this educational study visual while preserving its subject and making labels readable. ${normalizedPrompt}`,
      originalImages: [{ url: imageUrl }],
    });

    if (!result.url) {
      return { success: false, error: "The image service returned no enhanced image URL." };
    }

    return { success: true, imageUrl: result.url };
  } catch (error) {
    console.error("[Image Enhancement] Error:", error);
    return {
      success: false,
      error: normalizeError(error, "Failed to enhance image"),
    };
  }
}
