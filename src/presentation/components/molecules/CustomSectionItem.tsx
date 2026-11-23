import React, { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "../atoms/Button";
import type { CustomSection, CustomSectionItem as CustomSectionItemType } from "@/core/entities/ResumePayload";

export interface CustomSectionItemProps {
  section: CustomSection;
  onUpdateSection?: (id: string, updates: Partial<CustomSection>) => void;
  onRemoveSection?: (id: string) => void;
}

export const CustomSectionItem: React.FC<CustomSectionItemProps> = ({
  section,
  onUpdateSection,
  onRemoveSection,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const currentEntry = editingIndex !== null ? section.items[editingIndex] : null;
  const editCurrentTitle = (currentEntry?.title || "").trim();
  const editCurrentDescription = (currentEntry?.description || "").trim();

  const startEdit = (idx: number, entry: CustomSectionItemType) => {
    setEditingIndex(idx);
    setEditTitle(entry.title);
    setEditDescription(entry.description);
  };

  const saveEdit = (idx: number) => {
    const trimmedTitle = editTitle.trim();
    const trimmedDesc = editDescription.trim();
    if ((trimmedTitle || trimmedDesc) && onUpdateSection) {
      const updated = [...section.items];
      updated[idx] = { title: trimmedTitle, description: trimmedDesc };
      onUpdateSection(section.id, { items: updated });
    }
    setEditingIndex(null);
  };

  const deleteEntry = (idx: number) => {
    if (onUpdateSection) {
      const updated = section.items.filter((_, i) => i !== idx);
      onUpdateSection(section.id, { items: updated });
    }
  };

  const addEntry = () => {
    if ((newTitle.trim() || newDescription.trim()) && onUpdateSection) {
      const updated = [...section.items, { title: newTitle.trim(), description: newDescription.trim() }];
      onUpdateSection(section.id, { items: updated });
      setNewTitle("");
      setNewDescription("");
      setIsAdding(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <input
          type="text"
          value={section.title}
          onChange={(e) => {
            onUpdateSection?.(section.id, { title: e.target.value });
          }}
          placeholder="Section title"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm"
        />
        {onRemoveSection && (
          <button
            type="button"
            onClick={() => onRemoveSection(section.id)}
            className="ml-2 text-slate-400 hover:text-red-500 cursor-pointer"
            title="Remove section"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      <ul className="space-y-2 mt-2">
        {section.items.map((entry, idx) => (
          <li
            key={idx}
            className="group relative flex items-start gap-2.5 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 hover:border-slate-200"
          >
            <span className="text-blue-500 font-bold select-none shrink-0">•</span>

            {editingIndex === idx ? (
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Title (optional)"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-md border border-blue-400 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <textarea
                  placeholder="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-md border border-blue-400 bg-white p-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
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
              <div className="flex-1 flex items-start gap-2">
                <span className="text-slate-400 select-none">—</span>
                <p className="leading-relaxed break-words">
                  <span className={`font-bold ${entry.title ? "text-slate-900" : "text-slate-500"}`}>
                    {entry.title || <em>(untitled)</em>}
                  </span>
                  {entry.title && entry.description && " "}
                  <span className="text-slate-700">{entry.description}</span>
                </p>
                <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(idx, entry)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                    title="Edit bullet"
                  >
                    <Edit2 className="size-3" />
                  </button>
                  <button
                    onClick={() => deleteEntry(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete bullet"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {isAdding ? (
        <div className="flex flex-col gap-2 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <input
            type="text"
            placeholder="Title (optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <textarea
            placeholder="Enter description..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={addEntry}>
              Add Bullet
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          <Plus className="size-3.5" /> Add bullet
        </button>
      )}
    </div>
  );
};