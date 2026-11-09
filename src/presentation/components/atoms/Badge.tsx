import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "slate" | "emerald" | "amber" | "rose" | "purple";
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "blue",
  size = "sm",
  className = "",
  dot = false,
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    blue: "bg-blue-50 text-blue-700 border border-blue-200/60",
    slate: "bg-slate-100 text-slate-700 border border-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    amber: "bg-amber-50 text-amber-700 border border-amber-200/60",
    rose: "bg-rose-50 text-rose-700 border border-rose-200/60",
    purple: "bg-purple-50 text-purple-700 border border-purple-200/60",
  };

  const dotColors = {
    blue: "bg-blue-600",
    slate: "bg-slate-500",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    rose: "bg-rose-600",
    purple: "bg-purple-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`size-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
