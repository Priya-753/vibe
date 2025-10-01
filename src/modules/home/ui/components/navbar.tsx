"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SignedOut, SignUpButton, SignInButton, SignedIn } from "@clerk/nextjs";
import { UserControl } from "@/components/ui/user-control";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";

export const Navbar = () => {
    const isScrolled = useScroll();
    return (
        <nav
            className={cn(
                "p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent",
                "bg-background/50 backdrop-blur-sm",
                isScrolled && "bg-background border-b border-border"
            )}

        >
            <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="Vibe" width={24} height={24} />
                    <span className="font-semibold text-lg">Vibe</span>
                </Link>
                <SignedOut>
                <div className="flex gap-2">
                    <SignUpButton>
                        <Button variant="outline" size="sm">
                            Sign up
                        </Button>
                    </SignUpButton>
                    <SignInButton>
                        <Button size="sm">
                            Sign in
                        </Button>
                    </SignInButton>
                </div>
            </SignedOut> 
            <SignedIn>
                <UserControl showName={true} />
            </SignedIn>
            </div>
            
        </nav>
    )
}