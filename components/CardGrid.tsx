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

interface CardListItemProps {
  card: Card;
}

export function CardListItem({ card }: CardListItemProps) {
  const imageUrl = getCardImageUrl(card.id, 'small');

  return (
    <Link 
      href={`/cards/${card.id}`} 
      className="flex gap-4 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
    >
      <div className="relative w-24 h-32 flex-shrink-0 overflow-hidden rounded-md bg-gray-800">
        <Image
          src={imageUrl}
          alt={card.name}
          fill
          sizes="96px"
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">{card.name}</h3>
        
        <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-400">
          <span>{card.type}</span>
          {card.attribute && <span>{card.attribute}</span>}
          {card.level && <span>LV {card.level}</span>}
          {card.atk !== null && card.atk !== undefined && (
            <span>{card.atk} ATK {card.def !== null && card.def !== undefined && `/${card.def} DEF`}</span>
          )}
          {card.linkval && <span>LINK-{card.linkval}</span>}
        </div>
        
        {card.archetype && (
          <p className="text-sm text-purple-400 mt-1">{card.archetype}</p>
        )}
        
        {card.description && (
          <p className="text-sm text-gray-300 mt-2 line-clamp-2">
            {card.description.replace(/\n/g, ' ')}
          </p>
        )}
      </div>
    </Link>
  );
}

type ViewMode = 'grid' | 'list';

interface CardGridProps {
  cards: Card[];
  view?: ViewMode;
}

export function CardGrid({ cards, view = 'grid' }: CardGridProps) {
  if (view === 'list') {
    return (
      <div className="flex flex-col gap-2">
        {cards.map((card) => (
          <CardListItem key={card.id} card={card} />
        ))}
      </div>
    );
  }

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
