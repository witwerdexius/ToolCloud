import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "emerald" | "yellow" | "red" | "blue" | "gray";
}

const VARIANT_CLASSES = {
  default: "bg-gray-100 text-gray-700",
  emerald: "bg-emerald-100 text-emerald-700",
  yellow:  "bg-yellow-100 text-yellow-700",
  red:     "bg-red-100 text-red-700",
  blue:    "bg-blue-100 text-blue-700",
  gray:    "bg-gray-100 text-gray-500",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
