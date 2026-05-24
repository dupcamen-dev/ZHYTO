const UK_POSTCODE_RE = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/

const LONDON_DISTRICTS: Record<string, string> = {
  BR: 'Bromley',
  CR: 'Croydon',
  DA: 'Dartford',
  E:  'East London',
  EC: 'Central London',
  EN: 'Enfield',
  HA: 'Harrow',
  IG: 'Ilford',
  KT: 'Kingston',
  N:  'North London',
  NW: 'North West London',
  RM: 'Romford',
  SE: 'South East London',
  SM: 'Sutton',
  SW: 'South West London',
  TW: 'Twickenham',
  UB: 'Uxbridge',
  W:  'West London',
  WC: 'Central London',
  WD: 'Watford',
}

const LONDON_OUTER: Record<string, string> = {
  CM: 'Chelmsford',
  ME: 'Medway',
  RH: 'Redhill',
  SL: 'Slough',
  SS: 'Southend',
  TN: 'Tonbridge',
}

export function validatePostcode(raw: string) {
  const clean = raw.trim().toUpperCase()
  if (!UK_POSTCODE_RE.test(clean)) return { valid: false } as const

  const area = clean.replace(/[0-9].*$/, '')
  const district = LONDON_DISTRICTS[area] || LONDON_OUTER[area] || null

  return { valid: true, district, region: 'London', postcode: clean } as const
}
