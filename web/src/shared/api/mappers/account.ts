import type { Address } from '@/features/account/account.constant';
import type { LaravelAccount, LaravelAddress, LaravelAddressWrite, LaravelSessionUser } from '@/shared/api/types';

const ISO_TO_COUNTRY: Record<string, string> = {
  CI: "Côte d'Ivoire",
  FR: 'France',
  SN: 'Sénégal',
  ML: 'Mali',
  BF: 'Burkina Faso',
  GN: 'Guinée',
};

const COUNTRY_TO_ISO: Record<string, string> = Object.fromEntries(
  Object.entries(ISO_TO_COUNTRY).flatMap(([iso, label]) => [
    [label, iso],
    [iso, iso],
  ]),
);

export type StorefrontIdentity = {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  newsletter: boolean;
  points: number;
  createdAt: string;
};

export function splitPersonName(name: string): { prenom: string; nom: string } {
  const trimmed = name.trim();
  const space = trimmed.indexOf(' ');
  if (space === -1) return { prenom: trimmed, nom: '' };
  return { prenom: trimmed.slice(0, space), nom: trimmed.slice(space + 1).trim() };
}

export function joinPersonName(prenom: string, nom: string): string {
  return [prenom, nom].map((part) => part.trim()).filter(Boolean).join(' ');
}

export function countryToIso(country: string): string {
  const trimmed = country.trim();
  return COUNTRY_TO_ISO[trimmed] ?? (trimmed.length === 2 ? trimmed.toUpperCase() : 'CI');
}

export function isoToCountry(iso: string): string {
  return ISO_TO_COUNTRY[iso] ?? iso;
}

export function mapSessionUser(user: LaravelSessionUser, account?: LaravelAccount | null): StorefrontIdentity {
  const name = account?.name ?? user.name ?? '';
  const { prenom, nom } = splitPersonName(name);
  return {
    id: String(user.id),
    email: account?.email ?? user.email,
    prenom,
    nom,
    telephone: account?.phone ?? null,
    newsletter: true,
    points: 0,
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

export function mapAddress(dto: LaravelAddress): Address {
  return {
    id: String(dto.id),
    label: dto.company?.trim() || 'Domicile',
    firstName: dto.first_name,
    lastName: dto.last_name,
    street: [dto.line_1, dto.line_2].filter(Boolean).join(', '),
    city: dto.city,
    postalCode: dto.postal_code ?? '',
    country: isoToCountry(dto.country),
    phone: dto.phone ?? '',
    preferred: false,
  };
}

export function toAddressPayload(address: Address): LaravelAddressWrite {
  const [line1, ...rest] = address.street.split(',').map((part) => part.trim()).filter(Boolean);
  return {
    first_name: address.firstName,
    last_name: address.lastName,
    company: address.label && address.label !== 'Domicile' ? address.label : null,
    line_1: line1 || address.street,
    line_2: rest.length > 0 ? rest.join(', ') : null,
    city: address.city,
    postal_code: address.postalCode || null,
    country: countryToIso(address.country || "Côte d'Ivoire"),
    phone: address.phone || null,
  };
}
