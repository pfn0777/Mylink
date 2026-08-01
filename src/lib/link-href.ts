import type { LinkTypeValue } from "@/lib/validation";

const URL_PATTERN = /^https?:\/\//;

export function linkHref(type: LinkTypeValue, value: string): string {
  switch (type) {
    case "phone":
      return `tel:${value.replace(/[^\d+]/g, "")}`;
    case "telegram":
      return URL_PATTERN.test(value) ? value : `https://t.me/${value.replace(/^@/, "")}`;
    case "instagram":
      return URL_PATTERN.test(value) ? value : `https://instagram.com/${value.replace(/^@/, "")}`;
    case "maps":
    case "custom":
      return value;
  }
}
