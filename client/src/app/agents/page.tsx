import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, Users, Wrench, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Sample agent data
const agents = [
  {
    id: 1,
    name: "Kitsune",
    description:
      "Shop hundreds of everyday products right onchain with Kitsune.\nPioneering agentic commerce with every interaction.",
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Sniper",
    description: "Snipe new tokens on pump.fun",
    icon: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Swaggy G",
    description: "GrifFain Swag Store",
    icon: "/placeholder.svg?height=40&width=40",
  },
];

export default function AgentsPage() {
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
      <div className="flex-grow w-full max-w-5xl mx-auto px-6 py-8">
        {/* My Agents Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="inline-flex items-center justify-start bg-[#2a2a2a] rounded-full px-4 py-2">
            <Users className="w-4 h-4 text-rose-500 mr-2" />
            <span className="text-sm font-medium text-rose-500">My Agents</span>
          </div>
          <Button
            variant="outline"
            asChild
            className="bg-rose-500 text-white hover:bg-rose-600 border-rose-500 hover:border-rose-600 font-semibold"
          >
            <Link href={"/agents/create"}>
              <div className="flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2" />
                <p className="ml-2">Create Agent</p>
              </div>
            </Link>
          </Button>
        </div>

        {/* Agents Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="group cursor-pointer relative bg-[#2a2a2a] rounded-lg p-5 border border-gray-800 transition-all duration-300 hover:border-rose-500/50 hover:shadow-[0_0_30px_-12px_rgba(244,63,94,0.5)] hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/50 ring-2 ring-gray-700 group-hover:ring-rose-500/50 transition-all duration-300 group-hover:scale-110">
                    <Image
                      src={agent.icon || "/placeholder.svg"}
                      alt={agent.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100 group-hover:text-rose-300 transition-colors duration-300">
                    {agent.name}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 rounded-md hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-all duration-300">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-md hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-all duration-300">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 whitespace-pre-line">
                {agent.description}
              </p>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-rose-500/0 via-rose-500/0 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 opacity-0 group-hover:opacity-15 blur transition-all duration-300 group-hover:blur-md pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Empty State - Will be shown when no agents */}
        {agents.length === 0 && (
          <div className="text-center bg-[#2a2a2a] rounded-lg p-8">
            <div className="mb-4 flex justify-center">
              <Wrench className="h-16 w-16 text-rose-500" />
            </div>
            <h2 className="mb-3 text-2xl font-semibold">No Agents Found</h2>
            <p className="mb-6 text-base text-gray-300">
              Create your own agent to customize actions & instructions
            </p>
            <Button
              variant="default"
              size="lg"
              className="bg-rose-500 text-white hover:bg-rose-600 px-8"
            >
              Create Agent
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
