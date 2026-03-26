"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Camera, CameraOff, ScanFace, CheckCircle,
  Clock, Search, UserCheck, Save, X, MonitorPlay
} from "lucide-react";
import toast from "react-hot-toast";
import type { Database } from "@/lib/database.types";

type Student = Database["public"]["Tables"]["students"]["Row"];
type Status  = "Present" | "Late" | "Absent";

type ScannedEntry = {
  id: string;
  student: Student;
  status: Status;
  time: string;
  saved: boolean;
};

const SUBJECTS = [
  "Marine Engineering", "Ship Operations", "Data Structures",
  "Web Development", "Circuit Theory", "Ship Stability",
  "Navigation", "Marine Electrical", "Programming", "Mathematics",
];

function drawFeed(canvas: HTMLCanvasElement, frame: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0d1f38"); bg.addColorStop(1, "#0a1628");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(201,168,76,0.05)"; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
  const cx = w/2 + Math.sin(frame*0.01)*4, cy = h*0.42 + Math.sin(frame*0.008)*3, r = h*0.22;
  ctx.beginPath(); ctx.ellipse(cx, cy+r*1.9, r*1.5, r*0.7, 0, 0, Math.PI*2);
  ctx.fillStyle = "rgba(26,47,78,0.9)"; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, cy, r*0.85, r, 0, 0, Math.PI*2);
  ctx.fillStyle = "rgba(30,55,90,0.95)"; ctx.fill();
  [-r*0.3, r*0.3].forEach(ox => {
    ctx.beginPath(); ctx.ellipse(cx+ox, cy-r*0.1, r*0.1, r*0.07, 0, 0, Math.PI*2);
    ctx.fillStyle = "rgba(201,168,76,0.6)"; ctx.fill();
  });
  const sy = (frame*2) % h;
  const sg = ctx.createLinearGradient(0, sy-20, 0, sy+20);
  sg.addColorStop(0,"rgba(201,168,76,0)");
  sg.addColorStop(0.5,"rgba(201,168,76,0.1)");
  sg.addColorStop(1,"rgba(201,168,76,0)");
  ctx.fillStyle = sg; ctx.fillRect(0, sy-20, w, 40);
  ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(8, h-28, 165, 20);
  ctx.fillStyle = "rgba(201,168,76,0.8)"; ctx.font = "11px monospace";
  ctx.fillText(`CAM · ${new Date().toLocaleTimeString("en-PH")}`, 14, h-14);
}

export default function CameraScanner({ students }: { students: Student[] }) {
  const supabase  = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number>(0);
  const frameRef  = useRef<number>(0);
  const scanTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [mode, setMode]         = useState<"idle"|"live"|"sim">("idle");
  const [camError, setCamError] = useState<string|null>(null);
  const [subject, setSubject]   = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<Student|null>(null);
  const [scanned, setScanned]   = useState<ScannedEntry[]>([]);
  const [search, setSearch]     = useState("");
  const [manualStudent, setManualStudent] = useState<Student|null>(null);
  const [manualStatus, setManualStatus]   = useState<Status>("Present");
  const [boxPos, setBoxPos]     = useState({ x:0.25, y:0.12, w:0.5, h:0.7 });
  const [savingAll, setSavingAll] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const active = mode === "live" || mode === "sim";
  const finalSubject = customSubject.trim() || subject;

  const animBox = useCallback(() => {
    setBoxPos(p => ({
      x: Math.max(0.1, Math.min(0.4, p.x+(Math.random()-0.5)*0.004)),
      y: Math.max(0.05, Math.min(0.2, p.y+(Math.random()-0.5)*0.004)),
      w: Math.max(0.4, Math.min(0.6, p.w+(Math.random()-0.5)*0.002)),
      h: Math.max(0.6, Math.min(0.8, p.h+(Math.random()-0.5)*0.002)),
    }));
  }, []);

  const simLoop = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    drawFeed(c, frameRef.current++);
    animBox();
    rafRef.current = requestAnimationFrame(simLoop);
  }, [animBox]);

  const liveLoop = useCallback(() => {
    animBox();
    rafRef.current = requestAnimationFrame(liveLoop);
  }, [animBox]);

  const pickRandom = useCallback(() => {
    const unscanned = students.filter(s => !scanned.find(e => e.student.id === s.id));
    if (unscanned.length === 0) return null;
    return unscanned[Math.floor(Math.random() * unscanned.length)];
  }, [students, scanned]);

  const startScanCycle = useCallback(() => {
    scanTimer.current = setInterval(() => {
      setScanning(true);
      setTimeout(() => {
        const student = pickRandom();
        if (student) {
          const status: Status = Math.random() > 0.8 ? "Late" : "Present";
          const entry: ScannedEntry = {
            id: `${student.id}-${Date.now()}`,
            student,
            status,
            time: new Date().toLocaleTimeString("en-PH", { hour:"2-digit", minute:"2-digit", second:"2-digit" }),
            saved: false,
          };
          setDetected(student);
          setScanned(prev => [entry, ...prev]);
          toast.success(`${student.name} — ${status}`, { duration: 2000 });
          setTimeout(() => { setDetected(null); setScanning(false); }, 2000);
        } else {
          setScanning(false);
        }
      }, 800);
    }, 4000);
  }, [pickRandom]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (scanTimer.current) clearInterval(scanTimer.current);
    cancelAnimationFrame(rafRef.current);
    setMode("idle");
    setScanning(false);
    setDetected(null);
    setCamError(null);
  }, []);

  const startLive = async () => {
    setCamError(null);
    const attempts: MediaStreamConstraints[] = [
      { video: { facingMode:"user", width:{ideal:640}, height:{ideal:480} } },
      { video: { width:{ideal:640} } },
      { video: true },
    ];
    let stream: MediaStream | null = null;
    let lastErr: unknown = null;
    for (const c of attempts) {
      try { stream = await navigator.mediaDevices.getUserMedia(c); break; }
      catch (e) { lastErr = e; if (e instanceof DOMException && e.name === "NotAllowedError") break; }
    }
    if (!stream) {
      const e = lastErr as DOMException;
      if (e?.name === "NotAllowedError") setCamError("Camera permission denied.");
      else if (e?.name === "NotReadableError") setCamError("Camera in use by another app. Use Simulation instead.");
      else setCamError("Camera unavailable. Use Simulation instead.");
      return;
    }
    streamRef.current = stream;
    if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
    setMode("live");
    rafRef.current = requestAnimationFrame(liveLoop);
    startScanCycle();
  };

  const startSim = useCallback(() => {
    setCamError(null);
    const c = canvasRef.current;
    if (c) { c.width = 640; c.height = 360; }
    setMode("sim");
    rafRef.current = requestAnimationFrame(simLoop);
    startScanCycle();
  }, [simLoop, startScanCycle]);

  useEffect(() => () => stop(), [stop]);

  // Remove a scanned entry
  const removeEntry = (id: string) => setScanned(prev => prev.filter(e => e.id !== id));

  // Change status of a scanned entry
  const changeStatus = (id: string, status: Status) =>
    setScanned(prev => prev.map(e => e.id === id ? { ...e, status } : e));

  // Add manual entry
  const addManual = () => {
    if (!manualStudent) { toast.error("Select a student."); return; }
    if (scanned.find(e => e.student.id === manualStudent.id)) {
      toast.error("Student already in list."); return;
    }
    const entry: ScannedEntry = {
      id: `${manualStudent.id}-manual-${Date.now()}`,
      student: manualStudent,
      status: manualStatus,
      time: new Date().toLocaleTimeString("en-PH", { hour:"2-digit", minute:"2-digit", second:"2-digit" }),
      saved: false,
    };
    setScanned(prev => [entry, ...prev]);
    setManualStudent(null);
    setShowManual(false);
    toast.success(`${manualStudent.name} added manually.`);
  };

  // Save all to Supabase
  const saveAll = async () => {
    if (!finalSubject) { toast.error("Please select a subject first."); return; }
    if (scanned.length === 0) { toast.error("No attendance entries to save."); return; }
    setSavingAll(true);
    const rows = scanned.map(e => ({
      student_id: e.student.student_id,
      status:     e.status as "Present" | "Late" | "Absent",
      confidence: mode === "live" ? 97 : mode === "sim" ? 95 : 0,
      subject:    finalSubject,
    }));
    const { error } = await supabase.from("attendance_logs").insert(rows);
    setSavingAll(false);
    if (error) { toast.error("Save failed: " + error.message); return; }
    setScanned(prev => prev.map(e => ({ ...e, saved: true })));
    toast.success(`${rows.length} attendance records saved.`);
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_STYLES: Record<Status, string> = {
    Present: "bg-green-500/10 text-green-400 border-green-500/30",
    Late:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    Absent:  "bg-red-500/10 text-red-400 border-red-500/30",
  };

  return (
    <div className="space-y-5">
      {/* Subject selector */}
      <div className="bg-[#1a2f4e] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Session Subject</h3>
        <div className="flex flex-wrap gap-3">
          <select value={subject} onChange={e => { setSubject(e.target.value); setCustomSubject(""); }}
            className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c] min-w-[220px]">
            <option value="">Select subject...</option>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            <option value="__custom">+ Custom subject</option>
          </select>
          {subject === "__custom" && (
            <input value={customSubject} onChange={e => setCustomSubject(e.target.value)}
              className="bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c] flex-1 min-w-[180px]"
              placeholder="Enter subject name" />
          )}
          {finalSubject && (
            <span className="flex items-center gap-1.5 bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/30 px-3 py-2 rounded-lg text-sm font-medium">
              <CheckCircle size={14} /> {finalSubject}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Camera feed */}
        <div className="lg:col-span-3 space-y-3">
          <div className="relative bg-[#0a1628] rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
            <video ref={videoRef} className={`w-full h-full object-cover ${mode==="live" ? "block":"hidden"}`} muted playsInline />
            <canvas ref={canvasRef} className={`w-full h-full object-cover ${mode==="sim" ? "block":"hidden"}`} />

            {mode === "idle" && !camError && (
              <div className="flex flex-col items-center gap-3 text-center px-8">
                <div className="w-16 h-16 rounded-full bg-[#1a2f4e] flex items-center justify-center">
                  <Camera size={28} className="text-[#c9a84c]" />
                </div>
                <p className="text-gray-400 text-sm">Start camera or simulation to begin scanning.</p>
              </div>
            )}

            {camError && (
              <div className="flex flex-col items-center gap-3 text-center px-8">
                <CameraOff size={28} className="text-red-400" />
                <p className="text-red-400 text-sm">{camError}</p>
                <button onClick={startSim}
                  className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0a1628] font-bold px-4 py-2 rounded-lg text-sm">
                  <MonitorPlay size={14} /> Use Simulation
                </button>
              </div>
            )}

            {active && (
              <>
                {/* Detection box */}
                <div className="absolute pointer-events-none"
                  style={{ left:`${boxPos.x*100}%`, top:`${boxPos.y*100}%`, width:`${boxPos.w*100}%`, height:`${boxPos.h*100}%` }}>
                  <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#c9a84c]" />
                  <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#c9a84c]" />
                  <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#c9a84c]" />
                  <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#c9a84c]" />
                  {scanning && <div className="absolute inset-x-0 h-0.5 bg-[#c9a84c]/80 animate-scanline" />}
                  {detected && (
                    <div className="absolute -bottom-9 left-0 right-0 flex justify-center">
                      <span className="bg-[#c9a84c] text-[#0a1628] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                        <CheckCircle size={12} /> {detected.name}
                      </span>
                    </div>
                  )}
                </div>
                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${mode==="live" ? "bg-green-400":"bg-[#c9a84c]"}`} />
                  <span className={mode==="live" ? "text-green-400":"text-[#c9a84c]"}>{mode==="live" ? "LIVE":"SIMULATION"}</span>
                </div>
                {scanning && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-[#c9a84c] text-xs font-semibold px-3 py-1.5 rounded-full">
                    <ScanFace size={12} className="animate-pulse" /> Scanning...
                  </div>
                )}
              </>
            )}
          </div>

          {/* Camera controls */}
          <div className="flex flex-wrap gap-2 items-center">
            {!active ? (
              <>
                <button onClick={startLive}
                  className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0a1628] font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                  <Camera size={15} /> Live Camera
                </button>
                <button onClick={startSim}
                  className="flex items-center gap-2 bg-[#1a2f4e] hover:bg-[#243d5e] text-white border border-white/10 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                  <MonitorPlay size={15} /> Simulation
                </button>
              </>
            ) : (
              <button onClick={stop}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                <CameraOff size={15} /> Stop
              </button>
            )}
            <span className="text-gray-600 text-xs ml-1">Detects every ~4s</span>
          </div>
        </div>

        {/* Scanned list */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <UserCheck size={16} className="text-[#c9a84c]" />
              Scanned ({scanned.length})
            </h3>
            <button onClick={() => setShowManual(true)}
              className="flex items-center gap-1.5 text-xs text-[#c9a84c] hover:text-[#e8c96a] border border-[#c9a84c]/30 px-2.5 py-1.5 rounded-lg transition-colors">
              + Manual
            </button>
          </div>

          {/* Manual add modal */}
          {showManual && (
            <div className="bg-[#0a1628] border border-[#c9a84c]/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white text-xs font-semibold">Add Manually</span>
                <button onClick={() => setShowManual(false)} className="text-gray-500 hover:text-white"><X size={14} /></button>
              </div>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#1a2f4e] border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white text-xs focus:outline-none focus:border-[#c9a84c]"
                  placeholder="Search student..." />
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {filteredStudents.slice(0, 10).map(s => (
                  <button key={s.id} onClick={() => setManualStudent(s)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      manualStudent?.id === s.id ? "bg-[#c9a84c]/20 text-[#c9a84c]" : "text-gray-300 hover:bg-white/5"
                    }`}>
                    {s.name} <span className="text-gray-500">· {s.department}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {(["Present","Late","Absent"] as Status[]).map(st => (
                  <button key={st} onClick={() => setManualStatus(st)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      manualStatus === st ? STATUS_STYLES[st] : "border-white/10 text-gray-600"
                    }`}>{st}</button>
                ))}
              </div>
              <button onClick={addManual}
                className="w-full bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0a1628] font-bold py-2 rounded-lg text-xs transition-colors">
                Add Entry
              </button>
            </div>
          )}

          {/* Scanned entries */}
          <div className="flex-1 space-y-2 max-h-80 overflow-y-auto pr-1">
            {scanned.length === 0 ? (
              <div className="bg-[#1a2f4e] border border-white/5 rounded-xl p-6 text-center text-gray-600 text-xs">
                No students scanned yet.
              </div>
            ) : scanned.map(e => (
              <div key={e.id} className={`bg-[#1a2f4e] border rounded-xl px-4 py-3 flex items-center justify-between gap-2 ${
                e.saved ? "border-green-500/20" : "border-white/5"
              }`}>
                <div className="min-w-0">
                  <div className="text-white text-xs font-semibold truncate">{e.student.name}</div>
                  <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {e.time} · {e.student.department}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <select value={e.status} onChange={ev => changeStatus(e.id, ev.target.value as Status)}
                    disabled={e.saved}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg border bg-transparent focus:outline-none ${STATUS_STYLES[e.status]} disabled:opacity-60`}>
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                  </select>
                  {!e.saved && (
                    <button onClick={() => removeEntry(e.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <X size={13} />
                    </button>
                  )}
                  {e.saved && <CheckCircle size={13} className="text-green-400" />}
                </div>
              </div>
            ))}
          </div>

          {/* Save button */}
          <button onClick={saveAll} disabled={savingAll || scanned.length === 0 || scanned.every(e => e.saved)}
            className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] disabled:opacity-50 text-[#0a1628] font-bold py-3 rounded-xl text-sm transition-colors">
            {savingAll ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <><Save size={16} /> Save {scanned.filter(e => !e.saved).length} Records to Database</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
