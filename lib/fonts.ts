export const WEIGHT_NAME: Record<number, string> = {
  300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold',
}

export interface FontEntry { family: string; weights: number[] }
export interface FontGroup  { label: string;  fonts: FontEntry[]  }

export const FONT_GROUPS: FontGroup[] = [
  {
    label: 'Modern Sans',
    fonts: [
      { family: 'Inter',             weights: [300, 400, 500, 600, 700] },
      { family: 'DM Sans',           weights: [300, 400, 500, 600, 700] },
      { family: 'Plus Jakarta Sans', weights: [300, 400, 500, 600, 700] },
      { family: 'Nunito Sans',       weights: [300, 400, 600, 700] },
      { family: 'Outfit',            weights: [300, 400, 500, 600, 700] },
      { family: 'Figtree',           weights: [300, 400, 500, 600, 700] },
      { family: 'Sora',              weights: [300, 400, 500, 600, 700] },
      { family: 'Urbanist',          weights: [300, 400, 500, 600, 700] },
      { family: 'Manrope',           weights: [300, 400, 500, 600, 700] },
      { family: 'Be Vietnam Pro',    weights: [300, 400, 500, 600, 700] },
      { family: 'Lexend',            weights: [300, 400, 500, 600, 700] },
      { family: 'Mulish',            weights: [300, 400, 500, 600, 700] },
      { family: 'Work Sans',         weights: [300, 400, 500, 600, 700] },
      { family: 'Karla',             weights: [300, 400, 500, 600, 700] },
      { family: 'Rubik',             weights: [300, 400, 500, 600, 700] },
      { family: 'Jost',              weights: [300, 400, 500, 600, 700] },
      { family: 'Quicksand',         weights: [300, 400, 500, 600, 700] },
      { family: 'Onest',             weights: [300, 400, 500, 600, 700] },
    ],
  },
  {
    label: 'Classic Sans',
    fonts: [
      { family: 'Open Sans',     weights: [300, 400, 600, 700] },
      { family: 'Roboto',        weights: [300, 400, 500, 700] },
      { family: 'Lato',          weights: [300, 400, 700] },
      { family: 'Source Sans 3', weights: [300, 400, 600, 700] },
      { family: 'Noto Sans',     weights: [300, 400, 600, 700] },
      { family: 'Ubuntu',        weights: [300, 400, 500, 700] },
      { family: 'Hind',          weights: [300, 400, 500, 600, 700] },
      { family: 'Titillium Web', weights: [300, 400, 600, 700] },
      { family: 'Exo 2',         weights: [300, 400, 500, 600, 700] },
      { family: 'Mukta',         weights: [300, 400, 500, 600, 700] },
      { family: 'Oxygen',        weights: [300, 400, 700] },
    ],
  },
  {
    label: 'Geometric',
    fonts: [
      { family: 'Montserrat',  weights: [300, 400, 500, 600, 700] },
      { family: 'Poppins',     weights: [300, 400, 500, 600, 700] },
      { family: 'Raleway',     weights: [300, 400, 500, 600, 700] },
      { family: 'Josefin Sans',weights: [300, 400, 600, 700] },
      { family: 'Nunito',      weights: [300, 400, 600, 700] },
      { family: 'Comfortaa',   weights: [300, 400, 500, 600, 700] },
    ],
  },
  {
    label: 'Condensed',
    fonts: [
      { family: 'IBM Plex Sans Condensed', weights: [300, 400, 500, 600, 700] },
      { family: 'Barlow Condensed',        weights: [300, 400, 500, 600, 700] },
      { family: 'Barlow Semi Condensed',   weights: [300, 400, 500, 600, 700] },
      { family: 'Roboto Condensed',        weights: [300, 400, 500, 600, 700] },
      { family: 'Oswald',                  weights: [300, 400, 500, 600, 700] },
      { family: 'Yanone Kaffeesatz',       weights: [300, 400, 500, 600, 700] },
      { family: 'Saira Condensed',         weights: [300, 400, 500, 600, 700] },
    ],
  },
  {
    label: 'Humanist',
    fonts: [
      { family: 'IBM Plex Sans', weights: [300, 400, 500, 600, 700] },
      { family: 'Cabin',         weights: [400, 500, 600, 700] },
      { family: 'Fira Sans',     weights: [300, 400, 500, 600, 700] },
      { family: 'Dosis',         weights: [300, 400, 500, 600, 700] },
      { family: 'Catamaran',     weights: [300, 400, 500, 600, 700] },
      { family: 'Arimo',         weights: [400, 500, 600, 700] },
      { family: 'PT Sans',       weights: [400, 700] },
    ],
  },
  {
    label: 'Serif',
    fonts: [
      { family: 'Merriweather',       weights: [300, 400, 700] },
      { family: 'Playfair Display',   weights: [400, 500, 600, 700] },
      { family: 'Lora',               weights: [400, 500, 600, 700] },
      { family: 'EB Garamond',        weights: [400, 500, 600, 700] },
      { family: 'Crimson Pro',        weights: [300, 400, 600, 700] },
      { family: 'Spectral',           weights: [300, 400, 600, 700] },
      { family: 'Cormorant Garamond', weights: [300, 400, 500, 600, 700] },
      { family: 'Libre Baskerville',  weights: [400, 700] },
      { family: 'PT Serif',           weights: [400, 700] },
      { family: 'Bitter',             weights: [300, 400, 500, 600, 700] },
      { family: 'Arvo',               weights: [400, 700] },
      { family: 'Zilla Slab',         weights: [300, 400, 500, 600, 700] },
      { family: 'Vollkorn',           weights: [400, 500, 600, 700] },
      { family: 'Cardo',              weights: [400, 700] },
      { family: 'Libre Caslon Text',  weights: [400, 700] },
    ],
  },
  {
    label: 'Display',
    fonts: [
      { family: 'Bebas Neue', weights: [400] },
      { family: 'Anton',      weights: [400] },
      { family: 'Exo',        weights: [300, 400, 500, 600, 700] },
      { family: 'Audiowide',  weights: [400] },
      { family: 'Righteous',  weights: [400] },
    ],
  },
  {
    label: 'Monospace',
    fonts: [
      { family: 'JetBrains Mono', weights: [300, 400, 500, 600, 700] },
      { family: 'Fira Code',      weights: [300, 400, 500, 600, 700] },
      { family: 'IBM Plex Mono',  weights: [300, 400, 500, 600, 700] },
      { family: 'Source Code Pro',weights: [300, 400, 500, 600, 700] },
      { family: 'Roboto Mono',    weights: [300, 400, 500, 600, 700] },
      { family: 'Inconsolata',    weights: [300, 400, 500, 600, 700] },
      { family: 'Overpass Mono',  weights: [300, 400, 500, 600, 700] },
      { family: 'Space Mono',     weights: [400, 700] },
      { family: 'Courier Prime',  weights: [400, 700] },
      { family: 'Anonymous Pro',  weights: [400, 700] },
    ],
  },
  {
    label: 'System',
    fonts: [
      { family: 'Georgia',        weights: [400, 700] },
      { family: 'Arial',          weights: [400, 700] },
      { family: 'Helvetica',      weights: [400, 700] },
      { family: 'Trebuchet MS',   weights: [400, 700] },
      { family: 'Verdana',        weights: [400, 700] },
      { family: 'Times New Roman',weights: [400, 700] },
    ],
  },
]

// Fast lookup: family name → available weights
export const FONT_WEIGHTS: Record<string, number[]> = Object.fromEntries(
  FONT_GROUPS.flatMap(g => g.fonts.map(f => [f.family, f.weights]))
)
