'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { fetchCard, getCardImageUrl } from '@/lib/api';

export default function CardPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: card, isLoading, error } = useQuery({
    queryKey: ['card', id],
    queryFn: () => fetchCard(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-400">Loading card...</div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-red-400">Card not found</div>
      </div>
    );
  }

  const imageUrl = getCardImageUrl(card.id, 'medium');
  const frameType = card.frame_type?.toLowerCase() || '';
  const isMonster = card.type?.toLowerCase().includes('monster') || frameType.includes('monster');
  const isLink = frameType.includes('link');
  const isPendulum = frameType.includes('pendulum');
  const isXyz = frameType.includes('xyz');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <div className="relative w-64 mx-auto md:mx-0">
            <Image
              src={imageUrl}
              alt={card.name}
              width={256}
              height={384}
              className="rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{card.name}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-orange-600 rounded-full text-sm">
              {card.type}
            </span>
            {card.race && (
              <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                {card.race}
              </span>
            )}
            {card.attribute && (
              <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">
                {card.attribute}
              </span>
            )}
          </div>

          {card.typeline && card.typeline.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {card.typeline.map((type, index) => (
                <span key={index} className="px-3 py-1 bg-purple-600 rounded-full text-sm">
                  {type}
                </span>
              ))}
            </div>
          )}

          {card.archetype && (
            <p className="text-gray-400 mb-4">
              <span className="font-semibold">Archetype:</span> {card.archetype}
            </p>
          )}

          {isMonster && card.level != null && (
            <p className="mb-2">
              <span className="font-semibold">{isXyz ? 'Rank' : 'Level'}:</span> {card.level}
            </p>
          )}

          {isPendulum && card.scale != null && (
            <p className="mb-2">
              <span className="font-semibold">Pendulum Scale:</span> {card.scale}
            </p>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
            {isMonster && card.atk != null && (
              <p>
                <span className="font-semibold">ATK:</span> {card.atk}
              </p>
            )}

            {isLink && card.linkval != null && (
              <p>
                <span className="font-semibold">Link Rating:</span> {card.linkval}
              </p>
            )}

            {!isLink && isMonster && card.def != null && (
              <p>
                <span className="font-semibold">DEF:</span> {card.def}
              </p>
            )}
          </div>

          {isLink && card.linkmarkers && card.linkmarkers.length > 0 && (
            <p className="mb-4">
              <span className="font-semibold">Link Markers:</span> {card.linkmarkers.join(', ')}
            </p>
          )}

          {card.banlist_info && (
            <div className="mb-4">
              <span className="font-semibold">Banlist Status:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {card.banlist_info.tcg && (
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    card.banlist_info.tcg === 'Banned' ? 'bg-red-600' :
                    card.banlist_info.tcg === 'Limited' ? 'bg-yellow-600' :
                    'bg-green-600'
                  }`}>
                    TCG: {card.banlist_info.tcg}
                  </span>
                )}
                {card.banlist_info.ocg && (
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    card.banlist_info.ocg === 'Banned' ? 'bg-red-600' :
                    card.banlist_info.ocg === 'Limited' ? 'bg-yellow-600' :
                    'bg-green-600'
                  }`}>
                    OCG: {card.banlist_info.ocg}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="font-semibold mb-2 text-gray-300">Effect / Card Text</h2>
            <p className="whitespace-pre-wrap text-gray-200 font-[family-name:var(--font-card)] text-lg leading-relaxed">{card.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
