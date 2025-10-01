import { Fragment, MessageRole, MessageType } from "@/generated/prisma";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { format } from "date-fns";
import Image from "next/image";
import { ChevronRightIcon, Code2Icon } from "lucide-react";

interface UserMessageProps {
    content: string;
}

export const UserMessage = ({ content }: UserMessageProps) => {
    return (
        <div className="flex justify-end pb-4 pr-2 pl-10">
            <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words">
                {content}
            </Card>
        </div>
    );
};

interface AssistantMessageProps {
    content: string;
    fragment?: Fragment | null;
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment | null) => void;
    type: MessageType;
}

export const AssistantMessage = ({ content, fragment, createdAt, isActiveFragment, onFragmentClick, type }: AssistantMessageProps) => {
    return (
        <div className={cn(
            "flex flex-col group px-2 pb-4",
            type === MessageType.ERROR && "text-red-700 dark:text-red-500",
        )}>
            <div className="flex items-center gap-2 pl-2 mb-2">
                <Image src="/logo.svg" alt="Assistant" width={18} height={18} className="shrink-0" />
                <span className="text-sm font-medium">
                    Assistant
                </span>
                <span className="text-xs text-muted-foreground">
                    {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
                </span>
            </div>
            <div className="pl-8.5 flex flex-col gap-y-4">
                <span>{content}</span>
                {fragment && type === MessageType.RESULT && (
                    <FragmentCard fragment={fragment} isActiveFragment={isActiveFragment} onFragmentClick={onFragmentClick} />
                )}
            </div>
        </div>
    );
};

interface FragmentCardProps {
    fragment: Fragment;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment | null) => void;
}

export const FragmentCard = ({ fragment, isActiveFragment, onFragmentClick }: FragmentCardProps) => {
    return (
        <button
        className={cn(
            "flex items-start text-start gap-2 rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors",
            isActiveFragment && "bg-primary text-primary-foreground border-primary hover:bg-primary",
        )}
        onClick={() => onFragmentClick(fragment)}
        >
            <Code2Icon className="size-4 mt-0.5" />
            <div className="flex flex-col flex-1">
                <span className="text-sm font-medium line-clamp-1">{fragment.title}</span>
                <span className="text-sm">Preview</span>
            </div>
            <div className="flex items-center justify-center mt-0.5">
                <ChevronRightIcon className="size-4" />
            </div>
        </button>
    );
};

interface MessageCardProps {
    content: string;
    fragment?: Fragment | null;
    role: MessageRole;
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment | null) => void;
    type: MessageType;
}

export const MessageCard = ({ content, fragment, role, createdAt, isActiveFragment, onFragmentClick, type }: MessageCardProps) => {
    if (role === MessageRole.USER) {
        return (
            <UserMessage content={content} />
        );
    }

    if (role === MessageRole.ASSISTANT) {
        return (
            <AssistantMessage
                content={content}
                fragment={fragment}
                createdAt={createdAt}
                isActiveFragment={isActiveFragment}
                onFragmentClick={onFragmentClick}
                type={type} />
        );
    }

};