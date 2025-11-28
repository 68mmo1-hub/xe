import React, { useState } from 'react';
import { QuestionData } from '../types';

interface ModalProps {
  data: QuestionData | null;
  onCorrect: () => void;
  onIncorrect: () => void;
  isLoading: boolean;
}

export const Modal: React.FC<ModalProps> = ({ data, onCorrect, onIncorrect, isLoading }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black/95 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6 text-cyber-blue">
          <div className="relative w-24 h-24">
             <div className="absolute inset-0 border-t-4 border-cyber-blue rounded-full animate-spin"></div>
             <div className="absolute inset-2 border-r-4 border-cyber-pink rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
             <div className="absolute inset-4 border-b-4 border-cyber-yellow rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
             <div className="absolute inset-0 flex items-center justify-center font-mono text-xs animate-pulse">LOADING</div>
          </div>
          <div className="font-mono text-xl animate-pulse tracking-widest text-center">
            ĐANG GIẢI MÃ DỮ LIỆU...<br/>
            <span className="text-sm opacity-60 text-white font-sans">Đang truy xuất câu hỏi từ AI Core</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const handleSubmit = () => {
    if (selectedOption === null) return;

    setShowResult(true);
    if (selectedOption === data.correctIndex) {
      setIsWrong(false);
    } else {
      setIsWrong(true);
    }
  };

  const handleContinue = () => {
    if (isWrong) {
      onIncorrect(); 
    } else {
      onCorrect();
    }
    setShowResult(false);
    setSelectedOption(null);
    setIsWrong(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-black/90 backdrop-blur-md">
      <div className="w-full max-w-2xl relative bg-[#0d1117] border border-cyber-blue/40 shadow-[0_0_60px_rgba(0,243,255,0.2)] flex flex-col max-h-[90vh] rounded-sm overflow-hidden">
        
        {/* Top Decorative Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyber-blue via-white to-cyber-pink animate-pulse"></div>

        {/* Header */}
        <div className="bg-cyber-grid/80 p-5 border-b border-cyber-blue/20 flex justify-between items-center relative">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-cyber-red animate-ping rounded-full"></div>
             <span className="text-white font-bold font-mono tracking-widest uppercase text-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
                 PHÁT HIỆN TƯỜNG LỬA
             </span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-cyber-yellow border border-cyber-yellow/50 px-3 py-1 bg-cyber-yellow/10 rounded">
            LOẠI: {data.category.toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar relative flex-1">
          <div className="mb-6 font-mono text-xs text-cyber-blue/70">
             > ĐANG NHẬN DỮ LIỆU...<br/>
             > YÊU CẦU PHÂN TÍCH LOGIC...
          </div>

          <h2 className="text-xl md:text-2xl font-sans font-bold text-slate-100 mb-8 leading-relaxed tracking-wide">
            {data.question}
          </h2>

          <div className="space-y-4 font-mono">
            {data.options.map((option, idx) => (
              <button
                key={idx}
                disabled={showResult}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-4 border relative group overflow-hidden transition-all duration-300 rounded ${
                  showResult
                    ? idx === data.correctIndex
                      ? 'bg-green-900/30 border-green-500 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : idx === selectedOption
                      ? 'bg-red-900/30 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                      : 'bg-cyber-dark border-slate-800 text-slate-600 opacity-40'
                    : selectedOption === idx
                    ? 'bg-cyber-blue/10 border-cyber-blue text-white shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                    : 'bg-[#161b22] border-slate-700 text-slate-400 hover:border-cyber-pink hover:text-white hover:bg-cyber-pink/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className={`text-sm mt-0.5 font-bold ${selectedOption === idx ? 'text-cyber-blue' : 'opacity-50'}`}>
                    [{String.fromCharCode(65 + idx)}]
                  </span>
                  <span className="font-sans font-medium text-lg">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {showResult && (
            <div className={`mt-8 p-6 border-l-4 animation-fade-in-up bg-opacity-10 backdrop-blur-sm rounded-r ${isWrong ? 'bg-red-900 border-red-500' : 'bg-green-900 border-green-500'}`}>
              <h3 className={`font-bold text-xl mb-2 font-mono flex items-center gap-2 ${isWrong ? 'text-red-400' : 'text-green-400'}`}>
                {isWrong ? '> TRUY CẬP BỊ TỪ CHỐI' : '> XÁC THỰC THÀNH CÔNG'}
              </h3>
              <div className="text-md text-slate-200 font-sans leading-relaxed border-t border-white/10 pt-3 mt-2">
                <span className="text-xs font-mono text-slate-400 block mb-1">GIẢI THÍCH:</span>
                {data.explanation}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-[#0a0f14] border-t border-cyber-blue/20 flex justify-end backdrop-blur gap-4">
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="group relative px-8 py-3 bg-transparent overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <div className="absolute inset-0 w-full h-full bg-cyber-pink/20 border border-cyber-pink skew-x-[-12deg] group-hover:bg-cyber-pink/40 transition-all shadow-[0_0_20px_rgba(255,0,255,0.4)]"></div>
              <span className="relative font-bold font-mono tracking-widest text-white">
                  XÁC NHẬN >>
              </span>
            </button>
          ) : (
             <button
              onClick={handleContinue}
              className="group relative px-8 py-3 bg-transparent overflow-hidden transition-all active:scale-95"
            >
               <div className="absolute inset-0 w-full h-full bg-cyber-blue/20 border border-cyber-blue skew-x-[-12deg] group-hover:bg-cyber-blue/40 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)]"></div>
               <span className="relative font-bold font-mono tracking-widest text-white">
                  {isWrong ? 'THỬ LẠI' : 'TIẾP TỤC'}
               </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};