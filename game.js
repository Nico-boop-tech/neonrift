const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const tutPanel = document.getElementById("tutorialPanel");
const startBtn = document.getElementById("start");
const tutBtn = document.getElementById("tutorial");
const backBtn = document.getElementById("back");

startBtn.onclick = () => { menu.classList.add("hidden"); startGame(); };
tutBtn.onclick = () => tutPanel.classList.remove("hidden");
backBtn.onclick = () => tutPanel.classList.add("hidden");

const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

let running = false;

const player = {
    x:100, y:300,
    w:30, h:50,
    vx:0, vy:0,
    speed:220,
    jumps:0,
    maxJumps:2,
    onGround:false,
    dashCd:0
};

const floorY = 480;

const fragments = [
    {x:400,y:430,picked:false},
    {x:650,y:380,picked:false},
    {x:850,y:420,picked:false}
];

let collected = 0;
let last = performance.now();

function startGame(){
    running = true;
    requestAnimationFrame(loop);
}

function loop(ts){
    const dt = (ts-last)/1000;
    last = ts;

    update(dt);
    draw();

    if(running) requestAnimationFrame(loop);
}

function update(dt){
    let ax = 0;
    if(keys["a"]) ax -= 1;
    if(keys["d"]) ax += 1;
    player.vx = ax * player.speed;
    player.x += player.vx * dt;

    if(keys[" "] || keys["w"]){
        if(player.onGround){
            player.vy = -420;
            player.onGround = false;
            player.jumps = 1;
        }
        else if(player.jumps < player.maxJumps){
            player.vy -= 350;
            player.jumps = 2;
        }
        keys[" "] = false;
        keys["w"] = false;
    }

    if(keys["shift"] && player.dashCd <= 0){
        player.x += (ax === 0 ? 200 : ax * 200);
        player.dashCd = 0.8;
    }
    player.dashCd -= dt;

    player.vy += 1500 * dt;
    player.y += player.vy * dt;

    if(player.y + player.h >= floorY){
        player.y = floorY - player.h;
        player.vy = 0;
        player.onGround = true;
        player.jumps = 0;
    } else {
        player.onGround = false;
    }

    fragments.forEach(f => {
        if(f.picked) return;
        const d = Math.hypot(player.x - f.x, player.y - f.y);
        if(d < 40){
            f.picked = true;
            collected++;
        }
    });
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#03121a";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#083020";
    ctx.fillRect(0,floorY,canvas.width,canvas.height-floorY);

    fragments.forEach(f=>{
        if(f.picked) return;
        ctx.fillStyle = "#0ef";
        ctx.beginPath();
        ctx.arc(f.x,f.y,10,0,Math.PI*2);
        ctx.fill();
    });

    ctx.fillStyle = "#fff";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillStyle = "#0ef";
    ctx.font = "20px Arial";
    ctx.fillText("Frammenti: "+collected, 20, 30);
}
