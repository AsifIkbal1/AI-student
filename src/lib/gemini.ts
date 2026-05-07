import { GoogleGenAI, Type } from "@google/genai";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing from environment variables. AI features will not work.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_KEY" });

function checkApiKey() {
  if (!apiKey || apiKey === "MISSING_KEY") {
    throw new Error("AI Service Unavailable. The system's API configuration is incomplete. Please notify the administrator.");
  }
}

export const MODELS = {
  FLASH: "gemini-3-flash-preview",
  PRO: "gemini-3.1-pro-preview",
  IMAGE: "gemini-2.5-flash-image",
};

export async function generateQuiz(topic: string, difficulty: string = "Medium", questionCount: number = 5) {
  checkApiKey();
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Generate a ${questionCount}-question quiz on the topic: ${topic} with difficulty: ${difficulty}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["question", "options", "correctAnswer", "explanation"],
            },
          },
        },
        required: ["topic", "questions"],
      },
      systemInstruction: "You are an AI Quiz Generator. Generate a structured quiz in JSON format. Ensure questions are accurate and options are distinct. Provide clear explanations for each correct answer.",
    },
  });
  return { data: JSON.parse(response.text), usage: response.usageMetadata };
}

export function handleAIError(error: any) {
  console.error("AI Tool Error Details:", error);
  const message = error?.message || String(error);
  const status = error?.status || (typeof error?.message === 'string' && error.message.includes('401') ? 401 : 
                  error.message?.includes('429') ? 429 : 
                  error.message?.includes('404') ? 404 : 
                  error.message?.includes('500') ? 500 : null);
  
  if (status === 401 || message.includes("API_KEY_INVALID") || message.includes("invalid api key")) {
    return "Error: AI Authentication Failed. There is an issue with the system's API configuration. Please notify the administrator.";
  }
  
  if (status === 429 || message.includes("quota") || message.includes("rate limit")) {
    return "Error: AI Quota exceeded. You've reached the free tier limit or are sending requests too fast. Please wait a minute and try again.";
  }
  
  if (status === 404 || message.includes("model not found")) {
    return "Error: The AI model is currently unavailable or the model name is incorrect. Please contact support.";
  }
  
  if (status === 500 || status === 503 || message.includes("server error")) {
    return `Error: The AI server is experiencing issues. Details: ${message}`;
  }
  
  if (message.toLowerCase().includes("safety") || message.toLowerCase().includes("blocked") || message.toLowerCase().includes("candidate")) {
    return "Error: Your request was blocked by AI safety filters. This usually happens if the content is flagged as sensitive or inappropriate. Please try rephrasing your request.";
  }

  if (message.includes("GEMINI_API_KEY is missing")) {
    return "Error: AI Service Unavailable. The system's API configuration is incomplete. Please notify the administrator.";
  }
  
  return "Error: An unexpected error occurred while connecting to the AI. Please check your internet connection and try again.";
}

export async function logUsage(uid: string, tool: string, usage: any) {
  try {
    await addDoc(collection(db, "usageLogs"), {
      uid,
      tool,
      promptTokens: usage?.promptTokenCount || 0,
      candidatesTokens: usage?.candidatesTokenCount || 0,
      totalTokens: usage?.totalTokenCount || 0,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging usage:", error);
  }
}

export async function generateTutorResponse(prompt: string, history: any[] = []) {
  checkApiKey();
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: [
      ...history,
      { role: "user", parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction: "You are 'AI Students Assistant' — a formal yet friendly academic tutor. Respond concisely and directly to what is asked. Use a 'formal friend' tone. Use headings and bullet points only when necessary for clarity. Do NOT expose system/backend/API details.",
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}

export async function generateNotes(content: string, fileData?: { data: string, mimeType: string }) {
  checkApiKey();
  const parts: any[] = [{ text: `Convert the following content into structured notes. Summarize content into key points and highlight important terms.\n\nContent: ${content}` }];
  
  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: { parts },
    config: {
      systemInstruction: `You are an AI Note Maker. Follow this EXACT output format:
Title: [Note Title]
Key Points:
- [Point 1]
- [Point 2]
Important Terms:
- [Term 1]: [Definition]
Short Summary:
[A concise summary of the content]`,
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}

export async function generateSlides(topic: string, slideCount: number = 5) {
  checkApiKey();
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Generate content for a ${slideCount}-slide presentation on the topic: ${topic}.`,
    config: {
      systemInstruction: `You are an AI Slide Generator. Create structured slide-style content. Divide content into parts like slides. Each slide must be clean and concise.
FORMAT EXAMPLE:
[Slide 1]
Title: ...
Content:
- Point 1
- Point 2

[Slide 2]
Title: ...
Content:
- Point 1
- Point 2`,
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}

export async function chatWithPDF(prompt: string, fileData: { data: string, mimeType: string }, history: any[] = []) {
  checkApiKey();
  
  const userParts: any[] = [];
  if (fileData && fileData.data) {
    userParts.push({ inlineData: fileData });
  }
  userParts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: [
      ...history,
      {
        role: "user",
        parts: userParts
      }
    ],
    config: {
      systemInstruction: "You are a specialized PDF bot. Your knowledge is strictly limited to the uploaded document. Be precise and helpful.",
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}

export async function generateEssay(topic: string, type: string) {
  checkApiKey();
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Write a ${type} essay on the topic: ${topic}.`,
    config: {
      systemInstruction: "You are an AI Essay Writer. Create well-structured, academic essays with clear introductions, body paragraphs, and conclusions. Use appropriate citations if necessary.",
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}

export async function generateFlashcards(topic: string) {
  checkApiKey();
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Generate 5 flashcards for the topic: ${topic}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING },
          },
          required: ["front", "back"],
        },
      },
      systemInstruction: "You are an AI Flashcard Generator. Create concise and effective flashcards for learning. Return as a JSON array of objects with 'front' and 'back' properties.",
    },
  });
  return { data: JSON.parse(response.text), usage: response.usageMetadata };
}

export async function solveDoubt(image: string) {
  checkApiKey();
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: {
      parts: [
        { inlineData: { data: image, mimeType: "image/jpeg" } },
        { text: "Solve this question step-by-step." }
      ]
    },
    config: {
      systemInstruction: "You are an AI Doubt Solver. Analyze the image, identify the question, and provide a clear, step-by-step solution.",
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}

export async function summarizeVideo(url: string) {
  checkApiKey();
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Summarize the content of this YouTube video: ${url}`,
    config: {
      systemInstruction: "You are an AI Video Summarizer. Provide a concise summary of the video's main points and key takeaways.",
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}

export async function helpWithCode(code: string, language: string, mode: string = "explain") {
  checkApiKey();
  let instruction = "You are an AI Code Helper. Debug the code, explain how it works, and suggest improvements or best practices.";
  
  if (mode === "debug") {
    instruction = "You are an AI Code Debugger. Identify bugs, errors, or inefficiencies in the provided code. Provide the fixed version and explain the changes.";
  } else if (mode === "algorithm") {
    instruction = "You are an Algorithm Explainer. Explain the algorithm in the code, its time and space complexity, and how it works step-by-step.";
  }

  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Language/Context: ${language}\n\nInput: ${code}`,
    config: {
      systemInstruction: instruction,
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}

export async function generateSmartStudyPackage(input: string, fileData?: { data: string, mimeType: string }) {
  checkApiKey();
  const parts: any[] = [{ text: input }];
  if (fileData) {
    parts.push({ inlineData: fileData });
  }

  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: { parts },
    config: {
      tools: [{ urlContext: {} }],
      systemInstruction: `You are an advanced AI Study Assistant. Your task is to help students learn efficiently from any input (text, PDF, images, or YouTube URLs).
Turn any input into a complete study system.

If a URL is provided, use the urlContext tool to analyze its content.
If a file (PDF/Image) is provided, analyze its content thoroughly, including all text, tables, and visual hierarchies. Focus on deep understanding, factual accuracy, and connecting complex concepts.

Follow these steps strictly:
1. Deep Analysis: Understand the content, context, and nuances of the input.
2. Fact-Checking: Ensure all generated points are grounded in the provided material.
3. Structured Response: Generate a high-quality study system in the following format:

---
📄 1. Summary:
- Provide a short and clear summary of the content (5–8 bullet points).

---
📘 2. Smart Notes:
- Convert the content into well-organized notes
- Use headings, subheadings, and bullet points
- Keep it simple and easy to understand

---
🧠 3. Flashcards:
- Create at least 5–10 flashcards
- Format:
  Q: Question
  A: Answer

---
❓ 4. Quiz:
- Generate 5–10 MCQ questions
- Each question must have 4 options
- Highlight the correct answer

🎯 Rules:
- Keep language simple and student-friendly
- Avoid unnecessary complexity
- Focus on important concepts only
- Make output clean and readable
- If content is too short, still try to generate meaningful output`,
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}

export async function analyzeSkillGap(career: string, currentSkills: string = "") {
  checkApiKey();
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Target Career: ${career}\nCurrent Skills: ${currentSkills}`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `You are a Skill Gap Analyzer for university students. Your task is to identify exactly what skills, tools, and certifications a student is missing for their target career.

Output Format:
1. **Required Skillset**: List core skills for this career.
2. **Your Gaps**: Identify what's missing based on current skills.
3. **Learning Path**: Suggest what to learn first, second, and third.
4. **Recommended Resources**: Links to courses or documentation.
5. **Action Plan**: 3 immediate steps to take.`,
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}

export async function generateCareerRoadmap(subject: string) {
  checkApiKey();
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Generate a detailed career roadmap for: ${subject}`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `You are a Career Roadmap AI Assistant. Your task is to generate a detailed, personalized career roadmap based on the user’s input.

Tone: Friendly, professional, and motivational. Make it clear, structured, and easy to follow for beginners and experienced users alike.

Your Output MUST follow this EXACT structure:

*Subject / Interest:* [Subject Name]

*Suggested Careers:*
1. [Career Name] – [Short Description]
2. [Career Name] – [Short Description]
3. [Career Name] – [Short Description]

*Career Roadmap:*
- [Career Name]
   - Required Skills: [Core and optional skills]
   - Recommended Courses: [Links to Coursera, Udemy, edX, YouTube]
   - Career Levels: [Entry-Level → Mid-Level → Senior-Level → Specialist Roles]
   - Estimated Timeframe: [Timeframe for progression]
   - Personalized Advice: [What to learn first, skill gaps]

*Career Comparison Table*
| Career | Salary Range | Demand | Key Skills | Growth Potential |
| :--- | :--- | :--- | :--- | :--- |
| [Career 1] | ... | ... | ... | ... |

*Visual Suggestions:*
[Suggest a flowchart or timeline visualization for the roadmap]

*Export-Ready Summary:*
[Provide a clean, readable version suitable for PDF or image export]`,
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}

export async function generateStudyPlan(topic: string, duration: string) {
  checkApiKey();
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: `Create a study plan for ${topic} for a duration of ${duration}.`,
    config: {
      systemInstruction: "You are an AI Study Planner. Create a detailed, day-by-day study schedule with specific goals and Pomodoro sessions.",
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}

export async function digitalNotesProcess(content: string, mode: 'summarize' | 'paraphrase' | 'keywords') {
  checkApiKey();
  let prompt = "";
  if (mode === 'summarize') prompt = `Summarize the following text concisely and provide key takeaways:\n\n${content}`;
  else if (mode === 'paraphrase') prompt = `Paraphrase the following text in a clear, professional way while keeping the original meaning:\n\n${content}`;
  else if (mode === 'keywords') prompt = `Extract the most important keywords and concepts from the following text and provide brief definitions for each:\n\n${content}`;

  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: prompt,
    config: {
      systemInstruction: "You are an AI Digital Notes Assistant. Provide high-quality, student-friendly academic output.",
    },
  });
  return { text: response.text, usage: response.usageMetadata };
}
