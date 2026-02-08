import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, Profile } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, Globe, Loader2, Wheat, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface UserMenuProps {
  profile: Profile | null;
  onSignOut: () => void;
}

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
];

export function UserMenu({ profile, onSignOut }: UserMenuProps) {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferred_language || "en");

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    const { error } = await updateProfile({
      preferred_language: preferredLanguage,
    });

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved!");
      setIsSettingsOpen(false);
    }
    
    setIsSaving(false);
  };

  const initials = profile?.display_name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-muted/50">
            <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-soft">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-xl border-border/50 bg-popover/95 backdrop-blur-xl" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile?.display_name || "User"}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {LANGUAGES.find(l => l.code === profile?.preferred_language)?.nativeName || "English"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50" />
          
          {/* Profile Submenu with Farm Profile and Logout */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="rounded-lg cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="rounded-xl border-border/50 bg-popover/95 backdrop-blur-xl">
                <DropdownMenuItem 
                  onClick={() => navigate("/profile")}
                  className="rounded-lg cursor-pointer"
                >
                  <Wheat className="mr-2 h-4 w-4" />
                  <span>My Farm Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem 
                  onClick={onSignOut} 
                  className="text-destructive rounded-lg cursor-pointer focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem 
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-lg cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Language Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Language Settings
            </DialogTitle>
            <DialogDescription>
              Choose your preferred language for the app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium">Preferred Language</Label>
              <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border/50">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 bg-popover/95 backdrop-blur-xl">
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code} className="rounded-lg">
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-muted-foreground ml-2">({lang.name})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsSettingsOpen(false)}
              className="rounded-xl border-border/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSettings} 
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
