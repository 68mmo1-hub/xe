
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuestionData } from '../types';
import { TOPICS } from '../constants';
import { OFFLINE_QUESTIONS } from '../data/offlineQuestions';

// Lấy API Key an toàn
const getApiKey = () => {
  // @ts-ignore
  if (import.meta && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  // @ts-ignore
  if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (aiInstance) return aiInstance;
  const key = getApiKey();
  if (!key) return null; // Không có key -> Chế độ Offline
  
  try {
    aiInstance = new GoogleGenAI({ apiKey: key });
    return aiInstance;
  } catch (error) {
    return null;
  }
}

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.STRING } },
    correctIndex: { type: Type.INTEGER },
    explanation: { type: Type.STRING },
    category: {
      type: Type.STRING,
      enum: ['Tư duy phản biện', 'Đạo đức AI', 'Logic học', 'Quyền riêng tư', 'Tin giả & Deepfakes', 'Phân tích nguồn tin', 'An ninh mạng'],
    }
  },
  required: ['question', 'options', 'correctIndex', 'explanation', 'category'],
};

// Hàm lấy câu hỏi random từ kho Offline
const getOfflineChallenge = async (): Promise<QuestionData> => {
  // Giả lập độ trễ nhỏ để trải nghiệm mượt mà (như đang loading)
  await new Promise(resolve => setTimeout(resolve, 600));
  const randomIndex = Math.floor(Math.random() * OFFLINE_QUESTIONS.length);
  return OFFLINE_QUESTIONS[randomIndex];
};

export const generateChallenge = async (difficulty: number): Promise<QuestionData> => {
  // Kiểm tra kết nối mạng
  if (!navigator.onLine) {
    console.log("Đang offline, sử dụng dữ liệu nội bộ.");
    return getOfflineChallenge();
  }

  const ai = getAI();
  
  // Nếu không có AI Key, dùng dữ liệu offline
  if (!ai) {
    return getOfflineChallenge();
  }

  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const prompt = `
    Tạo một câu hỏi trắc nghiệm bằng Tiếng Việt về chủ đề "${topic}".
    Độ khó: ${difficulty}/10.
    Yêu cầu: Kiểm tra tư duy phản biện, logic, đạo đức AI.
    Trả về JSON thuần túy theo schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.8,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response");

    return JSON.parse(text) as QuestionData;
  } catch (error) {
    console.warn("Lỗi Gemini API hoặc timeout, chuyển sang chế độ Offline:", error);
    return getOfflineChallenge();
  }
};