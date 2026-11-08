// Dati condivisi (server e schermi): personaggi, armi, stanze e mappa a quadratini.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CDATA = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const TITLE = 'Misteri al Collegio';
  const VICTIM = "l'Ispettore del Ministero";

  const SUSPECTS = [
    { id: 'zita', name: 'Madre Zita', ini: 'MZ', color: '#7a3b8f' },
    { id: 'domenica', name: 'Madre Domenica', ini: 'MD', color: '#2e7d4f' },
    { id: 'antonietta', name: 'Madre Maria Antonietta', ini: 'MA', color: '#2b63b0' },
    { id: 'graziella', name: 'Madre Graziella', ini: 'MG', color: '#b3362f' },
    { id: 'anna', name: 'Suor Anna', ini: 'SA', color: '#0f8b8d' },
    { id: 'sonia', name: 'Sonia', ini: 'SO', color: '#d17a22' },
    { id: 'romina', name: 'Romina', ini: 'RO', color: '#c2417b' },
    { id: 'elettricista', name: "L'Elettricista", ini: 'EL', color: '#8a7a1c' },
    { id: 'fantasma', name: 'Il Fantasma del collegio', ini: '👻', color: '#6b7a8f' },
  ];
  const WEAPONS = [
    { id: 'mattarello', name: 'Mattarello', icon: '🪵' },
    { id: 'ferro', name: 'Ferro da stiro', icon: '🧺' },
    { id: 'rosario', name: 'Rosario', icon: '📿' },
    { id: 'scopa', name: 'Scopa', icon: '🧹' },
    { id: 'candelabro', name: 'Candelabro', icon: '🕯️' },
    { id: 'padella', name: 'Padella', icon: '🍳' },
    { id: 'coltello', name: 'Coltello', icon: '🔪' },
    { id: 'cavo', name: 'Cavo elettrico', icon: '🔌' },
    { id: 'aspirapolvere', name: 'Aspirapolvere', icon: '🌀' },
  ];

  // x,y,w,h in quadratini. floor = tipo di pavimento (per la grafica)
  const ROOMS = [
    { id: 'cucina', num: 1, name: 'Cucina', icon: '🍳', floor: 'checker', x: 0, y: 0, w: 6, h: 5, doors: [[2, 5], [3, 5]] },
    { id: 'lavaggio', num: 2, name: 'Cucina piccola', sub: 'lavaggio piatti', icon: '🫧', floor: 'tiles', x: 6, y: 0, w: 4, h: 5, doors: [[7, 5], [8, 5]] },
    { id: 'cucinaSuore', num: 3, name: 'Cucina delle suore', icon: '🥘', floor: 'checkerWarm', x: 10, y: 0, w: 8, h: 5, doors: [[13, 5], [14, 5]] },
    { id: 'pranzoSuore', num: 4, name: 'Pranzo delle suore', icon: '🍷', floor: 'woodDark', x: 18, y: 0, w: 7, h: 5, doors: [[20, 5], [21, 5]] },
    { id: 'pranzo', num: 5, name: 'Sala da pranzo', sub: 'collegiali', icon: '🍝', floor: 'wood', x: 9, y: 7, w: 11, h: 10, doors: [[8, 11], [8, 12], [20, 11], [20, 12], [12, 6], [13, 6]] },
    { id: 'bagniProib', num: 7, name: 'Bagni proibiti', icon: '🚫', floor: 'tiles', x: 0, y: 7, w: 6, h: 3, doors: [[6, 8]] },
    { id: 'ufficio', num: 8, name: 'Ufficio di Madre Zita', icon: '📚', floor: 'woodDark', x: 0, y: 10, w: 6, h: 7, doors: [[6, 12], [6, 13]] },
    { id: 'reception', num: 11, name: 'Reception', icon: '🛎️', floor: 'carpet', x: 0, y: 19, w: 4, h: 3, doors: [[1, 18], [2, 18]] },
    { id: 'tv', num: 12, name: 'Sala TV delle suore', icon: '📺', floor: 'carpet', x: 0, y: 22, w: 6, h: 5, doors: [[6, 23], [6, 24]] },
    { id: 'cappella', num: 15, name: 'Cappella', icon: '⛪', floor: 'stone', x: 9, y: 19, w: 9, h: 7, doors: [[8, 21], [8, 22]] },
    { id: 'salaGrande', num: 13, name: 'Sala grande', icon: '🎭', floor: 'parquet', x: 0, y: 27, w: 19, h: 7, doors: [[6, 26], [7, 26], [8, 26], [19, 30], [19, 31]] },
    { id: 'ghiacciaia', num: 6, name: 'Ghiacciaia', sub: 'si studia qui', icon: '🧊', floor: 'ice', x: 23, y: 17, w: 8, h: 4, doors: [[22, 17], [22, 18]] },
    { id: 'bagni', num: 14, name: 'Bagni permessi', icon: '🚻', floor: 'tiles', x: 22, y: 31, w: 7, h: 3, doors: [[21, 32], [21, 33]] },
    { id: 'aula', num: 16, name: 'Aula studio', sub: 'piano di sopra', icon: '✏️', floor: 'desks', x: 23, y: 22, w: 8, h: 6, doors: [[21, 11], [22, 11], [21, 12], [22, 12]], upstairs: true },
  ];
  const CORRIDORS = [[0, 5, 25, 2], [6, 7, 3, 10], [20, 7, 3, 10], [0, 17, 23, 2], [6, 19, 3, 8], [19, 29, 3, 5]];
  const STAIRS = [[21, 11], [22, 11], [21, 12], [22, 12]];
  const PASSAGES = [['cucina', 'ghiacciaia'], ['ufficio', 'salaGrande']];
  const GOSSIP_ROOMS = ['reception', 'tv', 'cappella'];
  const PATROL = ['cucina', 'lavaggio', 'cucinaSuore', 'pranzoSuore', 'pranzo', 'bagniProib', 'ufficio', 'reception', 'tv', 'cappella', 'salaGrande'];
  const STARTS = [[0, 5], [12, 5], [24, 6], [0, 18], [11, 17], [22, 18], [7, 20], [20, 8], [7, 24]];
  const COLS = 31, ROWS = 34;

  const room = (id) => ROOMS.find((r) => r.id === id);
  const suspect = (id) => SUSPECTS.find((s) => s.id === id);
  const weapon = (id) => WEAPONS.find((w) => w.id === id);

  // mappa: quadratini percorribili e collegamenti
  function buildMap() {
    const tiles = new Map(); // "x,y" -> {x,y,stairs}
    for (const [x0, y0, w, h] of CORRIDORS) for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) tiles.set(x + ',' + y, { x, y, stairs: false });
    for (const [x, y] of STAIRS) { const t = tiles.get(x + ',' + y); if (t) t.stairs = true; }
    const doorRoom = new Map(); // "x,y" -> [roomId]
    for (const r of ROOMS) for (const [x, y] of r.doors) {
      const k = x + ',' + y;
      if (!tiles.has(k)) throw new Error('porta fuori corridoio: ' + r.id + ' ' + k);
      if (!doorRoom.has(k)) doorRoom.set(k, []);
      doorRoom.get(k).push(r.id);
    }
    return { tiles, doorRoom };
  }

  // numero (1..) di carte "oggetti": id con prefisso
  const cardKey = (t, id) => t + ':' + id;
  const cardInfo = (key) => {
    const [t, id] = key.split(':');
    if (t === 's') { const s = suspect(id); return { t, id, name: s.name, icon: s.ini, color: s.color }; }
    if (t === 'w') { const w = weapon(id); return { t, id, name: w.name, icon: w.icon }; }
    const r = room(id); return { t, id, name: r.name, icon: r.icon };
  };

  return { TITLE, VICTIM, SUSPECTS, WEAPONS, ROOMS, CORRIDORS, STAIRS, PASSAGES, GOSSIP_ROOMS, PATROL, STARTS, COLS, ROWS, room, suspect, weapon, buildMap, cardKey, cardInfo };
});
