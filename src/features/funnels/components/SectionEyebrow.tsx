import { cn } from "@/lib/utils";

interface SectionEyebrowProps {
  label: string;
  className?: string;
}

const SectionEyebrow = ({ label, className }: SectionEyebrowProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 mb-3 md:mb-4",
        className,
      )}
    >
      <span className="h-px w-10 md:w-12 bg-border" />
      <span className="text-[11px] md:text-xs font-light tracking-[0.22em] uppercase text-muted-foreground">
        {label}
      </span>
      <span className="h-px w-10 md:w-12 bg-border" />
    </div>
  );
};

export default SectionEyebrow;
