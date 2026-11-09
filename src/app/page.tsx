"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/presentation/components/organisms/Navbar";
import { LoginForm } from "@/presentation/components/organisms/LoginForm";
import { LoginVisual } from "@/presentation/components/organisms/LoginVisual";
import { InputForm } from "@/presentation/components/organisms/InputForm";
import { ProgressStepper } from "@/presentation/components/organisms/ProgressStepper";
import { CurationDashboard } from "@/presentation/components/organisms/CurationDashboard";
import { DeliveryView } from "@/presentation/components/organisms/DeliveryView";
import { useCVWorkflow } from "@/presentation/hooks/useCVWorkflow";
import { useCurator } from "@/presentation/hooks/useCurator";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const {
    currentStep,
    setCurrentStep,
    jobId,
    status,
    progressPercent,
    isSubmitting,
    isApproving,
    formData,
    formErrors,
    resumeData,
    setResumeData,
    handleFormFieldChange,
    handleUseSample,
    handleSubmitJob,
    handleApproveCuration,
    handleDownloadPdf,
  } = useCVWorkflow();

  const {
    curatedResume,
    setResume,
    updateSummary,
    toggleProject,
    updateExperienceBullets,
    regenerateSummaryWithAI,
  } = useCurator(resumeData);

  // Sync curator whenever workflow loads new draftData from API
  useEffect(() => {
    setResume(resumeData);
  }, [resumeData, setResume]);

  // Check auth session on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("autocv_user");
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          setCurrentUser(parsed);
          setIsAuthenticated(true);
          setCurrentStep("input");
          return;
        } catch {
          // ignore error
        }
      }
      setIsAuthenticated(false);
      setCurrentStep("login");
    }
  }, [setCurrentStep]);

  const handleLoginSuccess = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("autocv_user");
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch {
          setCurrentUser({ name: "John Doe", email: "john.doe@company.com" });
        }
      } else {
        setCurrentUser({ name: "John Doe", email: "john.doe@company.com" });
      }
    }
    setIsAuthenticated(true);
    setCurrentStep("input");
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("autocv_user");
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentStep("login");
  };

  // Prevent flash while checking local auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={
        !isAuthenticated || currentStep === "login"
          ? "h-screen overflow-hidden bg-slate-50 flex flex-col font-sans"
          : "min-h-screen bg-slate-50 flex flex-col font-sans pb-16"
      }
    >
      {/* If not authenticated or on login step, render clean full login page */}
      {!isAuthenticated || currentStep === "login" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full">
          <div className="flex items-center justify-center bg-white px-6 sm:px-12 py-8 overflow-y-auto h-full">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>
          <LoginVisual />
        </div>
      ) : (
        <>
          {/* Top Navigation with Sign Out */}
          <Navbar
            userName={currentUser?.name || "John Doe"}
            userEmail={currentUser?.email || "john.doe@company.com"}
            onSignOut={handleSignOut}
          />

          {/* Main App Container */}
          <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
            {/* Step 1: Input & Ingestion */}
            {currentStep === "input" && (
              <div className="mx-auto max-w-[840px] transition-all duration-300">
                <InputForm
                  formData={formData}
                  onChange={handleFormFieldChange}
                  onUseSample={handleUseSample}
                  onSubmit={handleSubmitJob}
                  isLoading={isSubmitting}
                  errors={formErrors}
                />

                {(isSubmitting || jobId || progressPercent > 0) && (
                  <ProgressStepper
                    jobId={jobId}
                    status={status}
                    progressPercent={progressPercent}
                    onContinueToCuration={() => setCurrentStep("curation")}
                  />
                )}
              </div>
            )}

            {/* Step 2: Curation Studio (#HumanInTheLead) */}
            {currentStep === "curation" && (
              <div className="w-full transition-all duration-300">
                <CurationDashboard
                  resume={curatedResume}
                  onUpdateSummary={updateSummary}
                  onToggleProject={toggleProject}
                  onUpdateExperienceBullets={updateExperienceBullets}
                  onRegenerateSummary={regenerateSummaryWithAI}
                  onRerunSynthesis={() => {
                    setResume(resumeData);
                  }}
                  onApprove={() => {
                    setResumeData(curatedResume);
                    handleApproveCuration(curatedResume);
                  }}
                  onBackToInput={() => setCurrentStep("input")}
                  isApproving={isApproving}
                />
              </div>
            )}

            {/* Step 3: Delivery & Export */}
            {currentStep === "delivery" && (
              <div className="w-full transition-all duration-300">
                <DeliveryView
                  resume={curatedResume}
                  jobId={jobId}
                  onDownloadPdf={handleDownloadPdf}
                  onBackToCuration={() => setCurrentStep("curation")}
                  onCreateAnother={() => setCurrentStep("input")}
                />
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}
