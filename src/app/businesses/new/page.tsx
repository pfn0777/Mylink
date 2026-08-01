import { createBusiness } from "@/lib/actions/businesses";
import { BusinessForm } from "@/components/admin/BusinessForm";

export default function NewBusinessPage() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-semibold">Yangi biznes qo&apos;shish</h1>
      <BusinessForm action={createBusiness} submitLabel="Yaratish" />
    </div>
  );
}
