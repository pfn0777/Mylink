import { describe, it, expect } from "vitest";
import { LinkInput } from "@/lib/validation";

describe("LinkInput: phone", () => {
  it("accepts a plausible phone number", () => {
    const result = LinkInput.safeParse({ type: "phone", label: "Qo'ng'iroq", value: "+998 90 123 45 67" });
    expect(result.success).toBe(true);
  });

  it("accepts a phone number with parentheses", () => {
    const result = LinkInput.safeParse({ type: "phone", label: "Qo'ng'iroq", value: "+998 (90) 123-45-67" });
    expect(result.success).toBe(true);
  });

  it("rejects letters in the phone value", () => {
    const result = LinkInput.safeParse({ type: "phone", label: "Qo'ng'iroq", value: "not-a-phone" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty label", () => {
    const result = LinkInput.safeParse({ type: "phone", label: "", value: "+998901234567" });
    expect(result.success).toBe(false);
  });
});

describe("LinkInput: telegram / instagram", () => {
  it("accepts a bare username", () => {
    expect(LinkInput.safeParse({ type: "telegram", label: "Telegram", value: "mylink_support" }).success).toBe(true);
  });

  it("accepts a full URL", () => {
    expect(
      LinkInput.safeParse({ type: "instagram", label: "Instagram", value: "https://instagram.com/dunyouspa" })
        .success,
    ).toBe(true);
  });

  it("rejects an empty value", () => {
    expect(LinkInput.safeParse({ type: "telegram", label: "Telegram", value: "" }).success).toBe(false);
  });
});

describe("LinkInput: maps / custom", () => {
  it("accepts a valid maps URL", () => {
    expect(
      LinkInput.safeParse({ type: "maps", label: "Manzil", value: "https://maps.google.com/?q=Bukhara" }).success,
    ).toBe(true);
  });

  it("rejects a non-URL maps value", () => {
    expect(LinkInput.safeParse({ type: "maps", label: "Manzil", value: "Bukhara city center" }).success).toBe(false);
  });

  it("accepts a valid custom URL", () => {
    expect(LinkInput.safeParse({ type: "custom", label: "Katalog", value: "https://example.com/catalog" }).success).toBe(
      true,
    );
  });

  it("rejects a non-URL custom value", () => {
    expect(LinkInput.safeParse({ type: "custom", label: "Katalog", value: "not a url" }).success).toBe(false);
  });
});

describe("LinkInput: type discrimination", () => {
  it("rejects an unknown type", () => {
    expect(LinkInput.safeParse({ type: "whatsapp", label: "WhatsApp", value: "+998901234567" }).success).toBe(false);
  });
});
