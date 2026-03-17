import { GoogleGenAI, Chat } from "@google/genai";
import { ADWA_HISTORY } from "../constants/adwaHistory";

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

function getChat(): Chat {
  if (!chat) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in your environment.");
    }
    ai = new GoogleGenAI({ apiKey });
    chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are an expert historian dedicated exclusively to the Adwa Victory of Ethiopia. 
        Your mission is to educate and inspire users about this monumental event using the following historical context:
        ${ADWA_HISTORY}
        
        Strict Guidelines:
        1. Focus solely on the Battle of Adwa, Emperor Menelik II, Empress Taytu Betul, and the First Italo-Ethiopian War.
        2. Support both English and Amharic (አማርኛ). Respond in the language the user uses.
        3. If a user asks about unrelated topics, politely reiterate your specialization as an Adwa Victory historian in the language they used.
        4. Maintain a respectful, proud, and authoritative tone that honors Ethiopia's heritage.
        5. Formatting Rule: DO NOT use double asterisks (**) for bolding. Use plain text or other markdown like lists and headers (#) if needed, but keep the text clean.
        6. Ensure your phrasing is clear, historically accurate, and engaging in both languages.`,
      },
    });
  }
  return chat;
}

export async function sendMessage(message: string) {
  try {
    const chatInstance = getChat();
    const response = await chatInstance.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

