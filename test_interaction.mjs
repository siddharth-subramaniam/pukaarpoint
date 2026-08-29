import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  console.log("Starting interactions.create...");
  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.6-flash',
      input: [
        { type: 'user_input', content: [{ type: 'text', text: 'My bank account was drained!' }] }
      ]
    });
    console.log("Success!", JSON.stringify(interaction.outputs, null, 2));
  } catch (error) {
    console.error("Error occurred:");
    console.error(error);
  }
}
main();
