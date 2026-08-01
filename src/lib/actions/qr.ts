"use server";

import { requireAdminSession } from "@/lib/auth/require-admin";
import { generateQrPng, generateQrSvg, type QrOptions } from "@/lib/qr";

export async function getQrPreview(url: string, options: QrOptions): Promise<string> {
  await requireAdminSession();
  const buffer = await generateQrPng(url, options);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export async function getQrSvgMarkup(url: string, options: QrOptions): Promise<string> {
  await requireAdminSession();
  return generateQrSvg(url, options);
}

export async function getLogoDataUrl(logoUrl: string): Promise<string | null> {
  await requireAdminSession();
  if (!logoUrl) return null;

  try {
    const response = await fetch(logoUrl);
    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType?.startsWith("image/")) {
      console.error(`getLogoDataUrl: unexpected response for ${logoUrl}`, response.status, contentType);
      return null;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error(`getLogoDataUrl: failed to fetch ${logoUrl}`, error);
    return null;
  }
}
