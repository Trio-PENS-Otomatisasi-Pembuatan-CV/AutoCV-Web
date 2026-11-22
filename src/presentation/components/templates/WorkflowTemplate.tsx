import React, { useMemo } from "react";
import { Navbar } from "../organisms/Navbar";
import { InputForm } from "../organisms/InputForm";
import { ProgressStepper } from "../organisms/ProgressStepper";
import { CurationDashboard } from "../organisms/CurationDashboard";
import { DeliveryView } from "../organisms/DeliveryView";
import { Button } from "../atoms/Button";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { UserSession } from "../../hooks/useAuthSession";
import type { useCVWorkflow } from "../../hooks/useCVWorkflow";
import type { useCurator } from "../../hooks/useCurator";
import { calculateAtsScore } from "@/core/utils/atsScoreCalculator";
import {
  RESUME_FORMAT_METRIC,
  RESUME_METHODOLOGY_METRIC,
  RESUME_DELIVERY_METRIC,
} from "@/core/config/resumeMetrics";

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
    submitError,
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
    updateProfile,
    updateSummary,
    toggleProject,
    toggleExperience,
    updateExperienceBullets,
    updateSkillCategoryItems,
    regenerateSummaryWithAI,
    requestAIRewrite,
    setLanguage,
  } = curator;

  const isFailed = status === "FAILED";

  const atsScore = useMemo(
    () => calculateAtsScore(curatedResume),
    [curatedResume]
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16">
      <Navbar
        onBackToInput={currentStep === "curation" ? () => setCurrentStep("input") : undefined}
        activeProfileName={currentStep === "curation" ? curatedResume.profile.fullName : undefined}
        activeProfileHeadline={currentStep === "curation" ? curatedResume.profile.headline : undefined}
      />

      <main
        className={`flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 ${
          currentStep === "curation" ? "pt-5 sm:pt-6" : "pt-8 sm:pt-12"
        }`}
      >
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

            {(isSubmitting || jobId || progressPercent > 0) && !isFailed && (
              <ProgressStepper
                jobId={jobId}
                status={status}
                progressPercent={progressPercent}
                onContinueToCuration={() => setCurrentStep("curation")}
              />
            )}

            {isFailed && submitError && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-red-900">
                      Job Failed
                    </h3>
                    <p className="mt-1 text-sm text-red-700 leading-relaxed">
                      {submitError}
                    </p>
                    <div className="mt-4">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                          setCurrentStep("input");
                          workflow.handleSubmitJob({ preventDefault: () => {} } as React.FormEvent);
                        }}
                        icon={<RefreshCw className="size-4" />}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Curation Studio (#HumanInTheLead) */}
        {currentStep === "curation" && (
          <div className="w-full transition-all duration-300">
            <CurationDashboard
              resume={curatedResume}
              onLanguageChange={setLanguage}
              onUpdateProfile={updateProfile}
              onUpdateSummary={updateSummary}
              onToggleProject={toggleProject}
              onToggleExperience={toggleExperience}
              onUpdateExperienceBullets={updateExperienceBullets}
              onUpdateSkillCategoryItems={updateSkillCategoryItems}
              onRegenerateSummary={regenerateSummaryWithAI}
              onRequestAIRewrite={requestAIRewrite}
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
              atsScore={atsScore}
              formatMetric={RESUME_FORMAT_METRIC}
              methodologyMetric={RESUME_METHODOLOGY_METRIC}
              deliveryMetric={RESUME_DELIVERY_METRIC}
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
