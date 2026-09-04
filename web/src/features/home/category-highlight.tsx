'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CategoryRow } from '@/features/catalog/category.repository';

const FALLBACK_CATEGORIES: CategoryRow[] = [
  { id: '1', slug: 'body',   label: 'CORPS',      sub_label: 'Prendre soin de\nvotre corps',       image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=300&q=80',   href: '/categorie/body',   icon: '', is_quiz: false, order_index: 1, active: true, created_at: '' },
  { id: '2', slug: 'face',   label: 'VISAGE',     sub_label: 'Sublimer votre\nvisage',             image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&q=80',   href: '/categorie/face',   icon: '', is_quiz: false, order_index: 2, active: true, created_at: '' },
  { id: '3', slug: 'gammes', label: 'GAMMES',     sub_label: 'Soins complets\npar teint',          image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=300&q=80', href: '/categorie/gammes', icon: '', is_quiz: false, order_index: 3, active: true, created_at: '' },
  { id: '4', slug: 'kits',   label: 'KITS',       sub_label: 'La routine complète\npour vous',     image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=300&q=80',   href: '/categorie/kits',   icon: '', is_quiz: false, order_index: 4, active: true, created_at: '' },
  { id: '5', slug: 'duo',    label: 'DUO',        sub_label: 'Le duo parfait\npour vous',          image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=300&q=80',    href: '/categorie/duo',    icon: '', is_quiz: false, order_index: 5, active: true, created_at: '' },
];

interface Props {
  categories?: CategoryRow[];
}

export default function CategoryHighlight({ categories }: Readonly<Props>) {
  const raw = (categories && categories.length > 0) ? categories : FALLBACK_CATEGORIES;
  const display = raw.filter(c => !c.is_quiz);

  return (
    <section className="relative z-10 bg-transparent p-0 -mt-2 sm:-mt-12 md:-mt-16 lg:-mt-20">
      <div className="w-[90%] mx-auto bg-white rounded-[20px] shadow-[0_14px_50px_rgba(0,0,0,0.08)] relative z-10 p-0 overflow-hidden">
        <div className="flex w-full justify-evenly max-sm:justify-start max-sm:overflow-x-auto max-sm:snap-x max-sm:snap-mandatory scrollbar-none">
          {display.map((cat, idx) => (
            <Link
              key={cat.id}
              href={cat.href}
              className={`flex flex-col items-center shrink-0 min-w-0 max-sm:min-w-[90px] max-sm:snap-start py-4 px-2.5 max-sm:py-3 max-sm:px-2 no-underline cursor-pointer group transition-colors duration-200 hover:bg-[#FDFAF6] max-sm:hover:bg-transparent ${
                idx < display.length - 1 ? 'border-r border-[#F0EBE0] max-sm:border-r-0' : ''
              }`}
            >
              {/* Ovale beige avec image produit */}
              <div className="relative w-[80px] h-[95px] max-sm:w-[62px] max-sm:h-[74px] bg-[#F5EDE2] rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  sizes="80px"
                  className="object-cover object-top transition-transform duration-400 ease-out group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>

              {/* Textes */}
              <div className="text-center mt-2.5">
                <span className="block font-sans font-bold text-[0.72rem] tracking-[0.14em] text-[#1A0E05] uppercase mb-1">
                  {cat.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


