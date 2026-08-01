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
