import { Sprout } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-border/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-glow">
              <Sprout className="w-5 h-5" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/50 to-secondary/50 blur-xl opacity-50" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">
                KrishiMitra AI
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
                Multi-Agent Intelligence
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
