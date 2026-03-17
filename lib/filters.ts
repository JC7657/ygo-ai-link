export interface CardFilters {
  type?: string[];
  frame_type?: string[];
  attribute?: string[];
  race?: string[];
  archetype?: string;
  atk_min?: number;
  atk_max?: number;
  def_min?: number;
  def_max?: number;
  level_min?: number;
  level_max?: number;
  linkval_min?: number;
  linkval_max?: number;
  scale_min?: number;
  scale_max?: number;
  linkmarkers?: string[];
  linkmarkers_op?: 'and' | 'or';
  typeline?: string[];
  typeline_op?: 'and' | 'or';
}

export const CARD_TYPES = [
  'Monster',
  'Spell Card',
  'Trap Card',
];

export const FRAME_TYPES = [
  'normal',
  'effect',
  'fusion',
  'synchro',
  'xyz',
  'pendulum',
  'link',
  'ritual',
  'trap',
  'spell',
];

export const ATTRIBUTES = [
  'DARK',
  'LIGHT',
  'FIRE',
  'WATER',
  'EARTH',
  'WIND',
  'DIVINE',
];

export const RACES = [
  'Aqua',
  'Beast',
  'Beast-Warrior',
  'Cyberse',
  'Dinosaur',
  'Divine-Beast',
  'Dragon',
  'Fairy',
  'Fiend',
  'Fish',
  'Illusionist',
  'Insect',
  'Machine',
  'Plant',
  'Psychic',
  'Pyro',
  'Reptile',
  'Rock',
  'Sea Serpent',
  'Spellcaster',
  'Thunder',
  'Warrior',
  'Winged Beast',
  'Wyrm',
  'Zombie',
];

export const LINK_MARKERS = [
  'Top',
  'Bottom',
  'Left',
  'Right',
  'Top-Left',
  'Top-Right',
  'Bottom-Left',
  'Bottom-Right',
];

export const TYPELINE = [
  'Normal',
  'Effect',
  'Fusion',
  'Synchro',
  'Xyz',
  'Link',
  'Pendulum',
  'Ritual',
  'Tuner',
  'Flip',
  'Gemini',
  'Spirit',
  'Union',
  'Toon',
  'Aqua',
  'Beast',
  'Beast-Warrior',
  'Cyberse',
  'Dinosaur',
  'Divine-Beast',
  'Dragon',
  'Fairy',
  'Fiend',
  'Fish',
  'Insect',
  'Machine',
  'Plant',
  'Psychic',
  'Pyro',
  'Reptile',
  'Rock',
  'Sea Serpent',
  'Spellcaster',
  'Thunder',
  'Warrior',
  'Winged Beast',
  'Wyrm',
  'Zombie',
];
