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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex">
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
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header with User Menu */}
        <div className="relative">
          <Header />
          {profile && (
            <div className="absolute top-4 right-4">
              <UserMenu profile={profile} onSignOut={signOut} />
            </div>
          )}
        </div>

        {/* Agent Grid */}
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Agent Network
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <AgentGrid agents={agents} />
        </div>

        {/* Main Chat Area - Centered with flex grow */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 pb-4">
          <section className="flex-1 flex flex-col min-h-0 glass rounded-2xl p-4 shadow-card overflow-hidden">
            {messages.length === 0 ? (
              /* Welcome Screen - Centered */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-float hover-glow">
                    <Leaf className="w-10 h-10 text-primary" />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-bounce-subtle" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{welcome.greeting}</h2>
                <p className="text-lg text-primary font-medium mb-2">{welcome.subtitle}</p>
                <p className="text-muted-foreground mb-8 max-w-md">
                  {welcome.description}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg stagger-animation">
                  <div className="p-4 rounded-xl bg-card border border-border/50 shadow-soft hover-lift cursor-pointer group">
                    <Camera className="w-6 h-6 text-agent-vision mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-medium text-sm">Crop Analysis</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload photos for disease detection
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border/50 shadow-soft hover-lift cursor-pointer group">
                    <MessageSquare className="w-6 h-6 text-agent-text mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-medium text-sm">Ask Questions</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get farming advice instantly
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border/50 shadow-soft hover-lift cursor-pointer group">
                    <Cloud className="w-6 h-6 text-agent-weather mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-medium text-sm">Weather Info</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Real-time weather updates
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-xs text-muted-foreground">
                  <p>Try asking:</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {welcome.suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSend(suggestion)}
                        className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-all duration-200 text-foreground hover-lift"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input centered on welcome screen */}
                <div className="w-full max-w-2xl mt-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
                  <ChatInput 
                    onSend={handleSend} 
                    isLoading={isLoading}
                    defaultLanguage={profile?.preferred_language || "en"}
                    onAutoSubmit={handleAutoSubmit}
                  />
                </div>
              </div>
            ) : (
              /* Messages - scrollable area with input at bottom */
              <div className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                  <div className="flex flex-col gap-4 py-2">
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
                
                {/* Input at bottom when there are messages */}
                <div className="pt-4 mt-auto border-t border-border/30">
                  <ChatInput 
                    onSend={handleSend} 
                    isLoading={isLoading}
                    defaultLanguage={profile?.preferred_language || "en"}
                    onAutoSubmit={handleAutoSubmit}
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
