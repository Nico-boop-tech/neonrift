// Neon Rift - minimal game logic (double jump fixed)
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const music = document.getElementById('music');
const sfxJump = document.getElementById('sfxJump');
const sfxDouble = document.getElementById('sfxDouble');
const sfxDash = document.getElementById('sfxDash');
const sfxCollect = document.getElementById('sfxCollect');

// UI elements
const menu = document.getElementById('menu');
const settingsPanel = document.getElementById('settingsPanel');
const tutorialPanel = document.getElementById('tutorialPanel');
const playBtn = document.getElementById('play');
const tutBtn = document.getElementById('tutorial');
const setBtn = document.getElementById('settings');
const backFromSettings = document.getElementById('backFromSettings');
const backFromTut = document.getElementById('backFromTut');
const musicToggle = document.getElementById('musicToggle');

playBtn.addEventListener('click', ()=>{ menu.classList.add('hidden'); startGame(); playClick(); });
tutBtn.addEventListener('click', ()=>{ tutorialPanel.classList.remove('hidden'); playClick(); });
setBtn.addEventListener('click', ()=>{ settingsPanel.classList.remove('hidden'); playClick(); });
backFromSettings.addEventListener('click', ()=>{ settingsPanel.classList.add('hidden'); });
backFromTut.addEventListener('click', ()=>{ tutorialPanel.classList.add('hidden'); });

musicToggle.addEventListener('change', ()=>{
  if(musicToggle.checked){ music.volume=0.25; music.play(); } else { music.pause(); }
});

function playClick(){ try{ sfxDash.currentTime=0; sfxDash.play(); }catch(e){} }

// input
const keys = {};
window.addEventListener('keydown',(e)=>{ keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup',(e)=>{ keys[e.key.toLowerCase()] = false; });

// player
const player = { x:120, y:300, w:32, h:48, vx:0, vy:0, speed:220, onGround:false, jumps:0, maxJumps:2, dashCd:0 };
const floorY = 420;
const collectibles = [{x:400,y:floorY-60,picked:false},{x:700,y:floorY-140,picked:false}];
let fragments = 0;
let running = false;
let last = performance.now();

function startGame(){ running = true; if(musicToggle.checked){ try{ music.currentTime=0; music.play(); }catch(e){} } canvas.focus(); requestAnimationFrame(loop); }

function loop(now){ const dt = Math.min(0.033,(now-last)/1000); last=now; update(dt); render(); if(running) requestAnimationFrame(loop); }

function update(dt){
  // horizontal
  let ax=0; if(keys['a']) ax-=1; if(keys['d']) ax+=1;
  player.vx = ax * player.speed;
  player.x += player.vx * dt;

  // jump & double jump: additive impulse
  if((keys[' '] || keys['w']) && player.jumps < player.maxJumps){
    if(player.onGround){
      player.vy = -420; player.onGround=false; player.jumps=1; try{sfxJump.currentTime=0; sfxJump.play();}catch(e){}
    } else if(player.jumps < player.maxJumps){
      player.vy -= 380; player.jumps=2; try{sfxDouble.currentTime=0; sfxDouble.play();}catch(e){}
    }
    keys[' '] = false; keys['w'] = false;
  }

  // dash
  if(keys['shift'] && player.dashCd <= 0){
    player.x += (ax===0? 200 : (ax>0? 160:-160));
    player.dashCd = 0.9; try{sfxDash.currentTime=0; sfxDash.play();}catch(e){}
  }
  player.dashCd = Math.max(0, player.dashCd - dt);

  // gravity
  player.vy += 1500 * dt;
  player.y += player.vy * dt;

  // ground check
  if(player.y + player.h >= floorY){ player.y = floorY - player.h; player.vy = 0; player.onGround = true; player.jumps = 0; } else player.onGround = false;

  // collectibles
  collectibles.forEach(c=>{ if(c.picked) return; const d=Math.hypot(player.x - c.x, player.y - c.y); if(d<40){ c.picked=true; fragments++; try{sfxCollect.currentTime=0; sfxCollect.play();}catch(e){} } });
}

function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // background
  ctx.fillStyle='#03121a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  // ground
  ctx.fillStyle='#0d2a20'; ctx.fillRect(0,floorY,canvas.width,120);
  // collectibles
  collectibles.forEach(c=>{ if(c.picked) return; ctx.fillStyle='cyan'; ctx.beginPath(); ctx.arc(c.x, c.y, 10,0,Math.PI*2); ctx.fill(); });
  // player
  ctx.fillStyle='#cde'; ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = '#00d8ff'; ctx.fillRect(player.x+4, player.y+6, player.w-8, 8);
  // HUD
  ctx.fillStyle='white'; ctx.font='14px monospace'; ctx.fillText('Fragments: '+fragments, 12, 22);
}
