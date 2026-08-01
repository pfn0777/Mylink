import { describe, it, expect } from "vitest";
import { generateQrPng, generateQrSvg } from "@/lib/qr";

describe("generateQrPng", () => {
  it("throws on an empty url", async () => {
    await expect(generateQrPng("")).rejects.toThrow("url is required");
  });

  it("returns a PNG buffer", async () => {
    const buffer = await generateQrPng("https://mylink-clone.app/dunyouspa");
    expect(Buffer.isBuffer(buffer)).toBe(true);
    // PNG magic bytes: 89 50 4E 47
    expect(buffer.subarray(0, 4).toString("hex")).toBe("89504e47");
  });

  it("reflects the requested size in the output dimensions", async () => {
    const small = await generateQrPng("https://mylink-clone.app/dunyouspa", { size: 100 });
    const large = await generateQrPng("https://mylink-clone.app/dunyouspa", { size: 400 });
    expect(large.length).toBeGreaterThan(small.length);
  });
});

describe("generateQrSvg", () => {
  it("throws on an empty url", async () => {
    await expect(generateQrSvg("")).rejects.toThrow("url is required");
  });

  it("returns an SVG string", async () => {
    const svg = await generateQrSvg("https://mylink-clone.app/dunyouspa");
    expect(svg).toContain("<svg");
  });

  it("reflects the requested width and colors", async () => {
    const svg = await generateQrSvg("https://mylink-clone.app/dunyouspa", {
      size: 250,
      foregroundColor: "#ff0000",
      backgroundColor: "#00ff00",
    });
    expect(svg).toContain('width="250"');
    expect(svg).toContain("#ff0000");
    expect(svg).toContain("#00ff00");
  });
});
