"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, CameraOff, ScanFace, CheckCircle, Clock, MonitorPlay } from "lucide-react";
import { supabase } from "@/lib/supabase";

type LogEntry = {
  id: number;
  name: string;
  status: "Present" | "Late";
  time: string;
  confidence: number;
};

const MOCK_NAMES = [
  "Juan D. Santos", "Maria R. Cruz", "Carlo M. Reyes",
  "Ana P. Lim", "Jose B. Garcia", "Liza T. Ramos",
];

function getTime() {
  return new Date().toLocaleTimeString("en-PH", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function drawSimulatedFeed(canvas: HTMLCanvasElement, frame: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0d1f38");
  bg.addColorStop(1, "#0a1628");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = "rgba(201,168,76,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  // Face silhouette
  const cx = w / 2 + Math.sin(frame * 0.01) * 4;
  const cy = h * 0.42 + Math.sin(frame * 0.008) * 3;
  const headR = h * 0.22;

  // Shoulders
  ctx.beginPath();
  ctx.ellipse(cx, cy + headR * 1.9, headR * 1.5, headR * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(26,47,78,0.9)";
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.ellipse(cx, cy, headR * 0.85, headR, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(30,55,90,0.95)";
  ctx.fill();

  // Eyes
  [-headR * 0.3, headR * 0.3].forEach((ox) => {
    ctx.beginPath();
    ctx.ellipse(cx + ox, cy - headR * 0.1, headR * 0.1, headR * 0.07, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(201,168,76,0.6)";
    ctx.fill();
  });

  // Sweep line
  const scanY = (frame * 2) % h;
  const sg = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
  sg.addColorStop(0, "rgba(201,168,76,0)");
  sg.addColorStop(0.5, "rgba(201,168,76,0.08)");
  sg.addColorStop(1, "rgba(201,168,76,0)");
  ctx.fillStyle = sg;
  ctx.fillRect(0, scanY - 20, w, 40);

  // Timestamp
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(8, h - 28, 165, 20);
  ctx.fillStyle = "rgba(201,168,76,0.8)";
  ctx.font = "11px monospace";
  ctx.fillText(`SIM · ${getTime()}`, 14, h - 14);
}

export default function LiveCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [mode, setMode] = useState<"idle" | "live" | "sim">("idle");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [boxPos, setBoxPos] = useState({ x: 0.25, y: 0.12, w: 0.5, h: 0.7 });

  const animateBox = useCallback(() => {
    setBoxPos((p) => ({
      x: Math.max(0.1, Math.min(0.4, p.x + (Math.random() - 0.5) * 0.004)),
      y: Math.max(0.05, Math.min(0.2, p.y + (Math.random() - 0.5) * 0.004)),
      w: Math.max(0.4, Math.min(0.6, p.w + (Math.random() - 0.5) * 0.002)),
      h: Math.max(0.6, Math.min(0.8, p.h + (Math.random() - 0.5) * 0.002)),
    }));
  }, []);

  // Simulated canvas loop
  const runSimLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawSimulatedFeed(canvas, frameRef.current++);
    animateBox();
    rafRef.current = requestAnimationFrame(runSimLoop);
  }, [animateBox]);

  // Real camera box animation loop
  const runLiveLoop = useCallback(() => {
    animateBox();
    rafRef.current = requestAnimationFrame(runLiveLoop);
  }, [animateBox]);

  const startDetectionCycle = useCallback(() => {
    scanTimerRef.current = setInterval(() => {
      setScanning(true);
      setTimeout(async () => {
        const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
        const confidence = Math.floor(Math.random() * 5) + 95;
        const status: "Present" | "Late" = Math.random() > 0.2 ? "Present" : "Late";

        // Map mock names to student IDs for DB logging
        const studentIdMap: Record<string, string> = {
          "Juan D. Santos":  "2021-0001",
          "Maria R. Cruz":   "2021-0002",
          "Carlo M. Reyes":  "2021-0003",
          "Ana P. Lim":      "2021-0004",
          "Jose B. Garcia":  "2021-0005",
          "Liza T. Ramos":   "2021-0006",
        };
        const studentId = studentIdMap[name] ?? "2021-0001";

        // Log to Supabase (fire and forget)
        supabase.from("attendance_logs").insert({
          student_id: studentId,
          status,
          confidence,
          subject: "Demo Session",
        }).then(({ error }) => { if (error) console.warn("Log error:", error.message); });

        setDetected(name);
        setLog((prev) => [
          { id: Date.now(), name, status, time: getTime(), confidence },
          ...prev.slice(0, 4),
        ]);
        setTimeout(() => { setDetected(null); setScanning(false); }, 2000);
      }, 800);
    }, 4000);
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    cancelAnimationFrame(rafRef.current);
    setMode("idle");
    setScanning(false);
    setDetected(null);
    setError(null);
  }, []);

  const startLive = async () => {
    setError(null);
    const attempts: MediaStreamConstraints[] = [
      { video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } },
      { video: { width: { ideal: 640 } } },
      { video: true },
    ];
    let stream: MediaStream | null = null;
    let lastErr: unknown = null;
    for (const c of attempts) {
      try { stream = await navigator.mediaDevices.getUserMedia(c); break; }
      catch (e) {
        lastErr = e;
        if (e instanceof DOMException && e.name === "NotAllowedError") break;
      }
    }
    if (!stream) {
      const e = lastErr as DOMException;
      if (e?.name === "NotAllowedError") setError("Permission denied — please allow camera access in browser settings.");
      else if (e?.name === "NotReadableError") setError("Camera is locked by another app. Use Simulation Mode instead.");
      else if (e?.name === "NotFoundError") setError("No camera found. Use Simulation Mode instead.");
      else setError(`Camera error: ${e?.message ?? "unknown"}. Use Simulation Mode instead.`);
      return;
    }
    streamRef.current = stream;
    if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
    setMode("live");
    rafRef.current = requestAnimationFrame(runLiveLoop);
    startDetectionCycle();
  };

  const startSim = useCallback(() => {
    setError(null);
    const canvas = canvasRef.current;
    if (canvas) { canvas.width = 640; canvas.height = 360; }
    setMode("sim");
    rafRef.current = requestAnimationFrame(runSimLoop);
    startDetectionCycle();
  }, [runSimLoop, startDetectionCycle]);

  useEffect(() => () => stop(), [stop]);

  const active = mode === "live" || mode === "sim";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Feed panel */}
      <div className="lg:col-span-2">
        <div className="relative bg-[#0a1628] rounded-2xl overflow-hidden aspect-video flex items-center justify-center">

          {/* Real camera video */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${mode === "live" ? "block" : "hidden"}`}
            muted playsInline
          />

          {/* Simulated canvas feed */}
          <canvas
            ref={canvasRef}
            className={`w-full h-full object-cover ${mode === "sim" ? "block" : "hidden"}`}
          />

          {/* Idle */}
          {mode === "idle" && !error && (
            <div className="flex flex-col items-center gap-4 text-center px-8">
              <div className="w-20 h-20 rounded-full bg-[#1a2f4e] flex items-center justify-center">
                <Camera size={36} className="text-[#c9a84c]" />
              </div>
              <p className="text-gray-400 text-sm">Camera is off. Choose a mode below to begin.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center gap-4 text-center px-8">
              <CameraOff size={32} className="text-red-400" />
              <p className="text-red-400 text-sm leading-relaxed max-w-xs">{error}</p>
              <button
                onClick={startSim}
                className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0a1628] font-bold px-4 py-2 rounded-lg text-sm"
              >
                <MonitorPlay size={14} /> Launch Simulation Mode
              </button>
            </div>
          )}

          {/* Detection overlay */}
          {active && (
            <>
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${boxPos.x * 100}%`,
                  top: `${boxPos.y * 100}%`,
                  width: `${boxPos.w * 100}%`,
                  height: `${boxPos.h * 100}%`,
                }}
              >
                <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#c9a84c]" />
                <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#c9a84c]" />
                <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#c9a84c]" />
                <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#c9a84c]" />

                {scanning && (
                  <div className="absolute inset-x-0 h-0.5 bg-[#c9a84c]/80 animate-scanline" />
                )}

                {detected && (
                  <div className="absolute -bottom-9 left-0 right-0 flex justify-center">
                    <span className="bg-[#c9a84c] text-[#0a1628] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                      <CheckCircle size={12} /> {detected}
                    </span>
                  </div>
                )}
              </div>

              {/* LIVE / SIM badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className={`w-2 h-2 rounded-full animate-pulse ${mode === "live" ? "bg-green-400" : "bg-[#c9a84c]"}`} />
                <span className={mode === "live" ? "text-green-400" : "text-[#c9a84c]"}>
                  {mode === "live" ? "LIVE" : "SIMULATION"}
                </span>
              </div>

              {scanning && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-[#c9a84c] text-xs font-semibold px-3 py-1.5 rounded-full">
                  <ScanFace size={12} className="animate-pulse" /> Scanning...
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mt-4 items-center">
          {!active ? (
            <>
              <button
                onClick={startLive}
                className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0a1628] font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                <Camera size={16} /> Use Live Camera
              </button>
              <button
                onClick={startSim}
                className="flex items-center gap-2 bg-[#1a2f4e] hover:bg-[#243d5e] text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors border border-[#c9a84c]/30"
              >
                <MonitorPlay size={16} /> Simulation Mode
              </button>
            </>
          ) : (
            <button
              onClick={stop}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              <CameraOff size={16} /> Stop
            </button>
          )}
          <span className="text-gray-500 text-xs">Detection every ~4s</span>
        </div>
      </div>

      {/* Log panel */}
      <div className="bg-[#0a1628] rounded-2xl p-5 flex flex-col min-h-[300px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">Attendance Log</h3>
          <Clock size={14} className="text-gray-500" />
        </div>

        {log.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-xs text-center px-4">
            No detections yet. Start the camera or simulation to begin.
          </div>
        ) : (
          <ul className="space-y-3">
            {log.map((entry) => (
              <li key={entry.id} className="bg-[#1a2f4e] rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-white text-sm font-medium">{entry.name}</div>
                  <div className="text-gray-500 text-xs">{entry.time} · {entry.confidence}% match</div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  entry.status === "Present" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                }`}>
                  {entry.status}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-4 border-t border-[#1a2f4e] text-xs text-gray-600 text-center">
          Names are simulated for demo purposes
        </div>
      </div>
    </div>
  );
}
