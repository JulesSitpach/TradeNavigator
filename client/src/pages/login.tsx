import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { FaUser, FaLock, FaSignInAlt } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthContext } from "@/contexts/AuthContext";
import { LanguageContext } from "@/contexts/LanguageContext";

// Login form validation schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, loading, error } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [_, navigate] = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await login(values.username, values.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">TradeNavigator</h1>
          <p className="text-neutral-500 mt-2">{t("login.subtitle")}</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("login.title")}</CardTitle>
            <CardDescription>{t("login.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("login.username")}</FormLabel>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                          <FaUser size={16} />
                        </span>
                        <FormControl>
                          <Input
                            {...field}
                            className="pl-10"
                            placeholder={t("login.usernamePlaceholder")}
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
                      <FormLabel>{t("login.password")}</FormLabel>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                          <FaLock size={16} />
                        </span>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="pl-10"
                            placeholder={t("login.passwordPlaceholder")}
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
                      {t("login.loggingIn")}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaSignIn className="mr-2" />
                      {t("login.loginButton")}
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center w-full">
              <span className="text-neutral-500">{t("login.noAccount")} </span>
              <Link href="/register">
                <a className="text-primary font-medium hover:underline">
                  {t("login.registerNow")}
                </a>
              </Link>
            </div>
            
            <div className="flex items-center justify-center mt-4 space-x-2">
              <Button variant="ghost" size="sm" className="text-xs">
                {t("login.forgotPassword")}
              </Button>
              <span className="text-neutral-300">|</span>
              <Button variant="ghost" size="sm" className="text-xs">
                {t("login.needHelp")}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
