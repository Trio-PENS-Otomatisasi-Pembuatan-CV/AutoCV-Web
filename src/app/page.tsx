"use client";

import React, { useEffect } from "react";
import { Navbar } from "@/presentation/components/organisms/Navbar";
import { InputForm } from "@/presentation/components/organisms/InputForm";
import { ProgressStepper } from "@/presentation/components/organisms/ProgressStepper";
import { CurationDashboard } from "@/presentation/components/organisms/CurationDashboard";
import { DeliveryView } from "@/presentation/components/organisms/DeliveryView";
import { StepSwitcherBar } from "@/presentation/components/organisms/StepSwitcherBar";
import { useCVWorkflow } from "@/presentation/hooks/useCVWorkflow";
import { useCurator } from "@/presentation/hooks/useCurator";

export default function HomePage() {
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
    hasCurated,
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-28">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
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
            />
          </div>
        )}
      </main>

      {/* Bottom Step Switcher Floating Bar */}
      <StepSwitcherBar
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        canNavigateCuration={true}
        canNavigateDelivery={true}
      />
    </div>
  );
}
