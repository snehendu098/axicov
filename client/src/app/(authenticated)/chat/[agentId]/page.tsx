"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import { AGENT_ENDPOINT, DB_ENDPOINT } from "@/constants";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { CopyIcon, Loader } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { shortenAddress } from "@/helpers";
import { toast } from "sonner";
import { client } from "@/lib/client";
import { defineChain } from "thirdweb";

type MessageType = {
  type: "user" | "agent";
  body: string;
  _id?: string;
};

const dummyResponses = [
  "That's an interesting point. Can you tell me more about it?",
  "I understand. Let me think about that for a moment.",
  "Thank you for sharing that information. It's quite helpful.",
  "That's a great question. The answer might be more complex than it seems at first.",
  "I see where you're coming from. Have you considered looking at it from this perspective?",
];

export default function ChatPage() {
  const { agentId } = useParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const account = useActiveAccount();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [agentName, setAgentName] = useState<string>("");
  const lastRef = useRef<HTMLDivElement>(null);
  const [pubKey, setPubKey] = useState<any>("");
  const balance = useWalletBalance({
    client: client,
    address: pubKey,
    chain: defineChain(57054),
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }

    lastRef.current?.scrollIntoView();
  }, [messages]); //Corrected dependency

  const getAllResponses = async () => {
    try {
      const { data } = await axios.get(
        `${DB_ENDPOINT}/events/get-messages/${agentId}/${account?.address}`
      );

      console.log("getAllResponses", data);

      if (data.success) {
        setMessages(data.data as MessageType[]);
        setAgentName(data.agentName);
        await initAgent();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const initAgent = async () => {
    try {
      const { data } = await axios.post(`${AGENT_ENDPOINT}/agent/init`, {
        threadId: agentId,
        params: {},
      });
      console.log("initAgent", data);
      if (data.success) {
        setPubKey(data.publicKey);
        setIsInitialized(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (account && !isInitialized) {
      getAllResponses();
    }
  }, [account]);

  const simulateResponse = async (userMessage: string) => {
    setIsLoading(true);

    const { data } = await axios.post(
      `${AGENT_ENDPOINT}/agent/${agentId}/message`,
      {
        message: userMessage,
      }
    );

    setMessages((prev) => [...prev, data.data as MessageType]);
    setIsLoading(false);
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      const userMessage: MessageType = {
        type: "user",
        body: input,
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      simulateResponse(input);
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
      <header className="p-4 border-b border-[#2a2a2a] relative px-20 z-10 flex justify-between">
        <Link href={"/"}>
          <h1 className="text-lg font-medium">{agentName}</h1>
        </Link>

        {isInitialized && (
          <div className="flex items-center justify-center">
            <CopyIcon
              onClick={() => {
                navigator.clipboard.writeText(pubKey);
                toast("Copied to clipboard", {
                  description: "Public key copied to clipboard",
                });
              }}
              className="duration-500 text-gray-400 hover:text-gray-50 cursor-pointer"
            />{" "}
            <div className="p-1 mx-4 px-4 rounded-md bg-[#e11d48]/60 text-white group duration-500 flex items-center justify-center space-x-4">
              <p>{shortenAddress(pubKey)}</p>
            </div>
          </div>
        )}
      </header>

      <ScrollArea className="flex-1 relative z-10" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto w-full p-4 space-y-4">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
          {isLoading && (
            <div className=" text-white/60 flex items-center animate-pulse p-4 rounded-xl max-w-[80%]">
              <Loader className="animate-spin mr-2" />
              <p className="break-words">Processing</p>
            </div>
          )}
          <div ref={lastRef} />
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
            disabled={isLoading || !initAgent}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-[#e11d48] text-white px-6 py-2 rounded-lg font-medium self-end disabled:opacity-50"
            disabled={isLoading || !initAgent}
          >
            {!isLoading ? "Send" : <Loader className="animate-spin" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

const MessageBubble: React.FC<{ message: MessageType }> = ({ message }) => {
  switch (message.type) {
    case "user":
      return (
        <div className="flex justify-end">
          <div className="bg-[#e11d48] text-white p-4 rounded-xl max-w-[80%]">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{message.body}</ReactMarkdown>
            </div>
          </div>
        </div>
      );
    case "agent":
      return (
        <div className="flex justify-start">
          <div className="bg-[#2a2a2a] text-white p-4 rounded-xl max-w-[80%]">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{message.body}</ReactMarkdown>
            </div>
          </div>
        </div>
      );
  }
};
