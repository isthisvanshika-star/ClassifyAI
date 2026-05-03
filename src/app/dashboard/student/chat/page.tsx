"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, SendHorizonal } from "lucide-react";
import { Bot, UserRound } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
// import "highlight.js/styles/github-dark.css";re
import { useRouter } from "next/navigation";

const Page = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm here to help with your doubts." },
  ]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<"openai" | "claude">("openai");
  const [isBotTyping, setIsBotTyping] = useState(false);
const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);
  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsBotTyping(true);
    try {
      const res = await fetch(`/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, model }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong." },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen w-full px-4 py-6 text-white">
      <div className="flex-1 flex items-center justify-center w-full max-w-[95rem] mt-10 px-4">
        <div className="w-full h-[85vh] rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-4 flex flex-col justify-between chat-box-glow scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
          <div className="flex flex-col gap-1 items-center mb-4">
            <div className="flex gap-2">
            <Image src={"/only-logo.png"} alt="...." width={35} height={35}/>
            <p className="text-3xl">Chud<span className="text-cyan-500">AI</span></p>
            </div>
            <p className="text-sm">Cloud-Hosted Unethical Dataset Artificial Intelligence</p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 p-2 pr-2 scrollbar-thin scrollbar-thumb-cyan-500/30">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0 w-8 h-8">
                  <Image
                    src="/only-logo.png"
                    alt={msg.sender === "bot" ? "Bot" : "You"}
                    width={32}
                    height={32}
                    className="rounded-full border border-white/10 object-cover"
                  />
                  {msg.sender === "user" && (
                    <div className="absolute -bottom-1 -right-1 bg-cyan-600 rounded-full p-0.5">
                      <UserRound size={12} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Markdown content inside styled div */}
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-xl text-sm leading-relaxed overflow-x-auto ${
                    msg.sender === "user"
                      ? "bg-cyan-500/20 text-white border border-cyan-300/30"
                      : "bg-white/10 text-white border border-white/10"
                  }`}
                >
                  <div
                    className="prose prose-sm prose-invert max-w-none"
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isBotTyping && (
              <div className="flex items-start gap-3">
                <div className="relative shrink-0 w-8 h-8">
                  <Image
                    src="/only-logo.png"
                    alt="Bot"
                    width={32}
                    height={32}
                    className="rounded-full border border-white/10 object-cover"
                  />
                </div>

                <div className="max-w-[70%] px-4 py-2 rounded-xl text-sm bg-white/10 text-white border border-white/10">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input Area with styled model selector */}
          <div className="mt-4 flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-sm rounded-lg px-2 py-2">
            {/* Model selector */}
            <div className="relative">
              <select
                value={model}
                onChange={(e) =>
                  setModel(e.target.value as "openai" | "claude")
                }
                className="appearance-none bg-white/10 text-sm text-white px-3 py-1.5 pr-6 rounded-md border border-white/20 outline-none hover:bg-white/20 transition-colors"
              >
                <option className="text-black bg-white">GPT-3.5</option>
                <option className="text-black bg-white">Claude</option>
              </select>
            </div>

            {/* Text input */}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask your doubt..."
              className="flex-1 bg-transparent outline-none text-white placeholder-white/50 px-2"
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              className="text-cyan-300 hover:text-white transition-colors px-2"
            >
              <SendHorizonal size={20} />
            </button>
          </div>
        </div>
      </div>
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push("/dashboard/student")}
          className="flex items-center justify-center gap-2 rounded-full  text-white hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft size={40}/>
        </button>
      </div>
    </div>
  );
};

export default Page;
