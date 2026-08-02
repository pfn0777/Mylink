import { Phone, Send, MapPin, Link as LinkIcon } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import type { ComponentType } from "react";
import type { LinkTypeValue } from "@/lib/validation";

interface LinkTypeMeta {
  label: string;
  placeholder: string;
  inputType: "tel" | "text" | "url";
  icon: ComponentType<{ className?: string }>;
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
    icon: InstagramIcon,
    badgeClass: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white",
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
