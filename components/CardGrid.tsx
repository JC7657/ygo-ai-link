'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/lib/types';
import { getCardImageUrl } from '@/lib/api';

interface CardImageProps {
  card: Card;
  size?: 'small' | 'medium' | 'large';
  priority?: boolean;
}

export function CardImage({ card, size = 'small', priority = false }: CardImageProps) {
  const imageUrl = getCardImageUrl(card.id, size);
  const fallbackUrl = getCardImageUrl(card.id, 'small');

  return (
    <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-gray-800">
      <Image
        src={imageUrl}
        alt={card.name}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        className="object-cover transition-transform hover:scale-105"
        priority={priority}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== fallbackUrl) {
            target.src = fallbackUrl;
          }
        }}
      />
    </div>
  );
}

interface CardGridProps {
  cards: Card[];
}

export function CardGrid({ cards }: CardGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Link key={card.id} href={`/cards/${card.id}`} className="block">
          <CardImage card={card} />
          <p className="mt-2 text-sm text-center text-gray-200 truncate px-1">
            {card.name}
          </p>
        </Link>
      ))}
    </div>
  );
}
