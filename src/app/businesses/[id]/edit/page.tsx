import { notFound } from "next/navigation";
import { getBusinessById, updateBusinessWithLinks } from "@/lib/actions/businesses";
import { getLinksForBusiness } from "@/lib/actions/links";
import { BusinessEditForm } from "@/components/admin/BusinessEditForm";

export default async function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getBusinessById(id);
  if (!business) notFound();

  const businessLinks = await getLinksForBusiness(business.id);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold">Biznesni tahrirlash</h1>
      <BusinessEditForm
        business={business}
        initialLinks={businessLinks}
        action={updateBusinessWithLinks.bind(null, business.id)}
      />
    </div>
  );
}
