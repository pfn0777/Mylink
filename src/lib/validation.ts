import { z } from "zod";

const PHONE_PATTERN = /^[+\d][\d\s\-()]{5,20}$/;

export const LINK_TYPES = ["phone", "telegram", "instagram", "maps", "custom"] as const;
export type LinkTypeValue = (typeof LINK_TYPES)[number];

export const LinkInput = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("phone"),
    label: z.string().min(1, "Nom kiritilishi shart"),
    value: z.string().regex(PHONE_PATTERN, "Telefon raqami noto'g'ri formatda"),
  }),
  z.object({
    type: z.literal("telegram"),
    label: z.string().min(1, "Nom kiritilishi shart"),
    value: z.string().min(1, "Telegram username yoki link kiritilishi shart"),
  }),
  z.object({
    type: z.literal("instagram"),
    label: z.string().min(1, "Nom kiritilishi shart"),
    value: z.string().min(1, "Instagram username yoki link kiritilishi shart"),
  }),
  z.object({
    type: z.literal("maps"),
    label: z.string().min(1, "Nom kiritilishi shart"),
    value: z.string().url("Google Maps uchun to'g'ri URL kiriting"),
  }),
  z.object({
    type: z.literal("custom"),
    label: z.string().min(1, "Nom kiritilishi shart"),
    value: z.string().url("To'g'ri URL kiriting"),
  }),
]);

export type LinkInputValue = z.infer<typeof LinkInput>;

export const DraftLinkInput = LinkInput.and(
  z.object({
    id: z.string().uuid(),
    isNew: z.boolean(),
    position: z.number().int().min(0),
  }),
);

export type DraftLinkInputValue = z.infer<typeof DraftLinkInput>;
