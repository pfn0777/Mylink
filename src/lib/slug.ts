export const RESERVED_SLUGS = new Set([
  "admin",
  "login",
  "logout",
  "api",
  "dashboard",
  "businesses",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MIN_LENGTH = 2;
const MAX_LENGTH = 50;

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

export type SlugFormatError = "empty" | "too_short" | "too_long" | "invalid_characters" | "reserved";

export function validateSlugFormat(slug: string): SlugFormatError | null {
  if (!slug) return "empty";
  if (isReservedSlug(slug)) return "reserved";
  if (slug.length < MIN_LENGTH) return "too_short";
  if (slug.length > MAX_LENGTH) return "too_long";
  if (!SLUG_PATTERN.test(slug)) return "invalid_characters";
  return null;
}
