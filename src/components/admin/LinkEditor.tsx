"use client";

import { useActionState, useState } from "react";
import { addLink, deleteLink, moveLink, type LinkFormState } from "@/lib/actions/links";
import { LINK_TYPES, type LinkTypeValue } from "@/lib/validation";
import type { Link as LinkRow } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TYPE_LABELS: Record<LinkTypeValue, string> = {
  phone: "Telefon",
  telegram: "Telegram",
  instagram: "Instagram",
  maps: "Google Maps",
  custom: "Boshqa (custom)",
};

const TYPE_PLACEHOLDERS: Record<LinkTypeValue, string> = {
  phone: "+998 90 123 45 67",
  telegram: "https://t.me/username",
  instagram: "https://instagram.com/username",
  maps: "https://maps.google.com/...",
  custom: "https://...",
};

const TYPE_INPUT_TYPE: Record<LinkTypeValue, "tel" | "text" | "url"> = {
  phone: "tel",
  telegram: "text",
  instagram: "text",
  maps: "url",
  custom: "url",
};

interface LinkEditorProps {
  businessId: string;
  links: LinkRow[];
}

export function LinkEditor({ businessId, links }: LinkEditorProps) {
  const addLinkWithId = addLink.bind(null, businessId);
  const [state, formAction, isPending] = useActionState<LinkFormState | undefined, FormData>(addLinkWithId, undefined);
  const [type, setType] = useState<LinkTypeValue>("phone");

  return (
    <div className="max-w-lg space-y-4">
      {links.length > 0 && (
        <ul className="space-y-2">
          {links.map((link, index) => (
            <li key={link.id} className="flex items-center justify-between gap-2 rounded border p-3">
              <div>
                <div className="text-sm font-medium">
                  {link.label} <span className="text-xs text-muted-foreground">({TYPE_LABELS[link.type]})</span>
                </div>
                <div className="text-sm text-muted-foreground">{link.value}</div>
              </div>
              <div className="flex gap-1">
                <form action={moveLink.bind(null, link.id, businessId, "up")}>
                  <Button type="submit" variant="outline" size="icon-sm" disabled={index === 0}>
                    ↑
                  </Button>
                </form>
                <form action={moveLink.bind(null, link.id, businessId, "down")}>
                  <Button type="submit" variant="outline" size="icon-sm" disabled={index === links.length - 1}>
                    ↓
                  </Button>
                </form>
                <form action={deleteLink.bind(null, link.id, businessId)}>
                  <Button type="submit" variant="destructive" size="icon-sm">
                    ✕
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="space-y-3 rounded border p-3">
        <div className="space-y-1">
          <Label htmlFor="type">Turi</Label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as LinkTypeValue)}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            {LINK_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="label">Nom</Label>
          <Input id="label" name="label" required placeholder={TYPE_LABELS[type]} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="value">Qiymat</Label>
          <Input id="value" name="value" type={TYPE_INPUT_TYPE[type]} required placeholder={TYPE_PLACEHOLDERS[type]} />
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Qo'shilmoqda..." : "Link qo'shish"}
        </Button>
      </form>
    </div>
  );
}
