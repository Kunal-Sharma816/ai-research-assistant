import dotenv from "dotenv";
dotenv.config();

import { 
  GoogleGenerativeAI, 
  HarmCategory, 
  HarmBlockThreshold 
} from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// CHANGED: Using the modern model from your list: "gemini-2.5-flash"
export const getGeminiModel = (modelName: string = "gemini-2.5-flash") => {
  
  // Safety: If an old experimental name is passed, force it to the working model
  if (modelName.includes('1.5') || modelName.includes('exp')) {
      console.warn(`⚠️ Legacy model '${modelName}' requested. Auto-switching to gemini-2.5-flash`);
      modelName = "gemini-2.5-flash";
  }

  console.log(`📡 Connecting to Gemini Model: ${modelName}`);

  return genAI.getGenerativeModel({ 
    model: modelName,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  });
};