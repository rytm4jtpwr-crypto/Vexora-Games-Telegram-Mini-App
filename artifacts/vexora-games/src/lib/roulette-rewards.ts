export const TON_BALANCE_KEY = 'vexora_balance';
export const STAR_BALANCE_KEY = 'vexora_star_balance';
export const ROULETTE_INVENTORY_KEY = 'vexora_roulette_inventory';

export type RouletteInventoryItem = {
  id: string;
  prizeId: string;
  name: string;
  video: string;
  poster: string;
  wonAt: string;
  source: 'roulette_nft';
};

export function readNumber(key: string, fallback = 0) {
  const stored = Number(localStorage.getItem(key));
  return Number.isFinite(stored) ? stored : fallback;
}

export function readRouletteInventory(): RouletteInventoryItem[] {
  try {
    const stored = JSON.parse(localStorage.getItem(ROULETTE_INVENTORY_KEY) ?? '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function claimRoulettePrize(prize: { id: string; label: string; video?: string }) {
  if (prize.id === 'ton') {
    const tonBalance = readNumber(TON_BALANCE_KEY, 10240) + 1;
    localStorage.setItem(TON_BALANCE_KEY, String(tonBalance));
    return { tonBalance };
  }

  if (prize.id === 'star') {
    const starBalance = readNumber(STAR_BALANCE_KEY) + 100;
    localStorage.setItem(STAR_BALANCE_KEY, String(starBalance));
    return { starBalance };
  }

  if (prize.video) {
    const inventory = readRouletteInventory();
    const item: RouletteInventoryItem = {
      id: crypto.randomUUID(),
      prizeId: prize.id,
      name: prize.label,
      video: prize.video,
      poster: prize.video.replace('.webm', '.png'),
      wonAt: new Date().toISOString(),
      source: 'roulette_nft',
    };
    localStorage.setItem(ROULETTE_INVENTORY_KEY, JSON.stringify([item, ...inventory]));
    return { inventoryItem: item };
  }

  return {};
}