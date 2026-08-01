"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { eq, ne, and, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { businesses } from "@/lib/db/schema";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { validateSlugFormat, type SlugFormatError } from "@/lib/slug";
import { isValidId } from "@/lib/id";

const BusinessInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export interface BusinessFormState {
  error?: string;
}

async function uploadLogoIfProvided(formData: FormData): Promise<string | undefined> {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) return undefined;

  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    throw new Error("Logo faqat PNG, JPG yoki WEBP formatida bo'lishi kerak");
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("Logo hajmi 2MB dan oshmasligi kerak");
  }

  const blob = await put(`logos/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
  });
  return blob.url;
}

function slugFormatErrorMessage(error: SlugFormatError): string {
  switch (error) {
    case "empty":
      return "Slug bo'sh bo'lishi mumkin emas";
    case "too_short":
      return "Slug juda qisqa";
    case "too_long":
      return "Slug juda uzun";
    case "invalid_characters":
      return "Slug faqat kichik lotin harflari, raqamlar va tire (-) dan iborat bo'lishi kerak";
    case "reserved":
      return "Bu slug band (tizim uchun ishlatiladi)";
  }
}

export async function createBusiness(
  _prevState: BusinessFormState | undefined,
  formData: FormData,
): Promise<BusinessFormState> {
  await requireAdminSession();

  const parsed = BusinessInput.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: "Biznes nomi va slug kiritilishi shart" };
  }
  const { name, slug, description } = parsed.data;

  const formatError = validateSlugFormat(slug);
  if (formatError) {
    return { error: slugFormatErrorMessage(formatError) };
  }

  const [existing] = await db.select({ id: businesses.id }).from(businesses).where(eq(businesses.slug, slug)).limit(1);
  if (existing) {
    return { error: "Bu slug band, boshqasini tanlang" };
  }

  let logoUrl: string | undefined;
  try {
    logoUrl = await uploadLogoIfProvided(formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Logo yuklashda xatolik" };
  }

  const [business] = await db.insert(businesses).values({ name, slug, description, logoUrl }).returning();
  if (!business) throw new Error("createBusiness: insert returned no row");

  redirect("/dashboard");
}

export async function updateBusiness(
  businessId: string,
  _prevState: BusinessFormState | undefined,
  formData: FormData,
): Promise<BusinessFormState> {
  await requireAdminSession();

  if (!isValidId(businessId)) {
    return { error: "Biznes topilmadi" };
  }

  const parsed = BusinessInput.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: "Biznes nomi va slug kiritilishi shart" };
  }
  const { name, slug, description } = parsed.data;

  const formatError = validateSlugFormat(slug);
  if (formatError) {
    return { error: slugFormatErrorMessage(formatError) };
  }

  const [existing] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(and(eq(businesses.slug, slug), ne(businesses.id, businessId)))
    .limit(1);
  if (existing) {
    return { error: "Bu slug band, boshqasini tanlang" };
  }

  let logoUrl: string | undefined;
  try {
    logoUrl = await uploadLogoIfProvided(formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Logo yuklashda xatolik" };
  }

  await db
    .update(businesses)
    .set({ name, slug, description, updatedAt: new Date(), ...(logoUrl ? { logoUrl } : {}) })
    .where(eq(businesses.id, businessId));

  redirect("/dashboard");
}

export async function getBusinesses() {
  await requireAdminSession();
  return db.select().from(businesses).orderBy(desc(businesses.createdAt));
}

export async function getBusinessById(id: string) {
  await requireAdminSession();
  if (!isValidId(id)) return undefined;
  const [business] = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
  return business;
}

export async function deleteBusiness(businessId: string): Promise<void> {
  await requireAdminSession();
  if (!isValidId(businessId)) return;
  await db.delete(businesses).where(eq(businesses.id, businessId));
  revalidatePath("/dashboard");
}
