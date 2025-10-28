import { GoogleGenAI } from "@google/genai";
import { Gesture } from '../types';

// IMPORTANT: Do not expose your API key in client-side code in a real production app.
// This is for demonstration purposes only.
// The execution environment is expected to have `process.env.API_KEY` available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash-lite';

const PROMPT = "Analyze the hand gesture in this image. Respond with one of these exact strings based on the number of fingers clearly extended: 'ONE_FINGER', 'TWO_FINGERS', 'THREE_FINGERS', 'FOUR_FINGERS', 'FIVE_FINGERS'. If no fingers or a fist is shown, or the gesture is ambiguous, respond with 'UNKNOWN'. Do not add any explanation or decoration.";

const validGestures: Gesture[] = ['ONE_FINGER', 'TWO_FINGERS', 'THREE_FINGERS', 'FOUR_FINGERS', 'FIVE_FINGERS', 'UNKNOWN'];

export const recognizeGesture = async (imageDataBase64: string): Promise<Gesture> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageDataBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{text: PROMPT}, imagePart] },
    });

    const gestureText = response.text.trim().toUpperCase() as Gesture;

    if (validGestures.includes(gestureText)) {
      return gestureText;
    }

    console.warn(`Unexpected response from API: ${gestureText}`);
    return 'UNKNOWN';

  } catch (error) {
    console.error("Error recognizing gesture:", error);
    // Re-throw the error so the UI component can handle it and show a message.
    throw error;
  }
};