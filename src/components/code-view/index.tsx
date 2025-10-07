import Prism from "prismjs";
import { useEffect } from "react";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-json";

import "./code-theme.css";


interface CodeViewProps {
    code: string;
    language: string;
}

export const CodeView = ({ code, language }: CodeViewProps) => {
    useEffect(() => {
        Prism.highlightAll();
    }, [code]);

    return (
        <div className="w-full h-full overflow-auto">
            <pre className="p-4 bg-transparent border-none rounded-none m-0 text-sm leading-relaxed whitespace-pre-wrap">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};