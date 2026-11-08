'use strict';
// Disegna la pianta del collegio (SVG) e muove le pedine. Usata dal tabellone e dai telefoni.
(function () {
  const D = window.CDATA, UI = window.UI;
  const NS = 'http://www.w3.org/2000/svg';
  const MAP = D.buildMap();
  const s = (tag, attrs, ...kids) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) { if (attrs[k] != null) e.setAttribute(k, attrs[k]); }
    for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(c));
    return e;
  };
  const PASS = {};
  D.PASSAGES.forEach(([a, b], i) => { PASS[a] = { l: 'AB'[i], to: b }; PASS[b] = { l: 'AB'[i], to: a }; });

  const DEFS = `
  <pattern id="f-checker" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#f8f8f2"/><rect width="1" height="1" fill="#d6dedb"/><rect x="1" y="1" width="1" height="1" fill="#d6dedb"/></pattern>
  <pattern id="f-checkerWarm" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#f4e3bf"/><rect width="1" height="1" fill="#d9b982"/><rect x="1" y="1" width="1" height="1" fill="#d9b982"/></pattern>
  <pattern id="f-tiles" width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#dff0f1"/><path d="M0 0H1V1" fill="none" stroke="#a9ced2" stroke-width=".07"/></pattern>
  <pattern id="f-woodDark" width="4" height=".7" patternUnits="userSpaceOnUse"><rect width="4" height=".7" fill="#8d5c3c"/><rect y=".62" width="4" height=".08" fill="#5f3a22"/><rect x="1.4" width=".06" height=".7" fill="#5f3a22"/></pattern>
  <pattern id="f-wood" width="4" height=".7" patternUnits="userSpaceOnUse"><rect width="4" height=".7" fill="#cb965f"/><rect y=".62" width="4" height=".08" fill="#a5733f"/><rect x="2.6" width=".06" height=".7" fill="#a5733f"/></pattern>
  <pattern id="f-parquet" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#c08a55"/><g stroke="#9a6a3c" stroke-width=".07"><path d="M0 .5H1M0 1H1M0 1.5H1M1 0V1M1.5 1V2M1 1.5H2M1 2H2"/></g><rect x="1" y="1" width="1" height="1" fill="#b27d49"/><rect width="1" height="1" fill="#b27d49" opacity=".6"/></pattern>
  <pattern id="f-carpet" width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#8a2d45"/><path d="M.5 .1L.9 .5L.5 .9L.1 .5Z" fill="none" stroke="#b5566d" stroke-width=".06"/></pattern>
  <pattern id="f-stone" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#cdc9c0"/><path d="M0 1.5H3M1.5 0V1.5M.75 1.5V3M2.25 1.5V3" stroke="#a29d92" stroke-width=".08" fill="none"/></pattern>
  <pattern id="f-ice" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#dff1fb"/><path d="M0 2L2 0" stroke="#fff" stroke-width=".12" opacity=".8"/><path d="M0 1L1 0M1 2L2 1" stroke="#b8dcee" stroke-width=".06"/></pattern>
  <pattern id="f-desks" width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#efe6cf"/><rect width="1" height="1" fill="none" stroke="#d9cba6" stroke-width=".05"/></pattern>
  <pattern id="dots" width="1.4" height="1.4" patternUnits="userSpaceOnUse"><rect width="1.4" height="1.4" fill="#171b30"/><circle cx=".7" cy=".7" r=".05" fill="#2a3150"/></pattern>
  <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy=".12" stdDeviation=".12" flood-color="#000" flood-opacity=".45"/></filter>
  <filter id="big" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy=".35" stdDeviation=".45" flood-color="#000" flood-opacity=".55"/></filter>`;
  const STYLE = `
  .pawn,.item{transition:transform .17s linear}
  .pawn.slow,.item.slow{transition:transform .5s ease-in-out}
  .pulse{animation:pls 1.1s ease-in-out infinite}
  @keyframes pls{0%,100%{opacity:.35}50%{opacity:.85}}
  .halo{animation:halo 1.3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
  @keyframes halo{0%,100%{transform:scale(.9);opacity:.9}50%{transform:scale(1.18);opacity:.35}}
  .hit{cursor:pointer}.hit:hover{fill:rgba(255,255,255,.16)}
  .ghosty{animation:fl 2.4s ease-in-out infinite}
  @keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-.1px)}}
  text{font-family:'Nunito',system-ui,sans-serif;font-weight:800}
  .serif{font-family:'Playfair Display',Georgia,serif}`;

  class MapView {
    constructor(opts) {
      opts = opts || {};
      this.opts = opts;
      this.svg = s('svg', { viewBox: '-0.8 -0.8 32.6 35.6', class: 'mapsvg', preserveAspectRatio: 'xMidYMid meet' });
      this.svg.style.width = '100%'; this.svg.style.height = '100%'; this.svg.style.display = 'block'; this.svg.style.touchAction = opts.touchAction || 'manipulation';
      this.svg.append(s('defs', {}), s('style', {}, STYLE));
      this.svg.querySelector('defs').innerHTML = DEFS;
      this.gStatic = s('g'); this.gHi = s('g'); this.gItems = s('g'); this.gHit = s('g');
      this.svg.append(this.gStatic, this.gHi, this.gItems, this.gHit);
      this.pawns = {}; this.weapons = {}; this.suoraEl = null;
      this.anim = new Set();
      this.drawStatic();
    }

    drawStatic() {
      const g = this.gStatic;
      g.append(s('rect', { x: -0.8, y: -0.8, width: 32.6, height: 35.6, rx: 0.6, fill: '#171b30' }));
      // sfondo "giardino" con puntini
      g.append(s('rect', { x: -0.8, y: -0.8, width: 32.6, height: 35.6, rx: 0.6, fill: 'url(#dots)' }));
      // corridoi: bordo scuro + piastrelle
      const cg = s('g', { filter: 'url(#big)' });
      for (const [x, y, w, h] of D.CORRIDORS) cg.append(s('rect', { x: x - 0.14, y: y - 0.14, width: w + 0.28, height: h + 0.28, fill: '#3a2a35', rx: 0.12 }));
      g.append(cg);
      for (const t of MAP.tiles.values()) {
        const dark = (t.x + t.y) % 2;
        g.append(s('rect', { x: t.x, y: t.y, width: 1, height: 1, fill: dark ? '#e7d9b8' : '#f2e8cf', stroke: '#d4c49c', 'stroke-width': 0.04 }));
      }
      // stanze
      for (const r of D.ROOMS) this.drawRoom(r);
      // scale
      const sx = 21, sy = 11;
      const st = s('g');
      st.append(s('rect', { x: sx, y: sy, width: 2, height: 2, fill: '#a98f5e', stroke: '#3a2a35', 'stroke-width': 0.1, rx: 0.1 }));
      for (let i = 0; i < 6; i++) st.append(s('rect', { x: sx + 0.1, y: sy + 0.1 + i * 0.32, width: 1.8, height: 0.2, fill: i % 2 ? '#d6bd88' : '#e8d4a4' }));
      st.append(s('text', { x: sx + 1, y: sy + 1.35, 'text-anchor': 'middle', 'font-size': 1.15, fill: '#3a1a22' }, '⬆'));
      g.append(st);
      g.append(s('path', { d: 'M23 12 C25 14 26 18 26 21.8', fill: 'none', stroke: '#e2b559', 'stroke-width': 0.14, 'stroke-dasharray': '0.4 0.35', 'stroke-linecap': 'round', opacity: 0.9 }));
      g.append(s('text', { x: 22, y: 10.7, 'text-anchor': 'middle', 'font-size': 0.62, fill: '#f6dc93' }, 'scale'));
    }

    drawRoom(r) {
      const g = this.gStatic;
      const grp = s('g', { filter: 'url(#soft)' });
      if (r.upstairs) {
        grp.append(s('rect', { x: r.x - 0.35, y: r.y - 0.35, width: r.w + 0.7, height: r.h + 0.7, rx: 0.5, fill: 'none', stroke: '#e2b559', 'stroke-width': 0.14, 'stroke-dasharray': '0.5 0.35' }));
      }
      grp.append(s('rect', { x: r.x, y: r.y, width: r.w, height: r.h, fill: `url(#f-${r.floor})`, stroke: '#3a2430', 'stroke-width': 0.26 }));
      g.append(grp);
      g.append(s('rect', { x: r.x + 0.13, y: r.y + 0.13, width: r.w - 0.26, height: r.h - 0.26, fill: 'url(#shine)', 'pointer-events': 'none' }));
      this.decor(r);
      // porte
      for (const [x, y] of r.doors) {
        if (r.upstairs) continue;
        let rect;
        if (y === r.y + r.h) rect = { x: x + 0.12, y: y - 0.2, w: 0.76, h: 0.4 };
        else if (y === r.y - 1) rect = { x: x + 0.12, y: y + 1 - 0.2, w: 0.76, h: 0.4 };
        else if (x === r.x - 1) rect = { x: x + 1 - 0.2, y: y + 0.12, w: 0.4, h: 0.76 };
        else rect = { x: x - 0.2, y: y + 0.12, w: 0.4, h: 0.76 };
        g.append(s('rect', { x: rect.x, y: rect.y, width: rect.w, height: rect.h, rx: 0.08, fill: '#a56a30', stroke: '#4a2a10', 'stroke-width': 0.08 }));
        g.append(s('circle', { cx: rect.x + rect.w * (rect.w > rect.h ? 0.8 : 0.5), cy: rect.y + rect.h * (rect.w > rect.h ? 0.5 : 0.8), r: 0.06, fill: '#f6dc93' }));
      }
      // targhetta con nome
      const small = r.h <= 3;
      const fs = small ? 0.58 : Math.min(0.78, (r.w - 0.8) / (r.name.length * 0.62));
      const label = (small ? r.icon + ' ' : '') + r.name;
      const tw = Math.min(r.w - 0.4, label.length * fs * 0.6 + 0.8);
      const ly = r.y + (small ? 0.18 : 0.2);
      const lg = s('g', { 'pointer-events': 'none' });
      lg.append(s('rect', { x: r.x + r.w / 2 - tw / 2, y: ly, width: tw, height: small ? 0.9 : (r.sub ? 1.5 : 1.1), rx: 0.35, fill: 'rgba(255,248,230,.93)', stroke: '#3a2430', 'stroke-width': 0.06 }));
      lg.append(s('text', { x: r.x + r.w / 2, y: ly + (small ? 0.64 : 0.76), 'text-anchor': 'middle', 'font-size': fs, fill: '#4a1626', class: 'serif' }, label));
      if (r.sub && !small) lg.append(s('text', { x: r.x + r.w / 2, y: ly + 1.25, 'text-anchor': 'middle', 'font-size': 0.44, fill: '#7a5a60' }, r.sub));
      g.append(lg);
      if (!small) g.append(s('text', { x: r.x + 0.7, y: r.y + r.h - 0.4, 'font-size': 1.3, opacity: 0.55, 'pointer-events': 'none' }, r.icon));
      // passaggio segreto
      if (PASS[r.id]) {
        const b = s('g', { transform: `translate(${r.x + r.w - 0.9} ${r.y + r.h - 0.9})`, 'pointer-events': 'none' });
        b.append(s('circle', { r: 0.62, fill: '#2a1a40', stroke: '#e2b559', 'stroke-width': 0.1 }), s('text', { y: 0.22, 'text-anchor': 'middle', 'font-size': 0.7, fill: '#f6dc93' }, PASS[r.id].l));
        g.append(b);
      }
    }

    decor(r) {
      const g = this.gStatic, o = { opacity: 0.38, 'pointer-events': 'none' };
      const rect = (x, y, w, h, fill, extra) => g.append(s('rect', Object.assign({ x, y, width: w, height: h, rx: 0.1, fill }, o, extra || {})));
      if (r.id === 'pranzo') { for (const y of [r.y + 3.2, r.y + 5.6, r.y + 8]) { rect(r.x + 1.2, y, r.w - 2.4, 0.9, '#5f3a22'); } }
      if (r.id === 'pranzoSuore') { rect(r.x + 1.5, r.y + 2.7, r.w - 3, 1.3, '#3d2416'); }
      if (r.id === 'cappella') { for (let i = 0; i < 3; i++) { rect(r.x + 1, r.y + 3 + i * 1.2, 3, 0.55, '#5f3a22'); rect(r.x + r.w - 4, r.y + 3 + i * 1.2, 3, 0.55, '#5f3a22'); } rect(r.x + r.w / 2 - 1, r.y + r.h - 1.4, 2, 0.8, '#e2b559'); }
      if (r.id === 'cucina' || r.id === 'cucinaSuore') { rect(r.x + 0.4, r.y + 2.2, r.w - 0.8, 0.7, '#8a8f94'); }
      if (r.id === 'aula') { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) rect(r.x + 1.1 + j * 2.4, r.y + 2.2 + i * 1.3, 1.4, 0.7, '#8a6a3a'); }
      if (r.id === 'tv') { rect(r.x + 1.5, r.y + r.h - 1.2, 3, 0.45, '#222'); rect(r.x + 1.2, r.y + 2.2, 3.6, 0.8, '#6a2a3a'); }
      if (r.id === 'ufficio') { rect(r.x + 1, r.y + 2.2, 4, 1, '#3d2416'); rect(r.x + 0.3, r.y + r.h - 1.6, 0.8, 1.3, '#5f3a22'); }
      if (r.id === 'reception') { rect(r.x + 0.5, r.y + 1.3, 3, 0.5, '#5f3a22'); }
    }

    // ---- posizioni ----
    centerOfTile(x, y) { return { x: x + 0.5, y: y + 0.5, s: 1 }; }
    layoutRoom(r, n) {
      const small = r.h <= 3;
      const top = small ? 1.25 : (r.sub ? 1.95 : 1.65);
      const x0 = r.x + 0.3, y0 = r.y + top, aw = r.w - 0.6, ah = r.h - top - 0.2;
      let sc = 1.2, cols = 1, rows = 1;
      for (; sc >= 0.45; sc -= 0.05) { cols = Math.max(1, Math.floor(aw / sc)); rows = Math.max(1, Math.floor(ah / sc)); if (cols * rows >= n) break; }
      cols = Math.min(cols, n); rows = Math.ceil(n / cols);
      const pos = [];
      for (let j = 0; j < n; j++) {
        const row = Math.floor(j / cols), col = j % cols, count = row === rows - 1 ? n - row * cols : cols;
        pos.push({ x: x0 + (aw - count * sc) / 2 + (col + 0.5) * sc, y: y0 + (ah - rows * sc) / 2 + (row + 0.5) * sc, s: Math.min(1.15, sc) / 1.1 });
      }
      return pos;
    }

    makePawn(id) {
      const sp = D.suspect(id);
      const g = s('g', { class: 'pawn' });
      const inner = s('g');
      inner.append(s('circle', { class: 'halo', r: 0.9, fill: 'none', stroke: '#ffe27a', 'stroke-width': 0.18, 'data-halo': 1, style: 'display:none' }));
      inner.append(s('ellipse', { cx: 0, cy: 0.5, rx: 0.55, ry: 0.17, fill: 'rgba(0,0,0,.35)' }));
      inner.append(s('circle', { r: 0.7, fill: sp.color, stroke: '#fff', 'stroke-width': 0.12, filter: 'url(#soft)' }));
      const cp = s('clipPath', { id: 'pc-' + id }, s('circle', { r: 0.64 }));
      const art = s('g', { 'clip-path': `url(#pc-${id})` });
      const pg = s('g', { transform: `translate(-0.7 -0.74) scale(${1.4 / 64})` });
      pg.innerHTML = UI.portrait(id);
      art.append(pg);
      inner.append(cp, art);
      g.append(inner);
      this.gItems.append(g);
      return g;
    }
    makeWeapon(id) {
      const w = D.weapon(id);
      const g = s('g', { class: 'item' });
      g.append(s('rect', { x: -0.5, y: -0.5, width: 1, height: 1, rx: 0.22, fill: '#fff7e0', stroke: '#7a4a2a', 'stroke-width': 0.08, filter: 'url(#soft)' }));
      g.append(s('text', { y: 0.27, 'text-anchor': 'middle', 'font-size': 0.78 }, w.icon));
      this.gItems.append(g);
      return g;
    }
    makeSuora() {
      const g = s('g', { class: 'item' });
      g.append(s('circle', { r: 0.8, fill: 'none', stroke: '#ff5d5d', 'stroke-width': 0.14, class: 'pulse' }));
      g.append(s('circle', { r: 0.6, fill: '#1c1c24', stroke: '#fff', 'stroke-width': 0.1, filter: 'url(#soft)' }));
      g.append(s('path', { d: 'M-0.38 0.2a.38 .5 0 0 1 .76 0v.2h-.76z', fill: '#fff' }));
      g.append(s('circle', { cy: -0.05, r: 0.24, fill: '#f3cba5' }));
      g.append(s('path', { d: 'M-0.36 -0.05a.36 .5 0 0 1 .72 0q-.36-.5-.72 0z', fill: '#111' }));
      g.append(s('text', { y: -0.72, 'text-anchor': 'middle', 'font-size': 0.52, fill: '#ff8a8a', stroke: '#1c1c24', 'stroke-width': 0.08, 'paint-order': 'stroke' }, 'RONDA'));
      this.gItems.append(g);
      return g;
    }
    put(el, p, slow) {
      el.style.transform = `translate(${p.x}px, ${p.y}px) scale(${p.s || 1})`;
      el.classList.toggle('slow', !!slow);
    }

    pawnPos(id, v) {
      const pw = v.pawns[id];
      return pw.t === 't' ? this.centerOfTile(pw.x, pw.y) : null;
    }

    update(v) {
      this.v = v;
      const byRoom = {};
      const add = (room, it) => (byRoom[room] = byRoom[room] || []).push(it);
      for (const sp of D.SUSPECTS) {
        const pw = v.pawns[sp.id];
        if (!pw) continue;
        if (!this.pawns[sp.id]) this.pawns[sp.id] = this.makePawn(sp.id);
        if (pw.t === 'r') add(pw.r, { kind: 'p', id: sp.id });
      }
      for (const w of D.WEAPONS) {
        if (!this.weapons[w.id]) this.weapons[w.id] = this.makeWeapon(w.id);
        if (v.weapons[w.id]) add(v.weapons[w.id], { kind: 'w', id: w.id });
      }
      if (v.status === 'playing' || v.status === 'ended') {
        if (!this.suoraEl) this.suoraEl = this.makeSuora();
        add(v.suora, { kind: 'n' });
      }
      const turnSuspect = v.turn ? (v.players.find((p) => p.id === v.turn.pid) || {}).suspect : null;
      const owner = {}; const outS = new Set();
      for (const p of v.players) { owner[p.suspect] = p; if (p.out) outS.add(p.suspect); }
      for (const id in this.pawns) {
        const el = this.pawns[id], pw = v.pawns[id];
        el.classList.toggle('npcp', !owner[id]);
        el.style.opacity = !owner[id] ? 0.62 : outS.has(id) ? 0.5 : 1;
        el.querySelector('[data-halo]').style.display = turnSuspect === id ? '' : 'none';
        if (pw.t === 't' && !this.anim.has(id)) this.put(el, this.centerOfTile(pw.x, pw.y));
      }
      for (const rid in byRoom) {
        const r = D.room(rid), items = byRoom[rid];
        const pos = this.layoutRoom(r, items.length);
        items.forEach((it, j) => {
          const el = it.kind === 'p' ? this.pawns[it.id] : it.kind === 'w' ? this.weapons[it.id] : this.suoraEl;
          if (it.kind === 'p' && this.anim.has(it.id)) return;
          this.put(el, pos[j], true);
        });
      }
      // armi non ancora piazzate (lobby): nascoste
      for (const w of D.WEAPONS) this.weapons[w.id].style.display = v.weapons[w.id] ? '' : 'none';
      if (this.suoraEl) this.suoraEl.style.display = (v.status === 'lobby') ? 'none' : '';
      // i pedoni mostrati solo a partita iniziata
      for (const id in this.pawns) this.pawns[id].style.display = v.pawns[id] ? '' : 'none';
    }

    // anima il percorso di una pedina (path = elenco di {x,y} o {r})
    walk(id, path, to, done) {
      const el = this.pawns[id];
      if (!el || !path || !path.length) { done && done(); return; }
      this.anim.add(id);
      const finish = () => { this.anim.delete(id); this.update(this.v); done && done(); };
      let i = 0;
      const step = () => {
        if (i >= path.length) { setTimeout(finish, 120); return; }
        const n = path[i++];
        if (n.r) { // ingresso in stanza: va al centro della porta e poi dentro
          const r = D.room(n.r); this.put(el, { x: r.x + r.w / 2, y: r.y + r.h / 2, s: 1 }, true); setTimeout(finish, 520);
        } else { this.put(el, this.centerOfTile(n.x, n.y)); setTimeout(step, 170); }
      };
      step();
    }
    teleport(id, to, done) {
      const el = this.pawns[id]; if (!el) { done && done(); return; }
      this.anim.add(id);
      el.style.transition = 'opacity .35s'; el.style.opacity = 0;
      setTimeout(() => { this.anim.delete(id); el.style.transition = ''; this.update(this.v); el.style.opacity = 1; done && done(); }, 420);
    }

    // ---- evidenziazioni cliccabili ----
    setHighlights(h) {
      this.gHi.replaceChildren(); this.gHit.replaceChildren();
      if (!h) return;
      for (const k of h.tiles || []) {
        const [x, y] = k.split(',').map(Number);
        this.gHi.append(s('rect', { x: x + 0.08, y: y + 0.08, width: 0.84, height: 0.84, rx: 0.2, fill: '#3fe08a', opacity: 0.55, class: 'pulse', stroke: '#fff', 'stroke-width': 0.06 }));
        const hit = s('rect', { x, y, width: 1, height: 1, fill: 'rgba(0,0,0,0)', class: 'hit' });
        hit.addEventListener('click', () => this.opts.onTile && this.opts.onTile(x, y));
        this.gHit.append(hit);
      }
      for (const id of h.rooms || []) {
        const r = D.room(id);
        this.gHi.append(s('rect', { x: r.x, y: r.y, width: r.w, height: r.h, fill: 'rgba(63,224,138,.18)', stroke: '#3fe08a', 'stroke-width': 0.28, class: 'pulse', 'pointer-events': 'none' }));
        const hit = s('rect', { x: r.x, y: r.y, width: r.w, height: r.h, fill: 'rgba(0,0,0,0)', class: 'hit' });
        hit.addEventListener('click', () => this.opts.onRoom && this.opts.onRoom(id));
        this.gHit.append(hit);
      }
    }
  }
  window.MapView = MapView;
})();
