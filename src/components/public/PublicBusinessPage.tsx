import { LinkButton } from "@/components/public/LinkButton";
import type { Business, Link as LinkRow } from "@/lib/db/schema";

interface PublicBusinessPageProps {
  business: Business;
  links: LinkRow[];
}

export function PublicBusinessPage({ business, links }: PublicBusinessPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center shadow-xl">
        {business.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.logoUrl}
            alt={business.name}
            className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
          />
        )}

        <h1 className="text-lg font-semibold text-white">{business.name}</h1>
        {business.description && <p className="mt-1 text-sm text-slate-300">{business.description}</p>}

        <div className="mt-6 space-y-3">
          {links.length === 0 ? (
            <p className="text-sm text-slate-400">Hali link yo&apos;q</p>
          ) : (
            links.map((link) => <LinkButton key={link.id} type={link.type} label={link.label} value={link.value} />)
          )}
        </div>

        <p className="mt-8 text-xs text-slate-500">Powered by MyLink</p>
      </div>
    </div>
  );
}
