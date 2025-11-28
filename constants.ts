
export const INITIAL_GRID_SIZE = 8;
export const MAX_GRID_SIZE = 20;
export const VISIBILITY_RADIUS = 5; // Tăng bán kính sương mù để dễ nhìn hơn

// Màu sắc giao diện (Tailwind classes hoặc Hex)
export const COLORS = {
  wall: 'border-cyber-blue',
  wallGlow: 'shadow-[0_0_8px_rgba(0,243,255,0.6)]',
  visited: 'bg-cyber-blue/5',
  path: 'bg-transparent',
  player: 'bg-cyber-pink',
  end: 'bg-cyber-yellow',
  locked: 'text-cyber-red',
};

// Danh sách chủ đề tranh luận (Tiếng Việt)
export const TOPICS = [
  "Ngụy biện logic (Logical Fallacies)",
  "Thiên kiến trong AI (AI Bias)",
  "Tin giả & Deepfakes (Misinformation)",
  "Quyền riêng tư dữ liệu (Data Privacy)",
  "Phân tích nguồn tin (Source Analysis)",
  "Đạo đức trong công nghệ (Tech Ethics)",
  "Tác động của AI đến việc làm",
  "AI và Bản quyền sáng tạo",
  "An ninh mạng và Lừa đảo trực tuyến"
];