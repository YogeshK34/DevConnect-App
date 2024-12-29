import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/toaster";
import { UserNav } from "@/components/user-nav";
import { Logo } from "@/components/logo";
import { MessageCircle, Users, Menu } from "lucide-react";
import { NotificationIndicator } from "@/components/notification-indicator";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DevConnect",
  description:
    "Connect, collaborate, and create amazing projects with developers worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="hover:opacity-90 transition-opacity">
                  <Logo />
                </Link>
                <nav className="hidden md:flex items-center space-x-4">
                  <Link href="/projects" className="text-sm font-medium">
                    Projects
                  </Link>
                  <Link
                    href="/users"
                    className="text-sm font-medium flex items-center"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Users
                  </Link>
                  <Link
                    href="/messages"
                    className="text-sm font-medium flex items-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Messages
                    <NotificationIndicator />
                  </Link>
                  <UserNav />
                  <ThemeToggle />
                </nav>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <div className="mb-8">
                      <Logo size="lg" />
                    </div>
                    <nav className="flex flex-col space-y-4">
                      <Link href="/projects" className="text-sm font-medium">
                        Projects
                      </Link>
                      <Link
                        href="/users"
                        className="text-sm font-medium flex items-center"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Users
                      </Link>
                      <Link
                        href="/messages"
                        className="text-sm font-medium flex items-center"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Messages
                        <NotificationIndicator />
                      </Link>
                      <UserNav />
                      <ThemeToggle />
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </header>
            <main className="flex-grow">{children}</main>
            <footer className="border-t">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Logo size="sm" />
                <p className="text-sm text-muted-foreground">
                  © 2024 DevConnect. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
