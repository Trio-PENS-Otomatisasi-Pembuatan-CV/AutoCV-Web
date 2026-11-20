export interface ResumeMetricCard {
  label: string; // Nilai utama yang ditampilkan besar
  sublabel: string; // Deskripsi kecil di bawahnya
}

export const RESUME_FORMAT_METRIC: ResumeMetricCard = {
  label: "Single Column",
  sublabel: "Standard ATS",
};

export const RESUME_METHODOLOGY_METRIC: ResumeMetricCard = {
  label: "STAR Format",
  sublabel: "Action Bullets",
};

export const RESUME_DELIVERY_METRIC: ResumeMetricCard = {
  label: "UiPath RPA",
  sublabel: "Word & PDF Export",
};
