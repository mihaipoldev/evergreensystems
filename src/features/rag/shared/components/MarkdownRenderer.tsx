"use client";

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { cn } from "@/lib/utils";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          h1: ({ children }: any) => (
            <h1 className="text-2xl font-bold text-foreground mt-6 mb-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }: any) => (
            <h2 className="text-xl font-bold text-foreground mt-5 mb-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }: any) => (
            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }: any) => (
            <h4 className="text-base font-semibold text-foreground mt-3 mb-2 first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }: any) => (
            <p className="text-foreground leading-relaxed mb-4 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }: any) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }: any) => (
            <em className="italic text-foreground">{children}</em>
          ),
          ul: ({ children }: any) => (
            <ul className="list-disc pl-6 text-foreground mb-4 space-y-2 [&_li::marker]:text-[18px]">
              {children}
            </ul>
          ),
          ol: ({ children }: any) => (
            <ol className="list-decimal pl-6 text-foreground mb-4 space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }: any) => (
            <li className="text-foreground leading-relaxed pl-2" style={{ fontSize: '15px' }}>
              {children}
            </li>
          ),
          blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground bg-muted/50 rounded-r">
              {children}
            </blockquote>
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            return inline ? (
              <code
                className={cn(
                  "bg-muted text-foreground px-1.5 py-0.5 rounded text-xs font-mono",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            ) : (
              <code
                className={cn(
                  "block bg-muted text-foreground p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }: any) => {
            return (
              <pre className="bg-muted text-foreground p-4 rounded-md text-xs font-mono overflow-x-auto border border-border my-4">
                {children}
              </pre>
            );
          },
          a: ({ href, children }: any) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-4 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

