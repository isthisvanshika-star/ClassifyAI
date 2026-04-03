"use client";
import { AudioRecorderProps } from "@/lib/types";
import { Mic, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AudioRecorder({ onAudioReady }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    return () => {
      if (timeRef.current) clearInterval(timeRef.current);
    };
  }, []);
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onAudioReady(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timeRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Please allow microphone access to record feedback.");
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
      if (timeRef.current) clearInterval(timeRef.current);
    }
  };
  const deleteRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    onAudioReady(null);
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };
  return (
    <div
      className="w-full max-w-md mx-auto  mb-3
      bg-gradient-to-br from-[#0f172a]/80 via-[#0b1120]/80 to-[#020617]/80 
      backdrop-blur-xl border border-white/10 
      shadow-xl shadow-cyan-500/10
      p-6 rounded-2xl flex flex-col items-center gap-5 transition-all"
    >
      {!audioUrl ? (
        <>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300${
              isRecording
                ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/20 animate-pulse"
                : "bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-blue-500/20  text-cyan-400 border border-cyan-400/30 hover:scale-105 hover:shadow-cyan-500/30 hover:text-white"
            }`}
          >
            <div className="absolute inset-0 rounded-full blur-xl opacity-30 bg-cyan-500"></div>

            {isRecording ? (
              <Square size={26} fill="currentColor" />
            ) : (
              <Mic size={30} />
            )}
          </button>
          <div className="text-center space-y-1">
            <p
              className={`text-sm font-semibold tracking-wide ${
                isRecording ? "text-red-400" : "text-gray-300"
              }`}
            >
              {isRecording
                ? `Recording • ${formatTime(recordingTime)}`
                : "Start Voice Recording"}
            </p>

            {!isRecording && (
              <p className="text-xs text-gray-500">
                Tap mic & ensure permissions are enabled
              </p>
            )}
          </div>
        </>
      ) : (
        <div
          className="w-full flex items-center gap-3 
          bg-white/5 backdrop-blur-lg 
          p-3 rounded-xl border border-white/10 
          shadow-inner"
        >
          <audio
            src={audioUrl}
            controls
            className="h-10 w-full rounded outline-none opacity-90"
          />

          <button
            onClick={deleteRecording}
            className="p-2 rounded-lg 
              text-gray-400 
              hover:text-red-400 
              hover:bg-red-500/10 
              transition-all duration-200"
            title="Delete recording"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
