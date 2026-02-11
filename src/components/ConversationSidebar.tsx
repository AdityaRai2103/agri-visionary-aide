import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Menu,
  X,
  Clock,
  History
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { subHours, subDays, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationSidebarProps {
  userId: string;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ConversationSidebar({
  userId,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  isOpen,
  onToggle,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRange, setDeleteRange] = useState<string>("");

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setConversations(data);
    }
    setLoading(false);
  };

  const handleDeleteByRange = (range: string) => {
    setDeleteRange(range);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteByRange = async () => {
    let cutoffDate: Date;
    const now = new Date();

    switch (deleteRange) {
      case "24h":
        cutoffDate = subHours(now, 24);
        break;
      case "7d":
        cutoffDate = subDays(now, 7);
        break;
      case "1m":
        cutoffDate = subMonths(now, 1);
        break;
      case "all":
        cutoffDate = new Date(0);
        break;
      default:
        return;
    }

    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", userId)
      .gte("created_at", cutoffDate.toISOString());

    if (!error) {
      setConversations(prev =>
        prev.filter(c => new Date(c.created_at) < cutoffDate)
      );
      if (
        currentConversationId &&
        conversations.find(c => c.id === currentConversationId && new Date(c.created_at) >= cutoffDate)
      ) {
        onNewConversation();
      }
    }
    setDeleteDialogOpen(false);
  };

  const getRangeLabel = (range: string) => {
    switch (range) {
      case "24h": return "last 24 hours";
      case "7d": return "last 7 days";
      case "1m": return "last month";
      case "all": return "all time";
      default: return "";
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (!error) {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) {
        onNewConversation();
      }
    }
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-md"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border space-y-2">
            <Button
              onClick={onNewConversation}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  Delete History
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Delete conversations from</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDeleteByRange("24h")}>
                  <Clock className="w-4 h-4 mr-2" />
                  Last 24 hours
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteByRange("7d")}>
                  <Clock className="w-4 h-4 mr-2" />
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteByRange("1m")}>
                  <Clock className="w-4 h-4 mr-2" />
                  Last month
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDeleteByRange("all")} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  All time
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1 p-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={cn(
                      "group p-3 rounded-lg cursor-pointer transition-colors relative",
                      currentConversationId === conv.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className={cn(
                        "w-4 h-4 mt-0.5 flex-shrink-0",
                        currentConversationId === conv.id ? "text-primary" : "text-muted-foreground"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {conv.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(conv.updated_at), "MMM d, h:mm a")}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 absolute right-2 top-2"
                        onClick={(e) => deleteConversation(conv.id, e)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Delete History Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation history</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all conversations from the <strong>{getRangeLabel(deleteRange)}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteByRange} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
