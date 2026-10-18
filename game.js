(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const menu = document.getElementById("menu");
  const title = document.getElementById("overlay-title");
  const copy = document.getElementById("overlay-copy");
  const startBtn = document.getElementById("start-btn");
  const keysLabel = document.getElementById("keys");
  const statusLabel = document.getElementById("status");
  const soundLabel = document.getElementById("sound-state");

  const W = canvas.width, H = canvas.height, TILE = 40;
  const COLS = W / TILE, ROWS = H / TILE;

  // ============================================================
  //  DATA LEVEL (1 - 5)
  //  # = dinding, . = lantai
  //  start    : [kolom, baris] posisi awal player
  //  keys     : [[kolom, baris], ...] kunci
  //  exit     : [kolom, baris] pintu keluar
  //  doors    : [[kolom, baris], ...] pintu yang bisa dibuka/ditutup (E)
  //  cabinets : [[kolom, baris, isi], ...] lemari. isi: battery | weapon | medkit | empty
  //  lockers  : [[kolom, baris], ...] loker untuk bersembunyi (E)
  //  monsters : [kolom, baris, nyawa, kecepatan, jenis] jenis: ghost | guard
  // ============================================================
  // LEVELS-START
  const LEVELS = [
    { // LEVEL 1
      map: [
        "########################",
        "#....#........#........#",
        "#....#........#........#",
        "#....#........#........#",
        "#......................#",
        "#.####.####.####.####..#",
        "#......#........#......#",
        "###.####.......####.####",
        "#......#........#......#",
        "#......#........#......#",
        "#......................#",
        "#.####.####.####.####..#",
        "#....#........#........#",
        "#....#........#........#",
        "#......................#"
      ],
      start: [2, 4],
      keys: [[3, 2], [19, 8], [12, 13]],
      exit: [22, 13],
      doors: [[3, 7], [19, 7]],
      cabinets: [[6, 1, "battery"], [22, 1, "weapon"]],
      lockers: [[1, 13], [15, 1]],
      monsters: [[20, 4, 3, 1.0, "ghost"]]
    },
    { // LEVEL 2
      map: [
        "########################",
        "#......#.......#.......#",
        "#......#.......#.......#",
        "#..##..#..###..#..###..#",
        "#..##.....###.....###..#",
        "#......#.......#.......#",
        "####.###.#####.###.#####",
        "#......#.......#.......#",
        "#..##..#..###..#..###..#",
        "#..##.....###.....###..#",
        "#......#.......#.......#",
        "#......#.......#.......#",
        "###.#####.###.#####.####",
        "#......................#",
        "########################"
      ],
      start: [1, 1],
      keys: [[10, 5], [20, 2], [3, 10]],
      exit: [22, 13],
      doors: [[4, 6], [18, 6], [9, 12]],
      cabinets: [[2, 1, "battery"], [22, 1, "empty"], [14, 10, "battery"]],
      lockers: [[1, 5], [22, 11], [8, 1]],
      monsters: [[20, 10, 3, 1.05, "ghost"], [8, 13, 4, 1.25, "guard"]]
    },
    { // LEVEL 3
      map: [
        "########################",
        "#......#.........#.....#",
        "#......#.........#.....#",
        "#..###.#..#####..#.###.#",
        "#..#.....#...#.....#...#",
        "#..#.#####...#####.#...#",
        "#....#...........#.....#",
        "####.#...........#.#####",
        "#....#...#####...#.....#",
        "#.####...#...#...#####.#",
        "#........#...#.........#",
        "#.######.##.##.#######.#",
        "#.#....................#",
        "#.#.####.######.######.#",
        "########################"
      ],
      start: [1, 1],
      keys: [[4, 2], [20, 1], [10, 7], [20, 10]],
      exit: [22, 12],
      doors: [[4, 7], [18, 7], [11, 11]],
      cabinets: [[8, 1, "battery"], [22, 1, "weapon"], [1, 10, "empty"]],
      lockers: [[1, 3], [16, 2], [3, 13], [15, 13]],
      monsters: [[12, 6, 4, 1.05, "ghost"], [20, 12, 5, 1.25, "guard"]]
    },
    { // LEVEL 4
      map: [
        "########################",
        "#....#.....#.....#.....#",
        "#....#.....#.....#.....#",
        "#.##.#.###.#.###.#.###.#",
        "#.#....#.......#...#...#",
        "#.#.####.#####.#.###.###",
        "#.#......#...#.#.....#.#",
        "#.######.#.#.#.#####.#.#",
        "#........#.#.....#...#.#",
        "####.#####.#####.#.###.#",
        "#....#.........#.#.....#",
        "#.####.#######.#.#.#####",
        "#......#.....#...#.....#",
        "#.######.###.#########.#",
        "########################"
      ],
      start: [1, 1],
      keys: [[8, 2], [20, 1], [2, 8], [13, 10]],
      exit: [22, 12],
      doors: [[4, 9], [10, 9], [22, 9]],
      cabinets: [[4, 1, "battery"], [22, 1, "medkit"], [10, 12, "battery"]],
      lockers: [[1, 13], [8, 13], [12, 13]],
      monsters: [[10, 4, 4, 1.1, "ghost"], [19, 8, 5, 1.3, "guard"], [6, 12, 5, 1.3, "guard"]]
    },
    { // LEVEL 5
      map: [
        "########################",
        "#......................#",
        "#.##.####.####.####.##.#",
        "#.#..................#.#",
        "#.#.####..####..####.#.#",
        "#...#..............#...#",
        "###.#.####....####.#.###",
        "#.....#..........#.....#",
        "###.#.####....####.#.###",
        "#...#..............#...#",
        "#.#.####..####..####.#.#",
        "#.#..................#.#",
        "#.##.####.####.####.##.#",
        "#......................#",
        "########################"
      ],
      start: [1, 1],
      keys: [[1, 5], [22, 5], [11, 7], [1, 9], [22, 9]],
      exit: [22, 13],
      doors: [[3, 6], [18, 6], [5, 8], [20, 8]],
      cabinets: [[11, 1, "battery"], [6, 3, "battery"], [16, 11, "medkit"], [11, 13, "empty"]],
      lockers: [[8, 5], [15, 9], [3, 11], [20, 3]],
      monsters: [[11, 3, 5, 1.15, "ghost"], [11, 11, 5, 1.15, "ghost"], [20, 7, 6, 1.3, "guard"], [4, 7, 6, 1.3, "guard"]]
    }
  ];
  // LEVELS-END

  // Alat pukul (naik tingkat lewat lemari)
  const WEAPONS = [
    { name: "TONGKAT KAYU", dmg: 1, range: 58, cd: 420 },
    { name: "PIPA BESI",    dmg: 2, range: 64, cd: 460 },
    { name: "PALU GODAM",   dmg: 3, range: 72, cd: 560 }
  ];

  const PLAYER_MAX_HP = 3;
  const ATTACK_TIME = 260;
  const ATTACK_ARC = 1.3;
  const BEAM_LENGTH = 250;
  const BEAM_HALF_ANGLE = 0.42;
  const RUN_MULT = 1.65;
  const STAMINA_DRAIN = 32;     // per detik saat lari
  const STAMINA_REGEN = 22;     // per detik saat tidak lari
  const BATTERY_LIFE = 140;     // detik senter menyala dari 100%

  let levelIndex = 0;
  let map = [];
  let keys = [], doors = [], cabinets = [], lockers = [];
  let exit = { x: 0, y: 0 };
  let floorCells = [];
  let player = null, enemies = [];
  let running = false, nextAction = "start"; // start | next | retry | restart
  let carry = { tier: 0, spare: 0, charge: 100 };
  let soundOn = true, audioCtx = null, lastScare = 0, lastBeat = 0, lastT = performance.now();
  let msg = { text: "", until: 0 };
  const pressed = Object.create(null);
  let prevGamepadButtons = [];

  const darkCanvas = document.createElement("canvas");
  darkCanvas.width = W; darkCanvas.height = H;
  const dctx = darkCanvas.getContext("2d");

  const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
  function say(text, ms = 1800) { msg = { text, until: performance.now() + ms }; }

  // ---------------- SETUP LEVEL ----------------
  function makePlayer(c, r) {
    return {
      x: (c + .5) * TILE, y: (r + .5) * TILE, r: 10, speed: 2.35,
      faceX: 1, faceY: 0, hp: PLAYER_MAX_HP,
      moving: false, running: false, animT: 0,
      attackStart: -9999, lastAttack: -9999, invuln: 0,
      stamina: 100, exhausted: false,
      lightOn: true, charge: carry.charge, spare: carry.spare, tier: carry.tier,
      hidden: null, hideFrom: null, prevLight: true
    };
  }

  function loadLevel(i) {
    const L = LEVELS[i];
    map = L.map.map(row => row.split(""));
    keys = L.keys.map(([c, r]) => ({ x: (c + .5) * TILE, y: (r + .5) * TILE, found: false }));
    exit = { x: (L.exit[0] + .5) * TILE, y: (L.exit[1] + .5) * TILE };
    player = makePlayer(L.start[0], L.start[1]);

    cabinets = L.cabinets.map(([c, r, item]) => {
      map[r][c] = "C";
      return { c, r, x: (c + .5) * TILE, y: (r + .5) * TILE, item, opened: false, open: 0 };
    });
    lockers = L.lockers.map(([c, r]) => {
      map[r][c] = "L";
      return { c, r, x: (c + .5) * TILE, y: (r + .5) * TILE, open: 0, animUntil: 0 };
    });
    doors = L.doors.map(([c, r]) => ({
      c, r, x: (c + .5) * TILE, y: (r + .5) * TILE,
      open: 0, target: 0, rate: .06,
      spanH: map[r][c - 1] === "#" && map[r][c + 1] === "#" // true: panel melintang (lorong vertikal)
    }));

    floorCells = [];
    for (let r = 0; r < map.length; r++)
      for (let c = 0; c < map[r].length; c++)
        if (map[r][c] === ".") floorCells.push([c, r]);

    enemies = L.monsters.map(([c, r, hp, speed, kind]) => ({
      kind, x: (c + .5) * TILE, y: (r + .5) * TILE, r: 13, speed,
      hp, maxHp: hp, active: kind === "guard", state: "patrol",
      stun: 0, flash: 0, anim: Math.random() * 6, face: Math.random() * 6.28,
      goal: null, waitT: Math.random() * 2, field: null, fieldKey: "",
      lastSeen: null, loseT: 0, searchT: 0, sawHide: false, discT: 0
    }));
  }

  function resetGame() {
    if (nextAction === "restart" || nextAction === "start") {
      levelIndex = 0; carry = { tier: 0, spare: 0, charge: 100 };
    } else if (nextAction === "next") {
      levelIndex++;
    } // retry: pakai carry awal level
    loadLevel(levelIndex);
    running = true;
    menu.classList.add("hidden");
    msg = { text: "", until: 0 };
    updateHud();
    ensureAudio();
  }

  // ---------------- AUDIO ----------------
  function ensureAudio() {
    if (!soundOn) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (_) {}
  }

  function tone(freq, duration, type = "sine", volume = 0.04) {
    if (!soundOn) return;
    ensureAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
  }
  const creak = () => tone(110 + Math.random() * 30, .35, "sawtooth", .02);

  function updateHud() {
    const found = keys.filter(k => k.found).length;
    const hp = player ? player.hp : PLAYER_MAX_HP;
    const hearts = "♥".repeat(Math.max(0, hp)) + "♡".repeat(Math.max(0, PLAYER_MAX_HP - hp));
    keysLabel.textContent = `LEVEL ${levelIndex + 1}/${LEVELS.length}  KUNCI: ${found} / ${keys.length}  ${hearts}`;
    soundLabel.textContent = `SUARA: ${soundOn ? "ON" : "OFF"}`;
  }

  // ---------------- DUNIA ----------------
  function doorAt(c, r) { return doors.find(d => d.c === c && d.r === r); }

  function isWallAt(px, py) {
    const c = Math.floor(px / TILE), r = Math.floor(py / TILE);
    if (r < 0 || c < 0 || r >= map.length || c >= map[r].length) return true;
    const ch = map[r][c];
    if (ch !== ".") return true;           // dinding, lemari, loker
    const d = doorAt(c, r);
    return !!d && d.open < 0.65;           // pintu tertutup
  }

  function canMove(x, y, radius) {
    return !isWallAt(x-radius, y-radius) && !isWallAt(x+radius, y-radius) &&
           !isWallAt(x-radius, y+radius) && !isWallAt(x+radius, y+radius);
  }

  function moveEntity(entity, dx, dy, radius) {
    if (canMove(entity.x + dx, entity.y, radius)) entity.x += dx;
    if (canMove(entity.x, entity.y + dy, radius)) entity.y += dy;
  }

  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  const allKeysFound = () => keys.every(k => k.found);

  function los(a, b) {
    const d = distance(a, b), steps = Math.ceil(d / 8);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (isWallAt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false;
    }
    return true;
  }

  // BFS (pintu dianggap lantai karena bisa dibuka; lemari/loker/dinding penghalang)
  function bfs(c0, r0) {
    const f = Array.from({ length: map.length }, () => new Array(map[0].length).fill(-1));
    if (!map[r0] || map[r0][c0] !== ".") return f;
    const q = [[c0, r0]]; f[r0][c0] = 0;
    for (let i = 0; i < q.length; i++) {
      const [c, r] = q[i];
      for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nc = c + dc, nr = r + dr;
        if (nr < 0 || nc < 0 || nr >= map.length || nc >= map[nr].length) continue;
        if (map[nr][nc] !== "." || f[nr][nc] !== -1) continue;
        f[nr][nc] = f[r][c] + 1;
        q.push([nc, nr]);
      }
    }
    return f;
  }

  function pathStep(m, tx, ty, speed) {
    const tc = Math.floor(tx / TILE), tr = Math.floor(ty / TILE);
    const key = tc + "," + tr;
    if (m.fieldKey !== key) { m.field = bfs(tc, tr); m.fieldKey = key; }
    const c = Math.floor(m.x / TILE), r = Math.floor(m.y / TILE);
    const cur = m.field[r] ? m.field[r][c] : -1;
    let gx = tx, gy = ty;
    if (cur > 0) {
      let bestD = cur;
      for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const d = m.field[r + dr] ? m.field[r + dr][c + dc] : -1;
        if (d >= 0 && d < bestD) { bestD = d; gx = (c + dc + .5) * TILE; gy = (r + dr + .5) * TILE; }
      }
    }
    const dx = gx - m.x, dy = gy - m.y, len = Math.hypot(dx, dy) || 1;
    moveEntity(m, dx / len * speed, dy / len * speed, m.r);
  }

  // ---------------- INTERAKSI ----------------
  function findInteractable() {
    if (player.hidden) return { type: "unhide", obj: player.hidden, label: "E: KELUAR DARI LOKER" };
    const list = [];
    for (const k of keys) { const d = distance(player, k); if (!k.found && d < 42) list.push({ type: "key", obj: k, d, label: "E: AMBIL KUNCI" }); }
    for (const c of cabinets) { const d = distance(player, c); if (!c.opened && d < 56) list.push({ type: "cabinet", obj: c, d, label: "E: BUKA LEMARI" }); }
    for (const l of lockers) { const d = distance(player, l); if (d < 56) list.push({ type: "locker", obj: l, d, label: "E: BERSEMBUNYI" }); }
    for (const dr of doors) { const d = distance(player, dr); if (d < 52) list.push({ type: "door", obj: dr, d, label: dr.target ? "E: TUTUP PINTU" : "E: BUKA PINTU" }); }
    const de = distance(player, exit);
    if (de < 48) list.push({ type: "exit", obj: exit, d: de, label: allKeysFound() ? "E: KELUAR" : "PINTU TERKUNCI" });
    list.sort((a, b) => a.d - b.d);
    return list[0] || null;
  }

  function interact() {
    if (!running) return;
    const it = findInteractable();
    if (!it) return;
    switch (it.type) {
      case "key":
        it.obj.found = true;
        tone(660, .12, "triangle", .07);
        setTimeout(() => tone(880, .18, "triangle", .05), 90);
        updateHud();
        say(allKeysFound() ? "PINTU KELUAR TERBUKA" : "KUNCI DITEMUKAN");
        if (allKeysFound()) tone(440, .25, "sine", .06);
        break;
      case "cabinet": openCabinet(it.obj); break;
      case "locker": enterLocker(it.obj); break;
      case "unhide": exitLocker(); break;
      case "door": toggleDoor(it.obj); break;
      case "exit":
        if (allKeysFound()) finish(true);
        else { say(`PINTU TERKUNCI — CARI ${keys.length} KUNCI`); tone(100, .25, "square", .035); }
        break;
    }
  }

  function toggleDoor(d) {
    if (d.target) {
      // tidak bisa menutup kalau ada yang berdiri di pintu
      const blockers = [player, ...enemies].filter(e => distance(e, d) < 28);
      if (blockers.length) { say("ADA YANG MENGHALANGI PINTU"); return; }
      d.target = 0;
    } else d.target = 1;
    d.rate = .06;
    creak();
  }

  function openCabinet(c) {
    c.opened = true;
    tone(150, .25, "square", .03);
    switch (c.item) {
      case "battery":
        player.spare++; say("DAPAT BATERAI! TEKAN R UNTUK MEMASANG", 2600);
        tone(700, .15, "triangle", .06); break;
      case "weapon":
        if (player.tier < WEAPONS.length - 1) {
          player.tier++; say(`DAPAT ${WEAPONS[player.tier].name}!`, 2600);
          tone(520, .15, "triangle", .06); setTimeout(() => tone(780, .2, "triangle", .05), 120);
        } else say("LEMARI KOSONG");
        break;
      case "medkit":
        if (player.hp < PLAYER_MAX_HP) player.hp++;
        say("DAPAT P3K! NYAWA +1", 2200); tone(600, .2, "sine", .06); updateHud(); break;
      default: say("LEMARI KOSONG");
    }
  }

  function enterLocker(l) {
    const now = performance.now();
    player.hidden = l;
    player.hideFrom = { x: player.x, y: player.y };
    player.prevLight = player.lightOn;
    player.lightOn = false;
    player.x = l.x; player.y = l.y;
    player.moving = false; player.running = false;
    l.animUntil = now + 350;
    tone(130, .2, "square", .03);
    for (const m of enemies) {
      const d = distance(m, l);
      if (m.state === "chase" || (m.kind === "ghost" && m.active && d < 260)) {
        m.sawHide = true; m.state = "search"; m.lastSeen = { ...player.hideFrom };
        m.searchT = 0; m.discT = 0;
      } else m.sawHide = false;
    }
  }

  function exitLocker() {
    const l = player.hidden;
    if (!l) return;
    player.x = player.hideFrom.x; player.y = player.hideFrom.y;
    player.hidden = null;
    if (player.charge > 0) player.lightOn = player.prevLight;
    l.animUntil = performance.now() + 350;
    tone(130, .2, "square", .03);
  }

  function toggleLight() {
    if (!running || player.hidden) return;
    if (player.charge <= 0) { say("BATERAI HABIS — TEKAN R"); tone(90, .1, "square", .03); return; }
    player.lightOn = !player.lightOn;
    tone(player.lightOn ? 900 : 600, .05, "square", .03);
  }

  function useBattery() {
    if (!running || player.hidden) return;
    if (player.spare <= 0) { say("TIDAK PUNYA BATERAI CADANGAN"); return; }
    if (player.charge > 85) { say("BATERAI MASIH PENUH"); return; }
    player.spare--; player.charge = 100;
    say("BATERAI DIGANTI"); tone(500, .08, "square", .04);
    setTimeout(() => tone(750, .1, "square", .04), 80);
  }

  // ---------------- SERANGAN ----------------
  function attack() {
    if (!running || player.hidden) return;
    const now = performance.now();
    const wp = WEAPONS[player.tier];
    if (now - player.lastAttack < wp.cd) return;
    player.lastAttack = now;
    player.attackStart = now;
    tone(220 - player.tier * 30, .1, "square", .03);

    const aim = Math.atan2(player.faceY, player.faceX);
    for (const m of enemies) {
      if (m.hp <= 0 || !m.active) continue;
      const d = distance(player, m);
      if (d > wp.range + m.r) continue;
      const diff = wrapAngle(Math.atan2(m.y - player.y, m.x - player.x) - aim);
      if (Math.abs(diff) > ATTACK_ARC && d > 24) continue;

      m.hp -= wp.dmg;
      m.flash = now + 160;
      m.stun = now + 450 + wp.dmg * 100;
      if (m.kind === "guard" && m.state !== "chase") { m.state = "chase"; m.lastSeen = { x: player.x, y: player.y }; m.loseT = 0; }
      const nx = (m.x - player.x) / (d || 1), ny = (m.y - player.y) / (d || 1);
      for (let s = 0; s < 5 + wp.dmg * 2; s++) moveEntity(m, nx * 5, ny * 5, m.r);
      if (m.hp <= 0) { tone(120, .35, "sawtooth", .06); say(m.kind === "guard" ? "PENJAGA TUMBANG!" : "HANTU TUMBANG!"); }
      else tone(330, .1, "triangle", .06);
    }
    enemies = enemies.filter(m => m.hp > 0);
  }

  function finish(victory) {
    running = false;
    if (victory) carry = { tier: player.tier, spare: player.spare, charge: player.charge };
    const last = levelIndex === LEVELS.length - 1;
    menu.classList.remove("hidden");
    if (victory && !last) {
      nextAction = "next";
      title.textContent = `LEVEL ${levelIndex + 1} SELESAI`;
      copy.textContent = `Pintu terbuka. Tapi sekolah ini belum selesai denganmu… Level ${levelIndex + 2} menunggu, dengan lebih banyak penjaga.`;
      startBtn.textContent = `LEVEL ${levelIndex + 2}`;
      statusLabel.textContent = "LEVEL SELESAI";
    } else if (victory) {
      nextAction = "restart";
      title.textContent = "KAMU BERHASIL KELUAR";
      copy.textContent = "Kamu menamatkan kelima level. Pintu terakhir terbuka… tetapi suara langkah kaki masih terdengar.";
      startBtn.textContent = "MAIN DARI AWAL";
      statusLabel.textContent = "KAMU SELAMAT";
    } else {
      nextAction = "retry";
      title.textContent = "DIA MENEMUKANMU";
      copy.textContent = "Lorong menjadi sunyi. Terlalu sunyi. Coba lagi — bersembunyilah di loker, atur staminamu, dan jangan biarkan nyawamu habis.";
      startBtn.textContent = "ULANGI LEVEL";
      statusLabel.textContent = "GAME OVER";
    }
    if (victory) { tone(523, .22); setTimeout(() => tone(659, .25), 180); }
    else { tone(90, .65, "sawtooth", .08); }
  }

  // ---------------- GAMEPAD ----------------
  function pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
    if (!gp) return { dx: 0, dy: 0, run: false };

    let dx = 0, dy = 0;
    const deadzone = 0.2;
    if (Math.abs(gp.axes[0]) > deadzone) dx = gp.axes[0];
    if (Math.abs(gp.axes[1]) > deadzone) dy = gp.axes[1];
    const down = i => !!(gp.buttons[i] && gp.buttons[i].pressed);
    const edge = i => down(i) && !prevGamepadButtons[i];

    if (down(14)) dx = -1;
    if (down(15)) dx = 1;
    if (down(12)) dy = -1;
    if (down(13)) dy = 1;

    if (edge(0) || edge(2) || edge(5)) { if (!running) startBtn.click(); else interact(); } // A / X / R1
    if (edge(1) || edge(7)) attack();      // B / R2
    if (edge(3)) toggleLight();            // Y
    if (edge(4)) useBattery();             // L1
    if (edge(9)) { soundOn = !soundOn; updateHud(); if (soundOn) tone(500, .1); } // Start

    const run = down(6) || down(10);       // L2 / klik stick
    prevGamepadButtons = gp.buttons.map(b => b.pressed);
    return { dx, dy, run };
  }

  // ---------------- MUSUH ----------------
  function senses(m, d) {
    if (player.hidden) return false;
    if (m.kind === "ghost") return m.active;
    if (d < 64 && los(m, player)) return true;
    const R = player.lightOn ? 220 : 120;
    if (d < R) {
      const a = wrapAngle(Math.atan2(player.y - m.y, player.x - m.x) - m.face);
      if (Math.abs(a) < .7 && los(m, player)) return true;
    }
    return false;
  }

  function pullOut(m) {
    const now = performance.now();
    const l = player.hidden;
    exitLocker();
    player.hp--;
    player.invuln = now + 1500;
    m.state = "chase"; m.lastSeen = { x: player.x, y: player.y }; m.sawHide = false;
    tone(70, .4, "sawtooth", .08);
    say("KAMU DITEMUKAN!");
    updateHud();
    if (player.hp <= 0) finish(false);
  }

  function randomGoal() {
    const [c, r] = floorCells[Math.floor(Math.random() * floorCells.length)];
    return { x: (c + .5) * TILE, y: (r + .5) * TILE };
  }

  function updateEnemies(now, dt) {
    const foundCount = keys.filter(k => k.found).length;
    for (const m of enemies) {
      if (m.kind === "ghost" && !m.active) { if (foundCount >= 1) m.active = true; else continue; }
      m.anim += .12;
      const d = distance(player, m);
      const px = m.x, py = m.y;

      // buka pintu yang menghalangi
      for (const dr of doors) {
        if (!dr.target && distance(m, dr) < 40) { dr.target = 1; dr.rate = .025; creak(); }
      }

      // indra
      if (senses(m, d)) {
        if (m.state !== "chase" && m.kind === "guard") tone(300, .15, "square", .03);
        m.state = "chase"; m.lastSeen = { x: player.x, y: player.y }; m.loseT = 0;
      } else if (m.state === "chase") {
        m.loseT += dt;
        if (m.loseT > (m.kind === "ghost" ? .2 : 2.2)) { m.state = "search"; m.searchT = 0; m.discT = 0; }
      } else if (m.kind === "guard" && m.state === "patrol" && player.running && !player.hidden && d < 150) {
        m.state = "search"; m.lastSeen = { x: player.x, y: player.y }; m.searchT = 0; // mendengar suara lari
      }

      if (now > m.stun) {
        if (m.state === "chase") {
          const sp = m.kind === "ghost" ? m.speed + foundCount * .12 : m.speed * 1.35;
          pathStep(m, m.lastSeen.x, m.lastSeen.y, sp);
        } else if (m.state === "search") {
          const nearLocker = player.hidden && m.sawHide && distance(m, player.hidden) < 64;
          const arrived = distance(m, m.lastSeen) < 24 || nearLocker;
          if (!arrived) pathStep(m, m.lastSeen.x, m.lastSeen.y, m.speed * .85);
          else {
            m.searchT += dt;
            if (player.hidden && m.sawHide && distance(m, player.hidden) < 64) {
              m.discT += dt;
              if (m.discT > 1.3) { pullOut(m); if (!running) return; continue; }
            }
            if (m.searchT > 3) { m.state = "patrol"; m.goal = null; m.sawHide = false; }
          }
        } else { // patrol
          if (m.waitT > 0) m.waitT -= dt;
          else {
            if (!m.goal) m.goal = randomGoal();
            if (distance(m, m.goal) < 20) { m.goal = null; m.waitT = 1 + Math.random() * 1.5; }
            else pathStep(m, m.goal.x, m.goal.y, m.speed * .7);
          }
        }
      }

      const mvx = m.x - px, mvy = m.y - py;
      if (Math.hypot(mvx, mvy) > .05) m.face += wrapAngle(Math.atan2(mvy, mvx) - m.face) * .2;

      // sentuhan = damage
      if (!player.hidden && d < 25 && now > player.invuln && now > m.stun) {
        player.hp--;
        player.invuln = now + 1300;
        tone(70, .3, "sawtooth", .08);
        updateHud();
        const nx = (player.x - m.x) / (d || 1), ny = (player.y - m.y) / (d || 1);
        for (let s = 0; s < 5; s++) moveEntity(player, nx * 5, ny * 5, player.r);
        if (player.hp <= 0) { finish(false); return; }
      }
      if (m.kind === "ghost" && m.state === "chase" && d < 155 && now - lastScare > 1500) {
        tone(48 + Math.random() * 18, .24, "sawtooth", .025);
        lastScare = now;
      }
    }
  }

  // ---------------- UPDATE ----------------
  function update() {
    if (!running) { pollGamepad(); return; }
    const now = performance.now();
    const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;

    let dx = 0, dy = 0;
    if (pressed.arrowleft || pressed.a) dx--;
    if (pressed.arrowright || pressed.d) dx++;
    if (pressed.arrowup || pressed.w) dy--;
    if (pressed.arrowdown || pressed.s) dy++;

    const gp = pollGamepad();
    if (!running) return;
    if (gp.dx !== 0 || gp.dy !== 0) { dx = gp.dx; dy = gp.dy; }
    const runKey = !!pressed.shift || gp.run;

    if (player.hidden) {
      player.moving = false; player.running = false;
      player.stamina = Math.min(100, player.stamina + STAMINA_REGEN * dt);
      if (player.exhausted && player.stamina >= 30) player.exhausted = false;
      if (enemies.some(m => m.active && distance(m, player.hidden) < 170) && now - lastBeat > 700) {
        tone(55, .14, "sine", .06); lastBeat = now;
      }
    } else {
      player.moving = !!(dx || dy);
      const wantRun = player.moving && runKey && !player.exhausted && player.stamina > 0;
      player.running = wantRun;

      if (wantRun) {
        player.stamina -= STAMINA_DRAIN * dt;
        if (player.stamina <= 0) { player.stamina = 0; player.exhausted = true; say("KELELAHAN! ISTIRAHAT DULU"); }
      } else {
        player.stamina = Math.min(100, player.stamina + (player.moving ? STAMINA_REGEN * .6 : STAMINA_REGEN) * dt);
        if (player.exhausted && player.stamina >= 30) player.exhausted = false;
      }

      if (player.moving) {
        const len = Math.hypot(dx, dy);
        const nx = dx / (len > 1 ? len : 1), ny = dy / (len > 1 ? len : 1);
        const sp = player.speed * (wantRun ? RUN_MULT : 1) * (player.exhausted ? .8 : 1);
        moveEntity(player, nx * sp, ny * sp, player.r);
        player.faceX = dx / len; player.faceY = dy / len;
        player.animT += wantRun ? 1.7 : 1;
      } else player.animT = 0;

      if (player.lightOn) {
        player.charge -= (100 / BATTERY_LIFE) * dt;
        if (player.charge <= 0) { player.charge = 0; player.lightOn = false; say("BATERAI HABIS — TEKAN R", 2600); tone(80, .3, "sawtooth", .04); }
      }
    }

    // pintu
    for (const d of doors) {
      const diff = d.target - d.open;
      d.open += Math.sign(diff) * Math.min(Math.abs(diff), d.rate);
    }
    for (const c of cabinets) if (c.opened && c.open < 1) c.open = Math.min(1, c.open + .08);
    for (const l of lockers) {
      const tgt = now < l.animUntil ? 1 : 0;
      l.open += (tgt - l.open) * .25;
    }

    updateEnemies(now, dt);
    if (!running) return;

    if (distance(player, exit) < 35 && allKeysFound() && !player.hidden) finish(true);
  }

  // ---------------- GAMBAR ----------------
  function drawMap() {
    ctx.fillStyle = "#101513"; ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = (map[r] && map[r][c]) || "#";
        const x = c * TILE, y = r * TILE;
        if (cell === "#") {
          ctx.fillStyle = "#433e3a"; ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = "#555441"; ctx.fillRect(x+2, y+2, TILE-4, 4);
          ctx.fillStyle = "#171b18"; ctx.fillRect(x+3, y+TILE-6, TILE-6, 4);
          ctx.strokeStyle = "#202420"; ctx.strokeRect(x+.5, y+.5, TILE-1, TILE-1);
        } else {
          ctx.fillStyle = ((r+c)%2===0) ? "#252923" : "#222620";
          ctx.fillRect(x, y, TILE, TILE);
          ctx.strokeStyle = "#2b3029"; ctx.strokeRect(x+.5, y+.5, TILE-1, TILE-1);
          if ((r*7+c*3)%17===0) { ctx.fillStyle = "#414034"; ctx.fillRect(x+12,y+18,7,2); }
          if ((r*5+c*11)%29===0 && cell === "." && !doorAt(c, r)) {
            ctx.fillStyle="#493d30"; ctx.fillRect(x+7,y+10,25,18);
            ctx.fillStyle="#665441"; ctx.fillRect(x+9,y+7,21,5);
            ctx.fillStyle="#171a16"; ctx.fillRect(x+9,y+27,3,5); ctx.fillRect(x+27,y+27,3,5);
          }
        }
      }
    }
  }

  function drawDoor(d) {
    const x = d.c * TILE, y = d.r * TILE, o = d.open;
    ctx.save();
    // kusen
    ctx.fillStyle = "#15130f";
    ctx.fillRect(x, y, TILE, TILE);
    // daun pintu (mengecil ke engsel saat terbuka)
    if (d.spanH) {
      const w = TILE * (1 - o * .86);
      ctx.fillStyle = "#5a4329"; ctx.fillRect(x, y + 4, w, TILE - 8);
      ctx.fillStyle = "#6d5232"; ctx.fillRect(x, y + 4, w, 4);
      ctx.strokeStyle = "#3b2c1a"; ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + w * i / 4, y + 6); ctx.lineTo(x + w * i / 4, y + TILE - 6); ctx.stroke(); }
      ctx.fillStyle = "#d4c69b"; ctx.fillRect(x + w - 6, y + TILE / 2 - 1, 3, 3);
    } else {
      const h = TILE * (1 - o * .86);
      ctx.fillStyle = "#5a4329"; ctx.fillRect(x + 4, y, TILE - 8, h);
      ctx.fillStyle = "#6d5232"; ctx.fillRect(x + 4, y, 4, h);
      ctx.strokeStyle = "#3b2c1a"; ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + 6, y + h * i / 4); ctx.lineTo(x + TILE - 6, y + h * i / 4); ctx.stroke(); }
      ctx.fillStyle = "#d4c69b"; ctx.fillRect(x + TILE / 2 - 1, y + h - 6, 3, 3);
    }
    // engsel
    ctx.fillStyle = "#8d8a7a";
    if (d.spanH) { ctx.fillRect(x, y + 6, 3, 4); ctx.fillRect(x, y + TILE - 10, 3, 4); }
    else { ctx.fillRect(x + 6, y, 4, 3); ctx.fillRect(x + TILE - 10, y, 4, 3); }
    ctx.restore();
  }

  function drawCabinet(c) {
    const x = c.c * TILE, y = c.r * TILE, o = c.open;
    ctx.save();
    ctx.fillStyle = "#1a1d1e"; ctx.fillRect(x + 3, y + 2, TILE - 6, TILE - 4);        // bagian dalam
    const dw = (TILE - 6) / 2 * (1 - o * .85);
    ctx.fillStyle = "#4a5256"; ctx.fillRect(x + 3, y + 2, dw, TILE - 4);                // pintu kiri
    ctx.fillRect(x + TILE - 3 - dw, y + 2, dw, TILE - 4);                               // pintu kanan
    ctx.fillStyle = "#5c666b"; ctx.fillRect(x + 3, y + 2, dw, 3); ctx.fillRect(x + TILE - 3 - dw, y + 2, dw, 3);
    if (o < .5) { ctx.fillStyle = "#cfc7a8"; ctx.fillRect(x + TILE / 2 - 4, y + 18, 2, 6); ctx.fillRect(x + TILE / 2 + 2, y + 18, 2, 6); }
    ctx.strokeStyle = "#262b2d"; ctx.strokeRect(x + 3.5, y + 2.5, TILE - 7, TILE - 5);
    ctx.restore();
  }

  function drawLocker(l) {
    const x = l.c * TILE, y = l.r * TILE;
    const hiddenHere = player.hidden === l;
    ctx.save();
    ctx.fillStyle = "#1a2422"; ctx.fillRect(x + 5, y + 1, TILE - 10, TILE - 2);
    const dw = (TILE - 10) * (1 - l.open * .8);
    ctx.fillStyle = "#2f4a45"; ctx.fillRect(x + 5, y + 1, dw, TILE - 2);
    ctx.fillStyle = "#3b5d56"; ctx.fillRect(x + 5, y + 1, dw, 3);
    ctx.fillStyle = "#18201f";
    for (let i = 0; i < 4; i++) ctx.fillRect(x + 9, y + 6 + i * 3, Math.max(0, dw - 8), 1.5);
    ctx.fillStyle = "#c9c3b3"; ctx.fillRect(x + 5 + dw - 6, y + 20, 2, 5);
    if (hiddenHere && l.open < .3) { // celah intip
      ctx.fillStyle = "#050606"; ctx.fillRect(x + 11, y + 12, TILE - 22, 5);
      ctx.fillStyle = "#e6e2cf"; ctx.fillRect(x + 15, y + 13, 3, 2); ctx.fillRect(x + TILE - 18, y + 13, 3, 2);
    }
    ctx.restore();
  }

  function drawKey(k) {
    if (k.found) return;
    const pulse = 0.72 + Math.sin(performance.now()/180) * .18;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.shadowColor = "#e5c66d"; ctx.shadowBlur = 20;
    ctx.fillStyle = "#e5c66d";
    ctx.beginPath(); ctx.arc(k.x, k.y, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(k.x+3, k.y-2, 12, 4);
    ctx.fillRect(k.x+11, k.y-2, 3, 7);
    ctx.restore();
  }

  function drawExit() {
    const unlocked = allKeysFound();
    ctx.fillStyle = unlocked ? "#315f42" : "#54252a";
    ctx.fillRect(exit.x-17, exit.y-22, 34, 44);
    ctx.strokeStyle = unlocked ? "#75d18c" : "#9a4647";
    ctx.lineWidth = 3; ctx.strokeRect(exit.x-17, exit.y-22, 34, 44);
    ctx.fillStyle = "#d4c69b"; ctx.beginPath(); ctx.arc(exit.x+8, exit.y, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#c9c3b3"; ctx.font = "10px monospace"; ctx.textAlign="center";
    ctx.fillText(unlocked ? "KELUAR" : "TERKUNCI", exit.x, exit.y+34);
  }

  function drawGhost(m) {
    const hurt = performance.now() < m.flash;
    const wob = Math.sin(m.anim) * 2;
    ctx.save();
    ctx.translate(m.x, m.y + wob * .5);
    ctx.fillStyle = hurt ? "#ffffff" : "#080909";
    ctx.beginPath(); ctx.ellipse(0, 0, 13 + wob * .3, 18, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = hurt ? "#ff4040" : "#bd2730";
    ctx.shadowColor = "#d51d2a"; ctx.shadowBlur = 10;
    ctx.fillRect(-7,-5,4,3); ctx.fillRect(4,-5,4,3);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hurt ? "#ffffff" : "#050606"; ctx.lineWidth = 3;
    const sw = Math.sin(m.anim * 2) * 3;
    ctx.beginPath();
    ctx.moveTo(-7,12); ctx.lineTo(-12 + sw,20);
    ctx.moveTo(7,12); ctx.lineTo(13 - sw,20);
    ctx.stroke();
    if (m.hp < m.maxHp) {
      ctx.fillStyle = "#300"; ctx.fillRect(-14, -28, 28, 4);
      ctx.fillStyle = "#d33"; ctx.fillRect(-14, -28, 28 * (m.hp / m.maxHp), 4);
    }
    ctx.restore();
  }

  function drawGuard(m) {
    const hurt = performance.now() < m.flash;
    const walk = Math.sin(m.anim * 2.2) * 3;
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.beginPath(); ctx.ellipse(0, 13, 10, 4, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = hurt ? "#fff" : "#1f2a3d";
    ctx.fillRect(-5, 2, 4, 10 + walk * .3); ctx.fillRect(2, 2, 4, 10 - walk * .3);
    ctx.fillStyle = hurt ? "#fff" : "#2e3f5f"; ctx.fillRect(-8, -10, 16, 15);   // seragam
    ctx.fillStyle = "#b8a24a"; ctx.fillRect(-8, 1, 16, 2);                      // sabuk
    ctx.fillStyle = hurt ? "#fff" : "#d8c7a3"; ctx.fillRect(-5, -18, 10, 8);    // kepala
    ctx.fillStyle = hurt ? "#fff" : "#141b29"; ctx.fillRect(-6, -21, 12, 5); ctx.fillRect(-7, -17, 14, 2); // topi
    ctx.fillStyle = "#101010";
    const ex = Math.cos(m.face) * 2;
    ctx.fillRect(-4 + ex, -14, 2, 2); ctx.fillRect(2 + ex, -14, 2, 2);
    // senter di tangan
    ctx.save(); ctx.rotate(m.face);
    ctx.fillStyle = "#777"; ctx.fillRect(6, -2, 10, 4);
    ctx.restore();
    if (m.hp < m.maxHp) {
      ctx.fillStyle = "#300"; ctx.fillRect(-14, -30, 28, 4);
      ctx.fillStyle = "#d33"; ctx.fillRect(-14, -30, 28 * (m.hp / m.maxHp), 4);
    }
    ctx.restore();
  }

  function drawWeaponShape(tier, len) {
    ctx.lineCap = "round";
    if (tier === 0) {
      ctx.strokeStyle = "#7a5a37"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(len, 0); ctx.stroke();
    } else if (tier === 1) {
      ctx.strokeStyle = "#9aa3a8"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(len + 4, 0); ctx.stroke();
      ctx.strokeStyle = "#5b6266"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(len + 4, 0); ctx.stroke();
    } else {
      ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(len, 0); ctx.stroke();
      ctx.fillStyle = "#8a9094"; ctx.fillRect(len - 5, -8, 12, 16);
      ctx.fillStyle = "#5b6266"; ctx.fillRect(len - 5, -8, 12, 3);
    }
  }

  function drawPlayer() {
    if (player.hidden) return;
    const now = performance.now();
    if (now < player.invuln && Math.floor(now / 80) % 2 === 0) return;

    const aim = Math.atan2(player.faceY, player.faceX);
    const stride = player.running ? .42 : .32;
    const swing = Math.sin(player.animT * stride);
    const bob = player.moving ? Math.abs(swing) * (player.running ? -3 : -2) : Math.sin(now / 450) * .6;
    const lean = player.running ? 1.5 : 0;
    const atkP = (now - player.attackStart) / ATTACK_TIME;
    const attacking = atkP >= 0 && atkP <= 1;
    const wp = WEAPONS[player.tier];

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.beginPath(); ctx.ellipse(0, 12, 9, 3.5, 0, 0, Math.PI*2); ctx.fill();

    const legA = player.moving ? swing * (player.running ? 5 : 4) : 0;
    ctx.fillStyle = "#292b26";
    ctx.fillRect(-5, 1 + bob * .5, 4, 10 - Math.max(0, legA) * .3);
    ctx.fillRect(2, 1 + bob * .5, 4, 10 + Math.min(0, legA) * .3);
    ctx.fillRect(-5, 9 + legA * .5, 4, 3);
    ctx.fillRect(2, 9 - legA * .5, 4, 3);

    ctx.fillStyle = "#b8b6a6"; ctx.fillRect(-7 + player.faceX * lean, -9 + bob, 14, 17);
    ctx.fillStyle = "#a3a191";
    ctx.fillRect(-9, -7 + bob + (player.moving ? -swing * 2 : 0), 3, 9);
    ctx.fillStyle = "#e3d8bf"; ctx.fillRect(-5 + player.faceX * lean, -16 + bob, 10, 9);
    ctx.fillStyle = "#171a18";
    const ex = player.faceX * 2, ey = player.faceY * 1.5;
    ctx.fillRect(-4 + ex, -13 + bob + ey, 2, 2); ctx.fillRect(2 + ex, -13 + bob + ey, 2, 2);

    // senter di tangan (searah pandangan)
    ctx.save();
    ctx.translate(0, -2 + bob);
    ctx.rotate(aim - .55);
    ctx.fillStyle = "#555"; ctx.fillRect(4, -2, 11, 4);
    ctx.fillStyle = player.lightOn ? "#fff6c8" : "#2a2a2a"; ctx.fillRect(14, -2.5, 3, 5);
    ctx.restore();

    // alat pukul
    ctx.save();
    ctx.translate(0, -2 + bob);
    if (attacking) {
      const a = aim - ATTACK_ARC + 2 * ATTACK_ARC * atkP;
      ctx.strokeStyle = `rgba(230,225,190,${.5 * (1 - atkP)})`;
      ctx.lineWidth = 6 + player.tier * 2;
      ctx.beginPath(); ctx.arc(0, 0, wp.range * .8, aim - ATTACK_ARC, a); ctx.stroke();
      ctx.rotate(a);
      drawWeaponShape(player.tier, 32 + player.tier * 3);
      ctx.fillStyle = "#e3d8bf"; ctx.fillRect(2, -2, 6, 4);
    } else {
      ctx.rotate(aim + .9 + (player.moving ? swing * .15 : 0));
      drawWeaponShape(player.tier, 20);
      ctx.fillStyle = "#e3d8bf"; ctx.fillRect(2, -2, 5, 4);
    }
    ctx.restore();
    ctx.restore();
  }

  function drawLighting() {
    const now = performance.now();
    const a = Math.atan2(player.faceY, player.faceX);

    dctx.globalCompositeOperation = "source-over";
    dctx.clearRect(0, 0, W, H);
    dctx.fillStyle = "rgba(0,0,0,0.975)";
    dctx.fillRect(0, 0, W, H);
    dctx.globalCompositeOperation = "destination-out";

    const on = player.lightOn && !player.hidden;
    const ambR = on ? 46 : 30;
    const amb = dctx.createRadialGradient(player.x, player.y, 3, player.x, player.y, ambR);
    amb.addColorStop(0, `rgba(0,0,0,${on ? .95 : .7})`);
    amb.addColorStop(1, "rgba(0,0,0,0)");
    dctx.fillStyle = amb;
    dctx.beginPath(); dctx.arc(player.x, player.y, ambR, 0, Math.PI*2); dctx.fill();

    let len = 0;
    if (on) {
      let power = 1;
      if (player.charge < 25) power = Math.random() < .08 ? .35 : (.65 + player.charge / 100);
      len = BEAM_LENGTH * (1 + Math.sin(now / 90) * .015) * Math.min(1, power);
      const g = dctx.createRadialGradient(player.x, player.y, 10, player.x, player.y, len);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(.65, "rgba(0,0,0,0.85)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      dctx.fillStyle = g;
      dctx.beginPath();
      dctx.moveTo(player.x, player.y);
      dctx.arc(player.x, player.y, len, a - BEAM_HALF_ANGLE, a + BEAM_HALF_ANGLE);
      dctx.closePath();
      dctx.save();
      try { dctx.filter = "blur(5px)"; } catch (_) {}
      dctx.fill();
      dctx.restore();
    }
    dctx.globalCompositeOperation = "source-over";
    ctx.drawImage(darkCanvas, 0, 0);

    if (on) {
      const warm = ctx.createRadialGradient(player.x, player.y, 10, player.x, player.y, len);
      warm.addColorStop(0, "rgba(220,210,160,0.10)");
      warm.addColorStop(1, "rgba(220,210,160,0)");
      ctx.fillStyle = warm;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.arc(player.x, player.y, len, a - BEAM_HALF_ANGLE, a + BEAM_HALF_ANGLE);
      ctx.closePath(); ctx.fill();
    }

    ctx.fillStyle = "rgba(210,220,200,0.025)";
    for (let i = 0; i < 35; i++) {
      const x = (i*97 + Math.floor(now/18)) % W;
      const y = (i*53) % H;
      ctx.fillRect(x, y, 18, 1);
    }
  }

  // Senter penjaga selalu terlihat agar pemain bisa menghindar
  function drawGuardLights() {
    for (const m of enemies) {
      if (m.kind !== "guard") continue;
      const chase = m.state === "chase";
      const col = chase ? "255,110,90" : "255,235,170";
      const L = 210, half = .7;
      const g = ctx.createRadialGradient(m.x, m.y, 5, m.x, m.y, L);
      g.addColorStop(0, `rgba(${col},${chase ? .26 : .2})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(m.x, m.y);
      ctx.arc(m.x, m.y, L, m.face - half, m.face + half);
      ctx.closePath(); ctx.fill();
      ctx.save();
      ctx.fillStyle = `rgba(${col},.9)`; ctx.shadowColor = `rgb(${col})`; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(m.x + Math.cos(m.face) * 14, m.y + Math.sin(m.face) * 14, 3, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      if (chase) { ctx.fillStyle = "#ff5a4a"; ctx.font = "bold 16px monospace"; ctx.textAlign = "center"; ctx.fillText("!", m.x, m.y - 30); }
      else if (m.state === "search") { ctx.fillStyle = "#e5c66d"; ctx.font = "bold 16px monospace"; ctx.textAlign = "center"; ctx.fillText("?", m.x, m.y - 30); }
    }
  }

  function bar(x, y, w, label, v, color) {
    ctx.fillStyle = "#c9c3b3"; ctx.font = "9px monospace"; ctx.textAlign = "left";
    ctx.fillText(label, x, y - 2);
    ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fillRect(x, y, w, 8);
    ctx.fillStyle = color; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, v)), 8);
    ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w - 1, 7);
  }

  function drawHud() {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(0, 0, W, 34);
    bar(12, 18, 120, player.exhausted ? "STAMINA (LELAH)" : "STAMINA [SHIFT]", player.stamina / 100, player.exhausted ? "#c0392b" : "#6bbf7a");
    bar(160, 18, 120, `SENTER [F] ${player.lightOn ? "ON" : "OFF"}`, player.charge / 100, player.charge < 25 ? "#c0392b" : "#e5c66d");
    ctx.fillStyle = "#e5c66d"; ctx.font = "11px monospace"; ctx.textAlign = "left";
    ctx.fillText(`BATERAI x${player.spare} [R]`, 296, 26);
    ctx.fillStyle = "#c9c3b3";
    ctx.fillText(`PUKUL: ${WEAPONS[player.tier].name}`, 420, 26);
    ctx.fillStyle = "#d4515a"; ctx.font = "14px monospace";
    ctx.fillText("♥".repeat(Math.max(0, player.hp)) + "♡".repeat(PLAYER_MAX_HP - Math.max(0, player.hp)), 610, 26);
    ctx.fillStyle = "#c9c3b3"; ctx.font = "11px monospace"; ctx.textAlign = "right";
    ctx.fillText(`LEVEL ${levelIndex + 1}/${LEVELS.length}   KUNCI ${keys.filter(k => k.found).length}/${keys.length}`, W - 12, 26);
    ctx.restore();
  }

  function render() {
    drawMap();
    drawExit();
    cabinets.forEach(drawCabinet);
    lockers.forEach(drawLocker);
    doors.forEach(drawDoor);
    keys.forEach(drawKey);
    enemies.forEach(m => { if (m.active) (m.kind === "guard" ? drawGuard(m) : drawGhost(m)); });
    drawPlayer();
    drawLighting();
    drawGuardLights();
    drawPlayer();

    // mata hantu terlihat dari dekat tanpa menerangi area
    enemies.forEach(m => {
      if (m.kind === "ghost" && m.active && distance(player, m) < 110) {
        ctx.save();
        ctx.fillStyle = "#d51d2a"; ctx.shadowColor = "#d51d2a"; ctx.shadowBlur = 8;
        ctx.fillRect(m.x-7, m.y-5, 4, 3); ctx.fillRect(m.x+4, m.y-5, 4, 3);
        ctx.restore();
      }
    });

    if (player.hidden) { // vinyet saat bersembunyi
      const v = ctx.createRadialGradient(W/2, H/2, 120, W/2, H/2, 560);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.65)");
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    }
    drawHud();

    if (running) {
      const now = performance.now();
      const it = findInteractable();
      const danger = enemies.some(m => m.active && m.state === "chase" && distance(player, m) < 260);
      if (now < msg.until) statusLabel.textContent = msg.text;
      else if (player.hidden) statusLabel.textContent = "BERSEMBUNYI — DIAM… (E UNTUK KELUAR)";
      else if (it) statusLabel.textContent = it.label;
      else if (danger) statusLabel.textContent = "DIKEJAR! LARI (SHIFT), SEMBUNYI, ATAU PUKUL (SPASI)";
      else statusLabel.textContent = "CARI JALAN KELUAR";
    }
  }

  function loop() {
    update();
    if (player) render();
    requestAnimationFrame(loop);
  }

  // ---------------- INPUT ----------------
  document.addEventListener("keydown", e => {
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
    pressed[k] = true;
    if (e.repeat) return;
    if (k === "e") interact();
    if (k === " " || k === "j") attack();
    if (k === "f") toggleLight();
    if (k === "r") useBattery();
    if (k === "m") { soundOn = !soundOn; updateHud(); if (soundOn) tone(500, .1); }
  });
  document.addEventListener("keyup", e => { pressed[e.key.toLowerCase()] = false; });
  window.addEventListener("blur", () => { for (const k in pressed) pressed[k] = false; });

  startBtn.addEventListener("click", () => {
    title.textContent = "KAMU TERLAMBAT PULANG";
    copy.textContent = "Cari semua kunci, lalu temukan pintu keluar. WASD/Panah: gerak · Shift: lari · E: pintu, lemari, loker (sembunyi), kunci · Spasi/J: pukul · F: senter · R: ganti baterai.";
    resetGame();
    startBtn.textContent = "MULAI BERMAIN";
  });

  loadLevel(0);
  updateHud();
  loop();
})();