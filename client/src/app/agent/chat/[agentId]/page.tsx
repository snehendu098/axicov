"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

type MessageType =
  | { type: "user"; message: string; timestamp: number }
  | { type: "agent"; message: string; toolCalls: string[]; timestamp: number }
  | { type: "tool"; message: string; timestamp: number };

const dummyResponses = [
  "That's an interesting point. Can you tell me more about it?",
  "I understand. Let me think about that for a moment.",
  "Thank you for sharing that information. It's quite helpful.",
  "That's a great question. The answer might be more complex than it seems at first.",
  "I see where you're coming from. Have you considered looking at it from this perspective?",
];

const dummyTools = ["BLOCKCHAIN", "DATABASE", "API"];

export default function ChatPage() {
  const { agentId } = useParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [scrollAreaRef]); //Corrected dependency

  const appendMessage = (newMessage: MessageType) => {
    setMessages((prev) => {
      const updatedMessages = [...prev, newMessage];

      // If the new message is an agent message, embed tool calls
      if (newMessage.type === "agent") {
        const toolCalls = updatedMessages
          .filter((msg) => msg.type === "tool")
          .map((msg) => msg.message);
        return updatedMessages.map((msg) =>
          msg === newMessage ? { ...msg, toolCalls } : msg
        );
      }

      // If the new message is a tool message, remove previous tool messages
      if (newMessage.type === "tool") {
        return updatedMessages.filter(
          (msg, index) =>
            msg.type !== "tool" || index === updatedMessages.length - 1
        );
      }

      return updatedMessages;
    });
  };

  const simulateSSE = (userMessage: string) => {
    setIsLoading(true);
    const toolCount = Math.floor(Math.random() * 3) + 1;
    const tools = Array.from(
      { length: toolCount },
      () => dummyTools[Math.floor(Math.random() * dummyTools.length)]
    );

    const processNextTool = (index: number) => {
      if (index < tools.length) {
        const tool = tools[index];
        setCurrentTool(tool);

        setTimeout(() => {
          const toolMessage: MessageType = {
            type: "tool",
            message: `${tool} processing completed`,
            timestamp: Date.now(),
          };
          appendMessage(toolMessage);
          setCurrentTool(null);

          setTimeout(() => processNextTool(index + 1), 500);
        }, 2000);
      } else {
        setTimeout(() => {
          const agentMessage: MessageType = {
            type: "agent",
            message:
              dummyResponses[Math.floor(Math.random() * dummyResponses.length)],
            toolCalls: [],
            timestamp: Date.now(),
          };
          appendMessage(agentMessage);
          setIsLoading(false);
        }, 2000);
      }
    };

    processNextTool(0);
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      const userMessage: MessageType = {
        type: "user",
        message: input,
        timestamp: Date.now(),
      };
      appendMessage(userMessage);
      setInput("");
      simulateSSE(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1c1c1c] text-[#ffffff] relative">
      <div
        className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"
        aria-hidden="true"
      ></div>
      <header className="p-2 border-b border-[#2a2a2a] shrink-0 relative z-10">
        <h1 className="text-lg font-medium">Grifain</h1>
      </header>

      <ScrollArea className="flex-1 relative z-10" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto w-full p-4 space-y-4">
          {messages.map((msg, index) => (
            <MessageBubble
              key={index}
              message={msg}
              isLastMessage={index === messages.length - 1}
            />
          ))}
          {currentTool && (
            <div className="flex justify-start items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing {currentTool}...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-[#2a2a2a] shrink-0 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="w-full bg-[#2a2a2a] text-[#ffffff] p-4 rounded-lg resize-none outline-none min-h-[100px]"
            rows={4}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            className="bg-[#e11d48] text-white px-6 py-2 rounded-lg font-medium self-end disabled:opacity-50"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const MessageBubble: React.FC<{
  message: MessageType;
  isLastMessage: boolean;
}> = ({ message, isLastMessage }) => {
  switch (message.type) {
    case "user":
      return (
        <div className="flex justify-end">
          <div className="bg-[#e11d48] text-white p-4 rounded-xl max-w-[80%]">
            <p className="break-words">{message.message}</p>
          </div>
        </div>
      );
    case "agent":
      return (
        <div className="flex justify-start">
          <div className="bg-[#2a2a2a] text-white p-4 rounded-xl max-w-[80%]">
            <p className="break-words">{message.message}</p>
            {message.toolCalls.length > 0 && (
              <div className="mt-2 text-sm text-gray-400">
                <p>Tool calls:</p>
                <ul className="list-disc list-inside">
                  {message.toolCalls.map((tool, index) => (
                    <li key={index}>{tool}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    case "tool":
      return (
        <div
          className={`flex justify-start items-center space-x-2 ${
            isLastMessage ? "animate-pulse" : ""
          }`}
        >
          <span className="text-sm">{message.message}</span>
        </div>
      );
  }
};
