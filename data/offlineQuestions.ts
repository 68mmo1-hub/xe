import { QuestionData } from '../types';

export const OFFLINE_QUESTIONS: QuestionData[] = [
  {
    question: "Hiện tượng 'Ảo giác AI' (AI Hallucination) là gì?",
    options: [
      "AI nhìn thấy ma.",
      "AI tạo ra thông tin sai lệch nhưng trình bày rất tự tin.",
      "AI bị virus tấn công.",
      "AI có cảm xúc thật."
    ],
    correctIndex: 1,
    explanation: "Ảo giác AI là khi mô hình ngôn ngữ tạo ra câu trả lời nghe có vẻ logic nhưng sai sự thật do không có trong dữ liệu huấn luyện.",
    category: "Đạo đức AI"
  },
  {
    question: "Deepfake là công nghệ gì?",
    options: [
      "Một loại virus máy tính mới.",
      "Công nghệ dùng AI để ghép mặt hoặc giọng nói giả vào video/âm thanh.",
      "Một phần mềm chỉnh sửa ảnh cơ bản.",
      "Tên một loại robot dưới đáy biển."
    ],
    correctIndex: 1,
    explanation: "Deepfake sử dụng học sâu (Deep Learning) để tạo ra nội dung giả mạo (fake) có độ chân thực cao, thường dùng để lừa đảo hoặc bôi nhọ.",
    category: "Tin giả & Deepfakes"
  },
  {
    question: "Thiên kiến xác nhận (Confirmation Bias) là gì?",
    options: [
      "Xu hướng chỉ tìm kiếm thông tin ủng hộ quan điểm sẵn có của mình.",
      "Luôn luôn nghi ngờ mọi thứ.",
      "Khả năng phân tích đa chiều.",
      "Sự thiên vị dành cho người thân."
    ],
    correctIndex: 0,
    explanation: "Thiên kiến xác nhận khiến chúng ta bỏ qua các bằng chứng trái ngược và chỉ tin vào những gì mình muốn tin, làm giảm khả năng tư duy phản biện.",
    category: "Tư duy phản biện"
  },
  {
    question: "Khi sử dụng ChatGPT hoặc Gemini để học tập, điều nào quan trọng nhất?",
    options: [
      "Tin tưởng tuyệt đối 100% vào câu trả lời.",
      "Sao chép y nguyên để nộp bài.",
      "Kiểm chứng lại thông tin từ các nguồn uy tín khác.",
      "Chỉ dùng để giải trí, không dùng học tập."
    ],
    correctIndex: 2,
    explanation: "AI có thể sai sót. Tư duy phản biện yêu cầu bạn phải kiểm chứng thông tin (Fact-check) từ nguồn chính thống trước khi sử dụng.",
    category: "Logic học"
  },
  {
    question: "Lỗi ngụy biện 'Tấn công cá nhân' (Ad Hominem) là gì?",
    options: [
      "Dùng vũ lực để tranh luận.",
      "Chỉ trích đặc điểm cá nhân của đối thủ thay vì phản bác luận điểm của họ.",
      "Tấn công vào điểm yếu của luận điểm.",
      "Nói quá to để lấn át đối phương."
    ],
    correctIndex: 1,
    explanation: "Thay vì bàn về logic của vấn đề, người tranh luận lại lôi ngoại hình, tính cách hoặc quá khứ của người kia ra để hạ thấp họ.",
    category: "Logic học"
  },
  {
    question: "Dữ liệu cá nhân nào KHÔNG nên chia sẻ công khai cho các chatbot AI?",
    options: [
      "Sở thích ăn uống.",
      "Số Căn cước công dân, Mật khẩu ngân hàng, Địa chỉ nhà riêng.",
      "Tên một bộ phim yêu thích.",
      "Câu hỏi về bài tập về nhà."
    ],
    correctIndex: 1,
    explanation: "AI có thể lưu trữ dữ liệu để huấn luyện. Việc chia sẻ thông tin định danh cá nhân (PII) có nguy cơ rò rỉ dữ liệu và mất an toàn.",
    category: "Quyền riêng tư"
  },
  {
    question: "Một tin tức trên mạng xã hội có tiêu đề 'GIẬT GÂN', viết hoa toàn bộ và dùng nhiều dấu chấm than (!!!). Bạn nên làm gì?",
    options: [
      "Chia sẻ ngay lập tức cho bạn bè.",
      "Bình luận thể hiện sự tức giận.",
      "Nghi ngờ và kiểm tra lại nguồn tin (Check source).",
      "Tin ngay vì nhiều người like."
    ],
    correctIndex: 2,
    explanation: "Các tiêu đề giật gân (Clickbait) thường đánh vào cảm xúc để thao túng người đọc. Cần bình tĩnh kiểm chứng nguồn gốc.",
    category: "Phân tích nguồn tin"
  },
  {
    question: "Thuật toán gợi ý nội dung (Recommendation Algorithm) trên TikTok/Facebook có thể gây ra hiệu ứng gì?",
    options: [
      "Giúp ta biết hết mọi kiến thức trên đời.",
      "Tạo ra 'Buồng vang thông tin' (Echo Chamber), chỉ thấy những gì mình thích.",
      "Làm điện thoại chạy nhanh hơn.",
      "Không có tác động gì."
    ],
    correctIndex: 1,
    explanation: "Thuật toán ưu tiên giữ chân người dùng bằng cách hiển thị nội dung họ thích, khiến họ bị cô lập khỏi các quan điểm trái chiều (Buồng vang).",
    category: "Đạo đức AI"
  },
  {
    question: "Phishing (Tấn công giả mạo) thường có dấu hiệu nào?",
    options: [
      "Email từ địa chỉ chính thức của công ty.",
      "Yêu cầu cung cấp mật khẩu/OTP khẩn cấp qua đường link lạ.",
      "Thông báo cập nhật phần mềm bình thường.",
      "Tin nhắn chúc mừng sinh nhật từ bạn thân."
    ],
    correctIndex: 1,
    explanation: "Kẻ lừa đảo thường tạo cảm giác cấp bách (tài khoản bị khóa, trúng thưởng lớn) để dụ nạn nhân click vào link độc hại.",
    category: "An ninh mạng"
  },
  {
    question: "Ngụy biện 'Người rơm' (Straw Man) là gì?",
    options: [
      "Dùng rơm để làm bù nhìn.",
      "Xuyên tạc luận điểm của đối phương thành một phiên bản yếu hơn để dễ dàng bác bỏ.",
      "Đồng ý hoàn toàn với đối phương.",
      "Lảng tránh vấn đề."
    ],
    correctIndex: 1,
    explanation: "Ví dụ: A nói 'Nên hạn chế ăn thịt', B phản bác 'Vậy ý bạn là bắt mọi người ăn cỏ à?'. B đang dựng lên một 'người rơm' sai lệch để tấn công.",
    category: "Logic học"
  }
];