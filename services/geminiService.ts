import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

const extractTextFromUrl = async (url: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("Gemini API Key is not provided. Please enter your API key in the application settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `Please extract the main textual content from the website at the following URL: ${url}. 
    Return only the extracted text. Avoid any of your own commentary, summarization, or conversational filler.
    If the website contains primarily code or non-prose content, try to extract meaningful textual descriptions or comments if available.
    If the URL leads to an error page or content cannot be accessed, indicate that clearly in your response (e.g., "Could not access content at URL." or "The URL led to an error page.").`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    const text = response.text;

    if (!text || text.trim() === "") {
      // Check if the model indicated an error it might have caught.
      const lowerText = text.toLowerCase();
      if (lowerText.includes("could not access") || lowerText.includes("error page")) {
        return text; // Return the model's specific error message.
      }
      return "No significant textual content could be extracted by the AI from this URL, or the page was empty.";
    }
    return text;

  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    if (error.message) {
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid')) {
          throw new Error("The provided Gemini API key is invalid. Please verify it and try again.");
      }
      if (error.message.toLowerCase().includes('quota')) {
          throw new Error("Gemini API quota exceeded. Please check your quota with Google or try again later.");
      }
      if (error.message.includes('fetch') && error.message.includes('ENOTFOUND')) {
           throw new Error(`Failed to fetch the URL. The domain name might be incorrect or the server unreachable from Gemini's perspective.`);
      }
      // More generic error for other cases
      throw new Error(`AI service failed to process the URL. Details: ${error.message}`);
    }
    // Fallback generic error
    throw new Error('AI service failed to process the URL due to an unknown error.');
  }
};

export const geminiService = {
  extractTextFromUrl,
};