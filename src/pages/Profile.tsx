import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, User, MapPin, Phone, Wheat, LandPlot, 
  Loader2, Save, Plus, X, Sprout, CheckCircle2, AlertCircle
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Phone validation regex - accepts formats like +91 98765 43210, 9876543210, etc.
const phoneRegex = /^(\+?[1-9]\d{0,2}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{6,10}$/;

const profileFormSchema = z.object({
  displayName: z.string()
    .max(100, "Name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  phoneNumber: z.string()
    .refine(val => !val || phoneRegex.test(val.replace(/\s/g, '')), {
      message: "Please enter a valid phone number (e.g., +91 98765 43210)",
    })
    .optional()
    .or(z.literal("")),
  location: z.string()
    .max(200, "Location must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  farmSize: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

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
  const [currentCrops, setCurrentCrops] = useState<string[]>([]);
  const [newCrop, setNewCrop] = useState("");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      phoneNumber: "",
      location: "",
      farmSize: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.display_name || "",
        phoneNumber: (profile as any).phone_number || "",
        location: profile.location || "",
        farmSize: profile.farm_size || "",
      });
      setCurrentCrops((profile as any).current_crops || profile.primary_crops || []);
    }
  }, [profile, form]);

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

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: values.displayName?.trim() || null,
        location: values.location?.trim() || null,
        phone_number: values.phoneNumber?.trim() || null,
        farm_size: values.farmSize || null,
        current_crops: currentCrops,
        primary_crops: currentCrops,
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

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Display Name */}
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your name"
                          className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </FormMessage>
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="+91 98765 43210"
                          className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                          maxLength={20}
                        />
                      </FormControl>
                      <FormMessage className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </FormMessage>
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        Location (Village/District/State)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Nashik, Maharashtra"
                          className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
                          maxLength={200}
                        />
                      </FormControl>
                      <FormMessage className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </FormMessage>
                    </FormItem>
                  )}
                />

                {/* Farm Size */}
                <FormField
                  control={form.control}
                  name="farmSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-2">
                        <LandPlot className="w-4 h-4 text-muted-foreground" />
                        Land Size
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50">
                            <SelectValue placeholder="Select your farm size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border/50 bg-popover/95 backdrop-blur-xl">
                          {FARM_SIZES.map(size => (
                            <SelectItem key={size.value} value={size.value} className="rounded-lg">
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Current Crops */}
                <div className="space-y-3">
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-muted-foreground" />
                    Current Crops in Field
                  </FormLabel>
                  
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
                  type="submit"
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
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
