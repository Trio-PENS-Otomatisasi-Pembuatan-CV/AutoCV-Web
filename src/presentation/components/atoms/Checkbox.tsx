import React from "react";
import { Check } from "lucide-react";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
  label?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  id,
  disabled,
  className = "",
  label,
}) => {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2.5 select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      <div
        className={`grid size-5 place-items-center rounded-md border transition-all ${
          checked
            ? "border-blue-600 bg-blue-600 text-white shadow-sm"
            : "border-slate-300 bg-white hover:border-slate-400"
        } ${disabled ? "bg-slate-100" : ""}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        {checked && <Check className="size-3.5 stroke-[3]" />}
      </div>
      {label && <span className="text-sm font-medium text-slate-800">{label}</span>}
    </label>
  );
};
