import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (data: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    setError(null);
    
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {}
      );
      
      setIsScanning(true);
    } catch (err) {
      setError("Unable to access camera. Please ensure camera permissions are granted.");
      console.error("QR Scanner error:", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-secondary border-2 border-primary/20">
        <div id="qr-reader" ref={containerRef} className="w-full h-full" />
        
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80 backdrop-blur-sm">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse-glow">
              <Camera className="w-10 h-10 text-primary" />
            </div>
            <p className="text-muted-foreground text-center px-4">
              Click below to start scanning your prescription QR code
            </p>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-primary rounded-xl" />
            <div className="absolute left-8 right-8 top-8 h-0.5 bg-primary/80 animate-scan-line" />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Button
        onClick={isScanning ? stopScanner : startScanner}
        size="lg"
        className="min-w-[200px] h-14 text-lg font-semibold shadow-button"
      >
        {isScanning ? (
          <>
            <ScanLine className="w-5 h-5 mr-2 animate-pulse" />
            Scanning...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5 mr-2" />
            Start Scanning
          </>
        )}
      </Button>
    </div>
  );
}
