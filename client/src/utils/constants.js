export const CURRENCY = '₱';

export const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Dairy & Eggs',
  'Livestock',
  'Herbs',
  'Other',
];

export const CAT_EMOJI = {
  Vegetables: '🥕',
  Fruits: '🍎',
  Grains: '🌾',
  'Dairy & Eggs': '🥛',
  Livestock: '🐄',
  Herbs: '🌿',
  Other: '🌱',
};

export const UNITS = ['kg', 'piece', 'bundle', 'tray', 'sack', 'liter', 'box'];

export const money = (n) => CURRENCY + Number(n || 0).toLocaleString();

export const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const timeAgo = (ts) => {
  if (!ts) return '';
  const time = typeof ts === 'string' ? new Date(ts).getTime() : ts;
  const s = Math.floor((Date.now() - time) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(time).toLocaleDateString();
};

export const initials = (n) =>
  String(n || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const isPreorder = (harvestDate) => {
  if (!harvestDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(harvestDate) > today;
};
