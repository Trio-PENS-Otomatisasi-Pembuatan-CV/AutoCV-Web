import type {
  ResumePayload,
  ResumeLanguage,
  WorkExperience,
  TechnicalProject,
  EducationRecord,
  SkillCategory,
  CustomSection,
} from "@/core/entities/ResumePayload";

// 1. Exact Sentence / Bullet / Summary pairs for seamless bidirectional translation
const EXACT_PAIRS: Array<{ en: string; id: string }> = [
  // Summaries
  {
    en: "Fullstack Engineer with 5+ years building distributed web applications, cloud infrastructure, and enterprise automation pipelines. Proven ability to turn complex business requirements into reliable, measurable outcomes.",
    id: "Fullstack Engineer berpengalaman 5+ tahun dalam merancang arsitektur web terdistribusi, infrastruktur cloud, dan pipeline otomatisasi enterprise. Terbukti mampu menerjemahkan kebutuhan bisnis kompleks menjadi solusi teknis yang tangguh dan terukur.",
  },
  {
    en: "Dynamic Senior Fullstack Engineer with 5+ years driving high-concurrency cloud architectures and automation systems. Proven track record reducing infrastructure latency by 42% and architecting resilient microservices.",
    id: "Senior Fullstack Engineer berpengalaman 5+ tahun dalam merancang arsitektur cloud berkonkurensi tinggi dan sistem otomatisasi proses. Terbukti berhasil memangkas latensi infrastruktur hingga 42% serta mengarsiteki microservices tangguh.",
  },
  {
    en: "Results-oriented Software Engineer specializing in Go, TypeScript, and modern cloud ecosystems. Experienced in event-driven systems handling 10k+ rpm and accelerating CI/CD deployment pipelines by 90%.",
    id: "Software Engineer berorientasi hasil dengan spesialisasi Go, TypeScript, dan ekosistem modern cloud. Berpengalaman mengelola sistem event-driven berkapasitas 10k+ rpm dan mempercepat pipeline CI/CD hingga 90%.",
  },
  {
    en: "Fullstack Cloud & RPA Automation Engineer passionate about bridging robotic process automation with intuitive web applications. Adept at designing scalable APIs, leading technical migrations, and mentoring agile engineering teams.",
    id: "Insinyur Otomasi RPA & Fullstack Cloud yang memadukan otomatisasi proses robotik dengan aplikasi web modern. Mahir merancang REST API terukur, memimpin migrasi teknis, dan membimbing tim rekayasa perangkat lunak.",
  },
  {
    en: "Accomplished engineering professional with proven expertise in building modern software architectures and automation pipelines.",
    id: "Profesional rekayasa perangkat lunak berpengalaman dengan keahlian teruji dalam membangun arsitektur sistem modern dan otomatisasi proses.",
  },

  // Experience Bullets
  {
    en: "Led migration of a monolithic billing platform to 12 Go microservices on Kubernetes, improving p95 response time by 42%.",
    id: "Memimpin migrasi platform billing monolitik ke 12 microservices berbasis Go pada Kubernetes, memangkas p95 response time sebesar 42%.",
  },
  {
    en: "Mentored 4 engineers and introduced trunk-based development, increasing deployment frequency from weekly to daily.",
    id: "Membimbing 4 engineer dan menerapkan metode trunk-based development, meningkatkan frekuensi deployment dari mingguan menjadi harian.",
  },
  {
    en: "Designed a Next.js customer portal serving 80k monthly users with 99.95% uptime.",
    id: "Merancang portal pelanggan berbasis Next.js yang melayani 80rb pengguna aktif bulanan dengan uptime 99,95%.",
  },
  {
    en: "Delivered REST APIs in Go and PostgreSQL for a logistics tracking product used by 120+ enterprise clients.",
    id: "Merilis dan menyediakan REST API berbasis Go dan PostgreSQL untuk produk pelacakan logistik yang digunakan oleh 120+ klien enterprise.",
  },
  {
    en: "Reduced cloud infrastructure costs by 28% by containerizing legacy services and right-sizing workloads.",
    id: "Memangkas biaya infrastruktur cloud sebesar 28% melalui kontainerisasi layanan warisan (legacy) dan penyesuaian kapasitas beban kerja.",
  },
  {
    en: "Led development of high-throughput web architectures and enterprise automation pipelines.",
    id: "Memimpin pengembangan arsitektur web berkapasitas tinggi dan pipeline otomatisasi enterprise.",
  },
  {
    en: "Collaborated with cross-functional teams to deliver scalable software solutions.",
    id: "Berkolaborasi dengan tim lintas fungsi untuk menghasilkan solusi perangkat lunak yang terukur.",
  },
  {
    en: "Delivered backend REST services and integrated cloud infrastructure for enterprise workflows.",
    id: "Merilis layanan backend REST dan mengintegrasikan infrastruktur cloud untuk alur kerja enterprise.",
  },
  {
    en: "Containerized legacy components with Docker and optimized database performance.",
    id: "Mengkontainerisasi komponen warisan (legacy) dengan Docker dan mengoptimalkan performa basis data.",
  },
  {
    en: "Contributed to core organizational activities and technical initiatives.",
    id: "Berkontribusi pada aktivitas utama organisasi dan inisiatif teknis strategis.",
  },
  {
    en: "Contributed to core team initiatives and organizational activities.",
    id: "Berkontribusi pada inisiatif strategis tim dan operasional teknis organisasi.",
  },

  // Project Summaries
  {
    en: "Engineered an event-driven inventory service handling 10k+ rpm using Go and RabbitMQ, reducing checkout latency by 35%. Implemented zero-downtime deployment pipelines with Docker and GitHub Actions, cutting release cycles from 2 hours to 8 minutes.",
    id: "Merancang dan membangun layanan inventaris berbasis event-driven berkapasitas 10k+ rpm menggunakan Go dan RabbitMQ, mengurangi latensi checkout sebesar 35%. Menerapkan pipeline deployment nir-henti dengan Docker dan GitHub Actions, memangkas siklus rilis dari 2 jam menjadi 8 menit.",
  },
  {
    en: "Built an automated resume parser synchronizing REST APIs and RPA engines, streamlining data ingestion for 500+ candidates.",
    id: "Membangun resume parser otomatis yang menyinkronkan REST API dan mesin RPA, merampingkan proses penyerapan data untuk 500+ kandidat.",
  },
  {
    en: "Developed real-time metrics collector for containerized Kubernetes workloads with automated alert dispatching.",
    id: "Mengembangkan pengumpul metrik real-time untuk beban kerja Kubernetes dengan pengiriman notifikasi otomatis.",
  },
  {
    en: "Comprehensive technical documentation and architectural specifications for software workflows.",
    id: "Dokumentasi teknis komprehensif dan spesifikasi arsitektur untuk alur kerja perangkat lunak.",
  },
  {
    en: "Automated CI/CD security scanning pipelines and infrastructure deployment configurations.",
    id: "Pipeline pemindaian keamanan CI/CD otomatis dan konfigurasi deployment infrastruktur.",
  },
  {
    en: "Hands-on container orchestration, system administration, and network configuration laboratory repository.",
    id: "Repositori laboratorium orkestrasi kontainer praktis, administrasi sistem, dan konfigurasi jaringan.",
  },
  {
    en: "High-performance backend services, data persistence, and RESTful API endpoints.",
    id: "Layanan backend berkinerja tinggi, persistensi data, dan endpoint RESTful API.",
  },
  {
    en: "Modern responsive web application interface with component architecture.",
    id: "Antarmuka aplikasi web responsif modern dengan arsitektur berbasis komponen.",
  },
  {
    en: "Cross-platform mobile application interface with offline state management.",
    id: "Antarmuka aplikasi mobile lintas platform dengan manajemen status offline.",
  },
  {
    en: "Engineered modular technical software solution following clean architecture principles.",
    id: "Merancang dan membangun solusi perangkat lunak teknis modular mengikuti prinsip arsitektur bersih (clean architecture).",
  },
];

// 2. Comprehensive Phrasal / Regex patterns (ordered longest to shortest match)
const EN_TO_ID_PATTERNS: Array<[RegExp, string]> = [
  // Full clauses & metric phrases
  [/\bzero-downtime deployment pipelines\b/gi, "pipeline deployment nir-henti"],
  [/\bzero-downtime deployment\b/gi, "deployment tanpa waktu henti"],
  [/\bhigh-throughput event-driven microservices\b/gi, "microservices event-driven berkapasitas tinggi"],
  [/\bhigh-throughput web architectures\b/gi, "arsitektur web berkapasitas tinggi"],
  [/\bcloud infrastructure costs\b/gi, "biaya infrastruktur cloud"],
  [/\bcloud infrastructure\b/gi, "infrastruktur cloud"],
  [/\benterprise automation pipelines\b/gi, "pipeline otomatisasi enterprise"],
  [/\benterprise automation\b/gi, "otomatisasi enterprise"],
  [/\bmonolithic billing platform\b/gi, "platform billing monolitik"],
  [/\bmonolithic platform\b/gi, "platform monolitik"],
  [/\btrunk-based development\b/gi, "metode trunk-based development"],
  [/\bcustomer portal\b/gi, "portal pelanggan"],
  [/\bmonthly active users\b/gi, "pengguna aktif bulanan"],
  [/\bmonthly users\b/gi, "pengguna bulanan"],
  [/\bp95 response time\b/gi, "waktu respons p95"],
  [/\bresponse time\b/gi, "waktu respons"],
  [/\bdeployment frequency\b/gi, "frekuensi rilis deployment"],
  [/\bfrom weekly to daily\b/gi, "dari mingguan menjadi harian"],
  [/\blogistics tracking product\b/gi, "produk pelacakan logistik"],
  [/\benterprise clients\b/gi, "klien enterprise"],
  [/\benterprise workflows\b/gi, "alur kerja enterprise"],
  [/\bby containerizing legacy services\b/gi, "melalui kontainerisasi layanan warisan"],
  [/\bby containerizing\b/gi, "melalui kontainerisasi"],
  [/\bright-sizing workloads\b/gi, "penyesuaian kapasitas beban kerja"],
  [/\bevent-driven inventory service\b/gi, "layanan inventaris berbasis event-driven"],
  [/\bevent-driven systems\b/gi, "sistem berbasis event-driven"],
  [/\bcheckout latency\b/gi, "latensi checkout"],
  [/\bcutting release cycles\b/gi, "memangkas siklus rilis"],
  [/\brelease cycles\b/gi, "siklus rilis"],
  [/\bautomated resume parser\b/gi, "parser resume otomatis"],
  [/\bsynchronizing REST APIs and RPA engines\b/gi, "menyinkronkan REST API dan mesin RPA"],
  [/\bstreamlining data ingestion\b/gi, "merampingkan proses penyerapan data"],
  [/\bdata ingestion\b/gi, "penyerapan data"],
  [/\breal-time metrics collector\b/gi, "pengumpul metrik real-time"],
  [/\bcontainerized Kubernetes workloads\b/gi, "beban kerja Kubernetes terkontainerisasi"],
  [/\bautomated alert dispatching\b/gi, "pengiriman notifikasi otomatis"],
  [/\bcross-functional teams\b/gi, "tim lintas fungsi"],
  [/\bscalable software solutions\b/gi, "solusi perangkat lunak terukur"],
  [/\bbackend REST services\b/gi, "layanan backend REST"],
  [/\bintegrated cloud infrastructure\b/gi, "infrastruktur cloud terintegrasi"],
  [/\blegacy components\b/gi, "komponen warisan (legacy)"],
  [/\bdatabase performance\b/gi, "performa basis data"],
  [/\bcore organizational activities\b/gi, "aktivitas utama organisasi"],
  [/\btechnical initiatives\b/gi, "inisiatif teknis"],
  [/\bclean architecture principles\b/gi, "prinsip arsitektur bersih (clean architecture)"],
  [/\boffline state management\b/gi, "manajemen status offline"],
  [/\bcomponent architecture\b/gi, "arsitektur berbasis komponen"],
  [/\bresponsive web application\b/gi, "aplikasi web responsif"],
  [/\bdata persistence\b/gi, "persistensi data"],
  [/\bsecurity scanning pipelines\b/gi, "pipeline pemindaian keamanan"],
  [/\bcontainer orchestration\b/gi, "orkestrasi kontainer"],
  [/\bsystem administration\b/gi, "administrasi sistem"],
  [/\bnetwork configuration\b/gi, "konfigurasi jaringan"],
  [/\barchitectural specifications\b/gi, "spesifikasi arsitektur"],

  // Connecting phrases & prepositions
  [/\bto process over\b/gi, "untuk memproses lebih dari"],
  [/\bto process\b/gi, "untuk memproses"],
  [/\bto deliver\b/gi, "untuk menghasilkan"],
  [/\bused by\b/gi, "yang digunakan oleh"],
  [/\bserving\b/gi, "yang melayani"],
  [/\bhandling\b/gi, "yang menangani"],
  [/\bcutting\b/gi, "memangkas"],
  [/\breducing\b/gi, "mengurangi"],
  [/\bimproving\b/gi, "meningkatkan"],
  [/\bincreasing\b/gi, "meningkatkan"],
  [/\boptimizing\b/gi, "mengoptimalkan"],
  [/\bstreamlining\b/gi, "merampingkan"],
  [/\bbuilt with\b/gi, "yang dibangun dengan"],
  [/\bdeveloped in\b/gi, "yang dikembangkan dengan"],
  [/\busing\b/gi, "menggunakan"],
  [/\bwith\b/gi, "dengan"],
  [/\bfor\b/gi, "untuk"],
  [/\bfrom\b/gi, "dari"],
  [/\bto\b/gi, "ke"],
  [/\band\b/gi, "dan"],
  [/\bby\b/gi, "sebesar"],
  [/\bper minute\b/gi, "per menit"],
  [/\bcandidates\b/gi, "kandidat"],
  [/\bengineers\b/gi, "engineer"],

  // Action Verbs (sentence starters)
  [/^Led\b/gi, "Memimpin"],
  [/^Leading\b/gi, "Memimpin"],
  [/^Designed\b/gi, "Merancang"],
  [/^Designing\b/gi, "Merancang"],
  [/^Built\b/gi, "Membangun"],
  [/^Building\b/gi, "Membangun"],
  [/^Engineered\b/gi, "Merancang dan membangun"],
  [/^Engineering\b/gi, "Merancang dan membangun"],
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
  [/^Containerized\b/gi, "Mengkontainerisasi"],
  [/^Maintained\b/gi, "Memelihara"],
  [/^Created\b/gi, "Membuat"],
  [/^Configured\b/gi, "Mengonfigurasi"],
  [/^Integrated\b/gi, "Mengintegrasikan"],
];

const ID_TO_EN_PATTERNS: Array<[RegExp, string]> = [
  // Full clauses
  [/\bpipeline deployment nir-henti\b/gi, "zero-downtime deployment pipelines"],
  [/\bdeployment tanpa waktu henti\b/gi, "zero-downtime deployment"],
  [/\bmicroservices event-driven berkapasitas tinggi\b/gi, "high-throughput event-driven microservices"],
  [/\barsitektur web berkapasitas tinggi\b/gi, "high-throughput web architectures"],
  [/\bbiaya infrastruktur cloud\b/gi, "cloud infrastructure costs"],
  [/\binfrastruktur cloud\b/gi, "cloud infrastructure"],
  [/\bpipeline otomatisasi enterprise\b/gi, "enterprise automation pipelines"],
  [/\botomatisasi enterprise\b/gi, "enterprise automation"],
  [/\bplatform billing monolitik\b/gi, "monolithic billing platform"],
  [/\bplatform monolitik\b/gi, "monolithic platform"],
  [/\bmetode trunk-based development\b/gi, "trunk-based development"],
  [/\bportal pelanggan\b/gi, "customer portal"],
  [/\bpengguna aktif bulanan\b/gi, "monthly active users"],
  [/\bpengguna bulanan\b/gi, "monthly users"],
  [/\bwaktu respons p95\b/gi, "p95 response time"],
  [/\bwaktu respons\b/gi, "response time"],
  [/\bfrekuensi rilis deployment\b/gi, "deployment frequency"],
  [/\bdari mingguan menjadi harian\b/gi, "from weekly to daily"],
  [/\bproduk pelacakan logistik\b/gi, "logistics tracking product"],
  [/\bklien enterprise\b/gi, "enterprise clients"],
  [/\balur kerja enterprise\b/gi, "enterprise workflows"],
  [/\bmelalui kontainerisasi layanan warisan\b/gi, "by containerizing legacy services"],
  [/\bmelalui kontainerisasi\b/gi, "by containerizing"],
  [/\bpenyesuaian kapasitas beban kerja\b/gi, "right-sizing workloads"],
  [/\blayanan inventaris berbasis event-driven\b/gi, "event-driven inventory service"],
  [/\bsistem berbasis event-driven\b/gi, "event-driven systems"],
  [/\blatensi checkout\b/gi, "checkout latency"],
  [/\bmemangkas siklus rilis\b/gi, "cutting release cycles"],
  [/\bsiklus rilis\b/gi, "release cycles"],
  [/\bparser resume otomatis\b/gi, "automated resume parser"],
  [/\bmenyinkronkan REST API dan mesin RPA\b/gi, "synchronizing REST APIs and RPA engines"],
  [/\bmerampingkan proses penyerapan data\b/gi, "streamlining data ingestion"],
  [/\bpenyerapan data\b/gi, "data ingestion"],
  [/\bpengumpul metrik real-time\b/gi, "real-time metrics collector"],
  [/\bbeban kerja Kubernetes terkontainerisasi\b/gi, "containerized Kubernetes workloads"],
  [/\bpengiriman notifikasi otomatis\b/gi, "automated alert dispatching"],
  [/\btim lintas fungsi\b/gi, "cross-functional teams"],
  [/\bsolusi perangkat lunak terukur\b/gi, "scalable software solutions"],
  [/\blayanan backend REST\b/gi, "backend REST services"],
  [/\binfrastruktur cloud terintegrasi\b/gi, "integrated cloud infrastructure"],
  [/\bkomponen warisan \(legacy\)\b/gi, "legacy components"],
  [/\bperforma basis data\b/gi, "database performance"],
  [/\baktivitas utama organisasi\b/gi, "core organizational activities"],
  [/\binisiatif teknis\b/gi, "technical initiatives"],
  [/\bprinsip arsitektur bersih \(clean architecture\)\b/gi, "clean architecture principles"],
  [/\bmanajemen status offline\b/gi, "offline state management"],
  [/\barsitektur berbasis komponen\b/gi, "component architecture"],
  [/\baplikasi web responsif\b/gi, "responsive web application"],
  [/\bpersistensi data\b/gi, "data persistence"],
  [/\bpipeline pemindaian keamanan\b/gi, "security scanning pipelines"],
  [/\borkestrasi kontainer praktis\b/gi, "hands-on container orchestration"],
  [/\badministrasi sistem\b/gi, "system administration"],
  [/\bkonfigurasi jaringan\b/gi, "network configuration"],
  [/\bspesifikasi arsitektur\b/gi, "architectural specifications"],

  // Connecting phrases
  [/\buntuk memproses lebih dari\b/gi, "to process over"],
  [/\byang digunakan oleh\b/gi, "used by"],
  [/\byang melayani\b/gi, "serving"],
  [/\byang menangani\b/gi, "handling"],
  [/\bper menit\b/gi, "per minute"],

  // Action Verbs
  [/^Memimpin\b/gi, "Led"],
  [/^Merancang dan membangun\b/gi, "Engineered"],
  [/^Merancang\b/gi, "Designed"],
  [/^Membangun\b/gi, "Built"],
  [/^Mengembangkan\b/gi, "Developed"],
  [/^Mengarsiteki\b/gi, "Architected"],
  [/^Menerapkan\b/gi, "Implemented"],
  [/^Merilis dan menyediakan\b/gi, "Delivered"],
  [/^Merilis\b/gi, "Delivered"],
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
  [/^Mengkontainerisasi\b/gi, "Containerized"],
  [/^Memelihara\b/gi, "Maintained"],
  [/^Membuat\b/gi, "Created"],
  [/^Mengonfigurasi\b/gi, "Configured"],
  [/^Mengintegrasikan\b/gi, "Integrated"],
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
  general_cs: {
    en: "Bachelor of Computer Science",
    id: "Sarjana Ilmu Komputer (S.Kom.)",
  },
};

const SKILL_CATEGORY_MAP: Record<string, { en: string; id: string }> = {
  programming_languages: { en: "Programming Languages", id: "Bahasa Pemrograman" },
  languages: { en: "Languages", id: "Bahasa Pemrograman" },
  frameworks: { en: "Frameworks", id: "Framework & Library" },
  developer_tools: { en: "Developer Tools", id: "Alat Pengembangan" },
  technical_skills: { en: "Technical Skills", id: "Keahlian Teknis" },
  cloud_devops: { en: "Cloud & DevOps", id: "Cloud & DevOps" },
  databases: { en: "Databases", id: "Basis Data" },
  core_competencies: { en: "Core Competencies", id: "Kompetensi Utama" },
  certifications: { en: "Certifications", id: "Sertifikasi" },
};

export function translateSkillCategory(category: string, targetLang: ResumeLanguage): string {
  if (!category) return "";
  const normalized = category.trim().toLowerCase();

  for (const item of Object.values(SKILL_CATEGORY_MAP)) {
    if (targetLang === "id" && normalized === item.en.toLowerCase()) {
      return item.id;
    }
    if (targetLang === "en" && normalized === item.id.toLowerCase()) {
      return item.en;
    }
  }

  if (targetLang === "id") {
    if (/lang/i.test(category)) return "Bahasa Pemrograman";
    if (/framework/i.test(category)) return "Framework & Library";
    if (/tool/i.test(category)) return "Alat Pengembangan";
    if (/database/i.test(category)) return "Basis Data";
    if (/skill/i.test(category)) return "Keahlian Teknis";
  } else {
    if (/bahasa/i.test(category)) return "Programming Languages";
    if (/alat/i.test(category)) return "Developer Tools";
    if (/basis data/i.test(category)) return "Databases";
    if (/keahlian/i.test(category)) return "Technical Skills";
  }

  return category;
}

export function translateDate(dateInput: unknown, targetLang: ResumeLanguage): string {
  if (dateInput === null || dateInput === undefined) {
    return targetLang === "id" ? "Sekarang" : "Present";
  }
  let result = String(dateInput).trim();
  if (!result) return targetLang === "id" ? "Sekarang" : "Present";

  if (targetLang === "id") {
    result = result.replace(/\bPresent\b/gi, "Sekarang");
    result = result.replace(/\bJanuary\b/gi, "Januari");
    result = result.replace(/\bFebruary\b/gi, "Februari");
    result = result.replace(/\bMarch\b/gi, "Maret");
    result = result.replace(/\bMay\b/gi, "Mei");
    result = result.replace(/\bJune\b/gi, "Juni");
    result = result.replace(/\bJuly\b/gi, "Juli");
    result = result.replace(/\bAugust\b/gi, "Agustus");
    result = result.replace(/\bOctober\b/gi, "Oktober");
    result = result.replace(/\bDecember\b/gi, "Desember");
  } else {
    result = result.replace(/\bSekarang\b/gi, "Present");
    result = result.replace(/\bJanuari\b/gi, "January");
    result = result.replace(/\bFebruari\b/gi, "February");
    result = result.replace(/\bMaret\b/gi, "March");
    result = result.replace(/\bMei\b/gi, "May");
    result = result.replace(/\bJuni\b/gi, "June");
    result = result.replace(/\bJuli\b/gi, "July");
    result = result.replace(/\bAgustus\b/gi, "August");
    result = result.replace(/\bOktober\b/gi, "October");
    result = result.replace(/\bDesember\b/gi, "December");
  }

  return result;
}

export function translateHeadline(headline: string | undefined, targetLang: ResumeLanguage): string {
  if (!headline) return "";

  if (targetLang === "id") {
    return headline
      .replace(/Software Engineer \/ DevOps Engineer/gi, "Software Engineer / Insinyur DevOps")
      .replace(/Fullstack Engineer \/ DevOps Engineer/gi, "Fullstack Engineer / Insinyur DevOps");
  } else {
    return headline
      .replace(/Software Engineer \/ Insinyur DevOps/gi, "Software Engineer / DevOps Engineer")
      .replace(/Fullstack Engineer \/ Insinyur DevOps/gi, "Fullstack Engineer / DevOps Engineer")
      .replace(/Insinyur Otomasi/gi, "Automation Engineer");
  }
}

export function translateTextLine(text: string, targetLang: ResumeLanguage): string {
  if (!text) return "";
  const trimmed = text.trim();

  // 1. Exact match check against curated pair bank
  for (const pair of EXACT_PAIRS) {
    if (targetLang === "id" && trimmed === pair.en.trim()) {
      return pair.id;
    }
    if (targetLang === "en" && trimmed === pair.id.trim()) {
      return pair.en;
    }
  }

  // 2. Phrasal translation via pattern pipeline
  let result = text;
  const patterns = targetLang === "id" ? EN_TO_ID_PATTERNS : ID_TO_EN_PATTERNS;

  for (const [regex, replacement] of patterns) {
    result = result.replace(regex, replacement);
  }

  return result;
}

export function translateSummary(summary: string, targetLang: ResumeLanguage): string {
  if (!summary) return "";
  return translateTextLine(summary, targetLang);
}

export function translateDegree(degreeInput: unknown, targetLang: ResumeLanguage): string {
  if (degreeInput === null || degreeInput === undefined) return "";
  const degree = String(degreeInput).trim();
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
    headline: translateHeadline(resume.profile.headline, targetLang),
    summary: translateSummary(resume.profile.summary, targetLang),
  };

  // 2. Experiences translation
  const translatedExperiences: WorkExperience[] = (resume.experiences || []).map((exp) => ({
    ...exp,
    startDate: translateDate(exp.startDate, targetLang),
    endDate: translateDate(exp.endDate, targetLang),
    bulletPoints: (exp.bulletPoints || []).map((b) => translateTextLine(b, targetLang)),
  }));

  // 3. Projects translation
  const translatedProjects: TechnicalProject[] = (resume.projects || []).map((proj) => ({
    ...proj,
    starSummary: translateTextLine(proj.starSummary, targetLang),
  }));

  // 4. Skills category translation
  const translatedSkills: SkillCategory[] = (resume.skills || []).map((skill) => ({
    ...skill,
    category: translateSkillCategory(skill.category, targetLang),
  }));

  // 5. Education translation
  const translatedEducation: EducationRecord[] | undefined = resume.education?.map((edu) => ({
    ...edu,
    degree: translateDegree(edu.degree, targetLang),
    graduationYear: translateDate(edu.graduationYear, targetLang),
  }));

  // 6. Custom sections translation
  const translatedCustomSections: CustomSection[] | undefined = resume.customSections?.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      title: item.title,
      description: translateTextLine(item.description, targetLang),
    })),
  }));

  return {
    ...resume,
    profile: translatedProfile,
    experiences: translatedExperiences,
    projects: translatedProjects,
    skills: translatedSkills,
    education: translatedEducation,
    customSections: translatedCustomSections,
    language: targetLang,
  };
}
