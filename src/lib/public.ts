import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses, links } from "@/lib/db/schema";

export async function getPublicBusinessBySlug(slug: string) {
  const [business] = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
  if (!business) return null;

  const businessLinks = await db
    .select()
    .from(links)
    .where(eq(links.businessId, business.id))
    .orderBy(asc(links.position));

  return { business, links: businessLinks };
}
