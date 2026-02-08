import { Moon, Sun, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { themeMode, viewMode, toggleTheme, toggleViewMode } = useTheme();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        {/* View Mode Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleViewMode}
              className={cn(
                "h-9 w-9 rounded-xl transition-all duration-300",
                viewMode === "simple" 
                  ? "bg-accent/20 text-accent hover:bg-accent/30" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {viewMode === "full" ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover/95 backdrop-blur-sm">
            <p>{viewMode === "full" ? "Switch to Simple Mode" : "Switch to Full Mode"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={cn(
                "h-9 w-9 rounded-xl transition-all duration-300",
                "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {themeMode === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover/95 backdrop-blur-sm">
            <p>{themeMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
