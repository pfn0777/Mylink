"use client";

import { useActionState, useState } from "react";
import { type BusinessFormState } from "@/lib/actions/businesses";
import { slugify } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface BusinessFormDefaultValues {
  name: string;
  slug: string;
  description: string;
  logoUrl?: string | null;
}

interface BusinessFormProps {
  action: (prevState: BusinessFormState | undefined, formData: FormData) => Promise<BusinessFormState>;
  defaultValues?: BusinessFormDefaultValues;
  submitLabel: string;
}

export function BusinessForm({ action, defaultValues, submitLabel }: BusinessFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues));
  const [logoPreview, setLogoPreview] = useState<string | null>(defaultValues?.logoUrl ?? null);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Biznes nomi</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={defaultValues?.name}
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Tavsif</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={defaultValues?.description} />
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

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saqlanmoqda..." : submitLabel}
      </Button>
    </form>
  );
}
