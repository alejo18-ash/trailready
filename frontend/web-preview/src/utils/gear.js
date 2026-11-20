import { AMAZON_TAG } from './legal';

export const GEAR_TYPES = {
  shoes:     { es: 'Zapatillas', en: 'Shoes' },
  vest:      { es: 'Chaleco / mochila', en: 'Vest / pack' },
  watch:     { es: 'Reloj / GPS', en: 'Watch / GPS' },
  nutrition: { es: 'Nutrición', en: 'Nutrition' },
  poles:     { es: 'Bastones', en: 'Poles' },
  apparel:   { es: 'Ropa', en: 'Apparel' },
  other:     { es: 'Otro', en: 'Other' },
};
export const DEFAULT_SHOE_LIMIT = 700; // km — most running shoes last ~500–800 km

/** Km on a pair of shoes: starting km + every run marked done since it was added. */
export function shoeKm(item, plan, completions) {
  let km = Number(item.startKm) || 0;
  if (!plan?.weeks || !completions) return Math.round(km);
  for (const [key, val] of Object.entries(completions)) {
    if (val?.status !== 'completed') continue;
    if (val.date && item.addedAt && val.date < item.addedAt) continue;
    if (item.retiredAt && val.date && val.date > item.retiredAt) continue;
    if (val.shoeId && val.shoeId !== item.id) continue;
    if (!val.shoeId && !item.default) continue;
    const [wi, di] = key.split('_').map(Number);
    km += Number(plan.weeks[wi]?.workouts?.[di]?.km) || 0;
  }
  return Math.round(km);
}

/** Where "buy / replace" goes: the runner's own link, else a store search (affiliate-tagged if configured). */
export function buyUrl(item) {
  if (item.url) return item.url;
  const q = encodeURIComponent(`${item.brand || ''} ${item.model || ''}`.trim() || 'trail running shoes');
  return `https://www.amazon.com/s?k=${q}${AMAZON_TAG ? `&tag=${AMAZON_TAG}` : ''}`;
}

export const newId = () => Math.random().toString(36).slice(2, 10);
