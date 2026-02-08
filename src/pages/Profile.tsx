import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, User, MapPin, Phone, Wheat, LandPlot, 
  Loader2, Save, Plus, X, Sprout, CheckCircle2 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COMMON_CROPS = [
  "Rice", "Wheat", "Cotton", "Sugarcane", "Maize", "Soybean",
  "Groundnut", "Mustard", "Chickpea", "Pigeon Pea", "Tomato",
  "Onion", "Potato", "Chilli", "Turmeric", "Ginger"
];

const FARM_SIZES = [
  { value: "small", label: "Small (< 2 hectares)" },
  { value: "medium", label: "Medium (2-5 hectares)" },
  { value: "large", label: "Large (5-10 hectares)" },
  { value: "very_large", label: "Very Large (> 10 hectares)" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [currentCrops, setCurrentCrops] = useState<string[]>([]);
  const [newCrop, setNewCrop] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setLocation(profile.location || "");
      setPhoneNumber((profile as any).phone_number || "");
      setFarmSize(profile.farm_size || "");
      setCurrentCrops((profile as any).current_crops || profile.primary_crops || []);
    }
  }, [profile]);

  const handleAddCrop = () => {
    if (newCrop.trim() && !currentCrops.includes(newCrop.trim())) {
      setCurrentCrops([...currentCrops, newCrop.trim()]);
      setNewCrop("");
    }
  };

  const handleRemoveCrop = (crop: string) => {
    setCurrentCrops(currentCrops.filter(c => c !== crop));
  };

  const handleAddCommonCrop = (crop: string) => {
    if (!currentCrops.includes(crop)) {
      setCurrentCrops([...currentCrops, crop]);
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (displayName.trim().length > 100) {
      toast.error("Name must be less than 100 characters");
      return;
    }

    if (location.trim().length > 200) {
      toast.error("Location must be less than 200 characters");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        location: location.trim() || null,
        phone_number: phoneNumber.trim() || null,
        farm_size: farmSize || null,
        current_crops: currentCrops,
        primary_crops: currentCrops, // Keep in sync
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
      console.error(error);
    } else {
      setIsSaved(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => setIsSaved(false), 2000);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/50 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-xl hover:bg-muted/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-primary">My Profile</h1>
              <p className="text-sm text-muted-foreground">Manage your farm details</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="shadow-elevated border-border/30 backdrop-blur-xl bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Farm Profile
            </CardTitle>
            <CardDescription>
              Help us personalize your farming advice by providing your details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                maxLength={100}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                maxLength={15}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Location (Village/District/State)
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Nashik, Maharashtra"
                className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                maxLength={200}
              />
            </div>

            {/* Farm Size */}
            <div className="space-y-2">
              <Label htmlFor="farmSize" className="text-sm font-medium flex items-center gap-2">
                <LandPlot className="w-4 h-4 text-muted-foreground" />
                Land Size
              </Label>
              <Select value={farmSize} onValueChange={setFarmSize}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50">
                  <SelectValue placeholder="Select your farm size" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 bg-popover/95 backdrop-blur-xl">
                  {FARM_SIZES.map(size => (
                    <SelectItem key={size.value} value={size.value} className="rounded-lg">
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Crops */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Wheat className="w-4 h-4 text-muted-foreground" />
                Current Crops in Field
              </Label>
              
              {/* Selected Crops */}
              {currentCrops.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentCrops.map(crop => (
                    <Badge
                      key={crop}
                      variant="secondary"
                      className="pl-3 pr-1 py-1.5 rounded-lg bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
                    >
                      {crop}
                      <button
                        type="button"
                        onClick={() => handleRemoveCrop(crop)}
                        className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add Custom Crop */}
              <div className="flex gap-2">
                <Input
                  value={newCrop}
                  onChange={(e) => setNewCrop(e.target.value)}
                  placeholder="Add a crop..."
                  className="flex-1 h-11 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCrop())}
                  maxLength={50}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddCrop}
                  className="h-11 w-11 rounded-xl border-border/50 hover:bg-primary/10 hover:border-primary/30"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Common Crops Quick Add */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Quick add common crops:</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CROPS.filter(c => !currentCrops.includes(c)).slice(0, 8).map(crop => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleAddCommonCrop(crop)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border/30 hover:border-primary/30 transition-all"
                    >
                      + {crop}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-glow hover:shadow-elevated transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : isSaved ? (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {isSaved ? "Saved!" : "Save Profile"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
