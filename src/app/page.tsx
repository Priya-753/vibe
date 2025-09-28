"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Page =  () => {

  const [value, setValue] = useState("");
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess: (data) => {
      toast.success("Started");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  }));

  return (
    <div className="text-2xl font-bold">
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button disabled={invoke.isPending}
        onClick={() => {
          invoke.mutate({ value: value });
        }}
      >{invoke.isPending ? "Invoking..." : "Invoke Background Job"}</Button>
    </div>
  );
};

export default Page;