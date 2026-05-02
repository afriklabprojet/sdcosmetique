import { redirect } from 'next/navigation';

const CATEGORY_ALIASES: Record<string, string> = {
  visage: 'face',
  corps: 'body',
  gammes: 'gammes',
  kits: 'kits',
  duo: 'duo',
};

export default async function BoutiqueCategoryAliasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/categorie/${CATEGORY_ALIASES[slug] ?? slug}`);
}