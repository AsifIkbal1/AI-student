import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
  try {
    const genAI = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY.trim()
    });
    
    console.log("Checking models for Key:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");
    
    const response = await genAI.models.list();
    const models = response.models || [];
    console.log("Available models:");
    models.forEach(m => {
      console.log(`- ${m.name}`);
    });
  } catch (error) {
    console.error("Failed to list models:", error.message);
    if (error.response) {
      console.error("Response data:", JSON.stringify(error.response, null, 2));
    }
  }
}

listModels();
