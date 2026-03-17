export interface Card {
  id: number;
  name: string;
  type: string;
  frame_type: string;
  description: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;
  archetype?: string;
  linkval?: number;
  linkmarkers?: string[];
  scale?: number;
  typeline?: string[];
  banlist_info?: {
    tcg?: string;
    ocg?: string;
    goat?: string;
  };
  misc_info?: number[];
  card_images?: Array<{
    id: number;
    image_url: string;
    image_url_small: string;
  }>;
}

export interface CardsResponse {
  page: number;
  limit: number;
  count: number;
  cards: Card[];
}

export interface SearchParams {
  page?: number;
  limit?: number;
  name?: string;
}
