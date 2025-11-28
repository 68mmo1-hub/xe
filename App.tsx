
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateMaze } from './utils/mazeGenerator';
import { generateChallenge } from './services/geminiService';
import { MazeGrid } from './components/MazeGrid';
import { Modal } from './components/Modal';
import { GameState, Cell, CellType, Position, QuestionData } from './types';
import { INITIAL_GRID_SIZE } from './constants';
import { soundManager } from './services/soundService';

// Styled Icons
const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 22 22 22 12 2"/></svg>;
const ArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 22 22 2 2 2 12 22"/></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="2 12 22 2 22 22 2 12"/></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 12 2 2 2 22 22 12"/></svg>;
const SoundOnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;
const SoundOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    score: 0,
    status: 'idle',
    rows: INITIAL_GRID_SIZE,
    cols: INITIAL_GRID_SIZE
  });

  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState<Position>({ x: 0, y: 0 });
  
  const [currentChallenge, setCurrentChallenge] = useState<QuestionData | null>(null);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [targetCellForChallenge, setTargetCellForChallenge] = useState<Position | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Tính toán kích thước lưới dựa trên màn hình
  const calculateGridDimensions = (level: number) => {
    // Kích thước cơ sở tăng theo level
    const baseSize = INITIAL_GRID_SIZE + Math.floor((level - 1) / 2);
    // Giới hạn max size để không quá khó
    const limitedSize = Math.min(baseSize, 18);

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const aspectRatio = screenWidth / screenHeight;

    let rows, cols;

    if (aspectRatio > 1.2) {
        // Màn hình ngang (Laptop/PC): Tăng cột, giảm hàng
        cols = Math.floor(limitedSize * 1.5);
        rows = limitedSize;
    } else {
        // Màn hình dọc (Mobile): Giữ nguyên tỉ lệ vuông hoặc hơi dọc
        cols = limitedSize;
        rows = Math.floor(limitedSize * 1.3);
    }
    
    // Đảm bảo không quá nhỏ
    return { 
        cols: Math.max(cols, 6), 
        rows: Math.max(rows, 6) 
    };
  };

  // Khởi tạo Level mới
  const startNewLevel = useCallback((level: number) => {
    const { cols, rows } = calculateGridDimensions(level);
    
    const { grid, start, end } = generateMaze(cols, rows);
    
    // Đánh dấu điểm bắt đầu đã thăm
    grid[start.y][start.x].visited = true;

    setMaze(grid);
    setPlayerPos(start);
    setEndPos(end);
    setGameState(prev => ({ ...prev, level, status: 'playing', rows, cols }));
    
    // Đảm bảo BGM đang chạy
    soundManager.startBGM();
  }, []);

  const startGame = () => {
    soundManager.startBGM(); // Kích hoạt AudioContext
    setGameState(prev => ({ ...prev, score: 0 }));
    startNewLevel(1);
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Logic Di chuyển
  const movePlayer = useCallback(async (dx: number, dy: number) => {
    if (gameState.status !== 'playing') return;

    const { x, y } = playerPos;
    const newX = x + dx;
    const newY = y + dy;

    // Kiểm tra biên
    if (newX < 0 || newY < 0 || newX >= gameState.cols || newY >= gameState.rows) {
        soundManager.playWallHit();
        return;
    }

    const currentCell = maze[y][x];
    const targetCell = maze[newY][newX];

    // Kiểm tra Tường
    if (
        (dx === 1 && currentCell.walls.right) ||
        (dx === -1 && currentCell.walls.left) ||
        (dy === 1 && currentCell.walls.bottom) ||
        (dy === -1 && currentCell.walls.top)
    ) {
        soundManager.playWallHit();
        return;
    }

    // Gặp ô bị Khóa (Câu hỏi)
    if (targetCell.type === CellType.Locked) {
      soundManager.playScan();
      setGameState(prev => ({ ...prev, status: 'generating' }));
      setIsGeneratingChallenge(true);
      setTargetCellForChallenge({ x: newX, y: newY });
      
      const challenge = await generateChallenge(gameState.level);
      setCurrentChallenge(challenge);
      setIsGeneratingChallenge(false);
      setGameState(prev => ({ ...prev, status: 'challenge' }));
      return;
    }

    // Di chuyển thành công
    soundManager.playMove();

    // Cập nhật vị trí và trạng thái ô
    const newMaze = [...maze];
    newMaze[newY][newX] = { ...newMaze[newY][newX], visited: true };
    setMaze(newMaze);
    setPlayerPos({ x: newX, y: newY });

    if (targetCell.type === CellType.End) {
      soundManager.playWin();
      setGameState(prev => ({ ...prev, status: 'won' }));
    }
  }, [gameState.status, gameState.cols, gameState.rows, gameState.level, maze, playerPos]);

  // Điều khiển bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': movePlayer(0, -1); break;
        case 'ArrowDown': case 's': case 'S': movePlayer(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': movePlayer(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Xử lý Kết quả Trả lời câu hỏi
  const handleChallengeCorrect = () => {
    soundManager.playSuccess();
    if (!targetCellForChallenge) return;

    const newMaze = [...maze];
    const { x, y } = targetCellForChallenge;
    // Mở khóa ô
    newMaze[y][x] = { ...newMaze[y][x], type: CellType.Open, visited: true };
    setMaze(newMaze);
    
    // Di chuyển người chơi vào ô
    setPlayerPos({ x, y });
    
    if (x === endPos.x && y === endPos.y) {
       soundManager.playWin();
       setGameState(prev => ({ ...prev, status: 'won', score: prev.score + 50 }));
    } else {
       setGameState(prev => ({ ...prev, status: 'playing', score: prev.score + 20 }));
    }
    
    setCurrentChallenge(null);
    setTargetCellForChallenge(null);
  };

  const handleChallengeIncorrect = () => {
    soundManager.playError();
    // Trừ điểm phạt
    setGameState(prev => ({ ...prev, status: 'playing', score: Math.max(0, prev.score - 10) }));
    setCurrentChallenge(null);
    setTargetCellForChallenge(null);
  };

  const handleNextLevel = () => {
    startNewLevel(gameState.level + 1);
  };

  return (
    <div className="h-screen bg-cyber-black font-sans flex flex-col relative text-slate-200 overflow-hidden">
      
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/20 via-cyber-black to-cyber-black"></div>
      </div>

      {/* HUD Header */}
      <header className="flex-none px-4 py-3 border-b border-sky-500/30 bg-[#080c10]/95 backdrop-blur-md flex justify-between items-center z-40 shadow-lg h-[60px]">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => setGameState(prev => ({...prev, status: 'idle'}))}>
             <div className="w-8 h-8 bg-sky-900 border border-sky-400 rounded flex items-center justify-center font-bold text-white shadow group-hover:shadow-[0_0_15px_rgba(56,189,248,0.6)] transition-all">
               <span className="text-xs">AI</span>
             </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-widest text-white uppercase font-display leading-none">
              MÊ CUNG <span className="text-sky-400">TƯ DUY</span>
            </h1>
          </div>
        </div>
        
        <div className="flex gap-4 sm:gap-8 font-mono text-sm items-center">
          <button 
             onClick={toggleSound}
             className="p-2 text-sky-400 hover:text-white hover:bg-sky-500/20 rounded transition-colors"
             title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
             {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
          </button>
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider">Cấp Độ</span>
            <span className="text-pink-400 font-bold text-lg leading-none">{gameState.level.toString().padStart(2, '0')}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-slate-400 text-[10px] uppercase tracking-wider">Điểm Số</span>
             <span className="text-yellow-400 font-bold text-lg leading-none">{gameState.score.toString().padStart(4, '0')}</span>
          </div>
        </div>
      </header>

      {/* Main Content area */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full p-2 sm:p-4">
        
        {gameState.status === 'idle' && (
          <div className="text-center max-w-2xl space-y-10 animate-fade-in-up relative z-20 px-4">
            <div className="relative inline-block">
                <div className="absolute -inset-8 bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 opacity-20 blur-xl rounded-full"></div>
                <h2 className="relative text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-white to-pink-400 leading-tight font-display tracking-tighter drop-shadow-lg">
                  MIND MAZE
                </h2>
                <p className="text-sky-400 font-mono tracking-[0.5em] text-sm mt-2 uppercase opacity-90">Khám Phá AI - Tư Duy Đột Phá</p>
            </div>
            
            <div className="bg-[#0f172a]/90 border border-sky-500/30 p-8 rounded-xl backdrop-blur-md shadow-2xl text-left relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500 group-hover:shadow-[0_0_15px_#ec4899] transition-all"></div>
                <h3 className="text-sky-300 font-display mb-4 text-lg font-bold flex items-center gap-2">
                  NHIỆM VỤ CỦA BẠN
                </h3>
                <p className="text-slate-300 font-sans text-lg leading-relaxed mb-4">
                  Sử dụng các phím mũi tên hoặc nút ảo để di chuyển. Trả lời các câu hỏi về AI để mở khóa các cổng an ninh màu đỏ.
                </p>
                
                <button 
                  onClick={startGame}
                  className="w-full mt-4 group relative px-8 py-4 bg-sky-600 hover:bg-sky-500 transition-all rounded shadow-lg overflow-hidden"
                >
                  <span className="relative font-bold font-display tracking-widest text-xl text-white flex items-center justify-center gap-3">
                    BẮT ĐẦU NGAY
                  </span>
                </button>
            </div>
          </div>
        )}

        {(gameState.status === 'playing' || gameState.status === 'generating' || gameState.status === 'challenge') && (
          <div className="w-full h-full flex flex-col items-center justify-center relative" ref={containerRef}>
            
            {/* Maze Container - Sử dụng aspect-ratio động theo lưới */}
            <div 
                className="relative flex items-center justify-center transition-all duration-500"
                style={{
                    // Tính toán aspect ratio dựa trên số cột/hàng để giữ ô vuông
                    aspectRatio: `${gameState.cols} / ${gameState.rows}`,
                    width: gameState.cols > gameState.rows ? 'min(95vw, 1200px)' : 'auto',
                    height: gameState.cols > gameState.rows ? 'auto' : 'min(80vh, 800px)',
                    maxWidth: '100%',
                    maxHeight: '80vh'
                }}
            >
               <MazeGrid grid={maze} playerPos={playerPos} cols={gameState.cols} />
            </div>

            {/* Mobile Controls */}
            <div className="grid grid-cols-3 gap-2 sm:hidden mt-4 w-full max-w-[180px] shrink-0 pb-4">
              <div></div>
              <button 
                className="aspect-square bg-slate-800/80 border border-slate-600 rounded-lg active:bg-sky-500 active:border-sky-300 transition-all flex items-center justify-center text-white shadow-lg"
                onClick={() => movePlayer(0, -1)}
              >
                <ArrowUpIcon />
              </button>
              <div></div>
              
              <button 
                className="aspect-square bg-slate-800/80 border border-slate-600 rounded-lg active:bg-sky-500 active:border-sky-300 transition-all flex items-center justify-center text-white shadow-lg"
                onClick={() => movePlayer(-1, 0)}
              >
                <ArrowLeftIcon />
              </button>
              <button 
                className="aspect-square bg-slate-800/80 border border-slate-600 rounded-lg active:bg-sky-500 active:border-sky-300 transition-all flex items-center justify-center text-white shadow-lg"
                onClick={() => movePlayer(0, 1)}
              >
                <ArrowDownIcon />
              </button>
              <button 
                className="aspect-square bg-slate-800/80 border border-slate-600 rounded-lg active:bg-sky-500 active:border-sky-300 transition-all flex items-center justify-center text-white shadow-lg"
                onClick={() => movePlayer(1, 0)}
              >
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        )}

        {gameState.status === 'won' && (
           <div className="text-center space-y-6 bg-[#0f172a] p-8 rounded-2xl border-2 border-green-500 shadow-2xl max-w-md w-full animate-fade-in-up mx-4">
             <div className="w-20 h-20 mx-auto rounded-full bg-green-900/50 border-2 border-green-500 flex items-center justify-center">
                <span className="text-4xl">🏆</span>
             </div>
             
             <div>
                <h2 className="text-3xl font-bold text-white mb-2 font-display">HOÀN THÀNH</h2>
                <p className="text-green-400 font-mono">Đã vượt qua Cấp {gameState.level}</p>
             </div>

             <button 
               onClick={handleNextLevel}
               className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded shadow-lg transition-all"
             >
               MÀN TIẾP THEO ->
             </button>
           </div>
        )}
      </main>

      {/* Challenge Modal */}
      {(gameState.status === 'challenge' || gameState.status === 'generating') && (
        <Modal 
          data={currentChallenge} 
          isLoading={gameState.status === 'generating'}
          onCorrect={handleChallengeCorrect}
          onIncorrect={handleChallengeIncorrect}
        />
      )}
    </div>
  );
};

export default App;
