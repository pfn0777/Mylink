import { Phone, Send, Camera, MapPin, Link as LinkIcon, type LucideIcon } from "lucide-react";
import type { LinkTypeValue } from "@/lib/validation";

interface LinkTypeMeta {
  label: string;
  placeholder: string;
  inputType: "tel" | "text" | "url";
  icon: LucideIcon;
  badgeClass: string;
}

export const LINK_TYPE_META: Record<LinkTypeValue, LinkTypeMeta> = {
  phone: {
    label: "Telefon",
    placeholder: "+998 90 123 45 67",
    inputType: "tel",
    icon: Phone,
    badgeClass: "bg-green-100 text-green-600",
  },
  telegram: {
    label: "Telegram",
    placeholder: "https://t.me/username",
    inputType: "text",
    icon: Send,
    badgeClass: "bg-sky-100 text-sky-600",
  },
  instagram: {
    label: "Instagram",
    placeholder: "https://instagram.com/username",
    inputType: "text",
    icon: Camera,
    badgeClass: "bg-fuchsia-100 text-fuchsia-600",
  },
  maps: {
    label: "Google Maps",
    placeholder: "https://maps.google.com/...",
    inputType: "url",
    icon: MapPin,
    badgeClass: "bg-red-100 text-red-600",
  },
  custom: {
    label: "Boshqa (custom)",
    placeholder: "https://...",
    inputType: "url",
    icon: LinkIcon,
    badgeClass: "bg-slate-200 text-slate-600",
  },
};
