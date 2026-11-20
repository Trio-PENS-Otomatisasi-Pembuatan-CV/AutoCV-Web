import React, { useMemo } from "react";
import type { ResumePayload } from "@/core/entities/ResumePayload";
import { formatCanonicalAtsResume } from "@/core/utils/atsResumeFormatter";

export interface ResumeDocumentProps {
  resume: ResumePayload;
  className?: string;
}

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({
  resume,
  className = "",
}) => {
  const canonical = useMemo(() => formatCanonicalAtsResume(resume), [resume]);
  const { profile, experiences, projects, skills, education } = canonical;

  const contactItems = [
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedinUrl,
    profile.githubUrl,
  ].filter(Boolean);

  return (
    <article
      id="ats-resume-print-area"
      className={`mx-auto w-full max-w-[780px] min-h-[1050px] bg-white px-8 py-10 sm:px-12 sm:py-12 text-[#0F172A] shadow-md border border-slate-200/90 rounded-sm font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none ${className}`}
      style={{ fontFamily: "'Calibri', 'Arial', sans-serif" }}
    >
      {/* Resume Header */}
      <header className="text-center pb-2">
        <h1 className="text-[22px] sm:text-[24px] font-black uppercase tracking-tight text-[#0F172A]">
          {profile.fullName || "Candidate Name"}
        </h1>

        {profile.headline && (
          <p className="mt-0.5 text-xs sm:text-[13px] font-semibold text-[#1E293B]">
            {profile.headline}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 text-[11px] sm:text-xs text-[#475569]">
          {contactItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-400 select-none">•</span>}
              {item?.includes("@") ? (
                <a
                  href={`mailto:${item}`}
                  className="hover:underline text-slate-700"
                >
                  {item}
                </a>
              ) : item?.includes("linkedin.com") || item?.includes("github.com") ? (
                <a
                  href={`https://${item}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-slate-700"
                >
                  {item}
                </a>
              ) : (
                <span>{item}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* 1. Professional Summary */}
      {profile.summary && (
        <section className="mt-4">
          <h2 className="border-b-[1.5px] border-[#0F172A] pb-0.5 text-[11.5px] font-bold uppercase tracking-wider text-[#0F172A]">
            Professional Summary
          </h2>
          <p className="mt-1 text-xs leading-[1.4] text-[#334155]">
            {profile.summary}
          </p>
        </section>
      )}

      {/* 2. Work Experience */}
      {experiences && experiences.length > 0 && (
        <section className="mt-4">
          <h2 className="border-b-[1.5px] border-[#0F172A] pb-0.5 text-[11.5px] font-bold uppercase tracking-wider text-[#0F172A]">
            Work Experience
          </h2>
          <div className="mt-2 space-y-2.5">
            {experiences.map((exp) => {
              const isLong = (exp.role.length + exp.company.length) > 55;
              const dateText = exp.startDate || "Present";

              return (
                <div key={exp.id}>
                  {isLong ? (
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-xs text-[#0F172A]">
                          {exp.role}
                        </span>
                        <span className="text-[11.5px] font-bold text-[#475569] whitespace-nowrap">
                          {dateText}
                        </span>
                      </div>
                      <div className="text-xs text-[#334155]">
                        <span>{exp.company}</span>
                        {exp.location && (
                          <span className="italic text-[#64748B] ml-2">
                            | {exp.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-xs">
                          <span className="font-bold text-[#0F172A]">{exp.role}</span>
                          <span className="text-[#334155]"> — {exp.company}</span>
                        </p>
                        <span className="text-[11.5px] font-bold text-[#475569] whitespace-nowrap">
                          {dateText}
                        </span>
                      </div>
                      {exp.location && (
                        <p className="text-[11px] italic text-[#64748B]">
                          {exp.location}
                        </p>
                      )}
                    </div>
                  )}

                  <ul className="mt-0.5 space-y-0.5 pl-4 list-disc text-xs text-[#334155] marker:text-[#334155]">
                    {exp.bulletPoints.map((bullet, idx) => (
                      <li key={idx} className="leading-[1.35]">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Featured Technical Projects */}
      {projects && projects.length > 0 && (
        <section className="mt-4">
          <h2 className="border-b-[1.5px] border-[#0F172A] pb-0.5 text-[11.5px] font-bold uppercase tracking-wider text-[#0F172A]">
            Featured Technical Projects (#HumanInTheLead)
          </h2>
          <div className="mt-2 space-y-2">
            {projects.map((proj) => {
              const tech = proj.techStack && proj.techStack.length > 0
                ? ` [${proj.techStack.join(", ")}]`
                : (proj.language ? ` [${proj.language}]` : "");

              return (
                <div key={proj.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-xs">
                      <span className="font-bold text-[#0F172A]">{proj.name}</span>
                      {tech && (
                        <span className="text-[#2563EB] font-normal">
                          {tech}
                        </span>
                      )}
                    </p>
                    {proj.repoUrl && (
                      <span className="text-[11px] text-[#64748B] font-normal">
                        {proj.repoUrl}
                      </span>
                    )}
                  </div>
                  <ul className="mt-0.5 pl-4 list-disc text-xs text-[#334155] marker:text-[#334155]">
                    <li className="leading-[1.35]">{proj.starSummary}</li>
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Technical Skills */}
      {skills && skills.length > 0 && (
        <section className="mt-4">
          <h2 className="border-b-[1.5px] border-[#0F172A] pb-0.5 text-[11.5px] font-bold uppercase tracking-wider text-[#0F172A]">
            Technical Skills
          </h2>
          <div className="mt-1.5 space-y-1 text-xs text-[#334155]">
            {skills.map((cat, idx) => (
              <p key={idx} className="leading-[1.35]">
                <span className="font-bold text-[#0F172A]">{cat.category}: </span>
                <span>{cat.items.join(", ")}</span>
              </p>
            ))}
          </div>
        </section>
      )}

      {/* 5. Education */}
      {education && education.length > 0 && (
        <section className="mt-4">
          <h2 className="border-b-[1.5px] border-[#0F172A] pb-0.5 text-[11.5px] font-bold uppercase tracking-wider text-[#0F172A]">
            Education
          </h2>
          <div className="mt-2 space-y-1">
            {education.map((edu, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex items-baseline justify-between gap-2">
                  <p>
                    <span className="font-bold text-[#0F172A]">{edu.degree}</span>
                    <span className="text-[#334155]"> — {edu.institution}</span>
                  </p>
                  {edu.graduationYear && (
                    <span className="font-bold text-[#475569] whitespace-nowrap text-[11.5px]">
                      {edu.graduationYear}
                    </span>
                  )}
                </div>
                {edu.gpa && (
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    GPA: {edu.gpa}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
