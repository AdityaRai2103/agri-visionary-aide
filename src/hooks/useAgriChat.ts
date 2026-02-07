import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Message, Agent, AgentType } from "@/types/agents";
import { AGENTS } from "@/types/agents";
import { toast } from "sonner";

export function useAgriChat(userId?: string, conversationId?: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId && userId) {
      loadMessages(conversationId);
    } else {
      setMessages([]);
    }
    setCurrentConversationId(conversationId || null);
  }, [conversationId, userId]);

  const loadMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data.map(m => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        imageUrl: m.image_url || undefined,
        timestamp: new Date(m.created_at),
        agentsInvolved: m.agents_involved as AgentType[] | undefined,
        sources: m.sources || undefined,
        language: m.language || "en",
      })));
    }
  };

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

  const createConversation = async (title: string): Promise<string | null> => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title: title.slice(0, 100),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    return data.id;
  };

  const saveMessage = async (
    convId: string,
    message: Message
  ) => {
    const { error } = await supabase.from("messages").insert({
      conversation_id: convId,
      role: message.role,
      content: message.content,
      image_url: message.imageUrl,
      agents_involved: message.agentsInvolved,
      sources: message.sources,
      language: message.language,
    });

    if (error) {
      console.error("Error saving message:", error);
    }
  };

  const sendMessage = useCallback(
    async (content: string, imageFile?: File, language: string = "en") => {
      setIsLoading(true);

      // Convert image to base64 if present
      let imageBase64: string | undefined;
      let imageUrl: string | undefined;

      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.readAsDataURL(imageFile);
        });
        imageUrl = URL.createObjectURL(imageFile);
      }

      // Create or get conversation
      let convId = currentConversationId;
      if (!convId && userId) {
        const title = content.slice(0, 50) || "Crop Analysis";
        convId = await createConversation(title);
        setCurrentConversationId(convId);
      }

      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content || "Analyze this crop image",
        imageUrl,
        timestamp: new Date(),
        language,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Save user message
      if (convId) {
        await saveMessage(convId, userMessage);
      }

      // Activate orchestrator
      updateAgentStatus("orchestrator", "working");

      // Determine which agents to activate based on input
      const agentsToActivate: AgentType[] = ["orchestrator", "text"];
      
      if (imageFile) {
        agentsToActivate.push("vision", "crop");
      }

      // Check for weather/climate related queries
      const weatherKeywords = ["weather", "rain", "temperature", "climate", "humidity", "forecast", "monsoon", "मौसम", "बारिश", "हवामान", "पाऊस"];
      if (weatherKeywords.some((kw) => content.toLowerCase().includes(kw))) {
        agentsToActivate.push("weather");
      }

      // Check for soil related queries
      const soilKeywords = ["soil", "ph", "npk", "moisture", "fertilizer", "nutrient", "मिट्टी", "खाद", "माती"];
      if (soilKeywords.some((kw) => content.toLowerCase().includes(kw))) {
        agentsToActivate.push("soil");
      }

      // Check for market related queries
      const marketKeywords = ["price", "market", "sell", "cost", "mandi", "rate", "कीमत", "बाजार", "भाव"];
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
            language,
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
          language: data.detectedLanguage || language,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Save assistant message
        if (convId) {
          await saveMessage(convId, assistantMessage);
        }
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
        const errorContent = language === "hi" 
          ? "क्षमा करें, आपके अनुरोध को संसाधित करने में त्रुटि हुई। कृपया पुनः प्रयास करें।"
          : language === "mr"
          ? "माफ करा, तुमच्या विनंतीवर प्रक्रिया करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा."
          : "I apologize, but I encountered an error processing your request. Please try again.";

        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: errorContent,
          timestamp: new Date(),
          agentsInvolved: agentsToActivate,
          language,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        // Reset agent statuses after a delay
        setTimeout(resetAgentStatuses, 2000);
      }
    },
    [messages, updateAgentStatus, resetAgentStatuses, userId, currentConversationId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, []);

  return {
    messages,
    agents,
    isLoading,
    sendMessage,
    clearMessages,
    currentConversationId,
  };
}
