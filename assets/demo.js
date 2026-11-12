/*
 * Dati e funzioni comuni ai tre mockup di Grosso Service.
 * Prezzi e tempi sono ESEMPI plausibili per il mercato, non il listino di Grosso.
 */
(function () {
  'use strict';

  const ORIGINS = {
    MXP: { label: 'Malpensa Airport', short: 'Malpensa', code: 'MXP' },
    LIN: { label: 'Linate Airport', short: 'Linate', code: 'LIN' },
    BGY: { label: 'Bergamo Airport', short: 'Bergamo', code: 'BGY' },
    MIL: { label: 'Milan city centre', short: 'Milan', code: 'MIL' },
  };

  const DESTINATIONS = {
    COMO: { label: 'Como', region: 'Lake Como' },
    BELLAGIO: { label: 'Bellagio', region: 'Lake Como' },
    VARENNA: { label: 'Varenna', region: 'Lake Como' },
    TREMEZZO: { label: 'Tremezzo', region: 'Lake Como' },
    LUGANO: { label: 'Lugano', region: 'Switzerland' },
    STMORITZ: { label: 'St. Moritz', region: 'Switzerland' },
    PORTOFINO: { label: 'Portofino', region: 'Riviera' },
  };

  // [prezzo Classe E in euro, durata in minuti]
  const TABLE = {
    MXP: { COMO: [190, 50], BELLAGIO: [300, 95], VARENNA: [300, 100], TREMEZZO: [280, 85], LUGANO: [260, 55], STMORITZ: [590, 210], PORTOFINO: [470, 170] },
    LIN: { COMO: [200, 60], BELLAGIO: [280, 85], VARENNA: [270, 80], TREMEZZO: [280, 90], LUGANO: [280, 75], STMORITZ: [560, 200], PORTOFINO: [430, 150] },
    BGY: { COMO: [230, 70], BELLAGIO: [260, 85], VARENNA: [250, 75], TREMEZZO: [280, 95], LUGANO: [310, 95], STMORITZ: [520, 190], PORTOFINO: [520, 180] },
    MIL: { COMO: [170, 50], BELLAGIO: [280, 80], VARENNA: [270, 75], TREMEZZO: [260, 75], LUGANO: [240, 65], STMORITZ: [540, 190], PORTOFINO: [420, 150] },
  };

  const VEHICLES = [
    { id: 'E', name: 'Mercedes E-Class', kind: 'Business sedan', seats: 3, bags: 2, factor: 1 },
    { id: 'V', name: 'Mercedes V-Class', kind: 'Executive van', seats: 7, bags: 6, factor: 1.15 },
    { id: 'S', name: 'Mercedes S-Class', kind: 'First class sedan', seats: 3, bags: 2, factor: 1.45 },
    { id: 'VITO', name: 'Mercedes Vito', kind: 'Group van', seats: 8, bags: 6, factor: 1.1 },
  ];

  function roundPrice(n) { return Math.round(n / 5) * 5; }

  function quote(from, to, passengers) {
    const row = TABLE[from] && TABLE[from][to];
    if (!row) return null;
    const pax = Number(passengers) || 1;
    return {
      from: ORIGINS[from], to: DESTINATIONS[to], minutes: row[1],
      options: VEHICLES.map(v => ({
        ...v, price: roundPrice(row[0] * v.factor), fits: v.seats >= pax,
      })),
    };
  }

  function duration(min) {
    const h = Math.floor(min / 60), m = min % 60;
    return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
  }

  function euro(n) { return '€' + n.toLocaleString('en-GB'); }

  function fillSelect(sel, map, value) {
    sel.innerHTML = Object.entries(map).map(([k, v]) =>
      `<option value="${k}"${k === value ? ' selected' : ''}>${v.label}</option>`).join('');
  }

  // Ora di Milano, aggiornata ogni 10 secondi
  function milanClock(cb) {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Rome' });
    const tick = () => cb(fmt.format(new Date()));
    tick();
    return setInterval(tick, 10000);
  }

  // Divide un titolo in parole per l'animazione, lasciando il testo intero ai lettori di schermo
  function splitWords(el) {
    if (el.dataset.split === 'done') return el.querySelectorAll('.w > span');
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const wrap = document.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    const walk = (node, out) => {
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { out.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = part;
            w.appendChild(i); out.appendChild(w);
          });
        } else if (n.nodeType === 1) {
          const clone = n.cloneNode(false); walk(n, clone); out.appendChild(clone);
        }
      });
    };
    walk(el, wrap);
    const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = label;
    el.replaceChildren(sr, wrap);
    el.dataset.split = 'done';
    return el.querySelectorAll('.w > span');
  }

  // ?static mostra la pagina finita senza animazioni (stampa, controlli, «riduci movimento»)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]static\b/.test(location.search);
  if (reduced) document.documentElement.classList.add('reduced');

  // Etichetta di presentazione: proposta corrente e link alle altre
  function presenterChip(current) {
    const names = { a: 'A · Notturno', b: 'B · Riviera', c: 'C · Partenze' };
    const files = { a: 'a-notturno.html', b: 'b-riviera.html', c: 'c-partenze.html' };
    const chip = document.createElement('nav');
    chip.className = 'gs-chip';
    chip.setAttribute('aria-label', 'Mockup navigation');
    chip.innerHTML = `<a href="index.html">Proposte</a>` + Object.keys(names).map(k =>
      k === current ? `<span aria-current="page">${names[k]}</span>` : `<a href="${files[k]}">${names[k]}</a>`).join('') +
      `<button type="button" aria-label="Nascondi">×</button>`;
    chip.querySelector('button').addEventListener('click', () => chip.remove());
    if (window.self !== window.top || /[?&]nochip\b/.test(location.search)) return; // anteprime e cornici: non serve
    document.body.appendChild(chip);
  }

  window.GS = { ORIGINS, DESTINATIONS, VEHICLES, quote, duration, euro, fillSelect, milanClock, splitWords, reduced, presenterChip };
})();
