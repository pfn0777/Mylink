"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-xl font-semibold">Xatolik yuz berdi</h1>
      <p className="text-sm text-muted-foreground">
        Sahifani yuklashda kutilmagan xatolik yuz berdi. Qayta urinib ko&apos;ring.
      </p>
      <Button onClick={() => reset()}>Qayta urinish</Button>
    </div>
  );
}
