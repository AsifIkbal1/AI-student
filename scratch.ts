import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openaiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL;

console.log("Key:", openaiKey);
console.log("Base:", baseURL);

const openai = new OpenAI({
    apiKey: openaiKey,
    baseURL: baseURL,
});

async function main() {
    try {
        console.log("Attempting chat completion...");
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a test assistant." },
                { role: "user", content: "hi" }
            ]
        }, { timeout: 10000 }); // Add 10s timeout just to see
        
        console.log("Response:", response.choices[0].message.content);
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
