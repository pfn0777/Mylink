import { notFound } from "next/navigation";
import { getBusinessById, updateBusiness } from "@/lib/actions/businesses";
import { getLinksForBusiness } from "@/lib/actions/links";
import { BusinessForm } from "@/components/admin/BusinessForm";
import { LinkEditor } from "@/components/admin/LinkEditor";

export default async function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getBusinessById(id);
  if (!business) notFound();

  const businessLinks = await getLinksForBusiness(business.id);
  const boundUpdate = updateBusiness.bind(null, business.id);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="mb-4 text-xl font-semibold">Biznesni tahrirlash</h1>
        <BusinessForm
          action={boundUpdate}
          defaultValues={{
            name: business.name,
            slug: business.slug,
            description: business.description ?? "",
            logoUrl: business.logoUrl,
          }}
          submitLabel="Saqlash"
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Linklar</h2>
        <LinkEditor businessId={business.id} links={businessLinks} />
      </div>
    </div>
  );
}
