"use client";

import { Controller, useFormContext } from "react-hook-form";
import { PublishStateSwitch } from "./PublishStateSwitch";
import { cn } from "@/lib/utils";

type ApprovedSwitchFormProps = {
  className?: string;
};

export function ApprovedSwitchForm({ className }: ApprovedSwitchFormProps) {
  const { control } = useFormContext<{ approved: boolean }>();

  return (
    <div className={cn("flex items-center pt-2 shrink-0", className)}>
      <Controller
        name="approved"
        control={control}
        render={({ field }) => (
          <PublishStateSwitch
            checked={field.value ?? false}
            onCheckedChange={(checked) => {
              field.onChange(checked);
            }}
          />
        )}
      />
    </div>
  );
}
