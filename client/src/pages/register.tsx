import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { FaUser, FaLock, FaEnvelope, FaBuilding, FaUserPlus } from "react-icons/fa6";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthContext } from "@/contexts/AuthContext";
import { LanguageContext } from "@/contexts/LanguageContext";

// Registration form validation schema
const registerSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username must be less than 50 characters" }),
  email: z.string()
    .email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  companyName: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { register, loading, error } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [_, navigate] = useLocation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      companyName: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    await register(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">TradeNavigator</h1>
          <p className="text-neutral-500 mt-2">{t("register.subtitle")}</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("register.title")}</CardTitle>
            <CardDescription>{t("register.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("register.username")}</FormLabel>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                          <FaUser size={16} />
                        </span>
                        <FormControl>
                          <Input
                            {...field}
                            className="pl-10"
                            placeholder={t("register.usernamePlaceholder")}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("register.email")}</FormLabel>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                          <FaEnvelope size={16} />
                        </span>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="pl-10"
                            placeholder={t("register.emailPlaceholder")}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("register.password")}</FormLabel>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                          <FaLock size={16} />
                        </span>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="pl-10"
                            placeholder={t("register.passwordPlaceholder")}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("register.companyName")}</FormLabel>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                          <FaBuilding size={16} />
                        </span>
                        <FormControl>
                          <Input
                            {...field}
                            className="pl-10"
                            placeholder={t("register.companyNamePlaceholder")}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded text-sm">
                    {error}
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t("register.registering")}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaUserPlus className="mr-2" />
                      {t("register.registerButton")}
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center w-full">
              <span className="text-neutral-500">{t("register.alreadyHaveAccount")} </span>
              <Link href="/login">
                <a className="text-primary font-medium hover:underline">
                  {t("register.loginHere")}
                </a>
              </Link>
            </div>
            
            <div className="text-xs text-neutral-500 text-center mt-4">
              {t("register.termsAgreement")} 
              <a href="#" className="text-primary hover:underline mx-1">
                {t("register.terms")}
              </a> 
              {t("register.and")} 
              <a href="#" className="text-primary hover:underline ml-1">
                {t("register.privacy")}
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
