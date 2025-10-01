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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECT_TEMPLATES } from "../../constants";
import { useClerk } from "@clerk/nextjs";

const formSchema = z.object({
    value: z.string().min(1, { message: "Value is required" }).max(10000, { message: "Value must be less than 10000 characters" }),
});

export const ProjectForm = () => {
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const trpc = useTRPC();

    const {user} = useClerk();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
        },
    });

    const createProject = useMutation(trpc.projects.create.mutationOptions({
        onError: (error) => {
            if (error?.data?.code === "UNAUTHORIZED") {
                router.push("/sign-in");
                return;
            }
            toast.error(error.message);
            if (error?.data?.code === "TOO_MANY_REQUESTS") {
                router.push("/pricing");
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
            router.push(`/projects/${data.id}`);
            queryClient.invalidateQueries(trpc.usage.status.queryOptions());
        },
    }));

    if (!user) {
        return null;
    }

    const onSubmitForm = (values: z.infer<typeof formSchema>) => {
        createProject.mutateAsync({
            value: values.value,
        });
    };

    const onSelectTemplate = (template: typeof PROJECT_TEMPLATES[number]) => {
        form.setValue("value", template.prompt, {
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true,
        });
    };

    const isPending = createProject.isPending;
    const isButtonDisabled = isPending || !form.formState.isValid;



    return (
        <Form {...form}>
            <section className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmitForm)} className={cn(
                    "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                    isFocused && "shadow-xs",
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
                                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
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
                                <span>⌘</span>
                                <span>Enter</span>
                            </kbd>
                            &nbsp;to submit.
                        </div>
                        <Button variant="outline" size="icon" onClick={() => form.reset()} disabled={isButtonDisabled}>
                            {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <ArrowUpIcon className="size-4" />}
                            {isPending && <span className="sr-only">Submitting...</span>}
                        </Button>
                    </div>
                </form>

                <div className="flex-wrap justify-center gap-2 hidden md:flex max-w-3xl">
                    {PROJECT_TEMPLATES.map((template) => (
                        <Button key={template.title} variant="outline" size="sm" className="bg-white dark:bg-sidebar" onClick={() => onSelectTemplate(template)}>
                            {template.emoji} {template.title}
                        </Button>
                    ))}

                </div>
            </section>
        </Form>
    );
};  