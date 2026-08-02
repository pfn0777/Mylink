import Link from "next/link";
import { getBusinesses } from "@/lib/actions/businesses";
import { logout } from "@/lib/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { DeleteBusinessButton } from "@/components/admin/DeleteBusinessButton";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const businessList = await getBusinesses();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mening bizneslarim</h1>
        <div className="flex items-center gap-2">
          <Link href="/businesses/new" className={cn(buttonVariants({ variant: "default" }))}>
            + Yangi qo&apos;shish
          </Link>
          <form action={logout}>
            <Button type="submit" variant="outline">
              Chiqish
            </Button>
          </form>
        </div>
      </div>

      {businessList.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Hali birorta biznes yo&apos;q.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businessList.map((business) => (
            <li key={business.id} className="flex gap-3 rounded-lg border p-4">
              {business.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={business.logoUrl}
                  alt={business.name}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <div className="font-medium">{business.name}</div>
                <div className="text-sm text-muted-foreground">/{business.slug}</div>
                {business.description && <p className="mt-1 text-sm">{business.description}</p>}
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/businesses/${business.id}/edit`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Tahrirlash
                  </Link>
                  <Link
                    href={`/${business.slug}`}
                    target="_blank"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Ko&apos;rish
                  </Link>
                  <Link
                    href={`/businesses/${business.id}/qr`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    QR kod
                  </Link>
                  <DeleteBusinessButton businessId={business.id} businessName={business.name} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
