import { CheckCircleIcon, CopyCheckIcon, CopyIcon } from "lucide-react";
import { ResizableHandle, ResizablePanel } from "./resizable";
import { ResizablePanelGroup } from "./resizable";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Button } from "./button";
import { Hint } from "./hint";
import { CodeView } from "../code-view";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./breadcrumb";


export type FileCollection = { [path: string]: string; };

function getLanguageFromExtension(filename: string) {
    const extension = filename.split(".").pop()?.toLowerCase();
    return extension || "text";
}

interface FileBreadCrumbsProps {
    filePath: string;
}

const FileBreadCrumbs = ({ filePath }: FileBreadCrumbsProps) => {
    const pathSegments = filePath.split("/");
    const maxSegments = 4;

    const renderBreadcrumbItems = () => {
        if (pathSegments.length <= maxSegments) {
            return pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1;
                return (
                    <Fragment key={index}>
                        <BreadcrumbItem>
                            {isLast ?
                                <BreadcrumbPage className="font-medium">{segment}</BreadcrumbPage> :
                                <span className="text-muted-foreground">{segment}</span>}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                )
            });
        } else {
            const firstSegments = pathSegments[0];
            const lastSegments = pathSegments[pathSegments.length - 1];
            return (
                <>
                    <BreadcrumbItem>
                        <span className="text-muted-foreground">
                            {firstSegments}
                        </span>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbEllipsis />
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-medium">{lastSegments}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbItem>
                </>

            )
        }
    };

    return (
        <Breadcrumb
            aria-label="File breadcrumb"
            className="flex items-center gap-x-2"
        >
            <BreadcrumbList
                className="text-sm"
            >
                {renderBreadcrumbItems()}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export const FileExplorer = ({ files }: { files: FileCollection }) => {
    const [selectedFile, setSelectedFile] = useState<string | null>(() => {
        const fileKeys = Object.keys(files);
        return fileKeys.length > 0 ? fileKeys[0] : null;
    });

    const [copied, setCopied] = useState(false);

    const treeData = useMemo(() => convertFilesToTreeItems(files), [files]);
    const handleFileSelect = useCallback((filePath: string) => {
        if (files[filePath]) {
            setSelectedFile(filePath);
        }
    }, [files]);

    const handleCopyToClipboard = useCallback(() => {
        if (selectedFile && files[selectedFile]) {
            navigator.clipboard.writeText(files[selectedFile]);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    }, [selectedFile, files]);

    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
                <TreeView data={treeData} value={selectedFile} onValueChange={handleFileSelect} />
            </ResizablePanel>
            <ResizableHandle className="hover:bg-primary/10 transition-colors" />
            <ResizablePanel defaultSize={70} minSize={70} className="bg-sidebar">
                {selectedFile && files[selectedFile] ? (
                    <div className="w-full h-full flex flex-col">
                        <div className="border-b py-2 px-4 bg-sidebar flex justify-between items-center gap-x-2">
                            <FileBreadCrumbs filePath={selectedFile} />
                            <Hint text={copied ? "Copied!" : "Copy to clipboard"} side="bottom">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="ml-auto"
                                    onClick={handleCopyToClipboard}
                                    disabled={!files[selectedFile]}>
                                    {copied ? <CopyCheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                                </Button>
                            </Hint>

                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <CodeView code={files[selectedFile]} language={getLanguageFromExtension(selectedFile)} />
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        <span>Select a file to view its content</span>
                    </div>
                )}
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};