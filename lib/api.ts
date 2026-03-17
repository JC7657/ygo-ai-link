import { Card, CardsResponse, SearchParams } from './types';
import { CardFilters } from './filters';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type SearchType = 'name' | 'description' | 'both';

function buildFilterQuery(filters: CardFilters): string {
  const params = new URLSearchParams();

  if (filters.type?.length) params.set('type', filters.type.join(','));
  if (filters.frame_type?.length) params.set('frame_type', filters.frame_type.join(','));
  if (filters.attribute?.length) params.set('attribute', filters.attribute.join(','));
  if (filters.race?.length) params.set('race', filters.race.join(','));
  if (filters.archetype) params.set('archetype', filters.archetype);
  if (filters.atk_min != null) params.set('atk_min', String(filters.atk_min));
  if (filters.atk_max != null) params.set('atk_max', String(filters.atk_max));
  if (filters.def_min != null) params.set('def_min', String(filters.def_min));
  if (filters.def_max != null) params.set('def_max', String(filters.def_max));
  if (filters.level_min != null) params.set('level_min', String(filters.level_min));
  if (filters.level_max != null) params.set('level_max', String(filters.level_max));
  if (filters.linkval_min != null) params.set('linkval_min', String(filters.linkval_min));
  if (filters.linkval_max != null) params.set('linkval_max', String(filters.linkval_max));
  if (filters.scale_min != null) params.set('scale_min', String(filters.scale_min));
  if (filters.scale_max != null) params.set('scale_max', String(filters.scale_max));
  if (filters.linkmarkers?.length) params.set('linkmarkers', filters.linkmarkers.join(','));
  if (filters.linkmarkers_op) params.set('linkmarkers_op', filters.linkmarkers_op);
  if (filters.typeline?.length) params.set('typeline', filters.typeline.join(','));
  if (filters.typeline_op) params.set('typeline_op', filters.typeline_op);

  return params.toString();
}

export async function fetchCards(params: SearchParams & { filters?: CardFilters; searchType?: SearchType } = {}): Promise<CardsResponse> {
  const { page = 1, limit = 20, name, filters, searchType = 'name' } = params;

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  let endpoint = '/cards';

  if (name) {
    searchParams.set('name', name);
    searchParams.set('searchType', searchType);
  }

  if (filters && Object.keys(filters).length > 0) {
    const filterQuery = buildFilterQuery(filters);
    if (filterQuery) {
      searchParams.set('filters', filterQuery);
    }
  }

  const url = `${API_URL}${endpoint}?${searchParams}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch cards');
  }

  return response.json();
}

export async function fetchCard(id: string): Promise<Card> {
  const response = await fetch(`${API_URL}/cards/${id}`);

  if (!response.ok) {
    throw new Error('Card not found');
  }

  return response.json();
}

export function getCardImageUrl(id: number, size: 'small' | 'medium' | 'large' = 'small'): string {
  const sizes = {
    small: '/images/cards_small',
    medium: '/images/cards',
    large: '/images/cards_big',
  };
  return `https://images.ygoprodeck.com${sizes[size]}/${id}.jpg`;
}
