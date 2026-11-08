'use strict';
// Piccoli strumenti grafici condivisi da tabellone e telefoni.
(function () {
  const D = window.CDATA;
  const h = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
    return e;
  };

  // --- ritratti disegnati (SVG, viewBox 64) ---
  const SKIN = '#f3cba5';
  const face = (extra) => `<ellipse cx="32" cy="30" rx="11.5" ry="13" fill="${SKIN}"/>` + `<circle cx="27.6" cy="30" r="1.5" fill="#2a1a22"/><circle cx="36.4" cy="30" r="1.5" fill="#2a1a22"/>` + (extra || '');
  const nun = (veil, o) => `
    <path d="M6 64c0-13 11-19 26-19s26 6 26 19z" fill="${veil}"/>
    <path d="M24 46l8 9 8-9z" fill="#fff"/>
    <path d="M32 4c-12 0-19 9-19 22 0 9 3 16 7 21h24c4-5 7-12 7-21C51 13 44 4 32 4z" fill="${veil}"/>
    <path d="M32 14c-9 0-14 7-14 16 0 6 2 11 5 14h18c3-3 5-8 5-14 0-9-5-16-14-16z" fill="#fffdf6"/>
    ${face(o.extra)}
    <path d="M27 37.5q5 4 10 0" stroke="#a0453f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    ${o.cross ? '<path d="M32 50v8M28.5 53.5h7" stroke="#e2b559" stroke-width="2.2" stroke-linecap="round"/>' : ''}`;
  const PORTRAIT = {
    zita: nun('#6b2c80', { cross: 1, extra: '<circle cx="38.5" cy="34.5" r=".9" fill="#7a3a2a"/><path d="M24 25q3-2 6 0M34 25q3-2 6 0" stroke="#6a5a5a" stroke-width="1.2" fill="none"/>' }),
    domenica: nun('#256b43', { cross: 1, extra: '<g fill="none" stroke="#3a2a2a" stroke-width="1.4"><circle cx="27.6" cy="30" r="4"/><circle cx="36.4" cy="30" r="4"/><path d="M31.6 30h.8"/></g>' }),
    antonietta: nun('#2457a8', { cross: 1, extra: '<circle cx="24.6" cy="35" r="2.6" fill="#f0968e" opacity=".55"/><circle cx="39.4" cy="35" r="2.6" fill="#f0968e" opacity=".55"/>' }),
    graziella: nun('#a82d2a', { cross: 1, extra: '<path d="M23.5 24.6l6 1.6M40.5 24.6l-6 1.6" stroke="#4a2a2a" stroke-width="1.8" stroke-linecap="round"/>' }),
    anna: nun('#0d8082', { cross: 0, extra: '<g fill="#c08a64"><circle cx="26" cy="34" r=".7"/><circle cx="28.5" cy="35" r=".7"/><circle cx="35.5" cy="35" r=".7"/><circle cx="38" cy="34" r=".7"/></g>' }),
    sonia: `
      <path d="M6 64c0-12 11-18 26-18s26 6 26 18z" fill="#e58a2e"/>
      <path d="M32 3C19 3 14 14 14 27c0 7 2 12 4 16l5-6V26c0-7 4-10 9-10s9 3 9 10v11l5 6c2-4 4-9 4-16C50 14 45 3 32 3z" fill="#5a3320"/>
      <circle cx="49" cy="15" r="4" fill="#5a3320"/>
      ${face('<path d="M27 37.5q5 4 10 0" stroke="#b0453f" stroke-width="1.6" fill="none" stroke-linecap="round"/>')}
      <path d="M19 22c4-8 22-8 26 0-6-4-20-4-26 0z" fill="#5a3320"/>`,
    romina: `
      <path d="M6 64c0-12 11-18 26-18s26 6 26 18z" fill="#c2417b"/>
      <path d="M32 3C17 3 12 15 12 30c0 9 1 20 4 28l7-2V26h18v30l7 2c3-8 4-19 4-28C52 15 47 3 32 3z" fill="#1d1420"/>
      ${face('<path d="M27 37.5q5 4.4 10 0" stroke="#c0304a" stroke-width="1.9" fill="none" stroke-linecap="round"/><path d="M24.5 27l-2-1.4M39.5 27l2-1.4" stroke="#1d1420" stroke-width="1.3" stroke-linecap="round"/>')}
      <path d="M18 20c5-9 23-9 28 0-7-5-21-5-28 0z" fill="#1d1420"/>
      <g transform="translate(44 11)"><path d="M0 0l-6-4v8zM0 0l6-4v8z" fill="#ff6fa8"/><circle r="1.8" fill="#ffd0e4"/></g>`,
    elettricista: `
      <path d="M6 64c0-12 11-18 26-18s26 6 26 18z" fill="#6f7a2e"/>
      <path d="M22 48h20v16H22z" fill="#4b5320" opacity=".5"/>
      ${face('<path d="M25 37q7-3 14 0q-1 4-7 4t-7-4z" fill="#4a2e1d"/><path d="M27 41.5q5 2 10 0" stroke="#a0453f" stroke-width="1.4" fill="none" stroke-linecap="round"/>')}
      <path d="M17 24c0-11 6-17 15-17s15 6 15 17z" fill="#f3c21b"/>
      <rect x="13" y="22" width="38" height="5" rx="2.5" fill="#d9a30c"/>
      <rect x="29" y="2" width="6" height="8" rx="2" fill="#f3c21b"/>
      <path d="M44 52l9-9" stroke="#999" stroke-width="3" stroke-linecap="round"/><circle cx="54" cy="42" r="3" fill="#d12f2f"/>`,
    fantasma: `
      <path d="M10 64V30C10 14 19 4 32 4s22 10 22 26v34l-6-6-5 6-5-6-6 6-5-6-5 6-5-6z" fill="#eef3fb"/>
      <path d="M10 64V30C10 14 19 4 32 4s22 10 22 26v34" fill="none" stroke="#9db0cc" stroke-width="2"/>
      <ellipse cx="25" cy="27" rx="4" ry="6" fill="#1b2236"/><ellipse cx="39" cy="27" rx="4" ry="6" fill="#1b2236"/>
      <ellipse cx="32" cy="41" rx="4" ry="5.5" fill="#1b2236"/>
      <circle cx="26" cy="25" r="1.3" fill="#fff"/><circle cx="40" cy="25" r="1.3" fill="#fff"/>`,
  };
  const portrait = (id) => PORTRAIT[id] || '';
  const avatar = (id, size) => {
    const s = D.suspect(id);
    size = size || 44;
    const e = h('span', { class: 'avatar', style: `width:${size}px;height:${size}px;background:radial-gradient(circle at 50% 30%,#fff6df,${s ? s.color + '55' : '#ccc'})` });
    e.innerHTML = `<svg viewBox="0 0 64 64" width="${size}" height="${size}">${portrait(id)}</svg>`;
    return e;
  };

  const TYPE_LABEL = { s: 'Sospettata', w: 'Arma', r: 'Luogo' };
  const card = (k, opts) => {
    opts = opts || {};
    const [t, id] = k.split(':');
    const e = h('div', { class: 'card ' + t + (opts.size ? ' ' + opts.size : '') + (opts.back ? ' back' : '') });
    let pic;
    if (t === 's') { const p = h('div', { class: 'pic' }); p.innerHTML = `<svg viewBox="0 0 64 64">${portrait(id)}</svg>`; pic = p; }
    else pic = h('div', { class: 'pic' }, t === 'w' ? D.weapon(id).icon : D.room(id).icon);
    const name = t === 's' ? D.suspect(id).name : t === 'w' ? D.weapon(id).name : D.room(id).name;
    e.append(h('div', { class: 'band' }, TYPE_LABEL[t]), pic, h('div', { class: 'nm' }, name));
    return e;
  };

  const PIPS = { 1: [[5, 5]], 2: [[3, 3], [7, 7]], 3: [[3, 3], [5, 5], [7, 7]], 4: [[3, 3], [7, 3], [3, 7], [7, 7]], 5: [[3, 3], [7, 3], [5, 5], [3, 7], [7, 7]], 6: [[3, 3], [7, 3], [3, 5], [7, 5], [3, 7], [7, 7]] };
  const die = (n, roll) => {
    const e = h('span', { class: 'die' + (roll ? ' roll' : '') });
    e.innerHTML = `<svg viewBox="0 0 10 10" width="100%" height="100%"><rect x=".4" y=".4" width="9.2" height="9.2" rx="2" fill="#fffdf4" stroke="#c9b98f" stroke-width=".35"/>${(PIPS[n] || []).map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".85" fill="#6b1f33"/>`).join('')}</svg>`;
    return e;
  };
  const toast = (msg) => { const t = h('div', { class: 'toast' }, msg); document.body.append(t); setTimeout(() => t.remove(), 3200); };
  const post = (path, body) => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json()).catch(() => ({ ok: false, error: 'Connessione assente. Riprovo…' }));
  const fmtTime = (ms) => { ms = Math.max(0, Math.round(ms / 1000)); return Math.floor(ms / 60) + ':' + String(ms % 60).padStart(2, '0'); };
  const confetti = () => {
    const cols = ['#e2b559', '#c2417b', '#2e7d4f', '#2b63b0', '#f6dc93', '#fff'];
    for (let i = 0; i < 90; i++) {
      const c = h('div', { class: 'confetti', style: `left:${Math.random() * 100}vw;background:${cols[i % cols.length]};animation-duration:${2.5 + Math.random() * 3}s;animation-delay:${Math.random() * 1.5}s;transform:rotate(${Math.random() * 360}deg)` });
      document.body.append(c); setTimeout(() => c.remove(), 8000);
    }
  };
  window.UI = { h, avatar, portrait, card, die, toast, post, fmtTime, confetti };
})();
