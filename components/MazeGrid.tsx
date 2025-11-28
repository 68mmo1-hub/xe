
import React, { useMemo } from 'react';
import { Cell, CellType, Position } from '../types';
import { VISIBILITY_RADIUS } from '../constants';

interface MazeGridProps {
  grid: Cell[][];
  playerPos: Position;
  cols: number;
}

export const MazeGrid: React.FC<MazeGridProps> = ({ grid, playerPos, cols }) => {
  // Tính toán tầm nhìn
  const getVisibility = (cx: number, cy: number, px: number, py: number) => {
    const distance = Math.sqrt(Math.pow(cx - px, 2) + Math.pow(cy - py, 2));

    if (distance < 1.5) return 'visible'; // Khu vực ngay cạnh người chơi (rất sáng)
    if (distance <= VISIBILITY_RADIUS) return 'dimmed'; // Khu vực xung quanh (sáng vừa)
    return 'hidden'; // Khu vực tối hoàn toàn
  };

  const renderedGrid = useMemo(() => {
    return grid.flatMap((row) =>
      row.map((cell) => {
        const visibility = getVisibility(cell.x, cell.y, playerPos.x, playerPos.y);
        const isVisitedMemory = cell.visited;
        
        let opacityClass = 'opacity-0';
        let filterClass = 'brightness-0';
        let bgClass = 'bg-[#000]'; 

        if (visibility === 'visible') {
            opacityClass = 'opacity-100';
            filterClass = 'brightness-110 contrast-105';
            bgClass = 'bg-[#1e293b]'; // Slate-800 - Nền sáng hơn chút
        } else if (visibility === 'dimmed') {
            opacityClass = 'opacity-100';
            filterClass = 'brightness-90'; 
             bgClass = 'bg-[#0f172a]'; // Slate-900
        } else if (isVisitedMemory) {
            opacityClass = 'opacity-100';
            filterClass = 'brightness-50 grayscale';
             bgClass = 'bg-[#020617]'; // Slate-950
        } else {
            // Hoàn toàn ẩn
            return (
                <div
                    key={`${cell.x}-${cell.y}`}
                    className="relative bg-black"
                    style={{ width: '100%', paddingBottom: '100%' }}
                >
                  <div className="absolute inset-0 border border-white/5"></div>
                </div>
            );
        }

        const isPlayerHere = cell.x === playerPos.x && cell.y === playerPos.y;
        
        let content = null;

        // Styling cho Tường - CẬP NHẬT: To hơn và màu dễ nhìn hơn
        const wallColor = '#38bdf8'; // Sky-400 (Dễ nhìn hơn Cyan gắt)
        const wallThickness = '3px'; // Tăng độ dày từ 1-2px lên 3px
        const wallShadow = `0 0 4px rgba(56, 189, 248, 0.4)`; // Giảm độ chói, tăng độ tỏa nhẹ

        const wallStyle: React.CSSProperties = {
            borderTop: cell.walls.top ? `${wallThickness} solid ${wallColor}` : '1px solid rgba(255, 255, 255, 0.05)',
            borderRight: cell.walls.right ? `${wallThickness} solid ${wallColor}` : '1px solid rgba(255, 255, 255, 0.05)',
            borderBottom: cell.walls.bottom ? `${wallThickness} solid ${wallColor}` : '1px solid rgba(255, 255, 255, 0.05)',
            borderLeft: cell.walls.left ? `${wallThickness} solid ${wallColor}` : '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: visibility === 'visible' ? wallShadow : 'none',
            zIndex: visibility === 'hidden' ? 0 : 10
        };

        // Render các ô đặc biệt
        if (cell.type === CellType.End) {
          content = (
            <div className="absolute inset-0 flex items-center justify-center animate-pulse z-20">
               <div className="w-3/4 h-3/4 bg-yellow-400 flex items-center justify-center rounded-md shadow-[0_0_15px_#fbbf24] border-2 border-yellow-200">
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-black font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </div>
            </div>
          );
        } else if (cell.type === CellType.Locked) {
           // Icon ChatGPT / AI Swirl
           content = (
            <div className="absolute inset-0 flex items-center justify-center z-20">
               <div className="w-3/4 h-3/4 bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center rounded-full animate-float backdrop-blur-sm shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                 <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-400 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1195 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2298V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4593a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l3.1028-1.7999 3.1028 1.7999v3.5911l-3.1028 1.7999-3.1028-1.7999z" />
                 </svg>
               </div>
            </div>
          );
        } else if (cell.type === CellType.Start) {
           content = (
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-sky-300 text-[10px] font-bold font-mono bg-sky-900/50 px-1 rounded">START</span>
            </div>
          );
        }

        return (
          <div
            key={`${cell.x}-${cell.y}`}
            className={`relative box-border transition-all duration-300 ease-out overflow-hidden ${opacityClass} ${filterClass} ${bgClass}`}
            style={{ 
                width: '100%', 
                paddingBottom: '100%',
                ...wallStyle
            }} 
          >
            <div className="absolute inset-0">
                {content}
                {isPlayerHere && (
                  <div className="absolute inset-0 flex items-center justify-center z-30">
                     <div className="relative w-[120%] h-[120%] -mt-2 animate-float" style={{ animationDuration: '3s' }}>
                        {/* Glow Effect */}
                        <div className="absolute inset-2 bg-white rounded-full blur-xl opacity-20"></div>
                        
                        {/* Male Student Icon - Chibi Style (Updated: Short legs, Long arms) */}
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                           
                           {/* Backpack (Behind) */}
                           <rect x="30" y="48" width="40" height="32" rx="5" fill="#8B4513" />

                           {/* Legs (Black Pants) - Shortened (Ending at 88 instead of 95) */}
                           <path d="M40 88 V70 H48 V88 H40 Z" fill="#1a1a1a" />
                           <path d="M52 88 V70 H60 V88 H52 Z" fill="#1a1a1a" />

                           {/* Body (White Shirt) - Fitted */}
                           <path d="M35 70 L34 52 C30 50 28 48 35 46 H65 C72 48 70 50 66 52 L65 70 H35 Z" fill="#ffffff"/>

                           {/* Arms (New & Longer) */}
                           {/* Left Arm */}
                           <path d="M34 50 L28 72 H33 L36 52 Z" fill="#ffffff" /> 
                           <circle cx="30.5" cy="74" r="3.5" fill="#ffe4c4" />

                           {/* Right Arm */}
                           <path d="M66 50 L72 72 H67 L64 52 Z" fill="#ffffff" />
                           <circle cx="69.5" cy="74" r="3.5" fill="#ffe4c4" />

                           {/* Collar & Tie */}
                           <path d="M35 46 L50 58 L65 46" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1"/>
                           <path d="M50 46 V62 L46 68 H54 L50 62" fill="#0ea5e9"/>

                           {/* Head - Skin Tone (Large) */}
                           <ellipse cx="50" cy="32" rx="16" ry="18" fill="#ffe4c4"/>
                           
                           {/* Hair - Short Black */}
                           <path d="M34 32 C34 18 40 10 50 10 C60 10 66 18 66 32 C66 36 65 30 63 26 H37 C35 30 34 36 34 32 Z" fill="#0f172a"/>

                           {/* Glasses */}
                           <g stroke="#0f172a" strokeWidth="1.5" fill="rgba(255,255,255,0.4)">
                             <circle cx="43" cy="34" r="5"/>
                             <circle cx="57" cy="34" r="5"/>
                             <line x1="48" y1="34" x2="52" y2="34"/>
                           </g>

                           {/* Face */}
                           <circle cx="43" cy="34" r="1.5" fill="#0f172a"/>
                           <circle cx="57" cy="34" r="1.5" fill="#0f172a"/>
                           <path d="M46 43 Q50 45 54 43" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

                           {/* Backpack Straps */}
                           <path d="M38 46 V68" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round"/>
                           <path d="M62 46 V68" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                     </div>
                  </div>
                )}
            </div>
          </div>
        );
      })
    );
  }, [grid, playerPos, cols]);

  return (
    <div className="relative p-1 bg-[#020617] border-4 border-sky-600 rounded-xl shadow-2xl w-full h-full overflow-hidden">
        <div
        className="grid gap-0 relative z-10"
        style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            width: '100%',
        }}
        >
        {renderedGrid}
        </div>
    </div>
  );
};
