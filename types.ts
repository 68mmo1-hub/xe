export enum CellType {
  Empty = 0,
  Wall = 1,
  Start = 2,
  End = 3,
  Locked = 4, // Requires solving a puzzle to pass
  Open = 5 // Previously locked, now open
}

export interface Position {
  x: number;
  y: number;
}

export interface Cell {
  x: number;
  y: number;
  visited: boolean;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  type: CellType;
}

export interface QuestionData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'Tư duy phản biện' | 'Đạo đức AI' | 'Logic học' | 'Quyền riêng tư';
}

export interface GameState {
  level: number;
  score: number;
  status: 'idle' | 'playing' | 'challenge' | 'generating' | 'won' | 'gameover';
  rows: number;
  cols: number;
}