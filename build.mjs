// Static site generator for CarFree Dolomites.
// Usage: node build.mjs  → writes ./dist
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { site, sources, villages as V, itineraries as I, guides as G, connections } from './src/data.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(ROOT, 'dist');
const content = {};
for (const l of site.langs) content[l] = (await import(`./src/content/${l}.mjs`)).default;

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
const abs = (u) => site.url + u;
const vIds = Object.keys(V), iIds = Object.keys(I), gIds = Object.keys(G);

// ---------- routes ----------
const ROUTES = {};
for (const l of site.langs) {
  const c = content[l], P = c.paths, pre = l === site.defaultLang ? '' : '/' + l;
  const u = (...seg) => pre + '/' + seg.map((s) => s + '/').join('');
  const r = { home: u(), villages: u(P.villages), itineraries: u(P.itineraries), guides: u(P.guides), map: u(P.map), roadbook: u(P.roadbook), about: u(P.about), privacy: u(P.privacy), thanks: u(P.thanks) };
  for (const id of vIds) r['village:' + id] = u(P.villages, c.villages.items[id].slug);
  for (const id of iIds) r['itinerary:' + id] = u(P.itineraries, c.itineraries.items[id].slug);
  for (const id of gIds) r['guide:' + id] = u(P.guides, c.guides.items[id].slug);
  ROUTES[l] = r;
}

// ---------- assets ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'assets/fonts'), { recursive: true });
fs.cpSync(path.join(ROOT, 'src/assets/img'), path.join(DIST, 'assets/img'), { recursive: true });
const FONTS = [
  ['@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'inter-latin.woff2'],
  ['@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2', 'inter-latin-ext.woff2'],
  ['@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2', 'playfair-700.woff2'],
];
for (const [src, out] of FONTS) fs.copyFileSync(path.join(ROOT, 'node_modules', src), path.join(DIST, 'assets/fonts', out));

const hashed = (buf, name, ext) => {
  const h = createHash('sha256').update(buf).digest('hex').slice(0, 10);
  const file = `/assets/${name}.${h}.${ext}`;
  fs.writeFileSync(path.join(DIST, file), buf);
  return file;
};
execFileSync(path.join(ROOT, 'node_modules/.bin/tailwindcss'), ['-i', 'src/styles.css', '-o', 'dist/assets/_site.css', '--minify'], { cwd: ROOT, stdio: 'pipe' });
const CSS = hashed(fs.readFileSync(path.join(DIST, 'assets/_site.css')), 'site', 'css');
fs.rmSync(path.join(DIST, 'assets/_site.css'));
const JS = hashed(fs.readFileSync(path.join(ROOT, 'src/assets/js/main.js')), 'main', 'js');
fs.copyFileSync(path.join(ROOT, 'src/assets/favicon.svg'), path.join(DIST, 'favicon.svg'));

// ---------- small visual pieces ----------
const LOGO = `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17l5.5-8.5L13 15l3.5-4.5L21 17H3z"/><path d="M2 20h20"/><path d="M6 20v1.5M10 20v1.5M14 20v1.5M18 20v1.5"/></svg>`;
const ARROW = `<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;

function rng(seed) { let a = [...seed].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7); return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// Decorative Dolomite skyline, unique per village (not a photo, so it is aria-hidden).
function peaks(id) {
  const [c1, c2, c3, sky] = V[id].hue, r = rng(id), W = 800, H = 300;
  const ridge = (base, amp, step) => { let d = `M0 ${H} L0 ${base}`; for (let x = 0; x <= W; x += step) { const y = base - r() * amp; d += ` L${x + step * 0.35} ${y.toFixed(0)} L${x + step * 0.5} ${(y + r() * amp * 0.35).toFixed(0)} L${x + step * 0.7} ${(y - r() * amp * 0.25).toFixed(0)}`; } return d + ` L${W} ${H} Z`; };
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" class="w-full h-full" aria-hidden="true"><rect width="${W}" height="${H}" fill="${sky}"/><circle cx="${620 - r() * 400}" cy="70" r="34" fill="#fff" opacity=".55"/><path d="${ridge(150, 95, 90)}" fill="${c3}"/><path d="${ridge(205, 70, 120)}" fill="${c2}"/><path d="${ridge(262, 40, 70)}" fill="${c1}"/></svg>`;
}

// ---------- layout ----------
function layout(l, page) {
  const c = content[l], t = c.ui, R = ROUTES[l];
  const url = R[page.key] ?? page.url;
  const fullTitle = page.title.length + site.name.length + 3 <= 60 ? `${page.title} | ${site.name}` : page.title;
  const date = new Intl.DateTimeFormat(l, { month: 'long', year: 'numeric' }).format(new Date(site.lastReviewed));
  const alternates = page.noindex ? '' : site.langs.map((x) => `<link rel="alternate" hreflang="${x}" href="${abs(ROUTES[x][page.key])}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${abs(ROUTES[site.defaultLang][page.key])}">`;
  const crumbs = page.crumbs ? [[t.home, 'home'], ...page.crumbs] : null;
  const ld = [...(page.jsonld || [])];
  if (crumbs) ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map(([name, key], i) => ({ '@type': 'ListItem', position: i + 1, name, ...(key ? { item: abs(R[key]) } : {}) })) });
  const nav = [['villages', t.nav_villages], ['itineraries', t.nav_itineraries], ['guides', t.nav_guides], ['map', t.nav_map]];
  const section = page.key.split(':')[0].replace(/^village$/, 'villages').replace(/^itinerary$/, 'itineraries').replace(/^guide$/, 'guides');
  const navLinks = (cls) => nav.map(([k, label]) => `<a href="${R[k]}" class="${cls}${section === k ? ' text-alpine-terracotta' : ''}"${section === k ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('');
  const langSwitch = site.langs.map((x) => x === l
    ? `<span class="px-2 py-1 rounded-md bg-white text-alpine-pine shadow-sm" aria-current="true">${x.toUpperCase()}</span>`
    : `<a href="${page.noindex && !ROUTES[x][page.key] ? ROUTES[x].home : ROUTES[x][page.key]}" hreflang="${x}" lang="${x}" title="${esc(content[x].langName)}" class="px-2 py-1 rounded-md text-stone-600 hover:text-alpine-pine">${x.toUpperCase()}</a>`).join('');
  const og = abs('/assets/img/lago-di-braies-1200.jpg');
  return `<!doctype html>
<html lang="${l}" class="scroll-smooth">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(page.description)}">
${page.noindex || site.noindex ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${abs(url)}">`}
${alternates}
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${abs(url)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="800">
<meta property="og:locale" content="${c.ogLocale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1B4332">
${site.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(site.googleSiteVerification)}">` : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/playfair-700.woff2" as="font" type="font/woff2" crossorigin>
${page.preload || ''}
<link rel="stylesheet" href="${CSS}">
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body class="antialiased bg-alpine-stone text-alpine-slate selection:bg-alpine-terracotta selection:text-white">
<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2">${esc(t.skip)}</a>
<div class="bg-alpine-pineDark text-stone-200 text-xs py-2 px-4 text-center tracking-wide">${esc(fill(t.banner, { date }))}</div>
<header class="sticky top-0 z-40 bg-alpine-stone/95 backdrop-blur border-b border-stone-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 py-3">
    <a href="${R.home}" class="flex items-center gap-2.5 group">
      <span class="w-10 h-10 rounded-xl bg-alpine-pine flex items-center justify-center text-white shadow-sm group-hover:bg-alpine-pineLight transition-colors">${LOGO}</span>
      <span><span class="font-serif font-bold text-lg sm:text-xl tracking-tight text-alpine-pine block leading-none">${site.name}</span><span class="hidden sm:block text-[11px] uppercase tracking-widest text-stone-600 font-medium">${esc(t.tagline)}</span></span>
    </a>
    <nav class="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-700" aria-label="Main">${navLinks('hover:text-alpine-terracotta transition-colors')}</nav>
    <div class="flex items-center gap-2.5">
      <div class="inline-flex rounded-lg bg-stone-200 p-0.5 text-xs font-semibold" role="group" aria-label="${esc(t.language)}">${langSwitch}</div>
      <a href="${R.map}" class="hidden sm:inline-flex items-center gap-1.5 bg-alpine-pine hover:bg-alpine-pineLight text-white text-sm font-medium px-3.5 py-2.5 rounded-xl shadow-sm transition-colors">${esc(t.cta_map)}</a>
      <button type="button" id="menu-btn" class="lg:hidden w-10 h-10 rounded-xl border border-stone-300 flex items-center justify-center text-alpine-pine" aria-expanded="false" aria-controls="mobile-nav" aria-label="${esc(t.menu)}"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
  <nav id="mobile-nav" class="hidden lg:hidden border-t border-stone-200 px-4 py-3 flex-col gap-1 text-sm font-medium text-stone-700" aria-label="Mobile">${navLinks('block py-2')}<a href="${R.roadbook}" class="block py-2">${esc(t.nav_roadbook)}</a></nav>
</header>
<main id="main">
${crumbs ? `<nav aria-label="Breadcrumb" class="max-w-4xl mx-auto px-4 sm:px-6 pt-6 text-xs text-stone-600"><ol class="flex flex-wrap gap-1.5">${crumbs.map(([name, key], i) => `<li class="flex gap-1.5">${i ? '<span aria-hidden="true">›</span>' : ''}${key ? `<a href="${R[key]}" class="hover:text-alpine-terracotta underline-offset-2 hover:underline">${esc(name)}</a>` : `<span aria-current="page" class="text-stone-800">${esc(name)}</span>`}</li>`).join('')}</ol></nav>` : ''}
${page.body}
</main>
<footer class="bg-alpine-pineDark text-stone-300 py-12 mt-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 pb-8 border-b border-white/10">
      <div class="md:col-span-2">
        <p class="font-serif font-bold text-lg text-white mb-3">${site.name}</p>
        <p class="text-sm text-stone-300 max-w-md leading-relaxed">${esc(t.footer_about)}</p>
        <p class="text-xs text-stone-400 mt-3 max-w-md">${esc(t.footer_disclosure)}</p>
      </div>
      <div><p class="text-xs font-bold uppercase tracking-wider text-white mb-3">${esc(t.footer_hubs)}</p><ul class="space-y-2 text-sm">${vIds.map((id) => `<li><a href="${R['village:' + id]}" class="hover:text-white">${esc(c.villages.items[id].name)}</a></li>`).join('')}</ul></div>
      <div><p class="text-xs font-bold uppercase tracking-wider text-white mb-3">${esc(t.footer_resources)}</p><ul class="space-y-2 text-sm"><li><a href="${R.map}" class="hover:text-white">${esc(t.nav_map)}</a></li>${gIds.map((id) => `<li><a href="${R['guide:' + id]}" class="hover:text-white">${esc(c.guides.items[id].h1)}</a></li>`).join('')}<li><a href="${R.roadbook}" class="hover:text-white">${esc(t.nav_roadbook)}</a></li></ul></div>
      <div><p class="text-xs font-bold uppercase tracking-wider text-white mb-3">${esc(t.footer_site)}</p><ul class="space-y-2 text-sm"><li><a href="${R.itineraries}" class="hover:text-white">${esc(t.nav_itineraries)}</a></li><li><a href="${R.about}" class="hover:text-white">${esc(t.about)}</a></li><li><a href="${R.privacy}" class="hover:text-white">${esc(t.privacy)}</a></li></ul></div>
    </div>
    <p class="pt-6 text-xs text-stone-400">© ${new Date(site.lastReviewed).getFullYear()} ${site.name}. ${esc(t.footer_rights)}</p>
  </div>
</footer>
<script src="${JS}" defer></script>
</body>
</html>`;
}

// ---------- components ----------
const eyebrow = (s) => `<p class="text-xs font-bold uppercase tracking-widest text-alpine-terracotta mb-2">${esc(s)}</p>`;
const btn = (href, label, cls = 'bg-alpine-pine hover:bg-alpine-pineLight text-white') => `<a href="${href}" class="inline-flex items-center justify-center gap-2 ${cls} text-sm font-semibold px-5 py-3 rounded-xl transition-colors">${esc(label)} ${ARROW}</a>`;

function villageCard(l, id, h = 'h3') {
  const c = content[l], t = c.ui, v = c.villages.items[id], R = ROUTES[l];
  return `<article data-region="${V[id].region}" class="bg-white rounded-3xl overflow-hidden border border-stone-200 card-lift flex flex-col">
  <div class="relative h-48 overflow-hidden">${peaks(id)}<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent"></div>
    <div class="absolute top-3.5 left-3.5 flex flex-wrap gap-2"><span class="px-3 py-1 rounded-full bg-white text-alpine-pine text-xs font-bold">${esc(c.regions[V[id].region])}</span><span class="px-3 py-1 rounded-full bg-alpine-pine text-emerald-100 text-xs font-semibold">${esc(v.pass)}</span></div>
    <div class="absolute bottom-3.5 left-4 right-4 text-white"><p class="text-xs uppercase tracking-wider text-amber-200 font-semibold">${esc(v.valley)}</p><${h} class="font-serif text-2xl font-bold leading-tight"><a href="${R['village:' + id]}" class="after:absolute after:inset-0">${esc(v.name)}</a></${h}></div>
  </div>
  <div class="p-6 space-y-3 text-sm text-stone-700 flex-1">
    <p><strong class="text-alpine-slate">${esc(t.rail_link)}:</strong> ${esc(v.rail)}</p>
    <p><strong class="text-alpine-slate">${esc(t.lifts)}:</strong> ${esc(v.liftsText)}</p>
  </div>
  <p class="px-6 pb-6 text-sm font-semibold text-alpine-pine flex items-center gap-2">${esc(t.view_village)} ${ARROW}</p>
</article>`.replace('<article', '<article style="position:relative"');
}

function itineraryCard(l, id, h = 'h3') {
  const c = content[l], t = c.ui, it = c.itineraries.items[id], R = ROUTES[l];
  return `<article class="relative bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 card-lift flex flex-col">
  <div class="flex items-center justify-between gap-3 mb-3"><span class="px-3 py-1 rounded-full bg-alpine-pine text-white text-xs font-bold">${I[id].days} ${esc(t.days)}</span><span class="text-xs font-semibold text-stone-600">${esc(it.tag)}</span></div>
  <${h} class="font-serif text-xl font-bold text-alpine-pine mb-2"><a href="${R['itinerary:' + id]}" class="after:absolute after:inset-0">${esc(it.h1)}</a></${h}>
  <p class="text-sm text-stone-700 mb-4">${esc(it.subtitle)}</p>
  <ol class="text-sm text-stone-700 space-y-1.5 mb-5 flex-1">${it.days.map((d) => `<li class="flex gap-2"><span class="font-semibold text-alpine-terracotta whitespace-nowrap">${esc(d.day)}</span><span>${esc(d.title)}</span></li>`).join('')}</ol>
  <p class="text-sm font-semibold text-alpine-pine flex items-center gap-2">${esc(t.view_itinerary)} ${ARROW}</p>
</article>`;
}

const TONES = { amber: 'bg-amber-100 text-amber-900', rose: 'bg-rose-100 text-rose-900', emerald: 'bg-emerald-100 text-emerald-900' };
function guideCard(l, id, h = 'h3') {
  const c = content[l], t = c.ui, g = c.guides.items[id], R = ROUTES[l];
  return `<article class="relative bg-white rounded-2xl p-6 border border-stone-200 card-lift flex flex-col">
  <div class="flex items-center justify-between gap-2 mb-4"><span class="px-3 py-1 rounded-full ${TONES[G[id].tone]} text-xs font-bold">${esc(g.badge)}</span><span class="text-xs font-mono text-stone-600">${esc(g.line)}</span></div>
  <${h} class="font-serif text-xl font-bold text-alpine-pine mb-2"><a href="${R['guide:' + id]}" class="after:absolute after:inset-0">${esc(g.h1)}</a></${h}>
  <p class="text-sm text-stone-700 leading-relaxed mb-4">${esc(g.card)}</p>
  <ul class="text-sm text-stone-700 space-y-2 mb-5 bg-alpine-stone p-3.5 rounded-xl flex-1">${g.bullets.map((b) => `<li class="flex gap-2"><span class="text-emerald-700 font-bold" aria-hidden="true">✓</span>${esc(b)}</li>`).join('')}</ul>
  <p class="text-sm font-semibold text-alpine-pine flex items-center gap-2">${esc(t.read_more)} ${ARROW}</p>
</article>`;
}

const faqBlock = (l, faq) => `<section class="mt-12"><h2 class="font-serif text-2xl font-bold text-alpine-pine mb-4">${esc(content[l].ui.faq)}</h2><div class="space-y-3">${faq.map((f) => `<details class="bg-white rounded-2xl border border-stone-200 p-5 group"><summary class="font-semibold text-alpine-slate cursor-pointer list-none flex justify-between gap-4">${esc(f.q)}<span class="text-alpine-terracotta group-open:rotate-45 transition-transform" aria-hidden="true">+</span></summary><p class="text-stone-700 mt-3 leading-relaxed">${md(f.a)}</p></details>`).join('')}</div></section>`;
const faqLd = (faq) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/\*\*/g, '') } })) });
const sourcesBlock = (l, ids) => { const t = content[l].ui; return `<section class="mt-12 bg-white rounded-2xl border border-stone-200 p-6"><h2 class="font-serif text-xl font-bold text-alpine-pine mb-2">${esc(t.official_sources)}</h2><p class="text-sm text-stone-700 mb-3">${esc(t.sources_note)}</p><ul class="text-sm space-y-1.5">${ids.map((id) => `<li><a href="${sources[id].url}" rel="noopener" class="text-alpine-pine underline underline-offset-2 hover:text-alpine-terracotta">${esc(sources[id].label)}</a></li>`).join('')}</ul><p class="text-xs text-stone-600 mt-4">${esc(t.last_reviewed)}: <time datetime="${site.lastReviewed}">${new Intl.DateTimeFormat(l, { dateStyle: 'long' }).format(new Date(site.lastReviewed))}</time></p></section>`; };
const related = (title, cards) => cards.length ? `<section class="mt-12"><h2 class="font-serif text-2xl font-bold text-alpine-pine mb-5">${esc(title)}</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6">${cards.join('')}</div></section>` : '';
const articleShell = (h1, lead, inner, top = '') => `<article class="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-4">${top}<h1 class="font-serif text-3xl sm:text-5xl font-bold text-alpine-pine tracking-tight leading-tight">${esc(h1)}</h1>${lead ? `<p class="text-lg text-stone-700 mt-4 leading-relaxed">${md(lead)}</p>` : ''}${inner}</article>`;
const form = (l, name, button, extra = '') => { const t = content[l].ui; return `<form name="${name}" method="POST" action="${ROUTES[l].thanks}" data-netlify="true" netlify-honeypot="bot-field" class="space-y-3 max-w-md"><input type="hidden" name="form-name" value="${name}"><input type="hidden" name="language" value="${l}"><p class="hidden"><label>Leave empty <input name="bot-field"></label></p><div><label for="${name}-email" class="block text-sm font-semibold mb-1">${esc(t.email_label)}</label><input id="${name}-email" name="email" type="email" required autocomplete="email" placeholder="${esc(t.email_placeholder)}" class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alpine-pine"></div>${extra}<button type="submit" class="bg-alpine-terracotta hover:bg-alpine-terracottaHover text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors">${esc(button)}</button><p class="text-xs text-stone-600">${esc(t.no_spam)} <a href="${ROUTES[l].privacy}" class="underline">${esc(t.privacy)}</a></p></form>`; };
const org = () => ({ '@type': 'Organization', '@id': site.url + '/#org', name: site.name, url: site.url, logo: abs('/favicon.svg') });

// ---------- pages ----------
function homePage(l) {
  const c = content[l], t = c.ui, h = c.home, p = h.planner, R = ROUTES[l];
  const sel = (id, label, opts) => `<div><label for="${id}" class="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">${esc(label)}</label><select id="${id}" class="w-full rounded-xl border border-stone-300 bg-alpine-stone px-3.5 py-3 text-sm font-medium text-alpine-slate focus:outline-none focus:ring-2 focus:ring-alpine-pine">${Object.entries(opts).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select></div>`;
  const plannerData = { bolzano5: { ...p.results.bolzano5, a: R['itinerary:bolzano5'], b: R['village:ortisei'] }, venice4: { ...p.results.venice4, a: R['itinerary:venice4'], b: R['village:cortina'] }, loop7: { ...p.results.loop7, a: R['itinerary:loop7'], b: R['village:sancandido'] }, moena: { ...p.results.moena, a: R.itineraries, b: R['village:moena'] } };
  const img = '/assets/img/lago-di-braies-';
  const body = `<section class="relative overflow-hidden bg-alpine-pine text-white">
  <img src="${img}960.webp" srcset="${img}640.webp 640w, ${img}960.webp 960w, ${img}1600.webp 1600w" sizes="100vw" width="1600" height="1067" alt="" fetchpriority="high" decoding="async" class="absolute inset-0 w-full h-full object-cover opacity-40">
  <div class="absolute inset-0 bg-gradient-to-b from-alpine-pineDark/80 via-alpine-pine/80 to-alpine-pine"></div>
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-16 md:pb-24">
    <div class="max-w-3xl mx-auto text-center">
      <p class="inline-flex flex-wrap justify-center items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-amber-200 text-xs font-medium mb-6">${h.eyebrow.map(esc).join('<span aria-hidden="true">•</span>')}</p>
      <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12] mb-5">${esc(h.h1)}</h1>
      <p class="text-base sm:text-lg text-stone-100 leading-relaxed max-w-2xl mx-auto mb-10">${esc(h.subtitle)}</p>
    </div>
    <div class="max-w-4xl mx-auto bg-white text-alpine-slate rounded-2xl shadow-2xl p-4 sm:p-6">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-stone-100"><h2 class="text-sm font-bold uppercase tracking-wider text-alpine-pine">${esc(p.heading)}</h2><span class="text-xs text-stone-600 hidden sm:inline">${esc(p.sub)}</span></div>
      <form id="planner" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">${sel('hub', p.hub, p.hubs)}${sel('duration', p.duration, p.durations)}${sel('style', p.style, p.styles)}
        <div class="sm:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-3"><p class="text-xs text-stone-600">${md(p.tip)}</p><button type="submit" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-alpine-terracotta hover:bg-alpine-terracottaHover text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-md transition-colors">${esc(p.button)} ${ARROW}</button></div>
      </form>
      <div id="planner-result" hidden aria-live="polite" class="bg-emerald-950 rounded-2xl p-4 sm:p-5 text-white"><p class="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-1">${esc(p.result_label)}</p><p id="planner-title" class="font-serif text-lg sm:text-xl font-bold"></p><p id="planner-desc" class="text-sm text-stone-200 mt-1"></p><p class="flex flex-wrap gap-2 mt-3"><a id="planner-a" href="${R.itineraries}" class="px-4 py-2 rounded-xl bg-alpine-terracotta hover:bg-alpine-terracottaHover text-white text-xs font-semibold">${esc(t.view_itinerary)}</a><a id="planner-b" href="${R.villages}" class="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold">${esc(t.view_village)}</a></p></div>
      <script type="application/json" id="planner-data">${JSON.stringify(plannerData).replace(/</g, '\\u003c')}</script>
    </div>
  </div>
</section>
<section class="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">${eyebrow(h.villages_eyebrow)}<h2 class="font-serif text-3xl sm:text-4xl font-bold text-alpine-pine">${esc(h.villages_h2)}</h2><p class="text-stone-700 mt-2 max-w-2xl mb-10">${esc(h.villages_intro)}</p>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-7">${vIds.map((id) => villageCard(l, id)).join('')}</div><p class="mt-8">${btn(R.villages, t.all_villages)}</p></section>
<section class="py-16 sm:py-20 bg-alpine-stoneDark/60 border-y border-stone-200"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">${eyebrow(h.itineraries_eyebrow)}<h2 class="font-serif text-3xl sm:text-4xl font-bold text-alpine-pine">${esc(h.itineraries_h2)}</h2><p class="text-stone-700 mt-2 max-w-2xl mb-10">${esc(h.itineraries_intro)}</p>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">${iIds.map((id) => itineraryCard(l, id)).join('')}</div></div></section>
<section class="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">${eyebrow(h.guides_eyebrow)}<h2 class="font-serif text-3xl sm:text-4xl font-bold text-alpine-pine">${esc(h.guides_h2)}</h2><p class="text-stone-700 mt-2 max-w-2xl mb-10">${esc(h.guides_intro)}</p>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${gIds.map((id) => guideCard(l, id)).join('')}</div></section>
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h2 class="font-serif text-3xl sm:text-4xl font-bold text-alpine-pine mb-8">${esc(h.why_h2)}</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-6">${h.why.map((w) => `<div class="border-l-4 border-alpine-terracotta pl-5"><h3 class="font-bold text-lg text-alpine-slate mb-1.5">${esc(w.h)}</h3><p class="text-stone-700 leading-relaxed">${esc(w.p)}</p></div>`).join('')}</div></section>
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16"><div class="bg-alpine-pine rounded-3xl p-8 sm:p-12 text-white"><h2 class="font-serif text-2xl sm:text-4xl font-bold mb-3">${esc(h.map_h2)}</h2><p class="text-stone-100 max-w-2xl mb-6">${esc(h.map_p)}</p>${btn(R.map, h.map_cta, 'bg-alpine-terracotta hover:bg-alpine-terracottaHover text-white')}</div></section>`;
  return { key: 'home', title: h.title, description: h.description, body,
    preload: `<link rel="preload" as="image" href="${img}960.webp" imagesrcset="${img}640.webp 640w, ${img}960.webp 960w, ${img}1600.webp 1600w" imagesizes="100vw">`,
    jsonld: [{ '@context': 'https://schema.org', '@graph': [org(), { '@type': 'WebSite', '@id': site.url + '/#website', url: abs(R.home), name: site.name, description: h.description, inLanguage: l, publisher: { '@id': site.url + '/#org' } }] }] };
}

function listPage(l, key, idx, cards, extra = '') {
  return { key, title: idx.title, description: idx.description, crumbs: [[idx.h1, null]],
    body: `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6"><h1 class="font-serif text-3xl sm:text-5xl font-bold text-alpine-pine tracking-tight leading-tight max-w-4xl">${esc(idx.h1)}</h1><p class="text-lg text-stone-700 mt-4 leading-relaxed max-w-3xl">${esc(idx.intro)}</p>${extra}<div class="grid grid-cols-1 ${cards.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-7 mt-10" id="cards">${cards.join('')}</div></div>`,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: idx.h1, description: idx.description, inLanguage: l, isPartOf: { '@id': site.url + '/#website' } }] };
}

function villagesIndex(l) {
  const c = content[l], t = c.ui;
  const regions = [...new Set(vIds.map((id) => V[id].region))];
  const pill = (f, label, on) => `<button type="button" data-filter="${f}" aria-pressed="${on}" class="filter-pill px-3.5 py-2 rounded-xl text-xs font-semibold border border-stone-300 bg-white text-stone-700 aria-pressed:bg-alpine-pine aria-pressed:text-white aria-pressed:border-alpine-pine">${esc(label)}</button>`;
  return listPage(l, 'villages', c.villages.index, vIds.map((id) => villageCard(l, id, 'h2')), `<div class="flex flex-wrap gap-2 mt-8" id="filters">${pill('all', t.region_all, true)}${regions.map((r) => pill(r, c.regions[r], false)).join('')}</div>`);
}

function villagePage(l, id) {
  const c = content[l], t = c.ui, v = c.villages.items[id], d = V[id], R = ROUTES[l];
  const h2 = (s) => `<h2 class="font-serif text-2xl font-bold text-alpine-pine mt-12 mb-4">${esc(s)}</h2>`;
  const hotel = v.hotel ? `<div class="bg-white rounded-2xl border border-stone-200 p-5 mt-5"><p class="text-[11px] font-bold uppercase tracking-wider text-alpine-terracotta mb-1">${esc(t.hotel_pick)}</p><h3 class="font-bold text-lg text-alpine-slate">${esc(v.hotel.name)}</h3><p class="text-stone-700 mt-1 mb-4">${esc(v.hotel.note)}</p><a href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(v.hotel.query)}${site.bookingAid ? '&aid=' + encodeURIComponent(site.bookingAid) : ''}" target="_blank" rel="${site.bookingAid ? 'sponsored ' : ''}nofollow noopener" class="inline-flex items-center gap-2 bg-alpine-pine hover:bg-alpine-pineLight text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors">${esc(t.hotel_cta)} ↗</a><p class="text-xs text-stone-600 mt-3">${esc(t.hotel_note)}</p></div>` : '';
  const inner = `<div class="rounded-3xl overflow-hidden h-48 sm:h-64 mt-8">${peaks(id)}</div>
<section aria-label="${esc(t.key_facts)}" class="grid sm:grid-cols-3 gap-4 mt-8">${[[t.rail_link, v.rail], [t.lifts, v.liftsText], [t.guest_pass, v.pass]].map(([k, val]) => `<div class="bg-white rounded-2xl border border-stone-200 p-4"><p class="text-[11px] font-bold uppercase tracking-wider text-alpine-terracotta mb-1">${esc(k)}</p><p class="text-sm text-stone-800">${esc(val)}</p></div>`).join('')}</section>
${h2(t.getting_there)}<ol class="space-y-3 list-decimal pl-5 marker:font-bold marker:text-alpine-terracotta text-stone-700 leading-relaxed">${v.gettingThere.map((s) => `<li>${md(s)}</li>`).join('')}</ol>
${h2(fill(t.day_trips, { name: v.name.split(' / ')[0] }))}<div class="grid sm:grid-cols-2 gap-4">${v.dayTrips.map((x) => `<div class="bg-white rounded-2xl border border-stone-200 p-5"><h3 class="font-bold text-alpine-slate mb-1">${esc(x.h)}</h3><p class="text-sm text-stone-700 leading-relaxed">${esc(x.p)}</p></div>`).join('')}</div>
${h2(t.where_to_stay)}<p class="text-stone-700 leading-relaxed">${esc(v.stay)}</p>${hotel}
${faqBlock(l, v.faq)}
${related(t.related_itineraries, d.itineraries.map((i) => itineraryCard(l, i)))}
${related(t.related_guides, d.guides.map((g) => guideCard(l, g)))}
${sourcesBlock(l, d.sources)}`;
  return { key: 'village:' + id, title: v.title, description: v.description, ogType: 'article', crumbs: [[c.villages.index.h1, 'villages'], [v.name, null]],
    body: articleShell(v.title, v.intro, inner, `<p class="flex flex-wrap gap-2 mb-4"><span class="px-3 py-1 rounded-full bg-white border border-stone-200 text-alpine-pine text-xs font-bold">${esc(c.regions[d.region])}</span><span class="px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-700 text-xs font-semibold">${esc(v.valley)}</span></p>`),
    jsonld: [{ '@context': 'https://schema.org', '@type': 'TouristDestination', name: v.name, description: v.description, url: abs(R['village:' + id]), geo: { '@type': 'GeoCoordinates', latitude: d.geo[0], longitude: d.geo[1] }, containedInPlace: { '@type': 'Place', name: 'Dolomites, Italy' }, touristType: ['Car-free travellers', 'Hikers'] }, faqLd(v.faq)] };
}

function itineraryPage(l, id) {
  const c = content[l], t = c.ui, it = c.itineraries.items[id], d = I[id], R = ROUTES[l];
  const fact = (k, val) => `<div class="bg-white rounded-2xl border border-stone-200 p-4"><p class="text-[11px] font-bold uppercase tracking-wider text-alpine-terracotta mb-1">${esc(k)}</p><p class="text-sm text-stone-800">${esc(val)}</p></div>`;
  const inner = `<section aria-label="${esc(t.at_a_glance)}" class="grid sm:grid-cols-2 gap-4 mt-8">${fact(t.duration, `${d.days} ${t.days}`)}${fact(t.start, it.start)}${fact(t.base, it.base)}${fact(t.budget, it.budget)}</section>
<ol class="mt-10 space-y-6 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-300">${it.days.map((x) => `<li class="relative pl-10"><span class="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-alpine-pine border-4 border-alpine-stone" aria-hidden="true"></span><div class="bg-white rounded-2xl p-5 border border-stone-200"><p class="flex flex-wrap items-center justify-between gap-2 mb-1.5"><span class="text-xs font-bold uppercase tracking-wider text-alpine-terracotta">${esc(x.day)}</span><span class="px-2.5 py-0.5 rounded-full bg-alpine-stone text-alpine-pine text-xs font-semibold border border-stone-200">${esc(x.transit)}</span></p><h2 class="font-bold text-lg text-alpine-slate mb-1.5">${esc(x.title)}</h2><p class="text-stone-700 leading-relaxed">${esc(x.desc)}</p></div></li>`).join('')}</ol>
<section class="mt-12"><h2 class="font-serif text-2xl font-bold text-alpine-pine mb-4">${esc(t.before_you_go)}</h2><ul class="space-y-3 text-stone-700 leading-relaxed">${it.tips.map((s) => `<li class="flex gap-3"><span class="text-emerald-700 font-bold" aria-hidden="true">✓</span><span>${md(s)}</span></li>`).join('')}</ul></section>
${related(t.base, [villageCard(l, d.village)])}
${faqBlock(l, it.faq)}
${related(t.related_guides, d.guides.map((g) => guideCard(l, g)))}
${sourcesBlock(l, d.sources)}`;
  return { key: 'itinerary:' + id, title: it.title, description: it.description, ogType: 'article', crumbs: [[c.itineraries.index.h1, 'itineraries'], [it.short, null]],
    body: articleShell(it.h1, it.subtitle, inner),
    jsonld: [{ '@context': 'https://schema.org', '@type': 'TouristTrip', name: it.h1, description: it.description, url: abs(R['itinerary:' + id]), inLanguage: l, touristType: 'Car-free travellers', itinerary: { '@type': 'ItemList', numberOfItems: it.days.length, itemListElement: it.days.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: `${x.day}: ${x.title}`, description: x.desc })) }, provider: { '@id': site.url + '/#org' } }, faqLd(it.faq)] };
}

function guidePage(l, id) {
  const c = content[l], t = c.ui, g = c.guides.items[id], d = G[id], R = ROUTES[l];
  const img = '/assets/img/lago-di-braies-';
  const photo = d.photo ? `<img src="${img}960.webp" srcset="${img}640.webp 640w, ${img}960.webp 960w, ${img}1600.webp 1600w" sizes="(min-width: 896px) 848px, 100vw" width="1600" height="1067" alt="Lago di Braies" fetchpriority="high" class="rounded-3xl mt-8 w-full h-56 sm:h-80 object-cover">` : '';
  const inner = `${photo}<ul class="flex flex-wrap gap-2 mt-6">${[g.badge, g.line, ...g.bullets].map((b) => `<li class="px-3 py-1 rounded-full bg-white border border-stone-200 text-xs font-semibold text-stone-800">${esc(b)}</li>`).join('')}</ul>
${g.sections.map((s) => `<h2 class="font-serif text-2xl font-bold text-alpine-pine mt-10 mb-3">${esc(s.h)}</h2>${s.p.map((p) => `<p class="text-stone-700 leading-relaxed mb-4">${md(p)}</p>`).join('')}`).join('')}
${faqBlock(l, g.faq)}
${related(t.nav_itineraries, iIds.filter((i) => I[i].guides.includes(id)).slice(0, 2).map((i) => itineraryCard(l, i)))}
${sourcesBlock(l, d.sources)}`;
  return { key: 'guide:' + id, title: g.title, description: g.description, ogType: 'article', crumbs: [[c.guides.index.h1, 'guides'], [g.h1, null]],
    body: articleShell(g.h1, g.summary, inner),
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: g.h1, description: g.description, inLanguage: l, mainEntityOfPage: abs(R['guide:' + id]), dateModified: site.lastReviewed, datePublished: site.lastReviewed, image: abs(img + '1200.jpg'), author: { '@id': site.url + '/#org', '@type': 'Organization', name: site.name }, publisher: org() }, faqLd(g.faq)] };
}

function networkSvg(l) {
  const m = content[l].map;
  const N = { innsbruck: [110, 40, 'Innsbruck'], fortezza: [150, 150, 'Fortezza'], bressanone: [150, 205, 'Bressanone'], ponte: [150, 265, 'Ponte Gardena'], bolzano: [130, 345, 'Bolzano / Bozen'], ora: [130, 410, 'Ora / Auer'], trento: [130, 480, 'Trento'], verona: [130, 545, 'Verona'], monguelfo: [460, 150, 'Monguelfo'], dobbiaco: [580, 150, 'Dobbiaco'], sancandido: [690, 150, 'San Candido'], lienz: [820, 150, 'Lienz (AT)'], ortisei: [320, 265, 'Ortisei'], sella: [420, 320, 'Passo Sella'], braies: [500, 250, 'Lago di Braies'], trecime: [720, 270, 'Tre Cime'], cortina: [610, 370, 'Cortina d’Ampezzo'], venezia: [780, 530, 'Venezia'], vigo: [330, 395, 'Vigo di Fassa'], moena: [310, 470, 'Moena'] };
  const p = (...ids) => ids.map((i) => N[i].slice(0, 2).join(',')).join(' ');
  const rail = (ids) => `<polyline points="${p(...ids)}" fill="none" stroke="#1E293B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  const bus = (ids, label, coach, dx = 0, dy = -8) => { const [a, b] = [N[ids[0]], N[ids.at(-1)]], w = Math.max(38, label.length * 8 + 14); return `<polyline points="${p(...ids)}" fill="none" stroke="${coach ? '#7C3AED' : '#B8501A'}" stroke-width="3" stroke-dasharray="${coach ? '2 7' : '9 5'}" stroke-linecap="round"/><g transform="translate(${(a[0] + b[0]) / 2 + dx},${(a[1] + b[1]) / 2 + dy})"><rect x="${-w / 2}" y="-11" width="${w}" height="20" rx="6" fill="#fff" stroke="${coach ? '#7C3AED' : '#B8501A'}"/><text text-anchor="middle" y="4" font-size="12" font-weight="700" fill="${coach ? '#5B21B6' : '#8A3A10'}">${label}</text></g>`; };
  const base = new Set(['ortisei', 'sancandido', 'cortina', 'moena']), sight = new Set(['braies', 'trecime', 'sella']), left = new Set(['innsbruck', 'fortezza', 'bressanone', 'ponte', 'bolzano', 'ora', 'trento', 'verona']), below = new Set(['sella', 'braies', 'trecime', 'cortina', 'venezia', 'vigo', 'moena']);
  const nodes = Object.entries(N).map(([k, [x, y, name]]) => { const b = base.has(k), s = sight.has(k); const lx = left.has(k) ? x - 14 : x, ly = left.has(k) ? y + 5 : below.has(k) ? y + 26 : y - 16; return `<circle cx="${x}" cy="${y}" r="${b ? 10 : 7}" fill="${b ? '#1B4332' : s ? '#F59E0B' : '#fff'}" stroke="${b ? '#fff' : '#1E293B'}" stroke-width="${b ? 3 : 2.5}"/><text x="${lx}" y="${ly}" text-anchor="${left.has(k) ? 'end' : 'middle'}" font-size="${b ? 15 : 13}" font-weight="${b ? 700 : 500}" fill="#1E293B" paint-order="stroke" stroke="#fff" stroke-width="4">${name}</text>`; }).join('');
  const lg = (y, sw, label) => `<g transform="translate(430,${y})">${sw}<text x="46" y="4" font-size="12" fill="#1E293B">${esc(label)}</text></g>`;
  return `<svg viewBox="-20 0 920 580" role="img" aria-labelledby="map-title" class="w-full h-auto bg-white rounded-3xl border border-stone-200" font-family="Inter, sans-serif"><title id="map-title">${esc(m.h1)}</title>
${rail(['innsbruck', 'fortezza', 'bressanone', 'ponte', 'bolzano', 'ora', 'trento', 'verona'])}${rail(['fortezza', 'monguelfo', 'dobbiaco', 'sancandido', 'lienz'])}
${bus(['bolzano', 'ponte', 'ortisei'], '350', false, 10, -40)}${bus(['ortisei', 'sella'], '471')}${bus(['monguelfo', 'braies'], '439', false, -22, 0)}${bus(['dobbiaco', 'braies'], '442', false, 22, 0)}${bus(['dobbiaco', 'trecime'], '444', false, 26, 0)}${bus(['dobbiaco', 'cortina'], '445', false, 0, 50)}${bus(['bolzano', 'vigo'], '180')}${bus(['trento', 'moena', 'vigo'], '101', false, -20, 20)}${bus(['venezia', 'cortina'], esc(m.coach), true, 40, 0)}
${nodes}
${lg(478, '<line x1="0" x2="36" stroke="#1E293B" stroke-width="5"/>', m.legend_rail)}${lg(498, '<line x1="0" x2="36" stroke="#B8501A" stroke-width="3" stroke-dasharray="9 5"/>', m.legend_bus)}${lg(518, '<line x1="0" x2="36" stroke="#7C3AED" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>', m.legend_coach)}${lg(538, '<circle cx="18" r="8" fill="#1B4332" stroke="#fff" stroke-width="2"/>', m.legend_base)}${lg(558, '<circle cx="18" r="6" fill="#F59E0B" stroke="#1E293B" stroke-width="2"/>', m.legend_sight)}
</svg>`;
}

function mapPage(l) {
  const c = content[l], t = c.ui, m = c.map;
  const passCls = { yes: 'bg-emerald-100 text-emerald-900', no: 'bg-rose-100 text-rose-900', partly: 'bg-amber-100 text-amber-900' };
  const rows = connections.map((r) => `<tr class="border-t border-stone-200"><th scope="row" class="py-3 pr-4 text-left font-semibold text-alpine-slate">${esc(r.from)} → ${esc(r.to)}</th><td class="py-3 pr-4 whitespace-nowrap">${r.kind === 'bus' ? 'Bus ' + r.line : esc(m[r.kind])}</td><td class="py-3 pr-4 whitespace-nowrap">≈ ${r.time}</td><td class="py-3"><span class="px-2.5 py-1 rounded-full text-xs font-bold ${passCls[r.pass]}">${esc(t[r.pass])}</span></td></tr>`).join('');
  const inner = `<p class="mt-6 print:hidden"><button type="button" id="print-btn" class="inline-flex items-center gap-2 border border-alpine-pine text-alpine-pine hover:bg-alpine-pine hover:text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">${esc(t.print)}</button></p>
<div class="mt-6 overflow-x-auto"><div class="min-w-[640px]">${networkSvg(l)}</div></div>
<h2 class="font-serif text-2xl font-bold text-alpine-pine mt-12 mb-4">${esc(m.table_h2)}</h2>
<div class="overflow-x-auto bg-white rounded-2xl border border-stone-200 px-5"><table class="w-full text-sm text-stone-700"><thead><tr class="text-left text-[11px] uppercase tracking-wider text-stone-600"><th scope="col" class="py-3 pr-4">${esc(m.th_route)}</th><th scope="col" class="py-3 pr-4">${esc(m.th_line)}</th><th scope="col" class="py-3 pr-4">${esc(m.th_time)}</th><th scope="col" class="py-3">${esc(m.th_pass)}</th></tr></thead><tbody>${rows}</tbody></table></div>
<p class="text-sm text-stone-600 mt-3">${esc(m.table_note)}</p>
<section class="mt-12 bg-white rounded-2xl border border-stone-200 p-6 print:hidden"><h2 class="font-serif text-2xl font-bold text-alpine-pine mb-2">${esc(m.updates_h2)}</h2><p class="text-stone-700 mb-4">${esc(m.updates_p)}</p>${form(l, 'updates', m.updates_button)}</section>
${related(t.nav_guides, gIds.slice(0, 2).map((g) => guideCard(l, g)))}
${sourcesBlock(l, ['suedtirolmobil', 'trentinotrasporti', 'dolomitibus', 'cortinaexpress', 'trenitalia'])}`;
  return { key: 'map', title: m.title, description: m.description, crumbs: [[m.h1, null]], body: articleShell(m.h1, m.intro, inner) };
}

function roadbookPage(l) {
  const c = content[l], r = c.roadbook;
  const li = (s) => `<li class="flex gap-3"><span class="text-emerald-700 font-bold" aria-hidden="true">✓</span><span>${esc(s)}</span></li>`;
  const cta = site.roadbookCheckoutUrl
    ? `<p class="mt-8"><a href="${esc(site.roadbookCheckoutUrl)}" class="inline-flex bg-alpine-terracotta hover:bg-alpine-terracottaHover text-white font-bold px-6 py-3.5 rounded-xl">${esc(r.buy_button)}</a></p>`
    : `<section class="mt-10 bg-white rounded-2xl border border-stone-200 p-6"><h2 class="font-serif text-2xl font-bold text-alpine-pine mb-2">${esc(r.waitlist_h2)}</h2><p class="text-stone-700 mb-1">${esc(r.waitlist_p)}</p><p class="text-sm text-stone-600 mb-4">${esc(r.price_note)}</p>${form(l, 'roadbook-waitlist', r.waitlist_button)}</section>`;
  const inner = `<ul class="mt-8 space-y-3 text-stone-700">${r.features.map(li).join('')}</ul>
<h2 class="font-serif text-2xl font-bold text-alpine-pine mt-10 mb-4">${esc(r.outline_h2)}</h2><ol class="list-decimal pl-5 space-y-2 text-stone-700 marker:font-bold marker:text-alpine-terracotta">${r.outline.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>${cta}
${related(c.ui.related_itineraries, [itineraryCard(l, 'bolzano5'), villageCard(l, 'ortisei')])}`;
  return { key: 'roadbook', title: r.title, description: r.description, crumbs: [[c.ui.nav_roadbook, null]],
    body: articleShell(r.h1, r.lead, inner, site.roadbookCheckoutUrl ? '' : `<p class="mb-4"><span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">${esc(r.status)}</span></p>`) };
}

function textPage(l, key, extra = '') {
  const c = content[l], p = c[key];
  const inner = p.sections.map((s) => `<h2 class="font-serif text-2xl font-bold text-alpine-pine mt-10 mb-3">${esc(s.h)}</h2>${s.p.map((x) => `<p class="text-stone-700 leading-relaxed mb-4">${md(x)}</p>`).join('')}`).join('') + extra;
  return { key, title: p.title, description: p.description, crumbs: [[p.h1, null]], body: articleShell(p.h1, '', inner) };
}
function aboutPage(l) {
  const c = content[l], a = c.about, t = c.ui;
  const page = textPage(l, 'about', `<section class="mt-10 bg-white rounded-2xl border border-stone-200 p-6"><h2 class="font-serif text-2xl font-bold text-alpine-pine mb-4">${esc(a.contact_h2)}</h2>${form(l, 'contact', a.contact_button, `<div><label for="contact-message" class="block text-sm font-semibold mb-1">${esc(t.message_label)}</label><textarea id="contact-message" name="message" rows="4" required class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-alpine-pine"></textarea></div>`)}</section>`);
  page.jsonld = [{ '@context': 'https://schema.org', '@type': 'AboutPage', name: a.h1, inLanguage: l, about: org() }];
  return page;
}
function simplePage(l, key, p, noindex) {
  const R = ROUTES[l], t = content[l].ui;
  return { key, noindex, title: p.title, description: p.description || p.p, body: `<div class="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center"><h1 class="font-serif text-4xl font-bold text-alpine-pine mb-4">${esc(p.h1)}</h1><p class="text-lg text-stone-700 mb-8">${esc(p.p)}</p><p class="flex flex-wrap justify-center gap-3">${btn(R.map, t.nav_map)}${btn(R.itineraries, t.nav_itineraries, 'border border-alpine-pine text-alpine-pine hover:bg-white')}${btn(R.villages, t.nav_villages, 'border border-alpine-pine text-alpine-pine hover:bg-white')}</p></div>` };
}

// ---------- write ----------
const write = (file, html) => { const f = path.join(DIST, file); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
const sitemap = [];
for (const l of site.langs) {
  const c = content[l];
  const pages = [homePage(l), villagesIndex(l), ...vIds.map((id) => villagePage(l, id)),
    listPage(l, 'itineraries', c.itineraries.index, iIds.map((id) => itineraryCard(l, id, 'h2'))), ...iIds.map((id) => itineraryPage(l, id)),
    listPage(l, 'guides', c.guides.index, gIds.map((id) => guideCard(l, id, 'h2'))), ...gIds.map((id) => guidePage(l, id)),
    mapPage(l), roadbookPage(l), aboutPage(l), textPage(l, 'privacy'), simplePage(l, 'thanks', c.thanks, true)];
  for (const p of pages) {
    write(ROUTES[l][p.key] + 'index.html', layout(l, p));
    if (!p.noindex) sitemap.push(p.key);
  }
  const nf = simplePage(l, 'notfound', c.notFound, true);
  nf.url = (l === site.defaultLang ? '' : '/' + l) + '/404.html';
  ROUTES[l].notfound = nf.url;
}
for (const l of site.langs) { const nf = simplePage(l, 'notfound', content[l].notFound, true); write(ROUTES[l].notfound, layout(l, nf)); }

const keys = [...new Set(sitemap)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${keys.flatMap((k) => site.langs.map((l) => `<url><loc>${abs(ROUTES[l][k])}</loc><lastmod>${site.lastReviewed}</lastmod>${site.langs.map((x) => `<xhtml:link rel="alternate" hreflang="${x}" href="${abs(ROUTES[x][k])}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${abs(ROUTES[site.defaultLang][k])}"/></url>`)).join('\n')}
</urlset>
`);
write('robots.txt', site.noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
write('_redirects', site.langs.filter((l) => l !== site.defaultLang).map((l) => `/${l}/*  /${l}/404.html  404`).join('\n') + '\n');
console.log(`Built ${keys.length * site.langs.length} indexable pages → dist (${site.url})`);
