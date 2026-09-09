import type { ShippingOption } from '@/features/site-config/site-config.type';
import type { LaravelDeliveryMethod } from '@/shared/api/types';

export type MappedDelivery = ShippingOption & { slug: string; zone: string; carrier: string };

export function mapDeliveryMethod(dto: LaravelDeliveryMethod): MappedDelivery {
  return {
    id: String(dto.id),
    label: dto.name,
    // Le champ « Description » de l'admin correspond un-à-un à `zone` (c'est
    // ce que voit le client au checkout) — `carrier` reste un champ interne,
    // jamais mélangé dans le texte affiché/éditable.
    description: dto.zone,
    cost: dto.amount,
    freeFrom: 0,
    active: dto.visible,
    slug: dto.slug,
    zone: dto.zone,
    carrier: dto.carrier,
  };
}

export function toDeliveryMethodPayload(option: ShippingOption & Partial<MappedDelivery>): {
  slug: string;
  name: string;
  zone: string;
  carrier: string;
  amount: number;
  cost: number;
  position: number;
  visible_at: string | null;
} {
  const fromLabel = option.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // Une nouvelle option (id `opt-<timestamp>`) n'a pas encore de slug stable : on
  // y ajoute un suffixe dérivé de son id temporaire pour ne jamais entrer en
  // collision avec une autre option laissée sur son libellé par défaut
  // ("Nouvelle option" x2 générerait sinon le même slug et le second
  // enregistrement échouerait silencieusement côté admin).
  const uniqueSuffix = option.id.startsWith('opt-') ? option.id.slice(4) : Date.now().toString();
  const slug = option.slug ?? `${fromLabel || 'method'}-${uniqueSuffix}`;
  return {
    slug,
    name: option.label,
    // La saisie manuelle prime toujours sur l'ancienne valeur : sinon la
    // description tapée par l'admin est aussitôt écrasée par le `zone`
    // d'origine au prochain enregistrement.
    zone: option.description || option.zone || 'CI',
    carrier: option.carrier || 'local',
    amount: option.cost,
    cost: option.cost,
    position: 0,
    visible_at: option.active ? new Date().toISOString() : null,
  };
}
