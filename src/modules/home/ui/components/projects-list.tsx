"use client";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useClerk } from "@clerk/nextjs";

export const ProjectsList = () => {
    const trpc = useTRPC();
    const {user} = useClerk();

    const { data: projects = [] } = useQuery({
        ...trpc.projects.getMany.queryOptions(),
        enabled: !!user,
    });

    if (!user) {
        return null;
    }

    return (
        <div className="w-full bg-white dark:bg-sidebar rounded-xl p-8 border flex flex-col gap-y-6 sm:gap-y-4">
            <h2 className="text-2xl font-semibold">{user.firstName}&apos;s Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {projects.length > 0 ? projects.map((project) => (
                    <Button variant="outline" asChild key={project.id} className="font-normal h-auto justify-start w-full text-start p-4">
                            <Link href={`/projects/${project.id}`}>
                            <div className="flex items-center gap-x-4">
                            <Image
                                src="/logo.svg"
                                alt="Vibe"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                            <div className="flex flex-col gap-y-1"> 
                                <h3 className="truncate text-sm font-medium">{project.name}</h3>
                                <p className="text-sm text-muted-foreground">{formatDistanceToNow(project.updatedAt, {
                                    addSuffix: true,
                                })}</p>
                            </div>
                            </div>
                                
                            </Link>
                    </Button>
                )) : (
                    <div className="flex items-center justify-center w-full h-full">
                        <p className="text-sm text-muted-foreground">No projects found</p>
                    </div>
                )}
            </div>
        </div>
    );
};