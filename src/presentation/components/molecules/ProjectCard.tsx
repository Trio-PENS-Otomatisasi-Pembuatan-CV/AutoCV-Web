import React from "react";
import { Checkbox } from "../atoms/Checkbox";
import { Star, ExternalLink } from "lucide-react";
import type { TechnicalProject } from "@/core/entities/ResumePayload";

export interface ProjectCardProps {
  project: TechnicalProject;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSelected,
  onToggle,
  disabled,
}) => {
  return (
    <div
      className={`rounded-xl border transition-all duration-150 ${
        isSelected
          ? "border-slate-200 bg-white shadow-xs"
          : "border-dashed border-slate-300 bg-slate-50/70 opacity-65"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-start justify-between p-4 gap-3">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Checkbox on the left side matching ExperienceItem */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center pt-0.5"
          >
            <Checkbox
              checked={isSelected}
              onChange={() => onToggle(project.id)}
              disabled={disabled}
              aria-label={`Include ${project.name}`}
            />
          </div>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => !disabled && onToggle(project.id)}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-semibold text-sm transition-colors ${
                  isSelected
                    ? "text-slate-900 hover:text-blue-600"
                    : "text-slate-500 line-through"
                }`}
              >
                {project.name}
              </span>

              {project.stars !== undefined && project.stars > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200/50">
                  <Star className="size-3 fill-amber-400 text-amber-500" />
                  {project.stars}
                </span>
              )}

              {!isSelected && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                  Excluded
                </span>
              )}
            </div>

            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 inline-flex items-center gap-1 text-[11.5px] text-slate-400 hover:text-slate-600 truncate max-w-[280px]"
              >
                {project.repoUrl.replace(/^https?:\/\//, "")}
                <ExternalLink className="size-2.5 opacity-70" />
              </a>
            )}

            {project.techStack && project.techStack.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {project.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
              {project.starSummary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
