import React, { useMemo } from "react";
import { Navbar } from "../organisms/Navbar";
import { InputForm } from "../organisms/InputForm";
import { ProgressStepper } from "../organisms/ProgressStepper";
import { CurationDashboard } from "../organisms/CurationDashboard";
import { DeliveryView } from "../organisms/DeliveryView";
import { InteractiveGlowCanvas } from "../atoms/InteractiveGlowCanvas";
import { Button } from "../atoms/Button";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { UserSession } from "../../hooks/useAuthSession";
import type { useCVWorkflow } from "../../hooks/useCVWorkflow";
import type { useCurator } from "../../hooks/useCurator";
import { useTheme } from "../../hooks/useTheme";
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
  const { isDark, toggleTheme } = useTheme();

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
    hasCurated,
    emailSentTo,
    emailSentAt,
    isSendingEmail,
    emailSendError,
    handleFormFieldChange,
    handleUseSample,
    handleSubmitJob,
    handleApproveCuration,
    handleDownloadPdf,
    handleSendEmail,
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
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    toggleCustomSection,
    regenerateSummaryWithAI,
    requestAIRewrite,
  } = curator;

  const isFailed = status === "FAILED";

  const atsScore = useMemo(
    () => calculateAtsScore(curatedResume),
    [curatedResume]
  );

  return (
    <div className="relative min-h-screen bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans pb-16 overflow-x-clip transition-colors duration-300">
      {/* Interactive Mouse-following Glow & Ambient Mesh Canvas */}
      <InteractiveGlowCanvas isDark={isDark} />

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar
          onBackToInput={currentStep === "curation" ? () => setCurrentStep("input") : undefined}
          activeProfileName={currentStep === "curation" ? curatedResume.profile.fullName : undefined}
          activeProfileHeadline={currentStep === "curation" ? curatedResume.profile.headline : undefined}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        <main
          className={`flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 ${
            currentStep === "curation" ? "pt-4 sm:pt-6" : "pt-6 sm:pt-8"
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
                onNavigateStep={(step) => {
                  if (step === "input") setCurrentStep("input");
                  else if (step === "curation" && resumeData) setCurrentStep("curation");
                  else if (step === "delivery" && resumeData) setCurrentStep("delivery");
                }}
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
                <div className="mt-6 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
                        Job Failed
                      </h3>
                      <p className="mt-1 text-sm text-red-700 dark:text-red-300 leading-relaxed">
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
                language={curatedResume.language}
                onUpdateProfile={updateProfile}
                onUpdateSummary={updateSummary}
                onToggleProject={toggleProject}
                onToggleExperience={toggleExperience}
                onUpdateExperienceBullets={updateExperienceBullets}
                onUpdateSkillCategoryItems={updateSkillCategoryItems}
                onAddCustomSection={addCustomSection}
                onUpdateCustomSection={updateCustomSection}
                onRemoveCustomSection={removeCustomSection}
                onToggleCustomSection={toggleCustomSection}
                onRegenerateSummary={regenerateSummaryWithAI}
                onRequestAIRewrite={requestAIRewrite}
                onRerunSynthesis={() => setResume(resumeData)}
                onApprove={() => {
                  setResumeData(curatedResume);
                  handleApproveCuration(curatedResume);
                }}
                onBackToInput={() => setCurrentStep("input")}
                isApproving={isApproving}
                onNavigateStep={(step) => {
                  if (step === "input") setCurrentStep("input");
                  else if (step === "curation") setCurrentStep("curation");
                  else if (step === "delivery") setCurrentStep("delivery");
                }}
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
                recipientEmail={formData.recipientEmail}
                emailSentTo={emailSentTo}
                emailSentAt={emailSentAt}
                isSendingEmail={isSendingEmail}
                emailSendError={emailSendError}
                onResendEmail={handleSendEmail}
                onNavigateStep={(step) => {
                  if (step === "input") setCurrentStep("input");
                  else if (step === "curation") setCurrentStep("curation");
                  else if (step === "delivery") setCurrentStep("delivery");
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};