"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const Client = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.hello.queryOptions({ text: "Priya" }));

  useEffect(() => {
    console.log(data);
  }, [data]);
  return <div>{data?.greeting}</div>;
};