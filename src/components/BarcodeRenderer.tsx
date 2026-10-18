import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { formatKip } from '../utils/formatters';

interface BarcodeRendererProps {
  value: string;
  format?: 'CODE128' | 'EAN13';
  width?: number;
  height?: number;
  displayValue?: boolean;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  format = 'CODE128',
  width = 1.6,
  height = 50,
  displayValue = true,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: format === 'EAN13' && value.length === 13 ? 'EAN13' : 'CODE128',
        width,
        height,
        displayValue,
        fontSize: 12,
        margin: 4,
        background: '#ffffff',
        lineColor: '#1e293b',
      });
    } catch {
      // Fallback to CODE128 if EAN13 checksum fails
      try {
        if (svgRef.current) {
          JsBarcode(svgRef.current, value, {
            format: 'CODE128',
            width,
            height,
            displayValue,
            fontSize: 12,
            margin: 4,
          });
        }
      } catch (err) {
        console.warn('Barcode render error:', err);
      }
    }
  }, [value, format, width, height, displayValue]);

  return <svg ref={svgRef} className={`max-w-full ${className}`} />;
};

interface QRCodeRendererProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeRenderer: React.FC<QRCodeRendererProps> = ({
  value,
  size = 120,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      },
      (error) => {
        if (error) console.error('QR code error:', error);
      }
    );
  }, [value, size]);

  return <canvas ref={canvasRef} className={`rounded-lg ${className}`} />;
};

interface ShelfPriceTagProps {
  productName: string;
  price: number;
  barcode: string;
  unit: string;
  category?: string;
  storeName?: string;
}

export const ShelfPriceTag: React.FC<ShelfPriceTagProps> = ({
  productName,
  price,
  barcode,
  unit,
  storeName = 'HS MINI MART',
}) => {
  return (
    <div className="border-2 border-dashed border-slate-300 hover:border-sky-500 bg-white p-3 rounded-xl shadow-xs flex flex-col justify-between w-64 h-48 print:border-solid print:border-slate-800 print:shadow-none print:break-inside-avoid">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-xs font-bold text-sky-700 tracking-wider">{storeName}</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
          {unit}
        </span>
      </div>

      {/* Product Name */}
      <div className="my-1">
        <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight">
          {productName}
        </h4>
      </div>

      {/* Price section */}
      <div className="bg-sky-50/70 p-1.5 rounded-lg flex items-baseline justify-between">
        <span className="text-[11px] font-medium text-slate-500">ລາຄາ:</span>
        <span className="text-xl font-extrabold text-emerald-600 tracking-tight">
          {formatKip(price)}
        </span>
      </div>

      {/* Barcode & QR Code */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="w-40 flex items-center justify-center">
          <BarcodeRenderer
            value={barcode}
            width={1.1}
            height={26}
            displayValue={true}
            className="w-full"
          />
        </div>
        <div className="flex flex-col items-center">
          <QRCodeRenderer value={`HSMART:${barcode}:${price}`} size={38} />
          <span className="text-[8px] text-slate-400 mt-0.5 font-mono">SCAN</span>
        </div>
      </div>
    </div>
  );
};
