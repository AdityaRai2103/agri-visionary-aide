import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { AgentGrid } from "@/components/AgentGrid";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { UserMenu } from "@/components/UserMenu";
import { useAgriChat } from "@/hooks/useAgriChat";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, Sparkles, Leaf, Camera, MessageSquare, Cloud, Zap } from "lucide-react";

export default function Index() {
  const { user, profile, signOut } = useAuth();
  const { viewMode } = useTheme();
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
          greeting: `Welcome${name ? `, ${name}` : ""}! 👋`,
          subtitle: "Your AI-powered farming assistant",
          description: "Ask about crops, diseases, weather, or upload a plant photo for instant diagnosis",
          suggestions: [
            "What causes yellowing in rice leaves?",
            "How to treat cotton bollworm?",
            "Best time to sow wheat in Maharashtra?",
          ],
        };
    }
  };

  const welcome = getWelcomeMessage();
  const isSimpleMode = viewMode === "simple";
  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/50 to-background" />
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
        {/* Header with User Menu */}
        <div className="relative">
          <Header />
          {profile && (
            <div className="absolute top-3 right-16">
              <UserMenu profile={profile} onSignOut={signOut} />
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
          {/* Centered Welcome Screen with Input (when no messages) */}
          {!hasMessages ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Welcome content */}
              <div className="text-center mb-8 animate-fade-in">
                <div className="relative mb-6 inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-2xl animate-glow" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
                    <Leaf className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center animate-bounce-subtle shadow-elevated">
                    <Zap className="w-4 h-4 text-accent-foreground" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold mb-2 text-gradient-primary">
                  {welcome.greeting}
                </h2>
                <p className="text-lg text-foreground/80 font-medium mb-1">{welcome.subtitle}</p>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  {welcome.description}
                </p>
              </div>

              {/* Centered Input */}
              <div className="w-full max-w-2xl mb-8 animate-fade-in">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl blur-xl opacity-50" />
                  <div className="relative backdrop-blur-xl bg-card/95 rounded-2xl shadow-elevated border border-border/30 p-1.5">
                    <ChatInput 
                      onSend={handleSend} 
                      isLoading={isLoading}
                      defaultLanguage={profile?.preferred_language || "en"}
                      onAutoSubmit={handleAutoSubmit}
                    />
                  </div>
                </div>
                {/* Quick hints */}
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span>Upload crop images</span>
                  <span>•</span>
                  <span>Use voice input</span>
                  <span>•</span>
                  <span>Get farming advice</span>
                </div>
              </div>

              {/* Feature Cards - Hide in simple mode */}
              {!isSimpleMode && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
                  <div className="group p-5 rounded-2xl bg-gradient-card border border-border/30 shadow-card hover:shadow-glow transition-all duration-500 cursor-pointer hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(280,65%,55%)] to-[hsl(280,65%,45%)] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-soft">
                      <Camera className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-center">Crop Analysis</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed text-center">
                      Upload photos for instant disease detection
                    </p>
                  </div>
                  <div className="group p-5 rounded-2xl bg-gradient-card border border-border/30 shadow-card hover:shadow-glow transition-all duration-500 cursor-pointer hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(200,80%,50%)] to-[hsl(200,80%,40%)] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-soft">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-center">Expert Advice</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed text-center">
                      Get farming guidance instantly
                    </p>
                  </div>
                  <div className="group p-5 rounded-2xl bg-gradient-card border border-border/30 shadow-card hover:shadow-glow transition-all duration-500 cursor-pointer hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(35,90%,55%)] to-[hsl(35,90%,45%)] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-soft">
                      <Cloud className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-center">Weather Info</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed text-center">
                      Real-time weather forecasts
                    </p>
                  </div>
                </div>
              )}

              {/* Suggestion Pills */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Try asking</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {welcome.suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      className="px-4 py-2 rounded-xl bg-gradient-card border border-border/40 hover:border-primary/50 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow animate-fade-in group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="group-hover:text-gradient-primary transition-colors">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat View with messages */
            <>
              {/* TOP INPUT BAR */}
              <div className="mb-6 animate-fade-in">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl blur-xl opacity-50" />
                  <div className="relative backdrop-blur-xl bg-card/95 rounded-2xl shadow-elevated border border-border/30 p-1.5">
                    <ChatInput 
                      onSend={handleSend} 
                      isLoading={isLoading}
                      defaultLanguage={profile?.preferred_language || "en"}
                      onAutoSubmit={handleAutoSubmit}
                    />
                  </div>
                </div>
              </div>

              {/* Agent Network - Hide in simple mode */}
              {!isSimpleMode && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-border/30">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">AI Agents</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-border via-border/50 to-transparent" />
                  </div>
                  <AgentGrid agents={agents} />
                </div>
              )}

              {/* Chat Messages Area */}
              <section className="flex-1 flex flex-col min-h-0">
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
                        <div className="flex items-center gap-3 text-muted-foreground animate-fade-in p-4 rounded-2xl bg-gradient-card backdrop-blur-sm border border-border/30 max-w-xs shadow-card">
                          <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-thinking" style={{ animationDelay: "0ms" }} />
                            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-thinking" style={{ animationDelay: "200ms" }} />
                            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-thinking" style={{ animationDelay: "400ms" }} />
                          </div>
                          <span className="text-sm font-medium">Analyzing...</span>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
