// Platform presets (private sellers, checked Oct 29, 2026 for the Reseller Profit Tracker)
// pct: % of price (and of shipping if onShip); fixed: per order; pay: % of price+shipping; payFixed; payMin; small: [flat, under]
const P = [
  { n: 'Vinted', pct: 0, onShip: false, fixed: 0, pay: 0, payFixed: 0, payMin: 0 },
  { n: 'eBay (private seller, UK)', pct: 0, onShip: false, fixed: 0, pay: 0, payFixed: 0, payMin: 0 },
  { n: 'eBay (US)', pct: 0.136, onShip: true, fixed: 0.40, fixedSmall: [0.30, 10], pay: 0, payFixed: 0, payMin: 0 },
  { n: 'Depop (UK)', pct: 0, onShip: false, fixed: 0, pay: 0.029, payFixed: 0.30, payMin: 0 },
  { n: 'Depop (US)', pct: 0, onShip: false, fixed: 0, pay: 0.033, payFixed: 0.45, payMin: 0 },
  { n: 'Poshmark (US)', pct: 0.20, onShip: false, fixed: 0, pay: 0, payFixed: 0, payMin: 0, small: [2.95, 15] },
  { n: 'Mercari (US)', pct: 0.10, onShip: true, fixed: 0, pay: 0, payFixed: 0, payMin: 0 },
  { n: 'Whatnot (US)', pct: 0.08, onShip: false, fixed: 0, pay: 0.029, payFixed: 0.30, payMin: 0 },
  { n: 'Vestiaire Collective', pct: 0.17, onShip: false, fixed: 0, pay: 0.03, payFixed: 0, payMin: 3, small: [12, 75] },
  { n: 'Facebook Marketplace (local)', pct: 0, onShip: false, fixed: 0, pay: 0, payFixed: 0, payMin: 0 },
];
function fees(p, price, ship) {
  if (price <= 0) return { sell: 0, pay: 0, total: 0 };
  let sell = (p.small && price < p.small[1]) ? p.small[0] : p.pct * (price + (p.onShip ? ship : 0));
  const fx = p.fixedSmall && price + ship <= p.fixedSmall[1] ? p.fixedSmall[0] : p.fixed;
  sell += fx;
  let pay = p.pay ? p.pay * (price + ship) + p.payFixed : 0;
  if (p.payMin) pay = Math.max(pay, p.payMin);
  return { sell, pay, total: sell + pay };
}
const $ = id => document.getElementById(id);
const num = id => { const v = parseFloat($(id).value); return isFinite(v) && v > 0 ? v : 0; };
P.forEach((p, i) => { const o = document.createElement('option'); o.value = i; o.textContent = p.n; $('plat').appendChild(o); });
(() => { const l = (navigator.language || '').toLowerCase();
  if (l === 'en-gb') { $('cur').value = '£'; $('plat').value = 0; }
  else if (l.startsWith('en-us') || l === 'en') { $('cur').value = '$'; $('plat').value = 2; } })();
const m = v => (v < 0 ? '−' : '') + $('cur').value + Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function profitOn(p, o, price) { const f = fees(p, price, o.ship); return { f, profit: price + o.ship - f.total - o.cost - o.post - o.other }; }
function run() {
  const o = { ship: num('ship'), cost: num('cost'), post: num('post'), other: num('other') };
  const price = num('price'), p = P[$('plat').value], r = profitOn(p, o, price);
  $('profit').textContent = m(r.profit); $('profit').className = 'big ' + (r.profit >= 0 ? 'good' : 'bad');
  $('fees').textContent = m(r.f.total);
  const base = price + o.ship;
  $('margin').textContent = base > 0 ? (r.profit / base * 100).toFixed(1) + '%' : '–';
  $('roi').textContent = o.cost > 0 ? (r.profit / o.cost * 100).toFixed(0) + '%' : '–';
  let lo = 0, hi = 100000; if (profitOn(p, o, hi).profit >= 0) { for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; profitOn(p, o, mid).profit >= 0 ? hi = mid : lo = mid; } $('be').textContent = m(Math.ceil(hi * 100) / 100); } else $('be').textContent = '–';
  const t = $('break'); t.innerHTML = '';
  const add = (tb, a, b, c) => { const tr = tb.insertRow(); if (c) tr.className = c; tr.insertCell().textContent = a; tr.insertCell().textContent = b; };
  add(t, 'Buyer paid you (item + shipping)', m(base));
  if (r.f.sell) add(t, 'Selling fee', '−' + m(r.f.sell));
  if (r.f.pay) add(t, 'Payment processing', '−' + m(r.f.pay));
  if (!r.f.total) add(t, 'Platform fees', m(0));
  add(t, 'You paid for the item', '−' + m(o.cost));
  if (o.post) add(t, 'Postage', '−' + m(o.post));
  if (o.other) add(t, 'Other costs', '−' + m(o.other));
  add(t, 'You keep', m(r.profit), 'tot');
  const c = $('cmp'); c.innerHTML = '';
  P.map(q => ({ q, x: profitOn(q, o, price) })).sort((a, b) => b.x.profit - a.x.profit)
   .forEach(({ q, x }) => { const tr = c.insertRow(); if (q === p) tr.className = 'tot';
     tr.insertCell().textContent = q.n + (q === p ? ' (selected)' : '');
     const td = tr.insertCell(); td.textContent = m(x.profit);
     const sm = document.createElement('div'); sm.className = 'hint'; sm.style.fontWeight = '400'; sm.textContent = 'fees ' + m(x.f.total); td.appendChild(sm); });
}
document.querySelectorAll('input,select').forEach(e => e.addEventListener('input', run));
run();
