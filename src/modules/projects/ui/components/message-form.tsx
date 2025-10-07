import { Form, FormField } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TextAreaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Usage } from "@/components/ui/usage";

const formSchema = z.object({
    value: z.string().min(1, { message: "Value is required" }).max(10000, { message: "Value must be less than 10000 characters" }),
});

interface MessageFormProps {
    projectId: string;
    onSubmit: (value: string) => void;
}

export const MessageForm = ({ projectId }: MessageFormProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const trpc = useTRPC();

    const { data: usage } = useSuspenseQuery(trpc.usage.status.queryOptions());

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
        },
    });

    const createMessage = useMutation(trpc.messages.create.mutationOptions({
        onError: (error) => {
            toast.error(error.message);
            if (error?.data?.code === "TOO_MANY_REQUESTS") {
                router.push("/pricing");
            }
        },
        onSuccess: () => {
            form.reset();
            queryClient.invalidateQueries(trpc.messages.getMany.queryOptions({ projectId }));
            queryClient.invalidateQueries(trpc.usage.status.queryOptions());
        },
    }));

    const onSubmitForm = (values: z.infer<typeof formSchema>) => {
        createMessage.mutateAsync({
            value: values.value,
            projectId: projectId,
        });
    };

    const isPending = createMessage.isPending;
    const isButtonDisabled = isPending || !form.formState.isValid;
    const showUsage = !!usage;

    return (
        <Form {...form}>
            {
                showUsage
                && <Usage
                    points={usage.remainingPoints}
                    msBeforeNext={usage.msBeforeNext}
                />
            }
            <form onSubmit={form.handleSubmit(onSubmitForm)} className={cn(
                "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                isFocused && "shadow-xs",
                showUsage && "rounded-t-none"
            )}>
                <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <TextAreaAutosize {...field}
                            disabled={isPending}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            minRows={2}
                            maxRows={8}
                            className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                            placeholder="What do you want to build?"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmitForm)(e);
                                }
                            }}
                        />
                    )}
                />
                <div className="flex gap-x-2 items-end justify-between pt-2">
                    <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-x-1">
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center justify-center rounded bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            <span>Enter</span>
                        </kbd>
                        &nbsp;to submit,&nbsp;
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center justify-center rounded bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            <span>Shift</span>
                            <span>+</span>
                            <span>Enter</span>
                        </kbd>
                        &nbsp;for new line
                    </div>
                    <Button variant="outline" size="icon" onClick={() => form.reset()} disabled={isButtonDisabled}>
                        {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <ArrowUpIcon className="size-4" />}
                        {isPending && <span className="sr-only">Submitting...</span>}
                    </Button>
                </div>
            </form>
        </Form>
    );
};  