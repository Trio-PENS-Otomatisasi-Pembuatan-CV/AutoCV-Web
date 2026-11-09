import React from "react";
import { LoginForm } from "../organisms/LoginForm";
import { LoginVisual } from "../organisms/LoginVisual";

export interface LoginTemplateProps {
  onSuccess?: () => void;
}

export const LoginTemplate: React.FC<LoginTemplateProps> = ({ onSuccess }) => {
  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full">
        {/* Left: Interactive Form */}
        <div className="flex items-center justify-center bg-white px-6 sm:px-12 py-8 overflow-y-auto h-full">
          <LoginForm onSuccess={onSuccess} />
        </div>

        {/* Right: Architectural Graphic Showcase */}
        <LoginVisual />
      </div>
    </div>
  );
};
