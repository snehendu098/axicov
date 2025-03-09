"use client";
import { Heart, MessageCircle, Plus, Users, Wrench } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ConfiguredConnect } from "../thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { shortenAddress } from "@/helpers";

const HomeAgentView = ({ agents }: { agents: any[] }) => {
  const account = useActiveAccount();

  return (
    <>
      <div className="flex-grow w-full max-w-5xl mx-auto px-6 py-8">
        {/* My Agents Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="inline-flex items-center justify-start bg-[#2a2a2a] rounded-full px-4 py-2">
            <Users className="w-4 h-4 text-rose-500 mr-2" />
            <span className="text-sm font-medium text-rose-500">My Agents</span>
          </div>
          {account && (
            <div className="flex items-center justify-center space-x-4">
              <ConfiguredConnect />

              <Button
                variant="outline"
                asChild
                className="bg-rose-500 text-white hover:bg-rose-600 border-rose-500 hover:border-rose-600 font-semibold py-2"
              >
                <Link href={"/agents/create"}>
                  <div className="flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    <p className="ml-2">Create Agent</p>
                  </div>
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Agents Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {account &&
            agents.length !== 0 &&
            agents.map((agent) => (
              <div
                key={agent._id}
                className="group cursor-pointer relative bg-[#2a2a2a] rounded-lg p-5 border border-gray-800 transition-all duration-300 hover:border-rose-500/50 hover:shadow-[0_0_30px_-12px_rgba(244,63,94,0.5)] hover:-translate-y-1"
              >
                <Link href={`/chat/${agent._id}`}>
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative rounded-lg overflow-hidden group-hover:ring-rose-500/50 transition-all duration-300 group-hover:scale-110">
                          <Avatar>
                            <AvatarFallback className="bg-rose-600 group-hover:bg-rose-800">
                              {agent.name.toString()[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-100 group-hover:text-rose-300 transition-colors duration-300">
                            {agent.name}
                          </h3>
                          <p className="text-sm text-rose-200">
                            @{agent.params.username || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 whitespace-pre-line">
                      {agent.description}
                    </p>
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-rose-500/0 via-rose-500/0 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 opacity-0 group-hover:opacity-15 blur transition-all duration-300 group-hover:blur-md pointer-events-none" />
                    <div className="text-sm mt-2 text-rose-300/60">
                      {shortenAddress(agent.params.publicKey)}
                    </div>
                  </>
                </Link>
              </div>
            ))}
        </div>

        {/* Empty State - Will be shown when no agents */}
        {(!account || agents.length === 0) && (
          <div className="text-center bg-[#2a2a2a] rounded-lg p-8">
            <div className="mb-4 flex justify-center">
              <Wrench className="h-16 w-16 text-rose-500" />
            </div>
            <h2 className="mb-3 text-2xl font-semibold">No Agents Found</h2>
            <p className="mb-6 text-base text-gray-300">
              {account
                ? "Create your own agent to customize actions & instructions"
                : "Login to start creating your agents"}
            </p>
            {account ? (
              <Button
                variant="default"
                size="lg"
                asChild
                className="bg-rose-500 text-white hover:bg-rose-600 px-8"
              >
                <Link href={"/agents/create"}>Create Agent</Link>
              </Button>
            ) : (
              <ConfiguredConnect />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default HomeAgentView;
