import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to <span className="text-blue-600">DevConnect</span>
        </h1>
        <p className="mt-3 text-2xl">
          Find collaborators, share ideas, and track your coding progress
        </p>
        <div className="flex mt-6">
          <Link href="/projects" passHref>
            <Button className="mr-4">Browse Projects</Button>
          </Link>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-up" passHref>
              <Button variant="outline" className="mr-4">
                Sign Up
              </Button>
            </Link>
            <Link href="/sign-in" passHref>
              <Button variant="outline">Sign In</Button>
            </Link>
          </SignedOut>
        </div>
      </main>
    </div>
  );
}
