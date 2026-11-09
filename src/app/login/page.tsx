"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/presentation/components/organisms/LoginForm";
import { LoginVisual } from "@/presentation/components/organisms/LoginVisual";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left: Login Form Panel */}
        <div className="flex items-center justify-center bg-white px-6 sm:px-12 py-16">
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>

        {/* Right: Interactive Graphic Visual Panel */}
        <LoginVisual />
      </div>
    </div>
  );
}
