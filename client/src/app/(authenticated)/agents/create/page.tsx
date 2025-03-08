"use client";
import { useState, useEffect } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Search } from "lucide-react";
import mongoose from "mongoose";
import axios from "axios";
import { useActiveAccount } from "thirdweb/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

// Predefined actions (expanded for demonstration)
const predefinedActions = [
  {
    title: "Send Message",
    description: "Send a message to a specified recipient",
  },
  {
    title: "Schedule Meeting",
    description: "Schedule a meeting with one or more participants",
  },
  {
    title: "Set Reminder",
    description: "Set a reminder for a future task or event",
  },
  {
    title: "Create Task",
    description: "Create a new task in the task management system",
  },
  {
    title: "Generate Report",
    description: "Generate a report based on specified parameters",
  },
  { title: "Send Email", description: "Compose and send an email" },
  { title: "Create Event", description: "Create a new event in the calendar" },
  { title: "Assign Task", description: "Assign a task to a team member" },
  { title: "Run Analysis", description: "Perform data analysis on a dataset" },
  { title: "Start Video Call", description: "Initiate a video conference" },
];

export default function CreateAgentPage() {
  const router = useRouter();
  const account = useActiveAccount();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructions: "",
    actions: [] as { title: string; description: string }[],
    farcasterUsername: "",
    farcasterDisplayName: "",
    farcasterBio: "",
    sameAsAgentName: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActionIndices, setSelectedActionIndices] = useState<number[]>(
    []
  );
  const [threadId, setThreadId] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      sameAsAgentName: checked,
      farcasterDisplayName: checked ? prev.name : prev.farcasterDisplayName,
    }));
  };

  useEffect(() => {
    if (formData.sameAsAgentName) {
      setFormData((prev) => ({
        ...prev,
        farcasterDisplayName: prev.name,
      }));
    }
  }, [formData.sameAsAgentName]);

  const handleActionSelect = (
    action: { title: string; description: string },
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      actions: [...prev.actions, action],
    }));
    setSelectedActionIndices((prev) => [...prev, index]);
  };

  const handleRemoveAction = (actionTitle: string) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.filter((action) => action.title !== actionTitle),
    }));
    const indexToRemove = predefinedActions.findIndex(
      (action) => action.title === actionTitle
    );
    setSelectedActionIndices((prev) =>
      prev.filter((index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    console.log("indices", selectedActionIndices);

    const {
      name,
      description,
      instructions,
      farcasterUsername,
      farcasterBio,
      farcasterDisplayName,
    } = formData;

    // Initialize a new agent
    const id = new mongoose.Types.ObjectId().toString();
    setThreadId(id);

    try {
      const { data: dbData } = await axios.post(
        `${process.env.NEXT_PUBLIC_AGENT_ENDPOINT}/agent/init`,
        {
          name,
          description,
          imageUrl: "",
          instructions,
          threadId: id,
          toolNumbers: selectedActionIndices,
          createdBy: account?.address,
          params: {
            username: farcasterUsername,
            displayName: farcasterDisplayName,
            bio: farcasterBio,
          },
        }
      );

      console.log(dbData);

      if (dbData.success) {
        console.log("success", threadId);
        router.push(`/chat/${threadId}`);
      }
    } catch (err: any) {
      console.log(err);
      toast("Error", {
        className: "bg-rose-500/30 border-rose-500",
        description: err.message,
      });
    }
  };

  const filteredActions = predefinedActions.filter(
    (action) =>
      action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1c1c1c] to-[#2a2a2a] text-white font-inter">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#4f4f4f40_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f40_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-rose-500/10 hover:text-rose-500"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create New Agent</h1>
              <p className="text-sm text-gray-400">
                Create a custom agent with specific instructions
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border-gray-700/50 p-6 relative">
            <div className="space-y-6">
              {/* Agent Name */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-300"
                >
                  Agent Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter a name for your agent"
                  className="bg-[#333333] border-gray-700 text-white focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-300"
                >
                  Description <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what your agent does"
                  className="bg-[#333333] border-gray-700 text-white min-h-[100px] focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <label
                  htmlFor="instructions"
                  className="text-sm font-medium text-gray-300"
                >
                  Instructions <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Provide detailed instructions for your agent"
                  className="bg-[#333333] border-gray-700 text-white min-h-[150px] focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-white">
                  Actions <span className="text-rose-500">*</span>
                </label>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search actions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#333333] border-gray-700 text-white pl-10 focus:ring-rose-500 focus:border-rose-500 w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {filteredActions.map((action, index) => (
                    <button
                      key={action.title}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        const actionIndex = predefinedActions.findIndex(
                          (a) => a.title === action.title
                        );
                        if (
                          formData.actions.some((a) => a.title === action.title)
                        ) {
                          handleRemoveAction(action.title);
                        } else {
                          handleActionSelect(action, actionIndex);
                        }
                      }}
                      className={`flex flex-col items-start p-4 rounded-lg transition-all text-left ${
                        formData.actions.some((a) => a.title === action.title)
                          ? "bg-rose-500/20 border-2 border-rose-500 hover:bg-rose-500/30"
                          : "bg-[#3a3a3a] border-2 border-transparent hover:bg-[#4a4a4a] hover:border-rose-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <h4 className="text-sm font-semibold text-white">
                          {action.title}
                        </h4>
                        <div
                          className={`w-4 h-4 rounded-full ${
                            formData.actions.some(
                              (a) => a.title === action.title
                            )
                              ? "bg-rose-500"
                              : "bg-gray-600"
                          }`}
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        {action.description}
                      </p>
                    </button>
                  ))}
                </div>
                {formData.actions.length === 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    No actions selected. Click on actions above to select them.
                  </p>
                )}
                {formData.actions.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-white mb-2">
                      Selected Actions:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedActionIndices.map((index) => {
                        const action = predefinedActions[index];
                        return (
                          <div
                            key={action.title}
                            className="bg-rose-500/20 text-rose-300 text-xs font-medium px-3 py-1.5 rounded-full flex items-center"
                          >
                            <span>{action.title}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAction(action.title)}
                              className="ml-2 text-rose-300 hover:text-rose-100"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Farcaster Section */}
          <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border-gray-700/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-8 h-8">
                <Avatar>
                  <AvatarFallback>Fc</AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-lg font-semibold text-white">
                Farcaster Profile
              </h2>
            </div>

            <div className="space-y-6">
              {/* Farcaster Username */}
              <div className="space-y-2">
                <label
                  htmlFor="farcasterUsername"
                  className="text-sm font-medium text-gray-300"
                >
                  Username
                </label>
                <Input
                  id="farcasterUsername"
                  name="farcasterUsername"
                  value={formData.farcasterUsername}
                  onChange={handleChange}
                  placeholder="Enter your Farcaster username"
                  className="bg-[#333333] border-gray-700 text-white focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              {/* Farcaster Display Name */}
              <div className="space-y-2">
                <label
                  htmlFor="farcasterDisplayName"
                  className="text-sm font-medium text-gray-300"
                >
                  Display Name
                </label>
                <Input
                  id="farcasterDisplayName"
                  name="farcasterDisplayName"
                  value={formData.farcasterDisplayName}
                  onChange={handleChange}
                  placeholder="Enter a display name for Farcaster"
                  className="bg-[#333333] border-gray-700 text-white focus:ring-rose-500 focus:border-rose-500"
                  disabled={formData.sameAsAgentName}
                />
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="sameAsAgentName"
                    checked={formData.sameAsAgentName}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <label
                    htmlFor="sameAsAgentName"
                    className="text-sm text-gray-300 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Same as Agent Name
                  </label>
                </div>
              </div>

              {/* Farcaster Bio */}
              <div className="space-y-2">
                <label
                  htmlFor="farcasterBio"
                  className="text-sm font-medium text-gray-300"
                >
                  Bio
                </label>
                <Textarea
                  id="farcasterBio"
                  name="farcasterBio"
                  value={formData.farcasterBio}
                  onChange={handleChange}
                  placeholder="Write a short bio for your agent's Farcaster profile"
                  className="bg-[#333333] border-gray-700 text-white min-h-[100px] focus:ring-rose-500 focus:border-rose-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This will be displayed on your agent's Farcaster profile.
                </p>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500"
              onClick={() => router.push("/agents")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Create Agent
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
