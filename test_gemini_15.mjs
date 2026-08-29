import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  console.log("Starting gemini-1.5-flash...");
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.0-pro',
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    });
    console.log("Success!", response.text);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}
main();
