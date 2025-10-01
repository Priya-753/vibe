import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    DropdownMenuPortal,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    SunIcon,
    MoonIcon,
    MonitorIcon,
    SettingsIcon,
    TrashIcon, MoreHorizontalIcon
} from "lucide-react";


interface ProjectHeaderProps {
    projectId: string;
}

export const ProjectHeader = ({ projectId }: ProjectHeaderProps) => {
    const { theme, setTheme } = useTheme();

    const { data: project } = useSuspenseQuery(useTRPC().projects.getOne.queryOptions({ id: projectId }));

    return (
        <header className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-9 px-3 hover:bg-accent/50 focus-visible:ring-0 transition-all duration-200 group"
                        >
                            <Image 
                                src="/logo.svg" 
                                alt="Vibe" 
                                width={20} 
                                height={20} 
                                className="shrink-0 group-hover:scale-105 transition-transform duration-200" 
                            />
                            <span className="text-sm font-semibold ml-2 text-foreground">{project.name}</span>
                            <ChevronDownIcon className="ml-2 size-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        side="bottom" 
                        align="start" 
                        className="w-56 p-1"
                        sideOffset={8}
                    >
                        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Project
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href="/" className="flex items-center gap-2">
                                <ChevronLeftIcon className="size-4" />
                                <span>Back to Dashboard</span>
                            </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="my-1" />
                        
                        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Actions
                        </DropdownMenuLabel>
                        
                        
                        <DropdownMenuSeparator className="my-1" />
                        
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center gap-2">
                                <SettingsIcon className="size-4" />
                                <span>Settings</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-48">
                                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Theme
                                    </DropdownMenuLabel>
                                    <DropdownMenuRadioGroup 
                                        value={theme ?? "system"} 
                                        onValueChange={setTheme}
                                    >
                                        <DropdownMenuRadioItem value="light" className="flex items-center gap-2">
                                            <SunIcon className="size-4" />
                                            <span>Light</span>
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="dark" className="flex items-center gap-2">
                                            <MoonIcon className="size-4" />
                                            <span>Dark</span>
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="system" className="flex items-center gap-2">
                                            <MonitorIcon className="size-4" />
                                            <span>System</span>
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        
                        <DropdownMenuSeparator className="my-1" />
                        
                        <DropdownMenuItem 
                            asChild
                            variant="destructive"
                            className="flex items-center gap-2 text-destructive focus:text-destructive"
                        >
                            <Link href={`/projects/${projectId}`}>
                                <TrashIcon className="size-4" />
                                <span>Delete Project</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontalIcon className="size-4" />
                </Button>
            </div>
        </header>
    );
};