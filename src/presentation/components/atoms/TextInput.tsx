import React from "react";
import { CheckCircle2 } from "lucide-react";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isValid?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  error,
  leftIcon,
  rightIcon,
  isValid = false,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <div className="group relative w-full">
      {leftIcon && (
        <div
          className={`absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none transition-all duration-200 ease-out origin-center z-10 ${
            error
              ? "text-rose-500 group-focus-within:text-rose-600 group-focus-within:scale-125"
              : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 group-focus-within:scale-125"
          }`}
        >
          {leftIcon}
        </div>
      )}

      <input
        className={`w-full rounded-xl border bg-slate-50/50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800/90 focus:bg-white dark:focus:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 transition-all duration-200 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none
          ${leftIcon ? "pl-10" : ""}
          ${isValid || rightIcon ? "pr-10" : ""}
          ${
            error
              ? "border-rose-300 dark:border-rose-500/70 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 shadow-xs"
              : isValid
              ? "border-emerald-300 dark:border-emerald-500/70 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              : "border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-600/15 dark:focus:ring-blue-500/20 focus:shadow-xs"
          }
          ${disabled ? "bg-slate-100/70 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed" : ""}
          ${className}
        `}
        disabled={disabled}
        {...props}
      />

      {/* Right Icon / Validation checkmark */}
      {(isValid || rightIcon) && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
          {rightIcon ? (
            rightIcon
          ) : isValid ? (
            <CheckCircle2 className="size-4 text-emerald-500 animate-scale-in" />
          ) : null}
        </div>
      )}
    </div>
  );
};
