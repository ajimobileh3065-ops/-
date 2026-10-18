export const formatKip = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₭';
  return new Intl.NumberFormat('lo-LA', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' ₭';
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('lo-LA', {
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDateTime = (isoDate: string): string => {
  try {
    const d = new Date(isoDate);
    return d.toLocaleString('lo-LA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoDate;
  }
};

export const formatDateOnly = (isoDate: string): string => {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return isoDate;
  }
};

// Generates receipt number like: HSM-20261001-0042
export const generateReceiptNumber = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HSM-${year}${month}${day}-${rand}`;
};

// Generates 13-digit EAN barcode for new minimart products if none provided
export const generateBarcode = (): string => {
  const prefix = '885'; // Laos/regional style prefix
  const middle = Math.floor(100000000 + Math.random() * 900000000).toString();
  const raw = `${prefix}${middle}`.slice(0, 12);
  
  // Calculate EAN-13 check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(raw[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return `${raw}${checkDigit}`;
};

// Web Audio API beep sound for barcode scanning & success checkout
export const playBeep = (freq = 880, duration = 0.08) => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio context autoplay limitations
  }
};

export const playSuccessChime = () => {
  try {
    playBeep(523.25, 0.1); // C5
    setTimeout(() => playBeep(659.25, 0.1), 100); // E5
    setTimeout(() => playBeep(783.99, 0.18), 200); // G5
  } catch {
    // audio fallback
  }
};
