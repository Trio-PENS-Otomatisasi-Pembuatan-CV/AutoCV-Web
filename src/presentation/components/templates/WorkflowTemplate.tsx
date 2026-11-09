import React from "react";
import { Navbar } from "../organisms/Navbar";
import { InputForm } from "../organisms/InputForm";
import { ProgressStepper } from "../organisms/ProgressStepper";
import { CurationDashboard } from "../organisms/CurationDashboard";
import { DeliveryView } from "../organisms/DeliveryView";
import type { UserSession } from "../../hooks/useAuthSession";
import type { useCVWorkflow } from "../../hooks/useCVWorkflow";
import type { useCurator } from "../../hooks/useCurator";

export interface WorkflowTemplateProps {
  currentUser: UserSession | null;
  onSignOut: () => void;
  workflow: ReturnType<typeof useCVWorkflow>;
  curator: ReturnType<typeof useCurator>;
}

export const WorkflowTemplate: React.FC<WorkflowTemplateProps> = ({
  currentUser,
  onSignOut,
  workflow,
  curator,
}) => {
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
  } = workflow;

  const {
    curatedResume,
    setResume,
    updateSummary,
    toggleProject,
    updateExperienceBullets,
    regenerateSummaryWithAI,
  } = curator;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16">
      <Navbar
        userName={currentUser?.name || "John Doe"}
        userEmail={currentUser?.email || "john.doe@company.com"}
        onSignOut={onSignOut}
      />

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
              onRerunSynthesis={() => setResume(resumeData)}
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
    </div>
  );
};
