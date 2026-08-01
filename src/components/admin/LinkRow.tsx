"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { LINK_TYPES, type LinkTypeValue } from "@/lib/validation";
import { LINK_TYPE_META } from "@/lib/link-type-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface DraftLink {
  id: string;
  isNew: boolean;
  type: LinkTypeValue;
  label: string;
  value: string;
}

interface LinkRowProps {
  link: DraftLink;
  error?: string;
  onChange: (id: string, patch: Partial<Pick<DraftLink, "type" | "label" | "value">>) => void;
  onRemove: (id: string) => void;
}

export function LinkRow({ link, error, onChange, onRemove }: LinkRowProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: link.id });
  const meta = LINK_TYPE_META[link.type];
  const Icon = meta.icon;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-2 rounded-lg border p-2 ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-1.5 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label="Tartibni o'zgartirish"
      >
        <GripVertical className="size-4" />
      </button>

      <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${meta.badgeClass}`}>
        <Icon className="size-4" />
      </div>

      <div className="flex-1 space-y-1.5">
        <select
          value={link.type}
          onChange={(e) => onChange(link.id, { type: e.target.value as LinkTypeValue })}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {LINK_TYPES.map((t) => (
            <option key={t} value={t}>
              {LINK_TYPE_META[t].label}
            </option>
          ))}
        </select>
        <Input
          value={link.label}
          onChange={(e) => onChange(link.id, { label: e.target.value })}
          placeholder="Nom"
          aria-label="Nom"
        />
        <Input
          type={meta.inputType}
          value={link.value}
          onChange={(e) => onChange(link.id, { value: e.target.value })}
          placeholder={meta.placeholder}
          aria-label="Qiymat"
          aria-invalid={Boolean(error)}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <Button type="button" variant="destructive" size="icon-sm" onClick={() => onRemove(link.id)} aria-label="O'chirish">
        ✕
      </Button>
    </div>
  );
}
