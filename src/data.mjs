// Language-neutral site configuration and data.
export const site = {
  name: 'CarFree Dolomites',
  // Canonical origin. On Netlify the URL env var is the site's primary URL.
  url: (process.env.SITE_URL || process.env.URL || 'https://carfreedolomites.com').replace(/\/$/, ''),
  lastReviewed: '2026-11-26',
  langs: ['en', 'fr', 'it'],
  defaultLang: 'en',
  // Optional: Booking.com affiliate id. When empty, hotel links are plain search links.
  bookingAid: process.env.BOOKING_AID || '',
  // Optional: checkout URL for the roadbook. When empty, the page shows a waiting list.
  roadbookCheckoutUrl: process.env.ROADBOOK_CHECKOUT_URL || '',
  // Optional: Google Search Console verification token.
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || '',
};

export const sources = {
  suedtirolmobil: { label: 'südtirolmobil', url: 'https://www.suedtirolmobil.info/en/' },
  prags: { label: 'prags.bz (Lago di Braies)', url: 'https://www.prags.bz/en/' },
  dreizinnen: { label: 'Tre Cime / Drei Zinnen Dolomites', url: 'https://www.dreizinnen.com/en/' },
  valgardena: { label: 'Val Gardena', url: 'https://www.valgardena.it/en/' },
  fassa: { label: 'Val di Fassa', url: 'https://www.fassa.com/en/' },
  trentinotrasporti: { label: 'Trentino Trasporti', url: 'https://www.trentinotrasporti.it/en/' },
  dolomitibus: { label: 'Dolomiti Bus', url: 'https://dolomitibus.it/en' },
  cortinaexpress: { label: 'Cortina Express', url: 'https://www.cortinaexpress.it/en/' },
  atvo: { label: 'ATVO', url: 'https://www.atvo.it/en-index.html' },
  trenitalia: { label: 'Trenitalia', url: 'https://www.trenitalia.com/en.html' },
};

export const villages = {
  ortisei: { region: 'south-tyrol', geo: [46.5744, 11.6722], sources: ['suedtirolmobil', 'valgardena'], guides: ['guestpass'], itineraries: ['bolzano5', 'loop7'], hue: ['#1B4332', '#2D6A4F', '#74A98A', '#F4D9B0'] },
  sancandido: { region: 'south-tyrol', geo: [46.7327, 12.2802], sources: ['suedtirolmobil', 'dreizinnen', 'prags'], guides: ['trecime', 'braies', 'guestpass'], itineraries: ['loop7'], hue: ['#22404F', '#3F6B7D', '#8FB3BF', '#F6E3C5'] },
  cortina: { region: 'veneto', geo: [46.5405, 12.1357], sources: ['cortinaexpress', 'atvo', 'dolomitibus', 'suedtirolmobil'], guides: ['trecime'], itineraries: ['venice4'], hue: ['#5A2E1E', '#9A4B2A', '#D99A6C', '#FBE6CF'] },
  moena: { region: 'trentino', geo: [46.3767, 11.6597], sources: ['trentinotrasporti', 'fassa', 'suedtirolmobil'], guides: [], itineraries: [], hue: ['#3B3A1E', '#6B6B2E', '#B5B878', '#F5EBC8'] },
};

export const itineraries = {
  bolzano5: { days: 5, village: 'ortisei', guides: ['guestpass'], sources: ['suedtirolmobil', 'valgardena', 'trenitalia'] },
  venice4: { days: 4, village: 'cortina', guides: ['trecime'], sources: ['cortinaexpress', 'atvo', 'dolomitibus', 'suedtirolmobil'] },
  loop7: { days: 7, village: 'sancandido', guides: ['trecime', 'braies', 'guestpass'], sources: ['suedtirolmobil', 'prags', 'dreizinnen', 'trenitalia'] },
};

export const guides = {
  braies: { tone: 'amber', sources: ['prags', 'suedtirolmobil'], photo: true },
  trecime: { tone: 'rose', sources: ['dreizinnen', 'suedtirolmobil', 'dolomitibus'] },
  guestpass: { tone: 'emerald', sources: ['suedtirolmobil', 'trentinotrasporti'] },
};

// Key connections table on the map page. kind: bus | train | coach. pass: yes | no | partly
export const connections = [
  { from: 'Bolzano / Bozen', to: 'Ortisei', kind: 'bus', line: '350', time: '1 h', pass: 'yes' },
  { from: 'Ponte Gardena', to: 'Ortisei', kind: 'bus', line: '350', time: '25 min', pass: 'yes' },
  { from: 'Ortisei', to: 'Passo Sella', kind: 'bus', line: '471', time: '45 min', pass: 'yes' },
  { from: 'Fortezza', to: 'San Candido', kind: 'train', line: '', time: '1 h 15 min', pass: 'yes' },
  { from: 'Dobbiaco', to: 'Lago di Braies', kind: 'bus', line: '442', time: '25 min', pass: 'partly' },
  { from: 'Monguelfo', to: 'Lago di Braies', kind: 'bus', line: '439', time: '20 min', pass: 'partly' },
  { from: 'Dobbiaco', to: 'Tre Cime (Rif. Auronzo)', kind: 'bus', line: '444', time: '50 min', pass: 'no' },
  { from: 'Dobbiaco', to: 'Cortina d’Ampezzo', kind: 'bus', line: '445', time: '50 min', pass: 'partly' },
  { from: 'Venezia (VCE / Mestre)', to: 'Cortina d’Ampezzo', kind: 'coach', line: '', time: '2 h 15 min', pass: 'no' },
  { from: 'Trento', to: 'Moena', kind: 'bus', line: '101', time: '1 h 45 min', pass: 'yes' },
  { from: 'Bolzano / Bozen', to: 'Vigo di Fassa', kind: 'bus', line: '180', time: '1 h 15 min', pass: 'partly' },
];
