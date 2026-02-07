import { cn } from "@/lib/utils";
import type { Agent } from "@/types/agents";

interface AgentCardProps {
  agent: Agent;
  compact?: boolean;
}

export function AgentCard({ agent, compact = false }: AgentCardProps) {
  const statusStyles = {
    idle: "bg-muted/50 border-border/50",
    thinking: "bg-secondary/20 border-secondary animate-pulse-slow",
    working: "bg-accent/20 border-accent ring-2 ring-accent/30",
    complete: "bg-primary/10 border-primary",
    error: "bg-destructive/10 border-destructive",
  };

  const statusBadgeStyles = {
    idle: "bg-muted text-muted-foreground",
    thinking: "bg-secondary text-secondary-foreground",
    working: "bg-accent text-accent-foreground",
    complete: "bg-primary text-primary-foreground",
    error: "bg-destructive text-destructive-foreground",
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300",
          statusStyles[agent.status]
        )}
      >
        <span className="text-lg">{agent.icon}</span>
        <span className="text-sm font-medium">{agent.name}</span>
        {agent.status !== "idle" && (
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide",
              statusBadgeStyles[agent.status]
            )}
          >
            {agent.status}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300 shadow-soft hover:shadow-card",
        statusStyles[agent.status]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{agent.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{agent.name}</h4>
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide",
                statusBadgeStyles[agent.status]
              )}
            >
              {agent.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {agent.description}
          </p>
        </div>
      </div>
      {agent.status === "working" && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-gradient" />
        </div>
      )}
    </div>
  );
}
