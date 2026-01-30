"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { json } from "@codemirror/lang-json";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { cn } from "@/lib/utils";

const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false }
);

/* JSON syntax highlighting using design tokens (foreground, primary, success) */
const jsonHighlightStyle = HighlightStyle.define([
  { tag: tags.propertyName, color: "hsl(var(--foreground))" },
  { tag: tags.string, color: "hsl(var(--primary))" },
  { tag: tags.number, color: "hsl(var(--success))" },
  { tag: [tags.bool, tags.atom], color: "hsl(var(--success))" },
  { tag: tags.punctuation, color: "hsl(var(--muted-foreground))" },
  { tag: tags.keyword, color: "hsl(var(--foreground))" },
  { tag: tags.comment, color: "hsl(var(--muted-foreground))" },
]);

export interface JsonCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  minHeight?: string;
  height?: string;
  maxHeight?: string;
  id?: string;
  "data-testid"?: string;
}

const JsonCodeEditor = React.forwardRef<HTMLDivElement, JsonCodeEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = "{}",
      error,
      className,
      minHeight = "160px",
      height,
      maxHeight,
      id,
      ...rest
    },
    ref
  ) => {
    const extensions = React.useMemo(
      () => [json(), syntaxHighlighting(jsonHighlightStyle)],
      []
    );

    const handleChange = React.useCallback(
      (val: string) => {
        onChange(val);
      },
      [onChange]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border overflow-hidden [&_.cm-editor]:outline-none",
          "border-input bg-transparent",
          error && "border-destructive",
          className
        )}
        data-json-code-editor
      >
        <CodeMirror
          id={id}
          value={value}
          onChange={handleChange}
          theme="none"
          extensions={extensions}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
            bracketMatching: true,
            indentOnInput: true,
            syntaxHighlighting: false,
          }}
          minHeight={minHeight}
          height={height}
          maxHeight={maxHeight}
          indentWithTab={true}
          {...rest}
        />
      </div>
    );
  }
);
JsonCodeEditor.displayName = "JsonCodeEditor";

export { JsonCodeEditor };
