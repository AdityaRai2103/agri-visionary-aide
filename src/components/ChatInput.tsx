import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send, X, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceInput } from "./VoiceInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatInputProps {
  onSend: (message: string, imageFile?: File, language?: string) => void;
  isLoading: boolean;
  defaultLanguage?: string;
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
];

export function ChatInput({ onSend, isLoading, defaultLanguage = "en" }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [language, setLanguage] = useState(defaultLanguage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLanguage(defaultLanguage);
  }, [defaultLanguage]);

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
    
    onSend(message, imageFile || undefined, language);
    setMessage("");
    handleRemoveImage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceTranscript = (text: string, detectedLanguage: string) => {
    setMessage(prev => prev ? `${prev} ${text}` : text);
    // Auto-detect language from voice
    if (detectedLanguage && LANGUAGES.find(l => l.code === detectedLanguage)) {
      setLanguage(detectedLanguage);
    }
  };

  const getPlaceholder = () => {
    switch (language) {
      case "hi":
        return "फसलों, बीमारियों, मौसम के बारे में पूछें या फोटो अपलोड करें...";
      case "mr":
        return "पिके, रोग, हवामानाबद्दल विचारा किंवा फोटो अपलोड करा...";
      default:
        return "Ask about crops, diseases, weather, or upload a photo...";
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
        {/* Language Selector */}
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-muted/50 h-10 px-2">
            <span className="text-lg">{LANGUAGES.find(l => l.code === language)?.flag}</span>
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(lang => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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

        {/* Voice Input */}
        <VoiceInput
          onTranscript={handleVoiceTranscript}
          disabled={isLoading}
        />

        {/* Text Input */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
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
        {language === "hi" ? "फसल की तस्वीरें अपलोड करें या खेती के बारे में सवाल पूछें" :
         language === "mr" ? "पिकांचे फोटो अपलोड करा किंवा शेतीबद्दल प्रश्न विचारा" :
         "Upload crop images for disease detection or ask questions about farming"}
      </p>
    </form>
  );
}
