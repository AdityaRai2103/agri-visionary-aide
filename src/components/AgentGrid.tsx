import { AgentCard } from "./AgentCard";
import type { Agent } from "@/types/agents";

interface AgentGridProps {
  agents: Agent[];
  compact?: boolean;
}

export function AgentGrid({ agents, compact = false }: AgentGridProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} compact />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
