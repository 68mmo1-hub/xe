import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuestionData } from '../types';
import { TOPICS } from '../constants';

// Lấy API Key an toàn cho cả môi trường Node (process) và Vite (import.meta)
const getApiKey = () => {
  // Ưu tiên 1: Biến môi trường từ file .env.local (theo hướng dẫn mới)
  // @ts-ignore
  if (import.meta && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_GEMINI_API_KEY;
  }

  // Ưu tiên 2: Biến môi trường chuẩn VITE_API_KEY (cấu hình cũ)
  // @ts-ignore
  if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }

  // Ưu tiên 3: Biến môi trường hệ thống (dành cho server-side nếu có)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  
  return '';
};

// Khởi tạo lười (Lazy initialization) để tránh crash app nếu chưa có key ngay lúc đầu
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (aiInstance) return aiInstance;
  
  const key = getApiKey();
  if (!key) {
    console.warn("Chưa tìm thấy API KEY. Game sẽ chạy ở chế độ Offline (Câu hỏi dự phòng).");
    return null;
  }
  
  try {
    aiInstance = new GoogleGenAI({ apiKey: key });
    return aiInstance;
  } catch (error) {
    console.error("Lỗi khởi tạo GoogleGenAI:", error);
    return null;
  }
}

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: 'Câu hỏi tư duy phản biện hoặc đạo đức AI bằng tiếng Việt.',
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '4 lựa chọn trắc nghiệm bằng tiếng Việt.',
    },
    correctIndex: {
      type: Type.INTEGER,
      description: 'Chỉ số của câu trả lời đúng (0-3).',
    },
    explanation: {
      type: Type.STRING,
      description: 'Giải thích ngắn gọn tại sao đáp án đó đúng và logic đằng sau nó, bằng tiếng Việt.',
    },
    category: {
      type: Type.STRING,
      enum: ['Tư duy phản biện', 'Đạo đức AI', 'Logic học', 'Quyền riêng tư'],
    }
  },
  required: ['question', 'options', 'correctIndex', 'explanation', 'category'],
};

// Dữ liệu dự phòng (Fallback)
const fallbackData: QuestionData = {
  question: "Hiện tượng 'Ảo giác AI' (AI Hallucination) là gì?",
  options: [
    "Khi AI có khả năng nhìn thấy các thực thể siêu nhiên.",
    "Khi AI tạo ra thông tin sai lệch, bịa đặt nhưng trình bày một cách tự tin như thật.",
    "Khi hệ thống máy chủ AI bị nhiễm virus máy tính.",
    "Khi AI bắt đầu có cảm xúc và ý thức như con người."
  ],
  correctIndex: 1,
  explanation: "Ảo giác AI là thuật ngữ chỉ việc các mô hình ngôn ngữ lớn (LLM) tạo ra nội dung có vẻ logic và thuyết phục nhưng thực tế là sai sự thật hoặc không dựa trên dữ liệu huấn luyện.",
  category: "Đạo đức AI"
};

export const generateChallenge = async (difficulty: number): Promise<QuestionData> => {
  const ai = getAI();
  
  // Nếu không có AI (do thiếu key hoặc lỗi), trả về dữ liệu mẫu ngay lập tức
  if (!ai) {
    // Giả lập độ trễ mạng một chút cho giống thật
    await new Promise(resolve => setTimeout(resolve, 800));
    return fallbackData;
  }

  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  
  const prompt = `
    Tạo một câu hỏi trắc nghiệm bằng Tiếng Việt về chủ đề "${topic}".
    Đối tượng: Người dùng phổ thông quan tâm đến công nghệ và tư duy logic.
    Độ khó: ${difficulty} (1 là dễ, 10 là rất khó).
    
    Câu hỏi cần kiểm tra:
    - Khả năng phát hiện lỗi ngụy biện.
    - Hiểu biết về việc sử dụng AI có đạo đức.
    - Phân biệt sự thật và ý kiến chủ quan hoặc ảo giác AI.
    
    Đảm bảo câu trả lời "đúng" phải khách quan, dựa trên logic hoặc các nguyên tắc đạo đức AI đã được thiết lập.
    Tuyệt đối không sử dụng tiếng Anh trong nội dung trả lời JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Không nhận được phản hồi từ Gemini");
    }

    return JSON.parse(text) as QuestionData;
  } catch (error) {
    console.error("Lỗi Gemini API:", error);
    // Dữ liệu dự phòng khi API lỗi
    return fallbackData;
  }
};