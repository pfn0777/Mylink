"use server";

import { revalidatePath } from "next/cache";
import { eq, and, gt, lt, asc, desc, max } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { links } from "@/lib/db/schema";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { LinkInput } from "@/lib/validation";
import { isValidId } from "@/lib/id";

export interface LinkFormState {
  error?: string;
}

export async function addLink(
  businessId: string,
  _prevState: LinkFormState | undefined,
  formData: FormData,
): Promise<LinkFormState> {
  await requireAdminSession();

  if (!isValidId(businessId)) {
    return { error: "Biznes topilmadi" };
  }

  const parsed = LinkInput.safeParse({
    type: formData.get("type"),
    label: formData.get("label"),
    value: formData.get("value"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Noto'g'ri qiymat" };
  }

  const [row] = await db
    .select({ maxPosition: max(links.position) })
    .from(links)
    .where(eq(links.businessId, businessId));
  const nextPosition = (row?.maxPosition ?? -1) + 1;

  await db.insert(links).values({ businessId, ...parsed.data, position: nextPosition });

  revalidatePath(`/businesses/${businessId}/edit`);
  return {};
}

export async function deleteLink(linkId: string, businessId: string): Promise<void> {
  await requireAdminSession();
  if (!isValidId(linkId)) return;
  await db.delete(links).where(eq(links.id, linkId));
  revalidatePath(`/businesses/${businessId}/edit`);
}

export async function moveLink(linkId: string, businessId: string, direction: "up" | "down"): Promise<void> {
  await requireAdminSession();
  if (!isValidId(linkId)) return;

  const [link] = await db.select().from(links).where(eq(links.id, linkId)).limit(1);
  if (!link) return;

  const neighborCondition =
    direction === "up"
      ? and(eq(links.businessId, link.businessId), lt(links.position, link.position))
      : and(eq(links.businessId, link.businessId), gt(links.position, link.position));
  const neighborOrder = direction === "up" ? desc(links.position) : asc(links.position);

  const [neighbor] = await db.select().from(links).where(neighborCondition).orderBy(neighborOrder).limit(1);
  if (!neighbor) return;

  await db.update(links).set({ position: neighbor.position }).where(eq(links.id, link.id));
  await db.update(links).set({ position: link.position }).where(eq(links.id, neighbor.id));

  revalidatePath(`/businesses/${businessId}/edit`);
}

export async function getLinksForBusiness(businessId: string) {
  await requireAdminSession();
  if (!isValidId(businessId)) return [];
  return db.select().from(links).where(eq(links.businessId, businessId)).orderBy(asc(links.position));
}
