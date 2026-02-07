import { useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { AgentGrid } from "@/components/AgentGrid";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { useAgriChat } from "@/hooks/useAgriChat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Leaf, Camera, MessageSquare, Cloud } from "lucide-react";

const Index = () => {
  const { messages, agents, isLoading, sendMessage } = useAgriChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col gap-6 max-w-5xl">
        {/* Agent Status Grid */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Agent Network
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <AgentGrid agents={agents} />
        </section>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col min-h-0 glass rounded-2xl p-4 shadow-card">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-float">
                <Leaf className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to KrishiMitra AI</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Your intelligent farming companion powered by multiple AI agents. 
                Ask questions or upload crop images for analysis.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
                <div className="p-4 rounded-xl bg-card border border-border/50 shadow-soft">
                  <Camera className="w-6 h-6 text-agent-vision mx-auto mb-2" />
                  <h3 className="font-medium text-sm">Crop Analysis</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload photos for disease detection
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50 shadow-soft">
                  <MessageSquare className="w-6 h-6 text-agent-text mx-auto mb-2" />
                  <h3 className="font-medium text-sm">Ask Questions</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get farming advice instantly
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50 shadow-soft">
                  <Cloud className="w-6 h-6 text-agent-weather mx-auto mb-2" />
                  <h3 className="font-medium text-sm">Weather Info</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Real-time weather updates
                  </p>
                </div>
              </div>

              <div className="mt-8 text-xs text-muted-foreground">
                <p>Try asking:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {[
                    "What causes yellowing in rice leaves?",
                    "How to treat cotton bollworm?",
                    "Best time to sow wheat in Maharashtra?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages */
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <div className="flex flex-col gap-4 py-2">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground animate-fade-in">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-thinking" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-thinking" style={{ animationDelay: "200ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-thinking" style={{ animationDelay: "400ms" }} />
                    </div>
                    <span className="text-sm">Agents analyzing...</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </section>

        {/* Input Area */}
        <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </section>
      </main>
    </div>
  );
};

export default Index;
