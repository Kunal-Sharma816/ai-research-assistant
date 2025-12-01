import dotenv from "dotenv";
dotenv.config();

// We use the raw API to bypass library errors and see the truth
const checkModels = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return console.error("❌ No API Key in .env");

  console.log("🔍 Asking Google for available models...");
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error("❌ API ERROR:", data.error.message);
      return;
    }

    console.log("\n✅ SUCCESS! Here are the models your key can access:");
    
    // Filter for models that support "generateContent"
    const validModels = (data.models || [])
      .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: any) => m.name.replace("models/", ""));

    if (validModels.length === 0) {
      console.log("⚠️ No generation models found. Your Key might be for the wrong service.");
    } else {
      validModels.forEach((name: string) => console.log(`   👉 "${name}"`));
    }
    
  } catch (err) {
    console.error("Network Error:", err);
  }
};

checkModels();