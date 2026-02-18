// Example: Authentication Layout with shadcn/ui
// Demonstrates: Layout composition, card usage, form integration

"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export function AuthLayout() {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-black tracking-tight">Login</CardTitle>
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-xs">lock</span>
                  SSL Secure
                </div>
              </div>
              <CardDescription>
                Enter your credentials to access your account.
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="bg-background-light dark:bg-background-dark border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    className="bg-background-light dark:bg-background-dark border-slate-200 dark:border-slate-800"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-[#1a1a1a] dark:bg-zinc-50 dark:text-black font-bold hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-xs text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-black tracking-tight">Create an account</CardTitle>
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-xs">lock</span>
                  SSL Secure
                </div>
              </div>
              <CardDescription>
                Enter your information to create an account.
              </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    className="bg-background-light dark:bg-background-dark border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="bg-background-light dark:bg-background-dark border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    required
                    className="bg-background-light dark:bg-background-dark border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    className="bg-background-light dark:bg-background-dark border-slate-200 dark:border-slate-800"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-[#1a1a1a] dark:bg-zinc-50 dark:text-black font-bold hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Key Patterns Demonstrated:
 * 
 * 1. Layout Composition: Centered authentication card with full-height viewport
 * 2. Card Usage: Structured content with header, body, and footer
 * 3. Tabs: Switch between login and register forms
 * 4. Form Structure: Proper labeling and input grouping
 * 5. Loading States: Button disabled state during form submission
 * 6. Responsive Design: Mobile-friendly with max-width constraint
 * 7. Tailwind Utilities: Using spacing, flexbox, and grid utilities
 * 
 * Design Choices:
 * - Minimal, clean interface focusing on the task at hand
 * - Proper semantic HTML with form elements
 * - Accessible labels and inputs
 * - Clear visual hierarchy with card components
 * - Loading feedback for better UX
 * 
 * Required Dependencies:
 * None beyond React and shadcn/ui components
 * 
 * Installation:
 * npx shadcn@latest add card
 * npx shadcn@latest add input
 * npx shadcn@latest add label
 * npx shadcn@latest add button
 * npx shadcn@latest add tabs
 */
