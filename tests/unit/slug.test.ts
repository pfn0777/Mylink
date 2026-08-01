import { describe, it, expect } from "vitest";
import { slugify, isReservedSlug, validateSlugFormat, RESERVED_SLUGS } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Dunyo Uspa")).toBe("dunyo-uspa");
  });

  it("strips diacritics", () => {
    expect(slugify("Café Déjà Vu")).toBe("cafe-deja-vu");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugify("hello!!  world__test")).toBe("hello-world-test");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  -Test-  ")).toBe("test");
  });
});

describe("isReservedSlug", () => {
  it("flags every entry in the reserved list", () => {
    for (const word of RESERVED_SLUGS) {
      expect(isReservedSlug(word)).toBe(true);
    }
  });

  it("is case-insensitive", () => {
    expect(isReservedSlug("Admin")).toBe(true);
  });

  it("allows a normal business slug", () => {
    expect(isReservedSlug("dunyo-uspa")).toBe(false);
  });
});

describe("validateSlugFormat", () => {
  it("rejects an empty slug", () => {
    expect(validateSlugFormat("")).toBe("empty");
  });

  it("rejects a reserved word", () => {
    expect(validateSlugFormat("admin")).toBe("reserved");
  });

  it("rejects a slug that is too short", () => {
    expect(validateSlugFormat("a")).toBe("too_short");
  });

  it("rejects a slug that is too long", () => {
    expect(validateSlugFormat("a".repeat(51))).toBe("too_long");
  });

  it("rejects uppercase or invalid characters", () => {
    expect(validateSlugFormat("Dunyo_Uspa")).toBe("invalid_characters");
  });

  it("rejects leading/trailing hyphens", () => {
    expect(validateSlugFormat("-dunyo-uspa-")).toBe("invalid_characters");
  });

  it("accepts a valid slug", () => {
    expect(validateSlugFormat("dunyo-uspa")).toBeNull();
  });
});
