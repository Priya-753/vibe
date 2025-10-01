"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileCollection, FileExplorer } from "@/components/ui/file-explorer";
import { UserControl } from "@/components/ui/user-control";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";

interface ProjectViewProps {
  projectId: string;
}

export const ProjectView = ({ projectId }: ProjectViewProps) => {
  const { has } = useAuth()
  const hasProAccess = has?.({ plan: "pro" });

  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<"preview" | "code">("preview");

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
          <ErrorBoundary fallbackRender={() => <div>Error</div>}>
            <Suspense fallback={<div>Loading...</div>}>
              <ProjectHeader projectId={projectId} />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary fallbackRender={() => <div>Error</div>}>
            <Suspense fallback={<div>Loading...</div>}>
              <MessagesContainer projectId={projectId} activeFragment={activeFragment} setActiveFragment={setActiveFragment} />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>
        <ResizableHandle className="hover:bg-primary/10 transition-colors" />
        <ResizablePanel defaultSize={65} minSize={50} className="flex flex-col">
          <Tabs className="h-full flex flex-col"
            defaultValue="preview" value={tabState} onValueChange={(value) => setTabState(value as "preview" | "code")}>
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-8 p-0 border rounded-md">
                <TabsTrigger value="preview" className="rounded-md"><EyeIcon className="size-4" />  <span className="text-sm">Preview</span></TabsTrigger>
                <TabsTrigger value="code" className="rounded-md"><CodeIcon className="size-4" /> <span className="text-sm">Code</span></TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                {!hasProAccess && (
                  <Button asChild variant="default" size="sm">
                    <Link href="/pricing"><CrownIcon className="size-4" /> <span className="text-sm">Upgrade</span></Link>
                  </Button>
                )}
                <UserControl showName={false} />
              </div>
            </div>
            <TabsContent value="preview" className="flex-1">
              {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>
            <TabsContent value="code" className="flex-1">
              {!!activeFragment?.files && <FileExplorer files={activeFragment.files as FileCollection} />}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};