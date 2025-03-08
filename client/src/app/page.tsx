"use client";

import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useActiveAccount } from "thirdweb/react";
import HomeAgentView from "@/components/core/agents-view-home";
import axios from "axios";
import { useEffect, useState } from "react";
import { DB_ENDPOINT } from "@/constants";

export default function AgentsPage() {
  const account = useActiveAccount();
  const [agents, setAgents] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  const handleAccountAgents = async () => {
    try {
      const { data } = await axios.get(
        `${DB_ENDPOINT}/agent/get-agents/${account?.address}`
      );

      if (data.success) {
        // console.log(data.data);
        setAgents(data.data);
        setLoaded(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (account && !loaded) {
      handleAccountAgents();
    }
  }, [account]);

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white font-inter flex flex-col">
      {/* Top Section - Logo, Text, and Grid */}
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Oval-shaped grid */}
          <div className="w-[90%] h-[80%] bg-[linear-gradient(to_right,#4f4f4f40_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f40_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)]" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24">
              <Image
                src="/logo.png"
                alt="Axicov Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-7xl font-bold tracking-tight">
              <span className="text-white">Axicov</span>
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl text-center opacity-70">
            Empowering your digital experience with intelligent automation
          </p>
        </div>
      </div>

      <Separator className="bg-gray-700 mx-auto w-full max-w-5xl" />

      {/* Bottom Section - Content */}

      <HomeAgentView agents={agents} />
    </div>
  );
}
