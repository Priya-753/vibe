import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { getQueryClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { projectId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({ projectId }));
  void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({ id: projectId }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectView projectId={projectId} />
      </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  )
};

export default Page;