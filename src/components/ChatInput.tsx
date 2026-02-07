import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string, imageFile?: File) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;
    
    onSend(message, imageFile || undefined);
    setMessage("");
    handleRemoveImage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block animate-scale-in">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-20 w-auto rounded-lg shadow-soft border border-border"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-soft hover:scale-110 transition-transform"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 p-2 bg-card rounded-2xl shadow-card border border-border/50">
        {/* Image Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
          disabled={isLoading}
        >
          <ImagePlus className="w-5 h-5" />
        </Button>

        {/* Text Input */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about crops, diseases, weather, or upload a photo..."
          className="flex-1 min-h-[44px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          disabled={isLoading}
          rows={1}
        />

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || (!message.trim() && !imageFile)}
          className={cn(
            "flex-shrink-0 rounded-xl transition-all",
            message.trim() || imageFile
              ? "bg-primary hover:bg-primary/90"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        Upload crop images for disease detection or ask questions about farming
      </p>
    </form>
  );
}
