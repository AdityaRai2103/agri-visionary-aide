import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message, Agent, AgentType } from "@/types/agents";
import { AGENTS } from "@/types/agents";
import { toast } from "sonner";

export function useAgriChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [isLoading, setIsLoading] = useState(false);

  const updateAgentStatus = useCallback((agentId: AgentType, status: Agent["status"]) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, status } : agent
      )
    );
  }, []);

  const resetAgentStatuses = useCallback(() => {
    setAgents(AGENTS);
  }, []);

  const sendMessage = useCallback(
    async (content: string, imageFile?: File) => {
      setIsLoading(true);

      // Convert image to base64 if present
      let imageBase64: string | undefined;
      let imageUrl: string | undefined;

      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]); // Remove data:image/...;base64, prefix
          };
          reader.readAsDataURL(imageFile);
        });
        imageUrl = URL.createObjectURL(imageFile);
      }

      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content || "Analyze this crop image",
        imageUrl,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Activate orchestrator
      updateAgentStatus("orchestrator", "working");

      // Determine which agents to activate based on input
      const agentsToActivate: AgentType[] = ["orchestrator", "text"];
      
      if (imageFile) {
        agentsToActivate.push("vision", "crop");
      }

      // Check for weather/climate related queries
      const weatherKeywords = ["weather", "rain", "temperature", "climate", "humidity", "forecast", "monsoon"];
      if (weatherKeywords.some((kw) => content.toLowerCase().includes(kw))) {
        agentsToActivate.push("weather");
      }

      // Check for soil related queries
      const soilKeywords = ["soil", "ph", "npk", "moisture", "fertilizer", "nutrient"];
      if (soilKeywords.some((kw) => content.toLowerCase().includes(kw))) {
        agentsToActivate.push("soil");
      }

      // Check for market related queries
      const marketKeywords = ["price", "market", "sell", "cost", "mandi", "rate"];
      if (marketKeywords.some((kw) => content.toLowerCase().includes(kw))) {
        agentsToActivate.push("market");
      }

      // Always include recommendation agent for final advice
      agentsToActivate.push("recommend");

      // Activate agents with delays for visual effect
      for (const agentId of agentsToActivate) {
        updateAgentStatus(agentId, "thinking");
        await new Promise((r) => setTimeout(r, 200));
      }

      try {
        // Call the edge function
        const { data, error } = await supabase.functions.invoke("agri-chat", {
          body: {
            message: content,
            imageBase64,
            hasImage: !!imageFile,
            conversationHistory: messages.slice(-6).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          },
        });

        if (error) {
          throw error;
        }

        // Mark agents as complete
        for (const agentId of agentsToActivate) {
          updateAgentStatus(agentId, "complete");
        }

        // Add assistant message
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          agentsInvolved: agentsToActivate,
          sources: data.sources,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Chat error:", error);
        
        // Mark agents as error
        for (const agentId of agentsToActivate) {
          updateAgentStatus(agentId, "error");
        }

        // Handle specific error types
        if (error instanceof Error) {
          if (error.message.includes("429")) {
            toast.error("Rate limit exceeded. Please try again in a moment.");
          } else if (error.message.includes("402")) {
            toast.error("AI credits depleted. Please add credits to continue.");
          } else {
            toast.error("Failed to get response. Please try again.");
          }
        } else {
          toast.error("An unexpected error occurred.");
        }

        // Add error message
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I apologize, but I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
          agentsInvolved: agentsToActivate,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        // Reset agent statuses after a delay
        setTimeout(resetAgentStatuses, 2000);
      }
    },
    [messages, updateAgentStatus, resetAgentStatuses]
  );

  return {
    messages,
    agents,
    isLoading,
    sendMessage,
  };
}
