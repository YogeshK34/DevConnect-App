"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold">
          Welcome to <span className="text-primary">DevConnect</span>
        </h1>
        <p className="mt-3 text-xl sm:text-2xl text-muted-foreground">
          Find collaborators, share ideas, and track your coding progress
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {user ? (
            <>
              <Link href="/projects">
                <Button size="lg">Browse Projects</Button>
              </Link>
              <Link href="/projects/new">
                <Button variant="outline" size="lg">
                  Create Project
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/projects">
                <Button size="lg">Browse Projects</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="outline" size="lg">
                  Sign Up
                </Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
