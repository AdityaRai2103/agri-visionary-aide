import { Sprout } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient-primary">
              KrishiMitra AI
            </h1>
            <p className="text-xs text-muted-foreground">
              Multi-Agent Agricultural Intelligence
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
