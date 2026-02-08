import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { AgentGrid } from "@/components/AgentGrid";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { UserMenu } from "@/components/UserMenu";
import { useAgriChat } from "@/hooks/useAgriChat";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, Sparkles, Leaf, Camera, MessageSquare, Cloud } from "lucide-react";

export default function Index() {
  const { user, profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, agents, isLoading, sendMessage, clearMessages } = useAgriChat(
    user?.id,
    selectedConversationId
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNewConversation = () => {
    setSelectedConversationId(null);
    clearMessages();
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setSidebarOpen(false);
  };

  const handleSend = (message: string, imageFile?: File, language?: string) => {
    sendMessage(message, imageFile, language || profile?.preferred_language || "en");
  };

  const handleAutoSubmit = (message: string, language: string) => {
    sendMessage(message, undefined, language);
  };

  const getWelcomeMessage = () => {
    const lang = profile?.preferred_language || "en";
    const name = profile?.display_name?.split(" ")[0] || "";
    
    switch (lang) {
      case "hi":
        return {
          greeting: `नमस्ते${name ? ` ${name}` : ""}! 🙏`,
          subtitle: "मैं आपका कृषि सहायक हूं",
          description: "फसलों, बीमारियों, मौसम के बारे में पूछें या पौधे की तस्वीर अपलोड करें",
          suggestions: [
            "चावल की पत्तियां पीली क्यों हो रही हैं?",
            "कपास के बॉलवर्म का इलाज कैसे करें?",
            "महाराष्ट्र में गेहूं बोने का सबसे अच्छा समय?",
          ],
        };
      case "mr":
        return {
          greeting: `नमस्कार${name ? ` ${name}` : ""}! 🙏`,
          subtitle: "मी तुमचा कृषी सहाय्यक आहे",
          description: "पिके, रोग, हवामानाबद्दल विचारा किंवा वनस्पतीचा फोटो अपलोड करा",
          suggestions: [
            "तांदळाची पाने पिवळी का होतात?",
            "कापसाच्या बोंडअळीवर उपचार कसे करावे?",
            "महाराष्ट्रात गहू पेरण्याची सर्वोत्तम वेळ?",
          ],
        };
      default:
        return {
          greeting: `Welcome${name ? ` ${name}` : ""}! 👋`,
          subtitle: "I'm your AI farming assistant",
          description: "Ask about crops, diseases, weather, or upload a plant photo for diagnosis",
          suggestions: [
            "What causes yellowing in rice leaves?",
            "How to treat cotton bollworm?",
            "Best time to sow wheat in Maharashtra?",
          ],
        };
    }
  };

  const welcome = getWelcomeMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Conversation Sidebar */}
      {user && (
        <ConversationSidebar
          userId={user.id}
          currentConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Compact Header with User Menu */}
        <div className="relative backdrop-blur-sm bg-background/70 border-b border-border/30">
          <Header />
          {profile && (
            <div className="absolute top-4 right-4">
              <UserMenu profile={profile} onSignOut={signOut} />
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
          {/* TOP INPUT BAR - Always at top */}
          <div className="mb-6 animate-fade-in">
            <div className="backdrop-blur-xl bg-card/90 rounded-2xl shadow-elevated border border-border/30 p-1">
              <ChatInput 
                onSend={handleSend} 
                isLoading={isLoading}
                defaultLanguage={profile?.preferred_language || "en"}
                onAutoSubmit={handleAutoSubmit}
              />
            </div>
          </div>

          {/* Agent Network - Compact */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                AI Agents
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>
            <AgentGrid agents={agents} />
          </div>

          {/* Chat Messages Area */}
          <section className="flex-1 flex flex-col min-h-0">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-float shadow-elevated backdrop-blur-sm">
                    <Leaf className="w-12 h-12 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center animate-bounce-subtle">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {welcome.greeting}
                </h2>
                <p className="text-lg text-primary font-medium mb-2">{welcome.subtitle}</p>
                <p className="text-muted-foreground mb-10 max-w-md">
                  {welcome.description}
                </p>
                
                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
                  <div className="group p-5 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/30 shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-xl bg-agent-vision/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6 text-agent-vision" />
                    </div>
                    <h3 className="font-semibold text-sm">Crop Analysis</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Upload photos for instant disease detection
                    </p>
                  </div>
                  <div className="group p-5 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/30 shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-xl bg-agent-text/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6 text-agent-text" />
                    </div>
                    <h3 className="font-semibold text-sm">Ask Questions</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Get expert farming advice instantly
                    </p>
                  </div>
                  <div className="group p-5 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/30 shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-xl bg-agent-weather/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Cloud className="w-6 h-6 text-agent-weather" />
                    </div>
                    <h3 className="font-semibold text-sm">Weather Info</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Real-time weather forecasts
                    </p>
                  </div>
                </div>

                {/* Suggestion Pills */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Try asking</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {welcome.suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSend(suggestion)}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-muted to-muted/50 hover:from-primary/10 hover:to-accent/10 border border-border/30 hover:border-primary/30 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Messages - flowing top to bottom */
              <div className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                  <div className="flex flex-col gap-4 py-4">
                    {messages.map((message, index) => (
                      <div 
                        key={message.id} 
                        className="animate-fade-in"
                        style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                      >
                        <ChatMessage message={message} />
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-center gap-3 text-muted-foreground animate-fade-in p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30 max-w-xs">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-thinking" style={{ animationDelay: "0ms" }} />
                          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-thinking" style={{ animationDelay: "200ms" }} />
                          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-thinking" style={{ animationDelay: "400ms" }} />
                        </div>
                        <span className="text-sm font-medium">Analyzing...</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
