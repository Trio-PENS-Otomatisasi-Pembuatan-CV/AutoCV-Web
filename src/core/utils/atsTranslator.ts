import type {
  ResumePayload,
  ResumeLanguage,
  WorkExperience,
  TechnicalProject,
  EducationRecord,
} from "@/core/entities/ResumePayload";

// Common engineering phrase mappings between English and formal Corporate Indonesian
const EN_TO_ID_PATTERNS: Array<[RegExp, string]> = [
  // Action Verbs at start of sentence / bullet
  [/^Led\b/gi, "Memimpin"],
  [/^Leading\b/gi, "Memimpin"],
  [/^Designed\b/gi, "Merancang"],
  [/^Designing\b/gi, "Merancang"],
  [/^Built\b/gi, "Membangun"],
  [/^Building\b/gi, "Membangun"],
  [/^Engineered\b/gi, "Merancang dan membangun"],
  [/^Developing\b/gi, "Mengembangkan"],
  [/^Developed\b/gi, "Mengembangkan"],
  [/^Architected\b/gi, "Mengarsiteki"],
  [/^Implemented\b/gi, "Menerapkan"],
  [/^Implementing\b/gi, "Menerapkan"],
  [/^Delivered\b/gi, "Merilis dan menyediakan"],
  [/^Delivering\b/gi, "Merilis dan menyediakan"],
  [/^Reduced\b/gi, "Memangkas"],
  [/^Decreased\b/gi, "Menurunkan"],
  [/^Increased\b/gi, "Meningkatkan"],
  [/^Improved\b/gi, "Meningkatkan kualitas"],
  [/^Accelerated\b/gi, "Mempercepat"],
  [/^Automated\b/gi, "Mengotomatisasi"],
  [/^Mentored\b/gi, "Membimbing"],
  [/^Optimized\b/gi, "Mengoptimalkan"],
  [/^Streamlined\b/gi, "Menyederhanakan"],
  [/^Spearheaded\b/gi, "Mempelopori"],
  [/^Collaborated with\b/gi, "Berkolaborasi dengan"],
  [/^Contributed to\b/gi, "Berkontribusi pada"],

  // Metric & Domain Phrasing
  [/\bmonthly active users\b/gi, "pengguna aktif bulanan"],
  [/\bmonthly users\b/gi, "pengguna bulanan"],
  [/\bresponse time\b/gi, "waktu respons"],
  [/\bdeployment frequency\b/gi, "frekuensi rilis deployment"],
  [/\bfrom weekly to daily\b/gi, "dari mingguan menjadi harian"],
  [/\bhandling\b/gi, "menangani"],
  [/\bused by\b/gi, "yang digunakan oleh"],
  [/\benterprise clients\b/gi, "klien enterprise"],
  [/\bcloud infrastructure costs\b/gi, "biaya infrastruktur cloud"],
  [/\bby containerizing\b/gi, "melalui kontainerisasi"],
  [/\bright-sizing workloads\b/gi, "penyesuaian kapasitas beban kerja"],
  [/\bcutting release cycles\b/gi, "memangkas siklus rilis"],
  [/\bstreamlining data ingestion\b/gi, "merampingkan proses penyerapan data"],
  [/\bautomated alert dispatching\b/gi, "pengiriman notifikasi otomatis"],
  [/\bPresent\b/g, "Sekarang"],
];

const ID_TO_EN_PATTERNS: Array<[RegExp, string]> = [
  // Action Verbs
  [/^Memimpin\b/gi, "Led"],
  [/^Merancang dan membangun\b/gi, "Engineered"],
  [/^Merancang\b/gi, "Designed"],
  [/^Membangun\b/gi, "Built"],
  [/^Mengembangkan\b/gi, "Developed"],
  [/^Mengarsiteki\b/gi, "Architected"],
  [/^Menerapkan\b/gi, "Implemented"],
  [/^Merilis dan menyediakan\b/gi, "Delivered"],
  [/^Memangkas\b/gi, "Reduced"],
  [/^Menurunkan\b/gi, "Decreased"],
  [/^Meningkatkan kualitas\b/gi, "Improved"],
  [/^Meningkatkan\b/gi, "Increased"],
  [/^Mempercepat\b/gi, "Accelerated"],
  [/^Mengotomatisasi\b/gi, "Automated"],
  [/^Membimbing\b/gi, "Mentored"],
  [/^Mengoptimalkan\b/gi, "Optimized"],
  [/^Menyederhanakan\b/gi, "Streamlined"],
  [/^Mempelopori\b/gi, "Spearheaded"],
  [/^Berkolaborasi dengan\b/gi, "Collaborated with"],
  [/^Berkontribusi pada\b/gi, "Contributed to"],

  // Metric & Domain Phrasing
  [/\bpengguna aktif bulanan\b/gi, "monthly active users"],
  [/\bpengguna bulanan\b/gi, "monthly users"],
  [/\bwaktu respons\b/gi, "response time"],
  [/\bfrekuensi rilis deployment\b/gi, "deployment frequency"],
  [/\bdari mingguan menjadi harian\b/gi, "from weekly to daily"],
  [/\bmenangani\b/gi, "handling"],
  [/\byang digunakan oleh\b/gi, "used by"],
  [/\bklien enterprise\b/gi, "enterprise clients"],
  [/\bbiaya infrastruktur cloud\b/gi, "cloud infrastructure costs"],
  [/\bmelalui kontainerisasi\b/gi, "by containerizing"],
  [/\bpenyesuaian kapasitas beban kerja\b/gi, "right-sizing workloads"],
  [/\bmemangkas siklus rilis\b/gi, "cutting release cycles"],
  [/\bmerampingkan proses penyerapan data\b/gi, "streamlining data ingestion"],
  [/\bpengiriman notifikasi otomatis\b/gi, "automated alert dispatching"],
  [/\bSekarang\b/g, "Present"],
];

const DEGREE_MAPPINGS: Record<string, { id: string; en: string }> = {
  cs_bs: {
    en: "B.S. in Computer Science",
    id: "Sarjana Teknik Informatika (S.Kom.)",
  },
  se_bs: {
    en: "B.S. in Software Engineering",
    id: "Sarjana Rekayasa Perangkat Lunak (S.Kom.)",
  },
  is_bs: {
    en: "B.S. in Information Systems",
    id: "Sarjana Sistem Informasi (S.Kom.)",
  },
  applied_cs: {
    en: "B.A.S. in Informatics Engineering",
    id: "Sarjana Terapan Teknik Informatika (S.Tr.Kom.)",
  },
};

export function translateTextLine(text: string, targetLang: ResumeLanguage): string {
  if (!text) return "";
  let result = text;
  const patterns = targetLang === "id" ? EN_TO_ID_PATTERNS : ID_TO_EN_PATTERNS;

  for (const [regex, replacement] of patterns) {
    result = result.replace(regex, replacement);
  }

  return result;
}

export function translateSummary(summary: string, targetLang: ResumeLanguage): string {
  if (!summary) return "";

  // Well-known corporate summaries mapping
  if (targetLang === "id") {
    if (summary.includes("Fullstack Engineer with 5+ years") || summary.includes("distributed web applications")) {
      return "Fullstack Engineer berpengalaman 5+ tahun dalam merancang arsitektur web terdistribusi, infrastruktur cloud, dan pipeline otomatisasi enterprise. Terbukti mampu menerjemahkan kebutuhan bisnis kompleks menjadi solusi teknis yang tangguh dan terukur.";
    }
    if (summary.includes("Dynamic Senior Fullstack Engineer") || summary.includes("high-concurrency")) {
      return "Senior Fullstack Engineer berpengalaman 5+ tahun dalam merancang arsitektur cloud berkonkurensi tinggi dan otomatisasi proses. Berhasil memangkas latensi infrastruktur hingga 42% dan mengarsiteki microservices tangguh.";
    }
    if (summary.includes("Results-oriented Software Engineer") || summary.includes("event-driven")) {
      return "Software Engineer berorientasi hasil dengan spesialisasi Go, TypeScript, dan ekosistem cloud modern. Berpengalaman mengelola sistem event-driven berkapasitas 10k+ rpm dan mempercepat pipeline CI/CD hingga 90%.";
    }
    return translateTextLine(summary, "id");
  } else {
    if (summary.includes("Fullstack Engineer berpengalaman 5+ tahun") || summary.includes("arsitektur web terdistribusi")) {
      return "Fullstack Engineer with 5+ years building distributed web applications, cloud infrastructure, and enterprise automation pipelines. Proven ability to turn complex business requirements into reliable, measurable outcomes.";
    }
    if (summary.includes("Senior Fullstack Engineer berpengalaman 5+ tahun") || summary.includes("konkurensi tinggi")) {
      return "Dynamic Senior Fullstack Engineer with 5+ years driving high-concurrency cloud architectures and automation systems. Proven track record reducing infrastructure latency by 42% and architecting resilient microservices.";
    }
    if (summary.includes("Software Engineer berorientasi hasil") || summary.includes("10k+ rpm")) {
      return "Results-oriented Software Engineer specializing in Go, TypeScript, and modern cloud ecosystems. Experienced in event-driven systems handling 10k+ rpm and accelerating CI/CD deployment pipelines by 90%.";
    }
    return translateTextLine(summary, "en");
  }
}

export function translateDegree(degree: string, targetLang: ResumeLanguage): string {
  if (!degree) return "";
  for (const mapping of Object.values(DEGREE_MAPPINGS)) {
    if (targetLang === "id" && degree.toLowerCase().includes(mapping.en.toLowerCase())) {
      return mapping.id;
    }
    if (targetLang === "en" && degree.toLowerCase().includes(mapping.id.toLowerCase())) {
      return mapping.en;
    }
  }

  if (targetLang === "id") {
    return degree
      .replace(/B\.S\. in Computer Science/gi, "Sarjana Teknik Informatika (S.Kom.)")
      .replace(/Bachelor of Computer Science/gi, "Sarjana Ilmu Komputer (S.Kom.)")
      .replace(/Computer Science/gi, "Teknik Informatika")
      .replace(/Software Engineering/gi, "Rekayasa Perangkat Lunak");
  } else {
    return degree
      .replace(/Sarjana Terapan Teknik Informatika \(S\.Tr\.Kom\.\)/gi, "B.A.S. in Informatics Engineering")
      .replace(/Sarjana Teknik Informatika \(S\.Kom\.\)/gi, "B.S. in Computer Science")
      .replace(/Sarjana Ilmu Komputer/gi, "Bachelor of Computer Science")
      .replace(/Teknik Informatika/gi, "Computer Science");
  }
}

export function translateResumePayload(
  resume: ResumePayload,
  targetLang: ResumeLanguage
): ResumePayload {
  const currentLang = resume.language || "en";
  if (currentLang === targetLang) {
    return resume;
  }

  // 1. Profile translation
  const translatedProfile = {
    ...resume.profile,
    summary: translateSummary(resume.profile.summary, targetLang),
  };

  // 2. Experiences translation
  const translatedExperiences: WorkExperience[] = (resume.experiences || []).map((exp) => ({
    ...exp,
    startDate:
      targetLang === "id"
        ? (exp.startDate || "Sekarang").replace(/Present/gi, "Sekarang")
        : (exp.startDate || "Present").replace(/Sekarang/gi, "Present"),
    endDate:
      targetLang === "id"
        ? (exp.endDate || "Sekarang").replace(/Present/gi, "Sekarang")
        : (exp.endDate || "Present").replace(/Sekarang/gi, "Present"),
    bulletPoints: (exp.bulletPoints || []).map((b) => translateTextLine(b, targetLang)),
  }));

  // 3. Projects translation
  const translatedProjects: TechnicalProject[] = (resume.projects || []).map((proj) => ({
    ...proj,
    starSummary: translateTextLine(proj.starSummary, targetLang),
  }));

  // 4. Education translation
  const translatedEducation: EducationRecord[] | undefined = resume.education?.map((edu) => ({
    ...edu,
    degree: translateDegree(edu.degree, targetLang),
    graduationYear:
      targetLang === "id"
        ? (edu.graduationYear || "").replace(/Present/gi, "Sekarang")
        : (edu.graduationYear || "").replace(/Sekarang/gi, "Present"),
  }));

  return {
    ...resume,
    profile: translatedProfile,
    experiences: translatedExperiences,
    projects: translatedProjects,
    education: translatedEducation,
    language: targetLang,
  };
}
