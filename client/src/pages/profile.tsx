import { useContext, useState } from "react";
import { FaUser, FaEnvelope, FaBuilding, FaGlobe, FaKey, FaSave } from "react-icons/fa6";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthContext } from "@/contexts/AuthContext";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

// Profile form validation schema
const profileSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  companyName: z.string().optional(),
  language: z.string(),
});

// Password form validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { language, setLanguage, t } = useContext(LanguageContext);
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || "",
      companyName: user?.companyName || "",
      language: user?.language || language,
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle profile update
  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      await updateUser(values);
      
      // Update language if changed
      if (values.language !== language) {
        setLanguage(values.language as any);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      // In a real app, this would call an API endpoint to change the password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
      
      // Reset the form
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Password change failed",
        description: "There was a problem changing your password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <>
      <PageHeader
        title="Profile Settings"
        description="Manage your account settings and preferences"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" alt="User avatar" />
              <AvatarFallback className="text-xl">{getInitials(user?.companyName || "User")}</AvatarFallback>
            </Avatar>
            
            <h3 className="text-xl font-bold">{user?.username || "User"}</h3>
            <p className="text-neutral-500 mb-2">{user?.email || "email@example.com"}</p>
            <p className="text-sm text-neutral-600 mb-4">{user?.companyName || "No company specified"}</p>
            
            <div className="bg-neutral-100 w-full p-4 rounded-lg text-left">
              <div className="flex items-center mb-2">
                <span className="font-medium text-sm">Subscription:</span>
                <span className="ml-auto text-primary font-medium capitalize">{user?.subscriptionTier || "Free"}</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="font-medium text-sm">Member since:</span>
                <span className="ml-auto text-neutral-600">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString() 
                    : new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-sm">Language:</span>
                <span className="ml-auto capitalize text-neutral-600">{
                  language === 'en' ? 'English' : 
                  language === 'es' ? 'Spanish' : 
                  language === 'fr' ? 'French' : 
                  'English'
                }</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your profile information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                              <FaEnvelope size={16} />
                            </span>
                            <FormControl>
                              <Input
                                {...field}
                                className="pl-10"
                                placeholder="Enter your email address"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                              <FaBuilding size={16} />
                            </span>
                            <FormControl>
                              <Input
                                {...field}
                                className="pl-10"
                                placeholder="Enter your company name"
                              />
                            </FormControl>
                          </div>
                          <FormDescription>
                            This will be displayed on your profile and in communications.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Language</FormLabel>
                          <div className="relative">
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="pl-10">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 pointer-events-none">
                                <FaGlobe size={16} />
                              </span>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <FormDescription>
                            Choose your preferred language for the interface.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FaSave className="mr-2" />
                          Save Changes
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="security">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                              <FaKey size={16} />
                            </span>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="pl-10"
                                placeholder="Enter your current password"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                              <FaKey size={16} />
                            </span>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="pl-10"
                                placeholder="Enter your new password"
                              />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                              <FaKey size={16} />
                            </span>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="pl-10"
                                placeholder="Confirm your new password"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Changing Password...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FaKey className="mr-2" />
                          Change Password
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Profile;
