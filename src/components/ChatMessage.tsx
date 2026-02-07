import { cn } from "@/lib/utils";
import type { Message } from "@/types/agents";
import { AGENTS } from "@/types/agents";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-soft",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground"
        )}
      >
        {isUser ? "👤" : "🌾"}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 max-w-[80%] rounded-2xl p-4 shadow-soft",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border/50 rounded-tl-sm"
        )}
      >
        {/* Image if present */}
        {message.imageUrl && (
          <div className="mb-3">
            <img
              src={message.imageUrl}
              alt="Uploaded crop"
              className="rounded-lg max-h-48 object-cover"
            />
          </div>
        )}

        {/* Message content */}
        <div className={cn("prose prose-sm max-w-none", isUser ? "prose-invert" : "")}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Agents involved */}
        {message.agentsInvolved && message.agentsInvolved.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground mb-2">Agents consulted:</p>
            <div className="flex flex-wrap gap-1.5">
              {message.agentsInvolved.map((agentId) => {
                const agent = AGENTS.find((a) => a.id === agentId);
                if (!agent) return null;
                return (
                  <span
                    key={agentId}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted/50"
                  >
                    <span>{agent.icon}</span>
                    <span>{agent.name}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground mb-2">Sources:</p>
            <div className="flex flex-col gap-1">
              {message.sources.map((source, index) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline truncate"
                >
                  {source}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p className={cn(
          "text-[10px] mt-2 opacity-60",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
