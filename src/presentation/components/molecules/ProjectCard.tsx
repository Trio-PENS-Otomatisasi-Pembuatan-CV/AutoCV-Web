import React from "react";
import { Checkbox } from "../atoms/Checkbox";
import { Star, GitFork, ExternalLink } from "lucide-react";
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
      onClick={() => !disabled && onToggle(project.id)}
      className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-150 cursor-pointer ${
        isSelected
          ? "border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                {project.name}
              </span>
              {project.stars !== undefined && project.stars > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200/50">
                  <Star className="size-3 fill-amber-400 text-amber-500" />
                  {project.stars}
                </span>
              )}
            </div>
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5 inline-flex items-center gap-1 text-[11.5px] text-slate-400 hover:text-slate-600 truncate max-w-[260px]"
              >
                {project.repoUrl.replace(/^https?:\/\//, "")}
                <ExternalLink className="size-2.5 opacity-70" />
              </a>
            )}
          </div>
          <Checkbox
            checked={isSelected}
            onChange={() => onToggle(project.id)}
            disabled={disabled}
          />
        </div>

        {project.techStack && project.techStack.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
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

        <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-3">
          {project.starSummary}
        </p>
      </div>
    </div>
  );
};
