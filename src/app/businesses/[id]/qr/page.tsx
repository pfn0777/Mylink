import { notFound } from "next/navigation";
import { getBusinessById } from "@/lib/actions/businesses";
import { getRequestOrigin } from "@/lib/origin";
import { QrCustomizer } from "@/components/admin/QrCustomizer";

export default async function BusinessQrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getBusinessById(id);
  if (!business) notFound();

  const origin = await getRequestOrigin();
  const publicUrl = `${origin}/${business.slug}`;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-semibold">QR kod — {business.name}</h1>
      <QrCustomizer publicUrl={publicUrl} businessName={business.name} logoUrl={business.logoUrl} />
    </div>
  );
}
