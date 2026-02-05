"use client";

import { ReactNode } from "react";

interface KeyValueBlockProps {
  label: string;
  value: ReactNode;
}

export const KeyValueBlock = ({ label, value }: KeyValueBlockProps) => {
  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <p className="text-sm font-body text-muted-foreground">
        <strong className="text-foreground">{label}:</strong> {value}
      </p>
    </div>
  );
};
