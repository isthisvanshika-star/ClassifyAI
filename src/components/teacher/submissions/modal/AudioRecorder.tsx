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
    <div className="w-full bg-slate-800/80 border border-white/10 p-4 rounded-xl flex flex-col items-center justify-center gap-4 transition-all">
      {!audioUrl ? (
        <>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isRecording
                ? "bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse"
                : "bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600 hover:text-white"
            }`}
          >
            {isRecording ? (
              <Square size={24} fill="currentColor" />
            ) : (
              <Mic size={28} />
            )}
          </button>
          <div className="text-center">
            <p
              className={`text-sm font-medium ${isRecording ? "text-red-400" : "text-gray-400"}`}
            >
              {isRecording
                ? `Recording: ${formatTime(recordingTime)}`
                : "Click to record voice note"}
            </p>
            {!isRecording && (
              <p className="text-xs text-gray-500 mt-1">
                Make sure your mic is allowed
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="w-full flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-white/5">
          <audio
            src={audioUrl}
            controls
            className="h-10 w-full rounded outline-none"
          />
          <button
            onClick={deleteRecording}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Delete recording"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
