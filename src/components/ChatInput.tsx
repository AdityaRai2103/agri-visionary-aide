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
  onAutoSubmit?: (message: string, language: string) => void;
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
];

export function ChatInput({ onSend, isLoading, defaultLanguage = "en", onAutoSubmit }: ChatInputProps) {
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
    const lang = detectedLanguage && LANGUAGES.find(l => l.code === detectedLanguage) 
      ? detectedLanguage 
      : language;
    
    // Auto-submit immediately after voice transcription
    if (onAutoSubmit && text.trim()) {
      onAutoSubmit(text, lang);
    } else {
      setMessage(prev => prev ? `${prev} ${text}` : text);
      if (detectedLanguage && LANGUAGES.find(l => l.code === detectedLanguage)) {
        setLanguage(detectedLanguage);
      }
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
            className="h-16 w-auto rounded-xl shadow-soft border border-border/50 object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-soft hover:scale-110 transition-transform"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Modern Input Area */}
      <div className="flex items-center gap-1.5 p-1.5 bg-transparent rounded-xl">
        {/* Language Selector */}
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-auto border-0 bg-muted/50 hover:bg-muted rounded-xl h-10 px-3 transition-colors">
            <span className="text-base">{LANGUAGES.find(l => l.code === language)?.flag}</span>
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {LANGUAGES.map(lang => (
              <SelectItem key={lang.code} value={lang.code} className="rounded-lg">
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
          className="flex-shrink-0 h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
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
          className="flex-1 min-h-[40px] max-h-28 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 text-sm py-2.5"
          disabled={isLoading}
          rows={1}
        />

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || (!message.trim() && !imageFile)}
          className={cn(
            "flex-shrink-0 h-10 w-10 rounded-xl transition-all duration-300",
            message.trim() || imageFile
              ? "bg-primary hover:bg-primary/90 shadow-soft hover:shadow-elevated hover:scale-105"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground/70 text-center mt-2">
        {language === "hi" ? "फसल की तस्वीरें अपलोड करें • आवाज से पूछें • खेती की सलाह पाएं" :
         language === "mr" ? "पिकांचे फोटो अपलोड करा • आवाजाने विचारा • शेतीची सल्ला घ्या" :
         "Upload crop images • Use voice input • Get farming advice"}
      </p>
    </form>
  );
}
