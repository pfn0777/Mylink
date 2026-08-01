"use server";

import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { links } from "@/lib/db/schema";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { isValidId } from "@/lib/id";

export async function getLinksForBusiness(businessId: string) {
  await requireAdminSession();
  if (!isValidId(businessId)) return [];
  return db.select().from(links).where(eq(links.businessId, businessId)).orderBy(asc(links.position));
}
