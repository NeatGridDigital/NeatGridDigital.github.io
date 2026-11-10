// Country presets (Etsy fee rates as researched Oct 9, 2026)
// [country, symbol, currency code, listing, proc dom, proc intl, proc fixed, regulatory, vat, vatRule, offsite cap]
const P = [
 ['United States','$','USD',0.20,0.03,0.03,0.25,0,0,'none',100],
 ['United Kingdom','£','GBP',0.15,0.04,0.04,0.20,0.0048,0.20,'unless',75.64],
 ['Canada','C$','CAD',0.28,0.03,0.04,0.25,0.005,0.05,'unless',142.26],
 ['Australia','A$','AUD',0.29,0.03,0.04,0.25,0,0.10,'unless',143.24],
 ['New Zealand','NZ$','NZD',0.36,0.03,0.04,0.30,0,0.15,'unless',178.13],
 ['Austria','€','EUR',0.18,0.04,0.04,0.30,0,0.20,'unless',89.24],
 ['Belgium','€','EUR',0.18,0.04,0.04,0.30,0,0.21,'unless',89.24],
 ['Bulgaria','€','EUR',0.18,0.04,0.04,0.30,0,0.20,'unless',89.24],
 ['Croatia','€','EUR',0.18,0.04,0.04,0.30,0,0.25,'unless',89.24],
 ['Cyprus','€','EUR',0.18,0.04,0.04,0.30,0,0.19,'unless',89.24],
 ['Czech Republic','€','EUR',0.18,0.04,0.04,0.30,0,0.21,'unless',89.24],
 ['Denmark','kr','DKK',1.33,0.04,0.04,2.50,0,0.25,'unless',667.06],
 ['Estonia','€','EUR',0.18,0.04,0.04,0.30,0,0.24,'unless',89.24],
 ['Finland','€','EUR',0.18,0.04,0.04,0.30,0,0.255,'unless',89.24],
 ['France','€','EUR',0.18,0.04,0.04,0.30,0.0114,0.20,'unless',89.24],
 ['Germany','€','EUR',0.18,0.04,0.04,0.30,0,0.19,'unless',89.24],
 ['Greece','€','EUR',0.18,0.04,0.04,0.30,0,0.24,'unless',89.24],
 ['Hungary','€','EUR',0.18,0.04,0.04,0.30,0.0197,0.27,'unless',89.24],
 ['Ireland','€','EUR',0.18,0.04,0.04,0.30,0,0.23,'always',89.24],
 ['Italy','€','EUR',0.18,0.04,0.04,0.30,0.008,0.22,'unless',89.24],
 ['Latvia','€','EUR',0.18,0.04,0.04,0.30,0,0.21,'unless',89.24],
 ['Lithuania','€','EUR',0.18,0.04,0.04,0.30,0,0.21,'unless',89.24],
 ['Luxembourg','€','EUR',0.18,0.04,0.04,0.30,0,0.17,'unless',89.24],
 ['Malta','€','EUR',0.18,0.04,0.04,0.30,0,0.18,'unless',89.24],
 ['Netherlands','€','EUR',0.18,0.04,0.04,0.30,0,0.21,'unless',89.24],
 ['Poland','€','EUR',0.18,0.04,0.04,0.30,0,0.23,'unless',89.24],
 ['Portugal','€','EUR',0.18,0.04,0.04,0.30,0,0.23,'unless',89.24],
 ['Romania','€','EUR',0.18,0.04,0.04,0.30,0,0.21,'unless',89.24],
 ['Slovakia','€','EUR',0.18,0.04,0.04,0.30,0,0.23,'unless',89.24],
 ['Slovenia','€','EUR',0.18,0.04,0.04,0.30,0,0.22,'unless',89.24],
 ['Spain','€','EUR',0.18,0.04,0.04,0.30,0.0088,0.21,'unless',89.24],
 ['Sweden','kr','SEK',1.99,0.04,0.04,3.00,0,0.25,'unless',996.56]
];
const $ = id => document.getElementById(id);
const num = id => { const v = parseFloat($(id).value); return isFinite(v) && v > 0 ? v : 0; };
const sel = $('country');
P.forEach((p, i) => { const o = document.createElement('option'); o.value = i; o.textContent = p[0]; sel.appendChild(o); });
// Guess the country from the browser language
(() => { const l = (navigator.language || '').toLowerCase();
  const map = {'en-gb':'United Kingdom','en-ca':'Canada','fr-ca':'Canada','en-au':'Australia','en-nz':'New Zealand','de':'Germany','de-at':'Austria','fr':'France','it':'Italy','es':'Spain','nl':'Netherlands','el':'Greece','pt':'Portugal','pl':'Poland','sv':'Sweden','da':'Denmark','fi':'Finland','en-ie':'Ireland'};
  const name = map[l] || map[l.slice(0,2)];
  const i = P.findIndex(p => p[0] === name); if (i >= 0) sel.value = i; })();

function calc(p, price, o) {
  const sub = price * o.qty * (1 - o.disc / 100), base = sub + o.ship;
  const f = {};
  f.listing = p[3] * o.qty;
  f.txn = 0.065 * base;
  f.proc = (o.intl ? p[5] : p[4]) * base + (base > 0 ? p[6] : 0);
  f.reg = p[7] * base;
  f.offsite = o.offsite ? Math.min(0.15 * base, p[10]) : 0;
  const vatOn = p[9] === 'always' || (p[9] === 'unless' && !o.vatno);
  f.vat = vatOn ? p[8] * (f.listing + f.txn + f.proc + f.reg + f.offsite) : 0;
  const fees = Object.values(f).reduce((a, b) => a + b, 0);
  const costs = o.cost * o.qty + o.post;
  const profit = base - fees - costs;
  return { f, fees, base, costs, profit, margin: base > 0 ? profit / base : 0 };
}
function money(p, v) {
  const s = Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sym = p[1]; const pre = sym === 'kr' ? s + ' kr' : sym + s;
  return (v < 0 ? '−' : '') + pre;
}
function run() {
  const p = P[sel.value];
  const o = { qty: Math.max(1, Math.round(num('qty')) || 1), ship: num('ship'), disc: Math.min(100, num('disc')), cost: num('cost'), post: num('post'),
              offsite: $('offsite').checked, vatno: $('vatno').checked, intl: $('intl').checked };
  $('vatwrap').style.display = p[9] === 'unless' ? '' : 'none';
  $('intlwrap').style.display = p[4] !== p[5] ? '' : 'none';
  const price = num('price'), r = calc(p, price, o);
  $('profit').textContent = money(p, r.profit);
  $('profit').className = 'big ' + (r.profit >= 0 ? 'good' : 'bad');
  $('fees').textContent = money(p, r.fees);
  $('margin').textContent = r.base > 0 ? (r.margin * 100).toFixed(1) + '%' : '–';
  $('feepct').textContent = r.base > 0 ? (r.fees / r.base * 100).toFixed(1) + '%' : '–';
  // Price that reaches the target margin (bisection on the item price)
  const t = Math.min(80, num('target')) / 100;
  let lo = 0, hi = 100000, ok = calc(p, hi, o).margin >= t;
  if (ok) { for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; (calc(p, m, o).margin >= t) ? hi = m : lo = m; } }
  $('tprice').textContent = ok ? money(p, Math.ceil(hi * 100) / 100) : '–';
  const rows = [['Listing fee', r.f.listing], ['Transaction fee (6.5%)', r.f.txn], ['Payment processing', r.f.proc]];
  if (p[7]) rows.push(['Regulatory operating fee (' + (p[7] * 100).toFixed(2) + '%)', r.f.reg]);
  if (o.offsite) rows.push(['Offsite Ads (15%)', r.f.offsite]);
  if (r.f.vat) rows.push(['VAT/GST on fees (' + +(p[8] * 100).toFixed(1) + '%)', r.f.vat]);
  const tb = $('break'); tb.innerHTML = '';
  const add = (a, b, cls) => { const tr = tb.insertRow(); if (cls) tr.className = cls; tr.insertCell().textContent = a; tr.insertCell().textContent = b; };
  add('Buyer pays (item + shipping)', money(p, r.base));
  rows.forEach(([a, v]) => add(a, '−' + money(p, v)));
  add('Your costs (items + postage)', '−' + money(p, r.costs));
  add('You keep', money(p, r.profit), 'tot');
}
document.querySelectorAll('input,select').forEach(e => e.addEventListener('input', run));
run();
if (typeof module !== 'undefined') module.exports = { calc, P };
