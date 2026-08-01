import QRCode from "qrcode";

export interface QrOptions {
  foregroundColor?: string;
  backgroundColor?: string;
  size?: number;
}

const DEFAULT_SIZE = 300;
const DEFAULT_FOREGROUND = "#000000";
const DEFAULT_BACKGROUND = "#ffffff";
const MARGIN = 1;

function resolveOptions(options: QrOptions) {
  return {
    width: options.size ?? DEFAULT_SIZE,
    margin: MARGIN,
    color: {
      dark: options.foregroundColor ?? DEFAULT_FOREGROUND,
      light: options.backgroundColor ?? DEFAULT_BACKGROUND,
    },
  };
}

export async function generateQrPng(url: string, options: QrOptions = {}): Promise<Buffer> {
  if (!url) throw new Error("generateQrPng: url is required");
  return QRCode.toBuffer(url, resolveOptions(options));
}

export async function generateQrSvg(url: string, options: QrOptions = {}): Promise<string> {
  if (!url) throw new Error("generateQrSvg: url is required");
  return QRCode.toString(url, { ...resolveOptions(options), type: "svg" });
}
