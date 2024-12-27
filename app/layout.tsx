import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/toaster";
import { UserNav } from "@/components/user-nav";
import { Users } from "lucide-react";

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
            <header className="border-b">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                  DevConnect
                </Link>
                <nav className="flex items-center space-x-4">
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
                  <UserNav />
                  <ThemeToggle />
                </nav>
              </div>
            </header>
            <main className="flex-grow">{children}</main>
            <footer className="border-t">
              <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
                © 2024 DevConnect. All rights reserved.
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
