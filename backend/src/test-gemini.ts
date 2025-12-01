import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testConnection() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log("🔑 Testing API Key:", apiKey ? "Loaded (Starts with " + apiKey.substring(0, 8) + "...)" : "❌ MISSING");
  
  if (!apiKey) {
      console.error("Please check your .env file.");
      return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // 1. Try to use the most standard model first
  const modelName = "gemini-1.5-flash"; 
  console.log(`\n📡 Attempting to connect to model: ${modelName}...`);

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Reply with 'Connected' if you see this.");
    console.log("✅ SUCCESS! The API is working.");
    console.log("🤖 AI Response:", result.response.text());
  } catch (error: any) {
    console.error("\n❌ CONNECTION FAILED");
    console.error("Error Message:", error.message);
    
    if (error.message.includes("404")) {
        console.log("\n💡 DIAGNOSIS: The API Key is valid, but it cannot access the model.");
        console.log("👉 ACTION: Create a NEW API Key in a NEW Project at https://aistudio.google.com/app/apikey");
    } else if (error.message.includes("API_KEY_INVALID")) {
        console.log("\n💡 DIAGNOSIS: The API Key is copied incorrectly.");
    }
  }
}

testConnection();