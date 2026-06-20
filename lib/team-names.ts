// Bidirectional team-name normalization.
// Keys are canonical (what appears in Excel templates); values are known API
// or alternate spellings. All comparisons should go through normalizeTeamName().

const TEAM_VARIANTS: Record<string, string[]> = {
  Turkey: ['Türkiye', 'Turkiye'],
  'Czech Republic': ['Czechia', 'Czech Republic'],
  'South Korea': ['Korea Republic', 'Republic of Korea', 'Korea, Republic of'],
  'Ivory Coast': ["Côte d'Ivoire", "Cote d'Ivoire", "Côte D'Ivoire", 'Cote d Ivoire'],
  'DR Congo': ['Congo DR', 'Democratic Republic of Congo', 'DR Congo', 'Congo (DR)'],
  'Bosnia-Herzegovina': [
    'Bosnia & Herzegovina',
    'Bosnia and Herzegovina',
    'Bosnia & Herzegowina',
  ],
  'North Macedonia': ['Macedonia', 'Republic of North Macedonia'],
  'Trinidad & Tobago': ['Trinidad and Tobago', 'Trinidad And Tobago'],
  USA: ['United States', 'United States of America', 'U.S.A.', 'U.S.'],
  'New Zealand': ['New Zealand', 'New Zealand (NZ)'],
  'Saudi Arabia': ['KSA', 'Saudi Arabia'],
  Iran: ['Iran IR', 'Islamic Republic of Iran', 'IR Iran'],
  'Kyrgyzstan': ['Kyrgyz Republic'],
  Australia: ['Australia', 'Socceroos'],
  'Palestine': ['Palestinian Territory'],
}

// flat: lowercased variant → canonical
const NORM_MAP = new Map<string, string>()

for (const [canonical, variants] of Object.entries(TEAM_VARIANTS)) {
  NORM_MAP.set(canonical.toLowerCase(), canonical)
  for (const v of variants) {
    NORM_MAP.set(v.toLowerCase(), canonical)
  }
}

export function normalizeTeamName(name: string): string {
  if (!name) return name
  const cleaned = name.trim()
  return NORM_MAP.get(cleaned.toLowerCase()) ?? cleaned
}

export function teamsMatch(a: string, b: string): boolean {
  return normalizeTeamName(a).toLowerCase() === normalizeTeamName(b).toLowerCase()
}
