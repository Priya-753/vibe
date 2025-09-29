import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { useRef, useEffect } from "react";
import { Fragment, MessageRole } from "@/generated/prisma";
import { MessageLoading } from "./message-loading";

interface MessagesContainerProps {
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment | null) => void;
}

export const MessagesContainer = ({ projectId, activeFragment, setActiveFragment }: MessagesContainerProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    const trpc = useTRPC(); 

    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({ projectId }, {
        refetchInterval: 5000,
    }));

    useEffect(() => {
        const lastAssistantMessageWithFragment = messages?.findLast((message) => message.role === MessageRole.ASSISTANT && !!message.fragment);
        if (lastAssistantMessageWithFragment) {
            setActiveFragment(lastAssistantMessageWithFragment.fragment);
        }
    }, [messages, setActiveFragment]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const lastMessage = messages?.[messages.length - 1];
    const isLastMessageUser = lastMessage?.role === MessageRole.USER;

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="pt-2 pr-1">
                    {messages?.map((message) => (
                        <MessageCard
                            key={message.id}
                            content={message.content}
                            fragment={message.fragment}
                            role={message.role}
                            createdAt={message.createdAt}
                            isActiveFragment={activeFragment?.id === message.fragment?.id}
                            onFragmentClick={() => setActiveFragment(message.fragment)}
                            type={message.type}
                        />
                    ))}
                    {isLastMessageUser && <MessageLoading />}
                    <div ref={bottomRef} />
                </div>
            </div>
            <div className="relative p-3 pt-1">
                <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/80 pointer-events-none" />
                <MessageForm onSubmit={() => { }} projectId={projectId} />
            </div>
        </div>
    );
};