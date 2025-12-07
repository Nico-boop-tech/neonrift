const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');
let keys={};
let player={x:100,y:300,w:30,h:30,vy:0,onGround:false,canDouble:true};
let gravity=0.5;
let dashTimer=0;

const music=document.getElementById('musicLoop');
const sfxJump=document.getElementById('sfxJump');
const sfxDouble=document.getElementById('sfxDouble');
const sfxDash=document.getElementById('sfxDash');

document.getElementById('btnPlay').onclick=()=>startGame();
document.getElementById('btnTutorial').onclick=()=>show(tutorial);
document.getElementById('btnSettings').onclick=()=>show(settingsMenu);
document.getElementById('btnBack').onclick=()=>show(mainMenu);
document.getElementById('btnBack2').onclick=()=>show(mainMenu);

document.getElementById('musicToggle').onchange=e=>{
    if(e.target.checked) music.play();
    else music.pause();
};

function show(m){
    document.querySelectorAll('.menu').forEach(x=>x.classList.add('hidden'));
    canvas.classList.add('hidden');
    m.classList.remove('hidden');
}

function startGame(){
    document.querySelectorAll('.menu').forEach(x=>x.classList.add('hidden'));
    canvas.classList.remove('hidden');
    music.volume=0.3;
    music.play();
    loop();
}

window.onkeydown=e=>keys[e.key.toLowerCase()]=true;
window.onkeyup=e=>keys[e.key.toLowerCase()]=false;

function physics(){
    // horizontal
    if(keys['a']) player.x-=4;
    if(keys['d']) player.x+=4;

    // dash
    if(keys['shift'] && dashTimer<=0){
        player.x+= keys['a'] ? -40 : 40;
        dashTimer=20;
        sfxDash.play();
    }
    dashTimer--;

    // gravity
    player.vy+=gravity;
    player.y+=player.vy;

    // ground
    if(player.y+player.h>=420){
        player.y=420-player.h;
        player.vy=0;
        player.onGround=true;
        player.canDouble=true;
    } else player.onGround=false;

    // jump + double
    if(keys[' '] && player.onGround){
        player.vy=-10;
        sfxJump.play();
    } else if(keys[' '] && !player.onGround && player.canDouble){
        player.vy-=10; // true double jump
        player.canDouble=false;
        sfxDouble.play();
    }
}

function draw(){
    ctx.clearRect(0,0,800,450);
    ctx.fillStyle='#0ff';
    ctx.fillRect(player.x,player.y,player.w,player.h);

    // ground
    ctx.fillStyle='#444';
    ctx.fillRect(0,420,800,30);
}

function loop(){
    physics();
    draw();
    requestAnimationFrame(loop);
}
