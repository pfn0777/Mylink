"use client";

import { deleteBusiness } from "@/lib/actions/businesses";
import { Button } from "@/components/ui/button";

interface DeleteBusinessButtonProps {
  businessId: string;
  businessName: string;
}

export function DeleteBusinessButton({ businessId, businessName }: DeleteBusinessButtonProps) {
  return (
    <form
      action={deleteBusiness.bind(null, businessId)}
      onSubmit={(e) => {
        if (!confirm(`"${businessName}" biznesini o'chirmoqchimisiz? Bu qaytarib bo'lmaydi.`)) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="destructive" size="sm">
        O&apos;chirish
      </Button>
    </form>
  );
}
