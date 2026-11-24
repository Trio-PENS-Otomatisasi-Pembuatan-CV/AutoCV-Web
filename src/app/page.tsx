"use client";

import React, { useEffect } from "react";
import { useAuthSession } from "@/presentation/hooks/useAuthSession";
import { useCVWorkflow } from "@/presentation/hooks/useCVWorkflow";
import { useCurator } from "@/presentation/hooks/useCurator";
import { LoginTemplate } from "@/presentation/components/templates/LoginTemplate";
import { WorkflowTemplate } from "@/presentation/components/templates/WorkflowTemplate";

export default function HomePage() {
  const workflow = useCVWorkflow();
  const curator = useCurator(workflow.resumeData);
  const { setResume } = curator;
  const { isAuthenticated, currentUser, login, logout } = useAuthSession({
    onStepChange: workflow.setCurrentStep,
  });

  // Sync curator whenever workflow receives new draft data
  useEffect(() => {
    setResume(workflow.resumeData);
  }, [workflow.resumeData, setResume]);

  // Loading state while checking authentication session
  if (isAuthenticated === null) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Login view when unauthenticated
  if (!isAuthenticated || workflow.currentStep === "login") {
    return <LoginTemplate onSuccess={login} />;
  }

  // Main authenticated workflow (Input -> Curation -> Delivery)
  return (
    <WorkflowTemplate
      currentUser={currentUser}
      onSignOut={logout}
      workflow={workflow}
      curator={curator}
    />
  );
}
