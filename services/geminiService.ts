
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from '../types';

// 懒加载：公开发布版不带密钥，此时不创建客户端，调用时直接走兜底文案
let client: GoogleGenAI | null = null;
const getAI = (): GoogleGenAI => {
  if (!process.env.API_KEY) throw new Error('No Gemini API key');
  if (!client) client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return client;
};
const ai = { models: { generateContent: (req: Parameters<GoogleGenAI['models']['generateContent']>[0]) => getAI().models.generateContent(req) } };

export const getPuzzleHint = async (chapterId: number, currentProgress: string, lang: Language): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are Melquiades, the mysterious gypsy from 'One Hundred Years of Solitude'. 
      Provide a poetic, cryptic but helpful hint for Chapter ${chapterId} puzzle. 
      The player is currently at: ${currentProgress}. 
      Keep it under 50 words and respond ONLY in ${lang === 'zh' ? 'Chinese' : 'English'}.`,
    });
    return response.text || (lang === 'zh' ? "羊皮卷依然无法辨认..." : "The parchment remains illegible...");
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'zh' ? "今天星辰也沉默了。" : "Even the stars are silent today.";
  }
};

export const editMelquiadesDaguerreotype = async (imageData: string, prompt: string, lang: Language): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageData.split(',')[1], mimeType: 'image/png' } },
          { text: `Transform this image into a 19th-century sepia daguerreotype. Instructions: ${prompt}. (Context: Melquiades Gypsy Alchemy Studio)` }
        ]
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    return null;
  }
};

export const generateChapterIllustration = async (chapterId: number, theme: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A surreal 2D illustration in 'Rusty Lake' game style. Theme: ${theme}. 
            Vintage aesthetic, mysterious atmosphere, muted earthy colors, clean lines with subtle cross-hatching, 
            flat perspective, symbolic and poetic composition related to One Hundred Years of Solitude.`
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return null;
  }
};
