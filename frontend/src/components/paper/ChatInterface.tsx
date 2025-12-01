"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface ChatInterfaceProps {
  paperId: string;
}

export default function ChatInterface({ paperId }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create chat session when component mounts
    const initChat = async () => {
      try {
        const response = await api.createChatSession(paperId);
        setChatId(response.chatId);
      } catch (error) {
        console.error("Failed to create chat session:", error);
      }
    };

    initChat();
  }, [paperId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!input.trim() || !chatId) return;

    const message = input.trim();
    setChat((prev) => [...prev, { sender: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.sendChatMessage(chatId, message);
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: response.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md border rounded-xl p-4 flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Chat with Paper</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 h-[400px] overflow-y-auto border p-3 rounded-lg bg-gray-50">
        {chat.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full text-gray-400">
            Ask me anything about this paper...
          </div>
        )}

        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg max-w-[85%] ${
              msg.sender === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-white text-black mr-auto shadow-sm border"
            }`}
          >
            <p className="text-sm leading-relaxed">{msg.text}</p>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-700 mr-auto">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </CardContent>

      <div className="flex gap-2 mt-3">
        <input
          className="border px-3 py-2 flex-1 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask something about the paper..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading || !chatId}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !chatId || !input.trim()}
          className="bg-blue-600 text-white px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}