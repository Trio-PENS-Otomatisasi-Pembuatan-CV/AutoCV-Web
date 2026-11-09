import React from "react";
import type { ResumePayload } from "@/core/entities/ResumePayload";

export interface ResumeDocumentProps {
  resume: ResumePayload;
  className?: string;
}

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({
  resume,
  className = "",
}) => {
  const { profile, experiences, projects, skills, education } = resume;
  const selectedProjects = projects.filter((p) => p.isSelected !== false);

  return (
    <article
      id="ats-resume-print-area"
      className={`mx-auto w-full max-w-[760px] bg-white p-8 sm:p-12 text-[#0F172A] shadow-sm rounded-xl border border-slate-200/80 font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none ${className}`}
    >
      {/* Header */}
      <header className="border-b border-[#0F172A] pb-4 text-center">
        <h1 className="text-2xl sm:text-[28px] font-black uppercase tracking-tight text-[#0F172A]">
          {profile.fullName || "John Doe"}
        </h1>

        {profile.headline && (
          <p className="mt-1 text-sm font-semibold text-slate-700">
            {profile.headline}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600">
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="hover:underline text-slate-700"
            >
              {profile.email}
            </a>
          )}
          {profile.location && (
            <>
              <span className="text-slate-300">•</span>
              <span>{profile.location}</span>
            </>
          )}
          {profile.linkedinUrl && (
            <>
              <span className="text-slate-300">•</span>
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-slate-700"
              >
                {profile.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </>
          )}
          {profile.githubUrl && (
            <>
              <span className="text-slate-300">•</span>
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-slate-700"
              >
                {profile.githubUrl.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {profile.summary && (
        <section className="mt-4">
          <h2 className="border-b border-slate-800 pb-1 text-xs font-bold uppercase tracking-wider text-slate-900">
            Professional Summary
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-700">
            {profile.summary}
          </p>
        </section>
      )}

      {/* Technical Projects */}
      {selectedProjects.length > 0 && (
        <section className="mt-4.5">
          <h2 className="border-b border-slate-800 pb-1 text-xs font-bold uppercase tracking-wider text-slate-900">
            Technical Projects
          </h2>
          <div className="mt-2 space-y-3">
            {selectedProjects.map((proj) => (
              <div key={proj.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs">
                    <span className="font-bold text-slate-900">{proj.name}</span>
                    {proj.techStack && proj.techStack.length > 0 && (
                      <span className="text-slate-600">
                        {" "}
                        | {proj.techStack.join(", ")}
                      </span>
                    )}
                  </p>
                  {proj.repoUrl && (
                    <span className="text-[11px] text-slate-500">
                      {proj.repoUrl.replace(/^https?:\/\/(www\.)?/, "")}
                    </span>
                  )}
                </div>
                <ul className="mt-1 space-y-0.5">
                  <li className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                    <span className="select-none text-slate-400 font-bold">•</span>
                    <span>{proj.starSummary}</span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {experiences && experiences.length > 0 && (
        <section className="mt-4.5">
          <h2 className="border-b border-slate-800 pb-1 text-xs font-bold uppercase tracking-wider text-slate-900">
            Work Experience
          </h2>
          <div className="mt-2 space-y-3.5">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs">
                    <span className="font-bold text-slate-900">{exp.role}</span>
                    <span className="text-slate-700"> — {exp.company}</span>
                  </p>
                  <span className="text-xs font-semibold text-slate-800">
                    {exp.startDate} — {exp.endDate || "Present"}
                  </span>
                </div>
                <ul className="mt-1 space-y-1">
                  {exp.bulletPoints.map((bullet, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed"
                    >
                      <span className="select-none text-slate-400 font-bold">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Skills */}
      {skills && skills.length > 0 && (
        <section className="mt-4.5">
          <h2 className="border-b border-slate-800 pb-1 text-xs font-bold uppercase tracking-wider text-slate-900">
            Technical Skills
          </h2>
          <div className="mt-2 space-y-1 text-xs text-slate-700">
            {skills.map((cat, idx) => (
              <p key={idx}>
                <span className="font-bold text-slate-900">{cat.category}: </span>
                <span>{cat.items.join(", ")}</span>
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mt-4.5">
          <h2 className="border-b border-slate-800 pb-1 text-xs font-bold uppercase tracking-wider text-slate-900">
            Education
          </h2>
          <div className="mt-2 space-y-2">
            {education.map((edu, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex items-baseline justify-between gap-2">
                  <p>
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-slate-700"> — {edu.institution}</span>
                  </p>
                  {edu.graduationYear && (
                    <span className="font-semibold text-slate-800">
                      {edu.graduationYear}
                    </span>
                  )}
                </div>
                {edu.gpa && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
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
