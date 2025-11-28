
class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isBGMPlaying: boolean = false;
  
  // Biến cho bộ sắp xếp nhạc (Sequencer)
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  private noteIndex: number = 0;
  private tempo: number = 180; // Nhịp nhanh, sôi động
  
  // Giai điệu Arpeggio (Vòng lặp vô tận)
  // Sử dụng các hợp âm Major vui vẻ: C - F - G - C
  private melody = [
    // C Major: C E G C (Cao)
    523.25, 659.25, 783.99, 1046.50,
    523.25, 659.25, 783.99, 1046.50,
    // F Major: F A C F (Cao)
    698.46, 880.00, 1046.50, 1396.91,
    698.46, 880.00, 1046.50, 1396.91,
    // G Major: G B D G (Cao)
    783.99, 987.77, 1174.66, 1567.98,
    783.99, 987.77, 1174.66, 1567.98,
    // Quay về C Major kết thúc vòng
    523.25, 659.25, 783.99, 1046.50,
    1046.50, 783.99, 659.25, 523.25
  ];

  constructor() {}

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.4; // Âm lượng vừa phải
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      if (this.isMuted) {
        this.masterGain.gain.linearRampToValueAtTime(0, now + 0.1);
      } else {
        this.masterGain.gain.linearRampToValueAtTime(0.4, now + 0.1);
      }
    }
    return this.isMuted;
  }

  // --- LOGIC PHÁT NHẠC NỀN (SEQUENCER) ---
  private scheduleNote(beatNumber: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Dùng sóng vuông (Square) đặc trưng của game 8-bit/Arcade
    osc.type = 'square'; 
    
    // Lấy tần số từ mảng giai điệu
    const freq = this.melody[beatNumber % this.melody.length];
    osc.frequency.value = freq;

    // Hiệu ứng "Pluck" (Gảy đàn) ngắn gọn
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1); // Tắt nhanh

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.15);
    
    // Thêm một nốt Bass đệm nhẹ ở mỗi đầu nhịp 4
    if (beatNumber % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle'; // Sóng tam giác nghe êm hơn cho bass
        bassOsc.frequency.value = freq / 4; // Hạ 2 quãng tám
        
        bassGain.gain.setValueAtTime(0.15, time);
        bassGain.gain.linearRampToValueAtTime(0.0, time + 0.2);
        
        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);
        bassOsc.start(time);
        bassOsc.stop(time + 0.25);
    }
  }

  private scheduler() {
    // Hàm này chạy liên tục để lên lịch phát nốt nhạc
    if (!this.ctx) return;
    
    const lookahead = 25.0; // Kiểm tra mỗi 25ms
    const scheduleAheadTime = 0.1; // Lên lịch trước 0.1s

    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
        this.scheduleNote(this.noteIndex, this.nextNoteTime);
        
        // Tính thời gian cho nốt tiếp theo
        const secondsPerBeat = 60.0 / this.tempo;
        // Chơi nốt móc đơn (1/2 beat) để nhạc nhanh và vui
        this.nextNoteTime += 0.5 * secondsPerBeat; 
        
        this.noteIndex++;
    }
    
    this.timerID = window.setTimeout(this.scheduler.bind(this), lookahead);
  }

  public startBGM() {
    this.init();
    if (this.isBGMPlaying) return;
    
    this.isBGMPlaying = true;
    this.noteIndex = 0;
    if (this.ctx) {
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this.scheduler();
    }
  }

  // --- HIỆU ỨNG ÂM THANH (SFX) ---

  public playMove() {
    // Tiếng "Pop" nhẹ nhàng khi đi chuyển
    this.playTone(600, 'sine', 0.08, 0.1, 0, true);
  }

  public playWallHit() {
    // Tiếng "Bonk" trầm khi đụng tường
    this.playTone(150, 'sawtooth', 0.1, 0.2);
  }

  public playScan() {
    // Tiếng trượt lên khi gặp câu hỏi (Magical rising)
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public playSuccess() {
    // Tiếng "1-Up" kinh điển (Si -> Mi)
    const now = this.ctx?.currentTime || 0;
    this.playTone(987.77, 'square', 0.1, 0.2, now); // B5
    this.playTone(1318.51, 'square', 0.2, 0.2, now + 0.1); // E6
  }

  public playError() {
    // Tiếng Buzz è è báo sai
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  public playWin() {
    // Nhạc chiến thắng ngắn gọn vui vẻ
    const now = this.ctx?.currentTime || 0;
    // C - E - G - C (Cao)
    this.playTone(523.25, 'square', 0.1, 0.3, now);
    this.playTone(659.25, 'square', 0.1, 0.3, now + 0.1);
    this.playTone(783.99, 'square', 0.1, 0.3, now + 0.2);
    this.playTone(1046.50, 'square', 0.4, 0.3, now + 0.3);
  }

  // Hàm hỗ trợ phát âm thanh cơ bản
  private playTone(freq: number, type: OscillatorType, duration: number, vol: number, startTime?: number, slide?: boolean) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const start = startTime || this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    
    if (slide) {
         osc.frequency.setValueAtTime(freq, start);
         osc.frequency.exponentialRampToValueAtTime(freq * 1.5, start + duration);
    } else {
         osc.frequency.setValueAtTime(freq, start);
    }

    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(start);
    osc.stop(start + duration);
  }
}

export const soundManager = new SoundService();