import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isReservedSlug } from "@/lib/slug";
import { getPublicBusinessBySlug } from "@/lib/public";
import { PublicBusinessPage } from "@/components/public/PublicBusinessPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedSlug(slug)) return {};

  const result = await getPublicBusinessBySlug(slug);
  if (!result) return {};

  return { title: result.business.name, description: result.business.description ?? undefined };
}

export default async function BusinessPublicPage({ params }: PageProps) {
  const { slug } = await params;
  if (isReservedSlug(slug)) notFound();

  const result = await getPublicBusinessBySlug(slug);
  if (!result) notFound();

  return <PublicBusinessPage business={result.business} links={result.links} />;
}
