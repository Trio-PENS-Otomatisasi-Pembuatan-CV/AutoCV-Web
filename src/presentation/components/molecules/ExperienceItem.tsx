import React, { useState } from "react";
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import type { WorkExperience } from "@/core/entities/ResumePayload";

export interface ExperienceItemProps {
  experience: WorkExperience;
  onUpdateBullets: (expId: string, bullets: string[]) => void;
  isSelected?: boolean;
  onToggle?: (id: string) => void;
}

export const ExperienceItem: React.FC<ExperienceItemProps> = ({
  experience,
  onUpdateBullets,
  isSelected = true,
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [newBulletText, setNewBulletText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const startEdit = (idx: number, currentText: string) => {
    setEditingIndex(idx);
    setEditText(currentText);
  };

  const saveEdit = (idx: number) => {
    if (editText.trim()) {
      const updated = [...experience.bulletPoints];
      updated[idx] = editText.trim();
      onUpdateBullets(experience.id, updated);
    }
    setEditingIndex(null);
  };

  const deleteBullet = (idx: number) => {
    const updated = experience.bulletPoints.filter((_, i) => i !== idx);
    onUpdateBullets(experience.id, updated);
  };

  const addBullet = () => {
    if (newBulletText.trim()) {
      const updated = [...experience.bulletPoints, newBulletText.trim()];
      onUpdateBullets(experience.id, updated);
      setNewBulletText("");
      setIsAdding(false);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-150 ${
        isSelected
          ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs"
          : "border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 opacity-65"
      }`}
    >
      <div className="flex items-center justify-between p-4 gap-3">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center"
          >
            <Checkbox
              checked={isSelected}
              onChange={() => onToggle?.(experience.id)}
              aria-label={`Include ${experience.role} at ${experience.company}`}
            />
          </div>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-sm font-semibold truncate ${
                  isSelected
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-500 line-through"
                }`}
              >
                {experience.role}
              </h4>
              <span className="text-slate-400 dark:text-slate-500 font-medium">·</span>
              <span
                className={`text-xs font-medium truncate ${
                  isSelected ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {experience.company}
              </span>
              {!isSelected && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  Excluded
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {experience.startDate} — {experience.endDate || "Present"} ·{" "}
              {experience.bulletPoints.length} bullets
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer shrink-0"
          aria-label="Toggle section"
        >
          {isExpanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2.5">
          <ul className="space-y-2 mt-2">
            {experience.bulletPoints.map((bullet, idx) => (
              <li
                key={idx}
                className="group relative flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-50/70 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60 hover:border-slate-200 dark:hover:border-slate-600"
              >
                <span className="text-blue-500 font-bold select-none shrink-0">•</span>

                {editingIndex === idx ? (
                  <div className="flex flex-1 flex-col gap-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full rounded-md border border-blue-400 bg-white dark:bg-slate-900 p-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setEditingIndex(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => saveEdit(idx)}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="flex-1 leading-relaxed">{bullet}</p>
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(idx, bullet)}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                        title="Edit bullet"
                      >
                        <Edit2 className="size-3" />
                      </button>
                      <button
                        onClick={() => deleteBullet(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                        title="Delete bullet"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>

          {isAdding ? (
            <div className="flex flex-col gap-2 mt-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <textarea
                placeholder="Enter new STAR action bullet..."
                value={newBulletText}
                onChange={(e) => setNewBulletText(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="secondary" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={addBullet}>
                  Add Bullet
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer self-start"
            >
              <Plus className="size-3.5" /> Add bullet
            </button>
          )}
        </div>
      )}
    </div>
  );
};
