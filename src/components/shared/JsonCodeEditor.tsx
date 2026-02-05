"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { json } from "@codemirror/lang-json";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { cn } from "@/lib/utils";

const JSON_EDITOR_MONO_STYLE_ID = "json-code-editor-mono-font";
let jsonEditorMonoRefCount = 0;

/* Inject monospace font override – must run after preset-admin font styles (AdminFontStyle, etc.) */
function useJsonEditorMonoFont() {
  React.useEffect(() => {
    jsonEditorMonoRefCount++;
    let style = document.getElementById(JSON_EDITOR_MONO_STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = JSON_EDITOR_MONO_STYLE_ID;
      style.textContent = `html.preset-admin [data-json-code-editor],html.preset-admin [data-json-code-editor] *,html.preset-admin [data-json-code-editor] *::before,html.preset-admin [data-json-code-editor] *::after{font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace!important}`;
      document.head.appendChild(style);
    }
    return () => {
      jsonEditorMonoRefCount--;
      if (jsonEditorMonoRefCount <= 0) {
        jsonEditorMonoRefCount = 0;
        const el = document.getElementById(JSON_EDITOR_MONO_STYLE_ID);
        if (el) el.remove();
      }
    };
  }, []);
}

const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false }
);

/* JSON syntax highlighting using design tokens */
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
  /** When true, the editor is read-only (no edits). */
  readOnly?: boolean;
  /** When true, long lines wrap to fit the container width. */
  lineWrapping?: boolean;
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
      readOnly = false,
      lineWrapping = false,
      ...rest
    },
    ref
  ) => {
    useJsonEditorMonoFont();

    const extensions = React.useMemo(
      () => [
        json(),
        syntaxHighlighting(jsonHighlightStyle),
        ...(lineWrapping ? [EditorView.lineWrapping] : []),
      ],
      [lineWrapping]
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
          indentWithTab={!readOnly}
          readOnly={readOnly}
          editable={!readOnly}
          {...rest}
        />
      </div>
    );
  }
);
JsonCodeEditor.displayName = "JsonCodeEditor";

export { JsonCodeEditor };
