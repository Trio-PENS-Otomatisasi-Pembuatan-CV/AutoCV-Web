export interface ResumeMetricCard {
  label: string;
  sublabel: string;
}

export interface ScoreCard extends ResumeMetricCard {
  score: number;
}

export const RESUME_FORMAT_METRIC: ScoreCard = {
  label: "Single Column",
  sublabel: "Standard ATS",
  score: 100,
};

export const RESUME_METHODOLOGY_METRIC: ScoreCard = {
  label: "STAR Format",
  sublabel: "Action Bullets",
  score: 100,
};

export const RESUME_DELIVERY_METRIC: ScoreCard = {
  label: "Web Email Delivery",
  sublabel: "AUTODELIVERY",
  score: 100,
};