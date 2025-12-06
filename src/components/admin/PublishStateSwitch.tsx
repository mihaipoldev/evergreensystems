"use client";

import { Switch } from "@/components/ui/switch";

type PublishStateSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function PublishStateSwitch({ checked, onCheckedChange }: PublishStateSwitchProps) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .publish-state-switch button[data-state="checked"] > span {
            transform: translateX(28px) !important;
          }
        `,
        }}
      />
      <div className="publish-state-switch [&>button]:h-7 [&>button]:w-14 [&>button]:px-0 [&>button>span]:h-6 [&>button>span]:w-6 [&>button>span]:bg-background">
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </>
  );
}
