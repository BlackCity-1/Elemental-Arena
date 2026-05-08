const spiritImages = {

불: new Image(),
물: new Image(),
바람: new Image(),
땅: new Image(),
전기: new Image(),
고대: new Image()

};

spiritImages.불.src = "images/spirit_fire.png";
spiritImages.물.src = "images/spirit_water.png";
spiritImages.바람.src = "images/spirit_wind.png";
spiritImages.땅.src = "images/spirit_earth.png";
spiritImages.전기.src = "images/spirit_electric.png";
spiritImages.고대.src = "images/spirit_ancient.png";

function checkCombine(){

let merged=true;

while(merged){

merged=false;

for(let i=0;i<spirits.length;i++){

for(let j=i+1;j<spirits.length;j++){

const a=spirits[i];
const b=spirits[j];

if(
a.element===b.element &&
a.tier===b.tier &&
a.tier<7
){

a.tier++;

a.damage=Math.floor(a.damage*1.45);

a.range+=15;

a.attackSpeed=
Math.max(5,a.attackSpeed-2);

spirits.splice(j,1);

showNotice(`${a.element} 합성!`);

merged=true;

break;

}

if(
a.tier===7 &&
b.tier===7 &&
a.element!==b.element
){

a.element="고대";

a.tier=8;

a.damage=50;

a.range=320;

a.attackSpeed=8;

spirits.splice(j,1);

showNotice("🌌 고대 정령 탄생");

merged=true;

break;

}

}

if(merged) break;

}

}

updateUI();

}

const GAME_STATE={
MENU:"menu",
DEFENSE:"defense",
GAMEOVER:"gameover"
};

let currentMode=GAME_STATE.MENU;

const menu=document.getElementById("menu");
const gameUI=document.getElementById("gameUI");

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

function resizeCanvas(){

const ratio = 1100 / 620;

let w = window.innerWidth * 0.95;
let h = w / ratio;

if(h > window.innerHeight * 0.9){

h = window.innerHeight * 0.9;
w = h * ratio;

}

canvas.style.width = w + "px";
canvas.style.height = h + "px";

}

resizeCanvas();

window.addEventListener("resize",resizeCanvas);

const bgImage = new Image();

bgImage.src = "images/background.png";

const popup=document.getElementById("popup");
const popupInfo=document.getElementById("popupInfo");

const notice=document.getElementById("notice");

const gameOverScreen=
document.getElementById("gameOverScreen");

let selectedSpirit=null;
let movingSpirit=null;

let spawnLoop=null;
let waveLoop=null;

let bossSpawned = false;

let gameSpeed=1;

let rankings=
JSON.parse(localStorage.getItem("EA_RANKING") || "[]");

const player={
name:
localStorage.getItem("EA_NAME") || "",
gold:30,
wave:1,
kills:0,
coreHp:100
};

const path=[
{x:40,y:560},
{x:200,y:560},
{x:200,y:120},
{x:420,y:120},
{x:420,y:500},
{x:650,y:500},
{x:650,y:180},
{x:900,y:180},
{x:900,y:420},
{x:1050,y:420},
];

const summonSpots=[
{x:140,y:500},
{x:260,y:200},
{x:350,y:70},
{x:480,y:220},
{x:560,y:560},
{x:720,y:120},
{x:820,y:540},
{x:980,y:260},
{x:760,y:320},
{x:320,y:350},
{x:600,y:320},
{x:900,y:540},
{x:150,y:350},
{x:500,y:60},
{x:1030,y:120}
];

const spiritStats={
불:{damage:7,range:130,cooldown:42,color:"#ff6633"},
물:{damage:3,range:200,cooldown:20,color:"#33aaff"},
바람:{damage:4,range:240,cooldown:15,color:"#88ffcc"},
땅:{damage:11,range:100,cooldown:60,color:"#c29966"},
전기:{damage:5,range:160,cooldown:30,color:"#ffee55"},
고대:{damage:50,range:320,cooldown:8,color:"#ff00ff"}
};

const enemyTypes=[
{color:"#ff3355",hp:12,speed:0.8,size:11},
{color:"#ffaa33",hp:28,speed:1.1,size:10},
{color:"#9933ff",hp:70,speed:0.9,size:15},
{color:"#00ff99",hp:140,speed:1.4,size:14},
{color:"#ff0000",hp:300,speed:1.1,size:22},
];

let spirits=[];
let enemies=[];
let projectiles=[];
let effects=[];

class Spirit{

constructor(element,tier,x,y){

const stat=spiritStats[element];

this.element=element;
this.tier=tier;
this.damage=Math.floor(stat.damage*tier);
this.range=stat.range+tier*15;
this.attackSpeed=Math.max(10,stat.cooldown-tier*2);
this.cooldown=0;

this.x=x;
this.y=y;
}

update(){

if(this.cooldown>0){
this.cooldown-=gameSpeed;
return;
}

let target=null;
let closest=99999;

enemies.forEach(enemy=>{

const d=Math.hypot(
enemy.x-this.x,
enemy.y-this.y
);

if(d<this.range && d<closest){
closest=d;
target=enemy;
}

});

if(target){

projectiles.push(
new Projectile(
this.x,
this.y,
target,
this.damage,
this.element
)
);

this.cooldown=this.attackSpeed;

}

}

draw(){

if(selectedSpirit===this){

ctx.globalAlpha=0.12;

ctx.beginPath();

ctx.arc(
this.x,
this.y,
this.range,
0,
Math.PI*2
);

ctx.fillStyle=
spiritStats[this.element].color;

ctx.fill();

ctx.globalAlpha=1;

}

const size = 30 + this.tier * 4;

const img = spiritImages[this.element];

// =====================
// 티어 이펙트
// =====================

const time = Date.now() * 0.002;


// ===== TIER 2 =====
// 은은한 오라

if(this.tier >= 2){

ctx.globalAlpha = 0.12;

ctx.beginPath();

ctx.arc(
this.x,
this.y,
size * 0.8,
0,
Math.PI * 2
);

ctx.fillStyle =
spiritStats[this.element].color;

ctx.fill();

ctx.globalAlpha = 1;

}


// ===== TIER 3 =====
// 강한 후광

if(this.tier >= 3){

ctx.shadowBlur = 25;

ctx.shadowColor =
spiritStats[this.element].color;

ctx.beginPath();

ctx.arc(
this.x,
this.y,
size * 0.6,
0,
Math.PI * 2
);

ctx.fillStyle =
spiritStats[this.element].color;

ctx.fill();

ctx.shadowBlur = 0;

}


// ===== TIER 4 =====
// 맥동 파동

if(this.tier >= 4){

const pulse =
Math.sin(time * 3) * 8;

ctx.globalAlpha = 0.15;

ctx.beginPath();

ctx.arc(
this.x,
this.y,
size + pulse,
0,
Math.PI * 2
);

ctx.strokeStyle =
spiritStats[this.element].color;

ctx.lineWidth = 4;

ctx.stroke();

ctx.globalAlpha = 1;

}


// ===== TIER 5 =====
// 회전 마법진

if(this.tier >= 5){

ctx.save();

ctx.translate(this.x,this.y);

ctx.rotate(time);

ctx.strokeStyle =
spiritStats[this.element].color;

ctx.lineWidth = 3;

for(let i=0;i<6;i++){

ctx.rotate(Math.PI/3);

ctx.beginPath();

ctx.moveTo(0,-size);

ctx.lineTo(0,-size-12);

ctx.stroke();

}

ctx.beginPath();

ctx.arc(
0,
0,
size * 0.9,
0,
Math.PI * 2
);

ctx.stroke();

ctx.restore();

}


// ===== TIER 6 =====
// 떠다니는 오브

if(this.tier >= 6){

for(let i=0;i<3;i++){

const angle =
time + i * 2;

const ox =
Math.cos(angle) * (size+10);

const oy =
Math.sin(angle) * (size+10);

ctx.beginPath();

ctx.arc(
this.x + ox,
this.y + oy,
4,
0,
Math.PI * 2
);

ctx.fillStyle =
spiritStats[this.element].color;

ctx.fill();

}

}


// ===== TIER 7 =====
// 에너지 폭풍

if(this.tier >= 7){

for(let i=0;i<12;i++){

const angle =
(i/12)*Math.PI*2 + time*2;

const dist =
size + Math.sin(time*5+i)*8;

const x =
this.x + Math.cos(angle)*dist;

const y =
this.y + Math.sin(angle)*dist;

ctx.globalAlpha = 0.5;

ctx.beginPath();

ctx.arc(x,y,3,0,Math.PI*2);

ctx.fillStyle =
spiritStats[this.element].color;

ctx.fill();

}

ctx.globalAlpha = 1;

}


// ===== TIER 8 =====
// 신화급 오라

if(this.tier >= 8){

const rainbow = [
"#ff0000",
"#ffaa00",
"#ffff00",
"#00ff99",
"#00ccff",
"#aa66ff"
];

for(let i=0;i<rainbow.length;i++){

ctx.globalAlpha = 0.12;

ctx.beginPath();

ctx.arc(
this.x,
this.y,
size + i*10 + Math.sin(time*3+i)*4,
0,
Math.PI * 2
);

ctx.strokeStyle = rainbow[i];

ctx.lineWidth = 3;

ctx.stroke();

}

ctx.globalAlpha = 1;

}
if(img && img.complete){

ctx.drawImage(
img,
this.x - size/2,
this.y - size/2,
size,
size
);

}else{

ctx.fillStyle=
spiritStats[this.element].color;

ctx.beginPath();

ctx.arc(
this.x,
this.y,
12+this.tier*2,
0,
Math.PI*2
);

ctx.fill();

}

const tierNames = {
1:"C",
2:"B",
3:"A",
4:"S",
5:"SS",
6:"SSR",
7:"UR",
8:"Ancient"
};

const tierColors = {
1:"#cccccc",
2:"#66ccff",
3:"#33ff99",
4:"#bb66ff",
5:"#ff9933",
6:"#ff4444",
7:"#ffee55",
8:"#ff00ff"
};

const tierSizes = {
1:14,
2:15,
3:16,
4:18,
5:20,
6:22,
7:24,
8:28
};

ctx.save();

ctx.textAlign = "center";

ctx.textBaseline = "middle";

ctx.fillStyle =
tierColors[this.tier] || "#ffffff";

ctx.font =
`bold ${tierSizes[this.tier]}px sans-serif`;

ctx.shadowBlur = 12;

ctx.shadowColor =
tierColors[this.tier];

ctx.fillText(

tierNames[this.tier],

this.x,
this.y - size/2 - 18

);

ctx.restore();

}
}

class Enemy{

constructor(type,boss=false){

this.x=path[0].x;
this.y=path[0].y;

this.pathIndex=0;

this.maxHp=boss ?
type.hp*7 :
type.hp+player.wave*10;

this.hp=this.maxHp;

this.speed=boss ?
type.speed*0.7 :
type.speed+player.wave*0.02;

this.reward=boss?50:2;

this.size=boss ?
type.size*2 :
type.size;

this.color=boss?"#fff":type.color;

this.boss=boss;

}

update(){

const next=path[this.pathIndex+1];

if(!next){

player.coreHp-=this.boss?30:10;
this.dead=true;
updateUI();

return;
}

const dx=next.x-this.x;
const dy=next.y-this.y;

const dist=Math.hypot(dx,dy);

if(dist<4){
this.pathIndex++;
}else{
this.x+=dx/dist*this.speed*gameSpeed;
this.y+=dy/dist*this.speed*gameSpeed;
}

}

draw(){

ctx.fillStyle=this.color;

// ===== 몬스터 오라 =====

const pulse =
Math.sin(Date.now()*0.01)*4;

ctx.globalAlpha = 0.15;

ctx.beginPath();

ctx.arc(
this.x,
this.y,
this.size + 8 + pulse,
0,
Math.PI*2
);

ctx.fillStyle = this.color;

ctx.fill();

ctx.globalAlpha = 1;

ctx.beginPath();
ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="#111";

ctx.fillRect(
this.x-25,
this.y-30,
50,
6
);

// ===== 보스 전용 효과 =====

if(this.boss){

ctx.save();

ctx.translate(this.x,this.y);

ctx.rotate(Date.now()*0.0015);

ctx.strokeStyle = "#ff2222";

ctx.lineWidth = 4;

ctx.shadowBlur = 20;

ctx.shadowColor = "#ff0000";

ctx.beginPath();

ctx.arc(
0,
0,
this.size + 14,
0,
Math.PI*2
);

ctx.stroke();

ctx.restore();

ctx.shadowBlur = 0;

}

ctx.fillStyle=
this.boss ? "#ffee00" : "#55ff55";

ctx.fillRect(
this.x-25,
this.y-30,
(this.hp/this.maxHp)*50,
6
);

}

}

class Projectile{

constructor(x,y,target,damage,element){

this.x=x;
this.y=y;
this.target=target;
this.damage=damage;
this.element=element;
this.speed=7;
this.dead=false;

}

update(){

if(this.target.dead){
this.dead=true;
return;
}

const dx=this.target.x-this.x;
const dy=this.target.y-this.y;

const dist=Math.hypot(dx,dy);

if(dist<8){

this.hit();
this.dead=true;
return;

}

this.x+=dx/dist*this.speed*gameSpeed;
this.y+=dy/dist*this.speed*gameSpeed;

}

hit(){

this.target.hp-=this.damage;

effects.push({
x:this.target.x,
y:this.target.y,
element:this.element,
life:30
});

if(this.target.hp<=0 && !this.target.dead){

this.target.dead=true;

player.gold+=this.target.reward;
player.kills++;

updateUI();

}

}

draw(){

ctx.strokeStyle=
spiritStats[this.element].color;

ctx.lineWidth=3;

ctx.beginPath();

ctx.moveTo(this.x,this.y);
ctx.lineTo(this.target.x,this.target.y);

ctx.stroke();

}

}

function drawEffects(){

effects.forEach(e=>{

ctx.globalAlpha=e.life/30;

ctx.fillStyle=
spiritStats[e.element].color;

ctx.beginPath();
ctx.arc(e.x,e.y,40-e.life,0,Math.PI*2);
ctx.fill();

ctx.globalAlpha=1;

e.life--;

});

effects=effects.filter(e=>e.life>0);

}

function startDefenseMode(){

if(document.documentElement.requestFullscreen){

document.documentElement.requestFullscreen();

}

if(screen.orientation && screen.orientation.lock){

screen.orientation.lock("landscape");

}

if(!player.name){

changeNickname();

if(!player.name)return;

}

currentMode=GAME_STATE.DEFENSE;

menu.style.display="none";
gameUI.style.display="flex";

spawnLoop=setInterval(()=>{
spawnEnemy();
},1700);

waveLoop=setInterval(()=>{

player.wave++;

bossSpawned = false;

showNotice(
player.wave%10===0 ?
`⚠ BOSS WAVE ${player.wave} ⚠` :
`✦ WAVE ${player.wave} ✦`
);

updateUI();

},25000);

}
function exitDefense(){

if(currentMode===GAME_STATE.DEFENSE){
saveRanking();
}

clearInterval(spawnLoop);
clearInterval(waveLoop);

spirits=[];
enemies=[];
projectiles=[];
effects=[];

selectedSpirit=null;
movingSpirit=null;

player.gold=30;
player.wave=1;
player.kills=0;
player.coreHp=100;

popup.style.display="none";

menu.style.display="flex";
gameUI.style.display="none";

currentMode=GAME_STATE.MENU;

updateUI();

}

function showGameOver(){

currentMode=GAME_STATE.GAMEOVER;

clearInterval(spawnLoop);
clearInterval(waveLoop);

saveRanking();

gameOverScreen.style.display="flex";

}

function showNotice(text){

notice.innerText=text;

notice.style.animation="none";
notice.offsetHeight;
notice.style.animation="wavePulse 1s ease";

notice.style.opacity=1;

setTimeout(()=>{
notice.style.opacity=0;
},1000);

}

function setGameSpeed(speed){

gameSpeed=speed;

showNotice(`${speed}배속`);

}

function randomElement(){

const arr=["불","물","바람","땅","전기"];

return arr[
Math.floor(Math.random()*arr.length)
];

}

function summonSpirit(tier){

if(spirits.length >= 15){

showNotice("정령 수 제한 도달");

return;

}

const costs={
1:10,
2:40,
3:100
};

if(player.gold<costs[tier]){
showNotice("골드 부족");
return;
}

const used=
spirits.map(s=>`${s.x}_${s.y}`);

const available=
summonSpots.filter(pos=>{

return !used.includes(
`${pos.x}_${pos.y}`
);

});

if(available.length<=0)return;

player.gold-=costs[tier];

const pos=
available[
Math.floor(Math.random()*available.length)
];

spirits.push(
new Spirit(
randomElement(),
tier,
pos.x,
pos.y
)
);

checkCombine();

updateUI();

}

function startMoveSpirit(){

if(!selectedSpirit)return;

if(player.gold<15){

showNotice("골드 부족");
return;

}

movingSpirit=selectedSpirit;

popup.style.display="none";

showNotice("교체할 정령 클릭");

}

function spawnEnemy(){

const bossWave =
player.wave % 10 === 0;

const tier = Math.min(
Math.floor(player.wave/2),
enemyTypes.length-1
);


// ===== 보스 웨이브 =====

if(bossWave){

if(bossSpawned) return;

bossSpawned = true;

enemies.push(
new Enemy(
enemyTypes[tier],
true
)
);

return;

}


// ===== 일반 웨이브 =====

enemies.push(
new Enemy(
enemyTypes[tier],
false
)
);

}function updateGame(){

enemies.forEach(e=>e.update());
spirits.forEach(s=>s.update());
projectiles.forEach(p=>p.update());

enemies=enemies.filter(e=>!e.dead);
projectiles=projectiles.filter(p=>!p.dead);

}

function drawPath(){

ctx.strokeStyle="rgba(80,80,80,0.55)";

ctx.lineWidth=42;

ctx.shadowBlur = 20;
ctx.shadowColor = "#33ddee";

ctx.beginPath();

ctx.moveTo(path[0].x,path[0].y);

path.forEach(p=>{
ctx.lineTo(p.x,p.y);
});

ctx.stroke();

ctx.shadowBlur = 0;

}

function drawCore(){

ctx.fillStyle="#66e0ff";

ctx.beginPath();
ctx.arc(1050,420,20,0,Math.PI*2);
ctx.fill();

}

function draw(){

ctx.clearRect(0,0,1100,620);


// 배경 이미지

if(bgImage.complete){

ctx.drawImage(
bgImage,
0,
0,
1100,
620
);

}


//drawPath();
drawCore();

spirits.forEach(s=>s.draw());
enemies.forEach(e=>e.draw());
projectiles.forEach(p=>p.draw());

drawEffects();

}

function updateUI(){

goldTxt.innerText=player.gold;
waveTxt.innerText=player.wave;
killTxt.innerText=player.kills;

coreBar.style.width=
player.coreHp+"%";

hpTxt.innerText=
player.coreHp+"/100";

spiritList.innerHTML="";

const tierColors = {
1:"#cccccc",
2:"#66ccff",
3:"#33ff99",
4:"#bb66ff",
5:"#ff9933",
6:"#ff4444",
7:"#ffee55",
8:"#ff00ff"
};

const tierNames = {
1:"C",
2:"B",
3:"A",
4:"S",
5:"SS",
6:"SSR",
7:"UR",
8:"Ancient"
};


// 높은 등급 순 정렬

const sortedSpirits = [...spirits].sort((a,b)=>{

if(b.tier === a.tier){

return b.damage - a.damage;

}

return b.tier - a.tier;

});


sortedSpirits.forEach(s=>{

const div=document.createElement("div");

div.className="spiritCard";

div.style.padding="6px 10px";

div.style.marginBottom="6px";

div.style.borderRadius="10px";

div.style.border=
`1px solid ${tierColors[s.tier]}`;

div.style.background=
"linear-gradient(90deg,#111c,#1a1f33)";

div.style.boxShadow=
`0 0 8px ${tierColors[s.tier]}44`;

div.innerHTML=`

<div style="
display:flex;
justify-content:space-between;
align-items:center;
">

<div>

<div style="
font-size:15px;
font-weight:bold;
color:${tierColors[s.tier]};
text-shadow:0 0 6px ${tierColors[s.tier]};
line-height:1.1;
">

${s.element} 정령

</div>

<div style="
font-size:11px;
opacity:.75;
margin-top:2px;
">

${tierNames[s.tier]}

</div>

</div>

<div style="
font-size:12px;
text-align:right;
line-height:1.5;
">

⚔ ${Math.floor(s.damage)}<br>
🎯 ${s.range}

</div>

</div>

`;

spiritList.appendChild(div);

});

}

canvas.addEventListener("click",(e)=>{

const rect=canvas.getBoundingClientRect();

const mx=(e.clientX-rect.left)/0.9;
const my=(e.clientY-rect.top)/0.9;

let clicked=null;

spirits.forEach(s=>{

const d=Math.hypot(
mx-s.x,
my-s.y
);

if(d<20){
clicked=s;
}

});

if(movingSpirit && clicked && clicked!==movingSpirit){

const tx=movingSpirit.x;
const ty=movingSpirit.y;

movingSpirit.x=clicked.x;
movingSpirit.y=clicked.y;

clicked.x=tx;
clicked.y=ty;

player.gold-=15;

movingSpirit=null;

showNotice("위치 교체 완료");

updateUI();

return;
}

selectedSpirit=clicked;

if(clicked){

popup.style.display="block";

popup.style.left=e.clientX+"px";
popup.style.top=e.clientY+"px";

popupInfo.innerHTML=`
${clicked.element} 정령<br>
등급 ${clicked.tier}
`;

}else{

popup.style.display="none";

}

});

function sellSpirit(){

if(!selectedSpirit)return;

player.gold+=selectedSpirit.tier*5;

spirits=
spirits.filter(
s=>s!==selectedSpirit
);

selectedSpirit=null;

popup.style.display="none";

updateUI();

}

gameOverScreen.addEventListener("click",()=>{

gameOverScreen.style.display="none";

exitDefense();

});

function gameLoop(){

if(currentMode===GAME_STATE.DEFENSE){

updateGame();
draw();

if(player.coreHp<=0){

showGameOver();

}

}

requestAnimationFrame(gameLoop);

}

function saveRanking(){

const score={

name:player.name,
wave:player.wave,
kills:player.kills,
date:new Date().toLocaleDateString()

};

rankings.push(score);

rankings.sort((a,b)=>{

if(b.wave===a.wave){
return b.kills-a.kills;
}

return b.wave-a.wave;

});

rankings=rankings.slice(0,3);

localStorage.setItem(
"EA_RANKING",
JSON.stringify(rankings)
);

renderRanking();

}
function renderRanking(){

const rankingList=
document.getElementById("rankingList");

if(!rankingList)return;

if(rankings.length<=0){

rankingList.innerHTML=
"<div>기록 없음</div>";

return;

}

rankingList.innerHTML="";

rankings.forEach((r,index)=>{

const div=document.createElement("div");

div.style=
`
background:#111c;
padding:10px;
margin-bottom:8px;
border-radius:10px;
font-size:14px;
`;

div.innerHTML=
`
${index+1}위 🏆 ${r.name}<br>
웨이브 : ${r.wave}<br>
처치 : ${r.kills}
`;

rankingList.appendChild(div);

});

}

function openRanking(){

document.getElementById(
"rankingPopup"
).style.display="block";

renderRanking();

}

function closeRanking(){

document.getElementById(
"rankingPopup"
).style.display="none";

}

function changeNickname(){

const name=prompt(
"닉네임 입력",
player.name || "Player"
);

if(name===null)return;

player.name=
name.trim() || "Player";

localStorage.setItem(
"EA_NAME",
player.name
);

showNotice(
`닉네임 : ${player.name}`
);

}

renderRanking();

updateUI();

gameLoop();