// Appearance preferences stored in localStorage
export interface AppearancePrefs {
  theme: 'clasica' | 'nocturna' | 'bosque' | 'cielo' | 'rosa' | 'sepia';
  titleFont: 'muthiara' | 'maquina' | 'playfair' | 'lora' | 'merriweather' | 'quicksand' | 'baskerville';
  bodyFont: 'inter' | 'georgia' | 'nunito';
  ratingIcon: 'star' | 'leaf' | 'heart' | 'flower' | 'book';
  coverRatio: 'poster' | 'square';
}

export const DEFAULTS: AppearancePrefs = {
  theme: 'clasica',
  titleFont: 'muthiara',
  bodyFont: 'inter',
  ratingIcon: 'star',
  coverRatio: 'poster',
};

export const RATING_ICONS: Record<AppearancePrefs['ratingIcon'], string> = {
  star: '★',
  leaf: '🌿',
  heart: '❤️',
  flower: '🌸',
  book: '📖',
};

export const TITLE_FONTS: Record<AppearancePrefs['titleFont'], string> = {
  muthiara:     "'Muthiara', cursive",
  maquina:      "'MaquinaDeEscribir', monospace",
  playfair:     "'Playfair Display', serif",
  lora:         "'Lora', serif",
  merriweather: "'Merriweather', serif",
  quicksand:    "'Quicksand', sans-serif",
  baskerville:  "'Libre Baskerville', serif",
};

export const BODY_FONTS: Record<AppearancePrefs['bodyFont'], string> = {
  inter:   "'Inter', sans-serif",
  georgia: "Georgia, serif",
  nunito:  "'Nunito', sans-serif",
};

export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Lora:wght@400;700&family=Merriweather:wght@400;700&family=Quicksand:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Inter:wght@400;500&family=Nunito:wght@400;500&display=swap';
