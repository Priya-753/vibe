import { formatDuration, intervalToDuration } from "date-fns";
import Link from "next/link";
import { Button } from "./button";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

interface UsageProps {
    points: number;
    msBeforeNext: number;
}

export const Usage = ({ points, msBeforeNext }: UsageProps) => {
    const { has } = useAuth()

    const hasProAccess = has?.({ plan: "pro" });

    const resetTime = useMemo(() => {
        try {
            formatDuration(
                intervalToDuration({
                    start: new Date(),
                    end: new Date(Date.now() + msBeforeNext),
                }),
                {
                    format: ["months", "days", "hours"],
                }
            )

        } catch (error) {
            console.error("Error formatting duration", error)
            return "unknown";
        }
    }, [msBeforeNext])


    return (
        <div className="rounded-t-xl bg-background border border-b-0 p-2.5">
            <div className="flex items-center gap-x-2">
                <div>
                    <p className="text-sm">
                        {points}  {hasProAccess ? "" : "free"} credits remaining
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Resets in{" "}
                        {resetTime}
                    </p>
                </div>
                {!hasProAccess && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                    >
                        <Link href="/pricing">
                            Upgrade
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
};
