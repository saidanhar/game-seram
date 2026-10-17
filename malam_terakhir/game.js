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

  // # = dinding, . = lantai. Ubah susunan ini untuk mengubah peta.
  const mapText = [
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
  ];

  // Peta dirender memenuhi kanvas dengan sel 40x40; baris/kolom tambahan
  // di tepi dianggap dinding untuk menjaga karakter tetap di area permainan.
  const map = mapText.map(row => row.split(""));
  const keys = [
    { x: 3.5 * TILE, y: 2.5 * TILE, found: false },
    { x: 19.5 * TILE, y: 8.5 * TILE, found: false },
    { x: 12.5 * TILE, y: 13.5 * TILE, found: false }
  ];
  const exit = { x: 22.5 * TILE, y: 13.5 * TILE };

  let player, monster, running = false, won = false, gameOver = false;
  let soundOn = true, audioCtx = null, lastScare = 0;
  const pressed = Object.create(null);

  function resetGame() {
    player = { x: 2.5 * TILE, y: 4.5 * TILE, r: 10, speed: 2.35, faceX: 1, faceY: 0 };
    monster = { x: 20.5 * TILE, y: 4.5 * TILE, r: 13, speed: 1.02, active: false };
    keys.forEach(k => k.found = false);
    running = true; won = false; gameOver = false;
    menu.classList.add("hidden");
    statusLabel.textContent = "CARI JALAN KELUAR";
    updateHud();
    ensureAudio();
  }

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

  function updateHud() {
    const found = keys.filter(k => k.found).length;
    keysLabel.textContent = `KUNCI: ${found} / 3`;
    soundLabel.textContent = `SUARA: ${soundOn ? "ON" : "OFF"}`;
  }

  function isWallAt(px, py) {
    const c = Math.floor(px / TILE), r = Math.floor(py / TILE);
    if (r < 0 || c < 0 || r >= map.length || c >= map[r].length) return true;
    return map[r][c] === "#";
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

  function interact() {
    if (!running) return;
    for (const k of keys) {
      if (!k.found && distance(player, k) < 42) {
        k.found = true;
        tone(660, .12, "triangle", .07);
        setTimeout(() => tone(880, .18, "triangle", .05), 90);
        updateHud();
        statusLabel.textContent = "KUNCI DITEMUKAN";
        if (keys.every(item => item.found)) {
          statusLabel.textContent = "PINTU KELUAR TERBUKA";
          tone(440, .25, "sine", .06);
        }
        return;
      }
    }
    if (distance(player, exit) < 48) {
      if (keys.every(k => k.found)) finish(true);
      else {
        statusLabel.textContent = "PINTU TERKUNCI — CARI 3 KUNCI";
        tone(100, .25, "square", .035);
      }
    }
  }

  function finish(victory) {
    running = false; won = victory; gameOver = !victory;
    menu.classList.remove("hidden");
    title.textContent = victory ? "KAMU BERHASIL KELUAR" : "DIA MENEMUKANMU";
    copy.textContent = victory
      ? "Pintu terbuka. Kamu berhasil meninggalkan sekolah itu… tetapi suara langkah kaki masih terdengar."
      : "Lorong menjadi sunyi. Terlalu sunyi. Coba lagi, kumpulkan semua kunci, dan jangan biarkan dia mendekat.";
    startBtn.textContent = "MAIN LAGI";
    statusLabel.textContent = victory ? "KAMU SELAMAT" : "GAME OVER";
    if (victory) { tone(523, .22); setTimeout(() => tone(659, .25), 180); }
    else { tone(90, .65, "sawtooth", .08); }
  }

  function update() {
    if (!running) return;
    let dx = 0, dy = 0;
    if (pressed.ArrowLeft || pressed.a || pressed.A) dx--;
    if (pressed.ArrowRight || pressed.d || pressed.D) dx++;
    if (pressed.ArrowUp || pressed.w || pressed.W) dy--;
    if (pressed.ArrowDown || pressed.s || pressed.S) dy++;
    if (dx || dy) {
      const len = Math.hypot(dx, dy); dx /= len; dy /= len;
      moveEntity(player, dx * player.speed, dy * player.speed, player.r);
      player.faceX = dx; player.faceY = dy;
    }

    const foundCount = keys.filter(k => k.found).length;
    if (foundCount >= 1) monster.active = true;
    if (monster.active) {
      const mx = player.x - monster.x, my = player.y - monster.y;
      const len = Math.hypot(mx, my) || 1;
      // Monster bergerak langsung menuju pemain; dinding tetap memperlambatnya.
      const chaseSpeed = monster.speed + foundCount * .12;
      moveEntity(monster, (mx / len) * chaseSpeed, (my / len) * chaseSpeed, monster.r);
      if (distance(player, monster) < 25) finish(false);
      if (distance(player, monster) < 155 && performance.now() - lastScare > 1500) {
        tone(48 + Math.random() * 18, .24, "sawtooth", .025);
        lastScare = performance.now();
      }
    }
    if (distance(player, exit) < 35 && keys.every(k => k.found)) finish(true);
  }

  function drawMap() {
    ctx.fillStyle = "#101513"; ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < H / TILE; r++) {
      for (let c = 0; c < W / TILE; c++) {
        const cell = (map[r] && map[r][c]) || "#";
        const x = c * TILE, y = r * TILE;
        if (cell === "#") {
          ctx.fillStyle = "#292d29"; ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = "#353a34"; ctx.fillRect(x+2, y+2, TILE-4, 4);
          ctx.fillStyle = "#171b18"; ctx.fillRect(x+3, y+TILE-6, TILE-6, 4);
          ctx.strokeStyle = "#202420"; ctx.strokeRect(x+.5, y+.5, TILE-1, TILE-1);
        } else {
          ctx.fillStyle = ((r+c)%2===0) ? "#252923" : "#222620";
          ctx.fillRect(x, y, TILE, TILE);
          ctx.strokeStyle = "#2b3029"; ctx.strokeRect(x+.5, y+.5, TILE-1, TILE-1);
          if ((r*7+c*3)%17===0) {
            ctx.fillStyle = "#414034"; ctx.fillRect(x+12,y+18,7,2);
          }
        }
      }
    }
    // Hiasan: bangku kelas
    [[5,2],[9,4],[15,2],[17,10],[4,12],[19,12]].forEach(([c,r]) => {
      const x=c*TILE, y=r*TILE;
      ctx.fillStyle="#493d30"; ctx.fillRect(x+7,y+10,25,18);
      ctx.fillStyle="#665441"; ctx.fillRect(x+9,y+7,21,5);
      ctx.fillStyle="#171a16"; ctx.fillRect(x+9,y+27,3,5); ctx.fillRect(x+27,y+27,3,5);
    });
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
    const unlocked = keys.every(k => k.found);
    ctx.fillStyle = unlocked ? "#315f42" : "#54252a";
    ctx.fillRect(exit.x-17, exit.y-22, 34, 44);
    ctx.strokeStyle = unlocked ? "#75d18c" : "#9a4647";
    ctx.lineWidth = 3; ctx.strokeRect(exit.x-17, exit.y-22, 34, 44);
    ctx.fillStyle = "#d4c69b"; ctx.beginPath(); ctx.arc(exit.x+8, exit.y, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#c9c3b3"; ctx.font = "10px monospace"; ctx.textAlign="center";
    ctx.fillText(unlocked ? "KELUAR" : "TERKUNCI", exit.x, exit.y+34);
  }

  function drawCharacter(entity, isMonster=false) {
    ctx.save();
    ctx.translate(entity.x, entity.y);
    if (isMonster) {
      ctx.fillStyle = "#080909";
      ctx.beginPath(); ctx.ellipse(0, 0, 13, 18, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#bd2730";
      ctx.shadowColor = "#d51d2a"; ctx.shadowBlur = 10;
      ctx.fillRect(-7,-5,4,3); ctx.fillRect(4,-5,4,3);
      ctx.shadowBlur = 0;
      ctx.strokeStyle="#050606"; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(-7,12); ctx.lineTo(-12,20); ctx.moveTo(7,12); ctx.lineTo(13,20); ctx.stroke();
    } else {
      ctx.fillStyle="#b8b6a6"; ctx.fillRect(-7,-9,14,17);
      ctx.fillStyle="#e3d8bf"; ctx.fillRect(-5,-15,10,9);
      ctx.fillStyle="#292b26"; ctx.fillRect(-5,1,4,10); ctx.fillRect(2,1,4,10);
      ctx.fillStyle="#171a18"; ctx.fillRect(-4,-13,2,2); ctx.fillRect(2,-13,2,2);
      ctx.fillStyle="#e6d8a3"; ctx.beginPath(); ctx.arc(entity.faceX*9, entity.faceY*9, 3,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawLighting() {
    // Gelapkan seluruh ruangan, lalu buat lingkaran cahaya senter.
    const darkness = ctx.createRadialGradient(player.x, player.y, 42, player.x, player.y, 250);
    darkness.addColorStop(0, "rgba(0,0,0,0.12)");
    darkness.addColorStop(.45, "rgba(0,0,0,0.55)");
    darkness.addColorStop(1, "rgba(0,0,0,0.96)");
    ctx.fillStyle = darkness; ctx.fillRect(0,0,W,H);

    // Sedikit arah cahaya di depan pemain.
    const lx = player.x + player.faceX*45, ly = player.y + player.faceY*45;
    const beam = ctx.createRadialGradient(lx,ly,8,lx,ly,165);
    beam.addColorStop(0,"rgba(204,202,164,0.12)");
    beam.addColorStop(1,"rgba(204,202,164,0)");
    ctx.fillStyle=beam; ctx.fillRect(0,0,W,H);

    // Efek noise tipis untuk suasana VHS.
    ctx.fillStyle="rgba(210,220,200,0.025)";
    for(let i=0;i<35;i++) {
      const x=(i*97 + Math.floor(performance.now()/18))%W;
      const y=(i*53)%H;
      ctx.fillRect(x,y,18,1);
    }
  }

  function render() {
    drawMap();
    drawExit();
    keys.forEach(drawKey);
    if (monster && monster.active) drawCharacter(monster, true);
    if (player) {
      drawCharacter(player);
      drawLighting();
      // Gambar karakter lagi agar selalu terlihat di pusat cahaya.
      drawCharacter(player);
      if (monster && monster.active && distance(player, monster) < 180) drawCharacter(monster, true);
    }
    if (running) {
      const nearbyKey = keys.some(k => !k.found && distance(player,k)<42);
      const nearExit = distance(player,exit)<48;
      if (nearbyKey) statusLabel.textContent = "TEKAN E UNTUK AMBIL KUNCI";
      else if (nearExit && !keys.every(k=>k.found)) statusLabel.textContent = "PINTU TERKUNCI";
      else if (monster.active && distance(player,monster)<180) statusLabel.textContent = "LARI!";
      else statusLabel.textContent = "CARI JALAN KELUAR";
    }
  }

  function loop() {
    update();
    if (player) render();
    requestAnimationFrame(loop);
  }

  document.addEventListener("keydown", e => {
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
    pressed[e.key] = true;
    if (e.key.toLowerCase() === "e" && !e.repeat) interact();
    if (e.key.toLowerCase() === "m" && !e.repeat) {
      soundOn = !soundOn; updateHud();
      if (soundOn) tone(500,.1);
    }
  });
  document.addEventListener("keyup", e => { pressed[e.key] = false; });
  startBtn.addEventListener("click", () => {
    title.textContent = "KAMU TERLAMBAT PULANG";
    copy.textContent = "Cari 3 kunci di sekolah tua ini, lalu temukan pintu keluar. Sesuatu sedang mengikutimu.";
    startBtn.textContent = "MULAI BERMAIN";
    resetGame();
  });

  // Tampilkan layar menu dan gambar awal sebelum permainan dimulai.
  player = { x: 2.5*TILE, y: 4.5*TILE, r: 10, speed: 2.35, faceX:1, faceY:0 };
  monster = { x: 20.5*TILE, y: 4.5*TILE, r: 13, speed: 1.02, active:false };
  updateHud();
  loop();
})();
