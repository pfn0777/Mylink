"use client";

import { useEffect, useState, useTransition } from "react";
import { getQrPreview, getQrSvgMarkup } from "@/lib/actions/qr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QrCustomizerProps {
  publicUrl: string;
}

const DEFAULT_SIZE = 300;
const MIN_SIZE = 100;
const MAX_SIZE = 600;
const SIZE_STEP = 10;
const PREVIEW_DEBOUNCE_MS = 200;

export function QrCustomizer({ publicUrl }: QrCustomizerProps) {
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let stale = false;
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const dataUrl = await getQrPreview(publicUrl, { foregroundColor, backgroundColor, size });
        if (!stale) setPreviewUrl(dataUrl);
      });
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      stale = true;
      clearTimeout(timeout);
    };
  }, [publicUrl, foregroundColor, backgroundColor, size, startTransition]);

  function downloadPng() {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = "qr-code.png";
    a.click();
  }

  async function downloadSvg() {
    const svg = await getQrSvgMarkup(publicUrl, { foregroundColor, backgroundColor, size });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "qr-code.svg";
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <div className="max-w-lg space-y-4">
      <p className="break-all text-sm text-muted-foreground">{publicUrl}</p>

      <div className="flex items-center justify-center rounded-lg border p-6">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="QR kod" className="max-w-full" style={{ width: size, height: size }} />
        ) : (
          <div style={{ width: size, height: size }} className="animate-pulse rounded bg-muted" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="fg">Rang</Label>
          <Input
            id="fg"
            type="color"
            value={foregroundColor}
            onChange={(e) => setForegroundColor(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="bg">Fon</Label>
          <Input
            id="bg"
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="size">O&apos;lcham: {size}px</Label>
        <input
          id="size"
          type="range"
          min={MIN_SIZE}
          max={MAX_SIZE}
          step={SIZE_STEP}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" disabled={!previewUrl} onClick={downloadPng}>
          PNG yuklash
        </Button>
        <Button type="button" variant="outline" onClick={downloadSvg}>
          SVG yuklash
        </Button>
      </div>

      {isPending && <p className="text-xs text-muted-foreground">Yangilanmoqda...</p>}
    </div>
  );
}
