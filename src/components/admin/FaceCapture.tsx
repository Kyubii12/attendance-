"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, CameraOff, RefreshCw, CheckCircle, MonitorPlay, ScanFace } from "lucide-react";

type Props = {
  onCapture: (dataUrl: string) => void;
  onClear: () => void;
  captured: string | null;
};

function drawOverlay(canvas: HTMLCanvasElement, frame: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  // Sweep line only — drawn on top of video
  const sy = (frame * 1.5) % h;
  const sg = ctx.createLinearGradient(0, sy - 30, 0, sy + 30);
  sg.addColorStop(0, "rgba(201,168,76,0)");
  sg.addColorStop(0.5, "rgba(201,168,76,0.15)");
  sg.addColorStop(1, "rgba(201,168,76,0)");
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = sg;
  ctx.fillRect(0, sy - 30, w, 60);
}

export default function FaceCapture({ onCapture, onClear, captured }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const snapCanvas = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const rafRef     = useRef<number>(0);
  const frameRef   = useRef<number>(0);

  const [camState, setCamState] = useState<"idle" | "active" | "error">("idle");
  const [camError, setCamError] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);

  const overlayLoop = useCallback(() => {
    const c = overlayRef.current;
    if (c) drawOverlay(c, frameRef.current++);
    rafRef.current = requestAnimationFrame(overlayLoop);
  }, []);

  const startCamera = async () => {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      if (overlayRef.current) {
        overlayRef.current.width  = 640;
        overlayRef.current.height = 480;
      }
      setCamState("active");
      rafRef.current = requestAnimationFrame(overlayLoop);
    } catch (e) {
      const err = e as DOMException;
      if (err.name === "NotAllowedError") setCamError("Camera permission denied.");
      else if (err.name === "NotReadableError") setCamError("Camera is in use by another app.");
      else setCamError("Camera unavailable.");
      setCamState("error");
    }
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    cancelAnimationFrame(rafRef.current);
    setCamState("idle");
  }, []);

  // Countdown then capture
  const triggerCapture = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      // Snap the frame
      const video  = videoRef.current;
      const canvas = snapCanvas.current;
      if (video && canvas) {
        canvas.width  = video.videoWidth  || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          onCapture(dataUrl);
          stopCamera();
        }
      }
      setCountdown(null);
      return;
    }
    const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, onCapture, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Captured preview ──────────────────────────────────────
  if (captured) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-green-500/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={captured} alt="Captured face" className="w-full object-cover" />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-end pb-3">
          <span className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <CheckCircle size={13} /> Face Captured
          </span>
        </div>
        <button onClick={onClear}
          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors">
          <RefreshCw size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Camera viewport */}
      <div className="relative bg-[#0a1628] rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-white/10">
        <video ref={videoRef} className={`w-full h-full object-cover ${camState === "active" ? "block" : "hidden"}`}
          muted playsInline />

        {/* Overlay canvas for sweep line */}
        <canvas ref={overlayRef}
          className={`absolute inset-0 w-full h-full pointer-events-none ${camState === "active" ? "block" : "hidden"}`} />

        {/* Hidden snap canvas */}
        <canvas ref={snapCanvas} className="hidden" />

        {/* Face guide oval */}
        {camState === "active" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-36 h-44 rounded-full border-2 border-dashed border-[#c9a84c]/60" />
          </div>
        )}

        {/* Countdown */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <span className="text-[#c9a84c] text-7xl font-bold drop-shadow-lg">{countdown}</span>
          </div>
        )}

        {/* Idle state */}
        {camState === "idle" && (
          <div className="flex flex-col items-center gap-2 text-center px-6">
            <ScanFace size={32} className="text-[#c9a84c]" />
            <p className="text-gray-400 text-xs">Click below to open camera and capture face</p>
          </div>
        )}

        {/* Error state */}
        {camState === "error" && (
          <div className="flex flex-col items-center gap-2 text-center px-6">
            <CameraOff size={28} className="text-red-400" />
            <p className="text-red-400 text-xs">{camError}</p>
          </div>
        )}

        {/* Active badge */}
        {camState === "active" && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> LIVE
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {camState === "idle" || camState === "error" ? (
          <button type="button" onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1a2f4e] hover:bg-[#243d5e] border border-white/10 text-white font-semibold py-2 rounded-lg text-xs transition-colors">
            <Camera size={14} /> Open Camera
          </button>
        ) : (
          <>
            <button type="button" onClick={triggerCapture} disabled={countdown !== null}
              className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] disabled:opacity-60 text-[#0a1628] font-bold py-2 rounded-lg text-xs transition-colors">
              <MonitorPlay size={14} /> {countdown !== null ? `Capturing in ${countdown}…` : "Capture Face"}
            </button>
            <button type="button" onClick={stopCamera}
              className="flex items-center gap-1.5 bg-[#1a2f4e] hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 px-3 py-2 rounded-lg text-xs transition-colors">
              <CameraOff size={14} />
            </button>
          </>
        )}
      </div>
      <p className="text-gray-600 text-xs text-center">
        Position face inside the oval, then click Capture Face
      </p>
    </div>
  );
}
