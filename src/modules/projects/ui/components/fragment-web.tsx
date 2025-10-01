import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/hint";
import { Fragment } from "@/generated/prisma";
import { RefreshCcwIcon, ExternalLinkIcon } from "lucide-react";
import { useState } from "react";

interface FragmentWebProps {
    data: Fragment;
}

export const FragmentWeb = ({ data }: FragmentWebProps) => {
    const [copied, setCopied] = useState(false);
    const [framentKey, setFragmentKey] = useState(0);
    const handleRefresh = () => {
        console.log(framentKey)
        setFragmentKey(prev => prev + 1);
    }

    const handleCopy = () => {
        if (data.sandboxUrl) {
            navigator.clipboard.writeText(data.sandboxUrl);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    }

    return (
        <div className="h-full w-full flex flex-col">
            <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
                <Hint text="Refresh preview">
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCcwIcon className="size-4" />
                    </Button>
                </Hint>
                <Hint text={copied ? "Copied!" : "Copy URL"}>
                    <Button
                        disabled={!data.sandboxUrl || copied}
                        variant="outline"
                        size="sm"
                        onClick={handleCopy} className="flex-1 justify-start text-start font-normal">
                        <span className="truncate">{data.sandboxUrl}</span>
                    </Button>
                </Hint>
                <Hint text="Open in new tab">
                    <Button variant="outline" size="sm"
                        disabled={!data.sandboxUrl}
                        onClick={() => {
                            if (data.sandboxUrl) {
                                window.open(data.sandboxUrl, "_blank");
                            }
                        }}>
                        <ExternalLinkIcon className="size-4" />
                    </Button>
                </Hint>
            </div>
            <iframe
                key={data.sandboxUrl}
                src={data.sandboxUrl}
                className="h-full w-full"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title={data.title}
            />

        </div>
    );
};