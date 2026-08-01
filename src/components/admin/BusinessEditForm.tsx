"use client";

import { useActionState, useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { type BusinessEditFormState } from "@/lib/actions/businesses";
import { slugify } from "@/lib/slug";
import type { Business, Link as LinkRowData } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LinkRow, type DraftLink } from "@/components/admin/LinkRow";

interface BusinessEditFormProps {
  business: Business;
  initialLinks: LinkRowData[];
  action: (prevState: BusinessEditFormState | undefined, formData: FormData) => Promise<BusinessEditFormState>;
}

export function BusinessEditForm({ business, initialLinks, action }: BusinessEditFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [slug, setSlug] = useState(business.slug);
  const [slugTouched, setSlugTouched] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(business.logoUrl);
  const [draftLinks, setDraftLinks] = useState<DraftLink[]>(() =>
    initialLinks.map((l) => ({ id: l.id, isNew: false, type: l.type, label: l.label, value: l.value })),
  );
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const markDirty = useCallback(() => setDirty(true), []);

  function updateLink(id: string, patch: Partial<Pick<DraftLink, "type" | "label" | "value">>) {
    setDraftLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    markDirty();
  }

  function removeLink(id: string) {
    setDraftLinks((prev) => prev.filter((l) => l.id !== id));
    markDirty();
  }

  function addLink() {
    setDraftLinks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), isNew: true, type: "phone", label: "", value: "" },
    ]);
    markDirty();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDraftLinks((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === active.id);
      const newIndex = prev.findIndex((l) => l.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    markDirty();
  }

  useEffect(() => {
    if (!dirty) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    function handleClick(e: MouseEvent) {
      if (!(e.target instanceof HTMLElement)) return;
      const anchor = e.target.closest("a[href]");
      if (!anchor) return;
      const ok = window.confirm("Saqlanmagan o'zgarishlar bor. Sahifadan chiqishni xohlaysizmi?");
      if (!ok) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [dirty]);

  const linksJson = JSON.stringify(draftLinks.map((l, i) => ({ ...l, position: i })));

  return (
    <form action={formAction} onChange={markDirty} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Biznes nomi</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={business.name}
              onChange={(e) => {
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Tavsif</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={business.description ?? ""} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="logo">Logo</Label>
            {logoPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="Logo preview" className="mb-2 h-16 w-16 rounded-full object-cover" />
            )}
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setLogoPreview(URL.createObjectURL(file));
              }}
            />
            <p className="text-xs text-muted-foreground">PNG, JPG yoki WEBP, max 2MB</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="slug">Manzil (slug)</Label>
            <Input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Linklar</h2>

          <input type="hidden" name="linksJson" value={linksJson} />

          <DndContext id="business-links" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={draftLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {draftLinks.map((link) => (
                  <LinkRow
                    key={link.id}
                    link={link}
                    error={state?.linkErrors?.[link.id]}
                    onChange={updateLink}
                    onRemove={removeLink}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button type="button" variant="outline" onClick={addLink} className="w-full">
            + Qo&apos;shish
          </Button>
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saqlanmoqda..." : "Saqlash"}
      </Button>
    </form>
  );
}
