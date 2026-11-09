import React from "react";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  caption?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  caption,
  required = false,
  children,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      </div>
      {children}
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : caption ? (
        <p className="text-xs text-slate-500">{caption}</p>
      ) : null}
    </div>
  );
};
