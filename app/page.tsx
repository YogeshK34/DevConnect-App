/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase-utils";
import { Loader2, Code2, Users, Rocket, GitBranch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState<any>(null);
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
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      <div className="relative">
        <section className="pt-20 pb-32 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-8">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary">
                  <Code2 className="w-8 h-8" />
                </div>
              </motion.div>
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent"
              >
                Welcome to DevConnect
              </motion.h1>
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
              >
                Join a thriving community of developers. Collaborate on
                projects, share knowledge, and build amazing things together.
              </motion.p>
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap justify-center gap-4"
              >
                {user ? (
                  <>
                    <Link href="/projects">
                      <Button size="lg" className="gap-2">
                        <Rocket className="w-4 h-4" />
                        Browse Projects
                      </Button>
                    </Link>
                    <Link href="/projects/new">
                      <Button variant="outline" size="lg" className="gap-2">
                        <GitBranch className="w-4 h-4" />
                        Create Project
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/sign-up">
                      <Button size="lg" className="gap-2">
                        <Users className="w-4 h-4" />
                        Join the Community
                      </Button>
                    </Link>
                    <Link href="/auth/sign-in">
                      <Button variant="outline" size="lg">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "Find Collaborators",
                  description:
                    "Connect with skilled developers who share your passion and vision for creating innovative solutions.",
                },
                {
                  icon: Code2,
                  title: "Share Knowledge",
                  description:
                    "Learn from the community, share your expertise, and grow together through collaborative development.",
                },
                {
                  icon: Rocket,
                  title: "Build Projects",
                  description:
                    "Turn your ideas into reality with the help of talented developers from around the world.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-colors h-full">
                    <CardContent className="pt-8 h-full flex flex-col">
                      <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground flex-grow">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Ready to Start Building?
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Join DevConnect today and become part of a growing community of
              developers who are creating the future.
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {!user && (
                <Link href="/auth/sign-up">
                  <Button size="lg" className="gap-2">
                    <Users className="w-4 h-4" />
                    Get Started
                  </Button>
                </Link>
              )}
              <Link href="/projects">
                <Button variant="outline" size="lg" className="gap-2">
                  <Rocket className="w-4 h-4" />
                  Explore Projects
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
