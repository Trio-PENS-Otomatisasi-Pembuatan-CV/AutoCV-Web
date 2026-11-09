"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LoginTemplate } from "@/presentation/components/templates/LoginTemplate";

export default function LoginPage() {
  const router = useRouter();

  return <LoginTemplate onSuccess={() => router.push("/")} />;
}
