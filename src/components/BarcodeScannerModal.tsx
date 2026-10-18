import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, ScanBarcode, ArrowRight, AlertCircle } from 'lucide-react';
import { playBeep } from '../utils/formatters';
import { Product } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  products: Product[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  products,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Start camera if available
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('ກ້ອງຖ່າຍຮູບບໍ່ຖືກຮອງຮັບໃນອຸປະກອນນີ້');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasCamera(true);
      setCameraError(null);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('ບໍ່ສາມາດເປີດກ້ອງຖ່າຍຮູບໄດ້ ຫຼື ບໍ່ໄດ້ຮັບສິດອະນຸຍາດ');
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;

    playBeep(920, 0.08);
    onScan(code);
    setManualCode('');
    onClose();
  };

  const handleSelectSample = (barcode: string) => {
    playBeep(920, 0.08);
    onScan(barcode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-emerald-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ScanBarcode className="w-5 h-5" />
            <h3 className="font-bold text-base">ສະແກນບາໂຄດສິນຄ້າ (Scan Barcode)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Camera Viewport */}
          <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border-2 border-dashed border-sky-400">
            {hasCamera ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <div className="text-center p-4 text-slate-300">
                <Camera className="w-12 h-12 mx-auto mb-2 text-sky-400 opacity-60" />
                <p className="text-sm font-medium text-slate-200">ກ້ອງສະແກນບາໂຄດ</p>
                {cameraError ? (
                  <p className="text-xs text-amber-300 mt-1 max-w-xs mx-auto">{cameraError}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">
                    ຈໍ່ບາໂຄດໃສ່ກ້ອງ ຫຼື ຍິງບາໂຄດດ້ວຍເຄື່ອງສະແກນ USB
                  </p>
                )}
              </div>
            )}

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-32 border-2 border-emerald-400 rounded-lg relative bg-emerald-400/10">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400 shadow-sm animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Manual Input / Barcode Gun Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>ປ້ອນລະຫັດບາໂຄດ ຫຼື ຍິງບາໂຄດ (USB Scanner):</span>
              <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full font-mono">
                Auto-Focus Ready
              </span>
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="ເຊັ່ນ: 8850029010012..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-mono text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium px-5 rounded-xl flex items-center space-x-1 transition-colors"
              >
                <span>ເພີ່ມ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Click Samples for Demo */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-2">
              ຄລິກທົດລອງສະແກນສິນຄ້າຕົວຢ່າງ (Quick Test):
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {products.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectSample(p.barcode)}
                  className="text-left p-2 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors flex items-center space-x-2 group"
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-700">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{p.barcode}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-medium rounded-xl transition-colors"
          >
            ປິດ
          </button>
        </div>
      </div>
    </div>
  );
};
