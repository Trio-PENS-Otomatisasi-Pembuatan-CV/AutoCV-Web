import React from "react";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({
  error,
  leftIcon,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
          {leftIcon}
        </div>
      )}
      <input
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 outline-none
          ${leftIcon ? "pl-10" : ""}
          ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
              : "border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
          }
          ${disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : ""}
          ${className}
        `}
        disabled={disabled}
        {...props}
      />
    </div>
  );
};
